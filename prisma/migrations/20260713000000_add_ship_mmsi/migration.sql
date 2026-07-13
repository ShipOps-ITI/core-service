-- Add an optional MMSI identifier used to match ships to AIS location updates.
ALTER TABLE "ships" ADD COLUMN "mmsiNumber" TEXT;

-- PostgreSQL permits multiple NULL values, so existing ships remain valid.
CREATE UNIQUE INDEX "ships_mmsiNumber_key" ON "ships"("mmsiNumber");
