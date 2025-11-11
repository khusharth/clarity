# Data Model: Minimal Companion Character

**Feature**: 005-companion  
**Date**: 2025-11-11  
**Purpose**: Define data structures, state management, and persistence for the companion feature

## Entity: Companion State

### Core Data Structure

```typescript
interface CompanionState {
  // Current behavioral state
  state: CompanionStateType;

  // User preference for visibility
  enabled: boolean;

  // Timestamp tracking for inactivity detection
  lastTaskCompletionTime: number | null; // Unix timestamp in milliseconds

  // Animation management
  currentAnimation: AnimationType | null;
  animationQueue: AnimationType[];
  isAnimating: boolean;

  // Click interaction tracking
  lastClickTime: number; // Unix timestamp for cooldown
  clickCount: number; // For cycling through reactions

  // Theme awareness
  theme: "light" | "dark"; // Synced from app theme
}

// State types matching spec requirements
type CompanionStateType =
  | "idle" // Default resting state
  | "motivated" // Task completion reaction
  | "celebrating" // Quadrant clear celebration
  | "tired" // 2-hour inactivity state
  | "happy" // Interactive reaction 1
  | "curious" // Interactive reaction 2
  | "playful"; // Interactive reaction 3

// Animation types mapped to sprite sheet rows
type AnimationType =
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
```

### State Machine Definition

```typescript
// Valid state transitions
const stateTransitions: Record<CompanionStateType, CompanionStateType[]> = {
  idle: ["motivated", "celebrating", "tired", "happy", "curious", "playful"],
  motivated: ["idle", "celebrating"], // Can chain to celebrating if quadrant cleared
  celebrating: ["idle"],
  tired: ["motivated", "idle"], // Wake up on task completion
  happy: ["idle"],
  curious: ["idle"],
  playful: ["idle"],
};

// State-to-animation mapping
const stateAnimationMap: Record<CompanionStateType, AnimationType[]> = {
  idle: ["idleFront", "idleSide", "idleBack"], // Cycle for variety
  motivated: ["wuff"], // Excited bark
  celebrating: ["runDiaUp", "wuff"], // Run + bark sequence
  tired: ["sleep"], // Sleeping loop
  happy: ["wuff"], // Click reaction 1
  curious: ["idleDiaUp"], // Click reaction 2
  playful: ["runDiaDown"], // Click reaction 3
};
```

### Sprite Sheet Configuration

```typescript
interface SpriteConfig {
  row: number; // Vertical position (0-9)
  frames: number; // Number of animation frames (always 3)
  startX: number; // Horizontal offset to skip label (32px)
  duration: number; // Total animation duration in ms
}

const spriteMap: Record<AnimationType, SpriteConfig> = {
  idleFront: { row: 0, frames: 3, startX: 32, duration: 1200 }, // 400ms per frame
  idleSide: { row: 1, frames: 3, startX: 32, duration: 1200 },
  idleBack: { row: 2, frames: 3, startX: 32, duration: 1200 },
  idleDiaUp: { row: 3, frames: 3, startX: 32, duration: 1200 },
  idleDiaDown: { row: 4, frames: 3, startX: 32, duration: 1200 },
  runDiaUp: { row: 5, frames: 3, startX: 32, duration: 600 }, // Faster for running
  runDiaDown: { row: 6, frames: 3, startX: 32, duration: 600 },
  wakeUp: { row: 7, frames: 3, startX: 32, duration: 900 },
  sleep: { row: 8, frames: 3, startX: 32, duration: 2400 }, // Slower for sleeping
  wuff: { row: 9, frames: 3, startX: 32, duration: 600 },
};

// Sprite sheet dimensions
const SPRITE_SIZE = 32; // Each sprite is 32x32px
const SPRITE_SCALE = 2; // Display at 64x64px
const SPRITE_SHEET_WIDTH = 128; // 4 columns: label + 3 frames
const SPRITE_SHEET_HEIGHT = 320; // 10 rows
```

