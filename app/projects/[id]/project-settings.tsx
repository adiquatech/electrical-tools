"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CONDUIT_SIZES_MM, WIRE_SIZES_MM2 } from "@/lib/boq-config";

type SpecRow = { label: string; conduitMm: number; wireMm2: number };

const inputStyle = {
  borderColor: "var(--border)",
  backgroundColor: "var(--background)",
};

export default function ProjectSettings({
  projectId,
  conduitMode: initialMode,
  safetyMarginPercent: initialMargin,
  specs: initialSpecs,
}: {
  projectId: string;
  conduitMode: string;
  safetyMarginPercent: number;
  specs: Record<string, SpecRow>;
}) {
  const router = useRouter();
  const [conduitMode, setConduitMode] = useState(initialMode);
  const [margin, setMargin] = useState(String(initialMargin));
  const [specs, setSpecs] = useState(initialSpecs);
  const [message, setMessage] = useState("");

  function updateSpec(key: string, field: "conduitMm" | "wireMm2", value: string) {
    setSpecs((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: Number(value) },
    }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();

    const specOverrides = Object.fromEntries(
      Object.entries(specs).map(([key, s]) => [
        key,
        { conduitMm: s.conduitMm, wireMm2: s.wireMm2 },
      ])
    );

    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conduitMode, safetyMarginPercent: margin, specOverrides }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setMessage(data?.error ?? "Could not save settings.");
      return;
    }

    setMessage("Saved.");
    router.refresh();
  }

  return (
    <details
      className="border rounded-xl p-4 mb-8"
      style={{ borderColor: "var(--border)" }}
    >
      <summary className="cursor-pointer font-medium">Project settings</summary>

      <form onSubmit={save} className="flex flex-col gap-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm" style={{ color: "var(--muted)" }}>
            Conduit
            <select
              value={conduitMode}
              onChange={(e) => setConduitMode(e.target.value)}
              className="border rounded-lg px-3 py-2 text-base"
              style={{ ...inputStyle, color: "var(--foreground)" }}
            >
              <option value="FULL">Full conduit (roof, floor, wall)</option>
              <option value="HALF">Half conduit (floor and wall only)</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm" style={{ color: "var(--muted)" }}>
            Safety margin (%)
            <input
              type="number"
              min="0"
              max="100"
              step="any"
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
              className="border rounded-lg px-3 py-2 text-base"
              style={{ ...inputStyle, color: "var(--foreground)" }}
              required
            />
          </label>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left" style={{ color: "var(--muted)" }}>
              <th className="py-2">Circuit</th>
              <th className="py-2">Conduit</th>
              <th className="py-2">Wire</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(specs).map(([key, spec]) => (
              <tr key={key}>
                <td className="py-1 pr-3">{spec.label}</td>
                <td className="py-1 pr-3">
                  <select
                    value={spec.conduitMm}
                    onChange={(e) => updateSpec(key, "conduitMm", e.target.value)}
                    className="border rounded-lg px-2 py-1 w-full"
                    style={inputStyle}
                  >
                    {CONDUIT_SIZES_MM.map((s) => (
                      <option key={s} value={s}>
                        {s} mm
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-1">
                  <select
                    value={spec.wireMm2}
                    onChange={(e) => updateSpec(key, "wireMm2", e.target.value)}
                    className="border rounded-lg px-2 py-1 w-full"
                    style={inputStyle}
                  >
                    {WIRE_SIZES_MM2.map((s) => (
                      <option key={s} value={s}>
                        {s} mm²
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {message && (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {message}
          </p>
        )}
        <button
          type="submit"
          className="self-start px-4 py-2 rounded-lg font-medium text-black text-sm"
          style={{ backgroundColor: "var(--accent)" }}
        >
          Save settings
        </button>
      </form>
    </details>
  );
}
