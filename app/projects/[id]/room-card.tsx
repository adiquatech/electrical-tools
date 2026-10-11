"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PointData = {
  id: string;
  type: string;
  subtype: string | null;
  quantity: number;
  dropLength: number;
};

type RoomData = {
  id: string;
  name: string;
  distanceFromDB: number;
  points: PointData[];
};

const TYPE_LABELS: Record<string, string> = {
  LIGHT: "Light",
  SWITCH: "Switch",
  SOCKET: "Socket",
  AC: "AC point",
  KITCHEN_COOKER: "Cooker point",
  SECURITY_LIGHT: "Security light",
};

const SUBTYPE_LABELS: Record<string, string> = {
  CENTER: "Centre light",
  WALL_BRACKET: "Wall bracket",
  POP: "POP light",
};

const inputStyle = {
  borderColor: "var(--border)",
  backgroundColor: "var(--background)",
};

export default function RoomCard({ room }: { room: RoomData }) {
  const router = useRouter();
  const [type, setType] = useState("LIGHT");
  const [subtype, setSubtype] = useState("CENTER");
  const [quantity, setQuantity] = useState("1");
  const [dropLength, setDropLength] = useState("");
  const [error, setError] = useState("");

  async function addPoint(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch(`/api/rooms/${room.id}/points`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, subtype, quantity, dropLength }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Could not add the point.");
      return;
    }

    setError("");
    setQuantity("1");
    setDropLength("");
    router.refresh();
  }

  async function deletePoint(pointId: string) {
    await fetch(`/api/points/${pointId}`, { method: "DELETE" });
    router.refresh();
  }

  async function deleteRoom() {
    const confirmed = window.confirm(
      `Delete "${room.name}" and all its points? This cannot be undone.`
    );
    if (!confirmed) return;
    await fetch(`/api/rooms/${room.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div
      className="border rounded-xl p-5 flex flex-col gap-4"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold">{room.name}</h3>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {room.distanceFromDB} m from DB
          </p>
        </div>
        <button
          type="button"
          onClick={deleteRoom}
          className="text-sm text-red-400 hover:underline"
        >
          Delete room
        </button>
      </div>

      {room.points.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          No points yet.
        </p>
      ) : (
        <ul className="flex flex-col">
          {room.points.map((point) => (
            <li
              key={point.id}
              className="flex justify-between items-center py-2 border-b text-sm"
              style={{ borderColor: "var(--border)" }}
            >
              <span>
                {point.quantity} ×{" "}
                {point.subtype
                  ? SUBTYPE_LABELS[point.subtype] ?? point.subtype
                  : TYPE_LABELS[point.type] ?? point.type}
                <span style={{ color: "var(--muted)" }}>
                  {" "}
                  · drop {point.dropLength} m
                </span>
              </span>
              <button
                type="button"
                onClick={() => deletePoint(point.id)}
                className="text-red-400 hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={addPoint} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border rounded-lg px-3 py-2"
            style={inputStyle}
          >
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {type === "LIGHT" ? (
            <select
              value={subtype}
              onChange={(e) => setSubtype(e.target.value)}
              className="border rounded-lg px-3 py-2"
              style={inputStyle}
            >
              {Object.entries(SUBTYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          ) : (
            <div />
          )}

          <input
            type="number"
            min="1"
            step="1"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="border rounded-lg px-3 py-2"
            style={inputStyle}
            required
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Drop length (m)"
            value={dropLength}
            onChange={(e) => setDropLength(e.target.value)}
            className="border rounded-lg px-3 py-2"
            style={inputStyle}
            required
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="self-start px-4 py-2 rounded-lg font-medium text-black text-sm"
          style={{ backgroundColor: "var(--accent)" }}
        >
          Add Point
        </button>
      </form>
    </div>
  );
}