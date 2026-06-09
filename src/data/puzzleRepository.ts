import { getDb, type PuzzleAttemptRow } from "./db";

/** Append a puzzle attempt to the history. Silently no-ops if storage is unavailable. */
export async function savePuzzleAttempt(row: PuzzleAttemptRow): Promise<void> {
  try {
    await getDb().puzzleAttempts.add(row);
  } catch {
    /* storage unavailable — attempt simply won't persist this session */
  }
}

/** All puzzle attempts, newest first. */
export async function loadPuzzleAttempts(): Promise<PuzzleAttemptRow[]> {
  try {
    const rows = await getDb().puzzleAttempts.orderBy("attemptedAt").toArray();
    return rows.reverse();
  } catch {
    return [];
  }
}
