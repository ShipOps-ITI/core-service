-- CreateTable
CREATE TABLE "ports" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ports_country_idx" ON "ports"("country");

-- CreateIndex
CREATE UNIQUE INDEX "ports_name_country_key" ON "ports"("name", "country");
