"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";

export async function getAllInterviewsAction() {
  const userId = await requireAuth();
  if (!userId) return { error: "Unauthorized", interviews: [] };

  try {
    // OPTIMIZATION: Use `select` instead of `include` for precise data fetching.
    // This prevents fetching unnecessary columns and reduces network payload size.
    const interviews = await prisma.interview.findMany({
      where: { application: { job: { userId } } },
      select: {
        id: true,
        round: true,
        interviewer: true,
        scheduledAt: true,
        application: {
          select: {
            job: { select: { title: true } },
            candidate: { select: { fullName: true, email: true } },
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
      // Note: If this list grows to hundreds of items, consider adding `take: 50` 
      // and implementing pagination or a "Load More" button.
    });

    return { interviews };
  } catch (error) {
    console.error("Failed to fetch interviews pool:", error);
    return { error: "Failed to load interviews list.", interviews: [] };
  }
}