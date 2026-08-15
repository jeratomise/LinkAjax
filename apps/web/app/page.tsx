import Link from "next/link";
import { listApplications, listMd, readData } from "../lib/data";

export const dynamic = "force-dynamic";

export default function HomePage() {
  let queueCount = 0;
  let apps = 0;
  let intake = "";
  try {
    const index = JSON.parse(readData("queue/index.json"));
    queueCount = (index.posts || []).filter((p: { status: string }) => p.status === "pending").length;
    apps = listApplications().length;
    intake = readData("INTAKE.md");
  } catch {
    intake = "Data folder not found.";
  }
  const inbox = listMd("posts/inbox").length;

  return (
    <>
      <h1>AJAX</h1>
      <p className="lede">Job-first LinkedIn assistant. Suggestions stay in this repo. You paste. You approve. Live LinkedIn is never edited.</p>
      <div className="grid two">
        <div className="card">
          <h2>This week</h2>
          <p>{queueCount} draft{queueCount === 1 ? "" : "s"} waiting for approval.</p>
          <Link className="btn" href="/week">Review queue</Link>
        </div>
        <div className="card">
          <h2>Apply</h2>
          <p>{apps} tailored pack{apps === 1 ? "" : "s"} on disk.</p>
          <Link className="btn" href="/apply">Paste a JD</Link>
        </div>
        <div className="card">
          <h2>Profile</h2>
          <p>Recruiter headlines and About, generated from the snapshot.</p>
          <Link className="btn secondary" href="/profile">Open suggestions</Link>
        </div>
        <div className="card">
          <h2>Voice</h2>
          <p>{inbox} post{inbox === 1 ? "" : "s"} in inbox waiting to merge.</p>
          <Link className="btn secondary" href="/voice">Open voice</Link>
        </div>
      </div>
      <h2>Intake</h2>
      <div className="card md">{intake}</div>
    </>
  );
}
