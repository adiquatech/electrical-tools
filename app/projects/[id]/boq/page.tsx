import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { calculateBOQ } from "@/lib/boq";
import {
  CATEGORY_SPECS,
  CONDUIT_PIPE_LENGTH_M,
  WIRE_COIL_LENGTH_M,
} from "@/lib/boq-config";

const border = { borderColor: "var(--border)" };
const muted = { color: "var(--muted)" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      {children}
    </section>
  );
}

export default async function BOQPage({
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

  const boq = calculateBOQ(project);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href={`/projects/${project.id}`} className="text-sm" style={muted}>
        ← Back to project
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-1">Bill of Quantities</h1>
      <p className="mb-1">{project.clientName}</p>
      <p className="mb-8 text-sm" style={muted}>
        {project.siteAddress ?? "No address"} · Safety margin {project.safetyMarginPercent}%
        applied to materials
      </p>

      {project.rooms.length === 0 ? (
        <p style={muted}>Add rooms and points to the project first.</p>
      ) : (
        <>
          <Section title="Point schedule">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b" style={{ ...border, ...muted }}>
                  <th className="py-2">Item</th>
                  <th className="py-2 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {boq.schedule.map((row) => (
                  <tr key={row.name} className="border-b" style={border}>
                    <td className="py-2">{row.name}</td>
                    <td className="py-2 text-right">{row.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="Conduit">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b" style={{ ...border, ...muted }}>
                  <th className="py-2">Size</th>
                  <th className="py-2 text-right">Measured (m)</th>
                  <th className="py-2 text-right">With margin (m)</th>
                  <th className="py-2 text-right">Pipes ({CONDUIT_PIPE_LENGTH_M} m)</th>
                </tr>
              </thead>
              <tbody>
                {boq.conduit.map((row) => (
                  <tr key={row.sizeMm} className="border-b" style={border}>
                    <td className="py-2">{row.sizeMm} mm</td>
                    <td className="py-2 text-right">{row.rawM}</td>
                    <td className="py-2 text-right">{row.withMarginM}</td>
                    <td className="py-2 text-right font-bold">{row.pipes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="Wire">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b" style={{ ...border, ...muted }}>
                  <th className="py-2">Size</th>
                  <th className="py-2 text-right">Measured (m)</th>
                  <th className="py-2 text-right">With margin (m)</th>
                  <th className="py-2 text-right">Coils ({WIRE_COIL_LENGTH_M} m)</th>
                </tr>
              </thead>
              <tbody>
                {boq.wire.map((row) => (
                  <tr key={row.sizeMm2} className="border-b" style={border}>
                    <td className="py-2">{row.sizeMm2} mm²</td>
                    <td className="py-2 text-right">{row.rawM}</td>
                    <td className="py-2 text-right">{row.withMarginM}</td>
                    <td className="py-2 text-right font-bold">{row.coils}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="Boxes">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b" style={{ ...border, ...muted }}>
                  <th className="py-2">Item</th>
                  <th className="py-2 text-right">Counted</th>
                  <th className="py-2 text-right">With margin</th>
                </tr>
              </thead>
              <tbody>
                {boq.boxes.map((row) => (
                  <tr key={row.name} className="border-b" style={border}>
                    <td className="py-2">{row.name}</td>
                    <td className="py-2 text-right">{row.raw}</td>
                    <td className="py-2 text-right font-bold">{row.withMargin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="Working (how the lengths were built)">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b" style={{ ...border, ...muted }}>
                  <th className="py-2">Room</th>
                  <th className="py-2">Circuit</th>
                  <th className="py-2">Detail</th>
                  <th className="py-2 text-right">Length (m)</th>
                </tr>
              </thead>
              <tbody>
                {boq.runs.map((run, i) => (
                  <tr key={i} className="border-b" style={border}>
                    <td className="py-2">{run.room}</td>
                    <td className="py-2">{CATEGORY_SPECS[run.category].label}</td>
                    <td className="py-2" style={muted}>{run.description}</td>
                    <td className="py-2 text-right">{Number(run.lengthM.toFixed(2))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </>
      )}
    </div>
  );
}
