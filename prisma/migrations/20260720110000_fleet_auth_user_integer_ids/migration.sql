-- Existing fleets were confirmed empty before this migration.
ALTER TABLE "fleets"
  DROP COLUMN "managedByUserId",
  DROP COLUMN "createdByUserId";

ALTER TABLE "fleets"
  ADD COLUMN "managedByUserId" INTEGER NOT NULL,
  ADD COLUMN "createdByUserId" INTEGER NOT NULL;
