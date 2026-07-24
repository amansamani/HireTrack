-- The 20260719090000_add_teams migration dropped the old
-- Candidate_email_recruiterId_key unique index when organizationId replaced
-- recruiterId as the dedup scope, but never created its replacement. schema.prisma
-- already declares @@unique([email, organizationId]), and Prisma Client generates
-- upsert()'s `email_organizationId` compound key from that — this migration just
-- makes the live constraint match what the client has assumed all along.
CREATE UNIQUE INDEX "Candidate_email_organizationId_key" ON "Candidate"("email", "organizationId");