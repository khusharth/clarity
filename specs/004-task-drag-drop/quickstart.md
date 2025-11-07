# Quickstart: Task Drag and Drop

**Feature**: 004-task-drag-drop  
**Date**: 2025-11-07  
**Audience**: Developers implementing this feature

## Prerequisites

- Feature branch `004-task-drag-drop` checked out
- All dependencies installed (`pnpm install`)
- Development server running (`pnpm dev`)
- Familiarity with existing codebase structure

## Implementation Checklist

### Phase 1: Data Model & Schema

- [ ] **Update Task schema** (`app/lib/schema.ts`)
  ```typescript
  export interface Task {
    // ... existing fields
    sortOrder: number | null;  // ADD THIS
  }
  ```

- [ ] **Update Dexie schema** (`app/lib/db.ts`)
  ```typescript
  db.version(2).stores({
    tasks: "id, status, createdAt, sortOrder"  // Add sortOrder index
  });
  ```

- [ ] **Verify migration**: Open app, check IndexedDB in DevTools, confirm `sortOrder` column exists

---

### Phase 2: Sound Effects

- [ ] **Add sound files** to `public/sounds/`:
  - `drag-start.mp3` (short ascending tone, ~100ms)
  - `drag-drop.mp3` (satisfying click, ~120ms)

- [ ] **Extend useSfx hook** (`app/hooks/useSfx.ts`)
  ```typescript
  const [playDragStart] = useSound("/sounds/drag-start.mp3", { 
    volume: 0.3, 
    soundEnabled: enabled 
  });
  const [playDragDrop] = useSound("/sounds/drag-drop.mp3", { 
    volume: 0.35, 
    soundEnabled: enabled 
  });
  
  return {
    // ... existing sounds
    dragStart: () => enabled ? playDragStart?.() ?? beep(100, 660) : undefined,
    dragDrop: () => enabled ? playDragDrop?.() ?? beep(120, 520) : undefined,
  };
  ```

- [ ] **Test sounds**: Toggle sound setting, trigger each sound effect manually

---

### Phase 3: Drag State Hook

- [ ] **Create `useDragAndDrop` hook** (`app/hooks/useDragAndDrop.ts`)
  ```typescript
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
  
  export function useDragAndDrop() {
    const [dragState, setDragState] = useState<DragState>({
      isDragging: false,
      draggedTaskId: null,
      sourceQuadrant: null,
      sourceIndex: null,
      targetQuadrant: null,
      targetIndex: null,
    });
    
    const quadrantRefs = useRef<Map<QuadrantId, HTMLElement>>(new Map());
    
    const setQuadrantRef = useCallback((id: QuadrantId, el: HTMLElement) => {
      quadrantRefs.current.set(id, el);
    }, []);
    
    const onDragStart = useCallback((taskId: string, quadrant: QuadrantId, index: number) => {
      setDragState({
        isDragging: true,
        draggedTaskId: taskId,
        sourceQuadrant: quadrant,
        sourceIndex: index,
        targetQuadrant: quadrant,
        targetIndex: index,
      });
    }, []);
    
    const onDrag = useCallback((x: number, y: number) => {
      // Detect drop zone based on pointer position
      let detected: QuadrantId | null = null;
      
      quadrantRefs.current.forEach((el, id) => {
        const rect = el.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          detected = id;
        }
      });
      
      setDragState(prev => ({
        ...prev,
        targetQuadrant: detected,
      }));
    }, []);
    
    const onDragEnd = useCallback(() => {
      // Return state for caller to handle persistence
      const finalState = dragState;
      
      setDragState({
        isDragging: false,
        draggedTaskId: null,
        sourceQuadrant: null,
        sourceIndex: null,
        targetQuadrant: null,
        targetIndex: null,
      });
      
      return finalState;
    }, [dragState]);
    
    return {
      dragState,
      onDragStart,
      onDrag,
      onDragEnd,
      setQuadrantRef,
    };
  }
  ```

- [ ] **Test hook**: Import in Matrix component, log drag state changes

---

### Phase 4: Zustand Actions

