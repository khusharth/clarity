---
description: "Task list for Task Count Display feature implementation"
---

# Tasks: Task Count Display

**Input**: Design documents from `/specs/003-task-count-display/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not requested in specification - manual testing only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

> Project advisory (Clarity): Local‑first, no backend/auth/database. Replace backend examples
> with tasks for offline persistence (IndexedDB/localStorage), motion/gamification toggles,
> accessibility checks (keyboard, contrast, reduced motion), and JSON import/export.
> Before creating components, check `app/components/` for existing ones. Build new UI
> components in `app/components/ui/` using Radix UI primitives via shadcn patterns.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `app/`, repository root
- Paths reference Next.js App Router structure
- Components in `app/components/`
- Store in `app/store/`
- Types in `app/lib/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing infrastructure needed for this feature

- [x] T001 Verify Zustand store structure in app/store/todos.ts
- [x] T002 Verify existing Toggle component in app/components/ui/toggle.tsx
- [x] T003 Verify lucide-react Hash icon is available (import test)
- [x] T004 Review existing Settings component structure in app/components/Settings.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 [P] Extend TodosState interface with showOverallCount and showQuadrantCounts in app/store/todos.ts
- [x] T006 [P] Implement store actions setShowOverallCount and setShowQuadrantCounts in app/store/todos.ts
- [x] T007 [P] Create reusable TaskCountBadge component in app/components/TaskCountBadge.tsx
- [x] T008 Verify store defaults (showOverallCount: false, showQuadrantCounts: false) persist correctly

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Configure Task Count Visibility (Priority: P1) 🎯 MVP

**Goal**: Users can toggle count visibility settings in Settings modal

**Independent Test**: Navigate to Settings, toggle "Show Overall Total" and "Show Per-Quadrant Totals", verify toggles work and preferences persist after page reload

### Implementation for User Story 1

- [x] T009 [US1] Add "Tasks" section header in Settings modal in app/components/Settings.tsx
- [x] T010 [US1] Add divider between General and Tasks sections in app/components/Settings.tsx
- [x] T011 [US1] Add "Show Overall Total" toggle to Tasks section in app/components/Settings.tsx
- [x] T012 [US1] Add "Show Per-Quadrant Totals" toggle to Tasks section in app/components/Settings.tsx
- [x] T013 [US1] Connect toggles to store actions (setShowOverallCount, setShowQuadrantCounts) in app/components/Settings.tsx
- [x] T014 [US1] Verify both toggles default to OFF state when Settings opens
- [x] T015 [US1] Test toggle state persistence (enable toggles, refresh page, verify state retained)
- [x] T016 [US1] Test accessibility: keyboard navigation (Tab, Space) through new toggles
- [x] T017 [US1] Verify Settings modal layout remains clean with new Tasks section on mobile (320px width)

**US1 Acceptance Criteria**:

- ✅ Settings has two sections: General and Tasks (with visual divider)
- ✅ Tasks section shows two toggles: "Show Overall Total" and "Show Per-Quadrant Totals"
- ✅ Both toggles default to OFF
- ✅ Toggle states persist across page refreshes
- ✅ Keyboard accessible (Tab to focus, Space to toggle)

---

## Phase 4: User Story 2 - View Overall Task Count (Priority: P2)

**Goal**: Display overall task count in header when enabled, with focus mode awareness

**Independent Test**: Enable "Show Overall Total", add/delete tasks across quadrants, verify count updates immediately and shows correct total. Enter focus mode, verify count switches to Q1 only.

### Implementation for User Story 2

- [x] T018 [P] [US2] Create OverallTaskCount component in app/components/OverallTaskCount.tsx
- [x] T019 [US2] Implement useMemo to compute overall count (all active tasks) in app/components/OverallTaskCount.tsx
- [x] T020 [US2] Implement useMemo to compute Q1 count (urgent + important active tasks) in app/components/OverallTaskCount.tsx
- [x] T021 [US2] Add conditional logic: show Q1 count when isFocus=true, otherwise overall in app/components/OverallTaskCount.tsx
- [x] T022 [US2] Return null when showOverallCount is false in app/components/OverallTaskCount.tsx
- [x] T023 [US2] Render TaskCountBadge with computed count and appropriate label in app/components/OverallTaskCount.tsx
- [x] T024 [US2] Modify FocusControls layout to use justify-between in app/components/FocusControls.tsx
- [x] T025 [US2] Add OverallTaskCount component to right side of FocusControls in app/components/FocusControls.tsx
- [x] T026 [US2] Test: Enable overall count, add task to Q1, verify count increments
- [x] T027 [US2] Test: Complete task, verify count decrements immediately
- [x] T028 [US2] Test: Move task between quadrants, verify overall count remains same
- [x] T029 [US2] Test: Zero tasks scenario - verify displays "0" (not hidden)
- [x] T030 [US2] Test: Enter focus mode with overall count enabled, verify shows Q1 count only
- [x] T031 [US2] Test: Exit focus mode, verify count returns to overall total
- [x] T032 [US2] Test: Responsive layout - verify count fits on 320px mobile width
- [x] T033 [US2] Test: Dark mode - verify count badge uses correct theme colors