## Entity: Companion Settings

### Settings Data Structure

```typescript
interface CompanionSettings {
  // Stored in existing app settings/preferences
  showCompanion: boolean; // User toggle from Settings modal
}
```

### Persistence Strategy

**Storage Location**: Zustand store with Dexie persistence (following existing pattern)

```typescript
// In app/lib/db.ts - add to existing Dexie schema
interface AppSettings {
  id: "settings"; // Single row
  // ... existing settings
  showCompanion: boolean;
}

// Default value
const DEFAULT_COMPANION_ENABLED = true;
```

## State Management: Zustand Store

### Store Structure

```typescript
// app/store/companion.ts
interface CompanionStore extends CompanionState {
  // State transitions
  transitionTo: (newState: CompanionStateType) => void;

  // Animation management
  playAnimation: (animation: AnimationType) => Promise<void>;
  queueAnimation: (animation: AnimationType) => void;
  clearQueue: () => void;

  // User interactions
  handleClick: () => void;

  // Settings
  setEnabled: (enabled: boolean) => void;
  syncTheme: (theme: "light" | "dark") => void;

  // Time tracking
  updateLastTaskTime: () => void;
  checkInactivity: () => void;

  // Initialization
  reset: () => void;
}
```

### State Transition Logic

```typescript
// Transition validation
function canTransition(
  from: CompanionStateType,
  to: CompanionStateType
): boolean {
  return stateTransitions[from].includes(to);
}

// Transition with animation
async function transitionTo(newState: CompanionStateType) {
  const currentState = get().state;

  // Validate transition
  if (!canTransition(currentState, newState)) {
    console.warn(`Invalid transition: ${currentState} -> ${newState}`);
    return;
  }

  // Special case: tired -> active requires wake-up animation
  if (currentState === "tired" && newState !== "tired") {
    await playAnimation("wakeUp");
  }

  // Update state
  set({ state: newState });

  // Play corresponding animation(s)
  const animations = stateAnimationMap[newState];
  for (const anim of animations) {
    await playAnimation(anim);
  }

  // Return to idle if not a persistent state
  if (!["idle", "tired"].includes(newState)) {
    setTimeout(
      () => {
        if (get().state === newState) {
          set({ state: "idle" });
        }
      },
      animations.reduce((sum, a) => sum + spriteMap[a].duration, 0)
    );
  }
}
```

## Integration Points

### 1. Todo Store Integration

**Observer Pattern**: Companion store subscribes to todo store changes

```typescript
// In useCompanion hook or companion.ts
useTodos.subscribe(
  (state) => ({
    tasks: state.tasks,
    completed: state.tasks.filter((t) => t.completed),
  }),
  (current, previous) => {
    // Detect task completion
    const newCompletions = current.completed.length - previous.completed.length;

    if (newCompletions > 0) {
      updateLastTaskTime();

      // Check if quadrant was cleared
      const lastCompleted = current.completed[current.completed.length - 1];
      const quadrantTasks = current.tasks.filter(
        (t) =>
          t.important === lastCompleted.important &&
          t.urgent === lastCompleted.urgent
      );
      const quadrantCleared = quadrantTasks.every((t) => t.completed);

      transitionTo(quadrantCleared ? "celebrating" : "motivated");
    }
  }
);
```

### 2. Theme Store Integration

**Two-way Sync**: Companion needs theme to load correct sprite sheet

```typescript
// In useCompanion hook
useEffect(() => {
  const currentTheme = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
  syncTheme(currentTheme);

  // Watch for theme changes
  const observer = new MutationObserver(() => {
    const theme = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    syncTheme(theme);
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => observer.disconnect();
}, []);
```

### 3. Settings Store Integration

**Settings Persistence**: Use existing Zustand + Dexie pattern

