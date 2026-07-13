"use server";

import { auth } from "@/lib/auth";

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
  return session.user.id as string;
}