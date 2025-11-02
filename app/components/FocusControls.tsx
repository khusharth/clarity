"use client";
import { useTodos } from "../store/todos";
import { useSfx } from "../hooks/useSfx";
import { useMemo } from "react";

export default function FocusControls() {
  const {
    tasks,
    isFocus,
    focusMode,
    activeTaskId,
    enterFocus,
    exitFocus,
    setFocusMode,
    nextFocusTask,
    setActiveTask,
  } = useTodos();
  const sfx = useSfx();

  const q1 = useMemo(
    () =>
      tasks.filter((t) => t.status === "active" && t.isUrgent && t.isImportant),
    [tasks]
  );
  const hasQ1 = q1.length > 0;

  return (
    <div className="flex items-center gap-2 p-2">
      <button
        className="rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-2 text-sm shadow-[var(--shadow-soft)] disabled:opacity-50"
        onClick={() => {
          sfx.focus();
          isFocus ? exitFocus() : enterFocus("all");
        }}
        disabled={!hasQ1 && !isFocus}
      >
        {isFocus ? "✨ Exit Focus" : "✨ Focus Q1"}
      </button>
      {isFocus && (
        <>
          <div className="ml-2 inline-flex items-center gap-1 text-sm">
            <label className="mr-1">Mode:</label>
            <select
              className="rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-2 py-1 text-sm"
              value={focusMode}
              onChange={(e) => setFocusMode(e.target.value as any)}
            >
              <option value="all">All Q1</option>
              <option value="single">Single</option>
            </select>
          </div>
          {focusMode === "single" && (
            <button
              className="ml-2 rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-1 text-sm shadow-[var(--shadow-soft)] disabled:opacity-50"
              onClick={() => {
                if (!activeTaskId && q1[0]) setActiveTask(q1[0].id);
                else nextFocusTask();
              }}
              disabled={!hasQ1}
            >
              Next
            </button>
          )}
        </>
      )}
    </div>
  );
}
