import { NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
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

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("cv_text, cv_source, cv_updated_at")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      cvExists: !!profile?.cv_text,
      cvUpdated: profile?.cv_updated_at || "",
      pdfExists: false, // We could check storage, but not critical for UI
      source: profile?.cv_source || "",
    });
  } catch (error) {
    console.error("Resume info error:", error);
    return NextResponse.json({ error: "Failed to get resume info" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filename = file.name;
    const ext = filename.split(".").pop()?.toLowerCase();

    if (!ext || !["pdf", "docx"].includes(ext)) {
      return NextResponse.json(
        { error: "Only PDF and DOCX files are supported" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    let text: string;
    if (ext === "pdf") {
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

    const supabase = await createClient();

    // Upload file to Supabase Storage
    const storagePath = `${user.id}/resume.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(storagePath, buffer, {
        contentType: ext === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    // Convert to markdown and update profile
    const cvMd = convertToMarkdown(text, filename);
    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        cv_text: cvMd,
        cv_source: `${filename} (uploaded ${now.split("T")[0]})`,
        cv_updated_at: now,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({
      cvExists: true,
      cvUpdated: now,
      pdfExists: ext === "pdf",
      source: `${filename} (uploaded ${now.split("T")[0]})`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
