# Data Model: Task Count Display

**Feature**: Task Count Display  
**Date**: 2025-11-06  
**Status**: Complete

## Overview

This feature extends the existing Zustand store with user preferences and introduces derived data (task counts) computed from existing entities. No new persistent entities are created.

---

## Entities

### 1. Task (Existing - No Changes)

**Source**: `app/lib/schema.ts`

**Attributes**:

- `id`: string (unique identifier)
- `text`: string (task description)
- `isUrgent`: boolean (urgent dimension)
- `isImportant`: boolean (important dimension)
- `status`: 'active' | 'completed' (task state)
- `createdAt`: number (timestamp)
- `completedAt`: number | null (completion timestamp)

**Relationships**:

- Belongs to exactly one quadrant (derived from isUrgent + isImportant)
- Aggregated into counts by status and quadrant

**Validation Rules**:

- `id` must be unique and non-empty
- `status` determines inclusion in counts (only 'active' tasks counted)

**State Transitions**:

- `active` → `completed` (via complete action)
- `completed` → `active` (via uncomplete action)

**Usage in Feature**:

- Filtered by `status === 'active'` for count calculations
- Grouped by `isUrgent` and `isImportant` for quadrant counts

---

### 2. Task Count Settings (New - Store Extension)

**Source**: `app/store/todos.ts` (extended)

**Attributes**:

- `showOverallCount`: boolean (default: false)
  - Controls visibility of total task count across all quadrants
  - Persisted to localStorage via Zustand persist middleware
- `showQuadrantCounts`: boolean (default: false)
  - Controls visibility of per-quadrant task counts
  - Persisted to localStorage via Zustand persist middleware

**Relationships**:

- Independent boolean flags (not mutually exclusive)
- Both can be true, false, or one of each
- No relationship to Task entities (pure UI preference)

**Validation Rules**:

- Must be boolean values
- No constraints on combination (both on, both off, or mixed allowed)

**State Transitions**:

- User toggles in Settings → immediate update in store → localStorage sync
- No side effects on Task entities

**Persistence**:

```typescript
// Zustand persist middleware config (existing pattern)
{
  name: 'todos-storage',
  partialize: (state) => ({
    // ... existing fields
    showOverallCount: state.showOverallCount,
    showQuadrantCounts: state.showQuadrantCounts,
  })
}
```

---

### 3. Task Counts (Derived - Computed, Not Stored)

**Source**: Computed in components via `useMemo` hook

**Attributes**:

- `overall`: number (count of all active tasks)
- `q1`: number (count of urgent + important active tasks)
- `q2`: number (count of not urgent + important active tasks)
- `q3`: number (count of urgent + not important active tasks)
- `q4`: number (count of not urgent + not important active tasks)

**Derivation Logic**:

```typescript
const tasks = useTodos((state) => state.tasks);

const counts = useMemo(() => {
  const activeTasks = tasks.filter((t) => t.status === "active");

  return {
    overall: activeTasks.length,
    q1: activeTasks.filter((t) => t.isUrgent && t.isImportant).length,
    q2: activeTasks.filter((t) => !t.isUrgent && t.isImportant).length,
    q3: activeTasks.filter((t) => t.isUrgent && !t.isImportant).length,
    q4: activeTasks.filter((t) => !t.isUrgent && !t.isImportant).length,
  };
}, [tasks]);
```

**Relationships**:

- Computed from Task entities
- Depends on Task.status, Task.isUrgent, Task.isImportant
- Overall count = sum of q1 + q2 + q3 + q4

**Validation Rules**:

- All counts must be non-negative integers
- Sum validation: `overall === q1 + q2 + q3 + q4`
- Minimum value: 0 (displayed as "0", not hidden)

**State Transitions**:

- Recomputed whenever tasks array reference changes
- Task added → relevant count increments
- Task completed → all counts decrement (task excluded)
- Task moved between quadrants → old quadrant decrements, new increments
- Task uncompleted → counts increment

**Performance**:

- useMemo prevents recalculation on unrelated state changes
- Array filtering is O(n) where n = total active tasks
- Expected n < 1000, so <10ms computation time (well under 100ms requirement)

---

### 4. Focus Mode Context (Existing - No Changes, Affects Display)

**Source**: `app/store/todos.ts`

**Attributes**:

- `isFocus`: boolean (whether focus mode is active)

**Effect on Counts**:

- When `isFocus === true`:
  - Overall count display shows Q1 count only (not overall)
  - Per-quadrant counts show only Q1 count (Q2, Q3, Q4 hidden)
- When `isFocus === false`:
  - Counts display according to user settings (overall and/or per-quadrant)

**Logic**:

```typescript
// In OverallTaskCount component
const isFocus = useTodos((state) => state.isFocus);
const displayCount = isFocus ? counts.q1 : counts.overall;
const label = isFocus ? "Q1 Tasks" : "Total Tasks";
```

---

## Data Flow

### Count Calculation Flow

```
User Action (add/complete/move task)
  ↓
Zustand store updates tasks array
  ↓
React detects tasks array reference change
  ↓
useMemo recomputes counts (in each component using counts)
  ↓
Components re-render with new count values
  ↓
DOM updates (count number changes)
```

**Timing**: Entire flow completes in <100ms (typically <20ms)

---

### Settings Update Flow

