/*
  Warnings:

  - Added the required column `garageId` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `garageId` to the `vehicles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `garageId` to the `work_orders` table without a default value. This is not possible if the table is not empty.

*/
-- Truncate dev seed data so the NOT NULL garageId columns can be added cleanly
TRUNCATE TABLE "work_orders", "vehicles", "customers" RESTART IDENTITY CASCADE;

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "garageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "garageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "work_orders" ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "garageId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "garages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "garages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "garages_clerkUserId_key" ON "garages"("clerkUserId");

-- CreateIndex
CREATE INDEX "customers_garageId_idx" ON "customers"("garageId");

-- CreateIndex
CREATE INDEX "vehicles_garageId_idx" ON "vehicles"("garageId");

-- CreateIndex
CREATE INDEX "work_orders_garageId_idx" ON "work_orders"("garageId");

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_garageId_fkey" FOREIGN KEY ("garageId") REFERENCES "garages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_garageId_fkey" FOREIGN KEY ("garageId") REFERENCES "garages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_garageId_fkey" FOREIGN KEY ("garageId") REFERENCES "garages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
