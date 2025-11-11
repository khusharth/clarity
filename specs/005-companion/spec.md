# Feature Specification: Minimal Companion Character

**Feature Branch**: `005-companion`  
**Created**: 2025-11-11  
**Status**: Draft  
**Input**: User description: "add a small 'Companion' character to my task management app. The companion should feel minimal, calm, and slightly playful. It should stay out of the way, never block the UI, and only appear as a subtle motivator. The companion has simple moods: idle, motivated when I complete a task, a small celebration when I clear a whole quadrant, and a gentle 'tired' state if I haven't done tasks for a long time. Its reactions should feel soft—light glow changes, tiny movements, small pulses—not cartoons or aggressive animations. It should normally sit in a corner of the screen (maybe near logo on top), occasionally doing small idle motions. When I complete tasks, it briefly reacts and then goes back to resting. The overall vibe should stay clean and minimal, fitting a productivity app."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Companion Idle Presence (Priority: P1)

As a user, when I use the task management app, I see a subtle companion character that stays quietly in the corner, occasionally showing small idle movements, creating a calm and non-intrusive presence that makes the app feel more alive without distracting from my work.

**Why this priority**: This is the foundation—the companion must exist in a minimal, non-intrusive way before it can react to anything. This establishes the core visual design and positioning that all other behaviors build upon.

**Independent Test**: Can be fully tested by opening the app and observing the companion in its default idle state. Delivers value by adding personality without compromising the clean UI aesthetic.

**Acceptance Scenarios**:

1. **Given** I open the task management app, **When** the app loads, **Then** I see a small companion character positioned near the top corner (near the logo area)
2. **Given** the companion is visible, **When** I interact with other UI elements, **Then** the companion remains in its corner position and never blocks clickable areas or content
3. **Given** the companion is in idle state, **When** no task actions occur for several seconds, **Then** the companion performs subtle, slow idle animations (small movements, gentle pulses)
4. **Given** the companion is visible, **When** I observe its idle behavior, **Then** the animations feel calm and minimal—no aggressive or cartoonish movements
5. **Given** the companion is displayed, **When** I scroll or resize the window, **Then** the companion maintains its relative position without obstructing the interface

---

### User Story 2 - Task Completion Reactions (Priority: P2)

As a user, when I complete a task, the companion briefly reacts with a motivated state (subtle glow change, small upward movement or pulse), providing gentle positive reinforcement before returning to its idle state.

**Why this priority**: This adds the core interactive feedback loop—rewarding task completion with subtle encouragement. This is the primary value of having a companion: acknowledging user progress.

**Independent Test**: Can be tested by marking tasks as complete and observing the companion's brief reaction animation. Delivers motivational value through immediate, subtle feedback.

**Acceptance Scenarios**:

1. **Given** the companion is in idle state, **When** I complete any task, **Then** the companion transitions to a "motivated" state with a subtle glow change and small upward movement
2. **Given** the companion reacts to task completion, **When** the reaction animation completes (after a brief moment), **Then** the companion smoothly transitions back to idle state
3. **Given** I complete multiple tasks in quick succession, **When** each task is marked complete, **Then** the companion responds to each completion without animations stacking or becoming overwhelming
4. **Given** the companion is reacting, **When** I continue using the app, **Then** the reaction never blocks UI elements or disrupts my workflow

---

### User Story 3 - Quadrant Clear Celebration (Priority: P2)

As a user, when I complete all tasks in a quadrant, the companion shows a small celebration reaction (more pronounced glow, gentle bounce or sparkle effect), acknowledging my achievement before returning to idle state.

**Why this priority**: Celebrates meaningful milestones (clearing an entire quadrant) with slightly more visible feedback than individual task completion, creating a sense of accomplishment.

**Independent Test**: Can be tested by completing all tasks in any quadrant and observing the celebration animation. Delivers enhanced motivation for achieving larger goals.

**Acceptance Scenarios**:

1. **Given** a quadrant has multiple incomplete tasks, **When** I complete the final task in that quadrant, **Then** the companion performs a small celebration animation (more visible than regular task completion)
2. **Given** the companion celebrates quadrant completion, **When** the celebration animation completes, **Then** the companion returns smoothly to idle state
3. **Given** multiple quadrants are cleared in succession, **When** each quadrant is completed, **Then** the companion celebrates each milestone appropriately
4. **Given** the celebration is playing, **When** I observe the animation, **Then** it feels like a gentle reward—not aggressive or cartoonish

---

### User Story 4 - Inactivity Tired State (Priority: P3)

As a user, when I haven't completed any tasks for an extended period, the companion gradually transitions to a "tired" state (dimmed appearance, slower movements, gentle downward sag), subtly encouraging me to engage with my tasks without being pushy.

**Why this priority**: Adds gentle nudging for long periods of inactivity, but this is less critical than the positive reinforcement behaviors. Nice-to-have for encouraging engagement.

