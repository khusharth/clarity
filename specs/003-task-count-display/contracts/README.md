# Component Contracts: Task Count Display

**Feature**: Task Count Display  
**Date**: 2025-11-06  
**Type**: Frontend Component Interfaces

## Overview

This feature is frontend-only with no backend APIs. This document specifies the contracts between React components, Zustand store, and the data they exchange.

---

## 1. Store Contract: TodosState Extension

### Interface Extension

```typescript
interface TodosState {
  // ... existing fields omitted for brevity

  // Task count visibility settings
  showOverallCount: boolean;
  showQuadrantCounts: boolean;

  // Actions
  setShowOverallCount: (enabled: boolean) => void;
  setShowQuadrantCounts: (enabled: boolean) => void;
}
```

### State Fields

#### `showOverallCount: boolean`

**Purpose**: Controls visibility of overall task count display  
**Default**: `false` (per spec FR-001)  
**Persistence**: Saved to localStorage via Zustand persist middleware  
**Validation**: Must be boolean

**Consumer Components**:

- `OverallTaskCount` (reads to determine visibility)
- `Settings` (reads for toggle state, writes on user action)

---

#### `showQuadrantCounts: boolean`

**Purpose**: Controls visibility of per-quadrant count displays  
**Default**: `false` (per spec FR-001)  
**Persistence**: Saved to localStorage via Zustand persist middleware  
**Validation**: Must be boolean

**Consumer Components**:

- `Quadrant` (reads to determine visibility of count badge)
- `Settings` (reads for toggle state, writes on user action)

---

### Actions

#### `setShowOverallCount(enabled: boolean): void`

**Purpose**: Update overall count visibility preference  
**Parameters**:

- `enabled`: boolean - new visibility state

**Side Effects**:

- Updates `showOverallCount` in store
- Triggers re-render of subscribed components
- Persists to localStorage automatically

**Example Usage**:

```typescript
// In Settings component
const { showOverallCount, setShowOverallCount } = useTodos();

<Toggle
  pressed={showOverallCount}
  onPressedChange={setShowOverallCount}
  aria-label="Show overall task count"
/>;
```

---

#### `setShowQuadrantCounts(enabled: boolean): void`

**Purpose**: Update per-quadrant count visibility preference  
**Parameters**:

- `enabled`: boolean - new visibility state

**Side Effects**:

- Updates `showQuadrantCounts` in store
- Triggers re-render of subscribed components
- Persists to localStorage automatically

**Example Usage**:

```typescript
// In Settings component
const { showQuadrantCounts, setShowQuadrantCounts } = useTodos();

<Toggle
  pressed={showQuadrantCounts}
  onPressedChange={setShowQuadrantCounts}
  aria-label="Show per-quadrant task counts"
/>;
```

---

## 2. Component Contract: TaskCountBadge

### Purpose

Reusable styled badge component for displaying count numbers with icon.

### Props Interface

```typescript
interface TaskCountBadgeProps {
  count: number;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}
```

### Props Specification

#### `count: number` (required)

**Purpose**: The numeric count to display  
**Validation**:

- Must be non-negative integer
- Displays "0" when zero (not hidden)

**Example**: `5`, `0`, `23`

---

#### `label?: string` (optional)

**Purpose**: Accessible label for screen readers  
**Default**: `undefined` (component generates default)  
**Validation**: String or undefined

**Example**: `"Q1 tasks"`, `"Total tasks"`

**Usage**:

```typescript
<TaskCountBadge count={5} label="Total tasks" />
// Renders with aria-label="Total tasks: 5"
```

---

#### `icon?: React.ReactNode` (optional)

**Purpose**: Icon to display before count number  
**Default**: `<Hash size={14} />` from lucide-react  
**Validation**: Valid React element or undefined

**Example**: `<Hash size={14} />`, custom icon component

---

#### `className?: string` (optional)

**Purpose**: Additional Tailwind classes for styling  
**Default**: `""` (empty string)  
**Validation**: String

**Example**: `"bg-blue-500"`, `"text-lg"`

---

### Return Type

```typescript
JSX.Element;
```

**Rendered HTML Structure**:

