# Implementation Plan: Minimal Companion Character

**Branch**: `005-companion` | **Date**: 2025-11-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-companion/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add a minimal, calm companion character that provides subtle motivational feedback through soft animations. The companion sits in a corner of the screen, responds to task completion events with gentle reactions, supports click/tap interactions for playful engagement, transitions to a "tired" state after 2 hours of inactivity, and can be toggled on/off via settings. All animations respect reduced motion preferences and maintain the app's clean, minimal aesthetic using Framer Motion for smooth 60fps performance.

## Technical Context

**Language/Version**: TypeScript 5 with React 19.2.0 and Next.js 16.0.1  
**Primary Dependencies**: Framer Motion 12.0.0 (animations), Zustand 4.5.5 (state), Lucide React 0.468.0 (icons)  
**Storage**: IndexedDB via Dexie 4.0.8 for companion preferences persistence  
**Testing**: Manual testing for animations and interactions; ESLint 9 for code quality  
**Target Platform**: Web (desktop, tablet, mobile) - responsive design with touch support  
**Project Type**: Next.js web application with App Router  
**Performance Goals**: 60fps animations, <200ms reaction time, <100ms click response, <1s initial load  
**Constraints**: No network calls, local-first, reduced motion support required, maintain <100ms interaction latency  
**Scale/Scope**: Single component with 7 states (idle, motivated, celebrating, tired, 3 interactive reactions), 4-6 animation variants

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Derived from `.specify/memory/constitution.md` (Clarity):

✅ **Clarity over Complexity**: Companion is optional (settings toggle), non-intrusive positioning, never blocks UI  
✅ **Delight in Motion**: All animations 150-250ms transitions, 60fps via Framer Motion, spring easing for natural feel  
✅ **Calm Design**: Minimal visual design (soft orb/shape with gentle glows), neutral palette, respects dark/light themes  
✅ **Local-First**: Companion preference stored in IndexedDB via existing Zustand store, no network calls  
✅ **Fun Focus**: Provides optional motivational feedback (can be disabled), subtle confetti-like celebration, playful click reactions  
✅ **Component Reuse**: Will reuse existing Toggle component from settings, integrate with existing Zustand stores  
✅ **Clean Code**: Single Companion component, extracted animation utilities, clear state machine, typed interfaces

**Potential Concerns**:

- ⚠️ New visual element must not violate "minimal UI" principle → Mitigated by: small size, corner positioning, optional toggle
- ⚠️ Animations could feel "busy" → Mitigated by: slow idle cadence, brief reactions, reduced motion support
- ✅ No violations identified; feature aligns with constitution

## Project Structure

### Documentation (this feature)

```text
specs/005-companion/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── README.md        # State machine and animation API
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── components/
│   ├── Companion.tsx                 # Main companion component
│   ├── Settings.tsx                  # Updated with companion toggle
│   └── ui/
│       └── [existing components]     # Reuse Toggle, etc.
├── hooks/
│   ├── useCompanion.ts              # Companion state and animation logic
│   └── [existing hooks]
├── lib/
│   ├── companion-animations.ts      # Animation definitions and variants
│   └── [existing utilities]
├── store/
│   ├── companion.ts                 # Zustand store for companion state
│   └── todos.ts                     # Updated to trigger companion reactions
├── layout.tsx                       # Updated to render Companion
└── [existing files]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
