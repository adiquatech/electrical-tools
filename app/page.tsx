import Link from "next/link";

const TOOLS = [
  {
    href: "/boq",
    title: "Bill of Quantities",
    desc: "View take-offs for each project: fittings, conduit, cable, and boxes.",
    badge: "Ready",
  },
  {
    href: "/projects",
    title: "Projects",
    desc: "Create and edit client projects, rooms, and points.",
    badge: "Ready",
  },
  {
    href: "#",
    title: "Solar sizing",
    desc: "Panel, battery, and inverter sizing for off-grid and hybrid systems.",
    badge: "Soon",
  },
  {
    href: "#",
    title: "Cable sizing",
    desc: "Voltage drop and current capacity for single- and three-phase runs.",
    badge: "Soon",
  },
];

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Electrical Tools</h1>
      <p className="mb-8 max-w-xl" style={{ color: "var(--muted)" }}>
        Calculators and take-off tools for electrical installation and design work.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TOOLS.map((t) => (
          <Link
            key={t.title}
            href={t.href}
            className="card p-5 block transition-colors hover:bg-[var(--card-hover)]"
            style={
              t.badge === "Soon"
                ? { opacity: 0.65, pointerEvents: "none" }
                : undefined
            }
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h2 className="font-semibold">{t.title}</h2>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                style={{
                  background:
                    t.badge === "Ready" ? "var(--accent-muted)" : "var(--border)",
                  color: t.badge === "Ready" ? "var(--accent)" : "var(--muted)",
                }}
              >
                {t.badge}
              </span>
            </div>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {t.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}