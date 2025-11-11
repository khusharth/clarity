# Research: Minimal Companion Character

**Feature**: 005-companion  
**Date**: 2025-11-11  
**Purpose**: Research technical approaches for implementing a minimal, animated companion character

## Research Questions

### 1. Visual Design Approach for Minimal Companion

**Question**: What visual representation best fits a "minimal, calm" companion in a productivity app?

**Decision**: Abstract geometric shape with SVG + CSS gradients/filters

**Rationale**:

- **SVG scalability**: Perfect for responsive design, no pixelation at any size
- **CSS filters for glow**: Hardware-accelerated, performant glow effects using `filter: drop-shadow()` and `blur()`
- **Minimal file size**: Single inline SVG element, no image assets needed
- **Theme integration**: CSS variables for colors ensure automatic dark/light theme support
- **Animation-friendly**: SVG attributes and CSS transforms work seamlessly with Framer Motion

**Alternatives Considered**:

- **Lottie animations**: Too complex, larger bundle size, harder to integrate with theme system
- **Canvas-based**: More complex, less accessible, doesn't benefit from CSS cascade
- **Image sprites**: Not scalable, requires asset management, theme integration difficult
- **CSS-only shapes**: Limited expressiveness for subtle animations and glow effects

**Implementation Notes**:

- Use simple SVG paths (circle, rounded polygon, or abstract blob)
- Apply `filter: drop-shadow()` for outer glow
- Use CSS `backdrop-filter` for inner glow/shimmer if needed
- Keep shape semantic: `<svg role="img" aria-label="Companion character">`

---

### 2. Animation State Machine Architecture

**Question**: How to manage multiple companion states (idle, motivated, celebrating, tired, 3 interactive reactions) with smooth transitions?

**Decision**: Zustand store + Framer Motion animation variants with state machine pattern

**Rationale**:

