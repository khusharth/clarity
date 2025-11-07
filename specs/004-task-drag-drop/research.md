# Research: Task Drag and Drop

**Feature**: 004-task-drag-drop  
**Date**: 2025-11-07  
**Phase**: 0 - Research & Technology Decisions

## Drag-and-Drop Library Selection

### Decision: Use Framer Motion's Built-in Drag Capabilities

**Rationale**:

- Framer Motion 12.x is already a project dependency per the constitution
- Provides `drag` prop and `dragConstraints` for gesture handling
- Integrates seamlessly with existing animation system
- Supports both mouse and touch events out-of-the-box
- Offers `onDragStart`, `onDrag`, `onDragEnd` lifecycle hooks for custom logic
- Lightweight compared to dedicated DnD libraries (dnd-kit, react-beautiful-dnd)
- No additional bundle size impact

**Alternatives Considered**:

1. **@dnd-kit/core** - More feature-rich but adds ~50KB; overkill for our use case
2. **react-beautiful-dnd** - Excellent for lists but doesn't support Framer Motion animations; would require migration away from existing motion patterns
3. **Native HTML Drag and Drop API** - Poor mobile support; inconsistent browser behavior; doesn't integrate with Framer Motion
4. **react-dnd** - Heavyweight (~100KB); Redux-style architecture conflicts with Zustand

**Implementation Notes**:

- Use `motion.div` with `drag` prop on `TodoCard`
- Implement custom drop zone detection via pointer position and bounding rects
- Handle drag constraints to prevent dragging outside the Matrix component

---

## Task Ordering Strategy

### Decision: Add `sortOrder` Field with Fractional Indexing

**Rationale**:

- User requirement: "drag and drop priority should be able to override [created date] and same should persist"
- Fractional indexing allows inserting tasks between any two positions without reindexing entire list
- Simple algorithm: new position = (prevOrder + nextOrder) / 2
- Fallback to `createdAt` for tasks created before this feature (backwards compatible)
- Minimal database schema change (single nullable field)

**Alternatives Considered**:

1. **Integer sortOrder with gap-based indexing** (e.g., 10, 20, 30) - Requires occasional reindexing when gaps fill up; more complex maintenance
2. **Linked list structure** (prev/next pointers) - Requires multiple updates per reorder; harder to query sorted list
3. **Timestamp-based ordering with microseconds** - Prone to collisions on fast operations; not intuitive
4. **Array of task IDs per quadrant** - Duplicates data; requires full array rewrite on every change; doesn't scale

**Implementation Notes**:

- Add `sortOrder: number | null` to Task schema
- Default sorting: `sortOrder ASC NULLS LAST, createdAt ASC`
- Calculate sortOrder on drop: average of surrounding tasks
- Edge cases: first position (use 0.5), last position (use maxOrder + 1)

---

## Sound Effect Design

### Decision: Add Two New Drag-Specific Sounds

**Rationale**:

- User requirement: "Picking and dropping should give proper sound feedback"
- Existing sound infrastructure (`useSfx` hook, `use-sound` library) supports this pattern
- Constitution principle V (Fun Focus): audio feedback enhances micro-moments of joy
- Distinct sounds for pickup and drop actions improve user understanding of system state

**New Sound Files** (to be added to `/public/sounds/`):

1. **drag-start.mp3** - Plays on drag initiation (300ms threshold met)
   - Short, ascending tone (100ms)
   - Indicates task is "picked up"
2. **drag-drop.mp3** - Plays on successful drop
   - Satisfying "thunk" or "click" (120ms)
   - Confirms task placement and persisted change

**Alternatives Considered**:

1. **Single generic drop sound** - Less informative; doesn't distinguish pickup from drop
2. **Reuse existing sounds (e.g., toggle.mp3)** - Confuses user; same sound for different actions reduces clarity
3. **Haptic-only feedback** - Not available on desktop; audio is more universal

**Implementation Notes**:

- Extend `useSfx` hook with: `dragStart()`, `dragDrop()`
- Sound playback respects `soundEnabled` preference
- Fallback to beep() if MP3 fails to load (like existing sounds)
- Volume levels: 0.3-0.35 (consistent with existing SFX)

---

## Drop Zone Detection Algorithm

### Decision: Bounding Box Intersection with Pointer Coordinates

**Rationale**:

- Framer Motion doesn't provide built-in drop zone detection
- Simple and performant: calculate overlap on every `onDrag` event
- Works across desktop and mobile (pointer events are normalized)
- Allows visual feedback (highlighting) during drag

**Algorithm**:

```typescript
function detectDropZone(
  pointerX: number,
  pointerY: number,
  quadrants: QuadrantRef[]
) {
  for (const quadrant of quadrants) {
    const rect = quadrant.getBoundingClientRect();
    if (
      pointerX >= rect.left &&
      pointerX <= rect.right &&
      pointerY >= rect.top &&
      pointerY <= rect.bottom
    ) {
      return quadrant.id; // "Q1", "Q2", "Q3", or "Q4"
    }
  }
  return null; // Outside all quadrants (cancel drag)
}
```

**Alternatives Considered**:

1. **Drag center point vs. drop zone center** - Doesn't work for edge cases (dragging to small quadrants)
2. **Collision detection libraries** (e.g., `react-use-measure`) - Overkill; adds dependency for simple rect comparison
3. **Event delegation with `onDragEnter`/`onDragLeave`** - Native DnD events; don't work well with Framer Motion

**Implementation Notes**:

- Store quadrant refs in `useDragAndDrop` hook
- Calculate drop zone on every `onDrag` event (60fps throttling not needed; modern browsers handle this)
- Highlight target quadrant via CSS class toggle
- Cancel drag if drop zone is null on `onDragEnd`

