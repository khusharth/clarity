"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTodos } from "../store/todos";
import { formatDateTime } from "../lib/dates";
import { ArrowLeft, Trash2 } from "lucide-react";
import DeleteTodoModal from "../components/DeleteTodoModal";
import { Task } from "../lib/schema";

const DeleteTaskCta = (props: { task: Task }) => {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <button
        className="rounded-md p-1 hover:bg-[rgb(var(--color-error))]/20 text-[rgb(var(--color-error))] transition-colors cursor-pointer"
        aria-label="Delete"
        title="Delete"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 size={16} />
      </button>
      <DeleteTodoModal
        task={props.task}
        open={deleteOpen}
        onCloseAction={() => setDeleteOpen(false)}
      />
    </>
  );
};
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
            new Date(b.completedAt ?? 0).getTime() -
            new Date(a.completedAt ?? 0).getTime()
        ),
    [tasks]
  );

  return (
    <>
      <div className="mx-auto max-w-3xl p-4">
        <div className="mb-4 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-1.5 text-sm transition-colors hover:bg-accent/10 cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <h1 className="text-xl font-semibold">Completed</h1>
        </div>
        {completed.length === 0 ? (
          <p className="text-[rgb(var(--color-fg-muted))]">
            No completed tasks yet.
          </p>
        ) : (
          <ul className="divide-y divide-[rgb(var(--color-border))] rounded-[var(--radius-md)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
            {completed.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between px-3 py-2"
              >
                <div>
                  <p className="text-sm">{t.text}</p>
                  <p className="text-xs text-[rgb(var(--color-fg-muted))]">
                    Completed {formatDateTime(t.completedAt)}
                  </p>
                </div>
                <DeleteTaskCta task={t} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
