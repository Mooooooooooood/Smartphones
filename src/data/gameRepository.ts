import { getDb } from "./db";

const ACTIVE_GAME_KEY = "activeGamePgn";

/** Persist the current game. Silently no-ops if storage is unavailable (e.g. private mode). */
export async function saveActiveGame(pgn: string): Promise<void> {
  try {
    await getDb().kv.put({ key: ACTIVE_GAME_KEY, value: pgn });
  } catch {
    /* storage unavailable — game simply won't persist this session */
  }
}

export async function loadActiveGame(): Promise<string | null> {
  try {
    const row = await getDb().kv.get(ACTIVE_GAME_KEY);
    return typeof row?.value === "string" ? row.value : null;
  } catch {
    return null;
  }
}
