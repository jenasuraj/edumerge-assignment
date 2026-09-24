import { NextRequest, NextResponse } from "next/server";
import { authCookieOptions, AUTH_COOKIE, signAuthToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { failure } from "@/lib/responses";
import type { UserRole } from "@/types/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password.trim() : "";

    if (!email || !password) {
      return failure("Email and password are required", 400);
    }

    const result = await db.query<{
      id: number;
      name: string;
      email: string;
      role: UserRole;
      password: string;
    }>(
      `SELECT id, name, email, UPPER(role)::text AS role, password
       FROM users
       WHERE LOWER(email) = LOWER($1) AND is_active = true`,
      [email],
    );

    const user = result.rows[0];
    const validPassword = user
      ? await verifyPassword(password, user.password)
      : false;

    if (!user || !validPassword) {
      return failure("Invalid email or password", 401);
    }

    const token = await signAuthToken(user);
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set(AUTH_COOKIE, token, authCookieOptions());
    return response;
  } catch (error) {
    console.error("Login failed", error);
    return failure("Unable to login", 500);
  }
}
