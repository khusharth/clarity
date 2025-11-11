# API Contracts: Minimal Companion Character

**Feature**: 005-companion  
**Date**: 2025-11-11  
**Purpose**: Define internal APIs, hooks, and component interfaces for the companion feature

## Component API

### `<Companion />` Component

**Location**: `app/components/Companion.tsx`

**Props**: None (uses global Zustand store)

**Responsibilities**:

- Render companion visual (sprite sheet with CSS background-position)
- Handle click/tap interactions
- Animate state transitions using Framer Motion
- Respond to theme changes
- Respect reduced motion preferences

**Usage**:

```tsx
// In app/layout.tsx
import Companion from "./components/Companion";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}
        <Companion /> {/* Renders only if enabled */}
      </body>
    </html>
  );
}
```

**Rendering Logic**:

```tsx
export default function Companion() {
  const { enabled } = useCompanion();

  if (!enabled) return null;

  return (
    <motion.div
      className="fixed top-4 right-4 md:top-6 md:left-24 z-50"
      // ... animation and interaction logic
    />
  );
}
```

---

## Hook API

### `useCompanion()` Hook

**Location**: `app/hooks/useCompanion.ts`

**Purpose**: Main hook for accessing and controlling companion state

**Returns**:

```typescript
interface UseCompanionReturn {
  // Current state
  state: CompanionStateType;
  enabled: boolean;
  isAnimating: boolean;
  theme: "light" | "dark";

  // Current animation details
  currentAnimation: AnimationType | null;
  spritePosition: { x: number; y: number }; // Calculated background-position

  // Actions
  handleClick: () => void;
  transitionTo: (newState: CompanionStateType) => void;

  // Settings
  setEnabled: (enabled: boolean) => void;
}
```

**Usage Example**:

```tsx
function CompanionComponent() {
  const { state, enabled, currentAnimation, spritePosition, handleClick } =
    useCompanion();

  if (!enabled) return null;

  return (
    <div
      onClick={handleClick}
      style={{
        backgroundImage: `url(/dog-${theme}.png)`,
        backgroundPosition: `${spritePosition.x}px ${spritePosition.y}px`,
      }}
    />
  );
}
```

**Internal Logic**:

```typescript
export function useCompanion(): UseCompanionReturn {
  const store = useCompanionStore();
  const reducedMotion = useReducedMotion();

  // Subscribe to todo completions
  useEffect(() => {
    const unsubscribe = useTodos.subscribe(/* ... */);
    return unsubscribe;
  }, []);

  // Check inactivity every minute
  useEffect(() => {
    const interval = setInterval(() => {
      store.checkInactivity();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync theme
  useEffect(() => {
    // ... theme observer logic
  }, []);

  // Calculate sprite position from current animation
  const spritePosition = useMemo(() => {
    if (!store.currentAnimation) return { x: 0, y: 0 };

    const config = spriteMap[store.currentAnimation];
    const frameIndex = store.currentFrameIndex || 0;

    return {
      x: -(config.startX + frameIndex * SPRITE_SIZE),
      y: -(config.row * SPRITE_SIZE),
    };
  }, [store.currentAnimation, store.currentFrameIndex]);

  return {
    state: store.state,
    enabled: store.enabled,
    isAnimating: store.isAnimating,
    theme: store.theme,
    currentAnimation: store.currentAnimation,
    spritePosition,
    handleClick: store.handleClick,
    transitionTo: store.transitionTo,
    setEnabled: store.setEnabled,
  };
}
```

---

### `useCompanionAnimations()` Hook

**Location**: `app/hooks/useCompanion.ts` (internal helper)

**Purpose**: Manage sprite sheet frame stepping and animation timing

**Interface**:

```typescript
interface UseCompanionAnimationsReturn {
  currentFrameIndex: number;
  playAnimation: (animation: AnimationType) => Promise<void>;
  stopAnimation: () => void;
}
```

**Implementation Strategy**:

```typescript
function useCompanionAnimations() {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAnimation = async (animation: AnimationType) => {
    const config = spriteMap[animation];
    const frameDelay = config.duration / config.frames;

    setIsPlaying(true);

    for (let i = 0; i < config.frames; i++) {
      setCurrentFrameIndex(i);
      await new Promise((resolve) => setTimeout(resolve, frameDelay));
    }

    setIsPlaying(false);
  };

  return {
    currentFrameIndex,
    playAnimation,
    stopAnimation: () => setIsPlaying(false),
  };
}
```

---

## Store API

### `useCompanionStore` (Zustand)

**Location**: `app/store/companion.ts`

