/*
  Warnings:

  - A unique constraint covering the columns `[email,recruiterId]` on the table `Candidate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `recruiterId` to the `Candidate` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Candidate_email_key";

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "recruiterId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "interviewRounds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_email_recruiterId_key" ON "Candidate"("email", "recruiterId");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
