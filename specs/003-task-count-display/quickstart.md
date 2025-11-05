# Quickstart Guide: Task Count Display

**Feature**: Task Count Display  
**Branch**: `003-task-count-display`  
**Prerequisites**: Existing Clarity app with Zustand store and UI components  
**Estimated Time**: 2-3 hours for full implementation

---

## Overview

This guide walks through implementing configurable task count displays that show overall totals and per-quadrant counts, with focus mode awareness and settings to control visibility.

---

## Phase 1: Extend Zustand Store (15 minutes)

### 1.1 Add New State Fields

**File**: `app/store/todos.ts`

Add to the `TodosState` interface:

```typescript
interface TodosState {
  // ... existing fields
  
  // NEW: Task count visibility settings
  showOverallCount: boolean;
  showQuadrantCounts: boolean;
  
  // NEW: Actions
  setShowOverallCount: (enabled: boolean) => void;
  setShowQuadrantCounts: (enabled: boolean) => void;
}
```

### 1.2 Implement Store Changes

Add to the store definition:

```typescript
export const useTodos = create<TodosState>()(
  persist(
    (set, get) => ({
      // ... existing state
      
      showOverallCount: false, // Default: OFF per spec
      showQuadrantCounts: false, // Default: OFF per spec
      
      setShowOverallCount: (enabled) => set({ showOverallCount: enabled }),
      setShowQuadrantCounts: (enabled) => set({ showQuadrantCounts: enabled }),
    }),
    {
      name: 'todos-storage',
      // persist middleware automatically includes new fields
    }
  )
);
```

**Test**: 
- Verify no TypeScript errors
- Run `pnpm dev` and check browser console for errors
- Open DevTools → Application → Local Storage → verify empty values for new fields

---

## Phase 2: Create TaskCountBadge Component (20 minutes)

### 2.1 Create Component File

**File**: `app/components/TaskCountBadge.tsx`

```typescript
"use client";
import { Hash } from "lucide-react";

interface TaskCountBadgeProps {
  count: number;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function TaskCountBadge({
  count,
  label,
  icon = <Hash size={14} />,
  className = "",
}: TaskCountBadgeProps) {
  const ariaLabel = label ? `${label}: ${count}` : `Count: ${count}`;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--color-surface))] 
                  border border-[rgb(var(--color-border))] px-2 py-1 text-xs ${className}`}
      aria-label={ariaLabel}
    >
      <span className="text-[rgb(var(--color-text-muted))]">{icon}</span>
      <span className="font-medium text-[rgb(var(--color-text))] tabular-nums">
        {count}
      </span>
    </div>
  );
}
```

**Key Details**:
- `tabular-nums` ensures consistent width for changing numbers
- Accessibility via `aria-label` with context
- Uses CSS custom properties for theming support

**Test**:
- Temporarily render in `page.tsx`: `<TaskCountBadge count={5} label="Test" />`
- Verify it displays correctly in both light and dark themes
- Remove test render before proceeding

---

## Phase 3: Create OverallTaskCount Component (25 minutes)

### 3.1 Create Component File

**File**: `app/components/OverallTaskCount.tsx`

```typescript
"use client";
import { useMemo } from "react";
import { useTodos } from "../store/todos";
import TaskCountBadge from "./TaskCountBadge";

