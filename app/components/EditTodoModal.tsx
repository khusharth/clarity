"use client";
import { useState, useEffect } from "react";
import { useTodos } from "../store/todos";
import { useToast } from "../store/toast";
import { useSfx } from "../hooks/useSfx";
import type { Task } from "../lib/schema";

export default function EditTodoModal({
  task,
  open,
  onClose,
}: {
  task: Task | null;
  open: boolean;
  onClose: () => void;
}) {
  const { updateText, toggleUrgent, toggleImportant } = useTodos();
  const sfx = useSfx();
  const toast = useToast();
  const [text, setText] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [important, setImportant] = useState(false);

  useEffect(() => {
    if (open && task) {
      setText(task.text);
      setUrgent(task.isUrgent);
      setImportant(task.isImportant);
    }
  }, [open, task]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!task) return;
    const trimmed = text.trim();
    if (!trimmed) {
      toast.push({ type: "error", message: "Task text cannot be empty" });
      return;
    }

    // Update text if changed
    if (trimmed !== task.text) {
      await updateText(task.id, trimmed);
    }

    // Update urgent if changed
    if (urgent !== task.isUrgent) {
      await toggleUrgent(task.id);
    }

    // Update important if changed
    if (important !== task.isImportant) {
      await toggleImportant(task.id);
    }

    sfx.toggle();
    toast.push({ type: "success", message: "Task updated" });
    onClose();
  }

  if (!open || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 cursor-pointer"
        role="button"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-4 shadow-[var(--shadow-soft)]">
        <h2 className="mb-3 text-lg font-medium">Edit Task</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full rounded-md border border-[rgb(var(--color-border))] bg-transparent px-3 py-2 outline-none"
          />
          <div className="flex items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={urgent}
                onChange={(e) => setUrgent(e.target.checked)}
                className="cursor-pointer"
              />
              Urgent
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={important}
                onChange={(e) => setImportant(e.target.checked)}
                className="cursor-pointer"
              />
              Important
            </label>
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-1 text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-[rgb(var(--color-accent))] px-3 py-1 text-sm text-white cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
