import { readData } from "@/lib/data";
import ProfileUI from "./ui";

export const dynamic = "force-dynamic";

interface ProfileSection {
  id: string;
  title: string;
  current: string;
  suggested: string;
  options?: string[];
  charLimit: number;
  editUrl: string;
  editUrlFallback?: string;
}

const LINKEDIN_LIMITS = {
  headline: 220,
  about: 2600,
  experience: 2000,
};

const LINKEDIN_URLS = {
  intro: "https://www.linkedin.com/in/me/edit/intro/",
  about: "https://www.linkedin.com/in/jeromeng/edit/forms/about/new/?profileFormEntryPoint=PROFILE_SECTION",
  aboutFallback: "https://www.linkedin.com/in/me/edit/about/",
  experience: "https://www.linkedin.com/in/me/details/experience/",
  featured: "https://www.linkedin.com/in/me/details/featured/",
};

function extractCodeBlock(text: string): string {
  const match = text.match(/```[\s\S]*?\n([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

function cleanForClipboard(text: string): string {
  return text
    .replace(/^#+\s+.*$/gm, "")
    .replace(/^Option \d+.*?:\s*/gm, "")
    .replace(/```[\w]*\n?/g, "")
    .replace(/^\s*\n/gm, "\n")
    .trim();
}

function parseSnapshot(raw: string): {
  headline: string;
  about: string;
  experience: { company: string; content: string }[];
} {
  const lines = raw.split("\n");
  let headline = "";
  let about = "";
  const experience: { company: string; content: string }[] = [];

  let currentSection = "";
  let currentCompany = "";
  let buffer: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## Headline")) {
      currentSection = "headline";
      buffer = [];
      continue;
    }
    if (line.startsWith("## About")) {
      if (currentSection === "headline") headline = buffer.join("\n").trim();
      currentSection = "about";
      buffer = [];
      continue;
    }
    if (line.startsWith("## Experience")) {
      if (currentSection === "about") about = buffer.join("\n").trim();
      currentSection = "experience";
      buffer = [];
      continue;
    }
    if (line.startsWith("## ") && currentSection === "experience") {
      if (currentCompany && buffer.length) {
        experience.push({ company: currentCompany, content: buffer.join("\n").trim() });
      }
      currentSection = "";
      continue;
    }

    if (currentSection === "experience") {
      if (line.startsWith("### ")) {
        if (currentCompany && buffer.length) {
          experience.push({ company: currentCompany, content: buffer.join("\n").trim() });
        }
        currentCompany = line.replace(/^###\s*/, "").trim();
        buffer = [];
        continue;
      }
    }

    if (currentSection) {
      buffer.push(line);
    }
  }

  if (currentSection === "experience" && currentCompany && buffer.length) {
    experience.push({ company: currentCompany, content: buffer.join("\n").trim() });
  }

  return { headline: cleanForClipboard(headline), about: cleanForClipboard(about), experience };
}

function parseSuggestions(raw: string): {
  headlines: string[];
  about: string;
  experience: { company: string; content: string }[];
  featured: string;
} {
  const headlines: string[] = [];
  let about = "";
  const experience: { company: string; content: string }[] = [];
  let featured = "";

  const headlineMatch = raw.match(/## Headlines[\s\S]*?```([\s\S]*?)```/);
  if (headlineMatch) {
    const block = headlineMatch[1].trim();
    const optionLines = block.split("\n").filter((l) => l.includes("Option"));
    for (const line of optionLines) {
      const cleaned = line.replace(/^Option \d+\s*\([^)]*\):\s*/, "").trim();
      if (cleaned) headlines.push(cleaned);
    }
  }

  const aboutMatch = raw.match(/## About[\s\S]*?```([\s\S]*?)```/);
  if (aboutMatch) {
    about = aboutMatch[1].trim();
  }

  const expSection = raw.match(/## Experience[\s\S]*?(?=## Featured|## Visual|$)/);
  if (expSection) {
    const expText = expSection[0];
    const companyMatches = expText.matchAll(/### ([^\n]+)\n\n```([\s\S]*?)```/g);
    for (const match of companyMatches) {
      experience.push({
        company: match[1].trim(),
        content: match[2].trim(),
      });
    }
  }

  const featuredMatch = raw.match(/## Featured section([\s\S]*?)(?=## Visual|$)/);
  if (featuredMatch) {
    const featText = featuredMatch[1].trim();
    const items = featText.split(/\nItem \d+/).filter((s) => s.trim());
    const cleaned = items.map((item) => {
      const lines = item.split("\n").filter((l) => l.startsWith("- "));
      return lines.map((l) => l.replace(/^- /, "")).join("\n");
    }).join("\n\n");
    featured = cleaned.trim();
  }

  return { headlines, about, experience, featured };
}

export default function ProfilePage() {
  let snapshot: ReturnType<typeof parseSnapshot> | null = null;
  let suggestions: ReturnType<typeof parseSuggestions> | null = null;

  try {
    const snapshotRaw = readData("profile/snapshot.md");
    snapshot = parseSnapshot(snapshotRaw);
  } catch {}

  try {
    const suggestionsRaw = readData("profile/suggestions.md");
    suggestions = parseSuggestions(suggestionsRaw);
  } catch {}

  const sections: ProfileSection[] = [];

  sections.push({
    id: "headline",
    title: "Headline",
    current: snapshot?.headline || "",
    suggested: suggestions?.headlines?.[0] || "",
    options: suggestions?.headlines,
    charLimit: LINKEDIN_LIMITS.headline,
    editUrl: LINKEDIN_URLS.intro,
  });

  sections.push({
    id: "about",
    title: "About",
    current: snapshot?.about || "",
    suggested: suggestions?.about || "",
    charLimit: LINKEDIN_LIMITS.about,
    editUrl: LINKEDIN_URLS.about,
    editUrlFallback: LINKEDIN_URLS.aboutFallback,
  });

  const maxExp = Math.max(snapshot?.experience?.length || 0, suggestions?.experience?.length || 0, 2);
  for (let i = 0; i < Math.min(maxExp, 2); i++) {
    const snapExp = snapshot?.experience?.[i];
    const sugExp = suggestions?.experience?.[i];
    const company = sugExp?.company || snapExp?.company || `Role ${i + 1}`;
    sections.push({
      id: `experience-${i}`,
      title: `Experience: ${company}`,
      current: snapExp?.content || "",
      suggested: sugExp?.content || "",
      charLimit: LINKEDIN_LIMITS.experience,
      editUrl: LINKEDIN_URLS.experience,
    });
  }

  sections.push({
    id: "featured",
    title: "Featured",
    current: "",
    suggested: suggestions?.featured || "",
    charLimit: 2000,
    editUrl: LINKEDIN_URLS.featured,
  });

  return (
    <>
      <h1>Profile Copy Cockpit</h1>
      <p className="lede">
        Copy each field into LinkedIn yourself. AJAX never touches the live profile.
        <a href="https://www.linkedin.com/in/jeromeng/" target="_blank" rel="noopener noreferrer" className="profile-link">
          View your profile ↗
        </a>
      </p>
      <ProfileUI sections={sections} />
    </>
  );
}