```
User toggles count visibility in Settings
  ↓
Zustand action: setShowOverallCount(true) or setShowQuadrantCounts(true)
  ↓
Store updates boolean flag
  ↓
Zustand persist middleware writes to localStorage
  ↓
Components subscribed to flags re-render
  ↓
Count displays conditionally rendered (appear or disappear)
```

**Timing**: Synchronous (< 5ms), no async operations

---

### Focus Mode Interaction

```
User enters focus mode
  ↓
Store sets isFocus = true
  ↓
OverallTaskCount component detects isFocus change
  ↓
Switches from overall count to Q1 count
  ↓
Per-quadrant counts in Q2, Q3, Q4 hide (conditional render)
  ↓
Only Q1 count remains visible
```

---

## Schema Extensions

### Zustand Store Interface Extension

```typescript
// app/store/todos.ts

interface TodosState {
  // ... existing fields (tasks, isFocus, focusMode, etc.)

  // NEW: Task count settings
  showOverallCount: boolean;
  showQuadrantCounts: boolean;

  // NEW: Actions for count settings
  setShowOverallCount: (enabled: boolean) => void;
  setShowQuadrantCounts: (enabled: boolean) => void;
}

// Implementation
export const useTodos = create<TodosState>()(
  persist(
    (set, get) => ({
      // ... existing state

      showOverallCount: false, // Default: OFF per spec FR-001
      showQuadrantCounts: false, // Default: OFF per spec FR-001

      setShowOverallCount: (enabled) => set({ showOverallCount: enabled }),
      setShowQuadrantCounts: (enabled) => set({ showQuadrantCounts: enabled }),
    }),
    {
      name: "todos-storage",
      // Persist middleware automatically includes new fields
    }
  )
);
```

---

## Component Data Requirements

### OverallTaskCount Component

**Reads**:

- `tasks` (array) - to compute counts
- `isFocus` (boolean) - to determine display mode
- `showOverallCount` (boolean) - to determine visibility

**Computes**:

- `overall` count (all active tasks)
- `q1` count (for focus mode display)

**Displays**:

- Label: "Total Tasks" or "Q1 Tasks" (based on isFocus)
- Count: number as integer

---

### Quadrant Component (Extended)

**Reads**:

- `tasks` (array) - to compute quadrant-specific count
- `showQuadrantCounts` (boolean) - to determine visibility
- `isFocus` (boolean) - to hide non-Q1 quadrants
- Quadrant identifier (passed as prop: Q1, Q2, Q3, Q4)

**Computes**:

- Count for specific quadrant (filtered by isUrgent/isImportant)

**Displays**:

- Count badge in header (right-aligned)
- Hidden when `showQuadrantCounts === false`
- Q2, Q3, Q4 hidden when `isFocus === true`

---

### Settings Component (Extended)

**Reads**:

- `showOverallCount` (boolean) - current toggle state
- `showQuadrantCounts` (boolean) - current toggle state

**Writes**:

- `setShowOverallCount(boolean)` - user toggles overall count
- `setShowQuadrantCounts(boolean)` - user toggles quadrant counts

**UI Elements**:

- Section header: "Tasks"
- Toggle: "Show Overall Total" (default: OFF)
- Toggle: "Show Per-Quadrant Totals" (default: OFF)

---

## Constraints & Invariants

### Data Integrity

1. **Count Accuracy**: Computed counts must always match actual task state
   - Enforced by: Computing directly from tasks array (single source of truth)
2. **Sum Invariant**: `overall === q1 + q2 + q3 + q4`
   - Enforced by: Filtering same tasks array with non-overlapping conditions
3. **Non-negative Counts**: All counts >= 0
   - Enforced by: Array.length always returns non-negative integer
4. **Active-Only Counts**: Only `status === 'active'` tasks counted
   - Enforced by: Filter predicate in count computation

### Performance Constraints

1. **Update Latency**: Counts update within 100ms of task changes
   - Enforced by: Synchronous useMemo computation, React's efficient diffing
2. **No Layout Shift**: Count appearance/disappearance must not shift other elements
   - Enforced by: Fixed-width containers, absolute/flex positioning

### Accessibility Constraints

1. **Screen Reader Support**: Counts must be announced with context
   - Enforced by: `aria-label` attributes with full text (e.g., "Total task count: 5")
2. **Keyboard Access**: Settings toggles must be keyboard-navigable
   - Enforced by: Using existing Toggle component (already accessible)

---

## Migration & Backwards Compatibility

### Existing Users (Upgrading to This Feature)

**Initial State**:

- `showOverallCount` defaults to `false` (per spec FR-001)
- `showQuadrantCounts` defaults to `false` (per spec FR-001)
- No counts visible until user opts in

**Data Migration**:

- No migration needed (new boolean fields added to store)
- Zustand persist middleware handles missing fields gracefully (uses defaults)
- Existing tasks, preferences, and focus mode state unaffected

**User Experience**:

- Feature is "invisible" until user enables it in Settings
- No breaking changes to existing workflows
- Opt-in by design (respects "Calm Design" principle)

---

## Summary

This feature extends existing entities with two boolean preferences and introduces derived counts computed on-demand. No new persistent entities are created. Data integrity is maintained through single-source-of-truth pattern (computing from tasks array). Performance constraints are met through useMemo caching and synchronous operations.
