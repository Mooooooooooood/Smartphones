import { getDb } from "./db";
import {
  BACKUP_APP,
  BACKUP_VERSION,
  BACKUP_TABLES,
  validateBackup,
  type BackupData,
} from "./backupSchema";

/** Read every local table into a portable JSON backup. */
export async function exportAll(): Promise<BackupData> {
  const db = getDb();
  const tables = {} as BackupData["tables"];
  for (const name of BACKUP_TABLES) {
    tables[name] = await db.table(name).toArray();
  }
  return { app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: Date.now(), tables };
}

/** Replace local data with a validated backup. Throws on an invalid file. */
export async function importAll(data: unknown): Promise<void> {
  if (!validateBackup(data)) {
    throw new Error("That file isn't a valid Tabiya backup.");
  }
  const db = getDb();
  await db.transaction("rw", [...BACKUP_TABLES], async () => {
    for (const name of BACKUP_TABLES) {
      await db.table(name).clear();
      const rows = data.tables[name];
      if (rows.length) await db.table(name).bulkPut(rows);
    }
  });
}

/** Clear all local progress (irreversible). */
export async function resetAll(): Promise<void> {
  const db = getDb();
  await db.transaction("rw", [...BACKUP_TABLES], async () => {
    for (const name of BACKUP_TABLES) await db.table(name).clear();
  });
}
