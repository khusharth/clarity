# Implementation Plan: Unified Modal (shadcn + Radix)

**Branch**: `002-unified-modal` | **Date**: 2025-11-05 | **Spec**: `specs/002-unified-modal/spec.md`
**Input**: Feature specification at `/specs/002-unified-modal/spec.md`

## Summary

Build a single reusable Modal component (desktop dialog + mobile bottom-sheet) using Radix dialog primitives and the shadcn-style component conventions already used across the app. The component will:

- Render as a centered dialog on desktop and as a bottom-sheet on mobile (cutoff: 640px / Tailwind `sm`).
- Provide a simple, accessible API (title, description, children, footer, initialFocusRef, openSfx enum) and reduced-motion support.
- Implement a basic vertical drag-to-close on bottom-sheet (threshold-based dismissal).
- Expose simple hooks to play sound effects via the existing `useSfx` enum (`open`|`confirm`|`delete`).
- Replace existing modal implementations (AddTodoModal, EditTodoModal, DeleteTodoModal, Settings modal) to use the new component and prefer shadcn primitives (Button, Toggle, Input) inside modals.

This reduces duplication, centralizes accessibility and animation behavior, and makes it easier to keep UI consistent between dark and light modes.

## Technical Context

**Language/Version**: TypeScript + React (Next.js app)  
**Primary Dependencies**: React, Next.js, Tailwind CSS, Radix UI(dialog primitives), shadcn-style primitives (component patterns), lucide-react (icons), framer-motion (animations), use-sound (already used via `useSfx`).  
**Storage**: N/A (UI-only changes)  
**Testing**: Typecheck (tsc), lint (eslint), and manual smoke tests; unit/visual tests optional.  
**Target Platform**: Web (desktop + mobile browsers)  
**Project Type**: Frontend web app (Next.js)  
**Performance Goals**: Micro-animations 150–250ms, 60fps where possible; respect reduced-motion user preference.  
**Constraints**: Must preserve existing UX and keyboard shortcuts. Must be theme-aware (use CSS variables present in repo). Keep bundle size impact minimal—prefer lightweight primitives.

## Constitution Check

Derived from `.specify/memory/constitution.md` (Clarity):

- Clarity over Complexity: keep API minimal and explicit.
- Delight in Motion: animations must be subtle and performant (150–250ms), and respect reduced motion settings.
- Calm Design: ensure contrast and theme parity for dark/light.
- Local‑First: UI only; no network calls.
- Fun Focus: sound/animation are optional and toggled by existing controls.

No constitution violations anticipated if we reuse existing CSS variables, `useSfx`, and prefer Radix/shadcn primitives.

## Project Structure (Files to create / modify)

Add:

- `app/components/ui/Modal.tsx` — the unified Modal component (Radix dialog + responsive bottom-sheet behavior).

Modify:

- `app/components/AddTodoModal.tsx` — use `Modal` and shadcn primitives.
- `app/components/EditTodoModal.tsx` — use `Modal` and shadcn primitives.
- `app/components/DeleteTodoModal.tsx` — use `Modal` and shadcn primitives.
- `app/components/Settings.tsx` (if settings modal exists) — migrate modal usage.

Optional / Nice-to-have:

- `app/components/ui/*` — small shadcn-style wrappers (install using shadcn package) for `Button`, `Input`, `Toggle` if not already available (prefer reuse of any existing implementations in repo).

## Phase 0 — Research & Preparation (2–4 hours)

Goals:

- Confirm existing primitives and and install new primitives through shadcn to replace those primitives from one from shadcn.
- Verify `useSfx` API and available sound assets.
- Ensure Radix Dialog is available (it already appears in repo). If any shadcn utility packages are missing add them.

Tasks:

