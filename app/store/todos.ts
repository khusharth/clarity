import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task } from "../lib/schema";
import { loadAllTasks, saveTask, deleteTask } from "../lib/persistence";

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
  reducedMotionPref: "system" | "reduce" | "motion";
  soundEnabled: boolean;
  themePreference: "system" | "light" | "dark";
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
  celebrate: () => void;
  setReducedMotionPref: (pref: "system" | "reduce" | "motion") => void;
  setSoundEnabled: (enabled: boolean) => void;
  setThemePreference: (pref: "system" | "light" | "dark") => void;
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
      reducedMotionPref: "system",
      soundEnabled: true,
      themePreference: "system",
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
      celebrate: () => set({ confettiKey: get().confettiKey + 1 }),
      setReducedMotionPref: (pref) => set({ reducedMotionPref: pref }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setThemePreference: (pref) => {
        set({ themePreference: pref });
        // Apply theme immediately
        const root = document.documentElement;
        if (pref === "dark") {
          root.setAttribute("data-theme", "dark");
        } else if (pref === "light") {
          root.setAttribute("data-theme", "light");
        } else {
          root.removeAttribute("data-theme");
        }
      },
    }),
    {
      name: "clarity.zustand.meta", // minimal metadata; real data in Dexie/localStorage
      partialize: (state) => ({
        isHydrated: state.isHydrated,
        themePreference: state.themePreference,
        reducedMotionPref: state.reducedMotionPref,
        soundEnabled: state.soundEnabled,
      }),
    }
  )
);
