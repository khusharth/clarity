"use client";
import { useState, useEffect } from "react";
import { useTodos } from "../store/todos";
import { useToast } from "../store/toast";
import { useSfx } from "../hooks/useSfx";

export default function AddTodoModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { add } = useTodos();
  const sfx = useSfx();
  const toast = useToast();
  const [text, setText] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [important, setImportant] = useState(false);

  useEffect(() => {
    if (open) {
      setText("");
      setUrgent(false);
      setImportant(false);
    }
  }, [open]);

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
    const trimmed = text.trim();
    if (!trimmed) return;
    await add(trimmed, urgent, important);
    sfx.add();
    toast.push({ type: "success", message: "Task added" });
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 cursor-pointer"
        role="button"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-md border border-border bg-[rgb(var(--color-surface))] p-4 shadow-[var(--shadow-soft)]">
        <h2 className="mb-3 text-lg font-medium">Add Task</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full rounded-md border border-border bg-transparent px-3 py-2 outline-none"
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
              Add
            </button>
          </div>
          <p className="mt-1 text-xs text-[rgb(var(--color-fg-muted))]">Shortcut: press A to open</p>
        </form>
      </div>
    </div>
  );
}


