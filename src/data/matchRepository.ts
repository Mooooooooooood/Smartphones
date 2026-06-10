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

/** A single match by its id, or null if not found / unavailable. */
export async function loadMatch(id: number): Promise<MatchRow | null> {
  try {
    return (await getDb().matches.get(id)) ?? null;
  } catch {
    return null;
  }
}
