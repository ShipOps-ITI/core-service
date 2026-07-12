-- CreateEnum
CREATE TYPE "ShipState" AS ENUM ('ACTIVE', 'MAINTENANCE', 'DOCKED', 'AT_SEA');

-- CreateTable
CREATE TABLE "companies" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fleets" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "managedByUserId" UUID NOT NULL,
    "createdByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fleets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ships" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "fleetId" UUID,
    "name" TEXT NOT NULL,
    "imoNumber" TEXT,
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

-- CreateIndex
CREATE UNIQUE INDEX "companies_name_key" ON "companies"("name");

-- CreateIndex
CREATE INDEX "fleets_companyId_idx" ON "fleets"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "fleets_companyId_name_key" ON "fleets"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ships_imoNumber_key" ON "ships"("imoNumber");

-- CreateIndex
CREATE INDEX "ships_companyId_idx" ON "ships"("companyId");

-- CreateIndex
CREATE INDEX "ships_fleetId_idx" ON "ships"("fleetId");

-- CreateIndex
CREATE INDEX "ships_availabilityState_idx" ON "ships"("availabilityState");

-- AddForeignKey
ALTER TABLE "fleets" ADD CONSTRAINT "fleets_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ships" ADD CONSTRAINT "ships_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ships" ADD CONSTRAINT "ships_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "fleets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
