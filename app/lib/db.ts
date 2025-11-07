import Dexie, { Table } from "dexie";
import type { Task, Preferences } from "./schema";

export class ClarityDatabase extends Dexie {
  tasks!: Table<Task, string>;
  preferences!: Table<Preferences, string>;

  constructor() {
    super("clarity-db");
    this.version(1).stores({
      tasks: "id, createdAt, status",
      preferences: "&id",
    });
    this.version(2).stores({
      tasks: "id, createdAt, status, sortOrder",
      preferences: "&id",
    });
  }
}

let dbInstance: ClarityDatabase | null = null;

export function getDb(): ClarityDatabase {
  if (!dbInstance) {
    dbInstance = new ClarityDatabase();
  }
  return dbInstance;
}

export async function isIndexedDBAvailable(): Promise<boolean> {
  try {
    const db = getDb();
    await db.open();
    return true;
  } catch {
    return false;
  }
}