- **Zustand for state**: Already used in app, lightweight, perfect for global companion state
- **Framer Motion variants**: Declarative animation definitions, automatic interpolation between states
- **State machine pattern**: Explicit state transitions prevent invalid states (e.g., can't be "tired" and "celebrating" simultaneously)
- **Animation queuing**: Framer Motion's `onAnimationComplete` callback enables sequential animations

**Alternatives Considered**:

- **XState**: Too heavyweight for simple 7-state machine, adds bundle size
- **React useState only**: Harder to coordinate with animations, no global state
- **Custom animation engine**: Reinventing the wheel, Framer Motion is already in dependencies
- **CSS animation classes**: Less control over dynamic transitions, harder to queue

**Implementation Pattern**:

```typescript
// Zustand store
interface CompanionState {
  state:
    | "idle"
    | "motivated"
    | "celebrating"
    | "tired"
    | "happy"
    | "curious"
    | "playful";
  enabled: boolean;
  lastTaskCompletionTime: number | null;
  transitionTo: (newState: CompanionState["state"]) => void;
}

// Framer Motion variants
const companionVariants = {
  idle: { y: 0, scale: 1, opacity: 0.8, filter: "drop-shadow(0 0 8px ...)" },
  motivated: {
    y: -5,
    scale: 1.1,
    opacity: 1,
    filter: "drop-shadow(0 0 12px ...)",
  },
  celebrating: { y: [-10, 0], scale: [1.2, 1], rotate: [0, 5, -5, 0] },
  // ... other states
};
```

---

### 3. Inactivity Detection Mechanism (2-hour threshold)

**Question**: How to detect 2 hours of no task completions for "tired" state transition?

**Decision**: Timestamp tracking in Zustand store + useEffect timer with visibility API

**Rationale**:

- **Timestamp on task completion**: Update `lastTaskCompletionTime` in companion store whenever todo store completes task
- **useEffect polling**: Check elapsed time every 60 seconds (low overhead)
- **Page Visibility API**: Pause timer when tab is hidden, resume on visibility to save resources
- **No background workers**: Keep it simple, timer is sufficient for 2-hour threshold

**Alternatives Considered**:

- **Web Workers**: Overkill for simple timer, adds complexity
- **setInterval in store**: Harder to cleanup, less React-idiomatic
- **Idle detection APIs**: `requestIdleCallback` detects browser idle, not task completion idle
- **Server-side tracking**: Violates local-first principle

**Implementation Pattern**:

```typescript
useEffect(() => {
  if (!companionEnabled) return;

  const checkInactivity = () => {
    const timeSinceLastTask =
      Date.now() - (lastTaskCompletionTime || Date.now());
    const twoHours = 2 * 60 * 60 * 1000;

    if (timeSinceLastTask >= twoHours && state !== "tired") {
      transitionTo("tired");
    }
  };

  const intervalId = setInterval(checkInactivity, 60000); // Check every minute

  return () => clearInterval(intervalId);
}, [lastTaskCompletionTime, state, companionEnabled]);
```

---

### 4. Click/Tap Interaction Handling with Animation Conflicts

**Question**: How to handle clicks during existing animations without creating jarring interruptions?

**Decision**: Animation priority queue with cooldown period (~500ms)

**Rationale**:

- **Priority system**: Automatic reactions (task completion, celebration) take precedence over user clicks
- **Cooldown prevents spam**: 500ms cooldown after each interaction prevents rapid-click animation stacking
- **Queue vs ignore**: Ignore clicks during high-priority animations, queue during low-priority (idle)
- **Framer Motion's `onAnimationComplete`**: Perfect for chaining animations after cooldown

**Alternatives Considered**:

- **Interrupt all animations**: Feels jarring, breaks flow of automatic reactions
- **No cooldown**: Users can spam clicks, creates visual noise
- **Long cooldown (2s+)**: Feels unresponsive, frustrating for users
- **Complex queue system**: Overengineered for 2-3 reaction types

**Implementation Pattern**:

```typescript
const [lastClickTime, setLastClickTime] = useState(0);
const [isAnimating, setIsAnimating] = useState(false);

const handleClick = () => {
  const now = Date.now();
  const cooldownPeriod = 500;

  // Ignore if cooling down or high-priority animation playing
  if (
    now - lastClickTime < cooldownPeriod ||
    ["motivated", "celebrating"].includes(state)
  ) {
    return;
  }

  setLastClickTime(now);
  const reactions = ["happy", "curious", "playful"];
  const randomReaction =
    reactions[Math.floor(Math.random() * reactions.length)];
  transitionTo(randomReaction);
};
```

---

### 5. Reduced Motion Accessibility

**Question**: How to respect `prefers-reduced-motion` while maintaining companion presence?

**Decision**: Simplified static states with minimal fade transitions

**Rationale**:

- **Detect system preference**: Use CSS media query or `useReducedMotion` hook
- **Simplified animations**: Remove bounces, scales, rotations; keep only fade and subtle position changes
- **State indicators remain**: Companion still changes appearance (color, opacity) but without motion
- **Framer Motion support**: Built-in `useReducedMotion()` hook, automatically simplifies animations

**Alternatives Considered**:

- **Hide companion entirely**: Removes feature value for reduced-motion users
- **Static image only**: Companion loses all feedback capability
- **User toggle separate from system**: Redundant, system preference should be respected
- **No changes**: Violates accessibility guidelines and constitution

**Implementation Pattern**:

```typescript
import { useReducedMotion } from "framer-motion";

const reducedMotion = useReducedMotion();

const companionVariants = {
  idle: reducedMotion
    ? { opacity: 0.8 }
    : {
        y: [0, -2, 0],
        opacity: 0.8,
        transition: { repeat: Infinity, duration: 3 },
      },
  motivated: reducedMotion ? { opacity: 1 } : { y: -5, scale: 1.1, opacity: 1 },
  // ... simplified variants for reduced motion
};
```

---

### 6. Positioning Strategy for Responsive Design

**Question**: How to position companion "near logo" on desktop but adapt for mobile/tablet?

**Decision**: CSS `position: fixed` with responsive breakpoints using Tailwind classes

**Rationale**:

- **Fixed positioning**: Companion stays in corner during scroll, never scrolls out of view
- **Tailwind breakpoints**: `sm:`, `md:`, `lg:` for adaptive positioning
- **z-index layering**: Above content but below modals (`z-50` range)
- **Pointer-events management**: `pointer-events-none` on container, `pointer-events-auto` on clickable element

**Alternatives Considered**:

- **Absolute positioning**: Scrolls with content, not persistent
- **Sticky positioning**: Complex with App Router layout, less predictable
- **Canvas overlay**: Accessibility nightmare, non-standard interaction
- **Portal to document.body**: Unnecessary complexity for fixed positioning

**Implementation Pattern**:

```tsx
<div className="fixed top-4 right-4 sm:top-6 sm:right-6 md:top-4 md:left-24 z-50 pointer-events-none">
  <motion.div
    className="pointer-events-auto cursor-pointer"
    onClick={handleClick}
    variants={companionVariants}
    animate={state}
  >
    {/* SVG companion */}
  </motion.div>
</div>
```

---

### 7. Integration with Existing Zustand Todos Store

**Question**: How should todo completion trigger companion reactions without tight coupling?

**Decision**: Event-driven approach using Zustand's subscribe mechanism

**Rationale**:

- **Separation of concerns**: Todo store doesn't know about companion, companion observes todos
- **Zustand's subscribe**: Built-in subscription to store changes, perfect for reactive companion
- **Selective subscription**: Only listen to `tasks` array length and status changes
- **Performance**: Subscribe callback only fires when specified selectors change

**Alternatives Considered**:

- **Direct import**: Creates circular dependency, violates clean architecture
- **Prop drilling**: Would require passing callbacks through many components
- **Event emitter pattern**: Adds dependency, Zustand subscribe is sufficient
- **React Context**: Already using Zustand, Context adds no value here

**Implementation Pattern**:

```typescript
// In useCompanion hook
useEffect(() => {
  const unsubscribe = useTodos.subscribe(
    (state) => state.tasks,
    (tasks, prevTasks) => {
      // Check if a task was just completed
      const justCompleted = tasks.some((t, i) =>
        t.completed && prevTasks[i] && !prevTasks[i].completed
      );

      if (justCompleted) {
        updateLastTaskTime();

        // Check if quadrant is now empty
        const quadrant = tasks.filter(t => /* same quadrant */ );
        const quadrantCleared = quadrant.every(t => t.completed);

        transitionTo(quadrantCleared ? 'celebrating' : 'motivated');
      }
    }
  );

  return unsubscribe;
}, []);
```

---

## Technology Stack Summary

**Core Technologies** (already in project):

- **React 19.2.0**: Functional components with hooks
- **Next.js 16.0.1**: App Router for layout integration
- **TypeScript 5**: Type-safe state machine and interfaces
- **Framer Motion 12.0.0**: Animation variants and spring physics
- **Zustand 4.5.5**: Global companion state management
- **Tailwind CSS 4**: Responsive positioning and theme integration
- **Lucide React 0.468.0**: Icons for settings toggle (if needed)

**No New Dependencies Required**: All needs met by existing stack

---

## Performance Considerations

**Animation Performance**:

- Use CSS `transform` and `background-position` only (GPU-accelerated properties)
- Avoid `width`, `height`, `top`, `left` animations (cause layout reflow)
- Sprite sheets preloaded on app start to prevent flashing
- Use `will-change: transform, background-position` during active animations only
- Frame stepping via discrete CSS values (not interpolation) for crisp pixels

**Bundle Impact**:

- Estimated addition: ~6-10KB gzipped (component + hook + store + utilities)
- Framer Motion already in bundle, no additional animation library cost
- PNG sprite sheets: ~2-4KB each (companion-light.png + companion-dark.png) with compression
- Total new assets: ~10-15KB for all code + images

**Runtime Performance**:

- Idle animation: ~0.1% CPU (CSS background-position stepping, 5 FPS)
- State checks: 1 timer per minute (negligible overhead)
- Memory: <1MB for companion state + <50KB for loaded sprite sheets
- Image caching: Browser caches PNGs after first load (no repeated downloads)

---

## Open Questions & Decisions Needed

### Visual Design Assets

**Decision**: Custom pixel-art dog sprite sheets (32x32 sprites) - provided by user

**Assets Provided**:

- `companion-light.png`: Dog sprites for light mode (in `/public/` directory)
- `companion-dark.png`: Dog sprites for dark mode (in `/public/` directory)
- Each row represents a state with 3 animation frames (32x32px each)

**Sprite Layout** (reading left-to-right, each row has label + 3 frames):

1. **IDLE FRONT**: Front-facing idle animation (3 frames)
2. **IDLE SIDE**: Side-view idle animation (3 frames)
3. **IDLE BACK**: Back-facing idle animation (3 frames)
4. **IDLE DIA UP**: Diagonal up idle animation (3 frames)
5. **IDLE DIA DOWN**: Diagonal down idle animation (3 frames)
6. **RUN DIA UP**: Diagonal up running animation (3 frames)
7. **RUN DIA DOWN**: Diagonal down running animation (3 frames)
8. **WAKE UP**: Wake up animation (3 frames)
9. **SLEEP**: Sleeping animation (3 frames)
10. **WUFF**: Barking/excited animation (3 frames)

**State Mapping to Spec Requirements**:

- **Idle state** → Cycle between IDLE FRONT, IDLE SIDE, IDLE BACK variants for organic movement
- **Motivated state** (task completion) → WUFF animation (excited/barking)
- **Celebrating state** (quadrant clear) → RUN DIA UP + WUFF combination
- **Tired state** → SLEEP animation with slower frame rate
- **Wake up transition** → WAKE UP animation when returning from tired state
- **Interactive reaction 1** (happy) → WUFF + bounce transform
- **Interactive reaction 2** (curious) → IDLE DIA UP with subtle rotation
- **Interactive reaction 3** (playful) → RUN DIA DOWN quick loop

**Implementation Approach**:

```typescript
// Sprite sheet configuration
const SPRITE_SIZE = 32; // Each sprite is 32x32px
const SPRITE_SCALE = 2; // Scale up to 64x64 for visibility

const spriteMap = {
  idleFront: { row: 0, frames: 3, startX: 32 }, // Skip label, start at frame 1
  idleSide: { row: 1, frames: 3, startX: 32 },
  idleBack: { row: 2, frames: 3, startX: 32 },
  idleDiaUp: { row: 3, frames: 3, startX: 32 },
  idleDiaDown: { row: 4, frames: 3, startX: 32 },
  runDiaUp: { row: 5, frames: 3, startX: 32 },
  runDiaDown: { row: 6, frames: 3, startX: 32 },
  wakeUp: { row: 7, frames: 3, startX: 32 },
  sleep: { row: 8, frames: 3, startX: 32 },
  wuff: { row: 9, frames: 3, startX: 32 },
};

// CSS background-position calculation
// x = -(startX + (frameIndex * SPRITE_SIZE))
// y = -(row * SPRITE_SIZE)
```

**Animation Technique**:

- Use `<div>` with `background-image` set to sprite sheet
- CSS `background-position` to select sprite (skip label column)
- Animate frames using Framer Motion's `animate` prop with custom `backgroundPosition`
- Theme switching: conditionally load `dog-light.png` or `dog-dark.png`
- Frame rate: ~200ms per frame for smooth animation (5 FPS feels natural for pixel art)

**Rationale**:

- Pixel art maintains minimal aesthetic while adding character personality
- Pre-rendered frames ensure consistent quality across devices
- Theme-specific sprites maintain perfect visibility in both modes
- 32x32 base size scaled to 64x64 is non-intrusive yet clear
- Multiple idle variants (front, side, back) create organic, non-repetitive behavior
- Directional animations (dia up/down) can show movement/emotion

---

## Summary of Resolved Technical Decisions

| Aspect                | Decision                           | Key Benefit                                  |
| --------------------- | ---------------------------------- | -------------------------------------------- |
| Visual representation | Pixel-art dog sprite sheets        | Characterful, theme-aware, minimal aesthetic |
| Animation engine      | Framer Motion + CSS sprites        | Already in stack, declarative, smooth        |
| State management      | Zustand store + state machine      | Global state, predictable transitions        |
| Inactivity detection  | Timestamp + 60s polling            | Simple, reliable, low overhead               |
| Click handling        | Priority queue + 500ms cooldown    | Prevents spam, respects auto-reactions       |
| Reduced motion        | Static sprite or simplified frames | Accessible, respects user preferences        |
| Positioning           | Fixed with Tailwind breakpoints    | Responsive, always visible                   |
| Todo integration      | Zustand subscribe pattern          | Decoupled, reactive, clean architecture      |
| Sprite animation      | CSS background-position stepping   | GPU-accelerated, no canvas overhead          |

All technical unknowns have been resolved. Ready to proceed to Phase 1 (Data Model & Contracts).
