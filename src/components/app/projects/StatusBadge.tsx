"use client";

import { cn, getStatusColor } from "@/lib/utils";
import { ProjectStatus } from "@/lib/types";
import { differenceInDays } from "date-fns";

type StatusBadgeProps = {
  status: ProjectStatus;
  deadline?: Date | string;
  className?: string;
};

export default function StatusBadge({ status, deadline, className }: StatusBadgeProps) {
  const now = new Date();
  let displayStatus = status;
  if (status !== 'Done' && deadline && differenceInDays(now, new Date(deadline)) > 0) {
    displayStatus = 'Delayed';
  }

  const colorClasses = getStatusColor(status, deadline);

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        colorClasses,
        className
      )}
    >
      <span className={cn("w-2 h-2 mr-2 rounded-full bg-current")} />
      {displayStatus}
    </div>
  );
}
