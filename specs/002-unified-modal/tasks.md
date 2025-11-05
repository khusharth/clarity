# Tasks: Unified Modal Component

## Project Overview

**Feature**: Unified Modal Component (Desktop Dialog + Mobile Bottom Sheet)
**Tech Stack**: Next.js, TypeScript, React, Radix UI, shadcn patterns, Tailwind CSS
**Branch**: `002-unified-modal`

## Task List

### Phase 1: Setup & Research

- [x] T001 Research existing UI primitives in app/components/
- [x] T002 [P] Verify package.json dependencies (@radix-ui/react-dialog, framer-motion, use-sound)
- [x] T003 Document accessibility requirements in specs/002-unified-modal/research.md
- [x] T004 [P] Review existing modal usage in AddTodoModal, EditTodoModal, DeleteTodoModal, Settings

### Phase 2: Foundation (Modal Component)

- [x] T005 Create app/components/ui/Modal.tsx with basic Radix Dialog structure
- [x] T006 [P] Add CSS variables and theme support to Modal component
- [x] T007 Add focus management and keyboard navigation to Modal
- [x] T008 Add responsive bottom-sheet behavior with 120px drag threshold
- [x] T009 [P] Integrate useSfx hook for sound effects in Modal
- [x] T028 [P] Use global animation settings from Settings modal

### Phase 3: User Story 1 - Desktop Dialog [US1]

- [x] T010 [US1] Add desktop dialog layout and positioning
- [x] T011 [US1] Implement title and description rendering
- [x] T012 [US1] [P] Add footer and action button slots
- [x] T013 [US1] Add click-outside-to-close behavior
- [x] T014 [US1] Test desktop dialog accessibility (focus trap, escape)

### Phase 4: User Story 2 - Mobile Bottom Sheet [US2]

- [x] T015 [US2] Add mobile breakpoint detection (640px)
- [x] T016 [US2] Implement bottom sheet layout and positioning
- [x] T017 [US2] Add drag-to-close gesture handling
- [x] T018 [US2] [P] Add sheet transition animations
- [x] T019 [US2] Test mobile sheet behavior and gestures

### Phase 5: User Story 3 - Migration & Integration [US3]

- [x] T020 [US3] [P] Migrate AddTodoModal to use new Modal component
  - Map open/onClose to Modal props
  - Move form content to children
  - Add title="Add Task"
  - Add footer with Cancel/Add buttons
  - Map initialFocusRef to title input
- [x] T021 [US3] [P] Migrate EditTodoModal to use new Modal component
  - Map open/onClose to Modal props
  - Move form content to children
  - Add title="Edit Task"
  - Add footer with Cancel/Save buttons
  - Map initialFocusRef to title input
- [x] T022 [US3] [P] Migrate DeleteTodoModal to use new Modal component
  - Map open/onClose to Modal props
  - Add title="Delete Task"
  - Add description with confirmation text
  - Add footer with Cancel/Delete buttons
  - Set openSfx="delete"
- [x] T023 [US3] Add sound effect triggers in migrated modals
- [x] T029 [US3] [P] Migrate Settings Modal to use new Modal component and Update Settings modal to include animation toggle
  - Add global animation toggle that respects prefers-reduced-motion
  - Wire up toggle to store/persistence
  - Ensure Modal respects global setting

### Phase 6: Polish & Validation

- [x] T024 Run TypeScript type checking (pnpm typecheck)
- [x] T025 [P] Verify dark/light theme parity
- [x] T026 Test reduced-motion support
- [x] T027 Document usage examples in Modal component

## Dependencies & Order

1. Research (T001-T004) must complete first
2. Foundation (T005-T009) depends on Research
3. US1 (T010-T014) depends on Foundation
4. US2 (T015-T019) depends on Foundation
5. US3 (T020-T023) depends on US1 and US2
6. Polish (T024-T027) must run last

## Parallel Execution Opportunities

1. Research Phase:

   - T002 (dependency check) || T004 (modal review)

2. Foundation Phase:

   - T006 (CSS/theme) || T009 (SFX integration)

3. Desktop Dialog (US1):

   - T012 (footer slots) runs parallel to T010-T011

4. Mobile Sheet (US2):

   - T018 (animations) can run parallel to T015-T017

5. Migration (US3):
   - T020, T021, T022 can all run in parallel
   - Each modal migration is independent

## Implementation Strategy

1. MVP (Minimum Viable Product):
   - Research + Foundation + US1 (Desktop Dialog)
   - This enables basic modal functionality
2. Incremental Delivery:
   - Add US2 (Mobile Sheet) after MVP
   - Then US3 (Migration) modal by modal
   - Finally Polish phase

## Progress Tracking

Total Tasks: 27

- Setup & Research: 4 tasks
- Foundation: 5 tasks
- US1 (Desktop): 5 tasks
- US2 (Mobile): 5 tasks
- US3 (Migration): 4 tasks
- Polish: 4 tasks

Parallel Opportunities: 9 tasks marked with [P]
Independent Testing per Story:

- US1: Desktop dialog behavior and accessibility
- US2: Mobile bottom sheet and gestures
- US3: Migrated modals maintain original functionality
