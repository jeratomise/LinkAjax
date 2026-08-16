import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { NextResponse } from "next/server";

function dataDir() {
  if (process.env.AJAX_DATA_DIR) return path.resolve(process.env.AJAX_DATA_DIR);
  const candidates = [
    path.resolve(process.cwd(), ".ajax/data"),
    path.resolve(process.cwd(), "data"),
    path.resolve(process.cwd(), "../../data"),
    path.resolve(process.cwd(), "../data"),
  ];
  return candidates.find((p) => fs.existsSync(p)) || candidates[1];
}

function writableDir() {
  if (process.env.VERCEL) return path.join(os.tmpdir(), "ajax-data");
  return dataDir();
}

function getMasterDir() {
  const dir = path.join(writableDir(), "applications", "_master");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    // pdf-parse has complex exports; use require for compatibility
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch (error) {
    console.error("PDF parse error:", error);
    throw new Error("Failed to extract text from PDF. Please check the file is a valid PDF.");
  }
}

async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  } catch (error) {
    console.error("DOCX parse error:", error);
    throw new Error("Failed to extract text from DOCX. Please check the file is a valid Word document.");
  }
}

function convertToMarkdown(text: string, filename: string): string {
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let md = `# Master CV facts

Source: ${filename} (uploaded ${dateStr})
This file is the authoritative fact base for tailored resumes and cover letters.

`;

  let currentSection = "";
  for (const line of lines) {
    if (/^(executive summary|summary|profile)$/i.test(line)) {
      md += "\n## Summary\n\n";
      currentSection = "summary";
    } else if (/^(experience|work experience|employment)$/i.test(line)) {
      md += "\n## Experience\n\n";
      currentSection = "experience";
    } else if (/^(education)$/i.test(line)) {
      md += "\n## Education\n\n";
      currentSection = "education";
    } else if (/^(skills|skills & interests)$/i.test(line)) {
      md += "\n## Skills\n\n";
      currentSection = "skills";
    } else if (/^(certifications|certificates|certifications & awards)$/i.test(line)) {
      md += "\n## Certifications\n\n";
      currentSection = "certifications";
    } else if (/^(awards|honours|honors)$/i.test(line)) {
      md += "\n## Awards\n\n";
      currentSection = "awards";
    } else if (/^(interests|hobbies)$/i.test(line)) {
      md += "\n## Interests\n\n";
      currentSection = "interests";
    } else if (/^(contact|personal details)$/i.test(line)) {
      md += "\n## Contact\n\n";
      currentSection = "contact";
    } else if (line.startsWith("●") || line.startsWith("•") || line.startsWith("-")) {
      md += `${line}\n`;
    } else if (currentSection === "experience" && /^[A-Z].*(?:Inc|Ltd|Pte|Corp|Company|Singapore|Govt|\d{4})/i.test(line)) {
      md += `\n### ${line}\n\n`;
    } else {
      md += `${line}\n`;
    }
  }

  return md.trim() + "\n";
}

function getResumeInfo() {
  const dirs = [path.join(writableDir(), "applications", "_master")];
  const repoMaster = path.join(dataDir(), "applications", "_master");
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

export async function GET() {
  try {
    const info = getResumeInfo();
    return NextResponse.json(info);
  } catch (error) {
    console.error("Resume info error:", error);
    return NextResponse.json({ error: "Failed to get resume info" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filename = file.name;
    const ext = path.extname(filename).toLowerCase();

    if (![".pdf", ".docx"].includes(ext)) {
      return NextResponse.json(
        { error: "Only PDF and DOCX files are supported" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    let text: string;
    if (ext === ".pdf") {
      text = await extractTextFromPdf(buffer);
    } else {
      text = await extractTextFromDocx(buffer);
    }

    if (!text || text.trim().length < 100) {
      return NextResponse.json(
        { error: "Could not extract enough text from the file. Please check it contains readable text." },
        { status: 400 }
      );
    }

    const masterDir = getMasterDir();
    
    const binaryPath = path.join(masterDir, ext === ".pdf" ? "resume.pdf" : "resume.docx");
    fs.writeFileSync(binaryPath, buffer);

    const cvMd = convertToMarkdown(text, filename);
    const cvPath = path.join(masterDir, "cv.md");
    fs.writeFileSync(cvPath, cvMd, "utf8");

    const info = getResumeInfo();

    if (process.env.VERCEL) {
      return NextResponse.json({
        ...info,
        warning: "Running on Vercel serverless. Uploaded files are stored in temporary storage and will not persist across deployments. For permanent storage, commit the files to the repository or use external storage.",
      });
    }

    return NextResponse.json(info);
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
