/** Pure backup schema + validation (no IndexedDB) so it can be unit-tested. */

export const BACKUP_APP = "tabiya";
export const BACKUP_VERSION = 1;

export const BACKUP_TABLES = [
  "kv",
  "profile",
  "lessonProgress",
  "puzzleAttempts",
  "bossResults",
  "dailyTraining",
  "rewardClaims",
  "matches",
] as const;

export type BackupTable = (typeof BACKUP_TABLES)[number];

export interface BackupData {
  app: string;
  version: number;
  exportedAt: number;
  tables: Record<BackupTable, unknown[]>;
}

/** Minimal shape check: correct app marker and an array per known table. */
export function validateBackup(obj: unknown): obj is BackupData {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  if (o.app !== BACKUP_APP) return false;
  if (typeof o.version !== "number") return false;
  if (!o.tables || typeof o.tables !== "object") return false;
  const tables = o.tables as Record<string, unknown>;
  return BACKUP_TABLES.every((name) => Array.isArray(tables[name]));
}
