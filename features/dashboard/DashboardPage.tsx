"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, Plus, RefreshCw, UserPlus } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdmissionsTable from "@/features/admissions/AdmissionsTable";
import AdmitLeadModal from "@/features/admissions/AdmitLeadModal";
import AddCounsellorModal, {
  type AddCounsellorPayload,
} from "@/features/counsellors/AddCounsellorModal";
import DashboardStats from "@/features/dashboard/DashboardStats";
import AddLeadModal, {
  type AddLeadPayload,
} from "@/features/leads/AddLeadModal";
import LeadsTable from "@/features/leads/LeadsTable";
import ManageLeadModal from "@/features/leads/ManageLeadModal";
import { ApiError, apiRequest } from "@/lib/client-api";
import type { Admission } from "@/types/admissions";
import type { AuthUser } from "@/types/auth";
import type { Counsellor } from "@/types/counsellors";
import type { Lead, LeadActionPayload } from "@/types/leads";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [admitLead, setAdmitLead] = useState<Lead | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [addCounsellorOpen, setAddCounsellorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadDashboard = useCallback(
    async (knownUser?: AuthUser) => {
      setLoading(true);

      try {
        const activeUser =
          knownUser ?? (await apiRequest<AuthUser>("/api/auth/me")).data;
        const scope = activeUser.role === "ADMIN" ? "admin" : "counsellor";

        setUser(activeUser);

        const [leadResponse, admissionResponse] = await Promise.all([
          apiRequest<Lead[]>(`/api/${scope}/leads`),
          apiRequest<Admission[]>(`/api/${scope}/admissions`),
        ]);

        setLeads(leadResponse.data);
        setAdmissions(admissionResponse.data);

        if (activeUser.role === "ADMIN") {
          const counsellorResponse = await apiRequest<Counsellor[]>(
            "/api/admin/counsellors",
          );
          setCounsellors(counsellorResponse.data);
        } else {
          setCounsellors([]);
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          router.replace("/login");
          return;
        }

        toast.error(
          error instanceof Error ? error.message : "Unable to load dashboard",
        );
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.replace("/login");
    router.refresh();
  }

  async function handleSaveLead(
    updates: LeadActionPayload & { assignedTo?: number | null },
  ) {
    if (!user) return;

    setSaving(true);

    try {
      const { assignedTo, ...actionPayload } = updates;
      const scope = user.role === "ADMIN" ? "admin" : "counsellor";

      await apiRequest(`/api/${scope}/leads/action`, {
        method: "PATCH",
        body: JSON.stringify(actionPayload),
      });

      if (
        user.role === "ADMIN" &&
        assignedTo !== undefined &&
        assignedTo !== selectedLead?.assignedTo
      ) {
        await apiRequest("/api/admin/leads/reassign", {
          method: "PATCH",
          body: JSON.stringify({ leadId: updates.leadId, assignedTo }),
        });
      }

      toast.success("Lead updated");
      setManageOpen(false);
      setSelectedLead(null);
      await loadDashboard(user);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save lead");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateLead(payload: AddLeadPayload) {
    if (!user) return;

    setSaving(true);

    try {
      const scope = user.role === "ADMIN" ? "admin" : "counsellor";
      await apiRequest(`/api/${scope}/leads`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success("Lead created");
      setAddLeadOpen(false);
      await loadDashboard(user);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create lead",
      );
      throw error;
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateCounsellor(payload: AddCounsellorPayload) {
    if (!user) return;

    setSaving(true);

    try {
      await apiRequest("/api/admin/counsellors", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success("Counsellor created");
      setAddCounsellorOpen(false);
      await loadDashboard(user);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create counsellor",
      );
      throw error;
    } finally {
      setSaving(false);
    }
  }

  async function handleAdmitLead(lead: Lead) {
    if (!user) return;

    setSaving(true);

    try {
      const scope = user.role === "ADMIN" ? "admin" : "counsellor";

      await apiRequest(`/api/${scope}/admissions`, {
        method: "POST",
        body: JSON.stringify({
          leadId: lead.id,
          course: lead.courseInterest,
        }),
      });

      toast.success("Candidate admitted");
      setAdmitLead(null);
      setManageOpen(false);
      setSelectedLead(null);
      await loadDashboard(user);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to admit candidate",
      );
    } finally {
      setSaving(false);
    }
  }

  function openManageLead(lead: Lead) {
    setSelectedLead(lead);
    setManageOpen(true);
  }

  if (loading && !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
          <RefreshCw className="size-4 animate-spin" />
          Loading dashboard
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Dashboard
              </h1>
              <StatusBadge value={user.role} />
            </div>
            <p className="text-sm text-muted-foreground">
              {user.name} - {user.email}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => void loadDashboard(user)}
            >
              <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
              Refresh
            </Button>
            <Button onClick={() => setAddLeadOpen(true)}>
              <Plus className="size-4" />
              Add Lead
            </Button>
            {user.role === "ADMIN" && (
              <Button
                variant="outline"
                onClick={() => setAddCounsellorOpen(true)}
              >
                <UserPlus className="size-4" />
                Add Counsellor
              </Button>
            )}
            <Button variant="ghost" onClick={() => void handleLogout()}>
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6">
        <DashboardStats leads={leads} admissions={admissions} />

        <Tabs defaultValue="leads">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="leads">Leads</TabsTrigger>
              <TabsTrigger value="admissions">Admissions</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="leads">
            <LeadsTable leads={leads} role={user.role} onManage={openManageLead} />
          </TabsContent>

          <TabsContent value="admissions">
            <AdmissionsTable admissions={admissions} />
          </TabsContent>
        </Tabs>
      </section>

      <ManageLeadModal
        lead={selectedLead}
        role={user.role}
        counsellors={counsellors}
        open={manageOpen}
        saving={saving}
        onOpenChange={setManageOpen}
        onSave={handleSaveLead}
        onAdmit={(lead) => setAdmitLead(lead)}
      />

      <AddLeadModal
        open={addLeadOpen}
        role={user.role}
        counsellors={counsellors}
        saving={saving}
        onOpenChange={setAddLeadOpen}
        onCreate={handleCreateLead}
      />

      <AdmitLeadModal
        lead={admitLead}
        open={Boolean(admitLead)}
        saving={saving}
        onOpenChange={(open) => !open && setAdmitLead(null)}
        onConfirm={handleAdmitLead}
      />

      {user.role === "ADMIN" && (
        <AddCounsellorModal
          open={addCounsellorOpen}
          saving={saving}
          onOpenChange={setAddCounsellorOpen}
          onCreate={handleCreateCounsellor}
        />
      )}
    </main>
  );
}