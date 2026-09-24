"use client";

import { GraduationCap } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Lead } from "@/types/leads";

interface AdmitLeadModalProps {
  lead: Lead | null;
  open: boolean;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (lead: Lead) => Promise<void>;
}

export default function AdmitLeadModal({
  lead,
  open,
  saving,
  onOpenChange,
  onConfirm,
}: AdmitLeadModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <GraduationCap className="size-5" />
          </AlertDialogMedia>
          <AlertDialogTitle>
            Admit {lead ? lead.name : "candidate"}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Course: {lead ? lead.courseInterest : "-"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={saving || !lead}
            onClick={(event) => {
              event.preventDefault();
              if (lead) void onConfirm(lead);
            }}
          >
            {saving ? "Admitting..." : "Confirm Admission"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
