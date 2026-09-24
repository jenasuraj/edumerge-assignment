import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  isLeadAssessment,
  isLeadPriority,
  isLeadStatus,
} from "@/lib/lead-validation";
import { failure, success } from "@/lib/responses";
import { requireAuth } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["ADMIN"]);
    if (auth.response) return auth.response;

    const body = (await request.json()) as Record<string, unknown>;
    const leadId = typeof body.leadId === "number" ? body.leadId : null;

    if (!leadId) {
      return failure("Lead id is required", 400);
    }

    const values: unknown[] = [leadId];
    const updates: string[] = [];

    if ("reachout" in body) {
      if (typeof body.reachout !== "boolean") {
        return failure("Reachout must be true or false", 400);
      }
      values.push(body.reachout);
      updates.push(`reachout = $${values.length}`);
    }

    if ("assessment" in body) {
      if (!isLeadAssessment(body.assessment)) {
        return failure("Assessment must be PASS or FAILED", 400);
      }
      values.push(body.assessment);
      updates.push(`assessment = $${values.length}`);
    }

    if ("status" in body) {
      if (!isLeadStatus(body.status)) {
        return failure("Invalid lead status", 400);
      }
      values.push(body.status);
      updates.push(`status = $${values.length}`);
    }

    if ("priority" in body) {
      if (!isLeadPriority(body.priority)) {
        return failure("Invalid lead priority", 400);
      }
      values.push(body.priority);
      updates.push(`priority = $${values.length}`);
    }

    if (!updates.length) {
      return failure("No supported lead fields supplied", 400);
    }

    const result = await db.query(
      `UPDATE leads
       SET ${updates.join(", ")}
       WHERE id = $1
       RETURNING id`,
      values,
    );

    if (!result.rowCount) {
      return failure("Lead not found", 404);
    }

    return success({ id: leadId }, "Lead updated successfully");
  } catch (error) {
    console.error("Admin lead update failed", error);
    return failure("Unable to update lead", 500);
  }
}
