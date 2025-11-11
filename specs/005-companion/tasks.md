# Tasks: Minimal Companion Character

**Input**: Design documents from `/specs/005-companion/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No tests requested in specification - manual testing only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

> Project advisory (Clarity): Local‑first, no backend/auth/database. Replace backend examples
> with tasks for offline persistence (IndexedDB/localStorage), motion/gamification toggles,
> accessibility checks (keyboard, contrast, reduced motion), and JSON import/export.
> Before creating components, check `app/components/` for existing ones. Build new UI
> components in `app/components/ui/` using Radix UI primitives via shadcn patterns.
> Follow clean code practices: use descriptive names, single responsibilities, extract
> reusable logic into `utils/` utilities or `hooks/`, avoid duplication, minimize nesting,
> and ensure changes are localized to reduce refactoring impact.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Sprite Assets & Project Structure)

**Purpose**: Prepare sprite assets and verify project structure for companion implementation

- [x] T001 Verify dog sprite sheets exist at `/Users/khusharth/home/projects/clarity/public/dog-light.png` and `/Users/khusharth/home/projects/clarity/public/dog-dark.png`
- [x] T002 Validate sprite sheet dimensions (128x320px, 10 rows × 4 columns, 32x32px sprites)
- [x] T003 Test sprite sheet loading in browser to ensure proper rendering with `imageRendering: pixelated`

---

## Phase 2: Foundational (Core Animation Infrastructure)

**Purpose**: Core sprite animation system that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create companion animation utilities in `app/lib/companion-animations.ts` with sprite map, state animation map, and getSpritePosition function
- [x] T005 [P] Create companion Zustand store in `app/store/companion.ts` with CompanionState interface and state machine transitions
- [x] T006 Create useCompanion hook in `app/hooks/useCompanion.ts` with sprite position calculation and theme sync logic

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 5 - Companion Settings Control (Priority: P1) 🎯 MVP Foundation

**Goal**: Allow users to enable/disable companion through settings with persistence, ensuring the feature is optional and respects user choice

**Independent Test**: Toggle companion setting on/off in Settings modal and verify companion appears/disappears, then reload app to confirm preference persists

### Implementation for User Story 5

- [x] T007 [US5] Update Settings component in `app/components/Settings.tsx` to add "Show Companion" toggle using existing Toggle UI component
- [x] T008 [US5] Add showCompanion property to todos store in `app/store/todos.ts` with persist configuration for IndexedDB storage
- [x] T009 [US5] Create sync logic in `app/store/todos.ts` to connect showCompanion state with useCompanionStore.setEnabled on app initialization
- [x] T010 [US5] Implement setShowCompanion action in `app/store/todos.ts` that updates both todos store and companion store

**Checkpoint**: At this point, companion can be toggled on/off with persistence, providing user control over the feature

---

## Phase 4: User Story 1 - Idle Presence (Priority: P1) 🎯 MVP Core

**Goal**: Display companion character in bottom corner with basic idle animations and theme support

**Independent Test**: Open app and verify companion appears in corner with idle animations cycling between front/side/back variations, then toggle dark/light theme and verify sprite sheet changes

### Implementation for User Story 1

- [x] T011 [US1] Create Companion component in `app/components/Companion.tsx` with fixed positioning (top-4 right-4 mobile, top-6 left-24 desktop)
- [x] T012 [US1] Implement sprite rendering using CSS background-position with calculated offsets (64x64px display size via SPRITE_SCALE)
- [x] T013 [US1] Integrate theme detection from useCompanion hook to dynamically load companion-light.png or companion-dark.png
- [x] T014 [US1] Implement idle animation cycling with setInterval to update frame index, picking random idle animations on loop completion
- [x] T015 [US1] Add Framer Motion AnimatePresence wrapper with fade-in/scale animation on mount (0.3s duration)
- [x] T016 [US1] Integrate Companion into `app/layout.tsx` after Toasts component for global visibility
- [x] T017 [US1] Add reduced motion detection using existing `useReducedMotion` hook to disable animations when user prefers reduced motion
- [x] T018 [US1] Implement static sprite fallback for reduced motion users (shows first frame of idle animation)

**Checkpoint**: At this point, companion is visible with idle animations, respects theme and accessibility preferences

---

## Phase 5: User Story 2 - Task Completion Reactions (Priority: P2)

**Goal**: Companion briefly reacts with motivated state (wuff animation) when user completes tasks, providing gentle positive reinforcement

**Independent Test**: Complete a task and verify companion plays wuff animation for ~600ms then returns to idle cycling

### Implementation for User Story 2

- [x] T019 [US2] Add todo subscription logic in useCompanion hook in `app/hooks/useCompanion.ts` using useTodos.subscribe to detect task completions
- [x] T020 [US2] Implement task completion detection in `app/hooks/useCompanion.ts` by comparing completed task counts between state updates
- [x] T021 [US2] Add transitionTo('motivated') call in useCompanion hook when new task completions detected and companion is enabled
- [x] T022 [US2] Implement updateLastTaskTime action in companion store at `app/store/companion.ts` to track timestamp of last completion
- [x] T023 [US2] Add animation completion handler in `app/components/Companion.tsx` to transition back to idle after motivated animation finishes

**Checkpoint**: At this point, companion reacts to individual task completions with brief motivated animation

---

## Phase 6: User Story 3 - Quadrant Clear Celebration (Priority: P2)

**Goal**: Companion shows enhanced celebration animation (runDiaUp + wuff sequence) when user completes all tasks in a quadrant

**Independent Test**: Complete all tasks in a quadrant and verify companion plays runDiaUp animation followed by wuff, creating a more pronounced celebration than individual tasks

### Implementation for User Story 3

- [x] T024 [US3] Add quadrant detection logic in useCompanion hook in `app/hooks/useCompanion.ts` to check if all tasks in a quadrant are completed
- [x] T025 [US3] Implement quadrant completion check in `app/hooks/useCompanion.ts` by comparing lastCompleted task's quadrant (important/urgent) with all tasks in that quadrant
- [x] T026 [US3] Add conditional transition logic in `app/hooks/useCompanion.ts` to call transitionTo('celebrating') instead of 'motivated' when quadrant is cleared
- [x] T027 [US3] Implement animation sequencing in `app/components/Companion.tsx` to play runDiaUp animation followed by wuff animation when in celebrating state
- [x] T028 [US3] Add brief pause (100ms) between celebration animations in `app/components/Companion.tsx` using setTimeout before playing next animation

**Checkpoint**: At this point, companion distinguishes between individual task completion and quadrant clear with appropriate animations

---

## Phase 7: User Story 6 - Interactive Touch/Click Reactions (Priority: P2)

**Goal**: Companion responds to clicks/taps with one of 3 playful reaction animations (happy/curious/playful), creating interactive engagement

**Independent Test**: Click companion multiple times and verify it cycles through wuff (happy), idleDiaUp (curious), and runDiaDown (playful) reactions with 500ms cooldown

### Implementation for User Story 6

- [x] T029 [US6] Add click tracking state to companion store in `app/store/companion.ts` with lastClickTime and clickCount properties
- [x] T030 [US6] Implement handleClick action in `app/store/companion.ts` with 500ms cooldown check and click count increment
- [x] T031 [US6] Add reaction state selection logic in `app/store/companion.ts` handleClick that cycles through happy/curious/playful based on clickCount modulo 3
- [x] T032 [US6] Add onClick handler in `app/components/Companion.tsx` that calls handleClick from useCompanion hook
- [x] T033 [US6] Implement animation blocking logic in `app/store/companion.ts` handleClick to prevent clicks during motivated or celebrating states
- [x] T034 [US6] Add pointer-events-auto class and cursor-pointer class to companion div in `app/components/Companion.tsx`
- [x] T035 [US6] Add Framer Motion whileHover scale 1.1 and whileTap scale 0.95 to companion div in `app/components/Companion.tsx` (respecting reduced motion)
- [x] T036 [US6] Add ARIA attributes to companion div in `app/components/Companion.tsx` with role="img" and aria-label="Companion character"

**Checkpoint**: At this point, companion is fully interactive with click/tap reactions and proper accessibility support

---

## Phase 8: User Story 4 - Inactivity Tired State (Priority: P3)

**Goal**: Companion transitions to tired state (sleep animation) after 2 hours of no task completions, providing gentle encouragement to engage

**Independent Test**: Set inactivity threshold to 2 minutes for testing, wait 2 minutes without completing tasks, verify companion shows sleep animation, then complete a task to verify companion wakes up

### Implementation for User Story 4

- [x] T037 [US4] Add checkInactivity method in companion store at `app/store/companion.ts` that calculates elapsed time since lastTaskCompletionTime
- [x] T038 [US4] Implement 2-hour threshold check (2 * 60 * 60 * 1000 milliseconds) in checkInactivity method with transition to tired state
- [x] T039 [US4] Add useEffect timer in useCompanion hook in `app/hooks/useCompanion.ts` that calls checkInactivity every 60 seconds (60000ms)
- [x] T040 [US4] Implement wake-up transition logic in useCompanion todo subscription to check if current state is tired and transition to motivated on task completion
- [ ] T041 [US4] Add wakeUp animation support in `app/components/Companion.tsx` to play wakeUp sprite animation before transitioning to motivated state

**Checkpoint**: At this point, all user stories are independently functional with complete state machine coverage

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and overall quality

- [ ] T042 [P] Add performance optimization in `app/components/Companion.tsx` to preload both sprite sheets using requestIdleCallback
- [ ] T043 [P] Add responsive positioning adjustments in `app/components/Companion.tsx` for mobile (right-4 top-4) vs desktop (left-24 top-6) breakpoints
- [ ] T044 [P] Verify z-index (z-50) in `app/components/Companion.tsx` ensures companion never blocks interactive elements like modals or floating CTAs
- [ ] T045 Extract animation frame stepping logic from `app/components/Companion.tsx` into reusable utility function in `app/lib/companion-animations.ts`
- [ ] T046 Add JSDoc comments to all exported functions in `app/lib/companion-animations.ts` documenting sprite sheet structure and usage
- [ ] T047 Add JSDoc comments to companion store in `app/store/companion.ts` documenting state machine transitions and valid state flows
- [ ] T048 Test companion across all screen sizes (mobile 375px, tablet 768px, desktop 1440px) and verify positioning never overlaps UI
- [ ] T049 Test companion with both light and dark themes and verify correct sprite sheet loading and theme sync
- [ ] T050 Test companion with reduced motion enabled and verify animations are simplified or disabled
- [ ] T051 Test rapid task completion/deletion cycles and verify companion animations queue gracefully without stacking
- [ ] T052 Test all edge cases from spec.md including state transitions during animations and rapid clicks
- [ ] T053 Run manual validation checklist from quickstart.md covering all 9 test scenarios
- [ ] T054 Update README.md usage section to mention companion character feature and settings toggle if not already documented
- [ ] T055 Verify companion animations achieve 60fps performance using React DevTools Profiler

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User Story 5 (US5-P1) provides settings control - recommended before US1
  - User Story 1 (US1-P1) provides core idle presence - required for visual foundation
  - User Story 2 (US2-P2) adds task reactions - depends on US1 completion
  - User Story 3 (US3-P2) adds celebration - depends on US2 completion (reuses task detection)
  - User Story 6 (US6-P2) adds click interactions - independent after US1, can parallel with US2/US3
  - User Story 4 (US4-P3) adds tired state - independent after US1, can parallel with US2/US3/US6
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 5 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories, provides settings toggle
- **User Story 1 (P1)**: Can start after US5 (or parallel) - Provides core companion visual presence (foundation for all other stories)
- **User Story 2 (P2)**: Can start after US1 - Adds task completion reactions (needs todo subscription)
- **User Story 3 (P2)**: Can start after US2 - Adds quadrant celebration (extends task completion detection)
- **User Story 6 (P2)**: Can start after US1 - Adds click interactions (independent from task reactions)
- **User Story 4 (P3)**: Can start after US1 - Adds inactivity detection (independent from other behaviors)

### Recommended Sequence

**MVP (Phases 1-4)**: Setup → Foundational → US5 (Settings) → US1 (Idle) ✅ Delivers: Toggleable companion with idle animations

**Enhanced MVP (+Phases 5-6)**: US2 (Task Reactions) → US3 (Celebrations) ✅ Delivers: Task completion feedback loop

**Full Feature (+Phases 7-8)**: US6 (Click Interactions) → US4 (Tired State) ✅ Delivers: Complete interactive companion

**Quality (+Phase 9)**: Polish & Testing ✅ Delivers: Production-ready feature

### Within Each User Story

- Core store/hook logic before component implementation
- Component rendering before animation logic
- Animation logic before accessibility enhancements
- Story complete before moving to next priority

### Parallel Opportunities

- **Setup (Phase 1)**: All 3 tasks can run in parallel (T001, T002, T003)
- **Foundational (Phase 2)**: T004 and T005 can run in parallel (different files), T006 depends on both
- **After US1 completion**: US6 (Click), US4 (Tired) can run in parallel with US2/US3 sequence
- **Polish (Phase 9)**: T042, T043, T044, T045, T046, T047 can all run in parallel (different files/concerns)
- **Testing tasks** in Phase 9: T048-T053 can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch animation infrastructure tasks together:
Task: "Create companion animation utilities in app/lib/companion-animations.ts"
Task: "Create companion Zustand store in app/store/companion.ts"
# Then proceed to:
Task: "Create useCompanion hook in app/hooks/useCompanion.ts" (needs T004, T005)
```

