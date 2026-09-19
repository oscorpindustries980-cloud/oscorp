import { AlertOctagon, X } from "lucide-react";
import { usePortal } from "@/lib/portal-store";

export function SuspensionBanner() {
  const { suspensionVisible, dismissSuspension, user } = usePortal();
  if (!suspensionVisible) return null;

  return (
    <div className="sticky top-16 z-40 border-b border-destructive/40 bg-destructive text-destructive-foreground">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <AlertOctagon className="size-5 shrink-0" />
        <p className="text-sm font-medium">
          Your account has been suspended by Oscorp Admin.
          {user?.blockReason ? ` Reason: ${user.blockReason}.` : ""}
        </p>
        <button
          onClick={dismissSuspension}
          className="ml-auto rounded p-1 opacity-80 transition-opacity hover:opacity-100"
          aria-label="Dismiss suspension notice"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
