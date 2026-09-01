-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'local',
    "googleId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "offerNotifications" BOOLEAN NOT NULL DEFAULT true,
    "newArrivalNotifications" BOOLEAN NOT NULL DEFAULT false,
    "blogNotifications" BOOLEAN NOT NULL DEFAULT true,
    "restockNotifications" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_users" ("avatar", "blogNotifications", "createdAt", "email", "emailNotifications", "firstName", "id", "isVerified", "lastName", "newArrivalNotifications", "offerNotifications", "password", "phone", "restockNotifications", "role", "updatedAt") SELECT "avatar", "blogNotifications", "createdAt", "email", "emailNotifications", "firstName", "id", "isVerified", "lastName", "newArrivalNotifications", "offerNotifications", "password", "phone", "restockNotifications", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
