"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTodos } from "../store/todos";
import type { Task } from "../lib/schema";
import { CheckCircle2, GripVertical } from "lucide-react";
import { useAppReducedMotion } from "../hooks/useAppReducedMotion";
import { useSfx } from "../hooks/useSfx";
import { useToast } from "../store/toast";
import { Button } from "./ui/button";
import ViewTodoModal from "./ViewTodoModal";
import { useReward } from "react-rewards";
import { CONFETTI_ID } from "./Confetti";
import type { QuadrantId } from "../hooks/useDragAndDrop";

export default function TodoCard({
  task,
  quadrant,
  index,
  onDragStart,
  onDrag,
  onDragEnd,
  className = "",
}: {
  task: Task;
  quadrant: QuadrantId;
  index: number;
  onDragStart?: (taskId: string, quadrant: QuadrantId, index: number) => void;
  onDrag?: (x: number, y: number) => void;
  onDragEnd?: () => void;
  className?: string;
}) {
  const { toggleUrgent, toggleImportant, complete, remove, celebrate } =
    useTodos();
  const reduced = useAppReducedMotion();
  const sfx = useSfx();
  const toast = useToast();
  const [viewOpen, setViewOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [dragEnabled, setDragEnabled] = useState(false); // Controls if drag listener is active
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isMobile] = useState(
    typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches
  );
  const { reward } = useReward(CONFETTI_ID, "confetti", {
    lifetime: 3000,
    angle: 270,
    spread: 180,
  });

  // Cleanup long press timer on unmount
  useEffect(() => {
    return () => {
      const timer = longPressTimerRef.current;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  const handleTouchStart = () => {
    if (!isMobile) return;

    // Start 500ms timer for long press
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressing(true);
      setDragEnabled(true); // Enable drag listener after long press
      // Trigger visual lift effect
      sfx.dragStart();
    }, 500);
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;

    // Cancel long press timer if touch ends before threshold
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsLongPressing(false);
  };

  const handleTouchMove = () => {
    // Touch move should not cancel the long press on mobile
    // This allows drag to continue after the hold threshold

    // However, if dragging hasn't started yet and user scrolls,
    // cancel the long press timer
    if (longPressTimerRef.current && !isDragging) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
      setIsLongPressing(false);
    }
  };

  return (
    <>
      <motion.div
        drag
        dragListener={isMobile ? dragEnabled : true}
        dragSnapToOrigin
        dragMomentum={false}
        dragElastic={0}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onDragStart={() => {
          setIsDragging(true);
          if (onDragStart) {
            onDragStart(task.id, quadrant, index);
            sfx.dragStart();
            // Haptic feedback on mobile
            if (isMobile && navigator.vibrate) {
              navigator.vibrate([10, 50, 10]);
            }
          }
        }}
        onDrag={(_event, info) => {
          if (onDrag) {
            onDrag(info.point.x, info.point.y);
          }
        }}
        onDragEnd={() => {
          if (onDragEnd) {
            onDragEnd();
            // Haptic feedback on successful drop (mobile)
            if (isMobile && navigator.vibrate) {
              navigator.vibrate([20]);
            }
          }
          // Reset states after drag ends
          setTimeout(() => {
            setIsDragging(false);
            setDragEnabled(false); // Reset for next drag on mobile
          }, 100);
        }}
        whileDrag={
          reduced
            ? undefined
            : {
                scale: 1.05,
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                zIndex: 1000,
              }
        }
        style={{
          pointerEvents: isDragging ? "none" : "auto",
          position: isDragging ? "relative" : "static",
          // Add visual lift effect for mobile long press
          ...(isLongPressing && !reduced
            ? {
                transform: "scale(1.03)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              }
            : {}),
        }}
        data-task-id={task.id}
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
          } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setViewOpen(true);
          }
        }}
        initial={reduced ? false : { opacity: 0, y: 8 }}
        // Explicit x and y 0 ensures on drag end animation, the card returns to correct position
        // (in some edge cases framer-motion can miscalculate the final position - like dropping at edges of quad)
        animate={
          reduced
            ? { x: 0, y: 0, scale: 1 }
            : { opacity: 1, x: 0, y: 0, scale: 1 }
        }
        exit={reduced ? undefined : { opacity: 0, y: -8 }}
        transition={{ duration: reduced ? 0 : 0.18 }}
        whileHover={reduced ? undefined : { scale: 1.01 }}
        onClick={() => {
          if (!isDragging) {
            setViewOpen(true);
          }
        }}
        className={`group flex items-center rounded-sm border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-elevated))] px-3 py-2 shadow-sm hover:shadow-md transition-all cursor-pointer select-none sm:select-auto ${className}`}
      >
        {/* Drag indicator - shows when dragging with smooth animation */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0, x: -10, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "auto" }}
              exit={{ opacity: 0, x: -10, width: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center mr-2 text-[rgb(var(--color-fg-muted))]"
            >
              <GripVertical size={16} className="opacity-50" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="min-w-0 pr-2 flex-1"
          initial={false}
          animate={isDragging ? { x: 0 } : { x: 0 }}
          transition={{ duration: 0.15 }}
        >
          <p className="truncate text-sm">{task.text}</p>
        </motion.div>
        <motion.div
          className="flex shrink-0 items-center gap-0.5 opacity-80"
          onClick={(e) => e.stopPropagation()}
          initial={false}
          animate={isDragging ? { x: 0 } : { x: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Button
            variant="ghost"
            size="sm"
            contentType="icon-only"
            onClick={async () => {
              if (isDragging) return;
              sfx.complete();
              celebrate();
              await complete(task.id);
              reward();
              toast.push({ type: "success", message: "Completed 🎉" });
            }}
            className="rounded-md hover:bg-[rgb(var(--color-success))]/20! text-[rgb(var(--color-success))]"
            aria-label="Complete"
            title="Complete"
            icon={<CheckCircle2 size={16} />}
            disabled={isDragging}
          />
        </motion.div>
      </motion.div>
      <ViewTodoModal
        task={task}
        open={viewOpen}
        onCloseAction={() => setViewOpen(false)}
      />
    </>
  );
}