**US2 Acceptance Criteria**:

- ✅ Overall count appears in top right of header (same row as Focus toggle)
- ✅ Count updates within 100ms of task changes (add/complete/delete)
- ✅ Count displays "0" when no tasks (not hidden)
- ✅ In focus mode, shows Q1 count instead of overall
- ✅ Exits focus mode returns to overall count display
- ✅ Readable on mobile (320px) and desktop (2560px)

---

## Phase 5: User Story 3 - View Per-Quadrant Task Counts (Priority: P2)

**Goal**: Display count badge in each quadrant header showing tasks in that quadrant

**Independent Test**: Enable "Show Per-Quadrant Totals", distribute tasks across quadrants, verify each shows correct count. Move task from Q1 to Q3, verify Q1 decrements and Q3 increments.

### Implementation for User Story 3

- [x] T034 [P] [US3] Add quadrantId prop to Quadrant component interface in app/components/Quadrant.tsx
- [x] T035 [P] [US3] Add tasks prop to Quadrant component interface in app/components/Quadrant.tsx
- [x] T036 [US3] Read showQuadrantCounts and isFocus from store in app/components/Quadrant.tsx
- [x] T037 [US3] Implement useMemo to compute count for this quadrant based on quadrantId in app/components/Quadrant.tsx
- [x] T038 [US3] Add conditional logic: hide all per-quadrant counts in focus mode in app/components/Quadrant.tsx
- [x] T039 [US3] Modify header to use justify-between layout in app/components/Quadrant.tsx
- [x] T040 [US3] Render TaskCountBadge in header right side when shouldShowCount is true in app/components/Quadrant.tsx
- [x] T041 [US3] Update Q1 Quadrant usage in page to pass quadrantId="q1" and tasks array in app/page.tsx
- [x] T042 [US3] Update Q2 Quadrant usage in page to pass quadrantId="q2" and tasks array in app/page.tsx
- [x] T043 [US3] Update Q3 Quadrant usage in page to pass quadrantId="q3" and tasks array in app/page.tsx
- [x] T044 [US3] Update Q4 Quadrant usage in page to pass quadrantId="q4" and tasks array in app/page.tsx
- [x] T045 [US3] Test: Enable per-quadrant counts, verify all 4 quadrants show counts
- [x] T046 [US3] Test: Add task to Q2, verify only Q2 count increments
- [x] T047 [US3] Test: Move task Q1 to Q3, verify Q1 decrements and Q3 increments
- [x] T048 [US3] Test: Complete task in Q4, verify Q4 count decrements
- [x] T049 [US3] Test: Empty quadrant displays "0" (not hidden)
- [x] T050 [US3] Test: Responsive - verify counts don't break quadrant layout on mobile

**US3 Acceptance Criteria**:

- ✅ Each quadrant header shows count badge on right side
- ✅ Counts accurately reflect tasks in each quadrant
- ✅ Moving task between quadrants updates both counts immediately
- ✅ Empty quadrants show "0" count
- ✅ Counts remain readable and don't break layout on mobile

---

## Phase 6: User Story 4 - Focus Mode Task Count Behavior (Priority: P3)

**Goal**: Ensure counts adapt correctly when entering/exiting focus mode

**Independent Test**: Enable both count types, enter focus mode, verify only Q1 count visible. Exit focus mode, verify all counts return per settings.

### Implementation for User Story 4

