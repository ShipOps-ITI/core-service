-- DropIndex
DROP INDEX "ports_name_country_key";

-- CreateIndex
CREATE INDEX "ports_name_country_idx" ON "ports"("name", "country");
