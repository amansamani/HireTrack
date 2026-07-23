CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Membership_organizationId_userId_key" ON "Membership"("organizationId", "userId");
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "TeamInvite" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamInvite_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TeamInvite_token_key" ON "TeamInvite"("token");
CREATE UNIQUE INDEX "TeamInvite_organizationId_email_key" ON "TeamInvite"("organizationId", "email");
ALTER TABLE "TeamInvite" ADD CONSTRAINT "TeamInvite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Job" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "Candidate" ADD COLUMN "organizationId" TEXT;

-- Backfill: every existing user gets their own personal Organization as OWNER,
-- and all their existing jobs/candidates are moved into it. Existing behavior
-- (solo recruiter, private pool) is preserved exactly until they invite someone.
DO $$
DECLARE
  u RECORD;
  new_org_id TEXT;
BEGIN
  FOR u IN SELECT "id", "name" FROM "User" LOOP
    new_org_id := gen_random_uuid()::TEXT;

    INSERT INTO "Organization" ("id", "name", "ownerId", "createdAt")
    VALUES (new_org_id, COALESCE(u."name", 'My') || '''s Team', u."id", CURRENT_TIMESTAMP);

    INSERT INTO "Membership" ("id", "organizationId", "userId", "role", "createdAt")
    VALUES (gen_random_uuid()::TEXT, new_org_id, u."id", 'OWNER', CURRENT_TIMESTAMP);

    UPDATE "Job" SET "organizationId" = new_org_id WHERE "userId" = u."id";
    UPDATE "Candidate" SET "organizationId" = new_org_id WHERE "recruiterId" = u."id";
  END LOOP;
END $$;

ALTER TABLE "Job" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "Candidate" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "Job" ADD CONSTRAINT "Job_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "Job_organizationId_idx" ON "Job"("organizationId");

DROP INDEX IF EXISTS "Candidate_email_recruiterId_key";