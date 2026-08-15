"use client";

import { useState } from "react";

export function QueueItem({
  file,
  meta,
  body,
}: {
  file: string;
  meta: Record<string, string>;
  body: string;
}) {
  const [text, setText] = useState(body);
  const [status, setStatus] = useState(meta.status || "pending");
  const [msg, setMsg] = useState("");
  const [promptCopied, setPromptCopied] = useState(false);

  const imagePrompt = meta.image_prompt || "";
  const imageSize = meta.image_size || "1080x1080";

  async function save(next: string) {
    const res = await fetch("/api/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file, status: next, body: text }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Save failed");
      return;
    }
    setStatus(next);
    setMsg(next === "approved" ? "Approved. Paste into LinkedIn yourself." : `Marked ${next}.`);
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(imagePrompt);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    } catch {
      setMsg("Could not copy to clipboard");
    }
  }

  return (
    <div className="card queue-item">
      <div className="queue-header">
        <p className="meta">
          {file} · <span className="status-badge" data-status={status}>{status}</span> · {meta.theme || ""}
        </p>
        {meta.originality && <p className="meta originality">{meta.originality}</p>}
      </div>

      <div className="queue-content">
        <div className="post-section">
          <label className="section-label">Post copy</label>
          <textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} />
        </div>

        {imagePrompt && (
          <div className="image-section">
            <div className="image-header">
              <label className="section-label">Proposed image ({imageSize})</label>
              <button
                type="button"
                className="copy-prompt-btn"
                onClick={copyPrompt}
              >
                {promptCopied ? "Copied" : "Copy prompt"}
              </button>
            </div>
            <div className="image-prompt-preview">
              {imagePrompt}
            </div>
          </div>
        )}
      </div>

      <div className="queue-actions">
        <button type="button" onClick={() => save("approved")}>Approve</button>
        <button type="button" className="secondary" onClick={() => save("rejected")}>Reject</button>
        {msg && <span className="meta action-msg">{msg}</span>}
      </div>
    </div>
  );
}
