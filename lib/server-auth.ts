import type { NextRequest } from "next/server";
import { getRequestTokenUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { failure } from "@/lib/responses";
import type { AuthUser, UserRole } from "@/types/auth";

type AuthSuccess = { user: AuthUser; response?: never };
type AuthFailure = { user?: never; response: Response };

export async function requireAuth(
  request: NextRequest,
  allowedRoles?: UserRole[],
): Promise<AuthSuccess | AuthFailure> {
  const tokenUser = await getRequestTokenUser(request);

  if (!tokenUser) {
    return { response: failure("Unauthenticated", 401) };
  }

  if (allowedRoles && !allowedRoles.includes(tokenUser.role)) {
    return { response: failure("Forbidden", 403) };
  }

  const result = await db.query<{
    id: number;
    name: string;
    email: string;
    role: UserRole;
  }>(
    `SELECT id, name, email, UPPER(role)::text AS role
     FROM users
     WHERE id = $1 AND email = $2 AND UPPER(role) = $3 AND is_active = true`,
    [tokenUser.id, tokenUser.email, tokenUser.role],
  );

  if (!result.rowCount) {
    return { response: failure("Unauthenticated", 401) };
  }

  return { user: result.rows[0] };
}
