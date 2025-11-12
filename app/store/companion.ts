/**
 * Companion State Management Store
 *
 * Zustand store managing companion character state, animations, and interactions.
 * Implements a state machine for behavioral transitions and handles click interactions.
 */

import { create } from "zustand";
import {
  AnimationType,
  CompanionStateType,
  canTransition,
} from "../lib/companion-animations";

/**
 * Companion store state interface
 */
interface CompanionStore {
  // Current behavioral state
  state: CompanionStateType;

  // User preference for visibility
  enabled: boolean;

  // Timestamp tracking for inactivity detection
  lastTaskCompletionTime: number | null; // Unix timestamp in milliseconds

  // Animation management
  currentAnimation: AnimationType | null;
  currentFrameIndex: number;
  isAnimating: boolean;

  // Click interaction tracking
  lastClickTime: number; // Unix timestamp for cooldown
  clickCount: number; // For cycling through reactions

  // Theme awareness
  theme: "light" | "dark"; // Synced from app theme

  // Pending celebration flag (for wake-up then celebrate flow)
  shouldCelebrateAfterWaking: boolean;

  // Actions

  /**
   * Transition to a new companion state
   *
   * @param newState - Target state to transition to
   */
  transitionTo: (newState: CompanionStateType) => void;

  /**
   * Set the current playing animation
   *
   * @param animation - Animation to play, or null to stop
   */
  setCurrentAnimation: (animation: AnimationType | null) => void;

  /**
   * Update the current frame index during animation
   *
   * @param index - Frame index (0-based)
   */
  setFrameIndex: (index: number) => void;

  /**
   * Handle click/tap interaction on companion
   *
   * Applies cooldown (500ms) and cycles through reaction states.
   * Blocks clicks during high-priority animations (motivated, celebrating).
   */
  handleClick: () => void;

  /**
   * Enable or disable companion visibility
   *
   * @param enabled - True to show companion, false to hide
   */
  setEnabled: (enabled: boolean) => void;

  /**
   * Sync theme from app theme system
   *
   * @param theme - Current app theme ('light' or 'dark')
   */
  syncTheme: (theme: "light" | "dark") => void;

  /**
   * Update timestamp of last task completion
   *
   * Called when user completes a task to reset inactivity timer
   */
  updateLastTaskTime: () => void;

  /**
   * Check for inactivity and transition to tired state if threshold exceeded
   *
   * Should be called periodically (e.g., every 60 seconds)
   * @param isFocusMode - Whether the app is in focus mode (prevents sleeping)
   */
  checkInactivity: (isFocusMode?: boolean) => void;
}

/**
 * Companion state store
 *
 * State machine transitions:
 * - idle → motivated | celebrating | tired | happy | curious | playful
 * - motivated → idle | celebrating
 * - celebrating → idle
 * - tired → motivated | idle
 * - happy | curious | playful → idle
 */
export const useCompanionStore = create<CompanionStore>((set, get) => ({
  // Initial state
  state: "entering",
  enabled: true,
  lastTaskCompletionTime: Date.now(),
  currentAnimation: null,
  currentFrameIndex: 0,
  isAnimating: false,
  lastClickTime: 0,
  clickCount: 0,
  theme: "light",
  shouldCelebrateAfterWaking: false,

  // Actions

  transitionTo: (newState) => {
    const currentState = get().state;

    // Allow force transitions for special flows:
    // - exiting → idle (reset after hiding)
    // - any state → entering (force entering on show, even from exiting/persisted state)
    // - any state → focusing (force focus mode from any state)
    // - any state → celebrating (force celebration on task completion from any state)
    const isForceTransition =
      (currentState === "exiting" && newState === "idle") ||
      newState === "entering" ||
      newState === "focusing" ||
      newState === "celebrating";

    // Validate transition
    if (!isForceTransition && !canTransition(currentState, newState)) {
      console.warn(
        `Invalid companion state transition: ${currentState} → ${newState}`
      );
      return;
    }

    set({ state: newState });
  },

  setCurrentAnimation: (animation) => {
    set({ currentAnimation: animation, isAnimating: !!animation });
  },

  setFrameIndex: (index) => {
    set({ currentFrameIndex: index });
  },

  handleClick: () => {
    const now = Date.now();
    const { lastClickTime, state, isAnimating } = get();

    // Apply 500ms cooldown
    if (now - lastClickTime < 500) {
      return;
    }

    // Wake up if sleeping - play wakeUp animation then idleFront
    if (state === "tired") {
      get().transitionTo("waking");
      set({
        lastClickTime: now,
        lastTaskCompletionTime: now, // Reset inactivity timer
      });
      return;
    }

    // Block clicks during high-priority animations
    if ((state === "motivated" || state === "celebrating") && isAnimating) {
      return;
    }

    // Click triggers a spin animation (celebrating state)
    set({
      lastClickTime: now,
    });

    get().transitionTo("celebrating");
  },

  setEnabled: (enabled) => {
    set({ enabled });
  },

  syncTheme: (theme) => {
    set({ theme });
  },

  updateLastTaskTime: () => {
    set({ lastTaskCompletionTime: Date.now() });
  },

  checkInactivity: (isFocusMode = false) => {
    const { lastTaskCompletionTime, state } = get();
    if (!lastTaskCompletionTime) return;

    // Don't sleep in focus mode
    if (isFocusMode) return;

    const elapsed = Date.now() - lastTaskCompletionTime;
    const fifteenSeconds = 15 * 1000; // 15000ms

    // Transition to tired if inactive for 15 seconds and not already tired
    if (elapsed >= fifteenSeconds && state !== "tired") {
      get().transitionTo("tired");
    }
  },
}));
