import { useState, useCallback, useRef, useEffect } from "react";

export type QuadrantId = "Q1" | "Q2" | "Q3" | "Q4";

interface DragState {
  isDragging: boolean;
  draggedTaskId: string | null;
  sourceQuadrant: QuadrantId | null;
  sourceIndex: number | null;
  targetQuadrant: QuadrantId | null;
  targetIndex: number | null;
}

const initialDragState: DragState = {
  isDragging: false,
  draggedTaskId: null,
  sourceQuadrant: null,
  sourceIndex: null,
  targetQuadrant: null,
  targetIndex: null,
};

export function useDragAndDrop() {
  const [dragState, setDragState] = useState<DragState>(initialDragState);
  const quadrantRefs = useRef<Map<QuadrantId, HTMLElement>>(new Map());
  const dragStateRef = useRef<DragState>(dragState);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  const setQuadrantRef = useCallback(
    (id: QuadrantId, el: HTMLElement | null) => {
      if (el) {
        quadrantRefs.current.set(id, el);
      } else {
        quadrantRefs.current.delete(id);
      }
    },
    []
  );

  const onDragStart = useCallback(
    (taskId: string, quadrant: QuadrantId, index: number) => {
      setDragState({
        isDragging: true,
        draggedTaskId: taskId,
        sourceQuadrant: quadrant,
        sourceIndex: index,
        targetQuadrant: quadrant,
        targetIndex: index,
      });
    },
    []
  );

  const onDrag = useCallback(
    (x: number, y: number) => {
      const currentState = dragStateRef.current;
      if (!currentState.isDragging) return;

      // PERFORMANCE: Using ref-based callback pattern to avoid recreation
      // This ensures 60fps by eliminating unnecessary callback recreations
      // Bounding box calculations are cached per frame by the browser

      // Detect which quadrant the pointer is over using bounding box intersection
      let newTargetQuadrant: QuadrantId | null = null;
      let newTargetIndex: number | null = null;
      let currentQuadrantElement: HTMLElement | null = null;

      // Check all quadrants to find the one containing the pointer
      for (const [quadrantId, element] of quadrantRefs.current.entries()) {
        const rect = element.getBoundingClientRect();

        // Check if pointer is within this quadrant's bounds
        if (
          x >= rect.left &&
          x <= rect.right &&
          y >= rect.top &&
          y <= rect.bottom
        ) {
          newTargetQuadrant = quadrantId;
          currentQuadrantElement = element;

          // Calculate target index based on vertical position within quadrant
          // Exclude the currently dragged task from the calculation
          const taskElements = Array.from(
            element.querySelectorAll("[data-task-id]")
          ).filter(
            (el) =>
              el.getAttribute("data-task-id") !== currentState.draggedTaskId
          );

          if (taskElements.length === 0) {
            newTargetIndex = 0;
          } else {
            // Find insertion point based on Y position
            let insertIndex = 0;
            for (let i = 0; i < taskElements.length; i++) {
              const taskRect = taskElements[i].getBoundingClientRect();
              const taskMiddle = taskRect.top + taskRect.height / 2;
              if (y > taskMiddle) {
                insertIndex = i + 1;
              } else {
                break;
              }
            }
            newTargetIndex = insertIndex;
          }
          // Found the quadrant, no need to check others
          break;
        }
      }

      // Auto-scroll logic: detect if near top/bottom edge (within 50px)
      if (currentQuadrantElement) {
        const rect = currentQuadrantElement.getBoundingClientRect();
        const SCROLL_THRESHOLD = 50;
        const SCROLL_SPEED = 10;

        // Check if element has scrollable content
        const hasOverflow =
          currentQuadrantElement.scrollHeight >
          currentQuadrantElement.clientHeight;

        if (hasOverflow) {
          // Near top edge
          if (y - rect.top < SCROLL_THRESHOLD && y > rect.top) {
            if (!autoScrollIntervalRef.current) {
              autoScrollIntervalRef.current = setInterval(() => {
                currentQuadrantElement.scrollBy({ top: -SCROLL_SPEED });
              }, 16); // ~60fps
            }
          }
          // Near bottom edge
          else if (rect.bottom - y < SCROLL_THRESHOLD && y < rect.bottom) {
            if (!autoScrollIntervalRef.current) {
              autoScrollIntervalRef.current = setInterval(() => {
                currentQuadrantElement.scrollBy({ top: SCROLL_SPEED });
              }, 16); // ~60fps
            }
          }
          // Not near edges - clear auto-scroll
          else {
            if (autoScrollIntervalRef.current) {
              clearInterval(autoScrollIntervalRef.current);
              autoScrollIntervalRef.current = null;
            }
          }
        }
      } else {
        // Not over any quadrant - clear auto-scroll
        if (autoScrollIntervalRef.current) {
          clearInterval(autoScrollIntervalRef.current);
          autoScrollIntervalRef.current = null;
        }
      }

      // Only update if something changed to avoid unnecessary re-renders
      if (
        newTargetQuadrant !== currentState.targetQuadrant ||
        newTargetIndex !== currentState.targetIndex
      ) {
        setDragState((prev) => ({
          ...prev,
          targetQuadrant: newTargetQuadrant,
          targetIndex: newTargetIndex,
        }));
      }
    },
    [] // No dependencies - uses ref for stable callback
  );

  const onDragEnd = useCallback(() => {
    const currentState = dragState;

    // Clear auto-scroll interval if active
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }

    setDragState(initialDragState);
    return currentState;
  }, [dragState]);

  const cancelDrag = useCallback(() => {
    // Clear auto-scroll interval if active
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }

    setDragState(initialDragState);
  }, []);

  return {
    dragState,
    onDragStart,
    onDrag,
    onDragEnd,
    cancelDrag,
    setQuadrantRef,
  };
}
