"use client";
import { useEffect } from "react";
import { useToast } from "../store/toast";
import { AnimatePresence, motion } from "framer-motion";

export default function Toasts() {
  const { toasts, remove } = useToast();

  useEffect(() => {
    const timers = toasts.map((t) =>
      setTimeout(() => remove(t.id), 2400)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, remove]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 mx-auto flex w-full max-w-md flex-col gap-2 px-4">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-auto rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2 shadow-[var(--shadow-soft)]"
            style={{
              borderColor:
                t.type === "success"
                  ? "rgb(var(--q2))"
                  : t.type === "error"
                  ? "rgb(var(--q4))"
                  : t.type === "warn"
                  ? "rgb(var(--q3))"
                  : "rgb(var(--color-border))",
            }}
          >
            <div className="text-sm">{t.message}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}


