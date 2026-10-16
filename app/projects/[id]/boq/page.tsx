import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import DownloadPdfButton from "./download-pdf-button";
import { calculateBOQ } from "@/lib/boq";
import {
  CATEGORY_SPECS,
  CONDUIT_PIPE_LENGTH_M,
  WIRE_COIL_LENGTH_M,
  JUNCTION_BOX_TYPES,
  parseExtraBoxes,
} from "@/lib/boq-config";

const border = { borderColor: "var(--border)" };
const muted = { color: "var(--muted)" };

function Section({
  title,
  subtitle,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="mb-6 card overflow-hidden" open={defaultOpen}>
      <summary className="cursor-pointer px-4 py-3 list-none flex flex-col gap-0.5 select-none">
        <span className="text-lg font-bold">{title}</span>
        {subtitle && (
          <span className="text-sm font-normal" style={{ color: "var(--muted)" }}>
            {subtitle} — click to expand
          </span>
        )}
        {!subtitle && (
          <span className="text-sm font-normal" style={{ color: "var(--muted)" }}>
            click to expand
          </span>
        )}
      </summary>
      <div className="px-4 pb-4 border-t" style={{ borderColor: "var(--border)" }}>
        {children}
      </div>
    </details>
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

  const extra = parseExtraBoxes(project.extraBoxes);
  const extraRows = JUNCTION_BOX_TYPES
    .map((type) => ({ type, qty: extra[type] }))
    .filter((r) => r.qty > 0);

  const boq = calculateBOQ(project);
  const isHalf = project.conduitMode === "HALF";
  const modeLabel = isHalf ? "Half conduit" : "Full conduit";
  const modeNote = isHalf
    ? "Roof lighting runs are open (no pipe on those runs). Cable is still counted for every circuit."
    : "Runs are installed in pipe where the design requires conduit. Cable is counted for every circuit.";

  const hasRooms = project.rooms.length > 0;
  // If you filter inactive rooms inside calculateBOQ, empty BOQ can still happen
  // when only inactive rooms exist — schedule length is a good signal.
  const hasContent = boq.schedule.length > 0 || boq.runs.length > 0;

  return (
    <div>
      {/* Nav */}
      <div className="flex flex-wrap items-center gap-3 text-sm mb-4" style={muted}>
        <Link href="/projects" className="hover:underline">
          Projects
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/projects/${project.id}`} className="hover:underline">
          {project.clientName}
        </Link>
        <span aria-hidden>/</span>
        <span style={{ color: "var(--foreground)" }}>BOQ</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold">Bill of Quantities</h1>
          <p className="mt-1 font-medium">{project.clientName}</p>
          <p className="text-sm mt-1" style={muted}>
            {project.siteAddress ?? "No address"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DownloadPdfButton projectId={project.id} />
          <Link
            href={`/projects/${project.id}`}
            className="btn-primary text-sm"
          >
            Edit project
          </Link>
          <Link
            href="/boq"
            className="btn-ghost text-sm border"
            style={{ borderColor: "var(--border)" }}
          >
            All BOQs
          </Link>
        </div>
      </div>

      {/* Mode + margin summary */}
      <div
        className="card p-4 mb-8 text-sm"
        style={{ background: "var(--accent-muted)" }}
      >
        <p className="font-medium" style={{ color: "var(--accent)" }}>
          {modeLabel} · {project.safetyMarginPercent}% safety margin
        </p>
        <p className="mt-1" style={muted}>
          {modeNote} Margin is applied to conduit, cable, and boxes before
          converting to pipes and coils.
        </p>
      </div>

      {!hasRooms || !hasContent ? (
        <p style={muted}>
          Add rooms and points on the project first, then return here to see the
          take-off.
        </p>
      ) : (
        <>
          <Section
            title="1. Fittings schedule"
            subtitle="Quantities of points and fittings only — not cable or pipe lengths."
            defaultOpen={true}
          >
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

          <Section
            title="2. Conduit (pipe)"
            subtitle={`Only runs that go inside pipe. Measured length → with margin → number of ${CONDUIT_PIPE_LENGTH_M} m pipes.`}
            defaultOpen={false}
          >
            {boq.conduit.length === 0 ? (
              <p className="text-sm" style={muted}>
                No conduit runs for this mode (e.g. half conduit with only open
                roof lighting).
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b" style={{ ...border, ...muted }}>
                    <th className="py-2">Size</th>
                    <th className="py-2 text-right">Measured (m)</th>
                    <th className="py-2 text-right">With margin (m)</th>
                    <th className="py-2 text-right">
                      Pipes ({CONDUIT_PIPE_LENGTH_M} m)
                    </th>
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
            )}
          </Section>

          <Section
            title="3. Cable (all circuits)"
            subtitle={`Total copper for every run — both inside pipe and open wiring. Length × number of cores → with margin → number of ${WIRE_COIL_LENGTH_M} m coils. This is not “only the cable outside pipe”.`}
            defaultOpen={false}
          >
            {boq.wire.length === 0 ? (
              <p className="text-sm" style={muted}>
                No cable runs calculated yet.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b" style={{ ...border, ...muted }}>
                    <th className="py-2">Size</th>
                    <th className="py-2 text-right">Measured (m)</th>
                    <th className="py-2 text-right">With margin (m)</th>
                    <th className="py-2 text-right">
                      Coils ({WIRE_COIL_LENGTH_M} m)
                    </th>
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
            )}
          </Section>

          <Section
            title="4. Boxes & accessories"
            subtitle="Auto counts from points and feeds. plus extra junction boxes."
            defaultOpen={false}
          >
            {boq.boxes.length === 0 ? (
              <p className="text-sm" style={muted}>
                No boxes counted yet.
              </p>
            ) : (
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
                      <td className="py-2 text-right font-bold">
                        {row.withMargin}
                      </td>
                    </tr>
                  ))}

                  {extraRows.length > 0 && (
                    <>
                      <p className="text-sm font-medium mt-6 mb-2">
                        Extra junction boxes (from plan)
                      </p>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left border-b" style={{ ...border, ...muted }}>
                            <th className="py-2">Type</th>
                            <th className="py-2 text-right">Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extraRows.map((row) => (
                            <tr key={row.type} className="border-b" style={border}>
                              <td className="py-2">{row.type} box</td>
                              <td className="py-2 text-right font-bold">{row.qty}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </tbody>
              </table>
            )}
          </Section>

          {/* Collapsed by default — for the engineer, not the client */}
          <Section
            title="5. Calculation details"
            subtitle="All runs, rooms, and circuits that were counted in the BOQ."
            defaultOpen={false}
          >
            <table className="w-full text-sm mt-2">
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
                    <td className="py-2">
                      {CATEGORY_SPECS[run.category]?.label ?? run.category}
                    </td>
                    <td className="py-2" style={muted}>
                      {run.description}
                      {!run.inConduit && (
                        <span className="ml-1 text-xs">(open — no pipe)</span>
                      )}
                    </td>
                    <td className="py-2 text-right">
                      {Number(run.lengthM.toFixed(2))}
                    </td>
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