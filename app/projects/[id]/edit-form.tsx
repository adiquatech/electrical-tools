"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProjectForm({ project }: { project: any }) {
  const [clientName, setClientName] = useState(project.clientName);
  const [siteAddress, setSiteAddress] = useState(project.siteAddress ?? "");

async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    await fetch(`/api/projects/${project.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientName,
        siteAddress,
      }),
    });
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project? This action cannot be undone."
    );
    if (confirmed) {
      await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="clientName">Client Name:</label>
        <input
          id="clientName"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="siteAddress">Site Address:</label>
        <input
          id="siteAddress"
          value={siteAddress}
          onChange={(e) => setSiteAddress(e.target.value)}
        />
      </div>
      <button type="submit">Save Changes</button>
    </form>
  );
}