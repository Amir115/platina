-- AlterTable
ALTER TABLE "customers" ADD COLUMN "notes" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");
