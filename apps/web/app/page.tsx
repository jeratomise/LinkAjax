import Link from "next/link";
import { listApplications, listMd } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function HomePage() {
  let queueCount = 0;
  let apps = 0;
  try {
    queueCount = listMd("queue").filter((f) => {
      const match = f.text.match(/^status:\s*(\w+)/m);
      return (match?.[1] || "pending") === "pending";
    }).length;
    apps = listApplications().length;
  } catch {
    // Data folder not yet initialised
  }
  const inbox = listMd("posts/inbox").length;

  return (
    <div className="home">
      <div className="hero">
        <h1>Job-first LinkedIn for Jerome Ng</h1>
        <p className="tagline">
          AJAX drafts posts, rewrites your profile, and tailors applications.
          You approve. You paste. Live LinkedIn is never touched.
        </p>
      </div>

      <div className="doors">
        <Link href="/week" className="door primary">
          <span className="door-label">Content</span>
          <span className="door-title">This week</span>
          <span className="door-desc">
            Review drafted posts. Approve what works, reject what does not.
          </span>
          {queueCount > 0 && (
            <span className="door-stat">{queueCount} draft{queueCount === 1 ? "" : "s"} waiting</span>
          )}
        </Link>

        <Link href="/apply" className="door">
          <span className="door-label">Applications</span>
          <span className="door-title">Paste a JD</span>
          <span className="door-desc">
            Get a tailored CV, cover letter, and recruiter note from the job description.
          </span>
          {apps > 0 && (
            <span className="door-stat">{apps} pack{apps === 1 ? "" : "s"} on disk</span>
          )}
        </Link>

        <Link href="/profile" className="door">
          <span className="door-label">Profile</span>
          <span className="door-title">Headlines and About</span>
          <span className="door-desc">
            Recruiter-first suggestions generated from your snapshot.
          </span>
        </Link>

        <Link href="/voice" className="door">
          <span className="door-label">Voice</span>
          <span className="door-title">How you sound</span>
          <span className="door-desc">
            Train the voice model from your existing posts.
          </span>
          {inbox > 0 && (
            <span className="door-stat">{inbox} post{inbox === 1 ? "" : "s"} in inbox</span>
          )}
        </Link>
      </div>

      <p className="trust-line">
        AJAX does not post to LinkedIn. It does not scrape. It does not store cookies.
      </p>
    </div>
  );
}
