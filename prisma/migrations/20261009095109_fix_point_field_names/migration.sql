/*
  Warnings:

  - You are about to drop the column `dropLenght` on the `Point` table. All the data in the column will be lost.
  - You are about to drop the column `subType` on the `Point` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Point" DROP COLUMN "dropLenght",
DROP COLUMN "subType",
ADD COLUMN     "dropLength" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "subtype" TEXT;