- [x] T051 [P] [US4] Verify OverallTaskCount switches to Q1 count when isFocus is true (implementation already in T021)
- [x] T052 [P] [US4] Verify Quadrant hides all per-quadrant counts when isFocus is true (implementation already in T038)
- [x] T053 [US4] Test: Enable overall count, enter focus mode, verify header shows Q1 count only
- [x] T054 [US4] Test: Enable per-quadrant counts, enter focus mode, verify no per-quadrant counts visible
- [x] T055 [US4] Test: Both counts enabled, enter focus mode, verify only overall count visible (showing Q1, no per-quadrant badges)
- [x] T056 [US4] Test: In focus mode with counts, add task to Q1, verify count increments
- [x] T057 [US4] Test: Exit focus mode, verify overall count returns to total (not Q1)
- [x] T058 [US4] Test: Exit focus mode, verify all per-quadrant counts reappear (if enabled)
- [x] T059 [US4] Test: Toggle focus mode multiple times, verify counts consistently update

**US4 Acceptance Criteria**:

- ✅ Focus mode shows only Q1-relevant counts (not overall across all quadrants)
- ✅ Q2, Q3, Q4 quadrant counts hidden in focus mode
- ✅ Overall count in header switches to "Q1 Tasks" label in focus mode
- ✅ Exiting focus mode restores counts according to settings
- ✅ Toggling focus on/off multiple times works consistently

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, edge cases, and comprehensive testing

- [x] T060 [P] Verify aria-labels on all count displays for screen reader accessibility
- [x] T061 [P] Test: Count badge color contrast meets WCAG AA in both light and dark themes
- [x] T062 Test: Rapid task operations (add 10 tasks quickly), verify counts update correctly
- [x] T063 Test: Complete all tasks, verify all counts show "0" simultaneously
- [x] T064 Test: Both toggles ON + both OFF combinations, verify correct visibility
- [x] T065 Test: Page load performance - verify count computation doesn't delay render
- [x] T066 Test: DevTools Performance tab - verify count updates complete in <100ms
- [x] T067 Test: Browser back/forward navigation preserves toggle states
- [x] T068 Test: Multiple browser tabs, change setting in one, refresh other, verify persistence
- [x] T069 Visual review: Verify count badges follow "Calm Design" principle (subtle, non-intrusive)
- [x] T070 Visual review: Verify Hash icon renders correctly at 14px size
- [x] T071 Verify no TypeScript errors in modified files (run tsc --noEmit)
- [x] T072 Verify no ESLint warnings in new/modified files (run pnpm lint)
- [x] T073 Final constitution check: Verify all 6 principles satisfied

---

## Dependencies & Execution Order

### Story Completion Order

**Must complete in this order**:

1. **Phase 1 (Setup)** + **Phase 2 (Foundational)** - BLOCKING for all user stories
2. **User Story 1 (P1)** - Settings infrastructure enables all other stories
3. **User Story 2 (P2) + User Story 3 (P2)** - CAN RUN IN PARALLEL after US1
4. **User Story 4 (P3)** - Depends on US2 and US3 being complete
5. **Phase 7 (Polish)** - Final integration testing

### Dependency Graph

```
Phase 1 (Setup) ──────┐
                      ├──> Phase 2 (Foundational) ──> US1 (P1) ──┬──> US2 (P2) ──┐
                      │                                           │               ├──> US4 (P3) ──> Polish
                      │                                           └──> US3 (P2) ──┘
```

### Parallel Execution Opportunities

**Phase 2 (Foundational)**: T005, T006, T007 can run in parallel (different aspects)

**User Story 2 + 3**: Can implement US2 and US3 in parallel after US1 complete

- US2 tasks: T018-T033 (OverallTaskCount component + integration)
- US3 tasks: T034-T050 (Quadrant modifications + per-quadrant counts)

**Polish Phase**: T060, T061 (accessibility checks) can run parallel with other polish tasks

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Recommended MVP**: User Story 1 ONLY

