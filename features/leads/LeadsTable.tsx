import { Settings2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import type { UserRole } from "@/types/auth";
import type { Lead } from "@/types/leads";

interface LeadsTableProps {
  leads: Lead[];
  role: UserRole;
  onManage: (lead: Lead) => void;
}

export default function LeadsTable({ leads, role, onManage }: LeadsTableProps) {
  if (!leads.length) {
    return (
      <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
        No leads found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Source</TableHead>
              {role === "ADMIN" && <TableHead>Counsellor</TableHead>}
              <TableHead>Reachout</TableHead>
              <TableHead>Assessment</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>{lead.phone}</TableCell>
                <TableCell>{lead.courseInterest}</TableCell>
                <TableCell>
                  <StatusBadge value={lead.source} />
                </TableCell>
                {role === "ADMIN" && (
                  <TableCell>{lead.assignedCounsellor || "Unassigned"}</TableCell>
                )}
                <TableCell>{lead.reachout ? "YES" : "NO"}</TableCell>
                <TableCell>
                  <StatusBadge value={lead.assessment} />
                </TableCell>
                <TableCell>
                  <StatusBadge value={lead.priority} />
                </TableCell>
                <TableCell>
                  <StatusBadge value={lead.status} />
                </TableCell>
                <TableCell>{formatDate(lead.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onManage(lead)}
                  >
                    <Settings2 className="size-4" />
                    Manage
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
