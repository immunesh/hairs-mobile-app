-- AlterTable
ALTER TABLE "orders" ADD COLUMN "courier" TEXT;
ALTER TABLE "orders" ADD COLUMN "shipmentNotes" TEXT;
ALTER TABLE "orders" ADD COLUMN "shippedAt" DATETIME;
