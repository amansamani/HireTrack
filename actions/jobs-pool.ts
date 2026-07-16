"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client"; // Import Prisma namespace for error instances

export async function getAllJobsAction() {
  const userId = await requireAuth();
  if (!userId) return { error: "Unauthorized", jobs: [] };

  try {
    const jobs = await prisma.job.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        department: true,
        location: true,
        type: true,
        status: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { jobs };
  } catch (error) {
    console.error("Failed to fetch jobs pool:", error);
    return { error: "Failed to load jobs list.", jobs: [] };
  }
}

export async function updateJobStatusAction(jobId: string, status: "OPEN" | "CLOSED" | "FILLED") {
  const userId = await requireAuth();
  if (!userId) return { error: "Unauthorized" };

  try {
    await prisma.job.update({
      where: { id: jobId, userId },
      data: { status },
    });

    revalidatePath("/dashboard/jobs");
    revalidatePath(`/dashboard/jobs/${jobId}`);
    return { success: true };
  } catch (error) {
    // Catch the specific Prisma error when the record doesn't exist or userId doesn't match
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { error: "Job not found or unauthorized" };
    }
    
    console.error("Failed to update job status:", error);
    return { error: "Failed to update job status" };
  }
}

export async function deleteJobAction(jobId: string) {
  const userId = await requireAuth();
  if (!userId) return { error: "Unauthorized" };

  try {
    const deletedJob = await prisma.job.delete({
      where: { id: jobId, userId },
      select: { title: true }, 
    });

    revalidatePath("/dashboard/jobs");
    return { success: `"${deletedJob.title}" deleted.` };
  } catch (error) {
    // Catch the specific Prisma error when the record doesn't exist or userId doesn't match
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { error: "Job not found or unauthorized" };
    }

    console.error("Failed to delete job:", error);
    return { error: "Failed to delete job." };
  }
}