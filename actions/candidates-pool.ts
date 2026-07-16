"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";

export async function getAllCandidatesAction() {
  const userId = await requireAuth();
  if (!userId) return { error: "Unauthorized", candidates: [] };

  try {
    const candidates = await prisma.candidate.findMany({
      where: { recruiterId: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        resumeUrl: true,
        createdAt: true,
        // OPTIMIZATION: Only fetch the most recent application to display current stage/job.
        // Previously, this fetched the candidate's entire application history, bloating the payload.
        applications: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            stage: true,
            job: { select: { title: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { candidates };
  } catch (error) {
    console.error("Failed to fetch global candidate pool:", error);
    return { error: "Failed to load candidate list.", candidates: [] };
  }
}