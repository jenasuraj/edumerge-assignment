import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { failure, success } from "@/lib/responses";
import { requireAuth } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["ADMIN"]);
    if (auth.response) return auth.response;

    const body = (await request.json()) as Record<string, unknown>;
    const leadId = typeof body.leadId === "number" ? body.leadId : null;
    const assignedTo =
      typeof body.assignedTo === "number" ? body.assignedTo : null;

    if (!leadId) {
      return failure("Lead id is required", 400);
    }

    if (assignedTo !== null) {
      const counsellor = await db.query(
        `SELECT id FROM users
         WHERE id = $1 AND UPPER(role) = 'COUNSELLOR' AND is_active = true`,
        [assignedTo],
      );

      if (!counsellor.rowCount) {
        return failure("Selected counsellor is not available", 400);
      }
    }

    const result = await db.query(
      `UPDATE leads
       SET assigned_to = $2
       WHERE id = $1
       RETURNING id`,
      [leadId, assignedTo],
    );

    if (!result.rowCount) {
      return failure("Lead not found", 404);
    }

    return success({ id: leadId }, "Lead reassigned successfully");
  } catch (error) {
    console.error("Lead reassignment failed", error);
    return failure("Unable to reassign lead", 500);
  }
}
