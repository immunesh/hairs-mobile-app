/*
  Warnings:

  - You are about to drop the column `icon` on the `product_features` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_product_features" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_features_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_product_features" ("createdAt", "id", "productId", "subtitle", "title") SELECT "createdAt", "id", "productId", "subtitle", "title" FROM "product_features";
DROP TABLE "product_features";
ALTER TABLE "new_product_features" RENAME TO "product_features";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
