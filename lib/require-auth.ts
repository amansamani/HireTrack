"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// requireAuth() runs on every server action call. The `user still exists`
// check below exists only to catch the rare stale/mismatched session (see
// the bug this was originally added for) — it's not an authorization check,
// the signed JWT already proves identity. Re-querying Postgres for that on
// every single click is a wasted round trip almost every time, so cache a
// verified userId for TTL_MS and skip the query on repeat calls.
//
// This is a best-effort, per-serverless-instance cache (a plain module-level
// Map), not a distributed cache — a cold start or a request landing on a
// different instance just re-verifies once. Worst case, a deleted user's
// session takes up to TTL_MS to be caught instead of instantly, which is the
// same class of staleness a JWT already tolerates between refreshes.
const verifiedUsers = new Map<string, number>();
const TTL_MS = 60_000;

async function userStillExists(userId: string): Promise<boolean> {
  const lastVerified = verifiedUsers.get(userId);
  if (lastVerified !== undefined && Date.now() - lastVerified < TTL_MS) {
    return true;
  }

  const exists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!exists) {
    verifiedUsers.delete(userId);
    return false;
  }

  verifiedUsers.set(userId, Date.now());
  return true;
}

export async function requireAuth() {
  const session = await auth();

  if (session && !session.user) {
    console.error(
      "[requireAuth] auth() returned a session-shaped object with no `.user` — " +
      "this usually means AUTH_SECRET is missing or invalid, not that the user is logged out.",
      session
    );
  }

  if (!session?.user?.id) return null;

  const userId = session.user.id as string;
  const exists = await userStillExists(userId);
  if (!exists) {
    console.error(`[requireAuth] session userId ${userId} has no matching User row — stale/invalid session. User must log out and back in.`);
    return null;
  }

  return userId;
}