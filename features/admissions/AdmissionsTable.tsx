import StatusBadge from "@/components/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import type { Admission } from "@/types/admissions";

interface AdmissionsTableProps {
  admissions: Admission[];
}

export default function AdmissionsTable({
  admissions,
}: AdmissionsTableProps) {
  if (!admissions.length) {
    return (
      <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
        No admissions yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Admitted By</TableHead>
              <TableHead>Admission Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admissions.map((admission) => (
              <TableRow key={admission.id}>
                <TableCell className="font-medium">{admission.name}</TableCell>
                <TableCell>{admission.phone}</TableCell>
                <TableCell>{admission.email || "-"}</TableCell>
                <TableCell>{admission.course}</TableCell>
                <TableCell>
                  <StatusBadge value={admission.source} />
                </TableCell>
                <TableCell>{admission.admittedBy}</TableCell>
                <TableCell>{formatDate(admission.admissionDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