export default function OverallTaskCount() {
  const tasks = useTodos((state) => state.tasks);
  const isFocus = useTodos((state) => state.isFocus);
  const showOverallCount = useTodos((state) => state.showOverallCount);

  const counts = useMemo(() => {
    const activeTasks = tasks.filter((t) => t.status === "active");
    return {
      overall: activeTasks.length,
      q1: activeTasks.filter((t) => t.isUrgent && t.isImportant).length,
    };
  }, [tasks]);

  if (!showOverallCount) return null;

  const displayCount = isFocus ? counts.q1 : counts.overall;
  const label = isFocus ? "Q1 Tasks" : "Total Tasks";

  return <TaskCountBadge count={displayCount} label={label} />;
}
```

**Key Details**:
- Returns `null` when setting is OFF (controlled by user preference)
- Switches between overall and Q1 count based on focus mode
- useMemo prevents recalculation on unrelated state changes

**Test**: Defer testing until integrated into layout

---

## Phase 4: Integrate OverallTaskCount into Header (15 minutes)

### 4.1 Update FocusControls Component

**File**: `app/components/FocusControls.tsx`

Add import:
```typescript
import OverallTaskCount from "./OverallTaskCount";
```

Update return statement to use `justify-between`:

```typescript
return (
  <div className="flex items-center justify-between gap-2 p-2 mb-1">
    <div className="inline-flex items-center gap-2">
      <span className="text-sm font-medium">Focus:</span>

      <Toggle
        pressed={isFocus}
        onPressedChange={(pressed) => {
          sfx.focus();
          if (pressed) {
            enterFocus("all");
          } else {
            exitFocus();
          }
        }}
        disabled={!hasQ1 && !isFocus}
        aria-label="Toggle focus mode"
      />
    </div>

    {isFocus && hasMoreThanOneQ1 && (
      <>
        <div className="ml-2 inline-flex items-center gap-1 text-sm">
          <label className="mr-1">Mode:</label>
          <Select
            value={focusMode}
            onValueChange={(value: string) =>
              setFocusMode(value as "all" | "single")
            }
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Q1</SelectItem>
              <SelectItem value="single">Single</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </>
    )}

    {/* NEW: Overall task count on the right */}
    <OverallTaskCount />
  </div>
);
```

**Key Changes**:
- Changed outer div to `justify-between` (from default `justify-start`)
- Added `<OverallTaskCount />` at the end (right side)

**Test**: 
- Count won't be visible yet (setting defaults to OFF)
- Layout should remain unchanged from before

---

## Phase 5: Update Quadrant Component (30 minutes)

### 5.1 Modify Quadrant Props

**File**: `app/components/Quadrant.tsx`

Update imports:
```typescript
import { useMemo } from "react";
import { useTodos } from "../store/todos";
import type { Task } from "../lib/schema";
import TaskCountBadge from "./TaskCountBadge";
import EmptyState from "./EmptyState";
```

Update props interface:
```typescript
export default function Quadrant({
  title,
  colorVar,
  children,
  isEmpty,
  emptyMessage,
  quadrantId,
  tasks,
}: {
  title: string;
  colorVar: string;
  children?: React.ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  quadrantId: "q1" | "q2" | "q3" | "q4"; // NEW
  tasks: Task[]; // NEW
}) {
  const showQuadrantCounts = useTodos((state) => state.showQuadrantCounts);
  const isFocus = useTodos((state) => state.isFocus);

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

  const shouldShowCount =
    showQuadrantCounts && (!isFocus || quadrantId === "q1");

  return (
    <section className="flex flex-col gap-3 rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-3 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-lg">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: `rgb(var(${colorVar}))` }}
          />
          <h2 className="text-sm font-medium">{title}</h2>
        </div>
        {shouldShowCount && (
          <TaskCountBadge count={count} label={`${title} tasks`} />
        )}
      </header>
      <div className="min-h-24">
        {isEmpty ? (
          <EmptyState message={emptyMessage ?? "No items yet"} />
        ) : (
          children
        )}
      </div>
    </section>
  );
}
```

**Key Changes**:
- Added `quadrantId` and `tasks` props
- Computes count using useMemo
- Conditionally renders count badge in header (right side)
- Hides non-Q1 counts in focus mode

---

### 5.2 Update Quadrant Usage in Matrix

**File**: Find where Quadrant components are rendered (likely `app/page.tsx` or `app/components/Matrix.tsx`)

Update each Quadrant instance:

```typescript
const tasks = useTodos((state) => state.tasks); // Get tasks once

// Q1 - Do First
<Quadrant
  title="Do First"
  colorVar="--q1"
  quadrantId="q1"
  tasks={tasks}
  isEmpty={q1.length === 0}
  emptyMessage="Focus on what matters"
>
  {q1.map((todo) => (
    <TodoCard key={todo.id} task={todo} />
  ))}
</Quadrant>

// Q2 - Schedule
<Quadrant
  title="Schedule"
  colorVar="--q2"
  quadrantId="q2"
  tasks={tasks}
  isEmpty={q2.length === 0}
  emptyMessage="Plan ahead"
>
  {q2.map((todo) => (
    <TodoCard key={todo.id} task={todo} />
  ))}
</Quadrant>

// Q3 - Delegate
<Quadrant
  title="Delegate"
  colorVar="--q3"
  quadrantId="q3"
  tasks={tasks}
  isEmpty={q3.length === 0}
  emptyMessage="Quick wins"
>
  {q3.map((todo) => (
    <TodoCard key={todo.id} task={todo} />
  ))}
</Quadrant>

// Q4 - Delete
<Quadrant
  title="Delete"
  colorVar="--q4"
  quadrantId="q4"
  tasks={tasks}
  isEmpty={q4.length === 0}
  emptyMessage="Minimize these"
>
  {q4.map((todo) => (
    <TodoCard key={todo.id} task={todo} />
  ))}
