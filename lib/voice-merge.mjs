import fs from "node:fs";
import path from "node:path";
import { dataDir, listFiles, todayIso, writeUtf8 } from "./paths.mjs";

function stripFrontMatter(raw) {
  if (!raw.startsWith("---")) return raw.trim();
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return raw.trim();
  return raw.slice(end + 4).trim();
}

function sentences(text) {
  return text.split(/(?<=[.!?])\s+/).filter((s) => s.split(/\s+/).length > 3);
}

function avgLength(parts) {
  if (!parts.length) return 0;
  const words = parts.map((s) => s.split(/\s+/).length);
  return Math.round(words.reduce((a, b) => a + b, 0) / words.length);
}

function topWords(text, n = 12) {
  const stop = new Set("the a an and or to of in on for with that this from was were been being it as at by is are be our you your we they i".split(" "));
  const counts = new Map();
  for (const w of text.toLowerCase().match(/[a-z]{4,}/g) || []) {
    if (stop.has(w)) continue;
    counts.set(w, (counts.get(w) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([w]) => w);
}

export function mergeVoice() {
  const inbox = listFiles("posts/inbox");
  const archiveDir = path.join(dataDir(), "posts/archive");
  fs.mkdirSync(archiveDir, { recursive: true });

  const moved = [];
  for (const file of inbox) {
    const dest = path.join(archiveDir, path.basename(file));
    fs.renameSync(file, dest);
    moved.push(path.basename(file));
  }

  const archived = listFiles("posts/archive");
  const bodies = archived.map((f) => stripFrontMatter(fs.readFileSync(f, "utf8")));
  const corpus = bodies.join("\n\n");
  const sent = sentences(corpus);
  const logPath = path.join(dataDir(), "posts/voice-log.json");
  const log = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath, "utf8")) : {};

  log.lastMerge = todayIso();
  log.mergedCount = archived.length;
  log.pendingInbox = 0;
  log.lastMoved = moved;
  log.avgSentenceWords = avgLength(sent);
  log.signatureWords = topWords(corpus);
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2) + "\n");

  const voicePath = path.join(dataDir(), "voice.md");
  let voice = fs.existsSync(voicePath) ? fs.readFileSync(voicePath, "utf8") : "# Voice Profile\n";
  voice = voice.replace(/^Last merged:.*$/m, `Last merged: ${todayIso()}`);
  if (!/^Last merged:/m.test(voice)) {
    voice = voice.replace("# Voice Profile\n", `# Voice Profile\n\nLast merged: ${todayIso()}\n`);
  }
  voice = voice.replace(/^Corpus posts:.*$/m, `Corpus posts: ${archived.length}`);
  const increment = `

## Latest increment (${todayIso()})
Merged ${moved.length} file(s): ${moved.join(", ") || "none"}.
Average sentence length across corpus: ${avgLength(sent)} words.
Recurring words: ${topWords(corpus).join(", ") || "n/a"}.
A Cloud Agent should now rewrite the sections above from the full archive in data/posts/archive/. This increment only updates counts and the log.
`;
  if (voice.includes("## Latest increment")) {
    voice = voice.replace(/## Latest increment[\s\S]*$/, increment.trim() + "\n");
  } else {
    voice = voice.trim() + "\n" + increment;
  }
  writeUtf8(voicePath, voice.endsWith("\n") ? voice : voice + "\n");

  return { moved, corpusCount: archived.length, log };
}
