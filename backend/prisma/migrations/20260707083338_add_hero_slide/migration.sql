-- CreateTable
CREATE TABLE "hero_slides" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "headline" TEXT NOT NULL,
    "subheadline" TEXT,
    "description" TEXT,
    "image" TEXT NOT NULL,
    "badge" TEXT,
    "tag" TEXT,
    "cta" TEXT,
    "ctaLink" TEXT,
    "ctaSecondary" TEXT,
    "ctaSecondaryLink" TEXT,
    "accent" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
