import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const user = await verifyAuthToken(token);

  if (pathname.startsWith("/dashboard") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const proxyConfig = {
  matcher: ["/dashboard/:path*", "/login"],
};