**Independent Test**: Can be tested by leaving the app idle for the defined inactivity period and observing the tired state transition. Delivers gentle encouragement without nagging.

**Acceptance Scenarios**:

1. **Given** no tasks have been completed for an extended period (e.g., several hours), **When** the inactivity threshold is reached, **Then** the companion gradually transitions to a "tired" state
2. **Given** the companion is in tired state, **When** I complete a task, **Then** the companion immediately perks up and returns to motivated/idle state
3. **Given** the companion is tired, **When** I observe its appearance, **Then** it shows a dimmed glow, slower idle animations, and a gentle downward position shift
4. **Given** the tired state is active, **When** I interact with the app (without completing tasks), **Then** the companion remains tired until actual task progress occurs

---

### User Story 5 - Companion Settings Control (Priority: P1)

As a user, I can enable or disable the companion character through the settings menu, allowing me to choose whether I want this feature active based on my personal preference.

**Why this priority**: Critical for user control—some users may prefer the pure minimal interface without any companion. This ensures the feature is optional and respects user choice.

**Independent Test**: Can be tested by toggling the companion setting on/off and verifying the companion appears/disappears accordingly. Delivers user autonomy and customization.

**Acceptance Scenarios**:

1. **Given** I open the Settings modal, **When** I view the settings options, **Then** I see a toggle control labeled "Show Companion" or similar
2. **Given** the companion is enabled, **When** I toggle the setting to disabled, **Then** the companion smoothly fades out and is hidden from the interface
3. **Given** the companion is disabled, **When** I toggle the setting to enabled, **Then** the companion smoothly fades in and appears in its idle state
4. **Given** I change the companion setting, **When** I reload the app, **Then** my preference is remembered and the companion state matches my last choice
5. **Given** the companion is disabled, **When** I complete tasks or perform actions, **Then** no companion animations or elements appear

---

### User Story 6 - Interactive Touch/Click Reactions (Priority: P2)

As a user, when I click or tap on the companion character, it responds with one of several playful reaction animations, creating a moment of delight and interaction without disrupting my workflow.

**Why this priority**: Adds interactive engagement and personality—allows users to directly interact with the companion for a brief moment of connection. Enhances the feeling that the companion is "alive" and responsive.

**Independent Test**: Can be tested by clicking/tapping the companion and observing different reaction animations across multiple interactions. Delivers interactive delight and user engagement.

**Acceptance Scenarios**:

1. **Given** the companion is in any state, **When** I click or tap on it, **Then** it performs one of 2-3 distinct reaction animations (e.g., happy bounce, curious tilt, shy wiggle)
2. **Given** I interact with the companion multiple times, **When** I click/tap repeatedly, **Then** the companion cycles through or randomly selects different reaction animations to maintain variety
3. **Given** the companion performs an interaction reaction, **When** the animation completes, **Then** it smoothly returns to its previous state (idle, tired, etc.)
4. **Given** the companion is reacting to a click, **When** I click again during the animation, **Then** the system queues or ignores the input to prevent animation interruption or stacking
5. **Given** I click the companion during a task completion or celebration animation, **When** the click occurs, **Then** the current animation completes first before showing the interaction reaction (or the click is gracefully ignored)
6. **Given** the companion is clicked, **When** the reaction animation plays, **Then** it feels playful and minimal—small movements, gentle bounces, or subtle expressions without being distracting

---

### Edge Cases

