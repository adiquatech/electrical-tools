import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const room = await prisma.room.findUnique({
    where: { id },
    include: { points: true },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }

  const copy = await prisma.room.create({
    data: {
      name: `${room.name} (copy)`,
      distanceFromDB: room.distanceFromDB,
      active: true,
      projectId: room.projectId,
      points: {
        create: room.points.map((p) => ({
          type: p.type,
          subtype: p.subtype,
          quantity: p.quantity,
          dropLength: p.dropLength,
        })),
      },
    },
  });

  return NextResponse.json(copy, { status: 201 });
}