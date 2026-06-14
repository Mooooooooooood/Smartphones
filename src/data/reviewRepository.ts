import { getDb, type ReviewCardRow } from "./db";

export async function loadReviewCards(): Promise<ReviewCardRow[]> {
  try {
    return await getDb().reviewState.toArray();
  } catch {
    return [];
  }
}

export async function saveReviewCard(row: ReviewCardRow): Promise<void> {
  try {
    await getDb().reviewState.put(row);
  } catch {
    /* storage unavailable — no-op */
  }
}
