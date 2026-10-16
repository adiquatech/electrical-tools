// Edit the values in this file to match your own working practice.
// All lengths are in metres. These are only the defaults: sizes can also be
// changed per project from the Project settings panel.

export type Category = "lighting" | "switch" | "socket" | "ac" | "tv" | "cooker" | "pump" | "water_heater" | "washing_machine" | "other" | "security";

export type CategorySpec = {
  label: string;
  conduitMm: number;
  wireMm2: number;
  conductors: number;
  // true = in half-conduit mode this run is wired open in the roof (no conduit)
  roof: boolean;
};

export const CATEGORY_SPECS: Record<Category, CategorySpec> = {
  lighting: { label: "Lighting", conduitMm: 20, wireMm2: 1, conductors: 3, roof: true },
  switch: { label: "Switch drops", conduitMm: 20, wireMm2: 1, conductors: 2, roof: false },
  socket: { label: "Sockets", conduitMm: 20, wireMm2: 1.5, conductors: 3, roof: false },
  ac: { label: "Air conditioner", conduitMm: 20, wireMm2: 2.5, conductors: 3, roof: false },
  tv: { label: "TV points", conduitMm: 20, wireMm2: 1.5, conductors: 3, roof: false },
  cooker: { label: "Cooker", conduitMm: 20, wireMm2: 2.5, conductors: 3, roof: false },
  pump: { label: "Pump", conduitMm: 20, wireMm2: 2.5, conductors: 3, roof: false },
  water_heater: { label: "Water Heater", conduitMm: 20, wireMm2: 2.5, conductors: 3, roof: false },
  washing_machine: { label: "Washing Machine", conduitMm: 20, wireMm2: 2.5, conductors: 3, roof: false },
  other: { label: "Other", conduitMm: 20, wireMm2: 1.5, conductors: 3, roof: false },
  security: { label: "Security lights", conduitMm: 20, wireMm2: 1.5, conductors: 3, roof: false },
};

// Choices offered in the settings dropdowns
export const CONDUIT_SIZES_MM = [16, 20, 25, 32];
export const WIRE_SIZES_MM2 = [1, 1.5, 2.5, 4, 6, 10];

// In half-conduit mode, how many conductors each room's lighting feed takes from the DB.
// 3 = live, neutral, earth all from the DB (no saving assumed).
// Lower it (e.g. 2 or 1.5) if you usually tap neutral/earth from the next room.
export const HALF_CONDUIT_LIGHTING_FEED_CONDUCTORS = 3;

export const POINT_CATEGORY: Record<string, Category> = {
  LIGHT: "lighting",
  SWITCH: "switch",
  SOCKET: "socket",
  AC: "ac",
  TV: "tv",
  KITCHEN_COOKER: "cooker",
  SECURITY_LIGHT: "security",
  PUMP: "pump",
  WATER_HEATER: "water_heater",
  WASHING_MACHINE: "washing_machine",
  OTHER: "other",
};

export const POINT_LABELS: Record<string, string> = {
  LIGHT: "Light",
  SWITCH: "Switch",
  SOCKET: "Socket",
  AC: "AC point",
  TV: "TV point",
  KITCHEN_COOKER: "Cooker point",
  SECURITY_LIGHT: "Security light",
  PUMP: "Pump",
  WATER_HEATER: "Water Heater",
  WASHING_MACHINE: "Washing Machine",
  OTHER: "Other",
};

export const SUBTYPE_LABELS: Record<string, string> = {
  CENTER: "Centre light",
  WALL_BRACKET: "Wall bracket",
  POP: "POP light",
};

export const BOX_NAMES: Record<Category | "junction", string> = {
  lighting: "Light outlet box",
  switch: "Switch box",
  socket: "Socket box",
  ac: "AC point box",
  tv: "TV point box",
  cooker: "Cooker point box",
  pump: "Pump box",
  water_heater: "Water Heater box",
  washing_machine: "Washing Machine box",
  other: "Other box",
  security: "Weatherproof box",
  junction: "Junction box",
};

export const CONDUIT_PIPE_LENGTH_M = 3;
export const WIRE_COIL_LENGTH_M = 100;


export const JUNCTION_BOX_TYPES = ["U", "Y", "2-way", "3-way", "4-way"] as const;
export type JunctionBoxType = (typeof JUNCTION_BOX_TYPES)[number];

export type ExtraBoxes = Record<JunctionBoxType, number>;

export const EMPTY_EXTRA_BOXES: ExtraBoxes = {
  U: 0,
  Y: 0,
  "2-way": 0,
  "3-way": 0,
  "4-way": 0,
};

export function parseExtraBoxes(raw: unknown): ExtraBoxes {
  const src =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const out = { ...EMPTY_EXTRA_BOXES };
  for (const key of JUNCTION_BOX_TYPES) {
    const n = Number(src[key]);
    out[key] = Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  }
  return out;
}