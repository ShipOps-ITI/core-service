// Run separately with: npm run tracking:vesselapi
// Required environment variable: VESSELAPI_KEY

require("dotenv").config();

const prisma = require("../../database/prisma");
const { processAisPosition } = require("./ais-position.processor");
const { recordPollStarted, recordPollSuccess, recordPollFailure } = require("./tracking-health.service");

const VESSELAPI_URL = "https://api.vesselapi.com/v1/vessels/positions";
const DEFAULT_POLL_INTERVAL_MS = 5 * 60 * 1000;
const DEFAULT_QUOTA_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_MAX_VESSELS_PER_REQUEST = 10;
let nextMmsiOffset = 0;

const getPollInterval = () => {
  const configuredInterval = Number(process.env.VESSELAPI_POLL_INTERVAL_MS);

  if (!Number.isFinite(configuredInterval) || configuredInterval < 60 * 1000) {
    return DEFAULT_POLL_INTERVAL_MS;
  }

  return configuredInterval;
};

const getQuotaCooldown = () => {
  const configuredCooldown = Number(process.env.VESSELAPI_QUOTA_COOLDOWN_MS);
  return Number.isFinite(configuredCooldown) && configuredCooldown >= 60 * 60 * 1000
    ? configuredCooldown
    : DEFAULT_QUOTA_COOLDOWN_MS;
};

const getMaxVesselsPerRequest = () => {
  const configuredLimit = Number(process.env.VESSELAPI_MAX_VESSELS_PER_REQUEST);

  if (!Number.isInteger(configuredLimit) || configuredLimit < 1) {
    return DEFAULT_MAX_VESSELS_PER_REQUEST;
  }

  return Math.min(configuredLimit, 50);
};

const selectMmsiBatch = (mmsiNumbers, batchSize, offset = 0) => {
  if (mmsiNumbers.length === 0) return { batch: [], nextOffset: 0 };

  const normalizedOffset = offset % mmsiNumbers.length;
  const size = Math.min(batchSize, mmsiNumbers.length);
  const batch = Array.from(
    { length: size },
    (_, index) => mmsiNumbers[(normalizedOffset + index) % mmsiNumbers.length],
  );

  return {
    batch,
    nextOffset: (normalizedOffset + size) % mmsiNumbers.length,
  };
};

const getTrackedMmsis = async () => {
  const ships = await prisma.ship.findMany({
    where: { mmsiNumber: { not: null } },
    select: { mmsiNumber: true },
    orderBy: { id: "asc" },
  });

  const allMmsis = [...new Set(ships.map((ship) => ship.mmsiNumber).filter(Boolean))];
  const selection = selectMmsiBatch(
    allMmsis,
    getMaxVesselsPerRequest(),
    nextMmsiOffset,
  );
  nextMmsiOffset = selection.nextOffset;
  return selection.batch;
};

const getLatestPositionsByMmsi = (positions) => {
  const latestByMmsi = new Map();

  for (const position of positions) {
    const mmsi = String(position?.mmsi || "");
    if (!mmsi) continue;

    const current = latestByMmsi.get(mmsi);
    const parsedPositionTime = new Date(position.timestamp || 0).getTime();
    const parsedCurrentTime = current
      ? new Date(current.timestamp || 0).getTime()
      : Number.NEGATIVE_INFINITY;
    const positionTime = Number.isFinite(parsedPositionTime)
      ? parsedPositionTime
      : Number.NEGATIVE_INFINITY;
    const currentTime = Number.isFinite(parsedCurrentTime)
      ? parsedCurrentTime
      : Number.NEGATIVE_INFINITY;

    if (!current || positionTime >= currentTime) {
      latestByMmsi.set(mmsi, position);
    }
  }

  return [...latestByMmsi.values()];
};

const fetchPositions = async (mmsiNumbers) => {
  const url = new URL(VESSELAPI_URL);
  url.searchParams.set("filter.ids", mmsiNumbers.join(","));
  url.searchParams.set("filter.idType", "mmsi");
  // A position request only needs one result per tracked vessel. Avoid asking
  // the provider for the historical default of up to 50 records each poll.
  url.searchParams.set("pagination.limit", String(Math.min(mmsiNumbers.length, getMaxVesselsPerRequest())));

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
    const error = new Error(`VesselAPI request failed (${response.status}): ${message}`);
    error.status = response.status;
    error.quotaExceeded = response.status === 429 && /monthly quota|quota exceeded/i.test(message);
    throw error;
  }

  return getLatestPositionsByMmsi(
    Array.isArray(payload?.vesselPositions) ? payload.vesselPositions : [],
  );
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
      updatedCount += result.matchedCount;
      console.log(
        `Updated ${result.matchedCount} ShipOps ship record(s) for MMSI ${position.mmsi}: ` +
        `${result.ship.currentLatitude}, ${result.ship.currentLongitude}`,
      );
    }
  }

  return updatedCount;
};

const pollVesselApi = async () => {
  const mmsiNumbers = await getTrackedMmsis();
  await recordPollStarted(mmsiNumbers.length);

  if (mmsiNumbers.length === 0) {
    console.warn("No ships with an MMSI number were found. Add an MMSI before tracking.");
    await recordPollSuccess({ trackedShipCount: 0, returnedPositionCount: 0, updatedShipCount: 0 });
    return;
  }

  const positions = await fetchPositions(mmsiNumbers);
  const updatedCount = await updatePositions(positions);
  await recordPollSuccess({
    trackedShipCount: mmsiNumbers.length,
    returnedPositionCount: positions.length,
    updatedShipCount: updatedCount,
  });
  console.log(`VesselAPI returned ${positions.length} position(s); updated ${updatedCount} ShipOps ship(s).`);
};

const startVesselApiWorker = async () => {
  if (!process.env.VESSELAPI_KEY) {
    throw new Error("VESSELAPI_KEY is missing from .env");
  }

  const pollInterval = getPollInterval();
  const quotaCooldown = getQuotaCooldown();
  let polling = false;
  let timer;

  const scheduleNextPoll = (delay) => {
    clearTimeout(timer);
    timer = setTimeout(runPoll, delay);
  };

  const runPoll = async () => {
    if (polling) return scheduleNextPoll(pollInterval);

    polling = true;
    let nextDelay = pollInterval;
    try {
      await pollVesselApi();
    } catch (error) {
      console.error(`VesselAPI tracking error: ${error.message}`);
      if (error.quotaExceeded) {
        nextDelay = quotaCooldown;
        console.warn(`VesselAPI monthly quota is exhausted. Keeping last-known positions and retrying in ${Math.round(quotaCooldown / 3_600_000)} hour(s).`);
      } else if (error.status === 429) {
        nextDelay = Math.max(pollInterval, 60 * 60 * 1000);
        console.warn("VesselAPI rate limit reached. Retrying in one hour.");
      }
      await recordPollFailure({
        error,
        quotaExceeded: Boolean(error.quotaExceeded),
        retryingAt: new Date(Date.now() + nextDelay),
      }).catch((healthError) => console.error(`Could not store tracking health: ${healthError.message}`));
    } finally {
      polling = false;
      scheduleNextPoll(nextDelay);
    }
  };

  console.log(`VesselAPI worker started. Polling every ${Math.round(pollInterval / 1000)} seconds.`);
  await runPoll();
  return () => clearTimeout(timer);
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
  getLatestPositionsByMmsi,
  getPollInterval,
  getQuotaCooldown,
  getTrackedMmsis,
  pollVesselApi,
  selectMmsiBatch,
  startVesselApiWorker,
};
