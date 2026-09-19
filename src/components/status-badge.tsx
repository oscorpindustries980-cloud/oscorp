import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { QuotationStatus } from "@/lib/portal-store";

const map: Record<QuotationStatus, string> = {
  Submitted: "bg-info/10 text-info border-info/30",
  "Under Review": "bg-warning/15 text-warning-foreground border-warning/40",
  Approved: "bg-accent/12 text-accent border-accent/35",
  Rejected: "bg-destructive/10 text-destructive border-destructive/30",
};

export function StatusBadge({ status }: { status: QuotationStatus }) {
  return (
    <Badge variant="outline" className={cn("rounded-full font-medium", map[status])}>
      <span className="mr-1.5 inline-block size-1.5 rounded-full bg-current" />
      {status}
    </Badge>
  );
}

export function AccountBadge({ status }: { status: "Active" | "Blocked" }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full font-medium",
        status === "Active"
          ? "bg-accent/12 text-accent border-accent/35"
          : "bg-destructive/10 text-destructive border-destructive/30",
      )}
    >
      <span className="mr-1.5 inline-block size-1.5 rounded-full bg-current" />
      {status.toUpperCase()}
    </Badge>
  );
}