**State Interface**:

```typescript
interface CompanionStore {
  // State
  state: CompanionStateType;
  enabled: boolean;
  lastTaskCompletionTime: number | null;
  currentAnimation: AnimationType | null;
  currentFrameIndex: number;
  isAnimating: boolean;
  lastClickTime: number;
  clickCount: number;
  theme: "light" | "dark";

  // Actions
  transitionTo: (newState: CompanionStateType) => void;
  playAnimation: (animation: AnimationType) => Promise<void>;
  handleClick: () => void;
  setEnabled: (enabled: boolean) => void;
  syncTheme: (theme: "light" | "dark") => void;
  updateLastTaskTime: () => void;
  checkInactivity: () => void;
  reset: () => void;
}
```

**Store Implementation**:

```typescript
export const useCompanionStore = create<CompanionStore>((set, get) => ({
  // Initial state
  state: "idle",
  enabled: true, // Will be loaded from persistence
  lastTaskCompletionTime: Date.now(),
  currentAnimation: null,
  currentFrameIndex: 0,
  isAnimating: false,
  lastClickTime: 0,
  clickCount: 0,
  theme: "light",

  // State transitions
  transitionTo: (newState) => {
    const current = get().state;
    if (!canTransition(current, newState)) return;

    set({ state: newState });

    // Play corresponding animations
    const animations = stateAnimationMap[newState];
    animations.forEach((anim) => get().playAnimation(anim));
  },

  // Animation playback
  playAnimation: async (animation) => {
    set({ currentAnimation: animation, isAnimating: true });

    // Frame stepping handled by component/hook
    await new Promise((resolve) =>
      setTimeout(resolve, spriteMap[animation].duration)
    );

    set({ currentAnimation: null, isAnimating: false });
  },

  // Click handler
  handleClick: () => {
    const now = Date.now();
    const { lastClickTime, clickCount, state, isAnimating } = get();

    // Respect cooldown
    if (now - lastClickTime < 500) return;

    // Ignore during high-priority animations
    if (["motivated", "celebrating"].includes(state) && isAnimating) return;

    // Cycle through reactions
    const reactions: CompanionStateType[] = ["happy", "curious", "playful"];
    const nextReaction = reactions[clickCount % reactions.length];

    set({ lastClickTime: now, clickCount: clickCount + 1 });
    get().transitionTo(nextReaction);
  },

  // Settings
  setEnabled: (enabled) => {
    set({ enabled });
    // Persist via todos store or separate persistence
  },

  // Theme sync
  syncTheme: (theme) => {
    set({ theme });
  },

  // Time tracking
  updateLastTaskTime: () => {
    set({ lastTaskCompletionTime: Date.now() });
  },

  // Inactivity check
  checkInactivity: () => {
    const { lastTaskCompletionTime, state } = get();
    if (!lastTaskCompletionTime) return;

    const elapsed = Date.now() - lastTaskCompletionTime;
    const twoHours = 2 * 60 * 60 * 1000;

    if (elapsed >= twoHours && state !== "tired") {
      get().transitionTo("tired");
    }
  },

  // Reset to defaults
  reset: () => {
    set({
      state: "idle",
      lastTaskCompletionTime: Date.now(),
      currentAnimation: null,
      isAnimating: false,
      lastClickTime: 0,
      clickCount: 0,
    });
  },
}));
```

---

## Utility APIs

### Animation Utilities

**Location**: `app/lib/companion-animations.ts`

**Exports**:

```typescript
// Sprite configuration
export const SPRITE_SIZE = 32;
export const SPRITE_SCALE = 2;
export const spriteMap: Record<AnimationType, SpriteConfig>;

// State machine
export const stateTransitions: Record<CompanionStateType, CompanionStateType[]>;
export const stateAnimationMap: Record<CompanionStateType, AnimationType[]>;

// Helpers
export function canTransition(
  from: CompanionStateType,
  to: CompanionStateType
): boolean;
export function getAnimationsForState(
  state: CompanionStateType
): AnimationType[];
export function getSpritePosition(
  animation: AnimationType,
  frameIndex: number
): { x: number; y: number };
export function getIdleVariant(): AnimationType; // Randomly selects idle variant
```

**Implementation**:

