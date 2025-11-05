# Research: Task Count Display

**Feature**: Task Count Display  
**Date**: 2025-11-06  
**Status**: Complete

## Research Questions

### 1. Icon Selection for Task Counts

**Decision**: Use `Hash` icon from lucide-react for count displays

**Rationale**:

- The Hash (#) symbol is universally recognized for counting/numbering
- lucide-react is already a dependency (v0.468.0)
- Consistent with existing icon usage (SettingsIcon in Settings.tsx, SparklesIcon in Header.tsx)
- Small size (16px) works well in compact header spaces
- WCAG AA compliant when paired with proper color contrast

**Alternatives Considered**:

- `ListOrdered`: Too suggestive of ordering rather than simple counting
- `Calculator`: Implies computation rather than display
- `BarChart`: Too analytical, conflicts with "calm design" principle
- Text-only numbers: Less scannable, harder to identify as count feature

**Implementation Notes**:

- Use `<Hash size={14} />` for compact inline display
- Pair with numeric value: `<Hash /> 5` or just numeric badge style

---

### 2. Count Display Position Strategy

**Decision**:

- Overall count: Top right of FocusControls row (same row as Focus toggle)
- Per-quadrant counts: Inside each Quadrant header, right-aligned after title

**Rationale**:

- FocusControls already provides a natural horizontal bar at top of matrix
- Right-aligning overall count creates visual balance with left-aligned Focus toggle
- Per-quadrant counts in headers keep them contextually close to their data
- No new layout containers needed, minimizing complexity
- Responsive: counts can wrap or hide gracefully on mobile

**Alternatives Considered**:

- Floating overlay in corner: Too intrusive, violates "calm design"
- Below matrix: Too far from context, poor scanability
- Inside quadrant body: Competes with task cards for attention

**Layout Specification**:

```tsx
// FocusControls.tsx structure
<div className="flex items-center justify-between gap-2 p-2 mb-1">
  <div className="flex items-center gap-2">
    {/* Existing Focus toggle and mode selector */}
  </div>
  {showOverallCount && <OverallTaskCount />}
</div>

// Quadrant.tsx header structure
<header className="flex items-center justify-between gap-2">
  <div className="flex items-center gap-2">
    <div className="h-2 w-2 rounded-full" />
    <h2 className="text-sm font-medium">{title}</h2>
  </div>
  {showQuadrantCounts && <QuadrantCountBadge count={count} />}
</header>
```

---

### 3. Settings Organization Strategy

**Decision**: Organize settings into two collapsible sections:

1. **General**: Theme, Sound, Motion (existing preferences)
2. **Tasks**: Show Overall Count, Show Quadrant Counts, Import/Export

**Rationale**:

- Logical grouping: UI preferences vs. task-specific features
- Scalability: New task features can be added to "Tasks" section
- Reduces visual clutter in single-column settings modal
- Familiar pattern (most apps use sectioned settings)
- Easy to scan and find specific settings

**Alternatives Considered**:

- Flat list: Gets overwhelming as features grow (already 5+ settings)
- Tabs: Overkill for 2 categories, adds navigation complexity
- Separate pages: Violates "quick access" from spec (10 second target)

**Implementation Notes**:

- Use existing Modal component from `app/components/ui/Modal.tsx`
- Section headers: `<h3 className="text-sm font-semibold mb-2">General</h3>`
- Divider between sections: `<hr className="my-4 border-[rgb(var(--color-border))]" />`
- Each setting row: label + Toggle or Select component

---

### 4. Real-time Count Update Strategy

**Decision**: Use Zustand's computed selectors with useMemo hooks

**Rationale**:

- Zustand already manages tasks state
- useMemo prevents unnecessary recalculations on unrelated state changes
- React automatically re-renders when task array reference changes
- Meets <100ms performance requirement (typically <10ms for array filtering)
- No additional libraries or complexity needed

**Alternatives Considered**:

- Separate count state in store: Risks stale data, synchronization bugs
- useEffect watchers: Adds complexity, potential race conditions
- Derived state in store: Works but useMemo is more idiomatic for React

**Implementation Pattern**:

```typescript
// In component
const tasks = useTodos((state) => state.tasks);
const counts = useMemo(
  () => ({
    overall: tasks.filter((t) => t.status === "active").length,
    q1: tasks.filter(
      (t) => t.status === "active" && t.isUrgent && t.isImportant
    ).length,
    q2: tasks.filter(
      (t) => t.status === "active" && !t.isUrgent && t.isImportant
    ).length,
    q3: tasks.filter(
      (t) => t.status === "active" && t.isUrgent && !t.isImportant
    ).length,
    q4: tasks.filter(
      (t) => t.status === "active" && !t.isUrgent && !t.isImportant
    ).length,
  }),
  [tasks]
);
```

---

### 5. Focus Mode Count Behavior

**Decision**: Conditionally render only Q1 count when `isFocus === true`

**Rationale**:

- Simple boolean check: `{isFocus ? q1Count : overallCount}`
- Maintains focus mode's minimalist philosophy
- No animation needed (instant switch respects reduced motion)
- User expectation: focus mode hides non-Q1 information

**Alternatives Considered**:

- Animate transition: Adds complexity, violates reduced motion constraint
- Show all counts dimmed: Defeats purpose of focus mode
- Hide all counts: User loses awareness of Q1 workload

**Implementation**:

```tsx
// In OverallTaskCount component
const isFocus = useTodos((state) => state.isFocus);
const displayCount = isFocus ? counts.q1 : counts.overall;
const label = isFocus ? "Q1" : "Total";
```

---

### 6. Zero Count Display Strategy

**Decision**: Always show count UI when enabled, display "0" for empty states

**Rationale**:

- Consistent UI: element doesn't appear/disappear unexpectedly
- User feedback: confirms the feature is working (not broken)
- Aligns with spec requirement FR-008
- Prevents layout shift when counts change from 0 to 1

**Alternatives Considered**:

- Hide on zero: Causes confusing layout shifts, users may think feature is off
- Show placeholder text: Takes more space, less clean

**Visual Treatment**:

- Use same styling for 0 as other numbers
- Optional: lighter text color for zero (e.g., `text-[rgb(var(--color-text-muted))]`)

---

## Technology Decisions

### Component Architecture

**Decision**: Create two specialized components + one reusable badge component

**Components**:

1. `TaskCountBadge.tsx`: Reusable styled count display with icon
2. `OverallTaskCount.tsx`: Consumes badge, handles overall/focus logic
3. Inline in `Quadrant.tsx`: Per-quadrant counts using badge

**Rationale**:

- Follows Component Reuse principle (Constitution VI)
- Badge component enables consistent styling
- Overall count component encapsulates focus mode logic
- Per-quadrant counts are simple enough for inline use

---

### State Management Extension

**Decision**: Add two boolean flags to Zustand todos store:

- `showOverallCount: boolean` (default: false)
- `showQuadrantCounts: boolean` (default: false)

**Rationale**:

- Task counts are derived from existing tasks state
- Settings are user preferences (like theme, sound)
- Zustand persist middleware handles localStorage automatically
- Keeps all task-related state in one store

**Store Extension**:

```typescript
interface TodosState {
  // ... existing fields
  showOverallCount: boolean;
  showQuadrantCounts: boolean;
  setShowOverallCount: (enabled: boolean) => void;
  setShowQuadrantCounts: (enabled: boolean) => void;
}
```

---

### Styling Approach

**Decision**: Use Tailwind utility classes with CSS custom properties for theming

**Rationale**:

- Consistent with existing codebase (all components use Tailwind)
- CSS vars (`--color-text`, `--color-border`) support dark/light themes
- No new CSS files needed
- Meets "Calm Design" principle with subtle, non-intrusive styling

**Example Styles**:

```tsx
<div
  className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--color-surface))] 
                border border-[rgb(var(--color-border))] px-2 py-1 text-xs"
>
  <Hash size={14} className="text-[rgb(var(--color-text-muted))]" />
  <span className="font-medium text-[rgb(var(--color-text))]">{count}</span>
</div>
```

---

## Best Practices Applied

### Performance

- useMemo for count calculations (prevents recalc on every render)
- Minimal component re-renders (only when tasks or preferences change)
- No expensive operations (simple array filters)

### Accessibility

- Semantic HTML: use `<span>` with proper text for screen readers
- ARIA labels: `aria-label="Total task count: 5"`
- Color contrast: ensure count text meets WCAG AA
- Keyboard navigation: all toggles accessible via Tab/Enter

### Maintainability

- Single source of truth (Zustand store)
- Reusable badge component
- Co-located concerns (count logic with display)
- TypeScript for type safety

### Testing Strategy

- Manual testing: toggle each setting, verify counts appear/disappear
- Focus mode: verify Q1 count replaces overall count
- Edge cases: 0 counts, adding/removing tasks, quadrant moves
- Responsive: test 320px mobile to 2560px desktop

---

## Open Questions & Decisions

**Q: Should counts animate when they change (e.g., 5 → 6)?**  
A: No. Per Constitution II (Delight in Motion) and reduced motion support, avoid animations that could be distracting. Instant updates respect reduced motion preference and meet <100ms performance goal.

**Q: Should we show completed task counts?**  
A: No. Per spec FR-009, counts include only active (non-completed) tasks. Completed tasks are in a separate view.

**Q: Mobile breakpoint behavior?**  
A: Counts use compact styling (small badge) that works down to 320px. If horizontal space insufficient on mobile, overall count can wrap below Focus controls row with `flex-wrap`.

---

## Summary

All technical decisions resolved. No NEEDS CLARIFICATION items remain. Ready for Phase 1 (data model and contracts).
