"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";

const PAGE_SIZE = 25;

export async function getAllCandidatesAction(page: number = 1) {
  const userId = await requireAuth();
  if (!userId) return { error: "Unauthorized", candidates: [], hasMore: false };

  try {
    const rows = await prisma.candidate.findMany({
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
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE + 1, // one extra row = signal that a next page exists
    });

    const hasMore = rows.length > PAGE_SIZE;
    return { candidates: rows.slice(0, PAGE_SIZE), hasMore };
  } catch (error) {
    console.error("Failed to fetch global candidate pool:", error);
    return { error: "Failed to load candidate list.", candidates: [], hasMore: false };
  }
}