```html
<div
  className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--color-surface))] 
             border border-[rgb(var(--color-border))] px-2 py-1 text-xs"
  aria-label="[label]: [count]"
>
  <Hash size="{14}" className="text-[rgb(var(--color-text-muted))]" />
  <span className="font-medium text-[rgb(var(--color-text))]">{count}</span>
</div>
```

---

### Example Usage

```typescript
import TaskCountBadge from './TaskCountBadge';

// Basic usage
<TaskCountBadge count={5} />

// With custom label
<TaskCountBadge count={12} label="Q1 tasks" />

// With custom icon
<TaskCountBadge count={3} icon={<Star size={14} />} label="Important" />

// With additional styling
<TaskCountBadge count={0} className="opacity-50" label="No tasks" />
```

---

## 3. Component Contract: OverallTaskCount

### Purpose

Display overall task count (or Q1 count in focus mode) in the header area.

### Props Interface

```typescript
interface OverallTaskCountProps {
  // No props - component reads from Zustand store
}
```

### Store Dependencies

**Reads**:

- `tasks: Task[]` - for computing counts
- `isFocus: boolean` - to determine display mode
- `showOverallCount: boolean` - to determine visibility

**Computes**:

- Overall count: `tasks.filter(t => t.status === 'active').length`
- Q1 count: `tasks.filter(t => t.status === 'active' && t.isUrgent && t.isImportant).length`

---

### Display Logic

```typescript
if (!showOverallCount) return null; // Hidden when setting is OFF

const displayCount = isFocus ? q1Count : overallCount;
const label = isFocus ? "Q1 Tasks" : "Total Tasks";

return <TaskCountBadge count={displayCount} label={label} />;
```

---

### Return Type

```typescript
JSX.Element | null;
```

**Conditions**:

- Returns `null` when `showOverallCount === false`
- Returns `<TaskCountBadge />` when `showOverallCount === true`

---

### Example Usage

```typescript
// In FocusControls.tsx
import OverallTaskCount from "./OverallTaskCount";

<div className="flex items-center justify-between gap-2 p-2 mb-1">
  <div className="flex items-center gap-2">
    {/* Focus toggle and mode selector */}
  </div>
  <OverallTaskCount />
</div>;
```

---

### Behavior Scenarios

| `showOverallCount` | `isFocus` | Display                                |
| ------------------ | --------- | -------------------------------------- |
| `false`            | `false`   | Hidden (returns null)                  |
| `false`            | `true`    | Hidden (returns null)                  |
| `true`             | `false`   | Shows overall count (all active tasks) |
| `true`             | `true`    | Shows Q1 count only                    |

---

## 4. Component Contract: Quadrant (Modified)

### Purpose

Display a quadrant of the matrix with optional count badge in header.

### Props Interface (Extended)

```typescript
interface QuadrantProps {
  title: string;
  colorVar: string;
  children?: React.ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;

  // NEW: Count-related props
  quadrantId: "q1" | "q2" | "q3" | "q4"; // NEW
  tasks: Task[]; // NEW: Pass tasks array for count computation
}
```

### New Props Specification

#### `quadrantId: 'q1' | 'q2' | 'q3' | 'q4'` (required)

**Purpose**: Identifier for which quadrant this is  
**Validation**: Must be one of the four literal strings  
**Usage**: Determines which tasks to count and focus mode visibility

**Mapping**:

- `q1`: Urgent + Important
- `q2`: Not Urgent + Important
- `q3`: Urgent + Not Important
- `q4`: Not Urgent + Not Important

---

#### `tasks: Task[]` (required)

**Purpose**: Array of tasks to filter and count for this quadrant  
**Validation**: Must be array (can be empty)  
**Usage**: Component filters by quadrant criteria and computes count

---

### Store Dependencies

**Reads**:

- `showQuadrantCounts: boolean` - to determine count visibility
- `isFocus: boolean` - to hide non-Q1 quadrants

---

### Count Computation Logic

```typescript
const count = useMemo(() => {
  const activeTasks = tasks.filter((t) => t.status === "active");

  switch (quadrantId) {
    case "q1":
      return activeTasks.filter((t) => t.isUrgent && t.isImportant).length;
    case "q2":
      return activeTasks.filter((t) => !t.isUrgent && t.isImportant).length;
    case "q3":
      return activeTasks.filter((t) => t.isUrgent && !t.isImportant).length;
    case "q4":
      return activeTasks.filter((t) => !t.isUrgent && !t.isImportant).length;
  }
}, [tasks, quadrantId]);
```

