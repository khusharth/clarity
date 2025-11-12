import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task } from "../lib/schema";
import { loadAllTasks, saveTask, deleteTask } from "../lib/persistence";
import type { QuadrantId } from "../hooks/useDragAndDrop";
import { computeQuadrant } from "../lib/schema";

type ImportExportBundle = { tasks: Task[] };

interface TodosState {
  tasks: Task[];
  isHydrated: boolean;
  // Focus mode state
  isFocus: boolean;
  focusMode: "all" | "single";
  activeTaskId: string | null;
  // UI feedback
  confettiKey: number;
  // Preferences
  reducedMotionPref: boolean;
  soundEnabled: boolean;
  themePreference: "light" | "dark";
  showOverallCount: boolean;
  showQuadrantCounts: boolean;
  showCompanion: boolean;
  add: (text: string, isUrgent: boolean, isImportant: boolean) => Promise<void>;
  updateText: (id: string, text: string) => Promise<void>;
  toggleUrgent: (id: string) => Promise<void>;
  toggleImportant: (id: string) => Promise<void>;
  complete: (id: string) => Promise<void>;
  uncomplete: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  importJSON: (bundle: ImportExportBundle) => Promise<void>;
  exportJSON: () => ImportExportBundle;
  hydrate: () => Promise<void>;
  // Focus controls
  enterFocus: (mode?: "all" | "single") => void;
  exitFocus: () => void;
  setFocusMode: (mode: "all" | "single") => void;
  setActiveTask: (id: string | null) => void;
  nextFocusTask: () => void;
  prevFocusTask: () => void;
  celebrate: () => void;
  setReducedMotionPref: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setThemePreference: (pref: "light" | "dark") => void;
  setShowOverallCount: (enabled: boolean) => void;
  setShowQuadrantCounts: (enabled: boolean) => void;
  setShowCompanion: (enabled: boolean) => void;
  // Drag and drop
  reorderTaskWithinQuadrant: (
    taskId: string,
    newIndex: number
  ) => Promise<void>;
  moveTaskToQuadrant: (
    taskId: string,
    targetQuadrant: QuadrantId,
    targetIndex: number
  ) => Promise<void>;
}

