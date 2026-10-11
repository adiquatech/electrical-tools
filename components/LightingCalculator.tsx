"use client";

import { useState } from "react";

export default function LightingCalculator() {
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [requiredLux, setRequiredLux] = useState("300");
  const [fixtureLumens, setFixtureLumens] = useState("2000");
  const [utilizationFactor, setUtilizationFactor] = useState("0.5");
  const [maintenanceFactor, setMaintenanceFactor] = useState("0.8");

  const area = Number(length) * Number(width);
  const uf = Number(utilizationFactor);
  const mf = Number(maintenanceFactor);
  const lumensPerFixture = Number(fixtureLumens);
  const lux = Number(requiredLux);

  const totalLumensNeeded = lux * area;
  const effectiveLumensPerFixture = lumensPerFixture * uf * mf;
  const numberOfFixtures =
    effectiveLumensPerFixture > 0
      ? Math.ceil(totalLumensNeeded / effectiveLumensPerFixture)
      : 0;

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Lighting Calculator</h1>
      <p className="mb-10" style={{ color: "var(--muted)" }}>
        Calculate the number of light fixtures needed for a room using the lumen method.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>
            Room Length (m)
          </label>
          <input
            type="number"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className="border rounded-lg px-3 py-2 bg-transparent"
            style={{ borderColor: "var(--border)" }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>
            Room Width (m)
          </label>
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            className="border rounded-lg px-3 py-2 bg-transparent"
            style={{ borderColor: "var(--border)" }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>
            Required Lux
          </label>
          <input
            type="number"
            value={requiredLux}
            onChange={(e) => setRequiredLux(e.target.value)}
            className="border rounded-lg px-3 py-2 bg-transparent"
            style={{ borderColor: "var(--border)" }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>
            Lumens per Fixture
          </label>
          <input
            type="number"
            value={fixtureLumens}
            onChange={(e) => setFixtureLumens(e.target.value)}
            className="border rounded-lg px-3 py-2 bg-transparent"
            style={{ borderColor: "var(--border)" }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>
            Utilization Factor
          </label>
          <input
            type="number"
            step="0.01"
            value={utilizationFactor}
            onChange={(e) => setUtilizationFactor(e.target.value)}
            className="border rounded-lg px-3 py-2 bg-transparent"
            style={{ borderColor: "var(--border)" }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>
            Maintenance Factor
          </label>
          <input
            type="number"
            step="0.01"
            value={maintenanceFactor}
            onChange={(e) => setMaintenanceFactor(e.target.value)}
            className="border rounded-lg px-3 py-2 bg-transparent"
            style={{ borderColor: "var(--border)" }}
          />
        </div>
      </div>

      <div
        className="border rounded-xl p-6 text-center"
        style={{ borderColor: "var(--accent)" }}
      >
        <p className="text-sm mb-2" style={{ color: "var(--muted)" }}>
          Fixtures Needed
        </p>
        <p className="text-4xl font-bold" style={{ color: "var(--accent)" }}>
          {area > 0 && lumensPerFixture > 0 ? numberOfFixtures : "—"}
        </p>
      </div>
    </div>
  );
}