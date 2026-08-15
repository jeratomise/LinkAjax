import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export const repoRoot = path.resolve(here, "..");

export function dataDir() {
  if (process.env.AJAX_DATA_DIR) return path.resolve(process.env.AJAX_DATA_DIR);
  const candidates = [
    path.resolve(process.cwd(), ".ajax/data"),
    path.resolve(process.cwd(), "data"),
    path.resolve(process.cwd(), "../../data"),
    path.join(repoRoot, "data"),
    path.join(here, "../data"),
  ];
  return candidates.find((p) => fs.existsSync(p)) || candidates[0];
}

export function writableDir() {
  if (process.env.VERCEL) return path.join(os.tmpdir(), "ajax-data");
  return dataDir();
}

export function readUtf8(relOrAbs) {
  const abs = path.isAbsolute(relOrAbs) ? relOrAbs : path.join(dataDir(), relOrAbs);
  return fs.readFileSync(abs, "utf8");
}

export function writeUtf8(relOrAbs, contents) {
  const abs = path.isAbsolute(relOrAbs) ? relOrAbs : path.join(dataDir(), relOrAbs);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, contents, "utf8");
  return abs;
}

export function listFiles(rel, ext = ".md") {
  const dir = path.join(dataDir(), rel);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(ext) && name.toLowerCase() !== "readme.md")
    .map((name) => path.join(dir, name));
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function todayUk() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}
