import { listApplications } from "@/lib/data";
import { createClient, getUser } from "@/lib/supabase/server";
import { ApplyForm, ResumeUpload } from "./ui";

export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const user = await getUser();
  const supabase = await createClient();

  // Get applications from both Supabase and file system
  const filePacks = listApplications();
  
  let dbPacks: typeof filePacks = [];
  if (user) {
    const { data } = await supabase
      .from("applications")
      .select("slug, role, company, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (data) {
      dbPacks = data.map((p) => ({
        slug: p.slug,
        role: p.role || "",
        company: p.company || "",
        created: p.created_at?.split("T")[0] || "",
      }));
    }
  }

  // Merge, preferring database records
  const dbSlugs = new Set(dbPacks.map((p) => p.slug));
  const packs = [
    ...dbPacks,
    ...filePacks.filter((p) => !dbSlugs.has(p.slug)),
  ];
  return (
    <>
      <h1>Apply</h1>
      <p className="lede">Paste a job description. AJAX tailors a cover letter and resume from your master CV. It does not invent facts and does not edit LinkedIn.</p>
      <ResumeUpload />
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
