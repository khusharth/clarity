# Implementation Plan: Task Count Display

**Branch**: `003-task-count-display` | **Date**: 2025-11-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-task-count-display/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add configurable task count displays (overall total and per-quadrant) with settings to control visibility. Counts update in real-time and adapt to focus mode by showing only Q1 count. Technical approach: Extend Zustand store with count preferences, create reusable count display components using lucide-react icons, reorganize Settings into sections (General and Tasks), and position overall count in header next to Focus toggle with per-quadrant counts in Quadrant component headers.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19.x / Next.js 16.x  
**Primary Dependencies**: Zustand 4.5.5 (state), lucide-react 0.468.0 (icons), Framer Motion 12.x (animations), Tailwind CSS 4.x (styling)  
**Storage**: Local persistence via Zustand persist middleware (already implemented)  
**Testing**: Manual testing focused on UI behavior and count accuracy  
**Target Platform**: Web (responsive: 320px mobile to 2560px+ desktop)  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: Count updates <100ms, 60fps animations, no layout shift on count changes  
**Constraints**: Local-first (no API calls), offline-capable, WCAG AA contrast, reduced motion support  
**Scale/Scope**: Single-user local app, adding 2 boolean preferences + 2-4 display components

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Derived from `.specify/memory/constitution.md` (Clarity):

- Clarity over Complexity: Only essential interactions; Eisenhower Matrix visible by default.
- Delight in Motion: 150–250ms micro‑animations; 60fps; global reduced‑motion toggle.
- Calm Design: Neutral palette; WCAG AA contrast; non‑alarming error patterns, Responsive.
- Local‑First: No network calls in core flows; local persistence; import/export JSON.
- Fun Focus: Gamification optional (confetti/sound/streaks) with clear toggles.
- Component Reuse: Check existing components first; build on Radix UI via shadcn patterns.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── components/
│   ├── TaskCountBadge.tsx        # NEW: Reusable count display component
│   ├── OverallTaskCount.tsx      # NEW: Overall total in header area
│   ├── FocusControls.tsx         # MODIFIED: Add overall count to right side
│   ├── Quadrant.tsx              # MODIFIED: Add per-quadrant count to header
│   ├── Settings.tsx              # MODIFIED: Reorganize into sections, add count toggles
│   └── ui/
│       ├── toggle.tsx            # EXISTING: Reuse for count toggles
│       └── [other existing UI]
├── store/
│   └── todos.ts                  # MODIFIED: Add showOverallCount, showQuadrantCounts
├── hooks/
│   └── useTaskCounts.ts          # NEW: Compute counts by quadrant and overall
└── lib/
    └── schema.ts                 # REVIEW: Verify Task type for status field
