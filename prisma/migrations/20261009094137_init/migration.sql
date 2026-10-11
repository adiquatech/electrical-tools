-- CreateEnum
CREATE TYPE "PointType" AS ENUM ('LIGHT', 'SWITCH', 'SOCKET', 'AC', 'KITCHEN_COOKER', 'SECURITY_LIGHT');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "siteAddress" TEXT,
    "safetyMarginPercent" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "distanceFromDB" DOUBLE PRECISION NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Point" (
    "id" TEXT NOT NULL,
    "type" "PointType" NOT NULL,
    "subType" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "dropLenght" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roomId" TEXT NOT NULL,

    CONSTRAINT "Point_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Point" ADD CONSTRAINT "Point_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
