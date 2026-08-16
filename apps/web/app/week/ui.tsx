"use client";

import { useState } from "react";

function formatRelativeTime(): string {
  const hours = Math.floor(Math.random() * 23) + 1;
  return hours < 24 ? `${hours}h` : "1d";
}

const STATUS_NOTE: Record<string, string> = {
  pending: "Back in the queue.",
  approved: "Approved. Paste into LinkedIn yourself, then mark Posted.",
  rejected: "Rejected. It stays on file so you can review later.",
  posted: "Marked posted. AJAX still does not publish for you.",
};

export function QueueItem({
  file,
  meta,
  body,
  onStatus,
}: {
  file: string;
  meta: Record<string, string>;
  body: string;
  onStatus?: (file: string, status: string) => void;
}) {
  const [text, setText] = useState(body);
  const [status, setStatus] = useState(meta.status || "pending");
  const [msg, setMsg] = useState("");
  const [promptCopied, setPromptCopied] = useState(false);
  const [postCopied, setPostCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const imagePrompt = meta.image_prompt || "";
  const imageUrl = meta.image_url || "";

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
    onStatus?.(file, next);
    setMsg(STATUS_NOTE[next] || `Marked ${next}.`);
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

  async function copyPost() {
    try {
      await navigator.clipboard.writeText(text);
      setPostCopied(true);
      setTimeout(() => setPostCopied(false), 2000);
    } catch {
      setMsg("Could not copy to clipboard");
    }
  }

  return (
    <div className="linkedin-post">
      <div className="post-author">
        <div className="author-avatar">JN</div>
        <div className="author-info">
          <span className="author-name">Jerome Ng</span>
          <span className="author-headline">APAC Server & Cloud Marketing at AMD</span>
          <span className="post-time">{formatRelativeTime()}</span>
        </div>
        <span className="status-badge" data-status={status}>{status}</span>
      </div>

      <div className="post-body">{text}</div>

      {imageUrl && (
        <div className="post-image">
          <img src={imageUrl} alt={meta.theme || "Post image"} />
        </div>
      )}

      <div className="post-engagement">
        <span className="engagement-item">
          <span className="like-icons">👍❤️</span> 47
        </span>
        <span className="engagement-item">12 comments</span>
      </div>

      <div className="post-actions-bar">
        <button type="button" className="action-btn" onClick={copyPost}>
          {postCopied ? "Copied!" : "Copy post"}
        </button>
        <button type="button" className="action-btn" onClick={() => setEditOpen(!editOpen)}>
          {editOpen ? "Hide draft" : "Edit draft"}
        </button>
        {imagePrompt && (
          <button type="button" className="action-btn" onClick={copyPrompt}>
            {promptCopied ? "Copied!" : "Copy image prompt"}
          </button>
        )}
      </div>

      <div className="status-actions" aria-label="Draft status">
        <button type="button" className={status === "pending" ? "is-current" : ""} onClick={() => save("pending")}>
          Pending
        </button>
        <button type="button" className={status === "approved" ? "is-current" : ""} onClick={() => save("approved")}>
          Approve
        </button>
        <button type="button" className={status === "rejected" ? "is-current" : ""} onClick={() => save("rejected")}>
          Reject
        </button>
        <button type="button" className={status === "posted" ? "is-current" : ""} onClick={() => save("posted")}>
          Posted
        </button>
        {msg && <span className="meta action-msg">{msg}</span>}
      </div>

      {editOpen && (
        <div className="edit-disclosure">
          <div className="edit-meta">
            <span className="meta">{file} · {meta.theme || ""}</span>
            {meta.originality && <span className="meta originality">{meta.originality}</span>}
          </div>
          <textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} />
          <div className="queue-actions">
            <button type="button" onClick={() => save(status || "pending")}>Save copy</button>
            {msg && <span className="meta action-msg">{msg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export interface Creator {
  name: string;
  initials: string;
  photoUrl?: string;
  where: string;
  why: string;
  topPost?: { title: string; excerpt: string; url: string };
  recentPost?: { title: string; excerpt: string; url: string };
}

export function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <div className="creator-card">
      <div className="creator-header">
        {creator.photoUrl ? (
          <img src={creator.photoUrl} alt={creator.name} className="creator-photo" />
        ) : (
          <div className="creator-initials">{creator.initials}</div>
        )}
        <div className="creator-info">
          <span className="creator-name">{creator.name}</span>
          <span className="creator-where">{creator.where}</span>
        </div>
      </div>
      <p className="creator-why">{creator.why}</p>
      
      {creator.topPost && (
        <div className="creator-post">
          <span className="post-label">Top post</span>
          <a href={creator.topPost.url} target="_blank" rel="noopener noreferrer" className="post-link">
            <strong>{creator.topPost.title}</strong>
            <span className="post-excerpt">{creator.topPost.excerpt}</span>
          </a>
        </div>
      )}
      
      {creator.recentPost && (
        <div className="creator-post">
          <span className="post-label">Recent</span>
          <a href={creator.recentPost.url} target="_blank" rel="noopener noreferrer" className="post-link">
            <strong>{creator.recentPost.title}</strong>
            <span className="post-excerpt">{creator.recentPost.excerpt}</span>
          </a>
        </div>
      )}
    </div>
  );
}

export function CreatorsGrid({ creators }: { creators: Creator[] }) {
  return (
    <div className="creators-grid">
      {creators.map((c) => (
        <CreatorCard key={c.name} creator={c} />
      ))}
    </div>
  );
}
