import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link
          href="/projects/new"
          className="px-4 py-2 rounded-lg font-medium text-black"
          style={{ backgroundColor: "var(--accent)" }}
        >
          + New Project
        </Link>
      </div>

      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr
            className="border-b text-left text-sm"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}
          >
            <th className="py-2 px-3 w-1/4">Client</th>
            <th className="py-2 px-3 w-1/4">Site</th>
            <th className="py-2 px-3 w-1/6">Margin</th>
            <th className="py-2 px-3 w-1/3">Created</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-b" style={{ borderColor: "var(--border)" }}>
              <td className="py-3 px-3 truncate">
                <Link href={`/projects/${project.id}`}
                  className="text-blue-600 hover:underline" 
                >
                  {project.clientName}
                </Link>
              </td>
              <td className="py-3 px-3 truncate">{project.siteAddress ?? "—"}</td>
              <td className="py-3 px-3">{project.safetyMarginPercent}%</td>
              <td className="py-3 px-3">
                {new Date(project.createdAt).toLocaleString( "en-GB",{
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Africa/Lagos",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}