import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  isLeadSource,
  optionalText,
  requiredText,
} from "@/lib/lead-validation";
import { mapLead } from "@/lib/mappers";
import { failure, success } from "@/lib/responses";
import { requireAuth } from "@/lib/server-auth";

export const runtime = "nodejs";

const leadSelect = `
  SELECT
    l.id,
    l.name,
    l.phone,
    l.email,
    l.course_interest,
    l.query,
    l.source,
    l.status,
    l.priority,
    l.reachout,
    l.assessment,
    l.assigned_to,
    l.created_at,
    u.name AS assigned_counsellor
  FROM leads l
  LEFT JOIN users u ON u.id = l.assigned_to
`;

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["ADMIN"]);
    if (auth.response) return auth.response;

    const result = await db.query(`${leadSelect} ORDER BY l.created_at DESC`);
    return success(result.rows.map(mapLead), "Leads fetched");
  } catch (error) {
    console.error("Admin leads fetch failed", error);
    return failure("Unable to fetch leads", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["ADMIN"]);
    if (auth.response) return auth.response;

    const body = (await request.json()) as Record<string, unknown>;

    if (
      !requiredText(body.name) ||
      !requiredText(body.phone) ||
      !requiredText(body.courseInterest) ||
      !isLeadSource(body.source)
    ) {
      return failure("Name, phone, course interest and source are required", 400);
    }

    const assignedTo =
      typeof body.assignedTo === "number" ? body.assignedTo : null;

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

    const insert = await db.query<{ id: number }>(
      `INSERT INTO leads
        (name, phone, email, course_interest, query, source, status, priority, reachout, assessment, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, 'NEW', 'NORMAL', false, null, $7, $8)
       RETURNING id`,
      [
        String(body.name).trim(),
        String(body.phone).trim(),
        optionalText(body.email),
        String(body.courseInterest).trim(),
        optionalText(body.query),
        body.source,
        assignedTo,
        auth.user.id,
      ],
    );

    const result = await db.query(`${leadSelect} WHERE l.id = $1`, [
      insert.rows[0].id,
    ]);

    return success(mapLead(result.rows[0]), "Lead created successfully", {
      status: 201,
    });
  } catch (error) {
    console.error("Admin lead creation failed", error);
    return failure("Unable to create lead", 500);
  }
}