- What happens when the companion is animating during a state transition and the user triggers another reaction (e.g., completes a task while quadrant celebration is playing)?
- How does the companion behave when the screen is very small (mobile devices) and positioning near the logo may overlap with critical UI?
- What happens if the user completes all tasks across all quadrants—does the companion have a special "all clear" state?
- How does the companion handle rapid task completion/deletion cycles (e.g., user repeatedly marking complete/incomplete)?
- What happens when the user has the companion disabled but then re-enables it—does it remember the current state (tired vs idle) or reset to default?
- How does the companion interact with reduced motion preferences—should animations be disabled entirely or simplified?
- What happens when a user clicks the companion during an automatic state transition (e.g., during task completion reaction or tired state transition)?
- How does the system handle rapid repeated clicks on the companion—should there be a cooldown period or animation queuing?
- On touch devices, how do we distinguish between intentional taps and accidental touches during scrolling or other gestures?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display a small companion character positioned near the top corner of the screen (near logo area) that does not block or overlay any interactive UI elements
- **FR-002**: Companion MUST have distinct behavioral states: idle, motivated, celebrating, tired, and 2-3 interactive reaction states (e.g., happy, curious, playful)
- **FR-003**: Companion MUST perform subtle idle animations (small movements, gentle pulses) when in idle state with timing that feels calm and non-intrusive
- **FR-004**: Companion MUST react to individual task completion by transitioning to motivated state with subtle visual changes (glow, small upward movement) for a brief duration before returning to idle
- **FR-005**: Companion MUST react to quadrant completion by performing a celebration animation (more pronounced glow, gentle bounce or sparkle) before returning to idle
- **FR-006**: Companion MUST transition to tired state after a period of task inactivity (visual changes: dimmed appearance, slower movements, gentle downward sag)
- **FR-007**: Companion MUST return from tired state to normal state immediately upon task completion
- **FR-008**: Companion MUST be clickable/tappable and respond with one of 2-3 distinct playful reaction animations when user interacts with it directly
- **FR-009**: Companion MUST cycle through or randomly vary interactive reactions across multiple clicks to maintain variety and prevent repetitive responses
- **FR-010**: System MUST provide a settings toggle that allows users to enable or disable the companion character
- **FR-011**: System MUST persist the user's companion enabled/disabled preference across sessions
- **FR-012**: Companion MUST gracefully handle animation queuing when multiple state triggers occur in quick succession (no stacking or overwhelming animations)
- **FR-013**: Companion MUST handle click/tap interactions appropriately—either completing current animation first or gracefully ignoring rapid repeated inputs
- **FR-014**: Companion animations MUST respect the user's reduced motion accessibility preference (simplified or disabled animations)
- **FR-015**: Companion MUST remain visible but non-intrusive across different screen sizes and responsive breakpoints
- **FR-016**: All companion animations MUST feel soft and minimal—using light glow changes, tiny movements, and small pulses rather than aggressive or cartoonish effects
- **FR-017**: Companion state transitions MUST be smooth with appropriate easing and timing to maintain the calm aesthetic
- **FR-018**: Interactive reaction animations MUST feel playful yet minimal—small bounces, gentle tilts, or subtle wiggle movements that fit the overall calm design

### Key Entities

- **Companion**: Represents the character's visual presence and behavior

  - **State**: Current behavioral mode (idle, motivated, celebrating, tired, or interactive reaction states)
  - **Position**: Screen location (corner near logo)
  - **Enabled**: User preference for visibility (true/false)
  - **Last Interaction Time**: Timestamp of last task completion (used for tired state detection)
  - **Animation Queue**: Manages pending state transitions and reactions
  - **Reaction Types**: Set of 2-3 distinct interactive animations (e.g., happy bounce, curious tilt, playful wiggle)
  - **Clickable/Tappable**: Interactive element that responds to user input

- **Companion Settings**: User preference data
  - **Show Companion**: Boolean toggle stored in user preferences
  - **Persisted**: Saved to local storage alongside other app settings

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Companion character is visible and displays idle animations within 1 second of app load (when enabled)
- **SC-002**: Task completion triggers companion reaction within 200ms, creating immediate feedback
- **SC-003**: Companion reactions complete and return to idle state within 1-2 seconds, maintaining workflow continuity
- **SC-004**: Companion positioning never overlaps or blocks interactive elements across all supported screen sizes (desktop, tablet, mobile)
- **SC-005**: Users can toggle companion visibility in settings, with changes taking effect immediately and persisting across sessions
- **SC-006**: Companion animations respect reduced motion preferences—either simplified or fully disabled based on system settings
- **SC-007**: 90% of users can complete their tasks without the companion feeling distracting or intrusive (measured through user testing or feedback)
- **SC-008**: Companion state transitions are smooth and feel natural, with no jarring or abrupt animation changes
- **SC-009**: Inactivity threshold triggers tired state after 2 hours of no task completions
- **SC-010**: Companion visual design aligns with the app's minimal, calm aesthetic—feels like a natural part of the interface
- **SC-011**: Click/tap interactions trigger one of 2-3 distinct reaction animations within 100ms, providing immediate responsive feedback
- **SC-012**: Interactive reactions complete within 1-1.5 seconds and companion returns to previous state, maintaining smooth user experience
- **SC-013**: Users can interact with companion multiple times with varied reactions, creating a sense of playful engagement without feeling repetitive

## Assumptions

- The companion will use abstract/minimal visual design (e.g., geometric shape with glow effects, soft orb, or simple icon-based character) rather than detailed illustrations
- Default setting will have the companion enabled, but users can immediately disable it if preferred
- Inactivity period for tired state is 2 hours of no task completions
- Companion will use CSS animations and/or lightweight animation libraries (consistent with existing Framer Motion usage) for smooth performance
- Companion reactions will not emit sounds by default (respects existing sound settings in app)
- Mobile viewports will position companion in a corner that doesn't interfere with header controls (may shift position on very small screens)
- All states and preferences will use the existing Zustand store pattern for state management
- Companion will be rendered as part of the layout component to ensure persistent visibility across routes
- Interactive reactions will include 2-3 distinct animation types (e.g., happy bounce, curious head tilt, playful wiggle) to provide variety
- Click/tap interaction area will be slightly larger than the visual companion size to ensure easy targeting on touch devices
- Rapid repeated clicks will either queue gracefully or apply a brief cooldown period (~500ms) to prevent animation spam
- On touch devices, standard tap event handling will be used (not long-press or complex gestures)
