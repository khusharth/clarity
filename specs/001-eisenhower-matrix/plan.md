# Implementation Plan: Clarity: Eisenhower TODO Matrix

**Branch**: `001-eisenhower-matrix` | **Date**: 2025-11-02 | **Spec**: `/Users/khusharth/home/projects/clarity/specs/001-eisenhower-matrix/spec.md`
**Input**: Feature specification from `/specs/001-eisenhower-matrix/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Minimal, delightful, local-first TODO app using the Eisenhower Matrix. Primary flows: view by quadrant, add with two answers (urgent/important), focus mode (Q1), complete with confetti, and a Completed view. Storage is local (IndexedDB via Dexie with dexie-react-hooks; fallback to localStorage). Styling uses Tailwind CSS 4 with `@theme` tokens; animations via Framer Motion; optional UI primitives via shadcn if needed; lightweight global state with Zustand if required. For icons use Lucide icons.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x; Next.js 16 (App Router); React 19  
**Primary Dependencies**: Tailwind CSS 4 (`@theme`), Framer Motion 12, date-fns, Zustand (if needed), shadcn/ui (if needed)  
**Storage**: IndexedDB via Dexie + dexie-react-hooks; fallback to localStorage for MVP  
**Testing**: Not required for MVP (per request)  
**Target Platform**: Web (modern desktop/mobile browsers)  
**Project Type**: web  
**Performance Goals**: Interactions p95 < 100ms; 60fps animations; initial load p95 < 1s  
**Constraints**: Local-first, offline-capable; no backend/auth; accessible (WCAG AA), responsive; respect reduced motion  
**Scale/Scope**: Single-user local data; small task lists (<5k tasks)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Derived from `.specify/memory/constitution.md` (Clarity):

- Clarity over Complexity: Only essential interactions; Eisenhower Matrix visible by default.
- Delight in Motion: 150–250ms micro‑animations; 60fps; global reduced‑motion toggle.
- Calm Design: Neutral palette; WCAG AA contrast; non‑alarming error patterns, Responsive.
- Local‑First: No network calls in core flows; local persistence; import/export JSON.
- Fun Focus: Gamification optional (confetti/sound/streaks) with clear toggles.

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

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
app/
├── page.tsx                     # Matrix 2×2 default view
├── completed/page.tsx           # Completed tasks view
├── components/
│   ├── Matrix.tsx               # Layout and quadrant grid
│   ├── Quadrant.tsx             # Quadrant container (Q1..Q4)
│   ├── TodoCard.tsx             # Individual task card
│   ├── AddTodoModal.tsx         # Modal for adding tasks
│   ├── FocusControls.tsx        # Focus mode toggle + next controls
│   └── EmptyState.tsx           # Calm empty-state component
├── store/
│   └── todos.ts                 # Zustand store (tasks, prefs)
├── lib/
│   ├── db.ts                    # Dexie DB setup + migrations
│   ├── persistence.ts           # Fallback to localStorage
│   ├── schema.ts                # Task/Preferences schemas
│   └── dates.ts                 # date-fns helpers
├── hooks/
│   └── useReducedMotion.ts      # Prefers-reduced-motion + app toggle
└── styles/
    └── theme.css                # Tailwind @theme tokens (colors, radius)

public/
└── assets/                      # Optional icons/illustrations
```

**Structure Decision**: Single Next.js app using App Router in `app/`. Local-first (no backend). Dexie for IndexedDB with `dexie-react-hooks`; fallback to localStorage.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
