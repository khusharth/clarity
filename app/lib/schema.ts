export type TaskStatus = "active" | "completed";

export interface Task {
  id: string;
  text: string;
  isUrgent: boolean;
  isImportant: boolean;
  status: TaskStatus;
  createdAt: string; // ISO string
  completedAt: string | null;
  sortOrder: number | null; // Fractional index for drag-and-drop ordering
}

export interface Preferences {
  reducedMotion: boolean;
  soundEnabled: boolean;
}

export function computeQuadrant(
  task: Pick<Task, "isUrgent" | "isImportant">
): "Q1" | "Q2" | "Q3" | "Q4" {
  if (task.isUrgent && task.isImportant) return "Q1";
  if (!task.isUrgent && task.isImportant) return "Q2";
  if (task.isUrgent && !task.isImportant) return "Q3";
  return "Q4";
}
