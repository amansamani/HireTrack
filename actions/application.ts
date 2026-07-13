"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/send-email";
import { stageChangeEmail } from "@/lib/email-templates";

const STAGES = ["APPLIED", "SCREENING", "TECHNICAL", "HR", "OFFER", "HIRED", "REJECTED"] as const;
const StageSchema = z.enum(STAGES);

export async function getJobApplicantsAction(jobId: string) {
  const userId = await requireAuth();
  if (!userId) return { error: "Unauthorized", applications: [] };

  try {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.userId !== userId) {
      return { error: "Unauthorized", applications: [] };
    }

    const applications = await prisma.jobApplication.findMany({
      where: { jobId },
      include: { candidate: true },
      orderBy: { createdAt: "desc" },
    });

    const activityLogs = await prisma.activityLog.findMany({
      where: { application: { jobId } },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return { applications, activityLogs };
  } catch (error) {
    console.error("Fetch error detail:", error);
    return { error: "Failed to fetch applicants", applications: [], activityLogs: [] };
  }
}

export async function updateApplicationStatusAction(applicationId: string, status: string, jobId: string) {
  const userId = await requireAuth();
  if (!userId) return { error: "Unauthorized" };

  const parsedStage = StageSchema.safeParse(status);
  if (!parsedStage.success) return { error: "Invalid pipeline stage." };

  try {
    const currentApp = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { candidate: true, job: true }
    });

    if (!currentApp) return { error: "Application not found" };
    if (currentApp.job.userId !== userId) return { error: "Unauthorized" };

    await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { stage: parsedStage.data },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        applicationId,
        action: `Moved to ${status}`,
        details: `${currentApp.candidate.fullName} shifted from ${currentApp.stage} to ${status}`
      }
    });

    const { subject, html } = stageChangeEmail(currentApp.candidate.fullName, currentApp.job.title, status);
    await sendEmail(currentApp.candidate.email, subject, html);

    revalidatePath(`/dashboard/jobs/${jobId}`);
    return { success: `Candidate moved to ${status}` };
  } catch (error) {
    console.error("Update error detail:", error);
    return { error: "Failed to update pipeline stage" };
  }
}