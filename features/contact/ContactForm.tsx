"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { apiRequest } from "@/lib/client-api";
import { leadSources, type LeadSource } from "@/types/leads";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    courseInterest: "",
    query: "",
    source: "WEBSITE" as LeadSource,
  });

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      await apiRequest<{ id: number }>("/api/leads", {
        method: "POST",
        body: JSON.stringify(form),
      });

      toast.success("Admission enquiry submitted");
      setForm({
        name: "",
        phone: "",
        email: "",
        courseInterest: "",
        query: "",
        source: "WEBSITE",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to submit enquiry",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          required
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone">Phone *</Label>
        <Input
          id="phone"
          required
          value={form.phone}
          onChange={(event) => updateField("phone", event.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="courseInterest">Course Interest *</Label>
        <Input
          id="courseInterest"
          required
          value={form.courseInterest}
          onChange={(event) =>
            updateField("courseInterest", event.target.value)
          }
        />
      </div>

      <div className="grid gap-2">
        <Label>Source *</Label>
        <Select
          value={form.source}
          onValueChange={(value) => updateField("source", value)}
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

      <div className="grid gap-2">
        <Label htmlFor="query">Query</Label>
        <Textarea
          id="query"
          rows={4}
          value={form.query}
          onChange={(event) => updateField("query", event.target.value)}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
        <Button type="submit" disabled={loading}>
          <Send className="size-4" />
          {loading ? "Submitting..." : "Submit Enquiry"}
        </Button>
      </div>
    </form>
  );
}
