"use client";

import { FormEvent, useState } from "react";
import { UserPlus } from "lucide-react";
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

export interface AddCounsellorPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface AddCounsellorModalProps {
  open: boolean;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (payload: AddCounsellorPayload) => Promise<void>;
}

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
};

export default function AddCounsellorModal({
  open,
  saving,
  onOpenChange,
  onCreate,
}: AddCounsellorModalProps) {
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
      await onCreate(form);
      setForm(initialForm);
    } catch {
      return;
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Counsellor</DialogTitle>
          <DialogDescription>
            Create a counsellor account for lead handling and admissions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="counsellor-name">Name</Label>
            <Input
              id="counsellor-name"
              required
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="counsellor-email">Email</Label>
            <Input
              id="counsellor-email"
              required
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="counsellor-phone">Phone</Label>
            <Input
              id="counsellor-phone"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="counsellor-password">Password</Label>
            <Input
              id="counsellor-password"
              required
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              <UserPlus className="size-4" />
              {saving ? "Creating..." : "Create Counsellor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
