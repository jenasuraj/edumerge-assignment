import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server-auth";
import { failure, success } from "@/lib/responses";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;

    return success(auth.user, "Authenticated");
  } catch (error) {
    console.error("Auth lookup failed", error);
    return failure("Unable to verify session", 500);
  }
}
