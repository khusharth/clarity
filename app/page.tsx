"use client";
import Matrix from "./components/Matrix";
import ConfettiOverlay from "./components/Confetti";
import Settings from "./components/Settings";
import Toasts from "./components/Toasts";
import AddTodoModal from "./components/AddTodoModal";
import { useEffect, useState } from "react";

export default function Home() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          (target as any).isContentEditable);
      if (open || isTyping) return;
      if (
        e.key.toLowerCase() === "a" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div>
      <Matrix />
      <ConfettiOverlay />
      <Settings />
      <Toasts />
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 rounded-full bg-[rgb(var(--color-accent))] px-4 py-3 text-white shadow-[var(--shadow-soft)] transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer"
      >
        Add Task (A)
      </button>
      <a
        href="/completed"
        className="fixed bottom-6 left-28 rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2 text-sm shadow-[var(--shadow-soft)] transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer"
      >
        Completed
      </a>
      <AddTodoModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