---

## In-Quadrant Reordering: Drop Position Calculation

### Decision: Vertical Position-Based Insertion with Visual Gap Indicator

**Rationale**:

- User drags task vertically within quadrant to reorder
- Calculate drop index by comparing pointer Y-coordinate to task card Y-positions
- Show visual gap/line where task will be inserted
- More intuitive than drag-over-target patterns

**Algorithm**:

```typescript
function calculateDropIndex(pointerY: number, taskElements: HTMLElement[]) {
  for (let i = 0; i < taskElements.length; i++) {
    const rect = taskElements[i].getBoundingClientRect();
    const midY = rect.top + rect.height / 2;

    if (pointerY < midY) {
      return i; // Insert before this task
    }
  }
  return taskElements.length; // Insert at end
}
```

**Alternatives Considered**:

1. **Drag-over-target** (highlight hovered task) - Less clear where insertion will happen; ambiguous for users
2. **Fixed drop zones between tasks** - Requires rendering placeholder elements; more DOM complexity
3. **Automatic reordering while dragging** - Jarring; tasks shifting mid-drag confuses users

**Implementation Notes**:

- Render gap indicator at calculated index (horizontal line or expanded spacing)
- Auto-scroll quadrant when dragging near top/bottom edges (within 50px threshold)
- Scroll speed proportional to distance from edge

---

## Mobile Touch Gesture Handling

### Decision: Framer Motion's Touch Support with Scroll Prevention

**Rationale**:

- Framer Motion handles `touchstart`, `touchmove`, `touchend` automatically
- Need to prevent scroll during active drag to avoid gesture conflicts
- 500ms tap-and-hold threshold prevents accidental drag triggers

**Implementation**:

```typescript
// Prevent scroll during drag
useEffect(() => {
  if (isDragging) {
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
  } else {
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
  }
}, [isDragging]);
```

**Alternatives Considered**:

1. **Separate touch library** (e.g., `use-gesture`) - Redundant; Framer Motion handles touch
2. **Pointer events only** - Less control over scroll prevention; inconsistent across browsers
3. **Custom touch event handlers** - Reinventing the wheel; Framer Motion's implementation is battle-tested

**Implementation Notes**:

- Set `dragListener={false}` and manually handle `onPointerDown` for 500ms threshold on mobile
- Detect mobile via `window.matchMedia('(pointer: coarse)')`
- Restore scroll after drag ends or cancels
- Provide visual "lift" feedback after threshold (scale + shadow)

---

## Haptic Feedback Implementation

### Decision: Use Vibration API with Feature Detection

**Rationale**:

- User requirement: "haptic feedback triggers (if device supports)"
- Web Vibration API supported on most modern mobile browsers
- Graceful degradation: no-op if not supported
- Short vibrations (10-20ms) provide subtle tactile feedback

**Implementation**:

```typescript
function triggerHaptic(pattern: number | number[] = 10) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

// Usage:
onDragStart: () => triggerHaptic(10); // Short pulse on pickup
onDragEnd: () => triggerHaptic([10, 50, 10]); // Double pulse on drop
```

**Alternatives Considered**:

1. **No haptic feedback** - Misses opportunity for tactile confirmation; user expects it on mobile
2. **Third-party library** - Overkill for simple vibration; adds dependency
3. **Longer vibrations (50ms+)** - Too aggressive; feels "buzzy" rather than subtle

**Implementation Notes**:

- Vibrate on drag start (10ms)
- Vibrate on drop (pattern: [10, 50, 10] for "success" feel)
- No vibration on drag cancel
- Respect `soundEnabled` preference (treat haptic as part of feedback system)

---

## Reduced-Motion Accessibility

### Decision: Instant State Changes with Existing `useAppReducedMotion` Hook

**Rationale**:

- Constitution principle II: "Respect reduced‑motion preferences"
- Existing `useAppReducedMotion` hook detects `prefers-reduced-motion` media query
- Drag-and-drop still functional, just without smooth transitions
- Simpler than conditionally enabling Framer Motion animations

**Implementation**:

```typescript
const reduced = useAppReducedMotion();

<motion.div
  drag
  transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 300 }}
>
```

**Alternatives Considered**:

1. **Disable drag-and-drop entirely** - Removes functionality; violates accessibility (users need alternative method)
2. **CSS-only transitions** - Doesn't integrate with Framer Motion; requires duplicate animation logic
3. **Separate components for reduced motion** - Code duplication; hard to maintain

**Implementation Notes**:

- Set `transition={{ duration: 0 }}` when `reduced` is true
- Drop zone highlighting still works (no animation needed)
- Audio feedback still plays (separate from visual motion)
- Task repositioning happens instantly but state updates persist

---

## Summary of Technology Decisions

| Aspect          | Decision                          | Key Dependencies       |
| --------------- | --------------------------------- | ---------------------- |
| Drag Library    | Framer Motion (existing)          | framer-motion@12.x     |
| Task Ordering   | Fractional sortOrder field        | Dexie, Zustand         |
| Sound Effects   | 2 new MP3 files via useSfx hook   | use-sound@4.0.1        |
| Drop Detection  | Bounding box + pointer coords     | Native DOM APIs        |
| Mobile Touch    | Framer Motion + scroll prevention | Native touch events    |
| Haptic Feedback | Vibration API (feature detect)    | Navigator.vibrate      |
| Accessibility   | useAppReducedMotion hook          | prefers-reduced-motion |

All decisions align with constitution principles (local-first, clean code, component reuse, delight in motion) and leverage existing infrastructure to minimize complexity.