---

### Display Logic

```typescript
const shouldShowCount = showQuadrantCounts && (!isFocus || quadrantId === "q1");

return (
  <section className="...">
    <header className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div
          className="..."
          style={{ backgroundColor: `rgb(var(${colorVar}))` }}
        />
        <h2 className="text-sm font-medium">{title}</h2>
      </div>
      {shouldShowCount && (
        <TaskCountBadge count={count} label={`${title} tasks`} />
      )}
    </header>
    {/* ... body */}
  </section>
);
```

---

### Example Usage

```typescript
// In Matrix component
const tasks = useTodos((state) => state.tasks);

<Quadrant
  title="Do First"
  colorVar="--q1"
  quadrantId="q1"
  tasks={tasks}
  isEmpty={q1Tasks.length === 0}
>
  {q1Tasks.map((task) => (
    <TodoCard key={task.id} task={task} />
  ))}
</Quadrant>;
```

---

### Behavior Scenarios

| `showQuadrantCounts` | `isFocus` | `quadrantId`     | Count Visible? |
| -------------------- | --------- | ---------------- | -------------- |
| `false`              | `false`   | Any              | No             |
| `false`              | `true`    | Any              | No             |
| `true`               | `false`   | Any              | Yes            |
| `true`               | `true`    | `q1`             | Yes            |
| `true`               | `true`    | `q2`, `q3`, `q4` | No             |

---

## 5. Component Contract: Settings (Modified)

### Purpose

Settings modal with organized sections for preferences and task features.

### Props Interface (Unchanged)

```typescript
interface SettingsProps {
  className?: string;
}
```

### Store Dependencies (Extended)

**Reads**:

- Existing: `reducedMotionPref`, `soundEnabled`, `themePreference`
- NEW: `showOverallCount`, `showQuadrantCounts`

**Writes**:

- Existing: `setReducedMotionPref`, `setSoundEnabled`, `setThemePreference`
- NEW: `setShowOverallCount`, `setShowQuadrantCounts`

---

### UI Structure

```typescript
<Modal open={open} onOpenChange={setOpen} title="Settings">
  {/* General Section */}
  <section>
    <h3 className="text-sm font-semibold mb-2 text-[rgb(var(--color-text))]">
      General
    </h3>

    {/* Theme Select */}
    <div className="mb-3">
      <label>Theme</label>
      <Select value={themePreference} onValueChange={setThemePreference}>
        {/* ... options */}
      </Select>
    </div>

    {/* Sound Toggle */}
    <div className="flex items-center justify-between mb-3">
      <label>Sound Effects</label>
      <Toggle pressed={soundEnabled} onPressedChange={setSoundEnabled} />
    </div>

    {/* Motion Toggle */}
    <div className="flex items-center justify-between">
      <label>Reduced Motion</label>
      <Toggle
        pressed={reducedMotionPref}
        onPressedChange={setReducedMotionPref}
      />
    </div>
  </section>

  {/* Divider */}
  <hr className="my-4 border-[rgb(var(--color-border))]" />

  {/* Tasks Section */}
  <section>
    <h3 className="text-sm font-semibold mb-2 text-[rgb(var(--color-text))]">
      Tasks
    </h3>

    {/* Overall Count Toggle */}
    <div className="flex items-center justify-between mb-3">
      <label>Show Overall Total</label>
      <Toggle
        pressed={showOverallCount}
        onPressedChange={setShowOverallCount}
        aria-label="Show overall task count"
      />
    </div>

    {/* Quadrant Counts Toggle */}
    <div className="flex items-center justify-between mb-3">
      <label>Show Per-Quadrant Totals</label>
      <Toggle
        pressed={showQuadrantCounts}
        onPressedChange={setShowQuadrantCounts}
        aria-label="Show per-quadrant task counts"
      />
    </div>

    {/* Import/Export */}
    <div className="flex items-center justify-between">
      {/* ... existing import/export buttons */}
    </div>
  </section>
</Modal>
```

---

