-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "passingMark" INTEGER NOT NULL DEFAULT 40,
ADD COLUMN     "timeLimit" INTEGER NOT NULL DEFAULT 30;
