import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { resolveSpecs } from "@/lib/boq";
import AddRoomForm from "./add-room-form";
import RoomCard from "./room-card";
import ProjectSettings from "./project-settings";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      rooms: {
        orderBy: { id: "asc" },
        include: { points: { orderBy: { id: "asc" } } },
      },
    },
  });

  if (!project) notFound();

  const specs = Object.fromEntries(
    Object.entries(resolveSpecs(project.specOverrides)).map(([key, s]) => [
      key,
      { label: s.label, conduitMm: s.conduitMm, wireMm2: s.wireMm2 },
    ])
  );

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-start mb-1">
        <h1 className="text-2xl font-bold">{project.clientName}</h1>
        <Link
          href={`/projects/${project.id}/boq`}
          className="px-4 py-2 rounded-lg font-medium text-black text-sm"
          style={{ backgroundColor: "var(--accent)" }}
        >
          View BOQ →
        </Link>
      </div>
      <p className="mb-8" style={{ color: "var(--muted)" }}>
        {project.siteAddress ?? "No address"} · {project.safetyMarginPercent}% margin ·{" "}
        {project.conduitMode === "HALF" ? "Half conduit" : "Full conduit"}
      </p>

      <ProjectSettings
        projectId={project.id}
        conduitMode={project.conduitMode}
        safetyMarginPercent={project.safetyMarginPercent}
        specs={specs}
      />

      <h2 className="text-lg font-bold mb-4">Rooms</h2>

      <div className="flex flex-col gap-4 mb-8">
        {project.rooms.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No rooms yet. Add the first one below.</p>
        ) : (
          project.rooms.map((room) => <RoomCard key={room.id} room={room} />)
        )}
      </div>

      <AddRoomForm projectId={project.id} />
    </div>
  );
}
