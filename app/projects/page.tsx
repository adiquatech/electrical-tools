import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { rooms: true } },
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Open a project to edit rooms and points, or view its BOQ.
          </p>
        </div>
        <Link href="/projects/new" className="btn-primary text-sm">
          + New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>
          No projects yet.{" "}
          <Link
            href="/projects/new"
            className="underline"
            style={{ color: "var(--accent)" }}
          >
            Create one
          </Link>{" "}
          to get started.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-semibold truncate">{project.clientName}</p>
                <p
                  className="text-sm truncate"
                  style={{ color: "var(--muted)" }}
                >
                  {project.siteAddress ?? "No address"} ·{" "}
                  {project._count.rooms} room
                  {project._count.rooms !== 1 ? "s" : ""} ·{" "}
                  {project.conduitMode === "HALF" ? "Half" : "Full"} conduit ·{" "}
                  {project.safetyMarginPercent}% margin
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  {new Date(project.createdAt).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Africa/Lagos",
                  })}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                <Link
                  href={`/projects/${project.id}`}
                  className="btn-primary text-sm"
                >
                  Open project
                </Link>
                <Link
                  href={`/projects/${project.id}/boq`}
                  className="btn-ghost text-sm border"
                  style={{ borderColor: "var(--border)" }}
                >
                  View BOQ
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}