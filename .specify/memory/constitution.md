<!--
Sync Impact Report
- Version change: 1.1.0 → 1.2.0
- Modified principles: none
- Added sections: Core Principles VII (Clean Code & Maintainability)
- Removed sections: none
- Templates requiring updates:
  ✅ .specify/templates/plan-template.md (Constitution gates aligned)
  ✅ .specify/templates/tasks-template.md (Clean code and refactoring guidance added)
  ✅ .specify/templates/spec-template.md (no change needed)
  ✅ .specify/templates/agent-file-template.md (no change needed)
- Follow-up TODOs: none
-->

# Clarity Constitution

## Core Principles

### I. Clarity over Complexity

Minimalism is non‑negotiable. Only essential interactions are visible.

- UI MUST show the Eisenhower Matrix (Urgent × Important) as the primary canvas.
- Tasks MUST have only the essentials by default: title, importance, urgency, and status.
- Quick actions (add, drag between quadrants, complete, delete) MUST be one‑tap/one‑click.
- Hidden modes, nested menus, or advanced options MUST be discoverable but never required.
- Copy, iconography, and empty states MUST be self‑explanatory (no manuals needed).

### II. Delight in Motion

Every action should have a subtle, rewarding animation.

- Motion MUST be responsive (150–250ms for simple transitions) and never block interaction.
- Easing SHOULD default to spring/bezier curves that feel natural; jitter is not allowed.
- Animations MUST run at 60fps on modern hardware; avoid heavy layouts/reflows.
- Respect reduced‑motion preferences and provide a global toggle to disable animations.
- Positive reinforcement (subtle bounce, shimmer) SHOULD accompany key moments.

### III. Calm Design

Avoid clutter, loud colors, and stressful UIs.

- Palette MUST be neutral and calming; accent colors are sparing and purposeful.
- Typography MUST be legible with generous spacing and clear hierarchy.
- Dark and light themes MUST be supported; contrast ratios MUST meet WCAG AA.
- Alerts and errors MUST be non‑alarming; destructive actions require gentle confirmation.
- Sound feedback is subtle and muted by default; users can opt‑in.

### IV. Local‑First

Store data locally for now; no auth or cloud dependency.

- Data MUST persist locally (IndexedDB preferred; localStorage acceptable for MVP scale).
- The app MUST function offline; no network requests in core flows.
- Provide import/export of tasks as JSON to enable backups and portability.
- IDs and ordering MUST be deterministic to avoid sync conflicts in future expansions.

### V. Fun Focus

Gamify completion and add micro‑moments of joy.

- Completing a task SHOULD trigger tasteful confetti and/or a soft sound.
- Streaks and progress cues MAY be shown; they MUST never create pressure.
- All gamified elements MUST be optional, with clear toggles in settings.
- Joyful micro‑interactions MUST not obscure clarity or slow users down.
- Feedback MUST be accessible (visual alternatives for sound; respect reduced motion).

### VI. Component Reuse & Composition

Build on existing foundations; avoid reinventing primitives.

- Before creating any component, MUST check if it already exists in `app/components/`.
- Existing components MUST be reused or composed when they meet the need.
- New UI components MUST be built on top of Radix UI primitives via shadcn patterns.
- Components MUST reside in `app/components/ui/` following shadcn conventions.
- Custom styling via Tailwind is encouraged; avoid inline styles or separate CSS.
- Rationale: Radix provides accessible, unstyled primitives; shadcn wraps them with
  consistent patterns. Reuse reduces bundle size, ensures accessibility, and maintains
  a coherent component library without duplicating primitives.

### VII. Clean Code & Maintainability

Code MUST be readable, reusable, and easy to modify.

- Functions and components MUST have a single, clear responsibility.
- Functions using multiple parameters SHOULD consider using parameter objects for clarity.
- Naming MUST be descriptive and self‑documenting; avoid abbreviations unless standard.
- Duplicated logic MUST be extracted into reusable functions, hooks, or utilities.
- Complex logic MUST be broken into smaller, testable units; avoid deeply nested code.
- Magic numbers and strings MUST be replaced with named constants or configuration.
- File organization MUST follow clear patterns: utilities in `lib/`, hooks in `hooks/`.
- Code changes MUST be localized; refactor to minimize the blast radius of edits.
- Comments SHOULD explain _why_, not _what_; code itself should be self‑explanatory.
- Rationale: Readable code reduces cognitive load and onboarding time. Reusable
  patterns prevent bugs by centralizing logic. Easy‑to‑edit code enables rapid
  iteration without fear of breaking existing functionality.

## Architecture & Technology Constraints

**Stack**: Next.js, React, Tailwind CSS (use versions pinned in the lockfile/package.json)

- Next.js MUST be the app framework (package.json: next 16.x).
- React 19.x MUST be used with functional components and hooks.
- Tailwind CSS 4.x MUST be used for styling; avoid ad‑hoc CSS files where possible.
- No backend services; no authentication; no external databases.
- Project must be fully responsive and accessible.
- Can use Framer motion v12.x for animations.

**Performance**

- Initial load p95 < 1s on a modern laptop; interactions p95 < 100ms.
- Avoid large dependencies; keep bundle lean; prefer native browser APIs.

**Accessibility**

- Keyboard navigation for all core actions (add, edit, move, complete, delete).
- Respect prefers‑reduced‑motion and color contrast; ARIA labels where needed.

**Data**

- Local persistence on every task mutation; failure MUST be recoverable.
- Provide export/import JSON; schema documented and versioned for evolution.

## Development Workflow & Quality Gates

**Quality Gates**

- Lint and typecheck MUST pass (`eslint`, `typescript`).
- UI conforms to Core Principles I–VII; reviewers MUST verify against this constitution.
- Animations validated: duration ranges, easing, and reduced‑motion behavior.
- Accessibility checks for keyboard and contrast MUST pass.
- Component reuse verified: no duplicate primitives; Radix UI via shadcn for new components.
- Code readability validated: clear naming, single responsibilities, minimal nesting.

**Workflow**

- MVP slices favored; ship vertical features that are independently useful.
- No network calls; if introduced for future features, must be flagged and isolated.
- Feature flags/toggles for motion, sound, and gamification.
- Keep configuration local (no env secrets required).

## Governance

**Supremacy & Compliance**

- This constitution supersedes other guidelines for this project.
- All PRs MUST include a “Constitution Check” note mapping changes to Principles/Constraints.

**Amendments**

- Amendments require documentation of rationale and expected user impact.
- Breaking governance changes require a migration plan and a MAJOR version bump.

**Versioning**

- Semantic versioning for this document:
  - MAJOR: redefine/remove principles or governance; backward‑incompatible policy.
  - MINOR: add a new principle/section or materially expand guidance.
  - PATCH: clarifications/wording/typos without policy change.

**Review Cadence**

- Quarterly review for alignment with user needs; out‑of‑cycle amendments as needed.

**Version**: 1.2.0 | **Ratified**: 2025-11-02 | **Last Amended**: 2025-11-07
