-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_product_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "angle" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isTryOn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_product_images" ("alt", "angle", "createdAt", "id", "isPrimary", "productId", "url") SELECT "alt", "angle", "createdAt", "id", "isPrimary", "productId", "url" FROM "product_images";
DROP TABLE "product_images";
ALTER TABLE "new_product_images" RENAME TO "product_images";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
