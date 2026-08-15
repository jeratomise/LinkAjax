import fs from "node:fs";
import path from "node:path";

async function loadDocx() {
  const mod = await import("docx");
  return mod;
}

async function loadPdfkit() {
  const mod = await import("pdfkit");
  return mod.default || mod;
}

function paragraphsFrom(md) {
  return md
    .replace(/\r\n/g, "\n")
    .split(/\n\n+/)
    .map((block) => block.replace(/^#+\s+/gm, "").replace(/^\s*[-*]\s+/gm, "• ").trim())
    .filter(Boolean);
}

export async function exportApplication(dir, { resumeMd, letter, role }) {
  const { Document, Packer, Paragraph, HeadingLevel } = await loadDocx();
  const PDFDocument = await loadPdfkit();

  function docFrom(title, body) {
    const children = [
      new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
      ...paragraphsFrom(body).map((text) => new Paragraph({ text })),
    ];
    return new Document({
      sections: [{ properties: {}, children }],
    });
  }

  function writePdf(file, title, body) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 56, size: "A4" });
      const stream = fs.createWriteStream(file);
      doc.pipe(stream);
      doc.fontSize(16).text(title, { underline: false });
      doc.moveDown();
      doc.fontSize(11);
      for (const p of paragraphsFrom(body)) {
        doc.text(p, { align: "left" });
        doc.moveDown(0.6);
      }
      doc.end();
      stream.on("finish", resolve);
      stream.on("error", reject);
    });
  }

  const resumeDocx = path.join(dir, "resume.docx");
  const letterDocx = path.join(dir, "cover-letter.docx");
  const resumePdf = path.join(dir, "resume.pdf");
  const letterPdf = path.join(dir, "cover-letter.pdf");

  fs.writeFileSync(resumeDocx, await Packer.toBuffer(docFrom("Jerome Ng", resumeMd)));
  fs.writeFileSync(letterDocx, await Packer.toBuffer(docFrom("Cover letter", letter)));
  await writePdf(resumePdf, `Jerome Ng · ${role}`, resumeMd);
  await writePdf(letterPdf, `Cover letter · ${role}`, letter);

  return {
    resumeDocx,
    letterDocx,
    resumePdf,
    letterPdf,
  };
}
