# State Management Contracts

**Feature**: 004-task-drag-drop  
**Date**: 2025-11-07  
**Type**: Local-First State Contracts (No HTTP APIs)

## Overview

Since Clarity is a local-first application with no backend, this document defines **state management contracts** instead of HTTP API contracts. These contracts specify the Zustand store actions and their expected behaviors for drag-and-drop functionality.

---

## Store Actions (Zustand)

### 1. reorderTaskWithinQuadrant

**Purpose**: Update task's `sortOrder` when reordered within the same quadrant.

**Signature**:
```typescript
reorderTaskWithinQuadrant(
  taskId: string,
  newIndex: number
): Promise<void>
```

**Input**:
- `taskId`: UUID of the task being reordered
- `newIndex`: Target position in the quadrant's task list (0-based)

**Behavior**:
1. Find task by ID
2. Get current quadrant's task list (filtered by `isUrgent`/`isImportant`)
3. Calculate new `sortOrder`:
   - If `newIndex === 0`: `sortOrder = 0.5`
   - If `newIndex === length`: `sortOrder = maxSortOrder + 1`
   - Otherwise: `sortOrder = (tasks[newIndex-1].sortOrder + tasks[newIndex].sortOrder) / 2`
4. Update task in store: `{ sortOrder: calculated_value }`
5. Persist to IndexedDB via `saveTask()`
6. Trigger re-render

**Preconditions**:
- Task exists and is `status === "active"`
- `newIndex` is valid (>= 0 and <= task count)

**Postconditions**:
- Task has new `sortOrder`
- Task appears at `newIndex` in sorted list
- Change persisted to IndexedDB

**Error Handling**:
- If task not found: log error, no-op
- If persistence fails: show toast notification

---

### 2. moveTaskToQuadrant

**Purpose**: Move task to a different quadrant, updating urgency/importance flags and sortOrder.

**Signature**:
```typescript
moveTaskToQuadrant(
  taskId: string,
  targetQuadrant: "Q1" | "Q2" | "Q3" | "Q4",
  targetIndex: number
): Promise<void>
```

**Input**:
- `taskId`: UUID of the task being moved
- `targetQuadrant`: Destination quadrant ID
- `targetIndex`: Position in the target quadrant's task list (0-based)

**Behavior**:
1. Find task by ID
2. Determine new `isUrgent` and `isImportant` from `targetQuadrant`:
   - Q1: `{ isUrgent: true, isImportant: true }`
   - Q2: `{ isUrgent: false, isImportant: true }`
   - Q3: `{ isUrgent: true, isImportant: false }`
   - Q4: `{ isUrgent: false, isImportant: false }`
3. Get target quadrant's task list
4. Calculate `sortOrder` at `targetIndex` (same logic as `reorderTaskWithinQuadrant`)
5. Update task: `{ isUrgent, isImportant, sortOrder }`
6. Persist to IndexedDB
7. Trigger re-render

**Preconditions**:
- Task exists and is `status === "active"`
- `targetQuadrant` is valid ("Q1" | "Q2" | "Q3" | "Q4")
- `targetIndex` is valid for target quadrant

**Postconditions**:
- Task has new urgency/importance flags
- Task appears in target quadrant at `targetIndex`
- Change persisted to IndexedDB

**Error Handling**:
- If task not found: log error, no-op
- If persistence fails: show toast notification
- If no actual change (same quadrant): treat as `reorderTaskWithinQuadrant`

---

### 3. cancelDrag

**Purpose**: Reset any temporary drag state without persisting changes.

**Signature**:
```typescript
cancelDrag(): void
```

**Input**: None

**Behavior**:
1. Reset drag state in `useDragAndDrop` hook
2. Animate task back to original position (via Framer Motion)
3. No database writes
4. No sound effects

**Preconditions**: Drag operation is active

**Postconditions**: 
- UI returns to pre-drag state
- No data changes

**Error Handling**: None (always succeeds)

---

## Hook Contracts

### useDragAndDrop

**Purpose**: Manage drag state and provide drag event handlers.

**Signature**:
```typescript
function useDragAndDrop(): {
  dragState: DragState;
  onDragStart: (taskId: string, quadrant: QuadrantId, index: number) => void;
  onDrag: (x: number, y: number) => void;
  onDragEnd: () => void;
  setQuadrantRef: (quadrant: QuadrantId, ref: HTMLElement) => void;
}
```

