const prisma = require("../../database/prisma");

const HEALTH_ID = 1;

const recordPollStarted = (trackedShipCount) => prisma.trackingWorkerHealth.upsert({
  where: { id: HEALTH_ID },
  create: { id: HEALTH_ID, lastPollStartedAt: new Date(), totalPolls: 1, trackedShipCount },
  update: { lastPollStartedAt: new Date(), totalPolls: { increment: 1 }, trackedShipCount },
});

const recordPollSuccess = ({ trackedShipCount, returnedPositionCount, updatedShipCount }) => prisma.trackingWorkerHealth.upsert({
  where: { id: HEALTH_ID },
  create: {
    id: HEALTH_ID,
    lastSuccessfulApiCallAt: new Date(),
    lastPositionUpdateAt: updatedShipCount ? new Date() : null,
    successfulPolls: 1,
    trackedShipCount,
    returnedPositionCount,
    updatedShipCount,
  },
  update: {
    lastSuccessfulApiCallAt: new Date(),
    ...(updatedShipCount ? { lastPositionUpdateAt: new Date() } : {}),
    lastError: null,
    quotaCooldownUntil: null,
    successfulPolls: { increment: 1 },
    trackedShipCount,
    returnedPositionCount,
    updatedShipCount,
  },
});

const recordPollFailure = ({ error, retryingAt = null, quotaExceeded = false }) => prisma.trackingWorkerHealth.upsert({
  where: { id: HEALTH_ID },
  create: {
    id: HEALTH_ID,
    lastFailureAt: new Date(),
    lastError: error.message.slice(0, 500),
    quotaCooldownUntil: retryingAt,
    failedPolls: 1,
    retryCount: 1,
    quotaFailureCount: quotaExceeded ? 1 : 0,
  },
  update: {
    lastFailureAt: new Date(),
    lastError: error.message.slice(0, 500),
    quotaCooldownUntil: retryingAt,
    failedPolls: { increment: 1 },
    retryCount: { increment: 1 },
    ...(quotaExceeded ? { quotaFailureCount: { increment: 1 } } : {}),
  },
});

const getHealth = () => prisma.trackingWorkerHealth.findUnique({ where: { id: HEALTH_ID } });

module.exports = { recordPollStarted, recordPollSuccess, recordPollFailure, getHealth };
