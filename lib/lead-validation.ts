import {
  leadAssessments,
  leadPriorities,
  leadSources,
  leadStatuses,
  type LeadAssessment,
  type LeadPriority,
  type LeadSource,
  type LeadStatus,
} from "@/types/leads";

export function isLeadSource(value: unknown): value is LeadSource {
  return typeof value === "string" && leadSources.includes(value as LeadSource);
}

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && leadStatuses.includes(value as LeadStatus);
}

export function isLeadPriority(value: unknown): value is LeadPriority {
  return (
    typeof value === "string" && leadPriorities.includes(value as LeadPriority)
  );
}

export function isLeadAssessment(
  value: unknown,
): value is LeadAssessment | null {
  return (
    value === null ||
    (typeof value === "string" &&
      leadAssessments.includes(value as LeadAssessment))
  );
}

export function requiredText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

export function optionalText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}
