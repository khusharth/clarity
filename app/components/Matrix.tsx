"use client";
import { useEffect, useMemo, useState } from "react";
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
import AddTodoModal from "./AddTodoModal";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import type { QuadrantId } from "../hooks/useDragAndDrop";
import { useSfx } from "../hooks/useSfx";

function sortByOrderThenDate(a: Task, b: Task) {
  // sortOrder takes precedence (nulls last)
  if (a.sortOrder !== null && b.sortOrder !== null) {
    return a.sortOrder - b.sortOrder;
  }
  if (a.sortOrder !== null) return -1;
  if (b.sortOrder !== null) return 1;
  // Fall back to createdAt for tasks without sortOrder
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
    moveTaskToQuadrant,
    reorderTaskWithinQuadrant,
  } = useTodos();
  const sfx = useSfx();
  const dragAndDrop = useDragAndDrop();

  const handleDragEnd = async () => {
    const state = dragAndDrop.onDragEnd();
    
    if (!state.draggedTaskId || !state.targetQuadrant) {
      // Drag cancelled (dropped outside quadrants) - no action needed
      // Framer Motion will return the element to its original position
      return;
    }

    const sourceQuadrant = state.sourceQuadrant;
    const targetQuadrant = state.targetQuadrant;
    const targetIndex = state.targetIndex ?? 0;

    // Play sound on successful drop
    sfx.dragDrop();

    // Determine if cross-quadrant or same-quadrant reorder
    if (sourceQuadrant === targetQuadrant) {
      await reorderTaskWithinQuadrant(state.draggedTaskId, targetIndex);
    } else {
      await moveTaskToQuadrant(state.draggedTaskId, targetQuadrant, targetIndex);
    }
  };

  const [modalState, setModalState] = useState<{
    open: boolean;
    urgent: boolean;
    important: boolean;
  }>({
    open: false,
    urgent: false,
    important: false,
  });

  const openModalWithPreset = ({
    urgent,
    important,
  }: {
    urgent: boolean;
    important: boolean;
  }) => {
    setModalState({ open: true, urgent, important });
  };

  const closeModal = () => {
    setModalState({ open: false, urgent: false, important: false });
  };

  useEffect(() => {
    if (!isHydrated) void hydrate();
  }, [isHydrated, hydrate]);

  const active = useMemo(
    () => tasks.filter((t) => t.status === "active"),
    [tasks]
  );

  const q1 = useMemo(
    () => active.filter((t) => t.isUrgent && t.isImportant).sort(sortByOrderThenDate),
    [active]
  );
  const q2 = useMemo(
    () => active.filter((t) => !t.isUrgent && t.isImportant).sort(sortByOrderThenDate),
    [active]
  );
  const q3 = useMemo(
    () => active.filter((t) => t.isUrgent && !t.isImportant).sort(sortByOrderThenDate),
    [active]
  );
  const q4 = useMemo(
    () => active.filter((t) => !t.isUrgent && !t.isImportant).sort(sortByOrderThenDate),
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
                  quadrantId="q1"
                  tasks={q1}
                  onEmptyClick={() =>
                    openModalWithPreset({ urgent: true, important: true })
                  }
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {(() => {
                      const item = activeTaskId
                        ? q1.find((t) => t.id === activeTaskId)
                        : q1[0];
                      const itemIndex = item ? q1.findIndex((t) => t.id === item.id) : 0;
                      return item ? (
                        <TodoCard
                          key={item.id}
                          task={item}
                          quadrant="Q1"
                          index={itemIndex}
                          onDragStart={dragAndDrop.onDragStart}
                          onDrag={dragAndDrop.onDrag}
                          onDragEnd={handleDragEnd}
                        />
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
                quadrantId="q1"
                tasks={q1}
                onEmptyClick={() =>
                  openModalWithPreset({ urgent: true, important: true })
                }
              >
                <motion.div
                  variants={reduced ? undefined : listVariants}
                  animate="animate"
                >
                  <AnimatePresence initial={false}>
                    {q1.map((t, index) => (
                      <TodoCard
                        key={t.id}
                        task={t}
                        quadrant="Q1"
                        index={index}
                        onDragStart={dragAndDrop.onDragStart}
                        onDrag={dragAndDrop.onDrag}
                        onDragEnd={handleDragEnd}
                        className="mb-1.5"
                      />
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
              quadrantId="q1"
              tasks={q1}
              isDropTarget={dragAndDrop.dragState.targetQuadrant === "Q1"}
              setQuadrantRef={dragAndDrop.setQuadrantRef}
              onEmptyClick={() =>
                openModalWithPreset({ urgent: true, important: true })
              }
            >
              <motion.div
                variants={reduced ? undefined : listVariants}
                animate="animate"
              >
                <AnimatePresence initial={false}>
                  {q1.map((t, index) => (
                    <div key={t.id}>
                      {/* Show gap indicator when dragging over this position */}
                      {dragAndDrop.dragState.isDragging &&
                        dragAndDrop.dragState.targetQuadrant === "Q1" &&
                        dragAndDrop.dragState.targetIndex === index && (
                          <div className="h-1 bg-blue-500 rounded-full mb-1.5 animate-pulse" />
                        )}
                      <TodoCard
                        task={t}
                        quadrant="Q1"
                        index={index}
                        onDragStart={dragAndDrop.onDragStart}
                        onDrag={dragAndDrop.onDrag}
                        onDragEnd={handleDragEnd}
                        className="mb-1.5"
                      />
                    </div>
                  ))}
                  {/* Show gap at end if dropping after all tasks */}
                  {dragAndDrop.dragState.isDragging &&
                    dragAndDrop.dragState.targetQuadrant === "Q1" &&
                    dragAndDrop.dragState.targetIndex === q1.length && (
                      <div key="gap-end" className="h-1 bg-blue-500 rounded-full animate-pulse" />
                    )}
                </AnimatePresence>
              </motion.div>
            </Quadrant>
            <Quadrant
              title="Q2 • Plan It"
              colorVar="--q2"
              isEmpty={q2.length === 0}
              emptyMessage="Plan important tasks without urgency"
              quadrantId="q2"
              tasks={q2}
              isDropTarget={dragAndDrop.dragState.targetQuadrant === "Q2"}
              setQuadrantRef={dragAndDrop.setQuadrantRef}
              onEmptyClick={() =>
                openModalWithPreset({ urgent: false, important: true })
              }
            >
              <motion.div
                variants={reduced ? undefined : listVariants}
                animate="animate"
              >
                <AnimatePresence initial={false}>
                  {q2.map((t, index) => (
                    <div key={t.id}>
                      {dragAndDrop.dragState.isDragging &&
                        dragAndDrop.dragState.targetQuadrant === "Q2" &&
                        dragAndDrop.dragState.targetIndex === index && (
                          <div className="h-1 bg-blue-500 rounded-full mb-1.5 animate-pulse" />
                        )}
                      <TodoCard
                        task={t}
                        quadrant="Q2"
                        index={index}
                        onDragStart={dragAndDrop.onDragStart}
                        onDrag={dragAndDrop.onDrag}
                        onDragEnd={handleDragEnd}
                        className="mb-1.5"
                      />
                    </div>
                  ))}
                  {dragAndDrop.dragState.isDragging &&
                    dragAndDrop.dragState.targetQuadrant === "Q2" &&
                    dragAndDrop.dragState.targetIndex === q2.length && (
                      <div key="gap-end" className="h-1 bg-blue-500 rounded-full animate-pulse" />
                    )}
                </AnimatePresence>
              </motion.div>
            </Quadrant>
            <Quadrant
              title="Q3 • Delegate"
              colorVar="--q3"
              isEmpty={q3.length === 0}
              emptyMessage="Urgent but not important—delegate if possible"
              quadrantId="q3"
              tasks={q3}
              isDropTarget={dragAndDrop.dragState.targetQuadrant === "Q3"}
              setQuadrantRef={dragAndDrop.setQuadrantRef}
              onEmptyClick={() =>
                openModalWithPreset({ urgent: true, important: false })
              }
            >
              <motion.div
                variants={reduced ? undefined : listVariants}
                animate="animate"
              >
                <AnimatePresence initial={false}>
                  {q3.map((t, index) => (
                    <div key={t.id}>
                      {dragAndDrop.dragState.isDragging &&
                        dragAndDrop.dragState.targetQuadrant === "Q3" &&
                        dragAndDrop.dragState.targetIndex === index && (
                          <div className="h-1 bg-blue-500 rounded-full mb-1.5 animate-pulse" />
                        )}
                      <TodoCard
                        task={t}
                        quadrant="Q3"
                        index={index}
                        onDragStart={dragAndDrop.onDragStart}
                        onDrag={dragAndDrop.onDrag}
                        onDragEnd={handleDragEnd}
                        className="mb-1.5"
                      />
                    </div>
                  ))}
                  {dragAndDrop.dragState.isDragging &&
                    dragAndDrop.dragState.targetQuadrant === "Q3" &&
                    dragAndDrop.dragState.targetIndex === q3.length && (
                      <div key="gap-end" className="h-1 bg-blue-500 rounded-full animate-pulse" />
                    )}
                </AnimatePresence>
              </motion.div>
            </Quadrant>
            <Quadrant
              title="Q4 • Later"
              colorVar="--q4"
              isEmpty={q4.length === 0}
              emptyMessage="Not urgent and not important—consider dropping"
              quadrantId="q4"
              tasks={q4}
              isDropTarget={dragAndDrop.dragState.targetQuadrant === "Q4"}
              setQuadrantRef={dragAndDrop.setQuadrantRef}
              onEmptyClick={() =>
                openModalWithPreset({ urgent: false, important: false })
              }
            >
              <motion.div
                variants={reduced ? undefined : listVariants}
                animate="animate"
              >
                <AnimatePresence initial={false}>
                  {q4.map((t, index) => (
                    <div key={t.id}>
                      {dragAndDrop.dragState.isDragging &&
                        dragAndDrop.dragState.targetQuadrant === "Q4" &&
                        dragAndDrop.dragState.targetIndex === index && (
                          <div className="h-1 bg-blue-500 rounded-full mb-1.5 animate-pulse" />
                        )}
                      <TodoCard
                        task={t}
                        quadrant="Q4"
                        index={index}
                        onDragStart={dragAndDrop.onDragStart}
                        onDrag={dragAndDrop.onDrag}
                        onDragEnd={handleDragEnd}
                        className="mb-1.5"
                      />
                    </div>
                  ))}
                  {dragAndDrop.dragState.isDragging &&
                    dragAndDrop.dragState.targetQuadrant === "Q4" &&
                    dragAndDrop.dragState.targetIndex === q4.length && (
                      <div key="gap-end" className="h-1 bg-blue-500 rounded-full animate-pulse" />
                    )}
                </AnimatePresence>
              </motion.div>
            </Quadrant>
          </div>
        )}
      </motion.div>
      <AddTodoModal
        open={modalState.open}
        onCloseAction={closeModal}
        initialUrgent={modalState.urgent}
        initialImportant={modalState.important}
      />
    </div>
  );
}
