"use client";

import { useState } from "react";

export function MergeButton({ disabled }: { disabled: boolean }) {
  const [msg, setMsg] = useState("");
  async function run() {
    const res = await fetch("/api/voice/merge", { method: "POST" });
    const data = await res.json();
    setMsg(res.ok ? `Merged ${data.moved?.length || 0} file(s). Reload to see voice.md.` : data.error || "Merge failed");
    if (res.ok) window.location.reload();
  }
  return (
    <p>
      <button type="button" onClick={run} disabled={disabled}>Merge inbox into voice</button>
      {msg ? <span className="meta"> {msg}</span> : null}
    </p>
  );
}
