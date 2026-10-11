export type Unit = "m" | "ft" | "cm";

export const UNITS: Unit[] = ["m", "ft", "cm"];

const FACTORS: Record<Unit, number> = { m: 1, ft: 0.3048, cm: 0.01 };

// Converts what was typed into a string in metres.
// Returns "" when the input is blank or not a number, so the server can reject it.
export function toMetres(raw: string, unit: Unit): string {
  const trimmed = raw.trim();
  if (trimmed === "") return "";
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return "";
  return String(Math.round(n * FACTORS[unit] * 10000) / 10000);
}

export const formatMetres = (n: number) => Number(n.toFixed(2));
