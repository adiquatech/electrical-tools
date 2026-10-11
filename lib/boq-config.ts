// Edit the values in this file to match your own working practice.
// All lengths are in metres. These are only the defaults: sizes can also be
// changed per project from the Project settings panel.

export type Category = "lighting" | "switch" | "socket" | "ac" | "cooker" | "security";

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
  cooker: { label: "Cooker", conduitMm: 20, wireMm2: 2.5, conductors: 3, roof: false },
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
  KITCHEN_COOKER: "cooker",
  SECURITY_LIGHT: "security",
};

export const POINT_LABELS: Record<string, string> = {
  LIGHT: "Light",
  SWITCH: "Switch",
  SOCKET: "Socket",
  AC: "AC point",
  KITCHEN_COOKER: "Cooker point",
  SECURITY_LIGHT: "Security light",
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
  cooker: "Cooker point box",
  security: "Weatherproof box",
  junction: "Junction box",
};

export const CONDUIT_PIPE_LENGTH_M = 3;
export const WIRE_COIL_LENGTH_M = 100;
