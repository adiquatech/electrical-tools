import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.room.deleteMany({ where: { id } });
  return NextResponse.json({ message: "Room deleted" });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const data: { active?: boolean; name?: string } = {};

  if (typeof body.active === "boolean") {
    data.active = body.active;
  }

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) {
      return NextResponse.json({ error: "Room name is required." }, { status: 400 });
    }
    data.name = name;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "Provide active and/or name to update." },
      { status: 400 }
    );
  }

  const room = await prisma.room.update({
    where: { id },
    data,
  });

  return NextResponse.json(room);
}