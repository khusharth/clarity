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
  const hasMoreThanOneQ1 = q1.length > 1;

  if (!hasQ1) return <div className="p-2" />;

  return (
    <div className="flex items-center gap-2 p-2 mb-1">
      <div className="inline-flex items-center gap-2">
        <span className="text-sm font-medium">Focus:</span>

        <button
          type="button"
          role="switch"
          aria-checked={isFocus}
          onClick={() => {
            sfx.focus();
            isFocus ? exitFocus() : enterFocus("all");
          }}
          disabled={!hasQ1 && !isFocus}
          className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
            isFocus
              ? "bg-[rgb(var(--color-accent))]"
              : "bg-[rgb(var(--color-border))]"
          } ${
            !hasQ1 && !isFocus
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer"
          }`}
        >
          <span
            aria-hidden="true"
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
              isFocus ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {isFocus && hasMoreThanOneQ1 && (
        <>
          <div className="ml-2 inline-flex items-center gap-1 text-sm">
            <label className="mr-1">Mode:</label>
            <select
              className="rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-2 py-1 text-sm cursor-pointer"
              value={focusMode}
              onChange={(e) => setFocusMode(e.target.value as any)}
            >
              <option value="all">All Q1</option>
              <option value="single">Single</option>
            </select>
          </div>
          {focusMode === "single" && (
            <button
              className="ml-2 rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-1 text-sm shadow-[var(--shadow-soft)] disabled:opacity-50 cursor-pointer"
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
