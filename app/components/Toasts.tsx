"use client";
import { useEffect } from "react";
import { useToast } from "../store/toast";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";

export default function Toasts() {
  const { toasts, remove } = useToast();

  useEffect(() => {
    const timers = toasts.map((t) => setTimeout(() => remove(t.id), 3000));
    return () => timers.forEach(clearTimeout);
  }, [toasts, remove]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 mx-auto flex w-full max-w-md flex-col gap-2 px-4">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const borderColor =
            t.type === "success"
              ? "border-green-400/50 dark:border-green-500/50"
              : t.type === "error"
              ? "border-red-400/50 dark:border-red-500/50"
              : t.type === "warn"
              ? "border-amber-400/50 dark:border-amber-500/50"
              : "border-blue-400/50 dark:border-blue-500/50";

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.18 }}
              className={`pointer-events-auto rounded-md border ${borderColor} bg-[rgb(var(--color-surface))] px-3 py-2 shadow-(--shadow-soft)`}
            >
              <div className="flex items-center gap-2">
                {t.type === "success" ? (
                  <CheckCircle2
                    size={16}
                    className="text-green-500 dark:text-green-400"
                  />
                ) : t.type === "error" ? (
                  <AlertCircle
                    size={16}
                    className="text-red-500 dark:text-red-400"
                  />
                ) : t.type === "warn" ? (
                  <AlertTriangle
                    size={16}
                    className="text-amber-500 dark:text-amber-400"
                  />
                ) : (
                  <Info
                    size={16}
                    className="text-blue-500 dark:text-blue-400"
                  />
                )}
                <div className="text-sm">{t.message}</div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
