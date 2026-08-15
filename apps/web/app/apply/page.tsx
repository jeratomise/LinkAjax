import { listApplications } from "../../lib/data";
import { ApplyForm } from "./ui";

export const dynamic = "force-dynamic";

export default function ApplyPage() {
  const packs = listApplications();
  return (
    <>
      <h1>Apply</h1>
      <p className="lede">Paste a job description. AJAX tailors a cover letter and resume from the snapshot. It does not invent facts and does not edit LinkedIn.</p>
      <ApplyForm />
      <h2>Packs</h2>
      {packs.length === 0 ? (
        <p className="meta">No applications yet. Try the example JD in the repo: data/applications/_example/jd.md</p>
      ) : (
        packs.map((p) => (
          <div className="card" key={p.slug}>
            <strong>{p.role || p.slug}</strong>
            <p className="meta">{p.company} · {p.created} · {p.slug}</p>
            <p className="downloads">
              <a href={`/api/export/${p.slug}/cover-letter.docx`}>Cover letter docx</a>
              <a href={`/api/export/${p.slug}/cover-letter.pdf`}>Cover letter pdf</a>
              <a href={`/api/export/${p.slug}/resume.docx`}>Resume docx</a>
              <a href={`/api/export/${p.slug}/resume.pdf`}>Resume pdf</a>
            </p>
          </div>
        ))
      )}
    </>
  );
}
