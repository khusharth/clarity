"use client";

import { Hash } from "lucide-react";
import type { ReactNode } from "react";

export interface TaskCountBadgeProps {
  count: number;
  label: string;
  icon?: ReactNode;
  className?: string;
}

export function TaskCountBadge({
  count,
  label,
  icon = <Hash size={14} />,
  className = "",
}: TaskCountBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[rgb(var(--color-bg-elevated))] text-[rgb(var(--color-text-muted))] text-sm font-medium ${className}`}
      role="status"
      aria-label={`${label}: ${count}`}
    >
      {icon}
      <span className="tabular-nums">{count}</span>
    </div>
  );
}
