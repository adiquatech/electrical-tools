"use client";

export default function DownloadPdfButton({ projectId }: { projectId: string }) {
  async function download() {
    const res = await fetch(`/api/projects/${projectId}/boq/pdf`);
    if (!res.ok) {
      alert("Could not generate PDF.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1]
      ?? "BOQ.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" onClick={download} className="btn-primary text-sm">
      Download PDF
    </button>
  );
}