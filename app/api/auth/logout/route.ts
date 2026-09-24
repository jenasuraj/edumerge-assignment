import { NextResponse } from "next/server";
import { authCookieOptions, AUTH_COOKIE } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  response.cookies.set(AUTH_COOKIE, "", {
    ...authCookieOptions(),
    maxAge: 0,
  });

  return response;
}
