# Tasks: Clarity: Eisenhower TODO Matrix

**Input**: Design documents from `/specs/001-eisenhower-matrix/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Not required for MVP per spec and plan.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize local-first app foundation and styling/theme

- [x] T001 Add Tailwind `@theme` tokens in app/styles/theme.css
- [x] T002 Import theme.css in app/layout.tsx and verify tokens apply
- [x] T003 Add deps in package.json: dexie, dexie-react-hooks, framer-motion, date-fns, zustand, lucide-react
- [x] T004 Create app/lib/schema.ts with Task and Preferences types
- [x] T005 Create app/lib/db.ts with Dexie setup (tasks table: id, createdAt, status indexes)
- [x] T006 Create app/lib/persistence.ts with localStorage fallback (enable/disable via check)
- [x] T007 [P] Create app/hooks/useReducedMotion.ts (system + app toggle support)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core state and shared UI building blocks

- [ ] T008 Create app/store/todos.ts Zustand store (add, update, toggle urgent/important, complete, delete, import/export)
- [ ] T009 [P] Add app/components/EmptyState.tsx (calm copy)
- [ ] T010 [P] Add app/components/Quadrant.tsx (header, container, empty state slot)
- [ ] T011 [P] Add app/components/TodoCard.tsx (text, urgent/important toggles, complete, delete)
- [ ] T012 [P] Add framer-motion variants util for entry/move/exit animations
- [x] T008 Create app/store/todos.ts Zustand store (add, update, toggle urgent/important, complete, delete, import/export)
- [x] T009 [P] Add app/components/EmptyState.tsx (calm copy)
- [x] T010 [P] Add app/components/Quadrant.tsx (header, container, empty state slot)
- [x] T011 [P] Add app/components/TodoCard.tsx (text, urgent/important toggles, complete, delete)
- [x] T012 [P] Add framer-motion variants util for entry/move/exit animations

**Checkpoint**: Store + base components ready; user story work can begin

---

## Phase 3: User Story 1 - View and organize tasks in Matrix (P1) 🎯 MVP

**Goal**: Show tasks in Q1–Q4 by urgency/importance; smooth entry/move

**Independent Test**: With no tasks → see four quadrants. Add tasks and verify placement and movement.

### Implementation for User Story 1

- [ ] T013 [US1] Compose matrix grid in app/components/Matrix.tsx (uses Quadrant)
- [ ] T014 [US1] Render Matrix on app/page.tsx with selectors for Q1..Q4 (sort by createdAt desc)
- [ ] T015 [P] [US1] Wire TodoCard controls to update urgency/importance with motion transitions
- [ ] T016 [P] [US1] Ensure reduced-motion disables heavy animations

- [ ] T032 [P] [US1] Add inline text edit in app/components/TodoCard.tsx and update app/store/todos.ts

**Checkpoint**: Matrix view functional, tasks placed and move correctly

---

## Phase 4: User Story 2 - Focus Mode for Q1 (P2)

**Goal**: Q1 full-screen view with toggle between all-tasks and one-at-a-time

**Independent Test**: Enter/exit Focus Mode with at least one Q1 task; animations smooth

### Implementation for User Story 2

- [ ] T017 [US2] Add app/components/FocusControls.tsx (enter/exit, mode toggle, Next)
- [ ] T018 [US2] Focus state in store (isFocus, focusMode: all|single, activeTaskId?)
- [ ] T019 [US2] Animate page transition to focus and back (framer-motion)

**Checkpoint**: Focus Mode implemented per FR-012

---

## Phase 5: User Story 3 - Add task with minimal input (P3)

**Goal**: Modal to add task text + two answers (urgent, important)

**Independent Test**: Open modal, add task, task appears in correct quadrant

### Implementation for User Story 3

- [ ] T020 [US3] Add app/components/AddTodoModal.tsx (text input, urgent/important toggles)
- [ ] T021 [US3] Show modal from app/page.tsx (button + keyboard shortcut)
- [ ] T022 [P] [US3] Submit → create task in store + Dexie; entry animation

Optional (only if needed):

- [ ] T023 [P] [US3] Integrate shadcn/ui Dialog for modal primitives

**Checkpoint**: Add flow functional and minimal

---

## Phase 6: User Story 4 - Complete tasks with joy (P3)

**Goal**: Mark complete with confetti; Completed view for deletion

**Independent Test**: Complete a task, verify removal and appearance in Completed; delete from Completed

### Implementation for User Story 4

- [ ] T024 [US4] Add confetti effect on complete (respect reduced-motion)
- [ ] T025 [US4] Add Completed view at app/completed/page.tsx (list by completedAt desc)
- [ ] T026 [US4] Delete completed task with gentle confirmation

- [ ] T033 [US4] Create app/lib/dates.ts and format completedAt in app/completed/page.tsx

**Checkpoint**: Completion and management of completed tasks done

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Final touches consistent with constitution

- [ ] T027 [P] Keyboard navigation for add, confirm/cancel, change quadrant, complete, delete
- [ ] T028 [P] Responsive layout checks for mobile/desktop
- [ ] T029 [P] Accessibility pass (labels, focus states, contrast)
- [ ] T030 [P] Settings toggles (reduced-motion, sound) wiring in store
- [ ] T031 [P] Import/Export JSON actions (settings)

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): none
- Foundational (Phase 2): depends on Setup completion – BLOCKS all stories
- User Stories (Phases 3–6): depend on Foundational completion
- Polish (Final): depends on desired user stories being complete

### User Story Dependencies

- User Story 1 (P1): can start after Foundational
- User Story 2 (P2): can start after Foundational; independent of US1 content
- User Story 3 (P3): can start after Foundational; independent
- User Story 4 (P3): can start after Foundational; independent

### Parallel Opportunities

- [P] tasks can run in parallel (different files)
- Within US1: T015, T016 in parallel after T013–T014
- Within US3: T022 in parallel after T020–T021
- Polish tasks largely parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup
2. Complete Foundational
3. Implement US1 (Matrix view)
4. Validate manually using success criteria

### Incremental Delivery

1. Add US2 (Focus) → Validate
2. Add US3 (Add) → Validate
3. Add US4 (Complete + Completed) → Validate
4. Polish pass
