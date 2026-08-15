import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { NextResponse } from "next/server";

export async function POST() {
  const candidates = [
    path.resolve(process.cwd(), "../../lib/voice-merge.mjs"),
    path.resolve(process.cwd(), "lib/voice-merge.mjs"),
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) return NextResponse.json({ error: "voice-merge module missing" }, { status: 500 });
  const mod = await import(pathToFileURL(found).href);
  const result = mod.mergeVoice();
  return NextResponse.json(result);
}
