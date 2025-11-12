"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
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
  const dragControls = useDragControls();
  const [viewOpen, setViewOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressCompletedRef = useRef(false); // Tracks if 500ms long press completed
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialPointerEventRef = useRef<PointerEvent | null>(null);
  const initialPointerPosRef = useRef<{ x: number; y: number } | null>(null);
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

  const handlePointerDown = (event: React.PointerEvent) => {
    // Only handle long press logic on mobile
    if (!isMobile) return;

    // Don't interfere with button clicks
    const target = event.target as HTMLElement;
    if (target.closest("button")) {
      return;
    }

    // Store the initial pointer event and position
    initialPointerEventRef.current = event.nativeEvent;
    initialPointerPosRef.current = { x: event.clientX, y: event.clientY };

    // Reset long press completion flag
    longPressCompletedRef.current = false;

    // Start 500ms timer for long press
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressing(true);
      longPressCompletedRef.current = true; // Mark long press as completed
      // Trigger visual lift effect
      sfx.dragStart();
      // Haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate([10]);
      }
      // Start drag programmatically using the stored pointer event
      if (initialPointerEventRef.current) {
        dragControls.start(initialPointerEventRef.current);
      }
    }, 500);
  };

  const handlePointerUp = () => {
    // Only handle on mobile
    if (!isMobile) return;

    // Cancel long press timer if pointer up before threshold
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Don't reset if we're dragging
    if (!isDragging) {
      setIsLongPressing(false);
      longPressCompletedRef.current = false;
    }
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    // Only handle on mobile
    if (!isMobile) return;

    // Don't cancel if already dragging or long press completed
    if (isDragging || longPressCompletedRef.current) return;

    // Check if user moved significantly (more than 10px in any direction)
    // If so, they're probably trying to scroll, not drag
    if (initialPointerPosRef.current && longPressTimerRef.current) {
      const deltaX = Math.abs(event.clientX - initialPointerPosRef.current.x);
      const deltaY = Math.abs(event.clientY - initialPointerPosRef.current.y);

      if (deltaX > 10 || deltaY > 10) {
        // Significant movement detected - cancel long press
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
        setIsLongPressing(false);
        initialPointerPosRef.current = null;
      }
    }
  };

  return (
    <>
      <motion.div
        drag
        dragListener={!isMobile} // Desktop: always listen, Mobile: use dragControls
        dragControls={isMobile ? dragControls : undefined}
        dragSnapToOrigin
        dragMomentum={false}
        dragElastic={0}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
        {...(isMobile && {
          onPointerDown: handlePointerDown,
          onPointerUp: handlePointerUp,
          onPointerMove: handlePointerMove,
        })}
        onDragStart={() => {
          setIsDragging(true);
          if (onDragStart) {
            onDragStart(task.id, quadrant, index);
            // Only play sound on desktop (already played on mobile during long press)
            if (!isMobile) {
              sfx.dragStart();
            }
            // Additional haptic feedback on drag start (mobile)
            if (isMobile && navigator.vibrate) {
              navigator.vibrate([50, 10]);
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
            setIsLongPressing(false);
            longPressCompletedRef.current = false;
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
          touchAction: isMobile ? "none" : "auto", // Required for drag controls on touch devices
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
        whileHover={reduced ? undefined : { scale: 1.02 }}
        onClick={() => {
          // Don't open modal if we just finished dragging or if long press was triggered
          if (
            !isDragging &&
            !isLongPressing &&
            !longPressCompletedRef.current
          ) {
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
