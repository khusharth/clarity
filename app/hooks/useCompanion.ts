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
import { getSpritePosition, type CompanionStateType, type AnimationType } from "../lib/companion-animations";
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
      console.log("[Companion] Not subscribing - companion disabled");
      return;
    }

    console.log("[Companion] Setting up task completion subscription");

    // Track previous completed count to detect new completions
    let prevCompletedCount = useTodos.getState().tasks.filter((t: Task) => t.status === "completed").length;
    console.log("[Companion] Initial completed count:", prevCompletedCount);

    const unsubscribe = useTodos.subscribe((state) => {
      const tasks = state.tasks;

      // Count completed tasks
      const completedCount = tasks.filter((t: Task) => t.status === "completed").length;
      const newCompletions = completedCount - prevCompletedCount;

      console.log("[Companion] Task state update - prev:", prevCompletedCount, "current:", completedCount, "new:", newCompletions);

      if (newCompletions > 0 && store.enabled) {
        console.log("[Companion] New task completion detected!");
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
          // Check if entire quadrant is cleared
          const quadrantTasks = tasks.filter(
            (t: Task) =>
              t.isImportant === lastCompleted.isImportant &&
              t.isUrgent === lastCompleted.isUrgent
          );
          const quadrantCleared = quadrantTasks.every((t: Task) => t.status === "completed");

          console.log("[Companion] Quadrant check - cleared:", quadrantCleared, "state:", store.state);

          // Wake up if tired, otherwise celebrate or react
          if (store.state === "tired") {
            console.log("[Companion] Waking up from tired state");
            store.transitionTo("motivated");
          } else {
            const targetState = quadrantCleared ? "celebrating" : "motivated";
            console.log("[Companion] Transitioning to:", targetState);
            store.transitionTo(targetState);
          }
        }

        // Update previous count for next comparison
        prevCompletedCount = completedCount;
      }
    });

    return unsubscribe;
  }, [store]);

  // Check inactivity every minute
  useEffect(() => {
    if (!store.enabled) return;

    const interval = setInterval(() => {
      store.checkInactivity();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [store]);

  // Sync theme from document data-theme attribute
  useEffect(() => {
    const updateTheme = () => {
      const dataTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = dataTheme === "dark" ? "dark" : "light";
      
      console.log("[Companion] Theme check - data-theme:", dataTheme, "newTheme:", newTheme, "currentTheme:", store.theme);
      
      // Only update if theme actually changed to prevent infinite loops
      if (store.theme !== newTheme) {
        console.log("[Companion] Theme changed, syncing to:", newTheme);
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
