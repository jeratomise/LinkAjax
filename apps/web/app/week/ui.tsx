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

  return (
    <div className="card">
      <p className="meta">
        {file} · {status} · {meta.theme || ""} · {meta.originality || ""}
      </p>
      <textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} />
      <p>
        <button type="button" onClick={() => save("approved")}>Approve</button>{" "}
        <button type="button" className="secondary" onClick={() => save("rejected")}>Reject</button>
        {msg ? <span className="meta"> {msg}</span> : null}
      </p>
    </div>
  );
}
