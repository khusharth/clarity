# 002 - Unified Modal

## Summary

Create a reusable Modal component that standardizes modal behavior across the app. The component should:

- Serve as a desktop dialog and switch to a bottom-sheet on mobile/small viewports.
- Provide a simple, accessible API for content consumers (open, close, title, description, footer, actions).
- Support keyboard interaction (Escape to close, focus trap) and click-outside to close.
- Allow optional animations and hooks for sound effects (via existing useSfx) to make interactions more delightful.
- Be theme-aware (use existing CSS variables) and lightweight to reuse in AddTodoModal, EditTodoModal, DeleteTodoModal, and future modals.

## Motivation

The app currently has multiple self-implemented modal-like components with duplicated logic (escape handling, backdrop, animations). A single reusable Modal that toggles into a bottom-sheet on small screens will:

- Reduce duplication and bugs
- Ensure consistent UX across add/edit/delete flows
- Make it easier to add fun interactions (sfx and animations) centrally

## User Impact

Users will experience consistent modal behaviors across the app. On mobile the modals appear as bottom sheets (easier to reach) while on desktop they appear as centered dialogs. Optional sound and animations will make confirming or completing tasks feel more delightful.

## Contract (API)

- Props (inputs):

  - open: boolean — whether the modal is visible
  - onClose: () => void — close callback
  - title?: string — optional title rendered in header
  - description?: string — optional description text
  - children: React.ReactNode — modal body content
  - footer?: React.ReactNode — optional footer area (actions)
  - variant?: 'dialog' | 'bottomsheet' | 'auto' — prefer 'auto' to switch by viewport
  - initialFocusRef?: React.RefObject<HTMLElement> — optional element to focus on open
  - closeOnOverlayClick?: boolean — default true
  - openSfx?: 'open' | 'confirm' | 'delete' | null — optional hook to trigger sfx from useSfx
  - enableAnimations?: boolean — default true

- Outputs / Effects:
  - Calls onClose when closed via overlay, Escape key, or programmatic close.
  - If openSfx provided, call matching useSfx method when opening or on confirm action (implementation detail inside component).

## User Scenarios & Testing

1. Open Add Modal (desktop)

   - Given the user taps Add, the modal opens centered, focus is moved to the first input, Escape closes, clicking cancel closes, content submits when confirm pressed.

2. Open Edit Modal (mobile)

   - Given the user taps an existing task, the modal opens as a bottom sheet occupying the lower portion of the screen, dragging down or tapping outside closes it.

3. Delete Confirm

   - Given the user taps delete, a confirmation modal opens. Confirm triggers delete, optional delete sfx plays, toast shows success, modal closes.

4. Accessibility
   - Focus is trapped while modal open; tab order cycles inside modal.
   - Screen readers announce title and description.

## Functional Requirements (testable)

FR-1: The Modal component must render a backdrop and an accessible dialog region when open is true.

FR-2: When viewport width is below 640px (Tailwind 'sm' breakpoint), the component must render as a bottom sheet covering the bottom area and implement a vertical drag-to-close with a 120px dismissal threshold (smooth translate/opacity animation). The drag gesture must gracefully fall back to overlay/Escape dismissal if threshold not met.

FR-3: The Modal must close when the Escape key is pressed.

FR-4: The Modal must close when overlay is clicked (configurable via closeOnOverlayClick).

FR-5: The Modal must accept header (title/description), body (children), and footer content and render them in expected areas.

FR-6: The Modal must expose initialFocusRef so consumers can autofocus inputs when opening.

FR-7: The Modal must provide a prop to trigger small sfx events via existing useSfx (e.g., open/confirm/delete). The effect should be optional and not break if useSfx is disabled.

FR-8: The Modal must be theme-aware (use CSS variables already present in the app for background/foreground colors).

FR-9: The Modal must provide animation for open/close that adheres to Clarity Constitution timing (150-250ms duration with natural spring/bezier easing) and MUST respect the global animation toggle from Settings modal, which in turn respects prefers-reduced-motion.

FR-10: The Modal must meet Clarity Constitution performance targets (p95 < 100ms for all interactions including open, close, and drag gestures).

## Success Criteria

- SC-1: All existing modal flows (Add, Edit, Delete) are migrated to the new component and behave identically from the user's perspective.
- SC-2: On mobile devices (viewport <= 640px) the modal appears as a bottom sheet and supports closing by drag or overlay.
- SC-3: Accessibility checks: focus trap works, Escape closes, and title/description are announced by a screen reader.
- SC-4: No visual regressions in the modal styles across light/dark themes.

## Key Entities

- Modal — UI container for dialogs and bottom-sheets.
- useSfx — existing hook used for optional sound effects.

## Assumptions

- Mobile breakpoint assumed at 640px (sm). This can be adjusted later per design.
- The app uses CSS variables for theme colors and those variables will be used in the modal.
- The repository has existing useSfx and toast utilities which will be reused.

## Clarifications

### Session 2025-11-05

- Q: Drag-to-close behavior scope → A: Implement basic vertical drag-to-close (threshold-based dismissal with smooth translate/opacity).

- Q: Mobile breakpoint → A: 640px (Tailwind `sm`)

## Open Questions [NEEDS CLARIFICATION] (max 3)

1. [RESOLVED: Mobile breakpoint]

   - Decision: Use 640px (Tailwind `sm`) as the cutoff between dialog and bottom-sheet. This aligns with existing styling conventions and keeps behavior predictable across devices.
   - Impact: Devices with width <= 640px will see the bottom-sheet variant; larger viewports will see the centered dialog.

2. [RESOLVED: Drag-to-close behavior scope]

   - Decision: Implement a basic vertical drag-to-close now (threshold-based dismissal with smooth translate/opacity). This provides good UX on mobile while keeping implementation and test complexity moderate.

3. [NEEDS CLARIFICATION: SFX scope]

   - Context: I propose hooking into useSfx for optional open/confirm/delete sounds. Should we allow consumers to pass arbitrary sfx names or restrict to a small enum (open/confirm/delete)?

   - Decision: Restrict SFX to the enum ('open' | 'confirm' | 'delete') so the Modal provides predictable hooks and maps directly to existing `useSfx` methods.

## Deliverables

- Component: app/components/ui/Modal.tsx
- Updated consumers: AddTodoModal, EditTodoModal, DeleteTodoModal (to use the new Modal)
- Spec + Checklist files under specs/002-unified-modal/
