/**
 * Companion Animation Utilities
 *
 * Defines sprite sheet configuration, animation types, and state-to-animation mappings
 * for the companion character feature.
 *
 * Sprite Sheet Structure:
 * - Dimensions: 160x502px (actual sprite sheets)
 * - Each sprite: 32x32px
 * - Layout: 5 columns × ~15 rows
 * - Column 1: Labels (skipped via startX offset)
 * - Columns 2-4: Animation frames (3 frames per animation)
 */

export const SPRITE_SIZE = 32; // Each individual sprite is 32x32px
export const SPRITE_SCALE = 2; // Display at 64x64px (2x for clarity)

/**
 * Animation types mapped to sprite sheet rows
 */
export type AnimationType =
  | "idleFront"
  | "idleSide"
  | "idleBack"
  | "idleDiaUp"
  | "idleDiaDown"
  | "runFront"
  | "runSide"
  | "runBack"
  | "runDiaUp"
  | "runDiaDown"
  | "wakeUp"
  | "sleep"
  | "wuff";

/**
 * Companion behavioral states
 */
export type CompanionStateType =
  | "entering" // Initial entrance animation
  | "exiting" // Exit animation when toggling off
  | "idle" // Default resting state
  | "motivated" // Task completion reaction
  | "celebrating" // Quadrant clear celebration
  | "tired" // 2-hour inactivity state
  | "waking" // Waking up from tired state
  | "focusing" // Moving to focus position (left side near logo)
  | "focused" // Sitting in focus position
  | "unfocusing" // Returning from focus position
  | "happy" // Interactive reaction 1
  | "curious" // Interactive reaction 2
  | "playful"; // Interactive reaction 3

/**
 * Sprite configuration for each animation type
 */
export interface SpriteConfig {
  row: number; // Vertical position (0-based row index)
  frames: number; // Number of animation frames
  startX: number; // Horizontal offset to skip label column (32px)
  duration: number; // Total animation duration in milliseconds
}

/**
 * Sprite map: animation type → sprite sheet configuration
 *
 * Each animation has 3 frames starting after the 32px label column
 */
export const spriteMap: Record<AnimationType, SpriteConfig> = {
  idleFront: { row: 0, frames: 3, startX: 32, duration: 1200 }, // 400ms per frame
  idleSide: { row: 1, frames: 3, startX: 32, duration: 1200 },
  idleBack: { row: 2, frames: 3, startX: 32, duration: 1200 },
  runFront: { row: 3, frames: 3, startX: 32, duration: 600 },
  runSide: { row: 4, frames: 3, startX: 32, duration: 600 },
  runBack: { row: 5, frames: 3, startX: 32, duration: 600 },
  idleDiaUp: { row: 6, frames: 3, startX: 32, duration: 1200 },
  idleDiaDown: { row: 7, frames: 3, startX: 32, duration: 1200 },
  runDiaUp: { row: 8, frames: 3, startX: 32, duration: 600 }, // Faster for running
  runDiaDown: { row: 9, frames: 3, startX: 32, duration: 600 },
  wakeUp: { row: 10, frames: 4, startX: 32, duration: 2000 }, // Slow wake up (500ms per frame)
  sleep: { row: 11, frames: 4, startX: 32, duration: 2400 }, // Slower for sleeping
  wuff: { row: 12, frames: 3, startX: 32, duration: 1200 },
};

/**
 * State-to-animation mapping: defines which animations play for each state
 *
 * Idle cycles through multiple poses for variety
 * Other states have specific animation sequences
 */
export const stateAnimationMap: Record<CompanionStateType, AnimationType[]> = {
  entering: ["runFront", "runFront", "runFront"], // Walk in from top (3 cycles)
  exiting: ["runBack", "runBack", "runBack"], // Walk away to top (3 cycles, backwards)
  idle: ["idleFront"], // Stay facing forward in idle state
  motivated: ["wuff"], // Excited bark on task completion
  celebrating: [
    "idleFront",
    "idleDiaDown",
    "idleSide",
    "idleDiaUp",
    "idleBack",
    "idleDiaUp",
    "idleSide",
    "idleDiaDown",
    "idleFront",
  ], // Full 360° spin + bark
  tired: ["sleep"], // Sleeping loop for inactivity
  waking: ["wakeUp", "idleFront"], // Wake up animation then settle into idle
  focusing: ["runSide", "runSide", "runSide"], // Run to the left (toward logo)
  focused: ["idleFront"], // Sit in focus position
  unfocusing: ["runSide", "runSide", "runSide"], // Run back to normal position
  happy: ["wuff"], // Click reaction 1 - excited bark
  curious: ["idleDiaUp", "idleDiaDown"], // Click reaction 2 - look around
  playful: ["runFront", "runSide", "runBack"], // Click reaction 3 - run around
};

/**
 * Calculate sprite background-position for a given animation and frame
 *
 * @param animation - The animation type to display
 * @param frame - Current frame index (0-based)
 * @returns Object with x and y offsets (negative values for CSS background-position, scaled by SPRITE_SCALE)
 *
 * @example
 * getSpritePosition('wuff', 1) // Returns { x: -128, y: -576 } for 2nd frame of wuff at 2x scale
 */
export function getSpritePosition(
  animation: AnimationType,
  frame: number
): { x: number; y: number } {
  const config = spriteMap[animation];
  return {
    x: -(config.startX + frame * SPRITE_SIZE) * SPRITE_SCALE,
    y: -(config.row * SPRITE_SIZE) * SPRITE_SCALE,
  };
}

/**
 * Get a random idle animation variant
 *
 * @returns Random AnimationType from the idle set
 */
export function getRandomIdleAnimation(): AnimationType {
  const idleAnimations = stateAnimationMap.idle;
  return idleAnimations[Math.floor(Math.random() * idleAnimations.length)];
}

/**
 * Check if a state transition is valid according to the state machine
 *
 * @param from - Current state
 * @param to - Target state
 * @returns True if transition is allowed
 */
export function canTransition(
  from: CompanionStateType,
  to: CompanionStateType
): boolean {
  const validTransitions: Record<CompanionStateType, CompanionStateType[]> = {
    entering: ["idle"], // Entrance animation only transitions to idle
    exiting: [], // Exiting is terminal - no transitions from here
    idle: [
      "motivated",
      "celebrating",
      "tired",
      "happy",
      "curious",
      "playful",
      "exiting",
      "focusing", // Can enter focus mode from idle
    ],
    motivated: ["idle", "celebrating", "exiting", "focusing"],
    celebrating: ["idle", "exiting", "focusing"],
    tired: ["waking", "motivated", "idle", "exiting", "focusing"], // Can wake up on focus mode
    waking: ["idle", "exiting", "focused"], // After waking, go to idle or focus
    focusing: ["focused"], // Move to focus position then stay focused
    focused: ["unfocusing"], // Can only leave focus by unfocusing
    unfocusing: ["idle"], // Return to normal idle position
    happy: ["idle", "exiting", "focusing"],
    curious: ["idle", "exiting", "focusing"],
    playful: ["idle", "exiting", "focusing"],
  };

  return validTransitions[from]?.includes(to) ?? false;
}
