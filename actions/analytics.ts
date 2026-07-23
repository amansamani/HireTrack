"use server";

import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/require-auth";

export async function getRecruiterAnalyticsAction() {
  const ctx = await requireOrg();
  if (!ctx) return { error: "Unauthorized", stats: null };

  try {
    const [totalJobs, applicationGroups] = await Promise.all([
      prisma.job.count({ where: { organizationId: ctx.organizationId } }),
      prisma.jobApplication.groupBy({
        by: ["stage"],
        where: { job: { organizationId: ctx.organizationId } },
        _count: { _all: true },
      }),
    ]);

    let totalApplications = 0, totalOffers = 0, totalHired = 0, totalInterviews = 0;

    for (const group of applicationGroups) {
      const count = group._count._all;
      const stage = group.stage;
      totalApplications += count;
      if (stage === "OFFER") totalOffers += count;
      else if (stage === "HIRED") totalHired += count;
      else if (stage !== "APPLIED" && stage !== "REJECTED") totalInterviews += count;
    }

    return { stats: { totalJobs, totalApplications, totalOffers, totalInterviews, totalHired } };
  } catch (error) {
    console.error("[getRecruiterAnalyticsAction] Analytics failure:", error);
    return { error: "Failed to compile aggregate platform metrics.", stats: null };
  }
}