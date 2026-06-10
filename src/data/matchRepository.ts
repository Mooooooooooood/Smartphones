import { getDb, type MatchRow } from "./db";

export async function saveMatch(row: MatchRow): Promise<void> {
  try {
    await getDb().matches.add(row);
  } catch {
    /* storage unavailable */
  }
}

/** All finished matches, newest first. */
export async function loadMatches(): Promise<MatchRow[]> {
  try {
    const rows = await getDb().matches.orderBy("finishedAt").toArray();
    return rows.reverse();
  } catch {
    return [];
  }
}
