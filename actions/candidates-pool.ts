"use server";

import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/require-auth";

const PAGE_SIZE = 25;

export async function getAllCandidatesAction(page: number = 1, search: string = "") {
  const ctx = await requireOrg();
  if (!ctx) return { error: "Unauthorized", candidates: [], hasMore: false };

  const trimmed = search.trim();

  try {
    const rows = await prisma.candidate.findMany({
      where: {
        organizationId: ctx.organizationId,
        ...(trimmed
          ? {
              OR: [
                { fullName: { contains: trimmed, mode: "insensitive" } },
                { email: { contains: trimmed, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        resumeUrl: true,
        createdAt: true,
        applications: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { stage: true, job: { select: { title: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE + 1,
    });

    const hasMore = rows.length > PAGE_SIZE;
    return { candidates: rows.slice(0, PAGE_SIZE), hasMore };
  } catch (error) {
    console.error("Failed to fetch global candidate pool:", error);
    return { error: "Failed to load candidate list.", candidates: [], hasMore: false };
  }
}

export async function exportCandidatesCsvAction() {
  const ctx = await requireOrg();
  if (!ctx) return { error: "Unauthorized" };

  try {
    const rows = await prisma.candidate.findMany({
      where: { organizationId: ctx.organizationId },
      select: {
        fullName: true,
        email: true,
        phone: true,
        experience: true,
        currentCompany: true,
        currentCTC: true,
        expectedCTC: true,
        resumeUrl: true,
        createdAt: true,
        applications: { orderBy: { createdAt: "desc" }, take: 1, select: { stage: true, job: { select: { title: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const header = ["Name", "Email", "Phone", "Experience (yrs)", "Current Company", "Current CTC", "Expected CTC", "Latest Job", "Stage", "Resume URL", "Applied Date"];

    const lines = rows.map((c) => {
      const latest = c.applications[0];
      return [
        c.fullName, c.email, c.phone ?? "", String(c.experience), c.currentCompany ?? "",
        c.currentCTC != null ? String(c.currentCTC) : "", c.expectedCTC != null ? String(c.expectedCTC) : "",
        latest?.job.title ?? "", latest?.stage ?? "", c.resumeUrl ?? "", c.createdAt.toISOString().split("T")[0],
      ].map((v) => escape(String(v))).join(",");
    });

    const csv = [header.map(escape).join(","), ...lines].join("\n");
    return { csv };
  } catch (error) {
    console.error("Failed to export candidates:", error);
    return { error: "Failed to export candidates." };
  }
}