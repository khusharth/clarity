"use client";
import { useEffect, useMemo } from "react";
import { useTodos } from "../store/todos";
import { formatDateTime } from "../lib/dates";

export default function CompletedPage() {
  const { tasks, isHydrated, hydrate, remove } = useTodos();

  useEffect(() => {
    if (!isHydrated) void hydrate();
  }, [isHydrated, hydrate]);

  const completed = useMemo(
    () =>
      tasks
        .filter((t) => t.status === "completed")
        .sort(
          (a, b) =>
            new Date(b.completedAt ?? 0).getTime() - new Date(a.completedAt ?? 0).getTime()
        ),
    [tasks]
  );

  return (
    <main className="mx-auto w-full max-w-3xl p-4">
      <h1 className="mb-4 text-xl font-semibold">Completed</h1>
      {completed.length === 0 ? (
        <p className="text-[rgb(var(--color-fg-muted))]">No completed tasks yet.</p>
      ) : (
        <ul className="divide-y divide-[rgb(var(--color-border))] rounded-[var(--radius-md)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
          {completed.map((t) => (
            <li key={t.id} className="flex items-center justify-between px-3 py-2">
              <div>
                <p className="text-sm">{t.text}</p>
                <p className="text-xs text-[rgb(var(--color-fg-muted))]">
                  Completed {formatDateTime(t.completedAt)}
                </p>
              </div>
              <button
                className="rounded-md border border-[rgb(var(--color-border))] px-2 py-1 text-xs hover:bg-black/5"
                onClick={() => {
                  if (confirm("Delete this completed task?")) void remove(t.id);
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}


