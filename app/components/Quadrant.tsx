"use client";

import { useMemo, useRef, useEffect } from "react";
import { useTodos } from "../store/todos";
import type { Task } from "../lib/schema";
import EmptyState from "./EmptyState";
import { TaskCountBadge } from "./TaskCountBadge";
import type { QuadrantId } from "../hooks/useDragAndDrop";

export default function Quadrant({
  title,
  colorVar,
  children,
  isEmpty,
  emptyMessage,
  onEmptyClick,
  quadrantId,
  tasks,
  isDropTarget,
  setQuadrantRef,
  isDragging,
}: {
  title: string;
  colorVar: string; // CSS rgb triplet variable name, e.g., --q1
  children?: React.ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  onEmptyClick?: () => void;
  quadrantId?: "q1" | "q2" | "q3" | "q4";
  tasks?: Task[];
  isDropTarget?: boolean;
  setQuadrantRef?: (id: QuadrantId, ref: HTMLElement | null) => void;
  isDragging?: boolean;
}) {
  const showQuadrantCounts = useTodos((state) => state.showQuadrantCounts);
  const isFocus = useTodos((state) => state.isFocus);
  const quadrantRef = useRef<HTMLElement>(null);

  // Register quadrant ref for drop zone detection
  useEffect(() => {
    if (quadrantId && setQuadrantRef && quadrantRef.current) {
      const mappedId = quadrantId.toUpperCase() as QuadrantId;
      setQuadrantRef(mappedId, quadrantRef.current);
      return () => setQuadrantRef(mappedId, null);
    }
  }, [quadrantId, setQuadrantRef]);

  const count = useMemo(() => {
    if (!tasks) return 0;
    return tasks.filter((t) => t.status === "active").length;
  }, [tasks]);

  // Determine if we should show the count
  // Don't show any per-quadrant counts in focus mode
  const shouldShowCount =
    showQuadrantCounts && quadrantId !== undefined && !isFocus;

  const dropTargetClasses = isDropTarget
    ? "ring-2 ring-blue-500 bg-blue-50/10"
    : "";

  return (
    <section
      ref={quadrantRef}
      className={`flex flex-col gap-3 rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-3 shadow-(--shadow-soft) transition-shadow hover:shadow-lg ${dropTargetClasses}`}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: `rgb(var(${colorVar}))` }}
          />
          <h2 className="text-sm font-medium">{title}</h2>
        </div>
        {shouldShowCount && (
          <TaskCountBadge count={count} label={`${title} tasks`} />
        )}
      </header>
      <div className="min-h-24">
        {isEmpty ? (
          <EmptyState
            message={emptyMessage ?? "No items yet"}
            onClick={isDragging ? undefined : onEmptyClick}
            disabled={isDragging}
          />
        ) : (
          children
        )}
      </div>
    </section>
  );
}
