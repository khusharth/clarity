# Implementation Plan: Task Drag and Drop

**Branch**: `004-task-drag-drop` | **Date**: 2025-11-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-task-drag-drop/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement drag-and-drop functionality for tasks in the Eisenhower Matrix, enabling users to:
1. Move tasks between quadrants to reclassify urgency/importance
2. Reorder tasks within quadrants to set priority
3. Perform drag operations on mobile via touch gestures

Technical approach uses Framer Motion's drag capabilities with custom drop zone detection, local persistence of task ordering via a new `sortOrder` property, and audio/haptic feedback for interaction confirmation. The implementation respects reduced-motion preferences and maintains offline-first architecture.

## Technical Context

**Language/Version**: TypeScript 5.x with React 19.x  
**Primary Dependencies**: 
- Next.js 16.x (app framework)
- Framer Motion 12.x (drag-and-drop animations)
- Zustand 4.5.5 (state management)
- Dexie 4.0.8 (IndexedDB wrapper for persistence)
- use-sound 4.0.1 (audio feedback)
- Tailwind CSS 4.x (styling)

**Storage**: IndexedDB via Dexie for local task persistence  
**Testing**: Manual testing (no automated test suite currently)  
**Target Platform**: Web browsers (desktop + mobile), responsive design  
**Project Type**: Single Next.js web application  
**Performance Goals**: 
- Drag operations feel responsive (<16ms frame time for 60fps)
- Audio feedback <100ms latency
- Animations 150-250ms per constitution

**Constraints**: 
- Offline-capable (no network calls)
- Reduced-motion support required
- Touch gestures must not conflict with scrolling
- Local persistence only

**Scale/Scope**: 
- Single-user application
- Hundreds of tasks per quadrant maximum
- 4 quadrants with independent task lists

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Derived from `.specify/memory/constitution.md` (Clarity):

- Clarity over Complexity: Only essential interactions; Eisenhower Matrix visible by default.
- Delight in Motion: 150–250ms micro‑animations; 60fps; global reduced‑motion toggle.
- Calm Design: Neutral palette; WCAG AA contrast; non‑alarming error patterns, Responsive.
- Local‑First: No network calls in core flows; local persistence; import/export JSON.
- Fun Focus: Gamification optional (confetti/sound/streaks) with clear toggles.
- Component Reuse: Check existing components first; build on Radix UI via shadcn patterns.
- Clean Code: Readable, reusable code; single responsibilities; clear naming; localized changes.

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
│   ├── TodoCard.tsx           # Enhanced with drag handlers
│   ├── Quadrant.tsx           # Enhanced with drop zone logic
│   ├── Matrix.tsx             # Orchestrates drag state
│   └── ui/                    # Existing Radix UI components
├── hooks/
│   ├── useSfx.ts              # Extended with drag/drop sounds
│   ├── useDragAndDrop.ts      # NEW: Drag state management
│   └── useReducedMotion.ts    # Existing accessibility hook
├── lib/
│   ├── schema.ts              # Extended with sortOrder field
│   ├── persistence.ts         # Extended for sortOrder persistence
│   └── dragUtils.ts           # NEW: Drop zone calculations
└── store/
    └── todos.ts               # Extended with reorder actions

public/
└── sounds/
    ├── drag-start.mp3         # NEW: Pick up sound
    └── drag-drop.mp3          # NEW: Drop confirmation sound
```

**Structure Decision**: Single Next.js project with app directory structure. All drag-and-drop logic will be contained within existing component hierarchy, with new utility modules in `lib/` and a custom hook in `hooks/` for drag state management.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
