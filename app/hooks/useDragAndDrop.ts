import { useState, useCallback, useRef } from "react";

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
      if (!dragState.isDragging) return;

      // Detect which quadrant the pointer is over using bounding box intersection
      let newTargetQuadrant: QuadrantId | null = null;
      let newTargetIndex: number | null = null;

      for (const [quadrantId, element] of quadrantRefs.current.entries()) {
        const rect = element.getBoundingClientRect();
        if (
          x >= rect.left &&
          x <= rect.right &&
          y >= rect.top &&
          y <= rect.bottom
        ) {
          newTargetQuadrant = quadrantId;
          // Calculate target index based on vertical position within quadrant
          // Exclude the currently dragged task from the calculation
          const taskElements = Array.from(
            element.querySelectorAll("[data-task-id]")
          ).filter(
            (el) => el.getAttribute("data-task-id") !== dragState.draggedTaskId
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
          break;
        }
      }

      setDragState((prev) => ({
        ...prev,
        targetQuadrant: newTargetQuadrant,
        targetIndex: newTargetIndex,
      }));
    },
    [dragState.isDragging, dragState.draggedTaskId]
  );

  const onDragEnd = useCallback(() => {
    const currentState = dragState;
    setDragState(initialDragState);
    return currentState;
  }, [dragState]);

  const cancelDrag = useCallback(() => {
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
