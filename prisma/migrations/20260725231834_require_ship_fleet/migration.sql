/*
  Warnings:

  - Made the column `fleetId` on table `ships` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ships" DROP CONSTRAINT "ships_fleetId_fkey";

-- AlterTable
ALTER TABLE "ships" ADD COLUMN     "lastAisUpdateAt" TIMESTAMP(3),
ALTER COLUMN "fleetId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ships" ADD CONSTRAINT "ships_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "fleets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
