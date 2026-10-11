import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const name = String(body.name ?? "").trim();
  const rawDistance = String(body.distanceFromDB ?? "").trim();
  const distanceFromDB = rawDistance === "" ? NaN : Number(rawDistance);

  if (!name) {
    return NextResponse.json({ error: "Room name is required." }, { status: 400 });
  }
  if (!Number.isFinite(distanceFromDB) || distanceFromDB < 0) {
    return NextResponse.json(
      { error: "Enter the distance from the DB as a number (0 or more)." },
      { status: 400 }
    );
  }

  const room = await prisma.room.create({
    data: { name, distanceFromDB, projectId: id },
  });

  return NextResponse.json(room, { status: 201 });
}