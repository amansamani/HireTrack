import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function extractResumeText(fileUrl: string): Promise<string> {
  // fileUrl is now a Cloudinary secure_url (e.g. "https://res.cloudinary.com/.../resumes/xxx.pdf")
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to download resume: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const ext = fileUrl.split(".").pop()?.toLowerCase();

  if (ext === "pdf") {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  }

  if (ext === "doc" || ext === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  return "";
}
