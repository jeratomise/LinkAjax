import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { dataDir } from "@/lib/data";

export async function POST(req: Request) {
  const { file, status, body } = await req.json();
  if (!file || String(file).includes("..") || !String(file).endsWith(".md")) {
    return NextResponse.json({ error: "Bad file" }, { status: 400 });
  }
  const abs = path.join(dataDir(), "queue", file);
  if (!fs.existsSync(abs)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const current = fs.readFileSync(abs, "utf8");
  let next = current;
  if (current.startsWith("---")) {
    const end = current.indexOf("\n---", 3);
    let yaml = current.slice(0, end);
    yaml = yaml.replace(/^status:.*$/m, `status: ${status}`);
    next = `${yaml}\n---\n\n${body || current.slice(end + 4).trim()}\n`;
  }
  fs.writeFileSync(abs, next, "utf8");

  const indexPath = path.join(dataDir(), "queue/index.json");
  if (fs.existsSync(indexPath)) {
    const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
    index.posts = (index.posts || []).map((p: { file: string; status: string }) =>
      p.file === file ? { ...p, status } : p,
    );
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2) + "\n");
  }
  return NextResponse.json({ ok: true, status });
}
