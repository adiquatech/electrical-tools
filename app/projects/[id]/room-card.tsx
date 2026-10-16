"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import UnitInput from "./unit-input";
import { toMetres, type Unit } from "@/lib/units";

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
  active?: boolean;
  points: PointData[];
};

const TYPE_LABELS: Record<string, string> = {
  LIGHT: "Light",
  SWITCH: "Switch",
  SOCKET: "Socket",
  AC: "AC point",
  TV: "TV point",
  KITCHEN_COOKER: "Cooker point",
  SECURITY_LIGHT: "Security light",
  PUMP: "Pumping machine",
  WATER_HEATER: "Water heater",
  WASHING_MACHINE: "Washing machine",
  OTHER: "Other",
};

const SUBTYPE_LABELS: Record<string, string> = {
  CENTER: "Centre light",
  WALL_BRACKET: "Wall bracket",
  POP: "POP light",
};

export default function RoomCard({ room }: { room: RoomData }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
const [menuOpen, setMenuOpen] = useState(false);
const menuRef = useRef<HTMLDivElement>(null);

// Add form
const [type, setType] = useState("LIGHT");
const [subtype, setSubtype] = useState("CENTER");
const [quantity, setQuantity] = useState("1");
const [dropLength, setDropLength] = useState("");
const [unit, setUnit] = useState<Unit>("m");
const [error, setError] = useState("");

// Edit form
const [editingId, setEditingId] = useState<string | null>(null);
const [editType, setEditType] = useState("LIGHT");
const [editSubtype, setEditSubtype] = useState("CENTER");
const [editQuantity, setEditQuantity] = useState("1");
const [editDrop, setEditDrop] = useState("");
const [editUnit, setEditUnit] = useState<Unit>("m");
const [editError, setEditError] = useState("");

  const isActive = room.active !== false;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function addPoint(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/rooms/${room.id}/points`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: editType,
        subtype: editSubtype,
        quantity: parseInt(editQuantity),
        dropLength: toMetres(editDrop, editUnit),
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setEditError(data?.error ?? "Could not add the point.");
      return;
    }
    setEditError("");
    setEditQuantity("1");
    setEditDrop("");
    setEditUnit("m");
    router.refresh();
  }

  async function deletePoint(pointId: string) {
    await fetch(`/api/points/${pointId}`, { method: "DELETE" });
    router.refresh();
  }

  async function deleteRoom() {
    setMenuOpen(false);
    if (!window.confirm(`Delete "${room.name}" and all its points?`)) return;
    await fetch(`/api/rooms/${room.id}`, { method: "DELETE" });
    router.refresh();
  }

  async function duplicateRoom() {
    setMenuOpen(false);
    const res = await fetch(`/api/rooms/${room.id}/duplicate`, { method: "POST" });
    if (!res.ok) {
      alert("Could not duplicate the room.");
      return;
    }
    router.refresh();
  }

  async function toggleActive() {
    setMenuOpen(false);
    await fetch(`/api/rooms/${room.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !isActive }),
    });
    router.refresh();
  }

  async function renameRoom() {
  setMenuOpen(false);
  const next = window.prompt("Room name", room.name);
  if (next === null) return;
  const name = next.trim();
  if (!name || name === room.name) return;

  const res = await fetch(`/api/rooms/${room.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    alert("Could not rename the room.");
    return;
  }
  router.refresh();
}
  async function startEdit(point: PointData) {
  setEditingId(point.id);
  setEditType(point.type);
  setEditSubtype(point.subtype ?? "CENTER");
  setEditQuantity(String(point.quantity));
  setEditDrop(String(point.dropLength));
  setEditUnit("m");
  setEditError("");
}

async function savePoint(e: React.FormEvent) {
  e.preventDefault();
  if (!editingId) return;

  const res = await fetch(`/api/points/${editingId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: editType,
      subtype: editSubtype,
      quantity: editQuantity,
      dropLength: toMetres(editDrop, editUnit),
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    setEditError(data?.error ?? "Could not update the point.");
    return;
  }

  setEditingId(null);
  router.refresh();
}
  return (
    <div
      className="card overflow-visible"
      style={{ opacity: isActive ? 1 : 0.5 }}
    >
      {/* ── Compact header only ── */}
      <div
        className="flex items-start justify-between gap-2 p-4 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0">
          <h3 className="font-semibold truncate">
            {room.name}
            {!isActive && (
              <span className="ml-2 text-xs font-normal" style={{ color: "var(--muted)" }}>
                inactive
              </span>
            )}
          </h3>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {room.distanceFromDB} m from DB · {room.points.length} point
            {room.points.length !== 1 ? "s" : ""}
            <span className="ml-1">{expanded ? "▴" : "▾"}</span>
          </p>
        </div>

        {/* 3-dots — stopPropagation so it doesn't toggle expand */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="btn-ghost w-9 h-9 flex items-center justify-center text-xl leading-none"
            aria-label="Room options"
          >
            ⋮
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-10 z-20 w-44 card shadow-xl overflow-hidden text-sm"
              style={{ borderColor: "var(--border-strong)" }}
            >
              
              <button
                type="button"
                className="block w-full text-left px-3 py-2.5 hover:bg-[var(--card-hover)]"
                onClick={(e) => {
                  e.stopPropagation();
                  renameRoom();
                }}
              >
                Rename room
              </button>
              
              <button
                type="button"
                className="block w-full text-left px-3 py-2.5 hover:bg-[var(--card-hover)]"
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateRoom();
                }}
              >
                Duplicate room
              </button>
              <button
                type="button"
                className="block w-full text-left px-3 py-2.5 hover:bg-[var(--card-hover)]"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleActive();
                }}
              >
                {isActive ? "Make inactive" : "Make active"}
              </button>
              <button
                type="button"
                className="block w-full text-left px-3 py-2.5 btn-danger hover:bg-[var(--card-hover)]"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteRoom();
                }}
              >
                Delete room
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Details only when expanded ── */}
      {expanded && (
        <div
          className="px-4 pb-4 flex flex-col gap-4 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          {room.points.length === 0 ? (
            <p className="text-sm pt-3" style={{ color: "var(--muted)" }}>
              No points yet. Add one below.
            </p>
          ) : (
            <ul className="flex flex-col pt-1">
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
                      {" "}· drop {point.dropLength} m
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => deletePoint(point.id)}
                    className="btn-danger text-sm"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          {room.points.map((point) =>
  editingId === point.id ? (
    <li key={point.id} className="py-3 border-b" style={{ borderColor: "var(--border)" }}>
      <form onSubmit={savePoint} className="flex flex-col gap-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <select
            value={editType}
            onChange={(e) => setEditType(e.target.value)}
            className="input-field"
          >
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {editType === "LIGHT" ? (
            <select
              value={editSubtype}
              onChange={(e) => setEditSubtype(e.target.value)}
              className="input-field"
            >
              {Object.entries(SUBTYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          ) : (
            <div className="hidden sm:block" />
          )}
          <input
            type="number"
            min="1"
            step="1"
            value={editQuantity}
            onChange={(e) => setEditQuantity(e.target.value)}
            className="input-field"
            required
          />
          <UnitInput
            value={editDrop}
            onValueChange={setEditDrop}
            unit={editUnit}
            onUnitChange={setEditUnit}
            placeholder="Drop length"
          />
        </div>
        {editError && (
          <p className="text-sm" style={{ color: "var(--danger)" }}>{editError}</p>
        )}
        <div className="flex gap-2">
          <button type="submit" className="btn-primary text-sm">Save</button>
          <button
            type="button"
            className="btn-ghost text-sm"
            onClick={() => setEditingId(null)}
          >
            Cancel
          </button>
        </div>
      </form>
    </li>
  ) : (
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
        <span style={{ color: "var(--muted)" }}> · drop {point.dropLength} m</span>
      </span>
      <div className="flex gap-3 shrink-0">
        <button
          type="button"
          onClick={() => startEdit(point)}
          className="text-sm"
          style={{ color: "var(--accent)" }}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => deletePoint(point.id)}
          className="btn-danger text-sm"
        >
          Remove
        </button>
      </div>
    </li>
  )
)}

         
        </div>
      )}
    </div>
  );
}