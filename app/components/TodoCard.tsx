"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTodos } from "../store/todos";
import type { Task } from "../lib/schema";
import { CheckCircle2, Trash2, Flame, Sparkles } from "lucide-react";

export default function TodoCard({ task }: { task: Task }) {
  const { toggleUrgent, toggleImportant, complete, remove } = useTodos();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group flex items-center justify-between rounded-[var(--radius-sm)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2 shadow-[var(--shadow-soft)]"
    >
      <div className="min-w-0 pr-2">
        <p className="truncate text-sm">{task.text}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-[rgb(var(--color-fg-muted))]">
          <button
            className="inline-flex items-center gap-1 hover:underline"
            onClick={() => toggleUrgent(task.id)}
            aria-label="Toggle urgent"
          >
            <Flame size={14} /> {task.isUrgent ? "Urgent" : "Not urgent"}
          </button>
          <span>•</span>
          <button
            className="inline-flex items-center gap-1 hover:underline"
            onClick={() => toggleImportant(task.id)}
            aria-label="Toggle important"
          >
            <Sparkles size={14} />{" "}
            {task.isImportant ? "Important" : "Not important"}
          </button>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 opacity-80">
        <button
          onClick={() => complete(task.id)}
          className="rounded-md p-1 hover:bg-black/5"
          aria-label="Complete"
          title="Complete"
        >
          <CheckCircle2 size={16} />
        </button>
        <button
          onClick={() => remove(task.id)}
          className="rounded-md p-1 hover:bg-black/5"
          aria-label="Delete"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}
