import { getDb, type RewardClaimRow } from "./db";

export async function loadRewardClaims(): Promise<RewardClaimRow[]> {
  try {
    return await getDb().rewardClaims.toArray();
  } catch {
    return [];
  }
}

export async function saveRewardClaim(row: RewardClaimRow): Promise<void> {
  try {
    await getDb().rewardClaims.add(row);
  } catch {
    /* already claimed (duplicate key) or storage unavailable — no-op */
  }
}
