require("dotenv").config();

const prisma = require("../src/database/prisma");

// This maintained CSV is derived from the official UNECE UN/LOCODE release.
// Position 1 in the Function field is "1" for a maritime port.
const CODE_LIST_URL = "https://raw.githubusercontent.com/datasets/un-locode/main/data/code-list.csv";
const COUNTRY_CODES_URL = "https://raw.githubusercontent.com/datasets/un-locode/main/data/country-codes.csv";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  const [headers, ...dataRows] = rows;
  return dataRows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ""])));
}

function parseCoordinate(coordinates) {
  const match = coordinates.trim().match(/^(\d{2})(\d{2})([NS])\s+(\d{3})(\d{2})([EW])$/);
  if (!match) return null;

  const latitude = Number(match[1]) + Number(match[2]) / 60;
  const longitude = Number(match[4]) + Number(match[5]) / 60;

  return {
    latitude: match[3] === "S" ? -latitude : latitude,
    longitude: match[6] === "W" ? -longitude : longitude,
  };
}

async function downloadCsv(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed (${response.status}) for ${url}`);
  return parseCsv(await response.text());
}

async function run() {
  console.log("Downloading UN/LOCODE reference data...");
  const [locations, countries] = await Promise.all([
    downloadCsv(CODE_LIST_URL),
    downloadCsv(COUNTRY_CODES_URL),
  ]);

  const countryNames = new Map(countries.map((country) => [country.CountryCode, country.CountryName]));
  const ports = locations
    .filter((location) => location.Function?.startsWith("1") && location.Change !== "X")
    .map((location) => {
      const coordinate = parseCoordinate(location.Coordinates);
      if (!coordinate || !location.Country || !location.Location || !location.Name) return null;

      return {
        name: location.Name.trim(),
        country: countryNames.get(location.Country) || location.Country,
        countryCode: location.Country,
        unLocode: `${location.Country}${location.Location}`,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        source: "UN_LOCODE",
        isActive: true,
      };
    })
    .filter(Boolean);

  console.log(`Importing ${ports.length} maritime ports...`);

  let created = 0;
  let updated = 0;
  for (const port of ports) {
    const existing = await prisma.port.findUnique({ where: { unLocode: port.unLocode }, select: { id: true } });
    await prisma.port.upsert({
      where: { unLocode: port.unLocode },
      create: port,
      update: {
        name: port.name,
        country: port.country,
        countryCode: port.countryCode,
        latitude: port.latitude,
        longitude: port.longitude,
        source: port.source,
        isActive: true,
      },
    });
    if (existing) updated += 1;
    else created += 1;
  }

  console.log(`UN/LOCODE import complete. Created: ${created}. Updated: ${updated}.`);
}

run()
  .catch((error) => {
    console.error("UN/LOCODE import failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
