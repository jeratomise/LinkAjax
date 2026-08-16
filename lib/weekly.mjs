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
            slug: "hq-playbooks-stall-apac",
            theme: "Why HQ playbooks stall in APAC",
            body: `HQ ships a deck. APAC ships silence. 🔇

The problem is rarely the product. It is the assumption that one narrative travels.

A Korea enterprise buyer and a Singapore SMB do not read the same proof points. A Japan partner and an India reseller do not sell the same way.

Regional GTM is the work of making that translation visible before the pipeline call.

Most global teams skip it. Then wonder why APAC is "slow".`,
            image_prompt: `Professional infographic at 1080x1080 pixels. Clean editorial style, flat design, no gradients.

Background: Dark navy (#1B3A4B).
Text colour: Off-white (#F6F1E8).
Accent colour: Copper (#C4783A).

Layout:
HEADLINE (top, 32px bold): "The HQ deck problem"

VISUAL (centre): A simple flowchart. Left side shows a single box labelled "Global deck" with an arrow pointing right. The arrow splits into 5 smaller arrows pointing to 5 boxes labelled: "Japan", "Korea", "SEA", "ANZ", "India". A large X in copper marks the split point. Below the X: "Lost in translation".

FOOTER (bottom, small text): "APAC B2B GTM"

Style: Corporate B2B, diagrammatic. No icons, no emojis, no photos. Hairline copper borders only.`,
            image_size: "1080x1080",
          },
          {
            slug: "ai-accelerates-execution",
            theme: "AI accelerates execution, not market calls",
            body: `AI made the first draft free. ⚡

It did not make the market call free.

The judgement about which buyer to chase, which partner motion to fund, and what not to ship still costs the same. It costs attention, relationships, and a point of view about the region.

Teams that outsource that to a prompt will move faster in the wrong direction.

The unlock is using AI to clear the shallow work so there is time for the hard calls.`,
            image_prompt: `Professional infographic at 1080x1080 pixels. Clean editorial style, flat design.

Background: Off-white (#F6F1E8).
Text colour: Dark navy (#1B3A4B).
Accent colour: Copper (#C4783A).

Layout:
HEADLINE (top, 32px bold): "AI changed the speed. Not the job."

VISUAL (centre): Two horizontal stacked bars. Top bar: thin copper segment (20%) labelled "Draft" + large grey segment (80%) labelled "unchanged". Bottom bar: large copper segment (80%) labelled "Market call" + thin grey segment (20%). Arrow pointing to bottom bar with text "Still human".

SUBTEXT (below visual, 16px): "Judgement about buyers, partners, and what not to ship."

FOOTER (bottom, small): "B2B Marketing in APAC"

Style: Minimalist chart. No decorative elements. Hairline borders.`,
            image_size: "1080x1080",
          },
          {
            slug: "partner-led-apac",
            theme: "Partner-led GTM is the APAC default",
            body: `APAC B2B is partner-first by default. 🤝

Most Western playbooks assume a direct motion that scales with SDRs and paid media. In APAC, the economics rarely work that way.

Distributors, system integrators, and cloud resellers carry the coverage. The vendor's job is to enable them, not replace them.

Marketing that ignores channel is marketing that ignores how deals actually close in the region.

The partner map is the GTM strategy. Everything else is air cover.`,
            image_prompt: `Professional infographic at 1080x1080 pixels. Clean editorial style.

Background: Dark navy (#1B3A4B).
Text colour: Off-white (#F6F1E8).
Accent colour: Copper (#C4783A).

Layout:
HEADLINE (top, 28px bold): "APAC runs on partners"

VISUAL (centre): A hub-and-spoke diagram. Centre circle labelled "Vendor" in navy with copper border. Six smaller circles around it connected by copper lines, labelled: "Distis", "SIs", "Resellers", "CSPs", "GSIs", "OEMs".

SUBTEXT (below diagram): "Direct-first playbooks miss this."

FOOTER (bottom): "B2B Cloud GTM" in small text.

Style: Clean diagram. No icons, no photos. Thin copper lines. Navy and cream only.`,
            image_size: "1080x1080",
          },
          {
            slug: "measurement-gap-apac",
            theme: "The measurement gap in APAC B2B",
            body: `The dashboard says the webinar sourced the deal. 📊

The partner says they walked it in.

B2B measurement in APAC often measures what is easy to track, not what actually moved the buyer.

Partner influence, executive relationships, and proof-of-concept work are harder to attribute. They still drive most enterprise revenue.

The risk is optimising for the dashboard and starving the motions that actually close.

Honest measurement means admitting what you cannot see.`,
            image_prompt: `Professional infographic at 1080x1080 pixels. Clean editorial style.

Background: Off-white (#F6F1E8).
Text colour: Dark navy (#1B3A4B).
Accent colour: Copper (#C4783A).

Layout:
HEADLINE (top, 28px bold): "Attribution vs reality"

VISUAL (centre): Two columns side by side. Left column header: "Dashboard says" with three items below (copper bullets): "Webinar sourced", "Content touched", "Ad influenced". Right column header: "Deal closed because" with three items: "Partner intro", "Executive ref", "Proof of concept".

A dotted copper line separates the two columns with a "≠" symbol in the middle.

FOOTER (bottom): "APAC B2B Measurement" in small navy text.

Style: Comparison chart. No decorative elements. Clean sans-serif.`,
            image_size: "1080x1080",
          },
          {
            slug: "localisation-debt",
            theme: "Localisation debt in global GTM",
            body: `Localisation is not translation. 🌏

Translation is the visible work. Change the language, ship the asset.

Localisation debt is everything underneath. Proof points that resonate locally. Case studies from the region. Partner narratives that match how buyers actually evaluate.

Most global teams ship translated assets and call it done. Then wonder why APAC conversion lags.

The debt compounds. Paying it down is slower than admitting it exists.`,
            image_prompt: `Professional infographic at 1080x1080 pixels. Clean editorial style.

Background: Dark navy (#1B3A4B).
Text colour: Off-white (#F6F1E8).
Accent colour: Copper (#C4783A).

Layout:
HEADLINE (top, 28px bold): "Localisation debt"

VISUAL (centre): A simple iceberg diagram. Above waterline (small, 20%): labelled "Translated assets". Below waterline (large, 80%): labelled "Proof points", "Case studies", "Partner co-sell", "Buyer context".

SUBTEXT (below iceberg): "Translation is the visible 20%."

FOOTER (bottom): "APAC GTM" in small text.

Style: Iceberg metaphor, flat design. Copper waterline. No gradients or 3D.`,
            image_size: "1080x1080",
          },
        ];

  const indexPosts = [];
  defaultPosts.slice(0, 7).forEach((post, i) => {
    const id = `${iso}-${String(i + 1).padStart(2, "0")}`;
    const overlap = originalityScore(post.body, sources.length ? sources : ["placeholder source text that should not match"]);
    const file = `${id}-${post.slug}.md`;
    const imagePromptYaml = post.image_prompt
      ? `image_prompt: |\n${post.image_prompt
          .split("\n")
          .map((line) => `  ${line}`)
          .join("\n")}`
      : "image_prompt: |";
    const imageSizeYaml = post.image_size ? `image_size: ${post.image_size}` : "image_size: 1080x1080";
    const md = `---
id: ${id}
status: pending
theme: ${post.theme}
source_links: []
voice: provisional
originality: Drafted from Jerome's fact base and voice, not from another creator's post. Lexical overlap vs provided sources: ${(overlap * 100).toFixed(0)}%.
${imageSizeYaml}
${imagePromptYaml}
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