- **Rationale**: Delivers settings infrastructure, validates store extension, enables user control
- **Deliverable**: Settings with two new toggles that persist preferences
- **Value**: Users can configure feature (even if counts aren't displayed yet)
- **Validation**: Toggle states persist, keyboard accessible, mobile responsive

**Extended MVP**: User Story 1 + User Story 2

- **Rationale**: Adds visible value (overall count display)
- **Deliverable**: Settings + overall count in header
- **Value**: Users see immediate benefit (workload awareness at a glance)

### Incremental Delivery

**Sprint 1** (MVP):

- Phase 1: Setup (verify existing infrastructure)
- Phase 2: Foundational (store extensions, TaskCountBadge)
- User Story 1: Settings with toggles (P1)

**Sprint 2** (Core Features):

- User Story 2: Overall task count display (P2)
- User Story 3: Per-quadrant counts (P2)

**Sprint 3** (Enhancement + Polish):

- User Story 4: Focus mode adaptation (P3)
- Phase 7: Polish, edge cases, comprehensive testing

### Task Estimation

- **Total Tasks**: 73 tasks
- **Setup + Foundational**: 8 tasks (~1 hour)
- **User Story 1**: 9 tasks (~1 hour)
- **User Story 2**: 16 tasks (~1.5 hours)
- **User Story 3**: 17 tasks (~1.5 hours)
- **User Story 4**: 9 tasks (~30 minutes)
- **Polish**: 14 tasks (~1 hour)

**Total Estimated Time**: ~6.5 hours (experienced developer), ~8-10 hours (first-time contributor)

---

## Validation Checklist

Before marking feature complete, verify:

- [ ] All 73 tasks marked as complete
- [ ] All 4 user stories independently testable and working
- [ ] Settings has General and Tasks sections
- [ ] Both toggles default to OFF
- [ ] Overall count appears in header when enabled
- [ ] Per-quadrant counts appear in headers when enabled
- [ ] Focus mode shows Q1-only counts
- [ ] Zero counts display "0" (not hidden)
- [ ] Counts update in <100ms
- [ ] Responsive on 320px-2560px screens
- [ ] WCAG AA contrast in light and dark modes
- [ ] Keyboard accessible (Tab, Space navigation)
- [ ] Screen reader announces counts with context
- [ ] Preferences persist across page refreshes
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Constitution principles all satisfied

---

## Notes for Implementation

### Component Reuse (Constitution Principle VI)

- ✅ **Reuse**: Toggle component (already exists in `app/components/ui/toggle.tsx`)
- ✅ **Reuse**: Select component (for Theme dropdown in Settings)
- ✅ **Reuse**: Modal component (Settings already uses this)
- ✅ **Reuse**: Hash icon from lucide-react (already dependency)
- 🆕 **New**: TaskCountBadge (reusable badge component following existing patterns)
- 🆕 **New**: OverallTaskCount (specialized component for header)

### Performance Optimization

- Use `useMemo` for count computations (prevents recalc on unrelated state changes)
- Subscribe only to needed store slices (not entire store)
- Keep component tree shallow (no unnecessary nesting)

### Accessibility

- All count displays have `aria-label` with context
- Toggle components handle keyboard navigation (Tab, Space, Enter)
- Color contrast verified in both themes
- Screen reader friendly labels (e.g., "Total task count: 5")

### Testing Approach

**Manual Testing** (no automated tests per project scope):

1. **Functional**: Each acceptance scenario from spec.md
2. **Visual**: Light/dark themes, responsive breakpoints
3. **Performance**: DevTools Performance tab for <100ms updates
4. **Accessibility**: Keyboard navigation, screen reader (if available)
5. **Edge Cases**: Zero counts, rapid operations, focus mode toggling

### Potential Issues & Mitigations

**Issue**: Layout shift on small mobile screens when counts appear/disappear  
**Mitigation**: Test responsive layout early (T017, T032, T050), use fixed-width containers if needed

**Issue**: Count computation performance with large task lists  
**Mitigation**: useMemo optimization (already in design), profile with 100+ tasks (T065, T066)

**Issue**: Focus mode interaction confusion  
**Mitigation**: Clear labeling ("Q1 Tasks" vs "Total Tasks"), comprehensive testing (T053-T059)

---

## Success Metrics

From spec.md Success Criteria (SC-001 through SC-006):

- **SC-001**: Settings toggle in <10 seconds ✅ (measure during US1 testing)
- **SC-002**: Count updates <100ms ✅ (measure with DevTools in T066)
- **SC-003**: Readable 320px-2560px ✅ (test in T017, T032, T050)
- **SC-004**: Identify busiest quadrant at glance ✅ (visual review in T069)
- **SC-005**: Focus mode minimalism ✅ (verify in US4 tests T053-T059)
- **SC-006**: 90% improved awareness ✅ (user feedback post-release)

---

**Ready for implementation!** Start with Phase 1 (Setup) and proceed through user stories in priority order.
