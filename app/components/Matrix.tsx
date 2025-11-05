"use client";
import { useEffect, useMemo } from "react";
import Quadrant from "./Quadrant";
import TodoCard from "./TodoCard";
import { useTodos } from "../store/todos";
import type { Task } from "../lib/schema";
import { motion, AnimatePresence } from "framer-motion";
import { listVariants } from "../lib/motion";
import { useReducedMotion } from "../hooks/useReducedMotion";
import FocusControls from "./FocusControls";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

function sortOldest(a: Task, b: Task) {
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

export default function Matrix() {
  const reduced = useReducedMotion();
  const {
    tasks,
    isHydrated,
    hydrate,
    isFocus,
    focusMode,
    activeTaskId,
    nextFocusTask,
    prevFocusTask,
    setActiveTask,
  } = useTodos();

  useEffect(() => {
    if (!isHydrated) void hydrate();
  }, [isHydrated, hydrate]);

  const active = useMemo(
    () => tasks.filter((t) => t.status === "active"),
    [tasks]
  );

  const q1 = useMemo(
    () => active.filter((t) => t.isUrgent && t.isImportant).sort(sortOldest),
    [active]
  );
  const q2 = useMemo(
    () => active.filter((t) => !t.isUrgent && t.isImportant).sort(sortOldest),
    [active]
  );
  const q3 = useMemo(
    () => active.filter((t) => t.isUrgent && !t.isImportant).sort(sortOldest),
    [active]
  );
  const q4 = useMemo(
    () => active.filter((t) => !t.isUrgent && !t.isImportant).sort(sortOldest),
    [active]
  );

  return (
    <div className="mx-auto w-full max-w-6xl p-4">
      <FocusControls />
      <motion.div animate={{ opacity: 1 }}>
        {isFocus ? (
          focusMode === "single" ? (
            <>
              <div className="grid grid-cols-1 gap-4">
                <Quadrant
                  title="Q1 • Do Now"
                  colorVar="--q1"
                  isEmpty={q1.length === 0}
                  emptyMessage="Nothing urgent and important right now"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {(() => {
                      const item = activeTaskId
                        ? q1.find((t) => t.id === activeTaskId)
                        : q1[0];
                      return item ? (
                        <TodoCard key={item.id} task={item} />
                      ) : null;
                    })()}
                  </AnimatePresence>
                </Quadrant>
              </div>
              {q1.length > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!activeTaskId && q1[q1.length - 1])
                        setActiveTask(q1[q1.length - 1].id);
                      else prevFocusTask();
                    }}
                    disabled={q1.length === 0}
                    icon={<ChevronLeft size={16} />}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!activeTaskId && q1[0]) setActiveTask(q1[0].id);
                      else nextFocusTask();
                    }}
                    disabled={q1.length === 0}
                  >
                    Next <ChevronRight size={16} />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <Quadrant
                title="Q1 • Do Now"
                colorVar="--q1"
                isEmpty={q1.length === 0}
                emptyMessage="Nothing urgent and important right now"
              >
                <motion.div
                  variants={reduced ? undefined : listVariants}
                  animate="animate"
                >
                  <AnimatePresence initial={false}>
                    {q1.map((t) => (
                      <TodoCard key={t.id} task={t} className="mb-1.5" />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </Quadrant>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Quadrant
              title="Q1 • Do Now"
              colorVar="--q1"
              isEmpty={q1.length === 0}
              emptyMessage="Nothing urgent and important right now"
            >
              <motion.div
                variants={reduced ? undefined : listVariants}
                animate="animate"
              >
                <AnimatePresence initial={false}>
                  {q1.map((t) => (
                    <TodoCard key={t.id} task={t} className="mb-1.5" />
                  ))}
                </AnimatePresence>
              </motion.div>
            </Quadrant>
            <Quadrant
              title="Q2 • Plan It"
              colorVar="--q2"
              isEmpty={q2.length === 0}
              emptyMessage="Plan important tasks without urgency"
            >
              <motion.div
                variants={reduced ? undefined : listVariants}
                animate="animate"
              >
                <AnimatePresence initial={false}>
                  {q2.map((t) => (
                    <TodoCard key={t.id} task={t} className="mb-1.5" />
                  ))}
                </AnimatePresence>
              </motion.div>
            </Quadrant>
            <Quadrant
              title="Q3 • Delegate"
              colorVar="--q3"
              isEmpty={q3.length === 0}
              emptyMessage="Urgent but not important—delegate if possible"
            >
              <motion.div
                variants={reduced ? undefined : listVariants}
                animate="animate"
              >
                <AnimatePresence initial={false}>
                  {q3.map((t) => (
                    <TodoCard key={t.id} task={t} className="mb-1.5" />
                  ))}
                </AnimatePresence>
              </motion.div>
            </Quadrant>
            <Quadrant
              title="Q4 • Later"
              colorVar="--q4"
              isEmpty={q4.length === 0}
              emptyMessage="Not urgent and not important—consider dropping"
            >
              <motion.div
                variants={reduced ? undefined : listVariants}
                animate="animate"
              >
                <AnimatePresence initial={false}>
                  {q4.map((t) => (
                    <TodoCard key={t.id} task={t} className="mb-1.5" />
                  ))}
                </AnimatePresence>
              </motion.div>
            </Quadrant>
          </div>
        )}
      </motion.div>
    </div>
  );
}
