-- CreateEnum
CREATE TYPE "Status" AS ENUM ('LOADING', 'SAILING', 'WAITING', 'DELAYED', 'ARRIVED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Document_Status" AS ENUM ('Uploaded', 'Pending', 'Approved', 'Rejected');

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ships" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imo_number" TEXT,
    "flag" TEXT NOT NULL,
    "capacity_tonnage" DOUBLE PRECISION NOT NULL,
    "ship_type" TEXT,
    "availability_state" TEXT NOT NULL,
    "current_latitude" DOUBLE PRECISION,
    "current_longitude" DOUBLE PRECISION,
    "length_meters" DOUBLE PRECISION,
    "width_meters" DOUBLE PRECISION,
    "company_id" TEXT NOT NULL,
    "fleet_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fleets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "managed_by_user_id" TEXT NOT NULL,
    "created_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fleets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ports" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "ports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voyages" (
    "id" TEXT NOT NULL,
    "ship_id" TEXT NOT NULL,
    "shipping_company_id" TEXT NOT NULL,
    "origin_port_id" TEXT NOT NULL,
    "destination_port_id" TEXT NOT NULL,
    "current_status" "Status" NOT NULL,
    "departure_time" TIMESTAMP(3) NOT NULL,
    "estimated_arrival" TIMESTAMP(3),
    "actual_arrival" TIMESTAMP(3),

    CONSTRAINT "voyages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voyage_status_history" (
    "id" TEXT NOT NULL,
    "voyage_id" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changed_by" TEXT NOT NULL,

    CONSTRAINT "voyage_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suez_canal_transits" (
    "id" TEXT NOT NULL,
    "voyage_id" TEXT NOT NULL,
    "entry_time" TIMESTAMP(3),
    "exit_time" TIMESTAMP(3),
    "status" TEXT NOT NULL,

    CONSTRAINT "suez_canal_transits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargo" (
    "id" TEXT NOT NULL,
    "voyage_id" TEXT NOT NULL,
    "cargo_owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weight" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "cargo_type" TEXT,
    "container_number" TEXT,
    "status" TEXT NOT NULL,

    CONSTRAINT "cargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargo_documents" (
    "id" TEXT NOT NULL,
    "cargo_id" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "status" "Document_Status" NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cargo_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ships_imo_number_key" ON "ships"("imo_number");

-- CreateIndex
CREATE UNIQUE INDEX "suez_canal_transits_voyage_id_key" ON "suez_canal_transits"("voyage_id");

-- AddForeignKey
ALTER TABLE "ships" ADD CONSTRAINT "ships_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ships" ADD CONSTRAINT "ships_fleet_id_fkey" FOREIGN KEY ("fleet_id") REFERENCES "fleets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voyages" ADD CONSTRAINT "voyages_ship_id_fkey" FOREIGN KEY ("ship_id") REFERENCES "ships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voyages" ADD CONSTRAINT "voyages_shipping_company_id_fkey" FOREIGN KEY ("shipping_company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voyages" ADD CONSTRAINT "voyages_origin_port_id_fkey" FOREIGN KEY ("origin_port_id") REFERENCES "ports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voyages" ADD CONSTRAINT "voyages_destination_port_id_fkey" FOREIGN KEY ("destination_port_id") REFERENCES "ports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voyage_status_history" ADD CONSTRAINT "voyage_status_history_voyage_id_fkey" FOREIGN KEY ("voyage_id") REFERENCES "voyages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suez_canal_transits" ADD CONSTRAINT "suez_canal_transits_voyage_id_fkey" FOREIGN KEY ("voyage_id") REFERENCES "voyages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo" ADD CONSTRAINT "cargo_voyage_id_fkey" FOREIGN KEY ("voyage_id") REFERENCES "voyages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo" ADD CONSTRAINT "cargo_cargo_owner_fkey" FOREIGN KEY ("cargo_owner") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo_documents" ADD CONSTRAINT "cargo_documents_cargo_id_fkey" FOREIGN KEY ("cargo_id") REFERENCES "cargo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
