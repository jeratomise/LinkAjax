import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";

function applyHref() {
  const candidates = [
    path.resolve(process.cwd(), ".ajax/lib/apply.mjs"),
    path.resolve(process.cwd(), "../../lib/apply.mjs"),
    path.resolve(process.cwd(), "lib/apply.mjs"),
    path.resolve(process.cwd(), "../lib/apply.mjs"),
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) throw new Error("apply module not found");
  return pathToFileURL(found).href;
}

function asBase64(filePath: string) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath).toString("base64");
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { jd } = await req.json();
  if (!jd || String(jd).trim().length < 40) {
    return NextResponse.json({ error: "Paste a fuller job description." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("cv_text")
    .eq("id", user.id)
    .single();

  if (!profile?.cv_text) {
    return NextResponse.json(
      { error: "Please upload your CV first on the Profile page before generating applications." },
      { status: 400 }
    );
  }

  const mod = await import(applyHref());
  const result = await mod.applyFromJd(String(jd), { cvOverride: profile.cv_text });

  // Store application in database
  await supabase.from("applications").upsert({
    user_id: user.id,
    slug: result.slug,
    role: result.role,
    company: result.company,
    jd_text: String(jd),
    cover_letter_md: result.files?.letterMd || null,
    resume_md: result.files?.resumeMd || null,
  });

  return NextResponse.json({
    slug: result.slug,
    role: result.role,
    company: result.company,
    files: {
      "resume.pdf": asBase64(result.files?.resumePdf),
      "resume.docx": asBase64(result.files?.resumeDocx),
      "cover-letter.pdf": asBase64(result.files?.letterPdf),
      "cover-letter.docx": asBase64(result.files?.letterDocx),
    },
  });
}
