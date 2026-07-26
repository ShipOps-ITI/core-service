-- AlterTable
ALTER TABLE "ports" ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "unLocode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ports_unLocode_key" ON "ports"("unLocode");

-- CreateIndex
CREATE INDEX "ports_unLocode_idx" ON "ports"("unLocode");
