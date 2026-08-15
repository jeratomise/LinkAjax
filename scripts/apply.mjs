#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { applyFromJd } from "../lib/apply.mjs";
import { exportApplication } from "../lib/export-docs.mjs";

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : null;
}

const dir = arg("--dir");
const jdPath = arg("--jd");

if (dir) {
  const resumeMd = fs.readFileSync(path.join(dir, "resume.md"), "utf8");
  const letter = fs.readFileSync(path.join(dir, "cover-letter.md"), "utf8");
  const meta = JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf8"));
  const files = await exportApplication(dir, { resumeMd, letter, role: meta.role, company: meta.company });
  console.log(JSON.stringify({ dir, files }, null, 2));
  process.exit(0);
}

if (!jdPath) {
  console.error("Usage: npm run apply -- --jd path/to/jd.md");
  console.error("       npm run apply -- --dir data/applications/<slug>");
  process.exit(1);
}

const jd = fs.readFileSync(jdPath, "utf8");
const result = await applyFromJd(jd);
console.log("LinkedIn unchanged. Files:");
console.log(JSON.stringify(result, null, 2));