## Parallel Example: After US1 Complete

```bash
# Launch these user stories in parallel:
Task: "User Story 2 - Task Completion Reactions" (extends todo subscription)
Task: "User Story 6 - Interactive Touch/Click Reactions" (independent click handling)
Task: "User Story 4 - Inactivity Tired State" (independent timer logic)
```

---

## Implementation Strategy

### MVP First (User Stories 5 + 1 Only)

1. Complete Phase 1: Setup (verify sprite assets)
2. Complete Phase 2: Foundational (animation system)
3. Complete Phase 3: User Story 5 (settings toggle)
4. Complete Phase 4: User Story 1 (idle presence)
5. **STOP and VALIDATE**: Test companion idle animations and settings toggle
6. Deploy/demo if ready ✅ Delivers: Minimal companion with user control

### Enhanced MVP (Add Task Reactions)

1. Complete MVP above
2. Add Phase 5: User Story 2 (task completion reactions)
3. Add Phase 6: User Story 3 (quadrant celebrations)
4. **STOP and VALIDATE**: Test task completion feedback loop
5. Deploy/demo if ready ✅ Delivers: Motivational feedback system

### Full Feature (Add Interactions)

1. Complete Enhanced MVP above
2. Add Phase 7: User Story 6 (click interactions)
3. Add Phase 8: User Story 4 (tired state)
4. **STOP and VALIDATE**: Test all interactive behaviors
5. Deploy/demo if ready ✅ Delivers: Complete companion experience

