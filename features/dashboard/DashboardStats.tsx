import { CheckCircle2, ClipboardList, GraduationCap, PhoneCall, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Admission } from "@/types/admissions";
import type { Lead } from "@/types/leads";

interface DashboardStatsProps {
  leads: Lead[];
  admissions: Admission[];
}

export default function DashboardStats({
  leads,
  admissions,
}: DashboardStatsProps) {
  const stats = [
    {
      label: "Total Leads",
      value: leads.length,
      icon: ClipboardList,
      tone: "text-sky-700",
    },
    {
      label: "Reached Out",
      value: leads.filter((lead) => lead.reachout).length,
      icon: PhoneCall,
      tone: "text-indigo-700",
    },
    {
      label: "Passed Assessment",
      value: leads.filter((lead) => lead.assessment === "PASS").length,
      icon: CheckCircle2,
      tone: "text-emerald-700",
    },
    {
      label: "Failed Assessment",
      value: leads.filter((lead) => lead.assessment === "FAILED").length,
      icon: XCircle,
      tone: "text-red-700",
    },
    {
      label: "Admissions",
      value: admissions.length,
      icon: GraduationCap,
      tone: "text-violet-700",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card key={stat.label} className="rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <Icon className={`size-4 ${stat.tone}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
