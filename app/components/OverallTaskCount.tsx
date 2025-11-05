"use client";

import { useMemo } from "react";
import { useTodos } from "../store/todos";
import { TaskCountBadge } from "./TaskCountBadge";

export function OverallTaskCount() {
  const tasks = useTodos((state) => state.tasks);
  const isFocus = useTodos((state) => state.isFocus);
  const showOverallCount = useTodos((state) => state.showOverallCount);

  const counts = useMemo(() => {
    const activeTasks = tasks.filter((t) => t.status === "active");

    return {
      overall: activeTasks.length,
      q1: activeTasks.filter((t) => t.isUrgent && t.isImportant).length,
    };
  }, [tasks]);

  // Don't render if the setting is off
  if (!showOverallCount) {
    return null;
  }

  // In focus mode, show Q1 count; otherwise show overall count
  const displayCount = isFocus ? counts.q1 : counts.overall;
  const label = isFocus ? "Q1 Tasks" : "Total Tasks";

  return <TaskCountBadge count={displayCount} label={label} />;
}
