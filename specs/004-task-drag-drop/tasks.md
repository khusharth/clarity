# Tasks: Task Drag and Drop

**Feature**: 004-task-drag-drop  
**Branch**: `004-task-drag-drop`  
**Date**: 2025-11-07  
**Status**: Ready for Implementation

## User Stories Summary

- **US1** [P1]: Move Tasks Between Quadrants - Core drag-and-drop functionality for task reclassification
- **US2** [P2]: Reorder Tasks Within a Quadrant - Fine-grained priority control within categories
- **US3** [P1]: Touch-Based Mobile Support - Ensure feature works on mobile devices

**MVP Scope**: US1 only (cross-quadrant drag-and-drop)

---

## Phase 1: Setup & Infrastructure

### Schema & Database Migration

- [ ] **T001** [P] [Setup] Extend Task interface with `sortOrder: number | null` field in `app/lib/schema.ts`
- [ ] **T002** [P] [Setup] Update Dexie schema to v2 with `sortOrder` index in `app/lib/db.ts`
- [ ] **T003** [P] [Setup] Verify schema migration in IndexedDB using browser DevTools
- [ ] **T004** [P] [Setup] Create placeholder sound files `public/sounds/drag-start.mp3` and `public/sounds/drag-drop.mp3` (add actual audio later)

---

## Phase 2: Foundational Components (Blocking All Stories)

### Sound System

- [ ] **T005** [P] [Foundation] Extend `useSfx` hook with `dragStart()` method playing `/sounds/drag-start.mp3` (volume: 0.3, duration: ~100ms) in `app/hooks/useSfx.ts`
- [ ] **T006** [P] [Foundation] Extend `useSfx` hook with `dragDrop()` method playing `/sounds/drag-drop.mp3` (volume: 0.35, duration: ~120ms) in `app/hooks/useSfx.ts`
- [ ] **T007** [Foundation] Add beep fallback for both sound effects using existing beep() function in `app/hooks/useSfx.ts`

### Drag State Management

- [ ] **T008** [P] [Foundation] Create `useDragAndDrop` hook with DragState interface in `app/hooks/useDragAndDrop.ts`
- [ ] **T009** [P] [Foundation] Implement `onDragStart`, `onDrag`, `onDragEnd` handlers with quadrant ref tracking in `app/hooks/useDragAndDrop.ts`
- [ ] **T010** [P] [Foundation] Implement drop zone detection using bounding box intersection logic in `app/hooks/useDragAndDrop.ts`

### Store Actions

- [ ] **T011** [P] [Foundation] Implement `reorderTaskWithinQuadrant(taskId, newIndex)` action with fractional indexing in `app/store/todos.ts`
- [ ] **T012** [P] [Foundation] Implement `moveTaskToQuadrant(taskId, targetQuadrant, targetIndex)` action with urgency/importance mapping in `app/store/todos.ts`
- [ ] **T013** [Foundation] Implement `cancelDrag()` action to reset drag state without persisting in `app/store/todos.ts`
- [ ] **T014** [P] [Foundation] Update `saveTask()` to persist `sortOrder` field to IndexedDB in `app/lib/persistence.ts`

### Sorting Logic

- [ ] **T015** [P] [Foundation] Update task sorting logic to `ORDER BY sortOrder ASC NULLS LAST, createdAt ASC` in `app/store/todos.ts`

---

## Phase 3: User Story 1 - Move Tasks Between Quadrants [P1]

### Component Enhancements

- [ ] **T016** [P] [US1] Add `drag`, `dragMomentum={false}`, `dragElastic={0}` props to TodoCard motion.div in `app/components/TodoCard.tsx`
- [ ] **T017** [P] [US1] Implement `onDragStart` handler calling `useDragAndDrop().onDragStart()` and `sfx.dragStart()` in `app/components/TodoCard.tsx`
- [ ] **T018** [P] [US1] Implement `onDrag` handler calling `useDragAndDrop().onDrag(x, y)` in `app/components/TodoCard.tsx`
- [ ] **T019** [P] [US1] Implement `onDragEnd` handler calling `moveTaskToQuadrant()` and `sfx.dragDrop()` in `app/components/TodoCard.tsx`
- [ ] **T020** [P] [US1] Add `whileDrag` animation with scale: 1.05, boxShadow, zIndex: 1000 in `app/components/TodoCard.tsx`

