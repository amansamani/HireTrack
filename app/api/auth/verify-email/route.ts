import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const loginUrl = new URL("/login", req.url);

  if (!token || !email) {
    loginUrl.searchParams.set("verify_error", "missing_params");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const record = await prisma.verificationToken.findUnique({
      where: { identifier_token: { identifier: email, token } },
    });

    if (!record) {
      loginUrl.searchParams.set("verify_error", "invalid_token");
      return NextResponse.redirect(loginUrl);
    }

    if (record.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier: email, token } },
      });
      loginUrl.searchParams.set("verify_error", "expired_token");
      return NextResponse.redirect(loginUrl);
    }

    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token } },
    });

    loginUrl.searchParams.set("verified", "1");
    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error("[verify-email] failed:", error);
    loginUrl.searchParams.set("verify_error", "server_error");
    return NextResponse.redirect(loginUrl);
  }
}