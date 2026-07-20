// Run separately with: npm run tracking:vesselapi
// Required environment variable: VESSELAPI_KEY

require("dotenv").config();

const prisma = require("../../database/prisma");
const { processAisPosition } = require("./ais-position.processor");

const VESSELAPI_URL = "https://api.vesselapi.com/v1/vessels/positions";
const DEFAULT_POLL_INTERVAL_MS = 5 * 60 * 1000;
const MAX_VESSELS_PER_REQUEST = 50;

const getPollInterval = () => {
  const configuredInterval = Number(process.env.VESSELAPI_POLL_INTERVAL_MS);

  if (!Number.isFinite(configuredInterval) || configuredInterval < 60 * 1000) {
    return DEFAULT_POLL_INTERVAL_MS;
  }

  return configuredInterval;
};

const getTrackedMmsis = async () => {
  const ships = await prisma.ship.findMany({
    where: { mmsiNumber: { not: null } },
    select: { mmsiNumber: true },
    take: MAX_VESSELS_PER_REQUEST,
  });

  return ships.map((ship) => ship.mmsiNumber);
};

const fetchPositions = async (mmsiNumbers) => {
  const url = new URL(VESSELAPI_URL);
  url.searchParams.set("filter.ids", mmsiNumbers.join(","));
  url.searchParams.set("filter.idType", "mmsi");
  url.searchParams.set("pagination.limit", String(MAX_VESSELS_PER_REQUEST));

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.VESSELAPI_KEY}`,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(30 * 1000),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || response.statusText;
    throw new Error(`VesselAPI request failed (${response.status}): ${message}`);
  }

  return Array.isArray(payload?.vesselPositions) ? payload.vesselPositions : [];
};

const updatePositions = async (positions) => {
  let updatedCount = 0;

  for (const position of positions) {
    const result = await processAisPosition({
      mmsi: position.mmsi,
      latitude: position.latitude,
      longitude: position.longitude,
      reportedAt: position.timestamp,
    });

    if (result.matched) {
      updatedCount += 1;
      console.log(`Updated ${result.ship.name}: ${result.ship.currentLatitude}, ${result.ship.currentLongitude}`);
    }
  }

  return updatedCount;
};

const pollVesselApi = async () => {
  const mmsiNumbers = await getTrackedMmsis();

  if (mmsiNumbers.length === 0) {
    console.warn("No ships with an MMSI number were found. Add an MMSI before tracking.");
    return;
  }

  const positions = await fetchPositions(mmsiNumbers);
  const updatedCount = await updatePositions(positions);
  console.log(`VesselAPI returned ${positions.length} position(s); updated ${updatedCount} ShipOps ship(s).`);
};

const startVesselApiWorker = async () => {
  if (!process.env.VESSELAPI_KEY) {
    throw new Error("VESSELAPI_KEY is missing from .env");
  }

  const pollInterval = getPollInterval();
  let polling = false;

  const runPoll = async () => {
    if (polling) return;

    polling = true;
    try {
      await pollVesselApi();
    } catch (error) {
      console.error(`VesselAPI tracking error: ${error.message}`);
    } finally {
      polling = false;
    }
  };

  console.log(`VesselAPI worker started. Polling every ${Math.round(pollInterval / 1000)} seconds.`);
  await runPoll();

  const interval = setInterval(runPoll, pollInterval);

  return () => clearInterval(interval);
};

if (require.main === module) {
  if (process.argv.includes("--help")) {
    console.log("Usage: npm run tracking:vesselapi\nRequires VESSELAPI_KEY in .env.");
    process.exit(0);
  }

  startVesselApiWorker()
    .then((stopWorker) => {
      process.on("SIGINT", async () => {
        stopWorker();
        await prisma.$disconnect();
        process.exit(0);
      });
    })
    .catch(async (error) => {
      console.error(`VesselAPI worker could not start: ${error.message}`);
      await prisma.$disconnect();
      process.exit(1);
    });
}

module.exports = {
  fetchPositions,
  getPollInterval,
  getTrackedMmsis,
  pollVesselApi,
  startVesselApiWorker,
};
