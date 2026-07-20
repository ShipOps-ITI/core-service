-- Core data reset explicitly requested: recreate the Core tables with integer IDs.
DROP TABLE "ships";
DROP TABLE "fleets";
DROP TABLE "companies";

CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "fleets" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "managedByUserId" INTEGER NOT NULL,
    "createdByUserId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fleets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ships" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "fleetId" INTEGER,
    "name" TEXT NOT NULL,
    "imoNumber" TEXT,
    "mmsiNumber" TEXT,
    "flag" TEXT NOT NULL,
    "capacityTonnage" DOUBLE PRECISION NOT NULL,
    "shipType" TEXT,
    "availabilityState" "ShipState" NOT NULL DEFAULT 'ACTIVE',
    "currentLatitude" DOUBLE PRECISION,
    "currentLongitude" DOUBLE PRECISION,
    "lengthMeters" DOUBLE PRECISION,
    "widthMeters" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "companies_name_key" ON "companies"("name");
CREATE INDEX "fleets_companyId_idx" ON "fleets"("companyId");
CREATE UNIQUE INDEX "fleets_companyId_name_key" ON "fleets"("companyId", "name");
CREATE UNIQUE INDEX "ships_imoNumber_key" ON "ships"("imoNumber");
CREATE UNIQUE INDEX "ships_mmsiNumber_key" ON "ships"("mmsiNumber");
CREATE INDEX "ships_companyId_idx" ON "ships"("companyId");
CREATE INDEX "ships_fleetId_idx" ON "ships"("fleetId");
CREATE INDEX "ships_availabilityState_idx" ON "ships"("availabilityState");

ALTER TABLE "fleets" ADD CONSTRAINT "fleets_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ships" ADD CONSTRAINT "ships_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ships" ADD CONSTRAINT "ships_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "fleets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
