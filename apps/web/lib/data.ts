import fs from "node:fs";
import path from "node:path";

export function dataDir() {
  if (process.env.AJAX_DATA_DIR) return path.resolve(process.env.AJAX_DATA_DIR);
  const candidates = [
    path.resolve(process.cwd(), "data"),
    path.resolve(process.cwd(), "../../data"),
    path.resolve(process.cwd(), "../data"),
  ];
  return candidates.find((p) => fs.existsSync(p)) || candidates[1];
}

export function readData(rel: string) {
  return fs.readFileSync(path.join(dataDir(), rel), "utf8");
}

export function writeData(rel: string, contents: string) {
  const abs = path.join(dataDir(), rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, contents, "utf8");
  return abs;
}

export function existsData(rel: string) {
  return fs.existsSync(path.join(dataDir(), rel));
}

export function listMd(rel: string) {
  const dir = path.join(dataDir(), rel);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((n) => n.endsWith(".md") && n.toLowerCase() !== "readme.md")
    .map((n) => ({
      name: n,
      abs: path.join(dir, n),
      text: fs.readFileSync(path.join(dir, n), "utf8"),
    }));
}

export function listApplications() {
  const dir = path.join(dataDir(), "applications");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((n) => n !== "_master" && n !== "_example")
    .map((slug) => {
      const metaPath = path.join(dir, slug, "meta.json");
      const meta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, "utf8")) : { slug };
      return { slug, ...meta };
    })
    .sort((a, b) => String(b.created || "").localeCompare(String(a.created || "")));
}
