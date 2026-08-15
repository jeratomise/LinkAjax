import { listMd, readData } from "@/lib/data";
import { QueueItem, CreatorsGrid, Creator } from "./ui";

export const dynamic = "force-dynamic";

function splitFront(raw: string) {
  if (!raw.startsWith("---")) return { meta: {}, body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { meta: {}, body: raw };
  const yaml = raw.slice(4, end);
  const meta: Record<string, string> = {};

  const lines = yaml.split("\n");
  let currentKey = "";
  let multilineValue = "";
  let inMultiline = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (inMultiline) {
      if (line.startsWith("  ")) {
        multilineValue += (multilineValue ? "\n" : "") + line.slice(2);
      } else if (line.trim() === "") {
        multilineValue += "\n";
      } else {
        meta[currentKey] = multilineValue.trim();
        inMultiline = false;
        currentKey = "";
        multilineValue = "";
      }
    }

    if (!inMultiline) {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim();
        if (value === "|" || value === ">") {
          currentKey = key;
          inMultiline = true;
          multilineValue = "";
        } else {
          meta[key] = value;
        }
      }
    }
  }

  if (inMultiline && currentKey) {
    meta[currentKey] = multilineValue.trim();
  }

  return { meta, body: raw.slice(end + 4).trim() };
}

const CREATORS_DATA: Creator[] = [
  {
    name: "April Dunford",
    initials: "AD",
    where: "Newsletter / Podcast",
    why: "Positioning for technical products. Study structure, not examples.",
    topPost: {
      title: "Obviously Awesome (2026 Edition)",
      excerpt: "The updated and expanded edition with new case studies...",
      url: "https://aprildunford.substack.com/",
    },
    recentPost: {
      title: "Positioning in the Age of AI",
      excerpt: "How to know when your positioning needs to change...",
      url: "https://aprildunford.substack.com/archive",
    },
  },
  {
    name: "Dave Gerhardt",
    initials: "DG",
    where: "Exit Five / Podcast",
    why: "B2B marketing operator tone. Practical tactics.",
    topPost: {
      title: "Founder Brand",
      excerpt: "How to build your personal brand as a B2B founder...",
      url: "https://davegerhardt.com/",
    },
    recentPost: {
      title: "B2B Marketing Newsletter",
      excerpt: "What's actually working right now from 6,000+ practitioners...",
      url: "https://exitfive.com/newsletter/",
    },
  },
  {
    name: "Kyle Poyar",
    initials: "KP",
    where: "Growth Unhinged",
    why: "GTM metrics literacy for hiring managers who read operators.",
    topPost: {
      title: "How to grow your B2B newsletter",
      excerpt: "25 tactics from five years of writing and 80k+ subscribers...",
      url: "https://www.growthunhinged.com/",
    },
    recentPost: {
      title: "Meet your biggest competitor (Claude)",
      excerpt: "How to win in the AI era when your competitor is an LLM...",
      url: "https://www.growthunhinged.com/",
    },
  },
  {
    name: "Tomasz Tunguz",
    initials: "TT",
    where: "Theory Ventures / Blog",
    why: "Infrastructure and AI market framing. Data-driven insights.",
    topPost: {
      title: "Spending Like a Hyperscaler",
      excerpt: "AI capex analysis and infrastructure investment trends...",
      url: "https://tomtunguz.com/",
    },
    recentPost: {
      title: "The Secret Chat Room",
      excerpt: "Inside the AI sprint and what it means for B2B...",
      url: "https://tomtunguz.com/the-secret-chat-room/",
    },
  },
  {
    name: "Avinash Kaushik",
    initials: "AK",
    where: "Occam's Razor",
    why: "Measurement honesty. Useful for recruiter-facing proof.",
    topPost: {
      title: "Web Analytics 2.0",
      excerpt: "Prioritise customer-centric, multi-channel analysis...",
      url: "https://www.kaushik.net/avinash/",
    },
    recentPost: {
      title: "Bye, Bye Human-Powered Analytics",
      excerpt: "Hello AI-powered analytics and what it means for marketers...",
      url: "https://www.kaushik.net/avinash/bye-human-powered-marketing-analytics-hello-ai-powered-analytics/",
    },
  },
];

export default function WeekPage() {
  let brief = "No weekly brief yet. Run npm run weekly-pack or the Sunday Cloud Agent.";
  try {
    const files = listMd("research/weekly");
    if (files.length) brief = files.sort((a, b) => b.name.localeCompare(a.name))[0].text;
  } catch {
    brief = "Research folder missing.";
  }
  const posts = listMd("queue")
    .filter((f) => f.name.endsWith(".md") && !f.name.startsWith("README"))
    .map((f) => ({ name: f.name, ...splitFront(f.text) }));

  const trendsSection = brief.split("## Creators to watch")[0];

  return (
    <>
      <h1>This week</h1>
      <p className="lede">Approve drafts here, then paste into LinkedIn yourself. AJAX does not publish.</p>

      <h2>Post queue</h2>
      {posts.length === 0 ? <p className="meta">Queue empty.</p> : null}
      {posts.map((p) => (
        <QueueItem key={p.name} file={p.name} meta={p.meta} body={p.body} />
      ))}

      <h2>Creators to watch</h2>
      <p className="meta" style={{ marginBottom: 16 }}>
        Study structure and trends. Never copy. Sources are public newsletters, podcasts, and blogs.
      </p>
      <CreatorsGrid creators={CREATORS_DATA} />

      <h2>Weekly trends</h2>
      <div className="card md">{trendsSection}</div>
    </>
  );
}
