import type { Admission } from "@/types/admissions";
import type { Counsellor } from "@/types/counsellors";
import type { Lead } from "@/types/leads";

type DbRow = Record<string, unknown>;

function text(value: unknown) {
  return String(value ?? "");
}

function nullableText(value: unknown) {
  return value === null || value === undefined ? null : String(value);
}

function dateText(value: unknown) {
  return value instanceof Date ? value.toISOString() : text(value);
}

export function mapLead(row: DbRow): Lead {
  return {
    id: Number(row.id),
    name: text(row.name),
    phone: text(row.phone),
    email: nullableText(row.email),
    courseInterest: text(row.course_interest),
    query: nullableText(row.query),
    source: text(row.source) as Lead["source"],
    status: text(row.status) as Lead["status"],
    priority: text(row.priority) as Lead["priority"],
    reachout: Boolean(row.reachout),
    assessment: nullableText(row.assessment) as Lead["assessment"],
    assignedTo: row.assigned_to === null ? null : Number(row.assigned_to),
    assignedCounsellor: nullableText(row.assigned_counsellor),
    createdAt: dateText(row.created_at),
  };
}

export function mapAdmission(row: DbRow): Admission {
  return {
    id: Number(row.id),
    leadId: Number(row.lead_id),
    name: text(row.name),
    phone: text(row.phone),
    email: nullableText(row.email),
    course: text(row.course),
    source: text(row.source) as Admission["source"],
    admittedBy: text(row.admitted_by),
    admissionDate: dateText(row.admission_date),
  };
}

export function mapCounsellor(row: DbRow): Counsellor {
  return {
    id: Number(row.id),
    name: text(row.name),
    email: text(row.email),
    phone: nullableText(row.phone),
    isActive: Boolean(row.is_active),
  };
}
