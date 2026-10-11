"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UnitInput from "./unit-input";
import { toMetres, type Unit } from "@/lib/units";

const inputStyle = {
  borderColor: "var(--border)",
  backgroundColor: "var(--background)",
};

export default function AddRoomForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [distanceFromDB, setDistanceFromDB] = useState("");
  const [unit, setUnit] = useState<Unit>("m");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch(`/api/projects/${projectId}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        distanceFromDB: toMetres(distanceFromDB, unit),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Could not add the room.");
      return;
    }

    setError("");
    setName("");
    setDistanceFromDB("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border rounded-xl p-4 flex flex-col gap-3"
      style={{ borderColor: "var(--border)" }}
    >
      <p className="font-medium">Add a room</p>
      <div className="grid grid-cols-2 gap-3 items-start">
        <input
          placeholder="Room name (e.g. Kitchen)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded-lg px-3 py-2"
          style={inputStyle}
          required
        />
        <UnitInput
          value={distanceFromDB}
          onValueChange={setDistanceFromDB}
          unit={unit}
          onUnitChange={setUnit}
          placeholder="Distance from DB"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        className="self-start px-4 py-2 rounded-lg font-medium text-black"
        style={{ backgroundColor: "var(--accent)" }}
      >
        Add Room
      </button>
    </form>
  );
}