**Return Value**:
- `dragState`: Current drag state (see data-model.md)
- `onDragStart`: Called when user initiates drag
- `onDrag`: Called on every pointer move during drag
- `onDragEnd`: Called when user releases pointer
- `setQuadrantRef`: Register quadrant DOM element for drop zone detection

**State Updates**:
- `onDragStart`: Set `isDragging = true`, capture source quadrant/index
- `onDrag`: Update pointer coordinates, calculate target quadrant/index
- `onDragEnd`: 
  - If valid drop: call `moveTaskToQuadrant` or `reorderTaskWithinQuadrant`
  - If invalid drop: call `cancelDrag`
  - Play appropriate sound effects
  - Trigger haptic feedback (mobile)

---

## Sound Effect Contracts

### useSfx (Extended)

**New Methods**:

#### dragStart()
```typescript
dragStart(): void
```
- Plays `/sounds/drag-start.mp3` (or beep fallback)
- Volume: 0.3
- Duration: ~100ms
- Triggered: On `onDragStart` after 300ms hold threshold

#### dragDrop()
```typescript
dragDrop(): void
```
- Plays `/sounds/drag-drop.mp3` (or beep fallback)
- Volume: 0.35
- Duration: ~120ms
- Triggered: On successful `onDragEnd`

**Respect `soundEnabled` Preference**: All methods no-op if `soundEnabled === false`

---

## Persistence Contracts

### saveTask (Extended)

**Changes**: Now persists `sortOrder` field.

**Signature** (unchanged):
```typescript
async function saveTask(task: Task): Promise<void>
```

**New Behavior**:
- Writes `sortOrder` to IndexedDB tasks table
- Null values are allowed and stored as `null`

**Index**: Add `sortOrder` to Dexie index for efficient sorting queries

---

## Component Contracts

### TodoCard (Enhanced)

**New Props**:
```typescript
interface TodoCardProps {
  task: Task;
  quadrant: QuadrantId;
  index: number;  // Position in quadrant's sorted list
  className?: string;
}
```

**New Behavior**:
- Wraps existing `motion.div` with `drag` prop
- Calls `useDragAndDrop().onDragStart` on pointer down + 300ms hold
- Visual feedback: apply `scale(1.05)` and elevated shadow while dragging
- Respects `useAppReducedMotion()` for instant vs. animated transitions

---

### Quadrant (Enhanced)

**New Props**:
```typescript
interface QuadrantProps {
  // Existing props...
  onDropZoneEnter?: (quadrantId: QuadrantId) => void;
  onDropZoneLeave?: () => void;
  isDropTarget?: boolean;  // Highlight when dragged task is over this quadrant
}
```

**New Behavior**:
- Registers ref with `useDragAndDrop().setQuadrantRef`
- Applies highlight class when `isDropTarget === true`
- Renders gap indicator at target index during in-quadrant reorder
- Auto-scrolls when drag near top/bottom edges

---

### Matrix (Enhanced)

**New Responsibility**:
- Orchestrates drag state across all quadrants
- Provides `useDragAndDrop` context to children
- Handles global drag cancellation (Escape key)

---

## Event Flow Diagram

```
User presses on TodoCard
  ↓
Hold for 300ms → onDragStart()
  ↓
Play dragStart sound
  ↓
Visual lift effect (scale, shadow)
  ↓
User drags → onDrag(x, y) [continuous]
  ↓
Detect drop zone via bounding boxes
  ↓
Update targetQuadrant/targetIndex
  ↓
Highlight target quadrant
  ↓
Show gap indicator at target index
  ↓
User releases → onDragEnd()
  ↓
Valid drop zone?
  ├─ Yes → moveTaskToQuadrant() or reorderTaskWithinQuadrant()
  │         ↓
  │      Play dragDrop sound
  │         ↓
  │      Trigger haptic (mobile)
  │         ↓
  │      Persist to IndexedDB
  │         ↓
  │      Animate task to new position
  │
  └─ No  → cancelDrag()
            ↓
         Animate task back to origin
            ↓
         No sound
```

---

## Summary

- **3 new Zustand actions**: `reorderTaskWithinQuadrant`, `moveTaskToQuadrant`, `cancelDrag`
- **1 new hook**: `useDragAndDrop` for state management
- **2 new sound methods**: `dragStart()`, `dragDrop()`
- **Enhanced components**: `TodoCard`, `Quadrant`, `Matrix`
- **Persistence**: Extended `saveTask()` to handle `sortOrder`

All contracts are local-first; no network requests involved.
