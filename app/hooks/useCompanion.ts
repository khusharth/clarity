/**
 * useCompanion Hook
 *
 * Main hook for accessing and controlling companion state.
 * Handles theme sync, task completion subscriptions, and sprite position calculations.
 */

"use client";

import { useEffect, useMemo } from "react";
import { useCompanionStore } from "../store/companion";
import { useTodos } from "../store/todos";
import {
  getSpritePosition,
  type CompanionStateType,
  type AnimationType,
} from "../lib/companion-animations";
import type { Task } from "../lib/schema";

/**
 * Companion hook return type
 */
export interface UseCompanionReturn {
  // Current state
  state: CompanionStateType;
  enabled: boolean;
  isAnimating: boolean;
  theme: "light" | "dark";

  // Current animation details
  currentAnimation: AnimationType | null;
  currentFrameIndex: number;
  spritePosition: { x: number; y: number };

  // Actions
  handleClick: () => void;
  transitionTo: (newState: CompanionStateType) => void;
  setEnabled: (enabled: boolean) => void;
  setCurrentAnimation: (animation: AnimationType | null) => void;
  setFrameIndex: (index: number) => void;
}

/**
 * useCompanion Hook
 *
 * Provides companion state management, theme synchronization,
 * task completion detection, and inactivity monitoring.
 *
 * @returns Companion state and control functions
 *
 * @example
 * const { state, spritePosition, handleClick } = useCompanion();
 */
export function useCompanion(): UseCompanionReturn {
  const store = useCompanionStore();

  // Subscribe to task completions
  useEffect(() => {
    if (!store.enabled) {
      return;
    }

    // Track previous completed count to detect new completions
    let prevCompletedCount = useTodos
      .getState()
      .tasks.filter((t: Task) => t.status === "completed").length;

    const unsubscribe = useTodos.subscribe((state) => {
      const tasks = state.tasks;

      // Count completed tasks
      const completedCount = tasks.filter(
        (t: Task) => t.status === "completed"
      ).length;
      const newCompletions = completedCount - prevCompletedCount;

      if (newCompletions > 0 && store.enabled) {
        store.updateLastTaskTime();

        // Find the last completed task
        const lastCompleted = tasks
          .filter((t: Task) => t.status === "completed")
          .sort((a: Task, b: Task) => {
            const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
            const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
            return bTime - aTime;
          })[0];

        if (lastCompleted) {
          // Always celebrate on task completion (360° spin)
          // Wake up if tired, otherwise always celebrate
          if (store.state === "tired") {
            store.transitionTo("celebrating");
          } else {
            store.transitionTo("celebrating");
          }
        }

        // Update previous count for next comparison
        prevCompletedCount = completedCount;
      }
    });

    return unsubscribe;
  }, [store]);

  // Check inactivity frequently for testing
  useEffect(() => {
    if (!store.enabled) return;

    const interval = setInterval(() => {
      store.checkInactivity();
    }, 5000); // Check every 5 seconds (for 10 second timeout)

    return () => clearInterval(interval);
  }, [store]);

  // Sync theme from document data-theme attribute
  useEffect(() => {
    const updateTheme = () => {
      const dataTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = dataTheme === "dark" ? "dark" : "light";

      // Only update if theme actually changed to prevent infinite loops
      if (store.theme !== newTheme) {
        store.syncTheme(newTheme);
      }
    };

    // Initial sync
    updateTheme();

    // Observe theme changes via data-theme attribute
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, [store]);

  // Calculate current sprite position
  const spritePosition = useMemo(() => {
    if (!store.currentAnimation) {
      return { x: 0, y: 0 };
    }
    return getSpritePosition(store.currentAnimation, store.currentFrameIndex);
  }, [store.currentAnimation, store.currentFrameIndex]);

  return {
    state: store.state,
    enabled: store.enabled,
    isAnimating: store.isAnimating,
    theme: store.theme,
    currentAnimation: store.currentAnimation,
    currentFrameIndex: store.currentFrameIndex,
    spritePosition,
    handleClick: store.handleClick,
    transitionTo: store.transitionTo,
    setEnabled: store.setEnabled,
    setCurrentAnimation: store.setCurrentAnimation,
    setFrameIndex: store.setFrameIndex,
  };
}
