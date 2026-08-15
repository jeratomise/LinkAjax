import { readUtf8 } from "./paths.mjs";

const STOP = new Set(
  `a an the and or of to for in on with by from as at is are was were be been being
   this that those these it its you your we our they their will can should must
   role job company team teams work working including required prefer preferred
   plus about into over such than then them than`.split(/\s+/),
);

export function loadFactBase() {
  const cv = readUtf8("applications/_master/cv.md");
  const snapshot = readUtf8("profile/snapshot.md");
  const about = readUtf8("about-me.md");
  return { cv, snapshot, about, combined: `${cv}\n\n${snapshot}\n\n${about}` };
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
    const [titleLine, ...rest] = chunk.split("\n");
    roles.push({
      heading: titleLine.trim(),
      body: rest.join("\n").trim(),
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
