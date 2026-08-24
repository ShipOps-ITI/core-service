-- A vessel identity is unique within a ShipOps company workspace. Different
-- companies can register the same real-world vessel in their own workspace.
DROP INDEX "ships_imoNumber_key";
DROP INDEX "ships_mmsiNumber_key";

CREATE UNIQUE INDEX "ships_companyId_imoNumber_key" ON "ships"("companyId", "imoNumber");
CREATE UNIQUE INDEX "ships_companyId_mmsiNumber_key" ON "ships"("companyId", "mmsiNumber");
