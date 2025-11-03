"use client";

import { useEffect } from "react";
import { useTodos } from "../store/todos";
import { useToast } from "../store/toast";
import { useSfx } from "../hooks/useSfx";
import type { Task } from "../lib/schema";

export default function DeleteTodoModal({
  task,
  open,
  onClose,
}: {
  task: Task | null;
  open: boolean;
  onClose: () => void;
}) {
  const { remove } = useTodos();
  const sfx = useSfx();
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleDelete() {
    if (!task) return;
    await remove(task.id);
    sfx.remove();
    toast.push({ type: "success", message: "Task deleted" });
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-[90vw] max-w-lg rounded-lg bg-[rgb(var(--color-surface))] p-6 shadow-[var(--shadow-soft)]">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Delete Task</h2>
          <p className="text-[rgb(var(--color-text-muted))]">
            Are you sure you want to delete &quot;{task?.text}&quot;? This
            action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-[rgb(var(--color-hover))] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="rounded-md bg-rose-700/90 hover:bg-rose-900/90 px-4 py-2 text-sm font-medium text-white transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
