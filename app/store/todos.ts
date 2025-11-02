import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { Task } from "../lib/schema";
import { loadAllTasks, saveTask, deleteTask } from "../lib/persistence";

type ImportExportBundle = { tasks: Task[] };

interface TodosState {
  tasks: Task[];
  isHydrated: boolean;
  add: (text: string, isUrgent: boolean, isImportant: boolean) => Promise<void>;
  updateText: (id: string, text: string) => Promise<void>;
  toggleUrgent: (id: string) => Promise<void>;
  toggleImportant: (id: string) => Promise<void>;
  complete: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  importJSON: (bundle: ImportExportBundle) => Promise<void>;
  exportJSON: () => ImportExportBundle;
  hydrate: () => Promise<void>;
}

export const useTodos = create<TodosState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isHydrated: false,
      hydrate: async () => {
        const tasks = await loadAllTasks();
        set({ tasks, isHydrated: true });
      },
      add: async (text, isUrgent, isImportant) => {
        const task: Task = {
          id: uuidv4(),
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
        set(async (state) => {
          const tasks = state.tasks.map((t) =>
            t.id === id ? { ...t, text: text.trim() } : t
          );
          const updated = tasks.find((t) => t.id === id);
          if (updated) await saveTask(updated);
          return { tasks } as Partial<TodosState>;
        });
      },
      toggleUrgent: async (id) => {
        set(async (state) => {
          const tasks = state.tasks.map((t) =>
            t.id === id ? { ...t, isUrgent: !t.isUrgent } : t
          );
          const updated = tasks.find((t) => t.id === id);
          if (updated) await saveTask(updated);
          return { tasks } as Partial<TodosState>;
        });
      },
      toggleImportant: async (id) => {
        set(async (state) => {
          const tasks = state.tasks.map((t) =>
            t.id === id ? { ...t, isImportant: !t.isImportant } : t
          );
          const updated = tasks.find((t) => t.id === id);
          if (updated) await saveTask(updated);
          return { tasks } as Partial<TodosState>;
        });
      },
      complete: async (id) => {
        set(async (state) => {
          const tasks = state.tasks.map((t) =>
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
          return { tasks } as Partial<TodosState>;
        });
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
    }),
    {
      name: "clarity.zustand.meta", // minimal metadata; real data in Dexie/localStorage
      partialize: (state) => ({ isHydrated: state.isHydrated }),
    }
  )
);
