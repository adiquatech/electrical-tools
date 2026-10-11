"use client";

import { UNITS, toMetres, formatMetres, type Unit } from "@/lib/units";

const inputStyle = {
  borderColor: "var(--border)",
  backgroundColor: "var(--background)",
};

export default function UnitInput({
  value,
  onValueChange,
  unit,
  onUnitChange,
  placeholder,
}: {
  value: string;
  onValueChange: (v: string) => void;
  unit: Unit;
  onUnitChange: (u: Unit) => void;
  placeholder: string;
}) {
  const metres = toMetres(value, unit);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <input
          type="number"
          min="0"
          step="any"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full min-w-0"
          style={inputStyle}
          required
        />
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value as Unit)}
          className="border rounded-lg px-2 py-2"
          style={inputStyle}
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
      {unit !== "m" && metres !== "" && (
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          = {formatMetres(Number(metres))} m
        </p>
      )}
    </div>
  );
}
