import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const POINT_TYPES = ["LIGHT", "SWITCH", "SOCKET", "AC", "TV", "KITCHEN_COOKER", "SECURITY_LIGHT", "PUMP", "WATER_HEATER", "WASHING_MACHINE", "OTHER"];
const LIGHT_SUBTYPES = ["CENTER", "WALL_BRACKET", "POP"];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (!POINT_TYPES.includes(body.type)) {
    return NextResponse.json({ error: "Choose a point type." }, { status: 400 });
  }

  const isLight = body.type === "LIGHT";
  if (isLight && !LIGHT_SUBTYPES.includes(body.subtype)) {
    return NextResponse.json({ error: "Choose the light type." }, { status: 400 });
  }

  const quantity = Number(body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json({ error: "Quantity must be a whole number of 1 or more." }, { status: 400 });
  }

  const rawDrop = String(body.dropLength ?? "").trim();
  const dropLength = rawDrop === "" ? NaN : Number(rawDrop);
  if (!Number.isFinite(dropLength) || dropLength < 0) {
    return NextResponse.json({ error: "Enter the drop length in metres (0 or more)." }, { status: 400 });
  }

  const point = await prisma.point.create({
    data: {
      type: body.type,
      subtype: isLight ? body.subtype : null,
      quantity,
      dropLength,
      roomId: id,
    },
  });

  return NextResponse.json(point, { status: 201 });
}