# Quickstart: Minimal Companion Character

**Feature**: 005-companion  
**Date**: 2025-11-11  
**For**: Developers implementing the companion feature

## Prerequisites

- Familiarity with React 19 hooks and Next.js 16 App Router
- Understanding of Zustand state management (already used in project)
- Basic knowledge of Framer Motion animations (already in dependencies)
- Dog sprite sheets added to `/public/` directory:
  - `dog-light.png` (for light mode)
  - `dog-dark.png` (for dark mode)

## Quick Implementation Steps

### 1. Create Sprite Animation Utilities (15 min)

**File**: `app/lib/companion-animations.ts`

```typescript
export const SPRITE_SIZE = 32;
export const SPRITE_SCALE = 2;

export type AnimationType =
  | "idleFront"
  | "idleSide"
  | "idleBack"
  | "idleDiaUp"
  | "idleDiaDown"
  | "runDiaUp"
  | "runDiaDown"
  | "wakeUp"
  | "sleep"
  | "wuff";

export type CompanionStateType =
  | "idle"
  | "motivated"
  | "celebrating"
  | "tired"
  | "happy"
  | "curious"
  | "playful";

export interface SpriteConfig {
  row: number;
  frames: number;
  startX: number;
  duration: number;
}

export const spriteMap: Record<AnimationType, SpriteConfig> = {
  idleFront: { row: 0, frames: 3, startX: 32, duration: 1200 },
  idleSide: { row: 1, frames: 3, startX: 32, duration: 1200 },
  idleBack: { row: 2, frames: 3, startX: 32, duration: 1200 },
  idleDiaUp: { row: 3, frames: 3, startX: 32, duration: 1200 },
  idleDiaDown: { row: 4, frames: 3, startX: 32, duration: 1200 },
  runDiaUp: { row: 5, frames: 3, startX: 32, duration: 600 },
  runDiaDown: { row: 6, frames: 3, startX: 32, duration: 600 },
  wakeUp: { row: 7, frames: 3, startX: 32, duration: 900 },
  sleep: { row: 8, frames: 3, startX: 32, duration: 2400 },
  wuff: { row: 9, frames: 3, startX: 32, duration: 600 },
};

export const stateAnimationMap: Record<CompanionStateType, AnimationType[]> = {
  idle: ["idleFront", "idleSide", "idleBack"],
  motivated: ["wuff"],
  celebrating: ["runDiaUp", "wuff"],
  tired: ["sleep"],
  happy: ["wuff"],
  curious: ["idleDiaUp"],
  playful: ["runDiaDown"],
};

export function getSpritePosition(animation: AnimationType, frame: number) {
  const config = spriteMap[animation];
  return {
    x: -(config.startX + frame * SPRITE_SIZE),
    y: -(config.row * SPRITE_SIZE),
  };
}
```

---

### 2. Create Zustand Store (20 min)

**File**: `app/store/companion.ts`

```typescript
import { create } from "zustand";
import {
  AnimationType,
  CompanionStateType,
  spriteMap,
  stateAnimationMap,
} from "../lib/companion-animations";

interface CompanionStore {
  state: CompanionStateType;
  enabled: boolean;
  lastTaskCompletionTime: number | null;
  currentAnimation: AnimationType | null;
  currentFrameIndex: number;
  isAnimating: boolean;
  lastClickTime: number;
  clickCount: number;
  theme: "light" | "dark";

  transitionTo: (newState: CompanionStateType) => void;
  setCurrentAnimation: (animation: AnimationType | null) => void;
  setFrameIndex: (index: number) => void;
  handleClick: () => void;
  setEnabled: (enabled: boolean) => void;
  syncTheme: (theme: "light" | "dark") => void;
  updateLastTaskTime: () => void;
  checkInactivity: () => void;
}

export const useCompanionStore = create<CompanionStore>((set, get) => ({
  state: "idle",
  enabled: true,
  lastTaskCompletionTime: Date.now(),
  currentAnimation: null,
  currentFrameIndex: 0,
  isAnimating: false,
  lastClickTime: 0,
  clickCount: 0,
  theme: "light",

  transitionTo: (newState) => {
    set({ state: newState });
  },

  setCurrentAnimation: (animation) => {
    set({ currentAnimation: animation, isAnimating: !!animation });
  },

  setFrameIndex: (index) => {
    set({ currentFrameIndex: index });
  },

  handleClick: () => {
    const now = Date.now();
    const { lastClickTime, clickCount, state, isAnimating } = get();

    if (now - lastClickTime < 500) return;
    if (["motivated", "celebrating"].includes(state) && isAnimating) return;

    const reactions: CompanionStateType[] = ["happy", "curious", "playful"];
    const nextReaction = reactions[clickCount % reactions.length];

    set({ lastClickTime: now, clickCount: clickCount + 1 });
    get().transitionTo(nextReaction);
  },

  setEnabled: (enabled) => set({ enabled }),
  syncTheme: (theme) => set({ theme }),
  updateLastTaskTime: () => set({ lastTaskCompletionTime: Date.now() }),

  checkInactivity: () => {
    const { lastTaskCompletionTime, state } = get();
    if (!lastTaskCompletionTime) return;

    const elapsed = Date.now() - lastTaskCompletionTime;
    const twoHours = 2 * 60 * 60 * 1000;

    if (elapsed >= twoHours && state !== "tired") {
      get().transitionTo("tired");
    }
  },
}));
```