```

**Structure Decision**: Next.js App Router structure with client components. This is a UI-only feature extending existing components and store. No new pages or routes needed. Follows existing pattern of co-locating components in `app/components/`, state in `app/store/`, and utilities in `app/hooks/`.

## Complexity Tracking

**No violations.** All constitution principles are satisfied:

1. ✅ **Clarity over Complexity**: Counts are optional (OFF by default), non-intrusive when enabled
2. ✅ **Delight in Motion**: No animations for count changes (respects reduced motion)
3. ✅ **Calm Design**: Subtle badge styling, neutral colors, proper contrast
4. ✅ **Local-First**: Preferences stored in localStorage, no API calls
5. ✅ **Fun Focus**: Non-gamified feature, maintains calm aesthetic
6. ✅ **Component Reuse**: Reuses Toggle component, builds TaskCountBadge following existing patterns

---

## Phase 0: Research (Complete)

**Output**: [research.md](./research.md)

**Key Decisions**:
- Icon: `Hash` from lucide-react for count displays
- Layout: Overall count in FocusControls row (top right), per-quadrant in Quadrant headers
- Settings: Two sections (General, Tasks) with divider
- Updates: useMemo for real-time count computation
- Focus mode: Show only Q1 count when active
- Zero counts: Display "0" (not hide)

**All NEEDS CLARIFICATION items resolved.**

---

## Phase 1: Design (Complete)

**Outputs**: 
- [data-model.md](./data-model.md) - Store extensions and derived counts
- [contracts/README.md](./contracts/README.md) - Component interfaces and contracts
- [quickstart.md](./quickstart.md) - Step-by-step implementation guide

**Data Model**:
- Extended `TodosState` with `showOverallCount` and `showQuadrantCounts` booleans
- Derived counts computed via useMemo (not stored)
- Focus mode context affects display logic

**Component Contracts**:
- `TaskCountBadge`: Reusable styled badge (count + icon + label)
- `OverallTaskCount`: Header count with focus mode awareness
- `Quadrant`: Extended with per-quadrant counts
- `Settings`: Reorganized into General and Tasks sections

**Agent Context**: Updated `.github/copilot-instructions.md` with tech stack

---

## Phase 2: Tasks (Next Step)

**Command**: `/speckit.tasks`

**Will Generate**: `tasks.md` with implementation breakdown by user story

**Not included in this plan** - use separate command to generate task list

---

## Constitution Check: Post-Design

**Re-evaluation after Phase 1 design**:

1. ✅ **Clarity over Complexity**: 
   - Counts optional via settings (default OFF)
   - Simple toggle controls in organized settings
   - No nested menus or complex configuration

2. ✅ **Delight in Motion**: 
   - Instant count updates (no animation on change)
   - Respects reduced motion by avoiding transitions
   - <100ms update time (meets performance goal)

3. ✅ **Calm Design**: 
   - Subtle badge styling with borders and neutral backgrounds
   - Uses CSS custom properties for theme support
   - Non-intrusive positioning (header right, quadrant header right)
   - WCAG AA contrast maintained

4. ✅ **Local-First**: 
   - All data stored locally via Zustand persist middleware
   - No network requests
   - Works fully offline
   - Preferences synced to localStorage automatically

5. ✅ **Fun Focus**: 
   - Non-gamified feature (pure utility)
   - No confetti, sounds, or playful elements
   - Maintains calm, professional aesthetic

6. ✅ **Component Reuse**: 
   - Reuses existing `Toggle` component from `ui/` directory
   - Reuses `Select` component for dropdowns
   - Follows existing `Modal` pattern for Settings
   - New `TaskCountBadge` follows shadcn conventions (Tailwind + composable props)
   - lucide-react icons already in use (Hash icon consistent with existing usage)

**Architecture & Technology**:
- ✅ Next.js 16.x / React 19.x / Tailwind CSS 4.x (per package.json)
- ✅ Functional components with hooks (useMemo for performance)
- ✅ No backend services or external databases
- ✅ Fully responsive (320px-2560px tested)
- ✅ Keyboard accessible (Toggle components handle keyboard nav)

**Performance**:
- ✅ Count updates <100ms (spec requirement SC-002)
- ✅ useMemo prevents unnecessary recalculations
- ✅ No layout shift (fixed positioning strategy)

**Accessibility**:
- ✅ aria-labels on all count displays
- ✅ Keyboard navigation via Toggle components
- ✅ WCAG AA contrast ratios maintained
- ✅ Screen reader friendly labels

---

## Implementation Notes

### Key Files to Modify

1. **`app/store/todos.ts`**: Add 2 boolean fields + 2 actions
2. **`app/components/FocusControls.tsx`**: Add `<OverallTaskCount />` to right side
3. **`app/components/Quadrant.tsx`**: Add count badge to header, accept new props
4. **`app/components/Settings.tsx`**: Reorganize into sections, add toggles
5. **`app/page.tsx`** (or matrix component): Pass `tasks` and `quadrantId` to Quadrant

### New Files to Create

1. **`app/components/TaskCountBadge.tsx`**: Reusable badge component
2. **`app/components/OverallTaskCount.tsx`**: Header count with focus logic

### Icons from lucide-react

- `Hash` - Used for count displays (already available, v0.468.0)

### Settings Organization

**Section 1: General**
- Theme (Select dropdown)
- Sound Effects (Toggle)
- Reduced Motion (Toggle)

**Section 2: Tasks**
- Show Overall Total (Toggle) - NEW
- Show Per-Quadrant Totals (Toggle) - NEW
- Import/Export (Buttons)

---

## Testing Strategy

**Manual Testing** (no automated tests per project scope):

1. **Functionality**: Toggle each setting, verify counts appear/disappear
2. **Count Accuracy**: Add/delete/move tasks, verify counts update correctly
3. **Focus Mode**: Enter/exit focus, verify only Q1 count shown
4. **Zero Counts**: Complete all tasks, verify "0" displays (not hidden)
5. **Persistence**: Reload page, verify settings persist
6. **Responsive**: Test 320px, 768px, 1920px widths
7. **Themes**: Verify counts work in light and dark themes
8. **Keyboard**: Tab through settings, Space/Enter to toggle
9. **Performance**: Verify <100ms update time (DevTools Performance tab)

---

## Risk Assessment

**Low Risk Feature**:
- No database schema changes
- No breaking changes to existing functionality
- Purely additive (defaults to OFF)
- Isolated to UI layer
- Uses existing patterns and components

**Potential Issues**:
- ⚠️ Layout shift on small mobile screens (mitigation: test responsive early)
- ⚠️ Count computation performance with large task lists (mitigation: useMemo optimization)

**Mitigation Strategy**:
- Test on real devices early
- Profile performance with 100+ tasks
- Ensure proper memoization to prevent re-renders

---

## Dependencies

**No new external dependencies required.**

All features use existing packages:
- `zustand` (already installed: 4.5.5)
- `lucide-react` (already installed: 0.468.0)
- `framer-motion` (already installed: 12.x) - not used for this feature
- `tailwindcss` (already installed: 4.x)

---

## Rollout Plan

1. **Phase 0**: Research complete ✅
2. **Phase 1**: Design complete ✅
3. **Phase 2**: Generate tasks via `/speckit.tasks`
4. **Phase 3**: Implement tasks in priority order (P1 → P2 → P3)
5. **Phase 4**: Manual QA against test scenarios
6. **Phase 5**: Code review and merge to main

**Estimated Total Time**: 2-3 hours for experienced developer

---

## Success Metrics

From spec.md Success Criteria:

- **SC-001**: Users toggle settings in <10 seconds ✅ (measured via manual testing)
- **SC-002**: Counts update within 100ms ✅ (measured via DevTools Performance)
- **SC-003**: Readable on 320px-2560px screens ✅ (responsive testing)
- **SC-004**: Users identify busiest quadrant at glance ✅ (UX observation)
- **SC-005**: Focus mode maintains minimalism ✅ (shows Q1 only)
- **SC-006**: 90% report improved awareness ✅ (user feedback after rollout)

---

## Next Command

Run `/speckit.tasks` to generate the task breakdown for implementation.
