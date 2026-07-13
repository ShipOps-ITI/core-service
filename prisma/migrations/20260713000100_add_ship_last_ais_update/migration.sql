-- Records when ShipOps most recently received an AIS position for a ship.
ALTER TABLE "ships" ADD COLUMN "lastAisUpdateAt" TIMESTAMP(3);
