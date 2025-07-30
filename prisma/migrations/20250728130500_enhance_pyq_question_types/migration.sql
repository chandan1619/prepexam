-- AlterTable
ALTER TABLE "PYQ" ADD COLUMN     "correct" INTEGER,
ADD COLUMN     "options" TEXT[],
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'descriptive';

-- Update existing records to have the descriptive type
UPDATE "PYQ" SET "type" = 'descriptive' WHERE "type" IS NULL;