</Quadrant>
```

**Test**: Counts still won't show (settings are OFF), but no TypeScript errors

---

## Phase 6: Update Settings Component (45 minutes)

### 6.1 Reorganize Settings into Sections

**File**: `app/components/Settings.tsx`

Update the Modal content:

```typescript
<Modal open={open} onOpenChange={setOpen} title="Settings">
  {/* General Section */}
  <section className="mb-4">
    <h3 className="text-sm font-semibold mb-3 text-[rgb(var(--color-text))]">
      General
    </h3>

    {/* Theme */}
    <div className="mb-3">
      <label htmlFor="theme-select" className="mb-1 block text-sm">
        Theme
      </label>
      <Select
        value={themePreference}
        onValueChange={(val: "light" | "dark") => setThemePreference(val)}
      >
        <SelectTrigger id="theme-select" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Sound Effects */}
    <div className="flex items-center justify-between mb-3">
      <label htmlFor="sound-toggle" className="text-sm">
        Sound Effects
      </label>
      <Toggle
        id="sound-toggle"
        pressed={soundEnabled}
        onPressedChange={setSoundEnabled}
        aria-label="Toggle sound effects"
      />
    </div>

    {/* Reduced Motion */}
    <div className="flex items-center justify-between">
      <label htmlFor="motion-toggle" className="text-sm">
        Reduced Motion
      </label>
      <Toggle
        id="motion-toggle"
        pressed={reducedMotionPref}
        onPressedChange={setReducedMotionPref}
        aria-label="Toggle reduced motion"
      />
    </div>
  </section>

  {/* Divider */}
  <hr className="my-4 border-[rgb(var(--color-border))]" />

  {/* Tasks Section */}
  <section>
    <h3 className="text-sm font-semibold mb-3 text-[rgb(var(--color-text))]">
      Tasks
    </h3>

    {/* Show Overall Total */}
    <div className="flex items-center justify-between mb-3">
      <label htmlFor="overall-count-toggle" className="text-sm">
        Show Overall Total
      </label>
      <Toggle
        id="overall-count-toggle"
        pressed={showOverallCount}
        onPressedChange={setShowOverallCount}
        aria-label="Show overall task count"
      />
    </div>

    {/* Show Per-Quadrant Totals */}
    <div className="flex items-center justify-between mb-4">
      <label htmlFor="quadrant-counts-toggle" className="text-sm">
        Show Per-Quadrant Totals
      </label>
      <Toggle
        id="quadrant-counts-toggle"
        pressed={showQuadrantCounts}
        onPressedChange={setShowQuadrantCounts}
        aria-label="Show per-quadrant task counts"
      />
    </div>

    {/* Import / Export */}
    <div className="flex gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          const json = JSON.stringify(exportJSON(), null, 2);
          download("clarity-export.json", json);
          toast.success("Tasks exported");
        }}
      >
        Export
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => fileRef.current?.click()}
      >
        Import
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            const text = await file.text();
            const json = JSON.parse(text);
            await importJSON(json);
            toast.success("Tasks imported");
          } catch {
            toast.error("Invalid file");
          }
          if (fileRef.current) fileRef.current.value = "";
        }}
      />
    </div>
  </section>
