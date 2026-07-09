"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ApplicationSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  candidateName: z.string().min(2, "Name must be at least 2 characters"),
  candidateEmail: z.string().email("Invalid email address"),
});

export async function submitApplicationAction(values: z.infer<typeof ApplicationSchema>) {
  const validatedFields = ApplicationSchema.safeParse(values);
  
  if (!validatedFields.success) {
    return { error: "Please fill out all fields correctly." };
  }

  const { jobId, candidateName, candidateEmail } = validatedFields.data;

  try {
    const jobExists = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!jobExists) {
      return { error: "This job posting is no longer active." };
    }

    await (prisma.jobApplication.create as any)({
      data: {
      stage: "APPLIED",
      job: {
        connect: { id: jobId }
      },
      candidate: {
        create: {
          fullName: candidateName,
          email: candidateEmail,
          experience: 0
        }
      }
    },
    });

    return { success: "Your application has been submitted successfully!" };
  } catch (error) {
    console.error("Public submission error:", error);
    return { error: "An error occurred while submitting your application." };
  }
}