### Production Ready

1. Complete Full Feature above
2. Complete Phase 9: Polish & Cross-Cutting
3. Run full test suite from quickstart.md
4. Production deployment ✅ Delivers: Polished, accessible, performant feature

---

## Summary

- **Total Tasks**: 55 tasks across 9 phases
- **MVP Tasks**: 18 tasks (Phases 1-4: Setup + Foundational + US5 + US1)
- **Enhanced MVP Tasks**: +10 tasks (Phases 5-6: US2 + US3)
- **Full Feature Tasks**: +13 tasks (Phases 7-8: US6 + US4)
- **Polish Tasks**: 14 tasks (Phase 9: Quality and testing)

### Task Count per User Story

- **US1 - Idle Presence (P1)**: 8 tasks (T011-T018) - Core visual foundation
- **US2 - Task Reactions (P2)**: 5 tasks (T019-T023) - Individual completion feedback
- **US3 - Quadrant Celebration (P2)**: 5 tasks (T024-T028) - Milestone celebration
- **US4 - Tired State (P3)**: 5 tasks (T037-T041) - Inactivity detection
- **US5 - Settings Control (P1)**: 4 tasks (T007-T010) - User preference management
- **US6 - Click Interactions (P2)**: 8 tasks (T029-T036) - Interactive engagement

