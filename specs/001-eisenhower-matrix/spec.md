# Feature Specification: Eisenhower TODO Matrix

**Feature Branch**: `[001-eisenhower-matrix]`  
**Created**: 2025-11-02  
**Status**: Draft  
**Input**: User description: "This application is a mimimal TODOs prioritization app.\n\n1. The main page should display all the TODOs in the Eisenhower Matrix 2x2 format Q1: Do Now (urgent + important), Q2: Plan It (not urgent + important), Q3: Delegate (urgent + not important),Q4: Later (not urgent + not important). Each quadrant shows todo cards with smooth entry/exit animations.\n\n2. Focus mode: Makes the Q1 full screen with a smooth animation and just shows what needs to be done now. Goal should be to make user feel less overwhelmed and get something done.\n\n3. Add todo flow: Opens a modal to add TODOs. Ask minimal information like just text (the TODO) and 2 questions -> 1. Is it urgent? 2. Is it important?\n\n4. Complete Todo: A way to mark the TODO as complete in a fun way and show confetti animation and then remove that TODO. Can create a separate page for completed TODOs that user can delete when they want."

## Clarifications

### Session 2025-11-02

- Q: How should tasks be ordered within each quadrant? → A: Creation time (newest first)
- Q: What content should Focus Mode show? → A: Toggle between all Q1 and one-at-a-time
- Q: How long to keep completed tasks? → A: Indefinitely until manually deleted

## User Scenarios & Testing _(mandatory)_

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - View and organize tasks in an Eisenhower Matrix (Priority: P1)

Users see all tasks arranged into four quadrants based on urgency and importance. They can add a task, and it appears in the correct quadrant with smooth entry animation. Tasks can be moved between quadrants, updating their urgency/importance accordingly, with smooth transitions.

**Why this priority**: The matrix is the core value proposition—clear prioritization at a glance.

**Independent Test**: Start with no tasks; add and move tasks and verify their placement and animations without requiring other features.

**Acceptance Scenarios**:

1. **Given** no tasks exist, **When** the user opens the app, **Then** all four quadrants are visible with helpful empty states.
2. **Given** the add flow, **When** a task is added with urgent=true and important=true, **Then** it appears in Q1 with a smooth entry animation.
3. **Given** a task in Q2, **When** the user changes it to urgent=true, **Then** it moves to Q1 with a smooth transition.
4. **Given** multiple tasks exist, **When** the user changes urgency/importance on a task, **Then** its quadrant updates immediately and the change is visually clear.

---

### User Story 2 - Focus mode for Do Now (Q1) tasks (Priority: P2)

Users can enter a focus mode that makes Q1 full screen and hides other quadrants to reduce overwhelm, with a smooth transition. Users can exit to return to the matrix.

**Why this priority**: Supports execution by reducing cognitive load and highlighting immediate work.

**Independent Test**: From any state with at least one Q1 task, entering/exiting focus mode should work without other dependencies.

**Acceptance Scenarios**:

1. **Given** at least one Q1 task exists, **When** the user enters focus mode, **Then** Q1 expands to full screen and other quadrants are hidden with a smooth animation.
2. **Given** focus mode is active, **When** the user exits focus mode, **Then** the full matrix returns with a smooth animation.
3. **Given** focus mode is active with no Q1 tasks, **When** the user enters focus mode, **Then** they see a calm empty state with guidance to add or re-prioritize tasks.

---

### User Story 3 - Add task with minimal input (Priority: P3)

Users can add a task via a modal collecting only the task text and two questions: Is it urgent? Is it important?

**Why this priority**: Minimizes friction to capture tasks quickly.

**Independent Test**: From the empty state or matrix, opening the modal and adding a task should work on its own.

**Acceptance Scenarios**:

1. **Given** the matrix view, **When** the user opens the add modal, **Then** the modal appears and focuses the text input.
2. **Given** the add modal, **When** the user submits text and answers the two questions, **Then** the task is created and shown in the correct quadrant with entry animation.
3. **Given** the add modal, **When** the user cancels, **Then** no task is created and the modal closes without error.

---

### User Story 4 - Complete tasks with joyful feedback (Priority: P3)

Users can mark a task complete in a fun way (confetti) and have it removed from the matrix. A Completed view shows finished tasks; users can delete completed tasks at will.

**Why this priority**: Reinforces progress and allows decluttering.

**Independent Test**: Completing a task and viewing/deleting it from Completed can be validated without other features.

**Acceptance Scenarios**:

1. **Given** a task in any quadrant, **When** the user marks it complete, **Then** a celebratory animation plays and the task disappears from the matrix.
2. **Given** at least one completed task exists, **When** the user opens the Completed view, **Then** completed tasks are listed with dates.
3. **Given** the Completed view, **When** the user deletes a completed task, **Then** the task is removed after a gentle confirmation.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- Empty state: No tasks in the matrix or in a quadrant.
- Very long task text or special characters in task text.
- Rapidly toggling urgency/importance or moving tasks across quadrants.
- Reduced motion preference enabled (animations should be minimized/respect setting).
- Duplicate task text entered repeatedly.
- Offline usage and app reload persistence.

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: The system MUST display four quadrants (Q1 Do Now, Q2 Plan It, Q3 Delegate, Q4 Later) and place each task based on two attributes: urgent (true/false) and important (true/false).
- **FR-002**: The system MUST provide an add-task modal that requires task text and asks two questions: “Is it urgent?” and “Is it important?”
- **FR-003**: The system MUST persist tasks locally on the user’s device so data remains after reloads and offline.
- **FR-004**: The system MUST allow users to change a task’s urgency/importance and immediately reflect the new quadrant with a smooth transition. Any type of edit like text, or even deletion of the task should be supported after its added.
- **FR-005**: The system MUST provide a Focus Mode that shows only Q1 tasks full screen and allows exiting back to the matrix.
- **FR-006**: The system MUST allow marking a task complete with celebratory feedback and move it to a Completed view.
- **FR-007**: The system MUST allow deletion of tasks from the Completed view with gentle confirmation.
- **FR-008**: The system MUST provide smooth, non-blocking animations for task entry, exit, and movement; animations MUST respect reduced-motion preferences.
- **FR-009**: The system MUST support keyboard navigation for core actions (add task, confirm/cancel, change quadrant, complete task).
- **FR-010**: The system MUST present calm visual design (clear hierarchy, neutral palette) and avoid attention-grabbing alerts except when confirming destructive actions. All UI should be fully responsive.

_Clarifications to confirm (maximum 3):_

- **FR-011**: Sorting within each quadrant MUST be by creation time (newest first).
- **FR-012**: Focus Mode MUST allow toggling between showing all Q1 tasks and a single-task focus with a “Next” control.
- **FR-013**: Completed tasks MUST be retained indefinitely until manually deleted by the user.

### Key Entities _(include if feature involves data)_

- **Task**: id, text, isUrgent (bool), isImportant (bool), status (active|completed), createdAt, completedAt?
- **Preferences**: reducedMotion (bool), soundEnabled (bool) for celebratory feedback; used only to enhance UX.

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 95% of first-time users can add a task and see it placed in the correct quadrant within 20 seconds without guidance.
- **SC-002**: Changing a task’s urgency/importance updates its quadrant immediately with clear visual feedback in under 1 second perceived time.
- **SC-003**: Entering and exiting Focus Mode feels instant to users; 90% report feeling less overwhelmed when using Focus Mode in usability tests.
- **SC-004**: 99% of completion actions result in correct removal from the matrix and appearance in the Completed view.
- **SC-005**: Core flows (add, view, change quadrant, complete, view completed, delete completed) function without network connectivity.
