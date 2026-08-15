"use client";

import { useState } from "react";

type Pack = {
  slug: string;
  role: string;
  files?: Record<string, string | null>;
};

function downloadBase64(name: string, b64: string, mime: string) {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function ApplyForm() {
  const [jd, setJd] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pack, setPack] = useState<Pack | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setPack(null);
    const res = await fetch("/api/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jd }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Apply failed");
      return;
    }
    setPack(data);
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <label htmlFor="jd">Job description</label>
      <textarea id="jd" rows={12} value={jd} onChange={(e) => setJd(e.target.value)} required placeholder="Paste the JD here" />
      <p>
        <button type="submit" disabled={busy}>{busy ? "Tailoring…" : "Generate pack"}</button>
      </p>
      {error ? <p className="error">{error}</p> : null}
      {pack ? (
        <p className="downloads">
          Ready for {pack.role}.{" "}
          {pack.files?.["resume.pdf"] ? (
            <button type="button" className="secondary" onClick={() => downloadBase64(`${pack.slug}-resume.pdf`, pack.files!["resume.pdf"]!, "application/pdf")}>Resume PDF</button>
          ) : null}{" "}
          {pack.files?.["cover-letter.pdf"] ? (
            <button type="button" className="secondary" onClick={() => downloadBase64(`${pack.slug}-cover-letter.pdf`, pack.files!["cover-letter.pdf"]!, "application/pdf")}>Cover letter PDF</button>
          ) : null}{" "}
          {pack.files?.["resume.docx"] ? (
            <button type="button" className="secondary" onClick={() => downloadBase64(`${pack.slug}-resume.docx`, pack.files!["resume.docx"]!, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}>Resume Word</button>
          ) : null}{" "}
          {pack.files?.["cover-letter.docx"] ? (
            <button type="button" className="secondary" onClick={() => downloadBase64(`${pack.slug}-cover-letter.docx`, pack.files!["cover-letter.docx"]!, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}>Cover letter Word</button>
          ) : null}
        </p>
      ) : null}
    </form>
  );
}
