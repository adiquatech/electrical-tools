import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { CATEGORY_SPECS, CONDUIT_SIZES_MM, WIRE_SIZES_MM2 } from "@/lib/boq-config";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (body.conduitMode !== "FULL" && body.conduitMode !== "HALF") {
    return NextResponse.json({ error: "Choose full or half conduit." }, { status: 400 });
  }

  const margin = Number(body.safetyMarginPercent);
  if (!Number.isFinite(margin) || margin < 0 || margin > 100) {
    return NextResponse.json(
      { error: "Safety margin must be between 0 and 100." },
      { status: 400 }
    );
  }

  const specOverrides: Record<string, { conduitMm: number; wireMm2: number }> = {};
  for (const key of Object.keys(CATEGORY_SPECS)) {
    const item = body.specOverrides?.[key];
    const conduitMm = Number(item?.conduitMm);
    const wireMm2 = Number(item?.wireMm2);
    if (!CONDUIT_SIZES_MM.includes(conduitMm) || !WIRE_SIZES_MM2.includes(wireMm2)) {
      return NextResponse.json({ error: `Invalid sizes for ${key}.` }, { status: 400 });
    }
    specOverrides[key] = { conduitMm, wireMm2 };
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      conduitMode: body.conduitMode,
      safetyMarginPercent: margin,
      specOverrides,
    },
  });

  return NextResponse.json(project);
}