### Drop Zone Visual Feedback

- [ ] **T021** [P] [US1] Add quadrantRef registration in Quadrant component using `useDragAndDrop().setQuadrantRef()` in `app/components/Quadrant.tsx`
- [ ] **T022** [P] [US1] Apply highlight styles (ring-2, ring-blue-500) when `isDropTarget === true` in `app/components/Quadrant.tsx`
- [ ] **T023** [US1] Handle empty quadrant drop case by highlighting entire quadrant area in `app/components/Quadrant.tsx`

### Orchestration

- [ ] **T024** [P] [US1] Integrate `useDragAndDrop` hook in Matrix component in `app/components/Matrix.tsx`
- [ ] **T025** [P] [US1] Pass `dragState` to all 4 Quadrant components for drop target detection in `app/components/Matrix.tsx`
- [ ] **T026** [US1] Implement drag cancellation when released outside all quadrants in `app/components/Matrix.tsx`

### Accessibility

- [ ] **T027** [P] [US1] Respect `useAppReducedMotion()` preference: disable animations, keep drag-and-drop functional in `app/components/TodoCard.tsx`
- [ ] **T028** [US1] Ensure drag state changes happen instantly when reduced-motion is active in `app/components/TodoCard.tsx`

---

## Phase 4: User Story 2 - Reorder Tasks Within Quadrant [P2]

### Gap Indicators

- [ ] **T029** [US2] Calculate `targetIndex` during drag over same quadrant in `app/hooks/useDragAndDrop.ts`
- [ ] **T030** [US2] Render gap indicator (2px blue bar) at target insertion position in `app/components/Quadrant.tsx`
- [ ] **T031** [US2] Update gap position dynamically as drag moves within quadrant in `app/components/Quadrant.tsx`

### Reorder Logic

- [ ] **T032** [US2] Call `reorderTaskWithinQuadrant()` on drop within same quadrant in `app/components/TodoCard.tsx`
- [ ] **T033** [US2] Animate surrounding tasks smoothly to make space for dropped task in `app/components/Quadrant.tsx`

### Auto-Scroll

- [ ] **T034** [US2] Detect drag near top/bottom edge (within 50px) of quadrant in `app/hooks/useDragAndDrop.ts`
- [ ] **T035** [US2] Trigger auto-scroll up/down when dragging near edges with overflow content in `app/hooks/useDragAndDrop.ts`

---

## Phase 5: User Story 3 - Touch-Based Mobile Support [P1]

### Touch Gestures

- [ ] **T036** [P] [US3] Detect mobile device using `window.matchMedia("(pointer: coarse)")` in `app/components/TodoCard.tsx`
- [ ] **T037** [P] [US3] Implement 500ms tap-and-hold threshold before enabling drag on mobile in `app/components/TodoCard.tsx`
- [ ] **T038** [P] [US3] Add visual lift effect (elevation, shadow) after hold threshold is reached in `app/components/TodoCard.tsx`

### Haptic Feedback

- [ ] **T039** [US3] Trigger `navigator.vibrate?.([10, 50, 10])` on drag start (mobile only) in `app/components/TodoCard.tsx`
- [ ] **T040** [US3] Trigger `navigator.vibrate?.([20])` on successful drop (mobile only) in `app/components/TodoCard.tsx`

### Scroll Prevention

- [ ] **T041** [P] [US3] Apply `overflow: hidden` and `touchAction: none` to body during active drag in `app/components/Matrix.tsx`
- [ ] **T042** [P] [US3] Restore scroll behavior on drag end or cancellation in `app/components/Matrix.tsx`
- [ ] **T043** [US3] Handle accidental scroll during drag by canceling drag operation in `app/components/TodoCard.tsx`

---

## Phase 6: Polish & Edge Cases

### Edge Case Handling

