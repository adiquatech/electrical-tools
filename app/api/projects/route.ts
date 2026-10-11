import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const body = await request.json();

  const project = await prisma.project.create({
    data: {
      clientName: body.clientName,
      siteAddress: body.siteAddress,
      safetyMarginPercent: Number(body.safetyMarginPercent),
    },
  });

  return NextResponse.json(project, { status: 201 });
}