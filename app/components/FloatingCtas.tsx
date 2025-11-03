import { useEffect, useState } from "react";
import Link from "next/link";
import Settings from "./Settings";
import AddTodoModal from "./AddTodoModal";

const FloatingCtas = () => {
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
    <>
      <div className="z-1 relative">
        <Settings />
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 rounded-full bg-[rgb(var(--color-accent))] px-4 py-3 text-white shadow-[var(--shadow-soft)] transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer"
        >
          Add Task (A)
        </button>
        <Link
          href="/completed"
          className="fixed bottom-6 left-28 rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2 text-sm shadow-[var(--shadow-soft)] transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer"
        >
          Completed
        </Link>
      </div>

      <AddTodoModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default FloatingCtas;
