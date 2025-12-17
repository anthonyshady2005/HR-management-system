import { Badge } from "@/components/ui/badge";
import { EmployeeStatus, STATUS_COLORS } from "../types";

interface StatusBadgeProps {
  status?: EmployeeStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  // Handle undefined or missing status
  if (!status) {
    return (
      <Badge
        className={`bg-slate-500/10 text-slate-400 border-slate-500/20 ${className} font-medium`}
        variant="outline"
      >
        Active
      </Badge>
    );
  }

  return (
    <Badge
      className={`${STATUS_COLORS[status]} ${className} font-medium`}
      variant="outline"
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
