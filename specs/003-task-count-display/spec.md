# Feature Specification: Task Count Display

**Feature Branch**: `003-task-count-display`  
**Created**: 2025-11-06  
**Status**: Draft  
**Input**: User description: "I want to add a feature for displaying total tasks count. User should be able to see total overall tasks and per quadrant total count. In focus mode Total should display only Q1 total count. The visibility of these counts should be configurable from settings - By default this will be Off, user can switch overall total on or per quad total or both on."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Configure Task Count Visibility (Priority: P1)

Users need to control whether and how task counts are displayed, allowing them to customize their view based on personal preference for information density.

**Why this priority**: This is the foundational capability that enables all other functionality. Without the ability to toggle counts on/off, users have no control over this feature.

**Independent Test**: Can be fully tested by navigating to settings, toggling the task count options (off/overall/per-quadrant/both), and verifying the correct counts appear or disappear on the main view. Delivers immediate value by giving users control over visual clutter.

**Acceptance Scenarios**:

1. **Given** the user is on the settings page, **When** they view task count options, **Then** they see three toggle options: "Show Overall Total", "Show Per-Quadrant Totals", and both are OFF by default
2. **Given** both toggles are OFF, **When** the user returns to the main matrix view, **Then** no task counts are visible anywhere
3. **Given** the user toggles "Show Overall Total" to ON, **When** they return to the main view, **Then** they see a single count showing total tasks across all quadrants
4. **Given** the user toggles "Show Per-Quadrant Totals" to ON, **When** they return to the main view, **Then** they see individual counts displayed on each quadrant (Q1, Q2, Q3, Q4)
5. **Given** both toggles are ON, **When** the user returns to the main view, **Then** they see both the overall total and per-quadrant counts displayed

---

### User Story 2 - View Overall Task Count (Priority: P2)

Users want to see the total number of tasks across all quadrants to quickly understand their overall workload at a glance.

**Why this priority**: Provides high-level workload awareness without requiring users to mentally add up individual quadrant counts.

**Independent Test**: Can be fully tested by enabling "Show Overall Total" in settings, adding/completing/deleting tasks, and verifying the overall count updates correctly. Delivers standalone value for users who want a simple total without quadrant breakdown.

**Acceptance Scenarios**:

1. **Given** "Show Overall Total" is enabled, **When** the user views the matrix, **Then** they see a prominently displayed total count of all tasks
2. **Given** the overall count is displayed, **When** the user adds a new task to any quadrant, **Then** the overall count increments by 1 immediately
3. **Given** the overall count is displayed, **When** the user completes or deletes a task, **Then** the overall count decrements by 1 immediately
4. **Given** the user has 0 tasks, **When** they view the overall count, **Then** it displays "0" (not hidden or showing error)

---

### User Story 3 - View Per-Quadrant Task Counts (Priority: P2)

Users want to see how many tasks are in each quadrant (Q1, Q2, Q3, Q4) to understand the distribution of their work and identify which areas need attention.

**Why this priority**: Enables users to quickly spot imbalances in their task distribution and make informed decisions about where to focus.

**Independent Test**: Can be fully tested by enabling "Show Per-Quadrant Totals" in settings, distributing tasks across quadrants, and verifying each quadrant shows its accurate count. Delivers standalone value for users who want detailed breakdown without overall totals.

**Acceptance Scenarios**:

1. **Given** "Show Per-Quadrant Totals" is enabled, **When** the user views the matrix, **Then** each quadrant displays its task count (e.g., "Q1: 5", "Q2: 3", "Q3: 7", "Q4: 2")
2. **Given** per-quadrant counts are displayed, **When** the user moves a task from Q1 to Q3, **Then** Q1 count decrements and Q3 count increments immediately
3. **Given** per-quadrant counts are displayed, **When** a quadrant has 0 tasks, **Then** it displays "0" (not hidden)
4. **Given** per-quadrant counts are displayed, **When** the user adds a task to a specific quadrant, **Then** only that quadrant's count increments

---

### User Story 4 - Focus Mode Task Count Behavior (Priority: P3)

