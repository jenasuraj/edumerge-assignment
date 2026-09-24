import { NextRequest } from "next/server";
import { db, getDbClient } from "@/lib/db";
import { mapAdmission } from "@/lib/mappers";
import { failure, success } from "@/lib/responses";
import { requireAuth } from "@/lib/server-auth";
import { requiredText } from "@/lib/lead-validation";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["ADMIN"]);
    if (auth.response) return auth.response;

    const result = await db.query(
      `SELECT
        a.id,
        a.lead_id,
        l.name,
        l.phone,
        l.email,
        l.source,
        a.course,
        u.name AS admitted_by,
        a.admission_date
       FROM admissions a
       JOIN leads l ON l.id = a.lead_id
       JOIN users u ON u.id = a.admitted_by
       ORDER BY a.admission_date DESC`,
    );

    return success(result.rows.map(mapAdmission), "Admissions fetched");
  } catch (error) {
    console.error("Admin admissions fetch failed", error);
    return failure("Unable to fetch admissions", 500);
  }
}

export async function POST(request: NextRequest) {
  let client: Awaited<ReturnType<typeof getDbClient>> | null = null;

  try {
    const auth = await requireAuth(request, ["ADMIN"]);
    if (auth.response) return auth.response;

    const body = (await request.json()) as Record<string, unknown>;
    const leadId = typeof body.leadId === "number" ? body.leadId : null;

    if (!leadId || !requiredText(body.course)) {
      return failure("Lead id and course are required", 400);
    }

    client = await getDbClient();
    await client.query("BEGIN");

    const lead = await client.query<{
      id: number;
      status: string;
      assessment: string | null;
    }>(
      `SELECT id, status, assessment
       FROM leads
       WHERE id = $1
       FOR UPDATE`,
      [leadId],
    );

    if (!lead.rowCount) {
      await client.query("ROLLBACK");
      return failure("Lead not found", 404);
    }

    if (lead.rows[0].assessment !== "PASS") {
      await client.query("ROLLBACK");
      return failure("Only leads with passed assessment can be admitted", 400);
    }

    if (lead.rows[0].status === "ADMITTED") {
      await client.query("ROLLBACK");
      return failure("Lead is already admitted", 409);
    }

    const admission = await client.query<{ id: number }>(
      `INSERT INTO admissions (lead_id, course, admitted_by)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [leadId, String(body.course).trim(), auth.user.id],
    );

    await client.query(`UPDATE leads SET status = 'ADMITTED' WHERE id = $1`, [
      leadId,
    ]);
    await client.query("COMMIT");

    return success(
      { id: admission.rows[0].id },
      "Candidate admitted successfully",
      { status: 201 },
    );
  } catch (error) {
    await client?.query("ROLLBACK").catch(() => undefined);
    console.error("Admin admission failed", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return failure("Lead is already admitted", 409);
    }

    return failure("Unable to admit candidate", 500);
  } finally {
    client?.release();
  }
}
