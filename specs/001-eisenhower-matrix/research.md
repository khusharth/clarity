# Research Summary

## Decisions

- Storage: IndexedDB via Dexie + dexie-react-hooks; fallback to localStorage.
  - Rationale: Local-first, offline, robust indexing; hooks simplify subscriptions.
  - Alternatives: raw IndexedDB (verbose), localStorage-only (limits, no indexing).

- Animations: Framer Motion 12.
  - Rationale: Declarative, performant, built-in reduced-motion support.
  - Alternatives: CSS-only (limited), GSAP (heavier).

- Styling: Tailwind CSS 4 with `@theme` tokens.
  - Rationale: Consistent design system; calm palette via tokens.
  - Alternatives: CSS Modules (more boilerplate), inline styles (inflexible).

- State: Zustand (if needed beyond local component state).
  - Rationale: Minimal API, good for small apps; coexists with Dexie.
  - Alternatives: Redux (overkill), Context-only (prop drilling risks).

- UI Primitives: shadcn/ui (only if needed).
  - Rationale: Optional primitives (Dialog) to speed up modal setup.
  - Alternatives: Headless UI (also fine), custom (more code).

- Dates: date-fns for formatting and timestamps.
  - Rationale: Lightweight utilities, tree-shakeable.

## Clarifications Incorporated

- Sorting within quadrants: creation time (newest first).
- Focus Mode: toggle between all Q1 and one-at-a-time.
- Completed retention: kept indefinitely until user deletion.

## Notes

- Tests are out-of-scope for MVP per request; manual checks via Success Criteria.

