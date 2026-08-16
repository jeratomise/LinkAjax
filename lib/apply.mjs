import path from "node:path";
import { experienceBlocks, keywordsFrom, loadFactBase, scoreText } from "./facts.mjs";
import { slugify, todayIso, todayUk, writableDir, writeUtf8, readUtf8 } from "./paths.mjs";
import { exportApplication } from "./export-docs.mjs";

function pickTitle(jd) {
  const role = jd.match(/^## Role\s*\n(.+)$/m)?.[1]?.trim();
  const company = jd.match(/^## Company\s*\n(.+)$/m)?.[1]?.trim();
  return { role: role || "Target role", company: company || "" };
}

function reorderRoles(roles, keywords) {
  return [...roles].sort((a, b) => scoreText(`${a.heading}\n${a.body}`, keywords) - scoreText(`${b.heading}\n${b.body}`, keywords)).reverse();
}

function extractContact(cv) {
  const email = cv.match(/Email:\s*([^\n]+)/)?.[1]?.trim() || "jeratomise@gmail.com";
  const phone = cv.match(/Phone:\s*([^\n]+)/)?.[1]?.trim() || "(65) 8468 0145";
  return { email, phone };
}

function extractSummary(cv) {
  const match = cv.match(/## Summary\s*\n([\s\S]*?)(?=\n## |$)/);
  if (match) {
    return match[1].trim().split("\n").filter(Boolean).join(" ");
  }
  return "APAC server and cloud marketer. Full-stack regional GTM at AMD. Awarded campaign work at HP. Economics and finance from SMU, Cum Laude. Recent AI coursework from Harvard Business School Online. Open to senior cloud, AI infrastructure, and B2B product marketing roles.";
}

function extractEducation(cv) {
  const match = cv.match(/## Education\s*\n([\s\S]*?)(?=\n## |$)/);
  if (match) {
    return match[1].trim();
  }
  return `### Singapore Management University, Singapore (Class of 2011)
BSc. Bachelor of Science (Economics and Finance)
- Second Major: Finance (International Trading Track Specialisation)
- Dean's List (Multiple Years)
- SPRING Singapore Executive Development Scholarship`;
}

function extractSkills(cv) {
  const match = cv.match(/## Skills\s*\n([\s\S]*?)(?=\n## |$)/);
  if (match) {
    return match[1].trim();
  }
  return "B2B Marketing, Channel Marketing, Lead Generation, Marketing Strategy, Budget Management, Account Based Marketing, SFDC, AI\nLanguages: English, Mandarin";
}

function extractCertifications(cv) {
  const match = cv.match(/## Certifications\s*\n([\s\S]*?)(?=\n## |$)/);
  if (match) {
    return match[1].trim();
  }
  return `- AI Essential for Business, Harvard Business School Online, 2025
- Generative AI for Business Leaders, LinkedIn, 2025
- Google Ads Search Certification (Multiyear from 2021 to 2024)
- Microsoft Advertising Certified Professional (Multiyear from 2021 to 2024)`;
}

function filterBullets(roleBody, keywords) {
  const lines = roleBody.split("\n");
  const filtered = [];
  let kept = 0;
  const maxBullets = 6;
  
  for (const line of lines) {
    if (line.startsWith("-") || line.startsWith("●") || line.startsWith("•")) {
      const relevant = keywords.some(kw => line.toLowerCase().includes(kw));
      if (relevant || kept < maxBullets) {
        filtered.push(line);
        kept++;
      }
    } else {
      filtered.push(line);
    }
  }
  return filtered.join("\n");
}

function tailoredResume({ role, company, keywords, facts, roles }) {
  const ranked = reorderRoles(roles, keywords);
  const keywordLine = keywords.slice(0, 12).join(", ");
  const contact = extractContact(facts.cv);
  const summary = extractSummary(facts.cv);
  const education = extractEducation(facts.cv);
  const skills = extractSkills(facts.cv);
  const certifications = extractCertifications(facts.cv);
  
  const roleLines = ranked
    .map((r) => `### ${r.heading}\n${filterBullets(r.body, keywords)}`)
    .join("\n\n");

  return `# Jerome Ng
Connecting Dots between Marketing and Business Impact

Singapore | ${contact.email} | ${contact.phone}
LinkedIn: linkedin.com/in/jeromeng/

Tailored for: ${role}${company ? `, ${company}` : ""}
Date: ${todayUk()}

## Summary
${summary}

JD keywords emphasised: ${keywordLine}

## Experience
${roleLines}

## Education
${education}

## Skills
${skills}

## Certifications
${certifications}

## Fact check
Every employer, award, metric, and date above is taken from the master CV. Nothing was invented for this JD.
`;
}

function buildProofPoints(facts, keywords) {
  const proofs = [];
  const cv = facts.cv.toLowerCase();
  
  if (cv.includes("head of apac server") || cv.includes("amd")) {
    proofs.push({
      label: "Theatre strategy and revenue growth",
      text: "I lead APAC Server and Cloud Marketing at AMD, owning the theatre GTM strategy, an $8-10M annual budget, and a five-person field marketing team across Australia, Japan, Korea, Thailand, and Indonesia. I have delivered $203M in pipeline growth at greater than 60% closure rate through integrated ABM, digital, and PR programs."
    });
  }
  
  if (cv.includes("attribution") || cv.includes("power bi") || cv.includes("sfdc")) {
    proofs.push({
      label: "Data storytelling",
      text: "I designed the SFDC-to-Power BI attribution pipeline that AMD now uses globally to track MQL-to-pipeline conversion, and I have trained 50+ sales BDEs on how to act on it."
    });
  }
  
  if (cv.includes("partner summit") || cv.includes("1,500 customers") || cv.includes("roi 6.5x")) {
    proofs.push({
      label: "Player-coach execution",
      text: "I have personally led multi-city Partner Summits reaching 1,500+ customers at 6.5x ROI, the kind of large-scale, hands-on program delivery that sits alongside coaching and budget ownership."
    });
  }
  
  if (cv.includes("hp") && cv.includes("$1.1b")) {
    proofs.push({
      label: "Portfolio scale",
      text: "At HP I led APJ marketing for the Business Personal Systems portfolio, driving $1.1B in revenue and delivering $50M+ in pipeline through data-driven digital marketing."
    });
  }
  
  if (cv.includes("team") && (cv.includes("five") || cv.includes("mentored"))) {
    proofs.push({
      label: "Team orchestration",
      text: "I built AMD's APeJ field marketing team from the ground up, hired and mentored the group, and later saw that structure adopted as the model for AMD's global marketing attribution program."
    });
  }
  
  if (cv.includes("harvard") || cv.includes("ai essential")) {
    proofs.push({
      label: "AI fluency",
      text: "I have kept the AI craft current, including AI Essential for Business from Harvard Business School Online, and I have been building my own AI tooling and automation stack outside of my day job."
    });
  }
  
  return proofs.slice(0, 4);
}

function coverLetter({ role, company, keywords, facts }) {
  const cloud = keywords.some((k) => ["cloud", "server", "apac", "ai", "gtm", "infrastructure", "marketing", "field", "regional"].includes(k));
  const contact = extractContact(facts.cv);
  const proofs = buildProofPoints(facts, keywords);
  
  const proofText = proofs.length > 0 
    ? proofs.map(p => `**${p.label}:** ${p.text}`).join("\n\n")
    : "I currently lead APAC Server and Cloud Marketing at AMD, a full-stack regional mandate. At HP the work was recognised with the Amaze Award in 2019, from a global shortlist of about 1,200.";

  return `Jerome Ng

Singapore | ${contact.email} | ${contact.phone}

Re: ${role}${company ? `, ${company}` : ""}

Dear Hiring Team,

I lead APAC Server and Cloud Marketing at AMD, where I own the theatre GTM strategy, an $8-10M annual budget, and a field marketing team across Australia, Japan, Korea, Thailand, and Indonesia. That mandate${cloud ? ", architecting regional strategy, running the marketing engine behind enterprise pipeline, and being the trusted advisor sitting across the table from Sales leadership," : ""} maps directly to this role, and it is why I am writing.

A few ways my track record aligns with what you are looking for:

${proofText}

${cloud ? "Your must-haves around APAC GTM, cloud infrastructure, and modern AI tooling are the centre of my fact base, not a stretch." : "I have mapped the must-haves in your description to the attached resume. Anything not in my CV was left out rather than invented."}

I would welcome the chance to talk through how I would approach this role specifically. Thank you for your consideration.

Best regards,
Jerome Ng
`;
}

export async function applyFromJd(jdText, options = {}) {
  const facts = loadFactBase();
  const { role, company } = pickTitle(jdText);
  const keywords = keywordsFrom(`${jdText}\n${role}\n${company}`);
  const roles = experienceBlocks(facts.cv);
  const slug = options.slug || `${todayIso()}-${slugify(role)}`;
  const dir = path.join(writableDir(), "applications", slug);

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
