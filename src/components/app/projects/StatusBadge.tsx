
"use client";

import { cn, getStatusColor, getDisplayStatus } from "@/lib/utils";
import { Project, ProjectStatus } from "@/lib/types";

type StatusBadgeProps = {
  status: ProjectStatus;
  deadline?: Date | string;
  className?: string;
};

export default function StatusBadge({ status, deadline, className }: StatusBadgeProps) {
  const now = new Date();
  let displayStatus: ProjectStatus | 'Delayed' = status;
  if (status !== 'Done' && deadline && now > new Date(deadline)) {
    displayStatus = 'Delayed';
  }

  const colorClasses = getStatusColor(status, deadline);

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        colorClasses,
        className
      )}
    >
      <span className={cn("w-2 h-2 mr-2 rounded-full", displayStatus === 'Delayed' ? 'bg-red-500' : 'bg-current')} />
      {displayStatus}
    </div>
  );
}
