import fs from "node:fs";
import path from "node:path";
import { readUtf8, dataDir, writableDir } from "./paths.mjs";

const STOP = new Set(
  `a an the and or of to for in on with by from as at is are was were be been being
   this that those these it its you your we our they their will can should must
   role job company team teams work working including required prefer preferred
   plus about into over such than then them than`.split(/\s+/),
);

function safeRead(rel) {
  try {
    return readUtf8(rel);
  } catch {
    return "";
  }
}

function readFact(rel) {
  const overlay = path.join(writableDir(), rel);
  if (fs.existsSync(overlay)) {
    try {
      return fs.readFileSync(overlay, "utf8");
    } catch {
      // fall through to repo data
    }
  }
  return safeRead(rel);
}

export function loadFactBase() {
  const cv = readFact("applications/_master/cv.md");
  const snapshot = safeRead("profile/snapshot.md");
  const about = safeRead("about-me.md");
  const letterSample = readFact("applications/_master/cover-letter-sample.md");
  return { cv, snapshot, about, letterSample, combined: `${cv}\n\n${snapshot}\n\n${about}` };
}

export function getMasterCvInfo() {
  const dirs = [path.join(writableDir(), "applications/_master")];
  const repoMaster = path.join(dataDir(), "applications/_master");
  if (dirs[0] !== repoMaster) dirs.push(repoMaster);

  let cvExists = false;
  let cvUpdated = "";
  let pdfExists = false;
  let source = "";

  for (const masterDir of dirs) {
    const cvPath = path.join(masterDir, "cv.md");
    const pdfPath = path.join(masterDir, "resume.pdf");
    if (!cvExists && fs.existsSync(cvPath)) {
      cvExists = true;
      const stat = fs.statSync(cvPath);
      cvUpdated = stat.mtime.toISOString();
      const content = fs.readFileSync(cvPath, "utf8");
      const sourceMatch = content.match(/^Source:\s*(.+)$/m);
      if (sourceMatch) source = sourceMatch[1];
    }
    if (!pdfExists && fs.existsSync(pdfPath)) pdfExists = true;
  }

  return { cvExists, cvUpdated, pdfExists, source };
}

export function keywordsFrom(text, limit = 40) {
  const counts = new Map();
  for (const raw of String(text).toLowerCase().match(/[a-z][a-z0-9+.-]{2,}/g) || []) {
    if (STOP.has(raw)) continue;
    counts.set(raw, (counts.get(raw) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

export function scoreText(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.reduce((score, word) => score + (lower.includes(word) ? 1 : 0), 0);
}

export function extractSections(md) {
  const blocks = [];
  const parts = md.split(/^## /m).slice(1);
  for (const part of parts) {
    const [titleLine, ...rest] = part.split("\n");
    blocks.push({ title: titleLine.trim(), body: rest.join("\n").trim() });
  }
  return blocks;
}

export function experienceBlocks(cvMd) {
  const exp = extractSections(cvMd).find((s) => s.title.toLowerCase().startsWith("experience"));
  if (!exp) return [];
  const roles = [];
  const chunks = exp.body.split(/^### /m).filter(Boolean);
  for (const chunk of chunks) {
    const lines = chunk.split("\n");
    const companyLine = lines[0]?.trim() || "";
    const rest = lines.slice(1);
    
    let titleLine = "";
    let bodyLines = [];
    let foundTitle = false;
    
    for (const line of rest) {
      if (!foundTitle && line.startsWith("**") && line.includes("**")) {
        titleLine = line.replace(/\*\*/g, "").trim();
        foundTitle = true;
      } else if (foundTitle || line.startsWith("-") || line.startsWith("●") || line.startsWith("•") || line.trim() === "") {
        bodyLines.push(line);
        foundTitle = true;
      } else if (!foundTitle) {
        titleLine = line.trim();
        foundTitle = true;
      }
    }
    
    const heading = titleLine ? `${companyLine} - ${titleLine}` : companyLine;
    
    roles.push({
      heading: heading,
      body: bodyLines.join("\n").trim(),
    });
  }
  return roles;
}

export function assertNoInvention(output, facts) {
  const bannedGuesses = [
    /\$\d/,
    /\d+%/,
    /increased .* by/i,
    /pipeline of/i,
  ];
  const invented = bannedGuesses.filter((re) => re.test(output) && !re.test(facts));
  return invented.length === 0;
}
