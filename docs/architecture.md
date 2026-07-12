# Architecture

## Data Model

HireTrack's core entities and relationships:
User (recruiter)
└── Job (1:many) — owns jobs via userId
└── JobApplication (1:many)
├── Candidate (many:1) — a candidate can apply to multiple jobs
├── Interview (1:many)
└── ActivityLog (1:many)

- `User` — a recruiter account. Created via `/register`, authenticated via NextAuth credentials provider (bcrypt-hashed passwords).
- `Job` — a job posting, owned by exactly one `User` via `userId`. Public applicants view this via `/jobs/[id]` with no auth required.
- `Candidate` — a person who applied. Not tied to a single job; the same candidate record is reused (via `connectOrCreate` on email) if they apply to multiple jobs from the same recruiter.
- `JobApplication` — the join between a `Candidate` and a `Job`, carrying pipeline `stage` (enum: APPLIED → SCREENING → TECHNICAL → HR → OFFER / REJECTED → HIRED), plus AI-derived `matchScore` and `aiSummary`.
- `Interview` — scheduled interview rounds tied to a `JobApplication`.
- `ActivityLog` — an append-only audit trail of every pipeline action, scoped per application.

## Auth & Authorization

Authentication uses NextAuth v5 with a credentials provider (email + bcrypt-hashed password). Sessions are JWT-based.

Because Next.js 16 runs middleware/proxy on the Edge Runtime — which can't run Node-only code like `bcrypt` or Prisma's Postgres driver — auth config is split into two files:
- `lib/auth.config.ts` — Edge-safe config (session/JWT callbacks, no database code), used by `proxy.ts` for route protection.
- `lib/auth.ts` — full config with the Prisma adapter and bcrypt-based credentials provider, used everywhere else (login, registration, server actions).

Authorization is enforced server-side on every server action, not just at the route level. Every action that reads or mutates a job, candidate, or application first re-verifies that `job.userId === session.user.id` before proceeding — a logged-in recruiter can never view or modify another recruiter's data by guessing an ID, even though the underlying database has no row-level security itself.

## Public vs. Private Surface

- **Private** (`/dashboard/*`): gated by `proxy.ts`, requires an authenticated session.
- **Public** (`/`, `/login`, `/register`, `/jobs/[id]`): explicitly excluded from the auth check. Candidates interact only with `/jobs/[id]`, which posts to an unauthenticated server action (`submitApplicationAction`) that still validates input server-side with Zod and checks for duplicate applications before writing.

## Resume Parsing & AI Scoring

On submission, if a resume was uploaded:
1. The file is validated server-side (MIME type allowlist, 5MB size cap) and saved with a randomly generated filename (prevents path traversal from a malicious original filename).
2. Text is extracted server-side from the file on disk — `pdf-parse` for PDFs, `mammoth` for DOC/DOCX.
3. The extracted text plus the job's title/description are sent to the Google Gemini API (free tier), prompted to return structured JSON: extracted skills, estimated years of experience, a 0–100 match score, and a short summary.
4. The result is persisted directly on the `JobApplication` row (`matchScore`, `aiSummary`) so it's visible instantly in the recruiter's pipeline view — no separate fetch or polling needed.

If scoring fails for any reason (rate limit, malformed response, network error), the error is logged but the application submission still succeeds — a candidate is never blocked from applying because of an AI service hiccup.

## Notifications

Candidate-facing emails (stage changes, interview scheduling) are sent via Gmail SMTP through Nodemailer, triggered synchronously inside the same server action that performs the pipeline update — same fail-open pattern as resume scoring: if the email fails, the pipeline action itself still succeeds and the error is only logged.

## Notable Trade-offs

- **No role/permission tiers** — every registered user is a full recruiter with identical capabilities. A team/multi-recruiter model was considered but scoped out to keep the trial submission focused.
- **Soft workflow, not hard delete** — candidates and applications are never destroyed through the UI; recruiters "reject" (a stage change) rather than delete, preserving history. This mirrors how production ATS tools like Greenhouse/Lever behave.
- **Free-tier dependencies** — Gemini's free tier (1,500 requests/day) and Gmail SMTP were chosen deliberately to keep the project runnable with zero cost, at the trade-off of lower throughput than a paid provider.