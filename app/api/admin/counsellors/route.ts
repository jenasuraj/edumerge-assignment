import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { mapCounsellor } from "@/lib/mappers";
import { hashPassword } from "@/lib/password";
import { failure, success } from "@/lib/responses";
import { requireAuth } from "@/lib/server-auth";
import { optionalText, requiredText } from "@/lib/lead-validation";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["ADMIN"]);
    if (auth.response) return auth.response;

    const result = await db.query(
      `SELECT id, name, email, phone, is_active
       FROM users
       WHERE UPPER(role) = 'COUNSELLOR'
       ORDER BY name ASC`,
    );

    return success(result.rows.map(mapCounsellor), "Counsellors fetched");
  } catch (error) {
    console.error("Counsellor fetch failed", error);
    return failure("Unable to fetch counsellors", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["ADMIN"]);
    if (auth.response) return auth.response;

    const body = (await request.json()) as Record<string, unknown>;

    if (
      !requiredText(body.name) ||
      !requiredText(body.email) ||
      !requiredText(body.password)
    ) {
      return failure("Name, email and password are required", 400);
    }

    const passwordHash = await hashPassword(String(body.password));
    const result = await db.query(
      `INSERT INTO users (name, email, phone, password, role, is_active)
       VALUES ($1, LOWER($2), $3, $4, 'COUNSELLOR', true)
       RETURNING id, name, email, phone, is_active`,
      [
        String(body.name).trim(),
        String(body.email).trim(),
        optionalText(body.phone),
        passwordHash,
      ],
    );

    return success(
      mapCounsellor(result.rows[0]),
      "Counsellor created successfully",
      { status: 201 },
    );
  } catch (error) {
    console.error("Counsellor creation failed", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return failure("A user with this email already exists", 409);
    }

    return failure("Unable to create counsellor", 500);
  }
}
