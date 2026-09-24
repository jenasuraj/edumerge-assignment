import { jwtVerify, SignJWT } from "jose";
import type { NextRequest } from "next/server";
import type { UserRole } from "@/types/auth";

export const AUTH_COOKIE = "edumerge_token";
const roles = ["ADMIN", "COUNSELLOR"] as const;

export interface TokenUser {
  id: number;
  email: string;
  role: UserRole;
}

function getJwtSecret() {
  const secret =
    process.env.JWT_SECRET || "edumerge-development-secret-change-me";

  return new TextEncoder().encode(secret);
}

function isRole(value: unknown): value is UserRole {
  return typeof value === "string" && roles.includes(value as UserRole);
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function signAuthToken(user: TokenUser) {
  return new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyAuthToken(token?: string) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    if (
      typeof payload.id !== "number" ||
      typeof payload.email !== "string" ||
      !isRole(payload.role)
    ) {
      return null;
    }

    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest) {
  return request.cookies.get(AUTH_COOKIE)?.value;
}

export async function getRequestTokenUser(request: NextRequest) {
  return verifyAuthToken(getTokenFromRequest(request));
}