```typescript
// In app/store/todos.ts (existing pattern to follow)
interface TodosState {
  // ... existing state
  showCompanion: boolean;
  setShowCompanion: (show: boolean) => void;
}

// Persist to Dexie on change
persist(
  (set, get) => ({
    // ... existing state
    showCompanion: true,
    setShowCompanion: (show: boolean) => {
      set({ showCompanion: show });
      // Persist to IndexedDB via existing mechanism
    },
  }),
  {
    name: "clarity-todos-storage",
    // ... existing config
  }
);
```

## Validation Rules

### State Constraints

1. **Mutual Exclusion**: Only one state active at a time
2. **Transition Validity**: Must follow state machine rules
3. **Animation Integrity**: Complete current animation before starting new one (except high-priority interrupts)
4. **Enabled Guard**: All state changes ignored if `enabled === false`

### Time Constraints

1. **Inactivity Threshold**: Exactly 2 hours (7,200,000 milliseconds)
2. **Click Cooldown**: 500ms between click interactions
3. **Animation Duration**: Respect sprite config durations for smooth playback

### Data Constraints

1. **Timestamps**: Non-negative, validated Unix epoch milliseconds
2. **Theme**: Must be 'light' or 'dark' (no undefined state)
3. **Animation Queue**: Max length of 3 to prevent memory accumulation

## Relationships

```
┌─────────────────┐
│   Todo Store    │ ──► (task completion events)
└─────────────────┘                 │
                                    ▼
                        ┌───────────────────────┐
                        │   Companion Store     │
                        │  (state machine)      │
                        └───────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
            │  Settings   │  │   Theme     │  │  Animation  │
            │   Store     │  │   System    │  │   Engine    │
            └─────────────┘  └─────────────┘  └─────────────┘
```

## Migration & Initialization

### First-Time Setup

```typescript
// On app first load
function initializeCompanion() {
  // Check if settings exist in Dexie
  const settings = await db.settings.get("settings");

  if (settings?.showCompanion === undefined) {
    // First time: enable by default
    await db.settings.put({
      id: "settings",
      ...settings,
      showCompanion: true,
    });
  }

  // Initialize companion store with persisted value
  useCompanionStore.getState().setEnabled(settings?.showCompanion ?? true);
}
```

### No Breaking Changes

This feature is purely additive:

- No existing data modified
- New optional field in settings
- Graceful degradation if disabled

## Performance Optimization

### Lazy Loading

```typescript
// Preload sprite sheets on idle
const preloadSprites = () => {
  const light = new Image();
  const dark = new Image();

  light.src = "/dog-light.png";
  dark.src = "/dog-dark.png";

  // Browser caches for instant display
};

// Call during app initialization (not blocking)
if (typeof window !== "undefined") {
  requestIdleCallback(() => preloadSprites());
}
```

### Memory Management

- Sprite sheets stay loaded (only ~4KB each)
- Animation queue capped at 3 items
- State history not tracked (stateless state machine)
- Timers cleared on unmount

## Testing Considerations

### Unit Test Cases

1. **State transitions**: Verify all valid/invalid transitions
2. **Time calculations**: Test inactivity detection edge cases
3. **Animation mapping**: Ensure all states map to valid animations
4. **Click cooldown**: Verify rapid clicks are throttled
5. **Theme sync**: Confirm correct sprite sheet selection

### Integration Test Cases

1. **Task completion**: Verify companion reacts to todo changes
2. **Quadrant clearing**: Test celebration trigger logic
3. **Settings toggle**: Confirm enable/disable persistence
4. **Theme switching**: Verify sprite sheet updates
5. **Reduced motion**: Test accessibility behavior

### Manual Test Scenarios

1. Complete task → see motivated reaction
2. Clear quadrant → see celebration
3. Wait 2 hours → see tired state
4. Click companion → see random reactions
5. Toggle in settings → confirm show/hide
6. Switch theme → verify correct sprite colors
