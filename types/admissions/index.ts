import type { LeadSource } from "@/types/leads";

export interface Admission {
  id: number;
  leadId: number;
  name: string;
  phone: string;
  email: string | null;
  course: string;
  source: LeadSource;
  admittedBy: string;
  admissionDate: string;
}
