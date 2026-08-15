import fs from "node:fs";
import path from "node:path";
import { dataDir, todayIso, todayUk, writeUtf8 } from "./paths.mjs";

const CREATOR_STARTER = [
  { name: "April Dunford", where: "Newsletter / LinkedIn", why: "Positioning for technical products. Study structure, do not copy examples.", avoid: "Do not reuse her company stories." },
  { name: "Dave Gerhardt", where: "Exit Five / LinkedIn", why: "B2B marketing operator tone.", avoid: "Do not copy his SaaS-specific jokes." },
  { name: "Kyle Poyar", where: "Growth Unhinged", why: "GTM metrics literacy for hiring managers who read operators.", avoid: "Do not invent numbers in his style." },
  { name: "Tomasz Tunguz", where: "LinkedIn / blog", why: "Infrastructure and AI market framing.", avoid: "Do not paste his charts or sentences." },
  { name: "Jaryd Hermann", where: "LinkedIn", why: "APAC B2B and regional GTM texture.", avoid: "Do not clone cadence." },
  { name: "Yucca Le", where: "LinkedIn", why: "Southeast Asia cloud and partner motion.", avoid: "No paraphrase of a specific post." },
  { name: "Kahlil Corazo", where: "LinkedIn", why: "APAC product marketing craft.", avoid: "Different market, still not a template to clone." },
  { name: "Avinash Kaushik", where: "Occam's Razor", why: "Measurement honesty. Useful for recruiter-facing proof.", avoid: "Do not copy analytics essays." },
  { name: "Casey Winters", where: "LinkedIn / essays", why: "Growth vs brand tension in GTM teams.", avoid: "Consumer examples are not Jerome's facts." },
  { name: "Deb Liu", where: "LinkedIn", why: "Operator career narrative that hiring managers trust.", avoid: "Do not copy personal stories." },
];

function originalityScore(draft, sources) {
  const d = draft.toLowerCase();
  let overlap = 0;
  for (const src of sources) {
    const words = src.toLowerCase().match(/[a-z]{5,}/g) || [];
    const unique = [...new Set(words)];
    const hits = unique.filter((w) => d.includes(w)).length;
    overlap = Math.max(overlap, unique.length ? hits / unique.length : 0);
  }
  return overlap;
}

export function writeWeeklyScaffold({ themes = [], posts = [], creators = CREATOR_STARTER, sources = [] } = {}) {
  const iso = todayIso();
  const briefPath = path.join(dataDir(), "research/weekly", `${iso}.md`);
  const rows =
    themes.length > 0
      ? themes
          .map((t) =>
            `| ${t.theme} | ${t.platforms || "News"} | ${t.sources || ""} | ${t.links || ""} | ${t.attention || ""} | ${t.debate || ""} | ${t.why || ""} | ${t.angle || ""} |`,
          )
          .join("\n")
      : "| _Agent to fill after live 7-day scan_ | | | | | | | |";

  const creatorLines = creators
    .slice(0, 10)
    .map((c, i) => `${i + 1}. **${c.name}** (${c.where}). ${c.why} Do not copy: ${c.avoid}`)
    .join("\n");

  const brief = `As of ${todayUk()}

Niche: APAC cloud and AI infrastructure GTM, B2B marketing, senior marketing careers.

| Theme / Emerging Story | Platforms (Reddit, X, News) | Key Communities / Accounts / Sources | Representative Links | Attention Signals | What's Happening or Being Debated | Why It Matters for APAC cloud and AI GTM | Shareable Angle |
| --- | --- | --- | --- | --- | --- | --- | --- |
${rows}

## Creators to watch

Public references only. Study structure. Never paste their posts.

${creatorLines}

## Integrity

- Nothing older than 7 days belongs in the table.
- If a date could not be verified, the row was omitted.
- LinkedIn was not scraped.
`;

  writeUtf8(briefPath, brief);

  const queueDir = path.join(dataDir(), "queue");
  fs.mkdirSync(queueDir, { recursive: true });
  const written = [];
  const defaultPosts =
    posts.length > 0
      ? posts
      : [
          {
            slug: "cloud-gtm-is-translation",
            theme: "Cloud GTM as translation work",
            body: `Hiring teams still ask marketers for more awareness.

The better question is whether anyone translated the product into a regional buyer's language.

That is the unglamorous half of cloud GTM in APAC. Roadmaps do not travel. Partners, country teams, and a real buyer do.

I would rather show that work than a content calendar.

If you are hiring for that brief, the CV is in Featured.`,
          },
          {
            slug: "ai-speed-not-strategy",
            theme: "AI as speed, not strategy",
            body: `AI made the first draft cheap.

It did not make the market call cheap.

I use the tools. Harvard and LinkedIn coursework this year were about that. The judgement about APAC buyers, partners, and what not to ship is still the job.

If your role needs both, that is the conversation I want.`,
          },
          {
            slug: "awards-are-receipts",
            theme: "Awards as receipts not identity",
            body: `Awards are not a personality.

They are receipts that work shipped.

HP Amaze from a global shortlist of about 1,200. APAC loyalty gold. AR bronze. AMD Spotlight more than once.

I put them on a resume so a hiring manager can verify. I do not put them in every post.

The work underneath is regional GTM for technical products.`,
          },
          {
            slug: "two-languages-one-brief",
            theme: "English and Mandarin as GTM tools",
            body: `APAC cloud deals do not happen in one language.

I work in English and Mandarin, from Singapore. That is not a diversity line. It is how partner and customer rooms actually run.

If your APAC brief assumes a single HQ narrative, the region will quietly ignore it.`,
          },
          {
            slug: "economics-still-helps",
            theme: "Economics training in GTM",
            body: `I trained as an economist who also read finance.

That sounds unrelated to cloud marketing until you have to explain a server cycle, a partner margin, or why a campaign is not a strategy.

SMU, Cum Laude, is on the CV for that reason. Not for nostalgia.`,
          },
        ];

  const indexPosts = [];
  defaultPosts.slice(0, 7).forEach((post, i) => {
    const id = `${iso}-${String(i + 1).padStart(2, "0")}`;
    const overlap = originalityScore(post.body, sources.length ? sources : ["placeholder source text that should not match"]);
    const file = `${id}-${post.slug}.md`;
    const md = `---
id: ${id}
status: pending
theme: ${post.theme}
source_links: []
voice: provisional
originality: Drafted from Jerome's fact base and voice, not from another creator's post. Lexical overlap vs provided sources: ${(overlap * 100).toFixed(0)}%.
---

${post.body.trim()}
`;
    writeUtf8(path.join(queueDir, file), md);
    written.push(file);
    indexPosts.push({ id, file, status: "pending", theme: post.theme });
  });

  writeUtf8(
    path.join(queueDir, "index.json"),
    JSON.stringify({ weekOf: iso, status: "pending-approval", posts: indexPosts }, null, 2) + "\n",
  );

  return { briefPath, written };
}
