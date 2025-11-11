# clarity Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-07

## Active Technologies
- TypeScript 5 with React 19.2.0 and Next.js 16.0.1 + Framer Motion 12.0.0 (animations), Zustand 4.5.5 (state), Lucide React 0.468.0 (icons) (005-companion)
- IndexedDB via Dexie 4.0.8 for companion preferences persistence (005-companion)

- TypeScript 5.x with React 19.x (004-task-drag-drop)
- IndexedDB via Dexie 4.0.8 for local task persistence (004-task-drag-drop)
- Framer Motion 12.x for drag-and-drop interactions (004-task-drag-drop)
- use-sound 4.0.1 for audio feedback (004-task-drag-drop)
- Zustand 4.5.5 for state management with drag state (004-task-drag-drop)

- TypeScript 5.x / React 19.x / Next.js 16.x + Zustand 4.5.5 (state), lucide-react 0.468.0 (icons), Framer Motion 12.x (animations), Tailwind CSS 4.x (styling) (003-task-count-display)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x / React 19.x / Next.js 16.x: Follow standard conventions

## Recent Changes
- 005-companion: Added TypeScript 5 with React 19.2.0 and Next.js 16.0.1 + Framer Motion 12.0.0 (animations), Zustand 4.5.5 (state), Lucide React 0.468.0 (icons)

- 004-task-drag-drop: Task breakdown generated with 58 tasks across 6 phases (Setup, Foundation, US1-P1, US2-P2, US3-P1, Polish). Key additions: Task.sortOrder field, useDragAndDrop hook, moveTaskToQuadrant/reorderTaskWithinQuadrant actions, 2 sound effects (drag-start, drag-drop), touch gestures, reduced-motion support.

- 003-task-count-display: Added TypeScript 5.x / React 19.x / Next.js 16.x + Zustand 4.5.5 (state), lucide-react 0.468.0 (icons), Framer Motion 12.x (animations), Tailwind CSS 4.x (styling)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
