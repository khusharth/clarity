"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTodos } from "../store/todos";
import { formatDateTime } from "../lib/dates";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import DeleteTodoModal from "../components/DeleteTodoModal";
import { Modal } from "../components/ui/Modal";
import { useSfx } from "../hooks/useSfx";
import { useToast } from "../store/toast";
import { Task } from "../lib/schema";

const DeleteTaskCta = (props: { task: Task }) => {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        contentType="icon-only"
        className="rounded-md hover:bg-[rgb(var(--color-error))]/20! text-[rgb(var(--color-error))]"
        aria-label="Delete"
        title="Delete"
        onClick={() => setDeleteOpen(true)}
        icon={<Trash2 size={16} />}
      />

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
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const sfx = useSfx();
  const toast = useToast();

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

  const handleDeleteAll = async () => {
    for (const task of completed) {
      await remove(task.id);
    }
    sfx.remove();
    toast.push({
      type: "success",
      message: `Deleted ${completed.length} task${
        completed.length === 1 ? "" : "s"
      }`,
    });
    setDeleteAllOpen(false);
  };

  return (
    <>
      <div className="mx-auto max-w-3xl p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-1.5 text-sm transition-colors hover:bg-accent/10 cursor-pointer"
            >
              <ArrowLeft size={16} />
              Back
            </Link>
            <h1 className="text-xl font-semibold">Completed</h1>
          </div>
          {completed.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-[rgb(var(--color-error))] hover:bg-[rgb(var(--color-error))]/20"
              onClick={() => setDeleteAllOpen(true)}
              icon={<Trash2 size={16} />}
            >
              <span className="hidden sm:inline">Delete</span> All
            </Button>
          )}
        </div>
        {completed.length === 0 ? (
          <p className="text-[rgb(var(--color-fg-muted))]">
            No completed tasks yet.
          </p>
        ) : (
          <ul className="divide-y divide-[rgb(var(--color-border))] rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
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

      <Modal
        open={deleteAllOpen}
        onClose={() => setDeleteAllOpen(false)}
        title="Delete All Completed Tasks"
        description={`Are you sure you want to delete all ${
          completed.length
        } completed task${
          completed.length === 1 ? "" : "s"
        }? This action cannot be undone.`}
        openSfx="remove"
      >
        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => setDeleteAllOpen(false)}
            size="sm"
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteAll} size="sm">
            Delete All
          </Button>
        </div>
      </Modal>
    </>
  );
}
