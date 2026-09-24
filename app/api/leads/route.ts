import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { failure, success } from "@/lib/responses";
import { optionalText, requiredText } from "@/lib/lead-validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (
      !requiredText(body.name) ||
      !requiredText(body.phone) ||
      !requiredText(body.courseInterest)
    ) {
      return failure("Name, phone and course interest are required", 400);
    }

    const result = await db.query<{ id: number }>(
      `INSERT INTO leads
        (name, phone, email, course_interest, query, source, status, priority, reachout, assessment, assigned_to)
       VALUES ($1, $2, $3, $4, $5, 'WEBSITE', 'NEW', 'NORMAL', false, null, null)
       RETURNING id`,
      [
        String(body.name).trim(),
        String(body.phone).trim(),
        optionalText(body.email),
        String(body.courseInterest).trim(),
        optionalText(body.query),
      ],
    );

    return success(
      { id: result.rows[0].id },
      "Admission enquiry submitted successfully",
      { status: 201 },
    );
  } catch (error) {
    console.error("Public lead creation failed", error);
    return failure("Unable to submit admission enquiry", 500);
  }
}
