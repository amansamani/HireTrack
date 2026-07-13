import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { cloudinary } from "@/lib/cloudinary";
import type { UploadApiResponse } from "cloudinary";

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (!ALLOWED_TYPES[file.type]) {
      return NextResponse.json({ error: "Only PDF, DOC, DOCX allowed." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
    }

    const ext = ALLOWED_TYPES[file.type];
    const buffer = Buffer.from(await file.arrayBuffer());

    // resource_type "raw" — these are documents, not images/video, and Cloudinary
    // needs the extension inside public_id for raw files so the URL stays parseable
    // downstream (lib/parse-resume.ts picks the parser off the URL's file extension).
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "hiretrack/resumes",
          public_id: `${randomUUID()}.${ext}`,
        },
        (error, uploadResult) => {
          if (error || !uploadResult) return reject(error ?? new Error("Upload failed."));
          resolve(uploadResult);
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload processing failed." }, { status: 500 });
  }
}