import { cn } from "cn";
import { Badge } from "@/components/ui/badge";

const toneByValue: Record<string, string> = {
  NEW: "border-sky-200 bg-sky-50 text-sky-700",
  CONTACTED: "border-indigo-200 bg-indigo-50 text-indigo-700",
  INTERESTED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  FOLLOW_UP: "border-amber-200 bg-amber-50 text-amber-800",
  ADMITTED: "border-emerald-300 bg-emerald-100 text-emerald-800",
  LOST: "border-zinc-200 bg-zinc-100 text-zinc-600",
  PASS: "border-emerald-200 bg-emerald-50 text-emerald-700",
  FAILED: "border-red-200 bg-red-50 text-red-700",
  HIGH: "border-red-200 bg-red-50 text-red-700",
  NORMAL: "border-blue-200 bg-blue-50 text-blue-700",
  LOW: "border-zinc-200 bg-zinc-50 text-zinc-600",
  WEBSITE: "border-cyan-200 bg-cyan-50 text-cyan-700",
  WHATSAPP: "border-green-200 bg-green-50 text-green-700",
  PHONE: "border-violet-200 bg-violet-50 text-violet-700",
  WALK_IN: "border-orange-200 bg-orange-50 text-orange-700",
  FAIR: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  CAMPAIGN: "border-rose-200 bg-rose-50 text-rose-700",
  OTHER: "border-zinc-200 bg-zinc-50 text-zinc-600",
};

interface StatusBadgeProps {
  value: string | null | undefined;
  className?: string;
}

export default function StatusBadge({ value, className }: StatusBadgeProps) {
  const label = value || "NONE";

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 rounded-md px-2 font-medium",
        toneByValue[label] || "border-zinc-200 bg-zinc-50 text-zinc-600",
        className,
      )}
    >
      {label.replace("_", " ")}
    </Badge>
  );
}