- [ ] **Add reorder actions** to `app/store/todos.ts`
  ```typescript
  reorderTaskWithinQuadrant: async (taskId: string, newIndex: number) => {
    const tasks = get().tasks;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const quadrant = computeQuadrant(task);
    const quadrantTasks = tasks
      .filter(t => computeQuadrant(t) === quadrant && t.status === "active")
      .sort(/* sorting logic */);
    
    let newSortOrder: number;
    if (newIndex === 0) {
      newSortOrder = 0.5;
    } else if (newIndex >= quadrantTasks.length) {
      const maxOrder = Math.max(...quadrantTasks.map(t => t.sortOrder ?? 0));
      newSortOrder = maxOrder + 1;
    } else {
      const prev = quadrantTasks[newIndex - 1].sortOrder ?? 0;
      const next = quadrantTasks[newIndex].sortOrder ?? 1;
      newSortOrder = (prev + next) / 2;
    }
    
    const updated = { ...task, sortOrder: newSortOrder };
    await saveTask(updated);
    
    set({
      tasks: tasks.map(t => t.id === taskId ? updated : t)
    });
  },
  
  moveTaskToQuadrant: async (taskId: string, targetQuadrant: QuadrantId, targetIndex: number) => {
    const tasks = get().tasks;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Map quadrant to flags
    const quadrantMap = {
      Q1: { isUrgent: true, isImportant: true },
      Q2: { isUrgent: false, isImportant: true },
      Q3: { isUrgent: true, isImportant: false },
      Q4: { isUrgent: false, isImportant: false },
    };
    
    const { isUrgent, isImportant } = quadrantMap[targetQuadrant];
    
    // Calculate sortOrder in target quadrant (similar to reorderTaskWithinQuadrant)
    const targetTasks = tasks
      .filter(t => {
        const q = computeQuadrant(t);
        return q === targetQuadrant && t.status === "active";
      })
      .sort(/* sorting logic */);
    
    let newSortOrder: number;
    // ... same calculation logic as above
    
    const updated = { ...task, isUrgent, isImportant, sortOrder: newSortOrder };
    await saveTask(updated);
    
    set({
      tasks: tasks.map(t => t.id === taskId ? updated : t)
    });
  },
  ```

- [ ] **Test actions**: Call manually from DevTools console, verify IndexedDB updates

---

### Phase 5: Component Integration

- [ ] **Enhance TodoCard** (`app/components/TodoCard.tsx`)
  ```typescript
  // Add drag prop to motion.div
  <motion.div
    drag
    dragMomentum={false}
    dragElastic={0}
    onDragStart={(e, info) => {
      // Call useDragAndDrop().onDragStart
      // Play sfx.dragStart()
    }}
    onDrag={(e, info) => {
      // Call useDragAndDrop().onDrag(info.point.x, info.point.y)
    }}
    onDragEnd={() => {
      // Get final state from useDragAndDrop().onDragEnd()
      // Call moveTaskToQuadrant or reorderTaskWithinQuadrant
      // Play sfx.dragDrop()
      // Trigger haptic: navigator.vibrate?.([10, 50, 10])
    }}
    whileDrag={{
      scale: reduced ? 1 : 1.05,
      boxShadow: reduced ? "none" : "0 10px 30px rgba(0,0,0,0.3)",
      zIndex: 1000,
    }}
  >
    {/* existing card content */}
  </motion.div>
  ```

- [ ] **Enhance Quadrant** (`app/components/Quadrant.tsx`)
  ```typescript
  // Register ref with useDragAndDrop
  useEffect(() => {
    if (quadrantRef.current) {
      setQuadrantRef(quadrantId, quadrantRef.current);
    }
  }, []);
  
  // Apply highlight when isDropTarget
  <div
    ref={quadrantRef}
    className={cn(
      "quadrant-base-classes",
      isDropTarget && "ring-2 ring-blue-500 bg-blue-50/10"
    )}
  >
    {tasks.map((task, index) => (
      <>
        {/* Show gap indicator if targetIndex === index */}
        {showGap && <div className="h-2 bg-blue-300 rounded" />}
        <TodoCard task={task} quadrant={quadrantId} index={index} />
      </>
    ))}
  </div>
  ```

- [ ] **Enhance Matrix** (`app/components/Matrix.tsx`)
  ```typescript
  const dragAndDrop = useDragAndDrop();
  
  // Pass drag state to quadrants
  <Quadrant
    id="Q1"
    isDropTarget={dragAndDrop.dragState.targetQuadrant === "Q1"}
    // ... other props
  />
  ```

- [ ] **Test drag**: Drag task card, verify visual feedback, drop zone highlighting

---

### Phase 6: Mobile Touch Support

- [ ] **Add touch threshold** to TodoCard
  ```typescript
  const [touchHoldTimeout, setTouchHoldTimeout] = useState<NodeJS.Timeout | null>(null);
  const isMobile = window.matchMedia('(pointer: coarse)').matches;
  
  const handlePointerDown = (e: PointerEvent) => {
    if (isMobile) {
      const timeout = setTimeout(() => {
        // Enable drag after 500ms
        sfx.dragStart();
        // Visual lift effect
      }, 500);
      setTouchHoldTimeout(timeout);
    }
  };
  
  const handlePointerUp = () => {
    if (touchHoldTimeout) {
      clearTimeout(touchHoldTimeout);
      setTouchHoldTimeout(null);
    }
  };
  ```

