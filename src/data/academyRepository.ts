import { getDb, type BossResultRow } from "./db";

export async function loadBossResults(): Promise<BossResultRow[]> {
  try {
    return await getDb().bossResults.toArray();
  } catch {
    return [];
  }
}

export async function saveBossResult(row: BossResultRow): Promise<void> {
  try {
    await getDb().bossResults.put(row);
  } catch {
    /* storage unavailable */
  }
}
