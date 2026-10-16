-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PointType" ADD VALUE 'TV';
ALTER TYPE "PointType" ADD VALUE 'PUMP';
ALTER TYPE "PointType" ADD VALUE 'WATER_HEATER';
ALTER TYPE "PointType" ADD VALUE 'WASHING_MACHINE';
ALTER TYPE "PointType" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;