- [ ] **Prevent scroll during drag**
  ```typescript
  useEffect(() => {
    if (dragState.isDragging) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
  }, [dragState.isDragging]);
  ```

- [ ] **Test on mobile**: Use Chrome DevTools mobile emulator, verify touch gestures

---

### Phase 7: Accessibility & Polish

- [ ] **Verify reduced-motion support**
  ```typescript
  const reduced = useAppReducedMotion();
  
  // All motion.div transitions:
  transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 300 }}
  ```

- [ ] **Add keyboard support** (optional enhancement)
  - Arrow keys to reorder within quadrant
  - Shift+Arrow keys to move between quadrants

- [ ] **Test accessibility**:
  - Enable reduced-motion in OS settings
  - Verify drag-and-drop still works (instant state changes)
  - Verify audio/haptic feedback respects settings

---

## Testing Scenarios

### Test 1: Cross-Quadrant Drag
1. Create task in Q1 (Urgent & Important)
2. Drag to Q2 (Not Urgent & Important)
3. Verify: Task moves to Q2, `isUrgent` changes to `false`
4. Verify: `dragMove` sound plays when crossing boundary
5. Verify: `dragDrop` sound plays on release
6. Refresh page → Task persists in Q2

### Test 2: In-Quadrant Reorder
1. Create 3 tasks in Q1
2. Drag middle task to top position
3. Verify: Gap indicator shows at top
4. Verify: Task moves to first position
5. Verify: `sortOrder` field updated in IndexedDB
6. Refresh page → Order persists

### Test 3: Mobile Touch
1. Open app on mobile device or emulator
2. Tap and hold task for 500ms
3. Verify: Task lifts with visual effect
4. Drag to different quadrant
5. Verify: Haptic feedback on drop
6. Verify: Scroll is prevented during drag

### Test 4: Reduced Motion
1. Enable `prefers-reduced-motion` in browser
2. Drag task to new quadrant
3. Verify: State changes happen instantly (no animation)
4. Verify: Drag-and-drop functionality still works
5. Verify: Audio feedback still plays

### Test 5: Sound Settings
1. Disable sound in Settings
2. Drag task to new quadrant
3. Verify: No audio plays
4. Enable sound
5. Drag again → Verify audio plays

### Test 6: Edge Cases
1. Drag task outside all quadrants → Verify returns to origin
2. Drag very rapidly → Verify no state conflicts
3. Drag to empty quadrant → Verify task appears as first item
4. Drag with null sortOrder → Verify fractional index assigned

---

## Debugging Tips

### Drag State Not Updating
- Check: `useDragAndDrop` hook is provided by Matrix
- Check: `setQuadrantRef` is called for all 4 quadrants
- Log: `dragState` in console on every `onDrag` event

### Drop Not Persisting
- Check: `moveTaskToQuadrant` or `reorderTaskWithinQuadrant` is called in `onDragEnd`
- Check: `saveTask()` completes successfully (check promise rejection)
- Inspect: IndexedDB in DevTools → tasks table → verify `sortOrder` field

### Sounds Not Playing
- Check: Sound files exist in `public/sounds/`
- Check: `soundEnabled` is `true` in Zustand store
- Check: Browser console for audio context errors
- Fallback: Verify `beep()` function plays tone

### Touch Not Working on Mobile
- Check: `(pointer: coarse)` media query detects mobile
- Check: 500ms timeout completes before drag starts
- Check: `overflow: hidden` and `touchAction: none` applied during drag

---

## Performance Checklist

- [ ] Drag operations run at 60fps (check Chrome DevTools Performance tab)
- [ ] No layout thrashing (avoid reading `getBoundingClientRect` multiple times per frame)
- [ ] Audio plays within 100ms of drop
- [ ] Animations complete in 150-250ms range
- [ ] IndexedDB writes complete in <50ms

---

## Completion Criteria

- [ ] All 3 user stories from spec.md are implemented
- [ ] All 15 functional requirements are met
- [ ] All 10 success criteria can be verified
- [ ] All edge cases are handled gracefully
- [ ] Constitution principles are followed (motion, accessibility, local-first, clean code)
- [ ] No regressions in existing functionality
- [ ] Feature works on desktop (Chrome, Firefox, Safari)
- [ ] Feature works on mobile (iOS Safari, Chrome Android)

---

## Next Steps

After implementation:
1. Run `/speckit.tasks` to generate detailed task breakdown
2. Submit PR with constitution check note
3. Request code review focusing on clean code principles
4. User testing session to validate UX
5. Document any deviations from plan in PR description
