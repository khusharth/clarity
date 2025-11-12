"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCompanion } from "../hooks/useCompanion";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useSfx } from "../hooks/useSfx";
import { useTodos } from "../store/todos";
import { useCompanionStore } from "../store/companion";
import {
  SPRITE_SIZE,
  SPRITE_SCALE,
  spriteMap,
  stateAnimationMap,
  getSpritePosition,
  type AnimationType,
} from "../lib/companion-animations";

/**
 * Companion component displays an animated sprite character in the corner
 * that reacts to user activity and provides visual feedback
 */
export default function Companion() {
  const { showCompanion, isFocus } = useTodos();
  const companionStore = useCompanionStore();
  const {
    enabled,
    handleClick,
    state: companionState,
    lastClickTime,
  } = companionStore;
  const { theme } = useCompanion();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 768px)"); // Detect mobile viewport
  const sfx = useSfx();

  const [currentFrame, setCurrentFrame] = useState(0);
  const [idleSequenceIndex, setIdleSequenceIndex] = useState(0); // Track position in idle sequence (360° rotation)
  const [animationIndex, setAnimationIndex] = useState(0); // Track position in animation sequence (T027)
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isInFocusPosition, setIsInFocusPosition] = useState(false); // Track if companion is at focus position

  // Wrapper for handleClick that plays sound only when awake and click will be processed
  const handleClickWithSound = () => {
    const now = Date.now();

    // Check if click will be blocked (replicate store logic)
    // Don't play sound if in cooldown
    if (now - lastClickTime < 500) {
      handleClick();
      return;
    }

    // Don't play sound if tired (will just wake up)
    if (companionState === "tired") {
      handleClick();
      return;
    }

    // Don't play sound if already celebrating or motivated (block entire animation)
    if (companionState === "motivated" || companionState === "celebrating") {
      handleClick();
      return;
    }

    // Play howl sound only when click will actually trigger celebrating animation
    sfx.dogHowl();
    handleClick();
  };

  // Only render on client to avoid SSR hydration mismatch
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, []);

  // Get idle animation based on sequence index
  const idleAnimations = stateAnimationMap.idle;
  const idleVariant = idleAnimations[idleSequenceIndex];

  // Get animation sequence for current state
  const animationSequence =
    companionState !== "idle"
      ? stateAnimationMap[companionState]
      : [idleVariant];

  // Derive current animation from sequence index with bounds checking (T027)
  const safeAnimationIndex = Math.min(
    animationIndex,
    animationSequence.length - 1
  );
  const currentAnimation: AnimationType =
    animationSequence[safeAnimationIndex] || "idleFront";

  // Get current animation config
  const animationConfig = spriteMap[currentAnimation];

  // Reset animation sequence when state changes
  useEffect(() => {
    setAnimationIndex(0);
  }, [companionState]);

  // Cycle through animation frames
  useEffect(() => {
    // Reset frame counter when animation changes to ensure clean start
    setCurrentFrame(0);

    if (!showCompanion || !enabled || prefersReducedMotion) {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      return;
    }

    // Animation frame cycling logic
    let frameCount = 0; // Local frame counter to avoid stale closure
    const cycleFrames = () => {
      // For tired state, play once then stay on last frame
      if (companionState === "tired") {
        if (frameCount < animationConfig.frames - 1) {
          frameCount++;
          setCurrentFrame(frameCount);
        }
        // Stay on last frame (don't cycle back to 0)
        return;
      }

      // Normal cycling for other states
      frameCount = (frameCount + 1) % animationConfig.frames;
      setCurrentFrame(frameCount);

      // When animation completes (returns to frame 0)
      if (frameCount === 0) {
        // If in idle state, cycle to next animation (360° rotation)
        if (companionState === "idle") {
          setIdleSequenceIndex((prevIndex) => {
            // Loop back to start after reaching the end
            return (prevIndex + 1) % idleAnimations.length;
          });
        } else {
          // Non-idle animation completed - check if there are more in sequence (T027)
          const sequence = stateAnimationMap[companionState];
          const nextIndex = animationIndex + 1;

          if (nextIndex < sequence.length) {
            // More animations in sequence - pause briefly then play next (T028)
            if (animationIntervalRef.current) {
              clearInterval(animationIntervalRef.current);
              animationIntervalRef.current = null;
            }

            // Smooth transition for waking state (no pause), brief pause for others
            const pauseDuration = companionState === "waking" ? 0 : 100;

            setTimeout(() => {
              setAnimationIndex(nextIndex);
              setCurrentFrame(0);
            }, pauseDuration);
          } else {
            // Sequence complete - handle state-specific transitions
            if (companionState === "entering") {
              // Entering animation finished
              // Check if we should go to focus mode or idle (skip focus on mobile)
              if (isFocus && !isMobile) {
                useCompanionStore.getState().transitionTo("focusing");
              } else {
                useCompanionStore.getState().transitionTo("idle");
              }
            } else if (companionState === "focusing") {
              // Reached focus position, stay focused
              useCompanionStore.getState().transitionTo("focused");
            } else if (companionState === "unfocusing") {
              // Returned from focus position, back to idle
              useCompanionStore.getState().transitionTo("idle");
            } else if (companionState === "waking") {
              // Check if we should celebrate after waking (task completion while sleeping)
              const shouldCelebrate =
                useCompanionStore.getState().shouldCelebrateAfterWaking;
              if (shouldCelebrate) {
                useCompanionStore.setState({
                  shouldCelebrateAfterWaking: false,
                });
                useCompanionStore.getState().transitionTo("celebrating");
              } else if (isFocus && !isMobile) {
                // Woke up during focus mode (desktop only), go straight to focusing
                useCompanionStore.getState().transitionTo("focusing");
              } else {
                // Normal wake up, go to idle
                useCompanionStore.getState().transitionTo("idle");
              }
            } else if (
              companionState !== "exiting" &&
              companionState !== "focused"
            ) {
              // Default: transition back to idle (except exiting and focused states)
              useCompanionStore.getState().transitionTo("idle");
            }
            // For exiting and focused, don't auto-transition
          }
        }
      }
    };

    // Start frame cycling interval
    animationIntervalRef.current = setInterval(
      cycleFrames,
      animationConfig.duration / animationConfig.frames
    );

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    };
  }, [
    showCompanion,
    enabled,
    prefersReducedMotion,
    currentAnimation,
    companionState,
    animationIndex,
    animationConfig.duration,
    animationConfig.frames,
    idleAnimations.length,
    isFocus,
    isMobile,
  ]);

  // Handle showing/hiding companion with proper animations
  useEffect(() => {
    if (enabled && showCompanion && isMounted) {
      // Show: force entering animation (bypasses state machine validation)
      useCompanionStore.getState().transitionTo("entering");
      // Reset focus position flag when showing companion
      // If already in focus mode, the focus effect will handle re-entry
      setIsInFocusPosition(false);
    } else if ((!enabled || !showCompanion) && isMounted) {
      // Hide: trigger exiting animation
      const currentState = useCompanionStore.getState().state;
      if (currentState !== "exiting") {
        useCompanionStore.getState().transitionTo("exiting");
      }
      // Reset focus position flag when hiding
      setIsInFocusPosition(false);
    }
  }, [enabled, showCompanion, isMounted]);

  // Handle focus mode transitions
  useEffect(() => {
    if (!isMounted || !enabled || !showCompanion) return;

    const currentState = useCompanionStore.getState().state;

    // On mobile, just wake up if sleeping but don't move
    if (isMobile && isFocus) {
      if (currentState === "tired") {
        useCompanionStore.getState().transitionTo("waking");
      }
      return; // Skip focus positioning on mobile
    }

    if (isFocus && !isInFocusPosition) {
      // Entering focus mode - wake up if sleeping, then move to focus position
      if (currentState === "tired") {
        // Wake up first, then transition to focusing
        useCompanionStore.getState().transitionTo("waking");
        // After waking animation completes, it will auto-transition through the state machine
        // We'll need to catch this in the animation completion handler
      } else if (
        currentState !== "focusing" &&
        currentState !== "focused" &&
        currentState !== "exiting" &&
        currentState !== "entering" // Don't interrupt entering animation
      ) {
        useCompanionStore.getState().transitionTo("focusing");
      }
      setIsInFocusPosition(true);
    } else if (!isFocus && isInFocusPosition) {
      // Exiting focus mode - return to normal position
      if (currentState === "focused") {
        useCompanionStore.getState().transitionTo("unfocusing");
      }
      setIsInFocusPosition(false);
    }
  }, [isFocus, isMounted, enabled, showCompanion, isInFocusPosition, isMobile]);

  // Don't render during SSR to avoid hydration mismatch
  if (!isMounted) {
    return null;
  }

  // Calculate sprite position for current frame
  const position = getSpritePosition(currentAnimation, currentFrame);
  const backgroundPosition = `${position.x}px ${position.y}px`;

  // Static sprite for reduced motion
  if (prefersReducedMotion) {
    return (
      <div
        className="fixed top-4 right-4 md:top-6 md:right-6 z-50 pointer-events-auto cursor-pointer"
        onClick={handleClickWithSound}
        role="img"
        aria-label="Companion character"
      >
        <div
          className="bg-center bg-no-repeat"
          style={{
            width: `${SPRITE_SIZE * SPRITE_SCALE}px`,
            height: `${SPRITE_SIZE * SPRITE_SCALE}px`,
            backgroundImage: `url(/companion-${theme}.png)`,
            backgroundPosition,
            backgroundSize: `${SPRITE_SIZE * SPRITE_SCALE * 5}px auto`,
            imageRendering: "pixelated",
          }}
        />
      </div>
    );
  }

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        // Reset to idle after exit animation completes
        useCompanionStore.getState().transitionTo("idle");
      }}
    >
      {enabled && showCompanion && (
        <motion.div
          key="companion"
          initial={{ opacity: 1, scale: 1, y: -100 }}
          animate={{
            opacity: 1,
            scale: 1,
            // Move down first, then to center for focus mode
            y:
              companionState === "focused" || companionState === "focusing"
                ? 38 // Move down below logo, above quadrants
                : 0, // Normal position (top)
            x:
              companionState === "focused" || companionState === "focusing"
                ? "calc(-50vw + 100%)" // Move to horizontal center of screen
                : 0, // Normal position (right edge)
          }}
          exit={{ opacity: 1, scale: 1, y: -100 }}
          whileHover={!prefersReducedMotion ? { scale: 1.1 } : undefined}
          whileTap={!prefersReducedMotion ? { scale: 0.95 } : undefined}
          transition={{
            y: { duration: 0.6, ease: "easeInOut" }, // Move down/up
            x: {
              duration: 1.8,
              ease: "easeInOut",
              delay: companionState === "focusing" ? 0.3 : 0, // Delay horizontal movement when focusing
            },
            opacity: { duration: 0.3 },
            scale: { duration: 0.2, ease: "easeOut" },
          }}
          className="fixed top-4 right-4 md:top-6 md:right-6 z-50 pointer-events-auto cursor-pointer"
          onClick={handleClickWithSound}
          role="img"
          aria-label="Companion character"
        >
          <div
            className="bg-center bg-no-repeat"
            style={{
              width: `${SPRITE_SIZE * SPRITE_SCALE}px`,
              height: `${SPRITE_SIZE * SPRITE_SCALE}px`,
              backgroundImage: `url(/companion-${theme}.png)`,
              backgroundPosition,
              backgroundSize: `${SPRITE_SIZE * SPRITE_SCALE * 5}px auto`,
              imageRendering: "pixelated",
              transform:
                companionState === "focusing"
                  ? "scaleX(-1)" // Flip left when moving to focus position
                  : companionState === "unfocusing"
                  ? "scaleX(1)" // Face right when returning from focus
                  : "scaleX(1)", // Normal orientation (no flip for celebrating)
              transition: "transform 0.2s ease-out",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
