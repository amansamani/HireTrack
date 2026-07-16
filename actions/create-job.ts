"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";
import { revalidatePath } from "next/cache";

// OPTIMIZATION: Strict Zod schema prevents malformed data from ever reaching the database.
// It also provides automatic, clean error messages if validation fails.
const CreateJobSchema = z.object({
  title: z.string().trim().min(1, "Job title is required").max(100),
  department: z.string().trim().min(1, "Department is required").max(50),
  location: z.string().trim().min(1, "Location is required").max(100),
  type: z.string().trim().default("Full-time"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  interviewRounds: z.array(z.string().trim()).optional(),
});

// Best practice: Accept `unknown` for server actions to prevent type spoofing from the client
export async function createJobAction(rawData: unknown) {
  const userId = await requireAuth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  // 1. Validate the incoming data
  const parsed = CreateJobSchema.safeParse(rawData);
  if (!parsed.success) {
    // Extract the first error message to show the user
    const firstError = parsed.error.issues[0]?.message || "Invalid data provided.";
    return { error: firstError };
  }

  const data = parsed.data;

  // 2. Clean and deduplicate interview rounds (Your excellent logic, preserved!)
  const interviewRounds = Array.from(
  new Set((data.interviewRounds ?? []).map((r) => r).filter(Boolean))
);

  try {
    const newJob = await prisma.job.create({
      data: {
        userId,
        title: data.title,
        department: data.department,
        location: data.location,
        type: data.type,
        description: data.description,
        status: "OPEN",
        interviewRounds,
      },
    });

    // OPTIMIZATION: Revalidate BOTH the jobs list AND the main dashboard.
    // This ensures the "Total Postings" stat card updates instantly without a page refresh.
    revalidatePath("/dashboard/jobs");
    revalidatePath("/dashboard");
    
    return { success: "Job position created successfully!", jobId: newJob.id };
  } catch (error) {
    console.error("[createJobAction] Job creation error:", error);
    const detail =
      process.env.NODE_ENV !== "production" && error instanceof Error
        ? `Failed to create job position: ${error.message}`
        : "Failed to create job position.";
    return { error: detail };
  }
}