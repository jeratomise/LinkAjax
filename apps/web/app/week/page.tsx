import { listMd, readData } from "../../lib/data";
import { QueueItem } from "./ui";

export const dynamic = "force-dynamic";

function splitFront(raw: string) {
  if (!raw.startsWith("---")) return { meta: {}, body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { meta: {}, body: raw };
  const yaml = raw.slice(4, end);
  const meta: Record<string, string> = {};
  for (const line of yaml.split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: raw.slice(end + 4).trim() };
}

export default function WeekPage() {
  let brief = "No weekly brief yet. Run npm run weekly-pack or the Sunday Cloud Agent.";
  try {
    const files = listMd("research/weekly");
    if (files.length) brief = files.sort((a, b) => b.name.localeCompare(a.name))[0].text;
  } catch {
    brief = "Research folder missing.";
  }
  const posts = listMd("queue").map((f) => ({ name: f.name, ...splitFront(f.text) }));
  let creators = "";
  const creatorBlock = brief.split("## Creators to watch")[1];
  if (creatorBlock) creators = creatorBlock.split("## Integrity")[0].trim();

  return (
    <>
      <h1>This week</h1>
      <p className="lede">Approve drafts here, then paste into LinkedIn yourself. AJAX does not publish.</p>
      <h2>Trends</h2>
      <div className="card md">{brief.split("## Creators to watch")[0]}</div>
      {creators ? (
        <>
          <h2>Creators to watch</h2>
          <div className="card md">{creators}</div>
        </>
      ) : null}
      <h2>Queue</h2>
      {posts.length === 0 ? <p className="meta">Queue empty.</p> : null}
      {posts.map((p) => (
        <QueueItem key={p.name} file={p.name} meta={p.meta} body={p.body} />
      ))}
    </>
  );
}
