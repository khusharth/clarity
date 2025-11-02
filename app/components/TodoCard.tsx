"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTodos } from "../store/todos";
import type { Task } from "../lib/schema";
import { CheckCircle2, Trash2, Flame, Sparkles } from "lucide-react";
import { useAppReducedMotion } from "../hooks/useAppReducedMotion";
import { useSfx } from "../hooks/useSfx";

export default function TodoCard({ task }: { task: Task }) {
  const { toggleUrgent, toggleImportant, complete, remove, celebrate } = useTodos();
  const reduced = useAppReducedMotion();
  const sfx = useSfx();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      tabIndex={0}
      onKeyDown={async (e) => {
        if (e.key.toLowerCase() === "c") {
          celebrate();
          await complete(task.id);
        } else if (e.key === "Delete" || e.key === "Backspace") {
          await remove(task.id);
        } else if (e.key.toLowerCase() === "u") {
          await toggleUrgent(task.id);
        } else if (e.key.toLowerCase() === "i") {
          await toggleImportant(task.id);
        }
      }}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={reduced ? undefined : { opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: reduced ? 0 : 0.18 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group flex items-center justify-between rounded-[var(--radius-sm)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2 shadow-[var(--shadow-soft)]"
    >
      <div className="min-w-0 pr-2">
        <p className="truncate text-sm">{task.text}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-[rgb(var(--color-fg-muted))]">
          <button
            className="inline-flex items-center gap-1 hover:underline"
            onClick={async () => {
              sfx.toggle();
              await toggleUrgent(task.id);
            }}
            aria-label="Toggle urgent"
          >
            <Flame size={14} /> {task.isUrgent ? "Urgent" : "Not urgent"}
          </button>
          <span>•</span>
          <button
            className="inline-flex items-center gap-1 hover:underline"
            onClick={async () => {
              sfx.toggle();
              await toggleImportant(task.id);
            }}
            aria-label="Toggle important"
          >
            <Sparkles size={14} />{" "}
            {task.isImportant ? "Important" : "Not important"}
          </button>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 opacity-80">
        <button
          onClick={async () => {
            sfx.complete();
            celebrate();
            await complete(task.id);
          }}
          className="rounded-md p-1 hover:bg-black/5"
          aria-label="Complete"
          title="Complete"
        >
          <CheckCircle2 size={16} />
        </button>
        <button
          onClick={async () => {
            sfx.remove();
            await remove(task.id);
          }}
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
