"use client";

import { useState } from "react";
import { GraduationCap, Save } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserRole } from "@/types/auth";
import type { Counsellor } from "@/types/counsellors";
import {
  leadAssessments,
  leadPriorities,
  leadStatuses,
  type Lead,
  type LeadActionPayload,
  type LeadAssessment,
  type LeadPriority,
  type LeadStatus,
} from "@/types/leads";

const none = "__none__";

interface ManageLeadModalProps {
  lead: Lead | null;
  role: UserRole;
  counsellors: Counsellor[];
  open: boolean;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    updates: LeadActionPayload & { assignedTo?: number | null },
  ) => Promise<void>;
  onAdmit: (lead: Lead) => void;
}

interface ManageLeadFormProps extends Omit<ManageLeadModalProps, "open" | "onOpenChange"> {
  lead: Lead;
}

function ManageLeadForm({
  lead,
  role,
  counsellors,
  saving,
  onSave,
  onAdmit,
}: ManageLeadFormProps) {
  const [reachout, setReachout] = useState(lead.reachout ? "true" : "false");
  const [assessment, setAssessment] = useState<LeadAssessment | typeof none>(
    lead.assessment || none,
  );
  const [priority, setPriority] = useState<LeadPriority>(lead.priority);
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [assignedTo, setAssignedTo] = useState<string>(
    lead.assignedTo ? String(lead.assignedTo) : none,
  );

  async function handleSave() {
    await onSave({
      leadId: lead.id,
      reachout: reachout === "true",
      assessment: assessment === none ? null : assessment,
      priority,
      status,
      assignedTo:
        role === "ADMIN"
          ? assignedTo === none
            ? null
            : Number(assignedTo)
          : undefined,
    });
  }

  const canAdmit =
    lead.assessment === "PASS" && lead.status !== "ADMITTED" && !saving;

  return (
    <>
      <div className="grid gap-5">
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">{lead.name}</h2>
              <p className="text-sm text-muted-foreground">
                {lead.courseInterest} - {lead.phone}
              </p>
              {lead.email && (
                <p className="text-sm text-muted-foreground">{lead.email}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={lead.source} />
              <StatusBadge value={lead.status} />
            </div>
          </div>
          {lead.query && (
            <p className="mt-3 text-sm text-muted-foreground">{lead.query}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Reachout</Label>
            <Select value={reachout} onValueChange={setReachout}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Interacted / Reached Out</SelectItem>
                <SelectItem value="false">Not Reached Out</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Assessment</Label>
            <Select
              value={assessment}
              onValueChange={(value) =>
                setAssessment(value as LeadAssessment | typeof none)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={none}>Not assessed</SelectItem>
                {leadAssessments.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Priority</Label>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as LeadPriority)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {leadPriorities.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as LeadStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {leadStatuses.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {role === "ADMIN" && (
            <div className="grid gap-2 sm:col-span-2">
              <Label>Assigned Counsellor</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={none}>Unassigned</SelectItem>
                  {counsellors.map((counsellor) => (
                    <SelectItem
                      key={counsellor.id}
                      value={String(counsellor.id)}
                    >
                      {counsellor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          disabled={!canAdmit}
          onClick={() => onAdmit(lead)}
        >
          <GraduationCap className="size-4" />
          Admit Candidate
        </Button>
        <Button disabled={saving} onClick={handleSave}>
          <Save className="size-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </>
  );
}

export default function ManageLeadModal({
  lead,
  role,
  counsellors,
  open,
  saving,
  onOpenChange,
  onSave,
  onAdmit,
}: ManageLeadModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Lead</DialogTitle>
          <DialogDescription>
            Update counselling status, assessment and admission readiness.
          </DialogDescription>
        </DialogHeader>

        {lead && (
          <ManageLeadForm
            key={lead.id}
            lead={lead}
            role={role}
            counsellors={counsellors}
            saving={saving}
            onSave={onSave}
            onAdmit={onAdmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