---

### 3. Create Companion Hook (25 min)

**File**: `app/hooks/useCompanion.ts`

```typescript
import { useEffect, useMemo } from "react";
import { useCompanionStore } from "../store/companion";
import { useTodos } from "../store/todos";
import {
  getSpritePosition,
  stateAnimationMap,
  spriteMap,
} from "../lib/companion-animations";

export function useCompanion() {
  const store = useCompanionStore();

  // Subscribe to task completions
  useEffect(() => {
    const unsubscribe = useTodos.subscribe(
      (state) => state.tasks,
      (tasks, prevTasks) => {
        const newCompletions =
          tasks.filter((t) => t.completed).length -
          prevTasks.filter((t) => t.completed).length;

        if (newCompletions > 0 && store.enabled) {
          store.updateLastTaskTime();

          const lastCompleted = tasks.filter((t) => t.completed).pop();
          if (lastCompleted) {
            const quadrantTasks = tasks.filter(
              (t) =>
                t.important === lastCompleted.important &&
                t.urgent === lastCompleted.urgent
            );
            const quadrantCleared = quadrantTasks.every((t) => t.completed);

            store.transitionTo(quadrantCleared ? "celebrating" : "motivated");
          }
        }
      }
    );

    return unsubscribe;
  }, [store.enabled]);

  // Check inactivity every minute
  useEffect(() => {
    if (!store.enabled) return;

    const interval = setInterval(() => {
      store.checkInactivity();
    }, 60000);

    return () => clearInterval(interval);
  }, [store.enabled]);

  // Sync theme
  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      store.syncTheme(isDark ? "dark" : "light");
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Calculate current sprite position
  const spritePosition = useMemo(() => {
    if (!store.currentAnimation) return { x: 0, y: 0 };
    return getSpritePosition(store.currentAnimation, store.currentFrameIndex);
  }, [store.currentAnimation, store.currentFrameIndex]);

  return {
    ...store,
    spritePosition,
  };
}
```

---

### 4. Create Companion Component (30 min)

**File**: `app/components/Companion.tsx`

```typescript
"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useCompanion } from "../hooks/useCompanion";
import {
  stateAnimationMap,
  spriteMap,
  SPRITE_SIZE,
  SPRITE_SCALE,
} from "../lib/companion-animations";

export default function Companion() {
  const {
    enabled,
    state,
    theme,
    currentAnimation,
    spritePosition,
    handleClick,
    setCurrentAnimation,
    setFrameIndex,
  } = useCompanion();

  const reducedMotion = useReducedMotion();

  // Play animations for current state
  useEffect(() => {
    if (!enabled || reducedMotion) return;

    const animations = stateAnimationMap[state];
    let currentAnimIndex = 0;
    let frameIndex = 0;

    const playNextAnimation = () => {
      if (currentAnimIndex >= animations.length) {
        // Return to idle or repeat
        if (state === "idle" || state === "tired") {
          currentAnimIndex = 0;
        } else {
          setCurrentAnimation(null);
          return;
        }
      }

      const animation = animations[currentAnimIndex];
      setCurrentAnimation(animation);

      const config = spriteMap[animation];
      const frameDelay = config.duration / config.frames;
      frameIndex = 0;

      const frameInterval = setInterval(() => {
        frameIndex++;
        if (frameIndex >= config.frames) {
          clearInterval(frameInterval);
          currentAnimIndex++;
          setTimeout(playNextAnimation, 100); // Brief pause between animations
        } else {
          setFrameIndex(frameIndex);
        }
      }, frameDelay);
    };

    playNextAnimation();
  }, [state, enabled, reducedMotion]);

  if (!enabled) return null;

  return (
    <motion.div
      className="fixed top-4 right-4 md:top-6 md:left-24 z-50 pointer-events-none"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="pointer-events-auto cursor-pointer"
        onClick={handleClick}
        whileHover={!reducedMotion ? { scale: 1.1 } : {}}
        whileTap={!reducedMotion ? { scale: 0.95 } : {}}
        role="img"
        aria-label="Companion character"
        style={{
          width: SPRITE_SIZE * SPRITE_SCALE,
          height: SPRITE_SIZE * SPRITE_SCALE,
          backgroundImage: `url(/dog-${theme}.png)`,
          backgroundPosition: `${spritePosition.x * SPRITE_SCALE}px ${
            spritePosition.y * SPRITE_SCALE
          }px`,
          backgroundSize: `${128 * SPRITE_SCALE}px ${320 * SPRITE_SCALE}px`,
          imageRendering: "pixelated",
        }}
      />
    </motion.div>
  );
}
```

