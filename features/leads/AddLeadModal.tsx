"use client";

import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { UserRole } from "@/types/auth";
import type { Counsellor } from "@/types/counsellors";
import { leadSources, type LeadSource } from "@/types/leads";

const none = "__none__";

export interface AddLeadPayload {
  name: string;
  phone: string;
  email: string;
  courseInterest: string;
  query: string;
  source: LeadSource;
  assignedTo?: number | null;
}

interface AddLeadModalProps {
  open: boolean;
  role: UserRole;
  counsellors: Counsellor[];
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (payload: AddLeadPayload) => Promise<void>;
}

const initialForm = {
  name: "",
  phone: "",
  email: "",
  courseInterest: "",
  query: "",
  source: "PHONE" as LeadSource,
  assignedTo: none,
};

export default function AddLeadModal({
  open,
  role,
  counsellors,
  saving,
  onOpenChange,
  onCreate,
}: AddLeadModalProps) {
  const [form, setForm] = useState(initialForm);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setForm(initialForm);
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await onCreate({
        name: form.name,
        phone: form.phone,
        email: form.email,
        courseInterest: form.courseInterest,
        query: form.query,
        source: form.source,
        assignedTo:
          role === "ADMIN"
            ? form.assignedTo === none
              ? null
              : Number(form.assignedTo)
            : undefined,
      });
      setForm(initialForm);
    } catch {
      return;
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Lead</DialogTitle>
          <DialogDescription>
            Create an enquiry from phone, walk-in, campaign or other channels.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="lead-name">Name</Label>
              <Input
                id="lead-name"
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lead-phone">Phone</Label>
              <Input
                id="lead-phone"
                required
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lead-email">Email</Label>
              <Input
                id="lead-email"
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lead-course">Course Interest</Label>
              <Input
                id="lead-course"
                required
                value={form.courseInterest}
                onChange={(event) =>
                  updateField("courseInterest", event.target.value)
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>Source</Label>
              <Select
                value={form.source}
                onValueChange={(value) =>
                  updateField("source", value as LeadSource)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {leadSources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {role === "ADMIN" && (
              <div className="grid gap-2">
                <Label>Assigned Counsellor</Label>
                <Select
                  value={form.assignedTo}
                  onValueChange={(value) => updateField("assignedTo", value)}
                >
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

          <div className="grid gap-2">
            <Label htmlFor="lead-query">Query</Label>
            <Textarea
              id="lead-query"
              rows={3}
              value={form.query}
              onChange={(event) => updateField("query", event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              <Plus className="size-4" />
              {saving ? "Creating..." : "Create Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
