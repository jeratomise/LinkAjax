"use client";

import { useState } from "react";

export function ApplyForm() {
  const [jd, setJd] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pack, setPack] = useState<{ slug: string; role: string } | null>(null);

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
        <p>
          Ready for {pack.role}.{" "}
          <a href={`/api/export/${pack.slug}/resume.pdf`}>Download resume</a>
          {" · "}
          <a href={`/api/export/${pack.slug}/cover-letter.pdf`}>Download cover letter</a>
        </p>
      ) : null}
    </form>
  );
}
