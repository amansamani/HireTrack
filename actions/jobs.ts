"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const JobSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  department: z.string().min(2, "Department is required"),
  location: z.string().min(2, "Location is required"),
  type: z.string().min(1, "Job type is required"),
  salaryRange: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export async function createJobAction(values: z.infer<typeof JobSchema>) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: "Unauthorized! Please log in." };
  }

  const validatedFields = JobSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid form fields." };
  }

  try {
    await prisma.job.create({
      data: {
        ...validatedFields.data,
        userId: session.user.id,
      },
    });

    revalidatePath("/jobs");
    return { success: "Job posting created successfully!" };
  } catch (error) {
    return { error: "Failed to create job posting." };
  }
}

export async function getJobsAction() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: "Unauthorized", jobs: [] };
  }

  try {
    const jobs = await prisma.job.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return { jobs };
  } catch (error) {
    return { error: "Failed to fetch jobs", jobs: [] };
  }
}