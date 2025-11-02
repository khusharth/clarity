"use client";
import Matrix from "./components/Matrix";
import ConfettiOverlay from "./components/Confetti";
import Settings from "./components/Settings";
import AddTodoModal from "./components/AddTodoModal";
import { useEffect, useState } from "react";

export default function Home() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "a" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="min-h-screen">
      <Matrix />
      <ConfettiOverlay />
      <Settings />
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 rounded-full bg-[rgb(var(--color-accent))] px-4 py-3 text-white shadow-[var(--shadow-soft)]"
      >
        Add Task (A)
      </button>
      <AddTodoModal open={open} onClose={() => setOpen(false)} />
    </main>
  );
}