```typescript
// app/lib/companion-animations.ts
export const SPRITE_SIZE = 32;
export const SPRITE_SCALE = 2;

export interface SpriteConfig {
  row: number;
  frames: number;
  startX: number;
  duration: number;
}

export const spriteMap: Record<AnimationType, SpriteConfig> = {
  // ... (from data-model.md)
};

export function canTransition(
  from: CompanionStateType,
  to: CompanionStateType
): boolean {
  return stateTransitions[from]?.includes(to) ?? false;
}

export function getSpritePosition(
  animation: AnimationType,
  frameIndex: number
) {
  const config = spriteMap[animation];
  return {
    x: -(config.startX + frameIndex * SPRITE_SIZE),
    y: -(config.row * SPRITE_SIZE),
  };
}

export function getIdleVariant(): AnimationType {
  const idleVariants: AnimationType[] = ["idleFront", "idleSide", "idleBack"];
  return idleVariants[Math.floor(Math.random() * idleVariants.length)];
}
```

---

## Settings Integration

### Update Settings Component

**Location**: `app/components/Settings.tsx` (existing file)

**Addition**:

```tsx
import { useCompanionStore } from "../store/companion";

export default function Settings() {
  const { enabled, setEnabled } = useCompanionStore();

  return (
    <Modal>
      {/* ... existing settings */}

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

## Event Subscriptions

### Todo Store Observer

**Pattern**: Zustand external subscription (not inside React component)

```typescript
// In app/hooks/useCompanion.ts
useEffect(() => {
  const unsubscribe = useTodos.subscribe(
    (state) => state.tasks,
    (tasks, prevTasks) => {
      // Detect completions
      const newCompletions =
        tasks.filter((t) => t.completed).length -
        prevTasks.filter((t) => t.completed).length;

      if (newCompletions > 0) {
        const companionStore = useCompanionStore.getState();
        companionStore.updateLastTaskTime();

        // Check quadrant clear
        const lastCompleted = tasks.filter((t) => t.completed).pop();
        if (lastCompleted) {
          const quadrantTasks = tasks.filter(
            (t) =>
              t.important === lastCompleted.important &&
              t.urgent === lastCompleted.urgent
          );
          const allDone = quadrantTasks.every((t) => t.completed);

          companionStore.transitionTo(allDone ? "celebrating" : "motivated");
        }
      }
    }
  );

  return unsubscribe;
}, []);
```

---

## Accessibility APIs

### Reduced Motion Support

```typescript
// In useCompanion hook
const reducedMotion = useReducedMotion(); // From Framer Motion

// Modify animation behavior
const shouldAnimate = !reducedMotion && enabled;

// Simplified animations for reduced motion
const motionVariants = {
  idle: reducedMotion
    ? { opacity: 0.8 }
    : {
        y: [0, -2, 0],
        opacity: 0.8,
        transition: { repeat: Infinity, duration: 3 },
      },
  // ... other simplified variants
};
```

### ARIA Labels

```tsx
<motion.div
  role="img"
  aria-label="Companion character"
  aria-live="polite"
  aria-atomic="true"
>
  {/* Companion visual */}
</motion.div>
```

---

## Type Exports

**Location**: `app/lib/companion-animations.ts` or `app/types/companion.ts`

```typescript
export type CompanionStateType =
  | "idle"
  | "motivated"
  | "celebrating"
  | "tired"
  | "happy"
  | "curious"
  | "playful";

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

export interface SpriteConfig {
  row: number;
  frames: number;
  startX: number;
  duration: number;
}

export interface CompanionState {
  state: CompanionStateType;
  enabled: boolean;
  lastTaskCompletionTime: number | null;
  currentAnimation: AnimationType | null;
  currentFrameIndex: number;
  isAnimating: boolean;
  lastClickTime: number;
  clickCount: number;
  theme: "light" | "dark";
}
```

---

## Testing Contracts

### Mock Store

```typescript
// For testing components
export const createMockCompanionStore = (
  overrides?: Partial<CompanionStore>
) => ({
  state: "idle",
  enabled: true,
  lastTaskCompletionTime: Date.now(),
  currentAnimation: null,
  currentFrameIndex: 0,
  isAnimating: false,
  lastClickTime: 0,
  clickCount: 0,
  theme: "light",
  transitionTo: vi.fn(),
  playAnimation: vi.fn(),
  handleClick: vi.fn(),
  setEnabled: vi.fn(),
  syncTheme: vi.fn(),
  updateLastTaskTime: vi.fn(),
  checkInactivity: vi.fn(),
  reset: vi.fn(),
  ...overrides,
});
```

---

## Summary

All APIs follow these principles:

- **Type-safe**: Full TypeScript coverage
- **Testable**: Pure functions and mockable stores
- **Accessible**: ARIA labels and reduced motion support
- **Performant**: Minimal re-renders, efficient subscriptions
- **Maintainable**: Clear separation of concerns (component, hook, store, utilities)
