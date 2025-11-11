"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCompanion } from "../hooks/useCompanion";
import { useReducedMotion } from "../hooks/useReducedMotion";
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
  const { showCompanion } = useTodos();
  const { enabled, handleClick, state: companionState } = useCompanionStore();
  const { theme } = useCompanion();
  const prefersReducedMotion = useReducedMotion();

  const [currentFrame, setCurrentFrame] = useState(0);
  const [idleSequenceIndex, setIdleSequenceIndex] = useState(0); // Track position in idle sequence (360° rotation)
  const [animationIndex, setAnimationIndex] = useState(0); // Track position in animation sequence (T027)
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isMounted, setIsMounted] = useState(false);

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
            // Sequence complete - transition back to idle (but not for exiting state)
            if (companionState !== "exiting" && companionState !== "entering") {
              useCompanionStore.getState().transitionTo("idle");
            } else if (companionState === "entering") {
              // Entering animation finished, now go to idle
              useCompanionStore.getState().transitionTo("idle");
            }
            // For exiting, don't transition - let the unmount happen
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
  ]);

  // Handle showing/hiding companion with proper animations
  useEffect(() => {
    if (enabled && showCompanion && isMounted) {
      // Show: force entering animation (bypasses state machine validation)
      useCompanionStore.getState().transitionTo("entering");
    } else if ((!enabled || !showCompanion) && isMounted) {
      // Hide: trigger exiting animation
      const currentState = useCompanionStore.getState().state;
      if (currentState !== "exiting") {
        useCompanionStore.getState().transitionTo("exiting");
      }
    }
  }, [enabled, showCompanion, isMounted]);

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
        onClick={handleClick}
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
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 1, scale: 1, y: -100 }}
          whileHover={!prefersReducedMotion ? { scale: 1.1 } : undefined}
          whileTap={!prefersReducedMotion ? { scale: 0.95 } : undefined}
          transition={{
            y: { duration: 0.8, ease: "easeInOut" },
            opacity: { duration: 0.3 },
            scale: { duration: 0.2, ease: "easeOut" },
          }}
          className="fixed top-4 right-4 md:top-6 md:right-6 z-50 pointer-events-auto cursor-pointer"
          onClick={handleClick}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
