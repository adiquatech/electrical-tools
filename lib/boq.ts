import {
  BOX_NAMES,
  CATEGORY_SPECS,
  CONDUIT_PIPE_LENGTH_M,
  HALF_CONDUIT_LIGHTING_FEED_CONDUCTORS,
  POINT_CATEGORY,
  POINT_LABELS,
  SUBTYPE_LABELS,
  WIRE_COIL_LENGTH_M,
  type Category,
  type CategorySpec,
} from "./boq-config";

export type BOQProject = {
  safetyMarginPercent: number;
  conduitMode: string;
  specOverrides: unknown;
  rooms: {
    name: string;
    distanceFromDB: number;
    points: {
      type: string;
      subtype: string | null;
      quantity: number;
      dropLength: number;
    }[];
  }[];
};

export type Run = {
  room: string;
  category: Category;
  description: string;
  lengthM: number;
  conductors: number;
  inConduit: boolean;
};

const round2 = (n: number) => Math.round(n * 100) / 100;
// avoids 33.000000000000004 rounding up to the next whole number
const ceilSafe = (n: number) => Math.ceil(Math.round(n * 1e6) / 1e6);

// Merges the project's saved size overrides over the defaults in boq-config
export function resolveSpecs(overrides: unknown): Record<Category, CategorySpec> {
  const source = (overrides && typeof overrides === "object" ? overrides : {}) as Record<
    string,
    { conduitMm?: unknown; wireMm2?: unknown } | undefined
  >;
  const specs = {} as Record<Category, CategorySpec>;

  for (const key of Object.keys(CATEGORY_SPECS) as Category[]) {
    const base = CATEGORY_SPECS[key];
    const c = source[key]?.conduitMm;
    const w = source[key]?.wireMm2;
    specs[key] = {
      ...base,
      conduitMm: typeof c === "number" && c > 0 ? c : base.conduitMm,
      wireMm2: typeof w === "number" && w > 0 ? w : base.wireMm2,
    };
  }
  return specs;
}

export function calculateBOQ(project: BOQProject) {
  const margin = 1 + project.safetyMarginPercent / 100;
  const half = project.conduitMode === "HALF";
  const specs = resolveSpecs(project.specOverrides);

  const runs: Run[] = [];
  const boxRaw = new Map<string, number>();
  const scheduleMap = new Map<string, number>();

  const addTo = (map: Map<string, number>, key: string, n: number) =>
    map.set(key, (map.get(key) ?? 0) + n);

  // Half conduit: runs flagged "roof" are wired open, so they use no conduit
  const inConduit = (category: Category) => !(half && specs[category].roof);

  for (const room of project.rooms) {
    const countOf = (...types: string[]) =>
      room.points
        .filter((p) => types.includes(p.type))
        .reduce((sum, p) => sum + p.quantity, 0);

    const addFeed = (
      category: Category,
      description: string,
      times: number,
      junction: boolean
    ) => {
      const conductors =
        half && category === "lighting"
          ? HALF_CONDUIT_LIGHTING_FEED_CONDUCTORS
          : specs[category].conductors;

      runs.push({
        room: room.name,
        category,
        description,
        lengthM: room.distanceFromDB * times,
        conductors,
        inConduit: inConduit(category),
      });
      if (junction) addTo(boxRaw, BOX_NAMES.junction, 1);
    };

    // Shared feeds: one per room
    if (countOf("LIGHT", "SWITCH") > 0)
      addFeed("lighting", "Feed from DB (lighting)", 1, true);
    if (countOf("SOCKET") > 0)
      addFeed("socket", "Feed from DB (sockets)", 1, true);
    if (countOf("SECURITY_LIGHT") > 0)
      addFeed("security", "Feed from DB (security lights)", 1, true);

    // Dedicated feeds: one per unit
    const acUnits = countOf("AC");
    if (acUnits > 0)
      addFeed("ac", `Dedicated feed from DB (${acUnits} AC)`, acUnits, false);
    const cookers = countOf("KITCHEN_COOKER");
    if (cookers > 0)
      addFeed("cooker", `Dedicated feed from DB (${cookers} cooker)`, cookers, false);

    // Drops and boxes for every point
    for (const p of room.points) {
      const category = POINT_CATEGORY[p.type];
      if (!category) continue;

      const label = p.subtype
        ? SUBTYPE_LABELS[p.subtype] ?? p.subtype
        : POINT_LABELS[p.type] ?? p.type;

      runs.push({
        room: room.name,
        category,
        description: `${p.quantity} × ${label}, drop ${round2(p.dropLength)} m each`,
        lengthM: p.quantity * p.dropLength,
        conductors: specs[category].conductors,
        inConduit: inConduit(category),
      });
      addTo(boxRaw, BOX_NAMES[category], p.quantity);
      addTo(scheduleMap, label, p.quantity);
    }
  }

  const conduitRaw = new Map<number, number>();
  const wireRaw = new Map<number, number>();
  for (const run of runs) {
    const spec = specs[run.category];
    if (run.inConduit) {
      conduitRaw.set(spec.conduitMm, (conduitRaw.get(spec.conduitMm) ?? 0) + run.lengthM);
    }
    wireRaw.set(
      spec.wireMm2,
      (wireRaw.get(spec.wireMm2) ?? 0) + run.lengthM * run.conductors
    );
  }

  const conduit = Array.from(conduitRaw.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([sizeMm, raw]) => ({
      sizeMm,
      rawM: round2(raw),
      withMarginM: round2(raw * margin),
      pipes: ceilSafe((raw * margin) / CONDUIT_PIPE_LENGTH_M),
    }));

  const wire = Array.from(wireRaw.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([sizeMm2, raw]) => ({
      sizeMm2,
      rawM: round2(raw),
      withMarginM: round2(raw * margin),
      coils: ceilSafe((raw * margin) / WIRE_COIL_LENGTH_M),
    }));

  const boxes = Array.from(boxRaw.entries()).map(([name, raw]) => ({
    name,
    raw,
    withMargin: ceilSafe(raw * margin),
  }));

  const schedule = Array.from(scheduleMap.entries()).map(([name, quantity]) => ({
    name,
    quantity,
  }));

  return { runs, conduit, wire, boxes, schedule };
}
