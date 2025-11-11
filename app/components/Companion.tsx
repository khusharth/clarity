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
  getRandomIdleAnimation,
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
  const [idleVariant, setIdleVariant] = useState<AnimationType>(getRandomIdleAnimation());
  const [animationIndex, setAnimationIndex] = useState(0); // Track position in animation sequence (T027)
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Log theme changes only
  useEffect(() => {
    console.log("[Companion Component] Theme changed to:", theme);
  }, [theme]);

  // Only render on client to avoid SSR hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get animation sequence for current state
  const animationSequence = companionState !== "idle" 
    ? stateAnimationMap[companionState] 
    : [idleVariant];

  // Derive current animation from sequence index with bounds checking (T027)
  const safeAnimationIndex = Math.min(animationIndex, animationSequence.length - 1);
  const currentAnimation: AnimationType = animationSequence[safeAnimationIndex] || "idleFront";

  // Get current animation config
  const animationConfig = spriteMap[currentAnimation];

  // Reset animation sequence when state changes
  useEffect(() => {
    setAnimationIndex(0);
  }, [companionState]);

  // Cycle through animation frames
  useEffect(() => {
    // Reset frame counter when animation changes to ensure clean start
    // This is intentional synchronization with external state machine
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
      frameCount = (frameCount + 1) % animationConfig.frames;
      setCurrentFrame(frameCount);

      // When animation completes (returns to frame 0)
      if (frameCount === 0) {
        // If in idle state, pick random idle animation for variety
        if (companionState === "idle") {
          setIdleVariant(getRandomIdleAnimation());
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
            
            setTimeout(() => {
              setAnimationIndex(nextIndex);
              setCurrentFrame(0);
            }, 100); // 100ms pause between celebration animations
          } else {
            // Sequence complete - transition back to idle (T023)
            useCompanionStore.getState().transitionTo("idle");
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
  ]);

  // Don't render during SSR to avoid hydration mismatch
  if (!isMounted || !showCompanion || !enabled) {
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={!prefersReducedMotion ? { scale: 1.1 } : undefined}
        whileTap={!prefersReducedMotion ? { scale: 0.95 } : undefined}
        transition={{ duration: 0.3, ease: "easeOut" }}
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
    </AnimatePresence>
  );
}