- [ ] **T044** [Edge Cases] Handle null `sortOrder` values by assigning fractional index on first reorder in `app/store/todos.ts`
- [ ] **T045** [Edge Cases] Prevent multiple simultaneous drag operations using drag state lock in `app/hooks/useDragAndDrop.ts`
- [ ] **T046** [Edge Cases] Handle rapid successive drags with debouncing logic in `app/components/TodoCard.tsx`
- [ ] **T047** [Edge Cases] Return task to original position with animation when cancelled in `app/components/TodoCard.tsx`

### Performance Optimization

- [ ] **T048** [Performance] Optimize bounding box calculations to avoid layout thrashing in `app/hooks/useDragAndDrop.ts`
- [ ] **T049** [Performance] Verify 60fps during drag operations using Chrome DevTools Performance tab
- [ ] **T050** [Performance] Ensure audio latency <100ms from drop to sound playback

### Sound Integration

- [ ] **T051** [Sound] Replace placeholder MP3 files with actual drag-start and drag-drop sound effects in `public/sounds/`
- [ ] **T052** [Sound] Test sound effects with `soundEnabled` toggle in Settings in `app/components/Settings.tsx`

### Final Validation

- [ ] **T053** [Validation] Manual test all 3 user stories on desktop (Chrome, Firefox, Safari)
- [ ] **T054** [Validation] Manual test all 3 user stories on mobile (iOS Safari, Chrome Android)
- [ ] **T055** [Validation] Verify all 15 functional requirements (FR-001 to FR-015) from spec.md
- [ ] **T056** [Validation] Verify all 10 success criteria (SC-001 to SC-010) from spec.md
- [ ] **T057** [Validation] Test all edge cases listed in spec.md (empty quadrant, network loss, rapid drags, reduced-motion, sound muted)
- [ ] **T058** [Validation] Verify no regressions in existing functionality (add task, edit, delete, complete, filters)

---

## Task Summary

**Total Tasks**: 58  
**Parallelizable**: 15 tasks marked with [P] (can run concurrently after dependencies)  
**Per-Story Breakdown**:

- **Setup**: 4 tasks (T001-T004)
- **Foundation**: 11 tasks (T005-T015) - blocking all user stories
- **US1 (P1)**: 13 tasks (T016-T028)
- **US2 (P2)**: 7 tasks (T029-T035)
- **US3 (P1)**: 8 tasks (T036-T043)
- **Polish**: 15 tasks (T044-T058)

**MVP Scope** (US1 only): Tasks T001-T015 (Foundation) + T016-T028 (US1) = **28 tasks**

---

## Implementation Notes

1. **Task Dependencies**:

   - Phase 1 (Setup) must complete before Phase 2 (Foundation)
   - Phase 2 (Foundation) must complete before Phase 3, 4, 5 (User Stories)
   - Phase 3 (US1), Phase 4 (US2), Phase 5 (US3) can be implemented independently after Foundation
   - Phase 6 (Polish) should be done after all user stories

2. **Parallelization Strategy**:

   - Tasks marked [P] can be worked on in parallel if dependencies are met
   - Example: T005, T006 (sound methods) can be done simultaneously
   - Example: T011, T012 (store actions) can be done simultaneously after T008-T010

3. **Testing Approach**:

   - No automated tests requested in spec
   - Manual testing scenarios provided in quickstart.md
   - Validate each phase before moving to next
   - Use browser DevTools for IndexedDB verification

4. **MVP Delivery**:

   - Focus on US1 tasks first (cross-quadrant drag)
   - US2 (in-quadrant reorder) is P2 - defer if needed
   - US3 (mobile touch) is P1 but can be validated after US1 works on desktop

5. **Sound File Placeholder**:
   - Tasks use placeholder MP3 files initially
   - T051 replaces them with actual audio assets
   - Beep fallback ensures functionality without files

---

## Completion Checklist

Before marking feature as complete:

- [ ] All 58 tasks checked off
- [ ] Constitution principles verified (all 7)
- [ ] All functional requirements met (FR-001 to FR-015)
- [ ] All success criteria validated (SC-001 to SC-010)
- [ ] No regressions in existing features
- [ ] Works on desktop and mobile browsers
- [ ] Reduced-motion support confirmed
- [ ] Sound effects integrated and toggleable
- [ ] IndexedDB persistence verified
- [ ] Code follows Clean Code principles (Principle VII)
