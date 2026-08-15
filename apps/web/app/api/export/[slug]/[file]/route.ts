import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { dataDir } from "../../../../lib/data";

const ALLOWED = new Set([
  "resume.docx",
  "resume.pdf",
  "cover-letter.docx",
  "cover-letter.pdf",
  "resume.md",
  "cover-letter.md",
]);

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string; file: string }> }) {
  const { slug, file } = await ctx.params;
  if (!/^[a-z0-9-]+$/i.test(slug) || !ALLOWED.has(file)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const abs = path.join(dataDir(), "applications", slug, file);
  if (!fs.existsSync(abs)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const buf = fs.readFileSync(abs);
  const mime = file.endsWith(".pdf")
    ? "application/pdf"
    : file.endsWith(".docx")
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : "text/markdown; charset=utf-8";
  return new NextResponse(buf, {
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${slug}-${file}"`,
    },
  });
}