### Parallel Opportunities Identified

- Setup phase: 3 tasks can run in parallel
- Foundational phase: 2 tasks can run in parallel initially
- After US1: US2, US6, and US4 can run in parallel (13 tasks across 3 stories)
- Polish phase: 6 infrastructure tasks + 6 testing tasks can run in parallel

### Independent Test Criteria

Each user story has clear acceptance criteria that can be validated independently:

- **US5**: Toggle in settings, verify appearance/persistence
- **US1**: Idle animations cycling without blocking UI
- **US2**: Task completion triggers brief reaction
- **US3**: Quadrant clear triggers celebration sequence
- **US6**: Click triggers one of 3 reactions with cooldown
- **US4**: 2-hour inactivity triggers tired state, task wakes up

### Suggested MVP Scope

**Minimum Viable Product**: Phases 1-4 (US5 + US1)

- Provides toggleable companion with calm idle presence
- Establishes core visual design and positioning
- Delivers immediate personality value without complexity
- 18 tasks, estimated 4-6 hours of focused implementation

**Recommended MVP**: Phases 1-6 (US5 + US1 + US2 + US3)

- Adds task completion feedback loop
- Delivers core motivational value proposition
- 28 tasks, estimated 8-10 hours of focused implementation

---

## Notes

- All tasks follow strict checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- [P] tasks indicate parallelizable work (different files, no dependencies)
- [Story] labels (US1, US2, etc.) map to user stories in spec.md for traceability
- Each user story can be independently completed, tested, and delivered
- No automated tests requested - manual testing using quickstart.md validation checklist
- Sprite sheets must exist in `/public/` directory before Phase 2 can begin
- All animations must respect reduced motion preferences per constitution
- Component reuses existing Toggle from `app/components/ui/` per clean code principles
- Store follows existing Zustand + Dexie persistence pattern from todos.ts