---

### 5. Add to Layout (5 min)

**File**: `app/layout.tsx`

```tsx
import Companion from "./components/Companion";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider />
        <Header />
        <main>{children}</main>
        <Footer />
        <Toasts />
        <Companion /> {/* Add this line */}
      </body>
    </html>
  );
}
```

---

### 6. Add Settings Toggle (10 min)

**File**: `app/components/Settings.tsx`

```tsx
import { useCompanionStore } from "../store/companion";

export default function Settings() {
  const { enabled, setEnabled } = useCompanionStore();

  return (
    <Modal>
      {/* ... existing settings ... */}

      {/* Add companion toggle */}
      <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-3 items-center text-sm">
        <span>Show Companion</span>
        <div className="flex justify-end">
          <Toggle
            pressed={enabled}
            onPressedChange={setEnabled}
            size="sm"
            aria-label="Toggle companion visibility"
          />
        </div>
      </div>
    </Modal>
  );
}
```

---

### 7. Add Persistence (10 min)

**File**: `app/store/todos.ts` (extend existing store)

```typescript
// Add to existing TodosState interface
interface TodosState {
  // ... existing fields
  showCompanion: boolean;
  setShowCompanion: (show: boolean) => void;
}

// Add to store implementation
export const useTodos = create<TodosState>()(
  persist(
    (set, get) => ({
      // ... existing state
      showCompanion: true,

      setShowCompanion: (show: boolean) => {
        set({ showCompanion: show });
        useCompanionStore.getState().setEnabled(show);
      },
    }),
    {
      name: "clarity-todos-storage",
      // ... existing config
    }
  )
);

// Sync on app load
if (typeof window !== "undefined") {
  const { showCompanion } = useTodos.getState();
  useCompanionStore.getState().setEnabled(showCompanion);
}
```

---

## Testing the Implementation

### Manual Test Checklist

1. **Idle State**:

   - [ ] Companion appears in corner on app load
   - [ ] Cycles through idle animations (front, side, back)
   - [ ] Animations feel smooth and calm

2. **Task Completion**:

   - [ ] Complete a task → companion shows "wuff" animation
   - [ ] Companion returns to idle after reaction

3. **Quadrant Clear**:

   - [ ] Complete all tasks in a quadrant → see celebration (run + wuff)
   - [ ] Companion returns to idle after celebration

4. **Click Interactions**:

   - [ ] Click companion → see happy reaction
   - [ ] Click again → see curious reaction
   - [ ] Click again → see playful reaction
   - [ ] Rapid clicks are throttled (500ms cooldown)

5. **Tired State**:

   - [ ] Wait 2 hours (or modify timer for testing) → companion shows sleep animation
   - [ ] Complete a task → companion wakes up

6. **Settings**:

   - [ ] Toggle off in settings → companion disappears
   - [ ] Toggle on → companion reappears
   - [ ] Preference persists across page reloads

7. **Theme**:

   - [ ] Switch to dark mode → companion uses dark sprite sheet
   - [ ] Switch to light mode → companion uses light sprite sheet

8. **Responsive**:

   - [ ] Check positioning on mobile, tablet, desktop
   - [ ] Companion never blocks UI elements

9. **Reduced Motion**:
   - [ ] Enable reduced motion in OS → animations simplify or stop
   - [ ] Companion still visible and clickable

---

## Common Issues & Solutions

### Companion not appearing

- Check sprite sheets are in `/public/` directory
- Verify `enabled` state in store
- Check console for errors

### Animations not smooth

- Ensure `imageRendering: 'pixelated'` is set
- Verify frame delay calculations
- Check performance with React DevTools

### Theme not switching

- Verify MutationObserver is working
- Check `document.documentElement.classList` contains 'dark'
- Console log theme state

### Clicks not responding

- Check cooldown logic (500ms)
- Verify `pointer-events-auto` on clickable div
- Test without high-priority animations running

---

## Performance Tips

1. **Preload Sprites**: Add to app initialization:

```typescript
if (typeof window !== "undefined") {
  const preload = () => {
    new Image().src = "/dog-light.png";
    new Image().src = "/dog-dark.png";
  };
  requestIdleCallback(preload);
}
```

2. **Optimize Re-renders**: Use `useMemo` for sprite position calculations

3. **Cleanup Timers**: Ensure all intervals/timeouts are cleared in cleanup functions

---

## Next Steps

After basic implementation:

1. Add sound effects (optional, respecting existing sound settings)
2. Implement wake-up animation transition from tired state
3. Add special "all quadrants cleared" celebration
4. Fine-tune animation timings based on user feedback
5. Add analytics/metrics for companion interactions

---

## Estimated Time: ~2 hours

- Setup utilities & store: 35 min
- Build component & hook: 55 min
- Integration & testing: 30 min

Ready to implement! Follow steps sequentially for best results.