export const useTodos = create<TodosState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isHydrated: false,
      isFocus: false,
      focusMode: "all",
      activeTaskId: null,
      confettiKey: 0,
      reducedMotionPref: false,
      soundEnabled: true,
      themePreference: "dark",
      showOverallCount: false,
      showQuadrantCounts: false,
      showCompanion: true,
      hydrate: async () => {
        const tasks = await loadAllTasks();
        set({ tasks, isHydrated: true });
      },
      add: async (text, isUrgent, isImportant) => {
        const id =
          typeof crypto !== "undefined" &&
          typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2) + Date.now().toString(36);
        const task: Task = {
          id,
          text: text.trim(),
          isUrgent,
          isImportant,
          status: "active",
          createdAt: new Date().toISOString(),
          completedAt: null,
          sortOrder: null,
        };
        await saveTask(task);
        set({ tasks: [task, ...get().tasks] });
      },
      updateText: async (id, text) => {
        const tasks = get().tasks.map((t) =>
          t.id === id ? { ...t, text: text.trim() } : t
        );
        const updated = tasks.find((t) => t.id === id);
        if (updated) await saveTask(updated);
        set({ tasks });
      },
      toggleUrgent: async (id) => {
        const tasks = get().tasks.map((t) =>
          t.id === id ? { ...t, isUrgent: !t.isUrgent } : t
        );
        const updated = tasks.find((t) => t.id === id);
        if (updated) await saveTask(updated);
        set({ tasks });
      },
      toggleImportant: async (id) => {
        const tasks = get().tasks.map((t) =>
          t.id === id ? { ...t, isImportant: !t.isImportant } : t
        );
        const updated = tasks.find((t) => t.id === id);
        if (updated) await saveTask(updated);
        set({ tasks });
      },
      complete: async (id) => {
        const tasks = get().tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                status: "completed" as const,
                completedAt: new Date().toISOString(),
              }
            : t
        );
        const updated = tasks.find((t) => t.id === id);
        if (updated) await saveTask(updated);
        set({ tasks });

        // Check if we should exit focus mode (all Q1 tasks completed)
        const { isFocus } = get();
        if (isFocus) {
          const remainingQ1Tasks = tasks.filter(
            (t) => t.status === "active" && t.isUrgent && t.isImportant
          );
          if (remainingQ1Tasks.length === 0) {
            // All Q1 tasks completed - exit focus mode
            set({ isFocus: false, activeTaskId: null });
          }
        }
      },
      uncomplete: async (id) => {
        const tasks = get().tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                status: "active" as const,
                completedAt: null,
              }
            : t
        );
        const updated = tasks.find((t) => t.id === id);
        if (updated) await saveTask(updated);
        set({ tasks });
      },
      remove: async (id) => {
        await deleteTask(id);
        set({ tasks: get().tasks.filter((t) => t.id !== id) });
      },
      importJSON: async (bundle) => {
        // naive import: replace local tasks with imported, newest first
        const imported = [...bundle.tasks].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        // Save each to persistence
        for (const t of imported) {
          await saveTask(t);
        }
        set({ tasks: imported });
      },
      exportJSON: () => ({ tasks: get().tasks }),
      enterFocus: (mode = "all") => set({ isFocus: true, focusMode: mode }),
      exitFocus: () => set({ isFocus: false }),
      setFocusMode: (mode) => set({ focusMode: mode }),
      setActiveTask: (id) => set({ activeTaskId: id }),
      nextFocusTask: () => {
        const q1 = get()
          .tasks.filter(
            (t) => t.status === "active" && t.isUrgent && t.isImportant
          )
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        if (q1.length === 0) {
          set({ activeTaskId: null });
          return;
        }
        const current = get().activeTaskId;
        if (!current) {
          set({ activeTaskId: q1[0].id });
          return;
        }
        const idx = q1.findIndex((t) => t.id === current);
        const next = q1[(idx + 1) % q1.length];
        set({ activeTaskId: next.id });
      },
      prevFocusTask: () => {
        const q1 = get()
          .tasks.filter(
            (t) => t.status === "active" && t.isUrgent && t.isImportant
          )
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        if (q1.length === 0) {
          set({ activeTaskId: null });
          return;
        }
        const current = get().activeTaskId;
        if (!current) {
          set({ activeTaskId: q1[q1.length - 1].id });
          return;
        }
        const idx = q1.findIndex((t) => t.id === current);
        const prev = q1[(idx - 1 + q1.length) % q1.length];
        set({ activeTaskId: prev.id });
      },
      celebrate: () => set({ confettiKey: get().confettiKey + 1 }),
      setReducedMotionPref: (enabled) => set({ reducedMotionPref: enabled }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setThemePreference: (pref) => {
        set({ themePreference: pref });
        // Apply theme immediately
        const root = document.documentElement;
        if (pref === "dark") {
          root.setAttribute("data-theme", "dark");
        } else {
          root.setAttribute("data-theme", "light");
        }
      },
      setShowOverallCount: (enabled) => set({ showOverallCount: enabled }),
      setShowQuadrantCounts: (enabled) => set({ showQuadrantCounts: enabled }),
      setShowCompanion: (enabled) => {
        set({ showCompanion: enabled });
        // Sync with companion store (dynamic import to avoid circular dependency)
        if (typeof window !== "undefined") {
          import("./companion").then(({ useCompanionStore }) => {
            useCompanionStore.getState().setEnabled(enabled);
          });
        }
      },
      reorderTaskWithinQuadrant: async (taskId, newIndex) => {
        const tasks = get().tasks;
        const task = tasks.find((t) => t.id === taskId);
        if (!task || task.status !== "active") return;

        // Get tasks in the same quadrant, sorted by sortOrder/createdAt
        const quadrant = computeQuadrant(task);
        const quadrantTasks = tasks
          .filter((t) => {
            const q = computeQuadrant(t);
            return q === quadrant && t.status === "active" && t.id !== taskId;
          })
          .sort((a, b) => {
            if (a.sortOrder !== null && b.sortOrder !== null) {
              return a.sortOrder - b.sortOrder;
            }
            if (a.sortOrder !== null) return -1;
            if (b.sortOrder !== null) return 1;
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          });

        // Calculate new sortOrder
        let newSortOrder: number;
        if (newIndex === 0) {
          // Insert at beginning
          const firstSortOrder = quadrantTasks[0]?.sortOrder ?? 1;
          newSortOrder = firstSortOrder / 2;
        } else if (newIndex >= quadrantTasks.length) {
          // Insert at end
          const lastSortOrder =
            quadrantTasks[quadrantTasks.length - 1]?.sortOrder ?? 0;
          newSortOrder = lastSortOrder + 1;
        } else {
          // Insert between two tasks
          const prevSortOrder =
            quadrantTasks[newIndex - 1]?.sortOrder ?? newIndex - 1;
          const nextSortOrder =
            quadrantTasks[newIndex]?.sortOrder ?? newIndex + 1;
          newSortOrder = (prevSortOrder + nextSortOrder) / 2;
        }

        const updated = { ...task, sortOrder: newSortOrder };
        await saveTask(updated);
        set({
          tasks: tasks.map((t) => (t.id === taskId ? updated : t)),
        });
      },
      moveTaskToQuadrant: async (taskId, targetQuadrant, targetIndex) => {
        const tasks = get().tasks;
        const task = tasks.find((t) => t.id === taskId);
        if (!task || task.status !== "active") return;

        // Map quadrant to flags
        const quadrantMap = {
          Q1: { isUrgent: true, isImportant: true },
          Q2: { isUrgent: false, isImportant: true },
          Q3: { isUrgent: true, isImportant: false },
          Q4: { isUrgent: false, isImportant: false },
        };

        const { isUrgent, isImportant } = quadrantMap[targetQuadrant];

        // If same quadrant, just reorder
        const currentQuadrant = computeQuadrant(task);
        if (currentQuadrant === targetQuadrant) {
          return get().reorderTaskWithinQuadrant(taskId, targetIndex);
        }

        // Get tasks in target quadrant
        const targetTasks = tasks
          .filter((t) => {
            const q = computeQuadrant(t);
            return q === targetQuadrant && t.status === "active";
          })
          .sort((a, b) => {
            if (a.sortOrder !== null && b.sortOrder !== null) {
              return a.sortOrder - b.sortOrder;
            }
            if (a.sortOrder !== null) return -1;
            if (b.sortOrder !== null) return 1;
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          });

        // Calculate new sortOrder in target quadrant
        let newSortOrder: number;
        if (targetTasks.length === 0 || targetIndex === 0) {
          const firstSortOrder = targetTasks[0]?.sortOrder ?? 1;
          newSortOrder = firstSortOrder / 2;
        } else if (targetIndex >= targetTasks.length) {
          const lastSortOrder =
            targetTasks[targetTasks.length - 1]?.sortOrder ?? 0;
          newSortOrder = lastSortOrder + 1;
        } else {
          const prevSortOrder =
            targetTasks[targetIndex - 1]?.sortOrder ?? targetIndex - 1;
          const nextSortOrder =
            targetTasks[targetIndex]?.sortOrder ?? targetIndex + 1;
          newSortOrder = (prevSortOrder + nextSortOrder) / 2;
        }

        const updated = {
          ...task,
          isUrgent,
          isImportant,
          sortOrder: newSortOrder,
        };
        await saveTask(updated);
        set({
          tasks: tasks.map((t) => (t.id === taskId ? updated : t)),
        });
      },
    }),
    {
      name: "clarity.zustand.meta", // minimal metadata; real data in Dexie/localStorage
      partialize: (state) => ({
        isHydrated: state.isHydrated,
        themePreference: state.themePreference,
        reducedMotionPref: state.reducedMotionPref,
        soundEnabled: state.soundEnabled,
        showOverallCount: state.showOverallCount,
        showQuadrantCounts: state.showQuadrantCounts,
        showCompanion: state.showCompanion,
      }),
    }
  )
);

// Initialize companion state sync on app load
if (typeof window !== "undefined") {
  const { showCompanion } = useTodos.getState();
  import("./companion").then(({ useCompanionStore }) => {
    useCompanionStore.getState().setEnabled(showCompanion);
  });
}