</Modal>
```

### 6.2 Add Store Hooks

Add to the top of Settings component:

```typescript
const {
  reducedMotionPref,
  setReducedMotionPref,
  soundEnabled,
  setSoundEnabled,
  themePreference,
  setThemePreference,
  showOverallCount, // NEW
  setShowOverallCount, // NEW
  showQuadrantCounts, // NEW
  setShowQuadrantCounts, // NEW
  exportJSON,
  importJSON,
} = useTodos();
```

**Test**: Open Settings modal and verify:
- Two sections: "General" and "Tasks"
- Clear visual separation (divider between sections)
- All existing settings work
- Two new toggles under "Tasks" section (both OFF by default)

---

## Phase 7: End-to-End Testing (30 minutes)

### 7.1 Test Overall Count

1. Open the app
2. Add 3-5 tasks to various quadrants
3. Open Settings → Tasks → Toggle "Show Overall Total" ON
4. Close Settings
5. **Verify**: Count badge appears in top right (same row as Focus toggle)
6. **Verify**: Count matches total active tasks
7. Add a new task → **Verify**: Count increments immediately
8. Complete a task → **Verify**: Count decrements immediately

### 7.2 Test Per-Quadrant Counts

1. Open Settings → Tasks → Toggle "Show Per-Quadrant Totals" ON
2. Close Settings
3. **Verify**: Each quadrant header shows a count badge (right side)
4. **Verify**: Counts match visible tasks in each quadrant
5. Move a task from Q1 to Q3 (drag or edit) → **Verify**: Q1 decrements, Q3 increments
6. Add task to Q2 → **Verify**: Only Q2 count changes

### 7.3 Test Both Counts Together

1. Ensure both toggles are ON
2. **Verify**: Overall count in header + 4 per-quadrant counts visible
3. **Verify**: Overall count = sum of 4 quadrant counts

### 7.4 Test Focus Mode Integration

1. Ensure you have at least one Q1 task
2. Enable both count settings (both ON)
3. Enter Focus Mode
4. **Verify**: 
   - Overall count in header shows Q1 count only (not total)
   - Only Q1 quadrant shows its count (Q2, Q3, Q4 counts hidden)
5. Exit Focus Mode
6. **Verify**: Counts return to normal (overall shows total, all quadrants show counts)

### 7.5 Test Zero Counts

1. Complete all tasks in one quadrant (e.g., Q4)
2. **Verify**: Q4 count shows "0" (not hidden)
3. Complete all tasks in all quadrants
4. **Verify**: Overall count shows "0"
5. **Verify**: All quadrant counts show "0"

### 7.6 Test Settings Persistence

1. Toggle counts ON
2. Refresh the page (F5 or Cmd+R)
3. **Verify**: Counts remain visible (settings persisted)
4. Toggle counts OFF
5. Refresh the page
6. **Verify**: Counts remain hidden

### 7.7 Test Responsive Layout

1. Open DevTools → Toggle device toolbar
2. Test at 320px width (small mobile)
   - **Verify**: Counts remain readable
   - **Verify**: No horizontal scroll
3. Test at 768px (tablet)
4. Test at 1920px (desktop)
5. **Verify**: Counts scale appropriately at all sizes

### 7.8 Test Dark Mode

1. Open Settings → General → Theme → Dark
2. **Verify**: Count badges use correct dark theme colors
3. **Verify**: Text remains readable (WCAG AA contrast)
4. Switch back to Light theme
5. **Verify**: Counts adjust to light theme

### 7.9 Test Accessibility

1. Use keyboard only (no mouse):
   - Tab to Settings button → Enter to open
   - Tab through settings → verify focus indicators
   - Tab to "Show Overall Total" toggle → Space to toggle
   - Tab to "Show Per-Quadrant Totals" toggle → Space to toggle
2. Use screen reader (if available):
   - Navigate to overall count → **Verify**: "Total Tasks: [number]" announced
   - Navigate to quadrant count → **Verify**: "[Quadrant name] tasks: [number]" announced

---

## Phase 8: Performance Verification (15 minutes)

### 8.1 Measure Count Update Speed

1. Open browser DevTools → Performance tab
2. Start recording
3. Add a task (triggers count update)
4. Stop recording
5. **Verify**: Task add to DOM update completes in <100ms
6. Look for count computation in flame graph (should be <10ms)

### 8.2 Measure Re-render Frequency

1. Open React DevTools → Profiler
2. Start recording
3. Add several tasks
4. Stop recording
5. **Verify**: Only components using counts re-render (not entire app)
6. **Verify**: useMemo prevents unnecessary recalculations

---

## Troubleshooting

### Counts not showing

- **Check**: Are settings toggles ON in Settings?
- **Check**: Browser console for TypeScript errors
- **Check**: localStorage contains `showOverallCount: true`

### Counts incorrect

- **Check**: `status === 'active'` filter in count computation
- **Check**: Task `isUrgent` and `isImportant` values
- **Verify**: Sum of quadrant counts equals overall count

### Focus mode not switching count

- **Check**: `isFocus` state in store
- **Check**: Conditional logic in OverallTaskCount component
- **Check**: Q2, Q3, Q4 counts hiding when focus mode active

### Layout issues

- **Check**: FocusControls uses `justify-between`
- **Check**: Quadrant header uses `justify-between`
- **Check**: Mobile responsive classes present

### Persistence not working

- **Check**: Zustand persist middleware configured
- **Check**: localStorage quota not exceeded
- **Check**: Private browsing mode disabled (blocks localStorage)

---

## Next Steps

1. **Manual QA**: Complete all test scenarios above
2. **Constitution Check**: Verify compliance with all 6 principles
3. **Ready for `/speckit.tasks`**: Generate task breakdown for implementation
4. **Code Review**: Have another developer review changes
5. **Merge**: Merge branch to main after approval

---

## Summary

You've implemented:
- ✅ Zustand store extension with count preferences
- ✅ Reusable TaskCountBadge component
- ✅ Overall count display with focus mode awareness
- ✅ Per-quadrant count displays
- ✅ Reorganized Settings with sections
- ✅ Real-time count updates (<100ms)
- ✅ Full accessibility support
- ✅ Responsive layout (320px-2560px)
- ✅ Dark/light theme support
- ✅ localStorage persistence

**Total Time**: ~3 hours for experienced developer, 4-5 hours for first-time contributor.
