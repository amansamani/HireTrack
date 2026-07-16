"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";

export async function getRecruiterAnalyticsAction() {
  const userId = await requireAuth();
  if (!userId) return { error: "Unauthorized", stats: null };

  try {

    const [totalJobs, applicationGroups] = await Promise.all([
      prisma.job.count({ where: { userId } }),
      prisma.jobApplication.groupBy({
        by: ["stage"],
        where: {
          job: { userId },
        },
        _count: {
          _all: true,
        },
      }),
    ]);

    let totalApplications = 0;
    let totalOffers = 0;
    let totalHired = 0;
    let totalInterviews = 0;


    for (const group of applicationGroups) {
      const count = group._count._all;
      const stage = group.stage;

      // Increment overall candidate volume
      totalApplications += count;

      // Categorize stage dynamically
      if (stage === "OFFER") {
        totalOffers += count;
      } else if (stage === "HIRED") {
        totalHired += count;
      } else if (stage !== "APPLIED" && stage !== "REJECTED") {
  
        totalInterviews += count;
      }
    }

    return {
      stats: {
        totalJobs,
        totalApplications,
        totalOffers,
        totalInterviews,
        totalHired,
      },
    };
  } catch (error) {
    console.error("[getRecruiterAnalyticsAction] Analytics failure:", error);
    return { error: "Failed to compile aggregate platform metrics.", stats: null };
  }
}