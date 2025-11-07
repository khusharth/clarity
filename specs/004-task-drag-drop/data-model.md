# Data Model: Task Drag and Drop

**Feature**: 004-task-drag-drop  
**Date**: 2025-11-07  
**Phase**: 1 - Data Design

## Overview

This feature extends the existing Task entity with ordering capabilities and introduces transient drag state management. No new persistent entities are required.

---

## Modified Entities

### Task (Extended)

Represents a task item in the Eisenhower Matrix with drag-and-drop ordering support.

**Persistent Fields**:

```typescript
interface Task {
  // Existing fields (unchanged)
  id: string; // UUID
  text: string; // Task description
  isUrgent: boolean; // Urgency classification
  isImportant: boolean; // Importance classification
  status: TaskStatus; // "active" | "completed"
  createdAt: string; // ISO timestamp
  completedAt: string | null; // ISO timestamp or null

  // NEW: Drag-and-drop ordering
  sortOrder: number | null; // Fractional index for custom ordering
  // null = use createdAt for sorting (backward compatible)
}
```

**Field Details**:

- **sortOrder**:
  - Type: `number | null`
  - Purpose: Defines task position within a quadrant after manual reordering
  - Range: Any positive floating-point number (typically 0.5 to N+1)
  - Null semantics: Task has never been manually reordered; fall back to `createdAt` for sorting
  - Calculation: On drop, `sortOrder = (prevTask.sortOrder + nextTask.sortOrder) / 2`
  - Edge cases:
    - First position: `sortOrder = 0.5`
    - Last position: `sortOrder = maxSortOrder + 1`
    - Between tasks with null sortOrder: assign new fractional values based on position

**Sorting Logic**:

```sql
ORDER BY
  sortOrder ASC NULLS LAST,  -- Manual order takes precedence
  createdAt ASC              -- Fall back to creation time
```

**Validation Rules**:

- `sortOrder` must be positive if not null
- `sortOrder` uniqueness not enforced (allows duplicates; ties broken by `createdAt`)

**Relationships**:

- Belongs to one quadrant (computed via `computeQuadrant(isUrgent, isImportant)`)
- No explicit foreign keys (denormalized design)

---

## Transient State (Non-Persistent)

### DragState

Represents the current drag operation in progress. Lives in component state; never persisted.

**Interface**:

```typescript
interface DragState {
  isDragging: boolean; // Whether any drag is active
  draggedTaskId: string | null; // ID of task being dragged
  sourceQuadrant: QuadrantId | null; // "Q1" | "Q2" | "Q3" | "Q4"
  sourceIndex: number | null; // Original position in source quadrant
  targetQuadrant: QuadrantId | null; // Current drop zone (updates on drag)
  targetIndex: number | null; // Insertion index in target quadrant
  pointerX: number; // Current pointer X coordinate
  pointerY: number; // Current pointer Y coordinate
}

type QuadrantId = "Q1" | "Q2" | "Q3" | "Q4";
```

**Lifecycle**:

1. **Drag Start**: Initialize with source quadrant/index, `isDragging = true`
2. **Drag Move**: Update `targetQuadrant`, `targetIndex`, `pointerX`, `pointerY`
3. **Drag End**:
   - If valid drop: commit changes to Task entity (update `isUrgent`, `isImportant`, `sortOrder`)
   - If cancelled: reset state
4. **Reset**: All fields return to null/false

**State Management**:

- Managed by `useDragAndDrop` custom hook
- Shared across `TodoCard`, `Quadrant`, and `Matrix` components via context or prop drilling

---

## Schema Changes

### Database Migration

**Dexie Schema Update** (IndexedDB):

```typescript
// In app/lib/db.ts
db.version(2).stores({
  tasks: "id, status, createdAt, sortOrder", // Add sortOrder to indexes
});
```

**Migration Strategy**:

- All existing tasks have `sortOrder = null` by default
- No data loss; backward compatible
- First drag operation on a task assigns initial `sortOrder`

---

## Computed Properties

### Quadrant Assignment

