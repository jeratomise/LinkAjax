import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { NextResponse } from "next/server";

function applyHref() {
  const candidates = [
    path.resolve(process.cwd(), "../../lib/apply.mjs"),
    path.resolve(process.cwd(), "lib/apply.mjs"),
    path.resolve(process.cwd(), "../lib/apply.mjs"),
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) throw new Error("apply module not found");
  return pathToFileURL(found).href;
}

export async function POST(req: Request) {
  const { jd } = await req.json();
  if (!jd || String(jd).trim().length < 40) {
    return NextResponse.json({ error: "Paste a fuller job description." }, { status: 400 });
  }
  const mod = await import(applyHref());
  const result = await mod.applyFromJd(String(jd));
  return NextResponse.json({
    slug: result.slug,
    role: result.role,
    company: result.company,
  });
}