## 6. Type Definitions

### Task Type (Existing - Reference)

```typescript
// app/lib/schema.ts
export interface Task {
  id: string;
  text: string;
  isUrgent: boolean;
  isImportant: boolean;
  status: "active" | "completed";
  createdAt: number;
  completedAt: number | null;
}
```

---

### Task Counts Type (Derived)

```typescript
// Used in components for type safety
interface TaskCounts {
  overall: number;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
}
```

---

## 7. Event Flows

### User Enables Overall Count

```
User clicks "Show Overall Total" toggle in Settings
  ↓
Toggle.onPressedChange(true) fires
  ↓
setShowOverallCount(true) called
  ↓
Zustand updates showOverallCount: false → true
  ↓
localStorage updated via persist middleware
  ↓
OverallTaskCount component re-renders (was returning null)
  ↓
Computes count from tasks array
  ↓
Renders TaskCountBadge with count
  ↓
User sees count appear in header (top right)
```

**Duration**: <100ms (typically <20ms)

---

### User Enters Focus Mode with Counts Enabled

```
User toggles Focus to ON
  ↓
enterFocus('all') called
  ↓
Zustand updates isFocus: false → true
  ↓
OverallTaskCount detects isFocus change
  ↓
Switches from overall count to Q1 count
  ↓
Quadrant components (Q2, Q3, Q4) hide their counts
  ↓
Only Q1 quadrant count remains visible
  ↓
User sees focused view with Q1-only counts
```

**Duration**: <100ms (synchronous state update)

---

### Task Added Updates Counts

```
User adds task to Q1 (urgent + important)
  ↓
add() action updates tasks array
  ↓
React detects tasks array reference change
  ↓
useMemo in OverallTaskCount recomputes:
  - overall: 10 → 11
  - q1: 5 → 6
  ↓
useMemo in Q1 Quadrant recomputes:
  - count: 5 → 6
  ↓
Components re-render with new counts
  ↓
User sees counts increment immediately
```

**Duration**: <100ms (typically <10ms for array operations)

---

## 8. Error Handling

### Invalid Count Values

**Scenario**: Count computation returns negative or non-integer  
**Handling**: TypeScript ensures Array.length returns non-negative integer  
**Fallback**: Not needed (type system prevents this)

---

### Missing Store Fields (Migration)

**Scenario**: Existing user upgrades, store missing new boolean fields  
**Handling**: Zustand uses default values from initial state  
**Behavior**:

- `showOverallCount` defaults to `false`
- `showQuadrantCounts` defaults to `false`
- Counts remain hidden until user opts in

---

### Tasks Array Undefined

**Scenario**: Store not hydrated, tasks array not yet loaded  
**Handling**:

```typescript
const tasks = useTodos(state => state.tasks) ?? [];
const count = tasks.filter(...).length; // Safe, returns 0 for empty array
```

**Behavior**: Displays "0" until hydration complete

---

## 9. Performance Contracts

### Count Computation

**Requirement**: Recompute counts in <100ms (per spec SC-002)  
**Implementation**: useMemo with tasks array as dependency  
**Complexity**: O(n) where n = active tasks count  
**Expected**: <10ms for n < 1000

---

### Re-render Frequency

**Requirement**: Minimize unnecessary re-renders  
**Implementation**:

- Components subscribe only to needed store slices
- useMemo prevents recalculation on unrelated state changes
- React.memo not needed (components are small, render is cheap)

---

## 10. Accessibility Contracts

### Screen Reader Support

**Requirement**: Counts must be announced with context  
**Implementation**: `aria-label` on count displays

**Examples**:

```typescript
// Overall count
aria-label="Total task count: 5"

// Focus mode Q1 count
aria-label="Q1 task count: 3"

// Per-quadrant count
aria-label="Do First tasks: 7"
```

---

### Keyboard Navigation

**Requirement**: All toggles must be keyboard-accessible  
**Implementation**: Existing Toggle component handles keyboard (Tab, Enter, Space)  
**Contract**: Toggle component provides accessible keyboard interaction

---

## Summary

This document specifies the contracts between components, store, and data for the Task Count Display feature. All interfaces are type-safe via TypeScript. No backend APIs are involved (frontend-only feature).