**Function** (existing, unchanged):

```typescript
function computeQuadrant(task: Task): QuadrantId {
  if (task.isUrgent && task.isImportant) return "Q1";
  if (!task.isUrgent && task.isImportant) return "Q2";
  if (task.isUrgent && !task.isImportant) return "Q3";
  return "Q4";
}
```

**Usage**:

- Called when task moves between quadrants to update `isUrgent`/`isImportant`
- Drop zone determines new quadrant, which sets flags

---

## State Transitions

### Task Reordering Within Quadrant

```
[User drags Task A between Task B and Task C]
  ↓
Calculate: sortOrder_new = (sortOrder_B + sortOrder_C) / 2
  ↓
Update Task A: { sortOrder: sortOrder_new }
  ↓
Persist to IndexedDB
  ↓
Re-render quadrant with new order
```

### Task Moving Across Quadrants

```
[User drags Task from Q1 to Q3]
  ↓
Determine target quadrant flags:
  Q3 = { isUrgent: true, isImportant: false }
  ↓
Calculate sortOrder based on drop position in Q3
  ↓
Update Task: {
  isUrgent: true,
  isImportant: false,
  sortOrder: calculated_value
}
  ↓
Persist to IndexedDB
  ↓
Remove from Q1, add to Q3 in UI
```

---

## Data Validation

### Client-Side Validation

**On Drag Start**:

- Task must have `status === "active"` (no dragging completed tasks)
- Task must exist in current quadrant list

**On Drop**:

- Target quadrant must be valid ("Q1" | "Q2" | "Q3" | "Q4")
- Target index must be >= 0 and <= taskCount
- If cross-quadrant drop, new `isUrgent`/`isImportant` must differ from current

**sortOrder Calculation**:

- Must produce positive number
- Handle edge cases (first/last position, null neighbors)

---

## Example Data Scenarios

### Scenario 1: New Task (No Drag History)

```json
{
  "id": "abc123",
  "text": "Review PRs",
  "isUrgent": true,
  "isImportant": true,
  "status": "active",
  "createdAt": "2025-11-07T10:00:00Z",
  "completedAt": null,
  "sortOrder": null // Falls back to createdAt for sorting
}
```

### Scenario 2: Task After First Drag (Dropped at Position 2)

```json
{
  "id": "abc123",
  "text": "Review PRs",
  "isUrgent": true,
  "isImportant": true,
  "status": "active",
  "createdAt": "2025-11-07T10:00:00Z",
  "completedAt": null,
  "sortOrder": 1.5 // Between task at 1.0 and 2.0
}
```

### Scenario 3: Task Moved to Different Quadrant

```json
{
  "id": "abc123",
  "text": "Review PRs",
  "isUrgent": false, // Changed from true
  "isImportant": true, // Unchanged
  "status": "active",
  "createdAt": "2025-11-07T10:00:00Z",
  "completedAt": null,
  "sortOrder": 0.5 // Dropped at first position in Q2
}
```

---

## Sorting Algorithm Implementation

### Default Sorting (Pre-Drag)

```typescript
tasks.sort((a, b) => {
  // Sort by createdAt (oldest first)
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
});
```

### Sorting With Drag-and-Drop

```typescript
tasks.sort((a, b) => {
  // Priority 1: sortOrder (if both have values)
  if (a.sortOrder !== null && b.sortOrder !== null) {
    return a.sortOrder - b.sortOrder;
  }

  // Priority 2: Tasks with sortOrder come first
  if (a.sortOrder !== null) return -1;
  if (b.sortOrder !== null) return 1;

  // Priority 3: Fall back to createdAt
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
});
```

---

## Summary

- **Modified Entity**: `Task` (added `sortOrder` field)
- **New Transient State**: `DragState` (in-memory only)
- **Schema Migration**: Dexie version 2 with `sortOrder` index
- **Backward Compatibility**: Existing tasks have `sortOrder = null`, sorted by `createdAt`
- **Sorting Strategy**: Fractional indexing with fallback to creation time