When users enter focus mode (which shows only Q1 tasks), the task counts should adapt to show only Q1-relevant information to maintain the focused, distraction-free experience.

**Why this priority**: Ensures consistency with the focus mode philosophy of showing only what's urgent and important. Lower priority because it depends on focus mode existing and being used.

**Independent Test**: Can be fully tested by enabling task counts, entering focus mode, and verifying only Q1 count is displayed regardless of settings. Delivers value by maintaining focus mode's minimalist intent.

**Acceptance Scenarios**:

1. **Given** the user has enabled "Show Overall Total" and is in focus mode, **When** they view the screen, **Then** they see only the Q1 task count (not the overall total across all quadrants)
2. **Given** the user has enabled "Show Per-Quadrant Totals" and is in focus mode, **When** they view the screen, **Then** they see only the Q1 count (Q2, Q3, Q4 counts are hidden)
3. **Given** the user has both count types enabled and is in focus mode, **When** they view the screen, **Then** they see only one count: the Q1 total
4. **Given** the user exits focus mode, **When** they return to normal view, **Then** the counts revert to showing according to their settings (overall, per-quadrant, or both)

---

### Edge Cases

- What happens when all tasks are completed and counts reach zero? (Should display "0", not hide the count display)
- How do counts update when tasks are bulk-deleted or bulk-moved between quadrants? (Should update atomically/immediately)
- What if a user toggles count visibility while on the main view (not in settings)? (Settings should require navigation, counts update on return to main view)
- How are counts displayed on small mobile screens where space is limited? (Counts should be compact but readable, possibly abbreviated like "5" instead of "5 tasks")

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide three configurable settings for task count display: "Show Overall Total", "Show Per-Quadrant Totals", with both OFF by default
- **FR-002**: System MUST display the total count of all tasks across all quadrants when "Show Overall Total" is enabled
- **FR-003**: System MUST display individual task counts for each quadrant (Q1, Q2, Q3, Q4) when "Show Per-Quadrant Totals" is enabled
- **FR-004**: System MUST allow both overall and per-quadrant counts to be displayed simultaneously when both settings are enabled
- **FR-005**: System MUST update all displayed counts in real-time when tasks are added, deleted, moved, or completed
- **FR-006**: System MUST display only Q1 task count in focus mode, regardless of which count settings are enabled
- **FR-007**: System MUST persist the user's count visibility preferences across sessions (local storage)
- **FR-008**: System MUST display "0" when a count is zero, not hide the count display
- **FR-009**: Counts MUST include only active (non-completed) tasks, excluding completed tasks from the totals
- **FR-010**: Count display MUST be visually distinct but non-intrusive, respecting the "Calm Design" principle

### Key Entities

- **Task Count Setting**: A user preference controlling visibility of counts; has three states per setting type (overall: on/off, per-quadrant: on/off)
- **Task**: Existing entity; counts aggregate tasks by their quadrant assignment and completion status
- **Quadrant**: Existing entity (Q1: Urgent+Important, Q2: Not Urgent+Important, Q3: Urgent+Not Important, Q4: Not Urgent+Not Important); each has an associated task count

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can toggle task count visibility settings in under 10 seconds from the main view
- **SC-002**: Task counts update within 100ms of any task modification (add/delete/move/complete)
- **SC-003**: Count displays remain readable and non-intrusive on screens from 320px width (mobile) to 2560px+ (desktop)
- **SC-004**: Users can accurately identify their busiest quadrant at a glance without counting individual task cards
- **SC-005**: Focus mode maintains its minimalist intent by showing only Q1-relevant count information
- **SC-006**: 90% of users who enable counts report improved awareness of task distribution across quadrants

## Assumptions _(optional)_

- Focus mode functionality already exists in the application
- The settings interface is accessible from the main matrix view
- Completed tasks are tracked separately and excluded from active counts
- Tasks belong to exactly one quadrant at any given time
- The application already has local storage persistence for user preferences

## Out of Scope _(optional)_

- Historical task count tracking or trends over time
- Notifications or alerts based on task count thresholds
- Filtering counts by task priority, tags, or other metadata
- Animated transitions when counts change (respects reduced motion preferences)
- Export of task count statistics or reports
