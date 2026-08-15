import path from "node:path";
import { experienceBlocks, keywordsFrom, loadFactBase, scoreText } from "./facts.mjs";
import { dataDir, slugify, todayIso, todayUk, writeUtf8 } from "./paths.mjs";
import { exportApplication } from "./export-docs.mjs";

function pickTitle(jd) {
  const role = jd.match(/^## Role\s*\n(.+)$/m)?.[1]?.trim();
  const company = jd.match(/^## Company\s*\n(.+)$/m)?.[1]?.trim();
  return { role: role || "Target role", company: company || "" };
}

function reorderRoles(roles, keywords) {
  return [...roles].sort((a, b) => scoreText(`${a.heading}\n${a.body}`, keywords) - scoreText(`${b.heading}\n${b.body}`, keywords)).reverse();
}

function tailoredResume({ role, company, keywords, facts, roles }) {
  const ranked = reorderRoles(roles, keywords);
  const keywordLine = keywords.slice(0, 12).join(", ");
  const roleLines = ranked
    .map((r) => `### ${r.heading}\n${r.body}`)
    .join("\n\n");

  return `# Jerome Ng

Singapore · [linkedin.com/in/jeromeng](https://www.linkedin.com/in/jeromeng/)

Tailored for: ${role}${company ? `, ${company}` : ""}
Date: ${todayUk()}

## Summary
APAC server and cloud marketer. Full-stack regional GTM at AMD. Awarded campaign work at HP. Economics and finance from SMU, Cum Laude. Recent AI coursework from Harvard Business School Online. Open to senior cloud, AI infrastructure, and B2B product marketing roles.

JD keywords emphasised: ${keywordLine}

## Experience
${roleLines}

## Education
Singapore Management University, 2009 to 2013
- Degree in Economics, Cum Laude
- Second major in Finance, International Trading Track

## Certifications
- AI Essential for Business, Harvard Business School Online, December 2025
- Generative AI for Business Leaders, LinkedIn, August 2025
- Boosting Your Time Management with AI Tools, LinkedIn, August 2025
- Tech on the Go: No-Code for Coders, LinkedIn, June 2025
- Microsoft Advertising Certified Professional, July 2021
- Google Ads Search, Campaign Manager, and Analytics certifications, 2020

## Languages
English, Mandarin

## Fact check
Every employer, award, and date above is taken from the snapshot or master CV. No metrics were invented for this JD.
`;
}

function coverLetter({ role, company, keywords, facts }) {
  const cloud = keywords.some((k) => ["cloud", "server", "apac", "ai", "gtm", "infrastructure"].includes(k));
  const proof = [];
  if (/amd/i.test(facts.combined)) proof.push("I currently lead APAC Server and Cloud Marketing at AMD, a full-stack regional mandate.");
  if (/hp amaze/i.test(facts.combined)) proof.push("At HP the work was recognised with the Amaze Award in 2019, from a global shortlist of about 1,200, plus APAC loyalty gold and Festival of Media AR bronze.");
  if (/harvard/i.test(facts.combined)) proof.push("I have kept the AI craft current, including AI Essential for Business from Harvard Business School Online in December 2025.");
  if (/mandarin/i.test(facts.combined)) proof.push("I work in English and Mandarin, from Singapore.");

  return `${todayUk()}

Dear Hiring Manager,

I am writing for the ${role}${company ? ` at ${company}` : ""}. The brief matches the work I already do: turn a technical cloud or AI product into demand that APAC buyers and partners will act on.

${proof.join(" ")}

${cloud ? "Your must-haves around APAC GTM, cloud infrastructure, and modern AI tooling are the centre of my fact base, not a stretch." : "I have mapped the must-haves in your description to the attached resume. Anything not in my snapshot was left out rather than invented."}

I have attached a resume tailored to this role. I would welcome a conversation.

Yours sincerely,
Jerome Ng
`;
}

export async function applyFromJd(jdText, options = {}) {
  const facts = loadFactBase();
  const { role, company } = pickTitle(jdText);
  const keywords = keywordsFrom(`${jdText}\n${role}\n${company}`);
  const roles = experienceBlocks(facts.cv);
  const slug = options.slug || `${todayIso()}-${slugify(role)}`;
  const dir = path.join(dataDir(), "applications", slug);

  const resumeMd = tailoredResume({ role, company, keywords, facts, roles });
  const letter = coverLetter({ role, company, keywords, facts });

  writeUtf8(path.join(dir, "jd.md"), jdText.trim() + "\n");
  writeUtf8(path.join(dir, "resume.md"), resumeMd);
  writeUtf8(path.join(dir, "cover-letter.md"), letter);
  writeUtf8(
    path.join(dir, "meta.json"),
    JSON.stringify(
      {
        slug,
        role,
        company,
        created: todayIso(),
        keywords: keywords.slice(0, 20),
        linkedinUnchanged: true,
      },
      null,
      2,
    ) + "\n",
  );

  const files = await exportApplication(dir, { resumeMd, letter, role, company });
  return { slug, dir, role, company, files };
}
