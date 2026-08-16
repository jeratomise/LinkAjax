"use client";

import { useMemo, useState } from "react";
import { QueueItem } from "./ui";

export type QueuePost = {
  name: string;
  meta: Record<string, string>;
  body: string;
};

export type Pillar = {
  id: string;
  label: string;
  blurb: string;
  keywords?: string[];
};

const STATUSES = ["all", "pending", "approved", "rejected", "posted"] as const;
type StatusFilter = (typeof STATUSES)[number];

function countBy(posts: QueuePost[], status: string) {
  return posts.filter((p) => (p.meta.status || "pending") === status).length;
}

export function WeekBoard({
  posts: initialPosts,
  pillars,
  recommendedId,
}: {
  posts: QueuePost[];
  pillars: Pillar[];
  recommendedId: string;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [pillarId, setPillarId] = useState(recommendedId || pillars[0]?.id || "");
  const [status, setStatus] = useState<StatusFilter>("all");

  const pillar = pillars.find((p) => p.id === pillarId) || pillars[0];
  const inTheme = useMemo(
    () => posts.filter((p) => (p.meta.pillar || "") === pillar?.id),
    [posts, pillar],
  );
  const visible = status === "all" ? inTheme : inTheme.filter((p) => (p.meta.status || "pending") === status);

  function onStatus(file: string, next: string) {
    setPosts((current) =>
      current.map((p) => (p.name === file ? { ...p, meta: { ...p.meta, status: next } } : p)),
    );
  }

  return (
    <div className="week-board">
      <p className="lede">Approve drafts here, then paste into LinkedIn yourself. AJAX does not publish.</p>

      <div className="theme-tabs" role="tablist" aria-label="Content themes">
        {pillars.map((p) => {
          const n = posts.filter((post) => post.meta.pillar === p.id).length;
          const active = p.id === pillar?.id;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`theme-tab${active ? " is-active" : ""}`}
              onClick={() => setPillarId(p.id)}
            >
              <span className="theme-tab-label">{p.label}</span>
              <span className="theme-tab-meta">
                {n} draft{n === 1 ? "" : "s"}
                {p.id === recommendedId ? " · recommended" : ""}
              </span>
            </button>
          );
        })}
      </div>

      {pillar && (
        <p className="theme-blurb">
          {pillar.blurb}
          {pillar.id === recommendedId
            ? " This week's trend brief points here, so this tab is recommended."
            : ""}
        </p>
      )}

      <div className="status-tabs" role="tablist" aria-label="Draft status">
        {STATUSES.map((s) => {
          const n = s === "all" ? inTheme.length : countBy(inTheme, s);
          return (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={status === s}
              className={`status-tab${status === s ? " is-active" : ""}`}
              onClick={() => setStatus(s)}
            >
              {s === "all" ? "All" : s}
              <span className="status-tab-count">{n}</span>
            </button>
          );
        })}
      </div>

      <h2>Post queue</h2>
      {visible.length === 0 ? (
        <p className="meta empty-theme">
          {inTheme.length === 0
            ? "No drafts in this theme yet. When the weekly pack matches this trend, AJAX will write them here."
            : `No ${status} drafts in this theme.`}
        </p>
      ) : null}
      {visible.map((p) => (
        <QueueItem key={p.name} file={p.name} meta={p.meta} body={p.body} onStatus={onStatus} />
      ))}
    </div>
  );
}
