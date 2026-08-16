"use client";

import { useState, useEffect, useCallback } from "react";

type Pack = {
  slug: string;
  role: string;
  files?: Record<string, string | null>;
};

type ResumeInfo = {
  cvExists: boolean;
  cvUpdated: string;
  pdfExists: boolean;
  source: string;
  warning?: string;
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

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ResumeUpload({ onUpdate }: { onUpdate?: () => void }) {
  const [info, setInfo] = useState<ResumeInfo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchInfo = useCallback(async () => {
    try {
      const res = await fetch("/api/upload-resume");
      if (res.ok) {
        setInfo(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch resume info:", e);
    }
  }, []);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      setInfo(data);
      setSuccess(`Resume updated from ${file.name}`);
      if (data.warning) {
        setError(data.warning);
      }
      onUpdate?.();
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="card resume-source">
      <h3>Source of truth</h3>
      {info?.cvExists ? (
        <div className="resume-info">
          <p className="source-line">
            <span className="status-dot active" /> Master CV loaded
          </p>
          {info.source && <p className="meta">{info.source}</p>}
          {info.cvUpdated && (
            <p className="meta">Last updated: {formatDate(info.cvUpdated)}</p>
          )}
        </div>
      ) : (
        <p className="meta">No master CV found. Upload your resume to enable tailored generation.</p>
      )}
      
      <label className="upload-label">
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleUpload}
          disabled={uploading}
          style={{ display: "none" }}
        />
        <span className={`button secondary ${uploading ? "disabled" : ""}`}>
          {uploading ? "Uploading..." : info?.cvExists ? "Replace resume" : "Upload resume"}
        </span>
      </label>
      <p className="meta upload-hint">PDF or Word document. Text will be extracted into the master CV.</p>
      
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
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
      <textarea id="jd" rows={12} value={jd} onChange={(e) => setJd(e.target.value)} required placeholder="Paste the JD here. Include the role title and company if possible." />
      <p className="meta jd-hint">
        Tip: Include a ## Role and ## Company heading for better targeting. AJAX will extract keywords and tailor the resume and cover letter from your master CV.
      </p>
      <p>
        <button type="submit" disabled={busy}>{busy ? "Tailoring..." : "Generate pack"}</button>
      </p>
      {error ? <p className="error">{error}</p> : null}
      {pack ? (
        <div className="pack-result">
          <p className="success">Pack ready for {pack.role}</p>
          <p className="downloads">
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
          <p className="meta">Every fact in the generated pack comes from the master CV and snapshot. Nothing was invented.</p>
        </div>
      ) : null}
    </form>
  );
}
