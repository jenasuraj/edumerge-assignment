export const leadSources = [
  "WEBSITE",
  "WHATSAPP",
  "PHONE",
  "WALK_IN",
  "FAIR",
  "CAMPAIGN",
  "OTHER",
] as const;

export const leadStatuses = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "FOLLOW_UP",
  "ADMITTED",
  "LOST",
] as const;

export const leadPriorities = ["LOW", "NORMAL", "HIGH"] as const;
export const leadAssessments = ["PASS", "FAILED"] as const;

export type LeadSource = (typeof leadSources)[number];
export type LeadStatus = (typeof leadStatuses)[number];
export type LeadPriority = (typeof leadPriorities)[number];
export type LeadAssessment = (typeof leadAssessments)[number];

export interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  courseInterest: string;
  query: string | null;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  reachout: boolean;
  assessment: LeadAssessment | null;
  assignedTo: number | null;
  assignedCounsellor: string | null;
  createdAt: string;
}

export interface LeadActionPayload {
  leadId: number;
  reachout?: boolean;
  assessment?: LeadAssessment | null;
  status?: LeadStatus;
  priority?: LeadPriority;
}
