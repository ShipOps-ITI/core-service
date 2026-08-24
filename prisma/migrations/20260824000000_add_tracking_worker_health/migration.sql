CREATE TABLE "tracking_worker_health" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "lastPollStartedAt" TIMESTAMP(3),
    "lastSuccessfulApiCallAt" TIMESTAMP(3),
    "lastPositionUpdateAt" TIMESTAMP(3),
    "lastFailureAt" TIMESTAMP(3),
    "lastError" TEXT,
    "quotaCooldownUntil" TIMESTAMP(3),
    "totalPolls" INTEGER NOT NULL DEFAULT 0,
    "successfulPolls" INTEGER NOT NULL DEFAULT 0,
    "failedPolls" INTEGER NOT NULL DEFAULT 0,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "quotaFailureCount" INTEGER NOT NULL DEFAULT 0,
    "trackedShipCount" INTEGER NOT NULL DEFAULT 0,
    "returnedPositionCount" INTEGER NOT NULL DEFAULT 0,
    "updatedShipCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tracking_worker_health_pkey" PRIMARY KEY ("id")
);