1. Inventory: scan `app/components` for dialog-like code and UI primitives (buttons, toggles, inputs). (done partially during spec)
2. Confirm dependencies: check `package.json` for `@radix-ui/react-dialog`, `framer-motion`, `use-sound`, and tailwind setup. Add `shadcn/ui` patterns (no dependency required; shadcn is a pattern of Radix + Tailwind, but if `shadcn` tooling is desired, plan `pnpm` installs). — Research outcome: prefer Radix + local shadcn-style wrappers.
3. Accessibility checklist: identify focus trap library (Radix's Dialog handles focus) and keyboard shortcuts to preserve.

Deliverable: `specs/002-unified-modal/research.md` summarizing decisions (dependencies, approach, and any remaining clarifications). If new packages are required, include exact `pnpm` commands.

## Phase 1 — Design & Contracts (3–6 hours)

Goals:

- Produce the Modal component API, props, and expected DOM structure.
- Define styling classes/variables for dark/light parity.
- Define tests and smoke check steps.

Tasks:

1. Write `app/components/ui/Modal.tsx` API (props as in spec):

- `open`, `onClose`, `title?`, `description?`, `children`, `footer?`, `variant? ('auto'|'dialog'|'bottomsheet')`, `closeOnOverlayClick?`, `openSfx? ('open'|'confirm'|'delete')`, `enableAnimations?`
- Use Radix `Dialog` primitives for base behavior.
- For bottom-sheet, use responsive behavior (matchMedia or Tailwind `sm` breakpoint) and implement pointer drag handlers with a dismissal threshold (120px).
- Respect `prefers-reduced-motion` and provide fallbacks.

2. Styling and theme:

- Use existing CSS variables (`--color-surface`, `--color-fg-muted`, `--shadow-soft`) for backgrounds and text.
- Ensure both dark and light appear correct (use existing CSS tokens). Add minor utility classes for bottom-sheet rounded top and overlay.

3. Accessibility:

- Ensure Dialog `aria-labelledby` and `aria-describedby` are set when title/description are provided.
- Ensure Esc closes and focus is restored to trigger element (Radix will handle but verify behavior in manual tests).

4. SFX integration:

- Accept `openSfx` enum and call appropriate `useSfx` methods at open time and provide a `confirmSfx()` callback that consumers can call (or have the Modal expose a `onConfirm` handler). Keep SFX optional and safe when `useSfx` is disabled.

5. Create small `ui` wrappers if missing:

- `app/components/ui/Button.tsx` (if not present or if existing one isn't shadcn-like) — use existing `class-variance-authority` variant system already present in repo.
- `app/components/ui/Input.tsx`, `Toggle.tsx` — optional, prefer using existing native inputs styled with repo tokens.

Deliverables: `app/components/ui/Modal.tsx`, optional `ui/*` wrappers, updated design notes in `plan.md`.

## Phase 2 — Implementation & Migration (4–8 hours)

Goals:

- Implement Modal and migrate consumer modals with minimal behavioral changes.

Steps / Tasks (small, atomic commits recommended):

1. Add Modal file (commit 1)

- Create `app/components/ui/Modal.tsx` implementing Radix Dialog with responsive behavior and drag-to-close.
- Export the component.

2. Replace AddTodoModal (commit 2)

- Replace the surrounding backdrop + container with `<Modal open={open} onClose={onClose} title="Add Task" footer={...}>` and move form inside Modal children.
- Use the `Button` wrapper for Cancel/Add actions.

3. Replace EditTodoModal (commit 3)

- Same migration strategy; ensure autofocus handled via `initialFocusRef` or `autoFocus` on input.

4. Replace DeleteTodoModal (commit 4)

- Use Modal with `openSfx="delete"` and have Delete button trigger `sfx.delete()` via `useSfx` as before (Modal only triggers open SFX).

5. Migrate other modals (Settings, etc.) (commit 5)

6. Small UI wrappers & cleanup (commit 6)

- Ensure `app/components/ui/button.tsx` or existing Button is imported by modals. Prefer reusing `class-variance-authority` usage already present.

7. Typecheck, lint, and smoke tests (commit 7)

- Run `pnpm -w -s` or `pnpm install` if needed, then `pnpm build`/`pnpm lint`/`pnpm typecheck`.

8. Manual QA

- Verify on desktop: dialog opens, title/description announced; Escape restores focus.
- Verify on mobile (simulate 375×812): modal opens as bottom-sheet, drag down dismisses with threshold; overlay click dismisses; SFX works if enabled.

## Testing & Validation

- Automated:

  - Typecheck: `pnpm tsc --noEmit` or `pnpm typecheck` (project command if present).
  - Lint: `pnpm lint`.

- Manual checks (smoke):
  - Add/Edit/Delete flows open and close as before.
  - Keyboard: Esc closes and focus restored.
  - Mobile: bottom-sheet behavior and drag-to-close threshold.
  - Visual: dark/light parity verified.

## Rollout & PR strategy

- Work in feature branch `002-unified-modal`.
- Use small, focused commits for each migration step with descriptions and tests.
- Open a single PR referencing `specs/002-unified-modal/spec.md` and `plan.md` with screenshots and test steps.

## Risks & Mitigations

- Risk: missing third-party packages (shadcn helpers) — Mitigation: prefer Radix + local shadcn-style wrappers; add `pnpm` install step only if necessary and call out in `research.md`.
- Risk: subtle visual regressions — Mitigation: keep styling variables, add visual smoke test steps, and small incremental migrations.
- Risk: focus/keyboard regressions — Mitigation: rely on Radix Dialog for a11y and test keyboard flows.

## Tasks (expandable) — deliverable checklist

Phase 0

- [ ] research.md (dependencies, commands, decisions)

Phase 1

- [ ] `app/components/ui/Modal.tsx` — implement API and behaviors
- [ ] `app/components/ui/Button.tsx` (if missing) — ensure shadcn-like variants

Phase 2

- [ ] Migrate `AddTodoModal.tsx` to new Modal
- [ ] Migrate `EditTodoModal.tsx` to new Modal
- [ ] Migrate `DeleteTodoModal.tsx` to new Modal
- [ ] Migrate any remaining modals (Settings, Completed page) to new Modal
- [ ] Run typecheck/lint and manual smoke tests

## Outputs

- `app/components/ui/Modal.tsx` (component)
- Updated modal consumers (Add/Edit/Delete/Settings)
- `specs/002-unified-modal/research.md` (Phase 0)
- `specs/002-unified-modal/plan.md` (this file)
- `specs/002-unified-modal/tasks.md` (detailed task breakdown, created in a follow-up `/speckit.tasks`)

## Next Commands / Runbook

Suggested commands to run locally during implementation:

```bash
# (optional) install new deps if research led to additions
# pnpm add @radix-ui/react-dialog framer-motion use-sound

# typecheck and lint iteratively
pnpm typecheck
pnpm lint

# run dev server
pnpm dev
```

---

If you'd like, I can now implement Phase 0 and create `research.md`, then implement `app/components/ui/Modal.tsx` and migrate the first consumer (`AddTodoModal.tsx`) in small commits. Proceed?
