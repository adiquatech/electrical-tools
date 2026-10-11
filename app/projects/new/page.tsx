"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [safetyMarginPercent, setSafetyMarginPercent] = useState("10");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientName, siteAddress, safetyMarginPercent }),
    });

    if (!res.ok) {
      alert("Could not create the project. Please try again.");
      return;
    }

    router.push("/projects");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Create New Project</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-4">
          <label htmlFor="clientName" className="block text-sm font-medium" style={{ color: "var(--muted)" }}>
            Client Name
          </label>
          <input
            type="text"
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="mt-1 block w-full border rounded-lg px-3 py-2 bg-transparent"
            style={{borderColor: "var(--border)"}}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="siteAddress" className="block text-sm font-medium" style={{ color: "var(--muted)" }}>
            Site Address
          </label>
          <input
            type="text"
            id="siteAddress"
            value={siteAddress}
            onChange={(e) => setSiteAddress(e.target.value)}
            className="mt-1 block w-full border rounded-lg px-3 py-2 bg-transparent"
            style={{borderColor: "var(--border)"}}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="safetyMarginPercent" className="block text-sm font-medium" style={{ color: "var(--muted)" }}>
            Safety Margin (%)
          </label>
          <input
            type="number"
            id="safetyMarginPercent"
            value={safetyMarginPercent}
            onChange={(e) => setSafetyMarginPercent(e.target.value)}
            className="mt-1 block w-full border rounded-lg px-3 py-2 bg-transparent"
            style={{borderColor: "var(--border)"}}
            required
          />
        </div>
        <button
          type="submit"
          className="font-bold py-2 px-4 rounded"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Create Project
        </button>
      </form>
    </div>
  );
}