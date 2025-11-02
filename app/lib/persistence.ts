import { getDb, isIndexedDBAvailable } from "./db";
import type { Task, Preferences } from "./schema";

const LOCAL_KEY_TASKS = "clarity.tasks.v1";
const LOCAL_KEY_PREFS = "clarity.prefs.v1";

export async function saveTask(task: Task): Promise<void> {
  if (await isIndexedDBAvailable()) {
    const db = getDb();
    await db.tasks.put(task);
    return;
  }
  const all = loadAllTasksLocal();
  const idx = all.findIndex((t) => t.id === task.id);
  if (idx >= 0) all[idx] = task;
  else all.push(task);
  localStorage.setItem(LOCAL_KEY_TASKS, JSON.stringify(all));
}

export async function deleteTask(taskId: string): Promise<void> {
  if (await isIndexedDBAvailable()) {
    const db = getDb();
    await db.tasks.delete(taskId);
    return;
  }
  const all = loadAllTasksLocal().filter((t) => t.id !== taskId);
  localStorage.setItem(LOCAL_KEY_TASKS, JSON.stringify(all));
}

export async function loadAllTasks(): Promise<Task[]> {
  if (await isIndexedDBAvailable()) {
    const db = getDb();
    return db.tasks.orderBy("createdAt").reverse().toArray();
  }
  return loadAllTasksLocal();
}

function loadAllTasksLocal(): Task[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY_TASKS);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

export async function savePreferences(prefs: Preferences): Promise<void> {
  if (await isIndexedDBAvailable()) {
    const db = getDb();
    await db.preferences.put({ ...prefs } as any, "prefs");
    return;
  }
  localStorage.setItem(LOCAL_KEY_PREFS, JSON.stringify(prefs));
}

export async function loadPreferences(): Promise<Preferences | null> {
  if (await isIndexedDBAvailable()) {
    const db = getDb();
    const row = await db.preferences.get("prefs");
    return row ?? null;
  }
  try {
    const raw = localStorage.getItem(LOCAL_KEY_PREFS);
    return raw ? (JSON.parse(raw) as Preferences) : null;
  } catch {
    return null;
  }
}
