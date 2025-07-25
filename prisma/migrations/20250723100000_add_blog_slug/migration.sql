-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN "slug" TEXT;

-- Update existing blog posts with slugs based on their titles
UPDATE "BlogPost" SET "slug" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g')) WHERE "slug" IS NULL;

-- Make slug column required and unique
ALTER TABLE "BlogPost" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");