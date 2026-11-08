import type { ReactNode } from "react";
import { AVAILABILITY_LABEL, type Availability } from "@/lib/availability";
import { cn } from "@/lib/utils";

const STYLES: Record<Availability, string> = {
  available: "bg-success/12 text-success",
  low: "bg-warning/12 text-warning",
  out: "bg-muted text-muted-foreground",
};

const DOT: Record<Availability, string> = {
  available: "bg-success",
  low: "bg-warning",
  out: "bg-muted-foreground/60",
};

type AvailabilityBadgeProps = {
  availability: Availability;
  className?: string;
};

/** Estado de existencias con punto de color y texto (nunca solo color). */
export function AvailabilityBadge({ availability, className }: AvailabilityBadgeProps): ReactNode {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        STYLES[availability],
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", DOT[availability])} />
      {AVAILABILITY_LABEL[availability]}
    </span>
  );
}
