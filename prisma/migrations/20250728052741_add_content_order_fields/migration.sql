/*
  Warnings:

  - You are about to drop the column `isFree` on the `BlogPost` table. All the data in the column will be lost.
  - You are about to drop the column `isFree` on the `PYQ` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BlogPost" DROP COLUMN "isFree",
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ModuleQuestion" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PYQ" DROP COLUMN "isFree",
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;
