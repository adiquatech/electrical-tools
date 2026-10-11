-- CreateEnum
CREATE TYPE "ConduitMode" AS ENUM ('FULL', 'HALF');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "conduitMode" "ConduitMode" NOT NULL DEFAULT 'FULL',
ADD COLUMN     "specOverrides" JSONB;
