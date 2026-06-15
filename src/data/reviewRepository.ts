import { getDb, type ReviewCardRow } from "./db";

export async function loadReviewCards(): Promise<ReviewCardRow[]> {
  try {
    return await getDb().reviewState.toArray();
  } catch {
    return [];
  }
}

/** Direct primary-key lookup for a single card (reviewState is keyed by id). */
export async function loadReviewCard(id: string): Promise<ReviewCardRow | undefined> {
  try {
    return await getDb().reviewState.get(id);
  } catch {
    return undefined;
  }
}

export async function saveReviewCard(row: ReviewCardRow): Promise<void> {
  try {
    await getDb().reviewState.put(row);
  } catch {
    /* storage unavailable — no-op */
  }
}
