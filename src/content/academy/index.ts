import { TIER0_LESSONS, TIER0_TITLE, type Lesson } from "./tier0";
import { TIER1_LESSONS, TIER1_TITLE } from "./tier1";
import { TIER2_LESSONS, TIER2_TITLE } from "./tier2";
import { TIER3_LESSONS, TIER3_TITLE } from "./tier3";
import { TIER0_BOSS, TIER1_BOSS, TIER2_BOSS, TIER3_BOSS, type BossChallenge } from "./boss";

export type { Lesson, Quiz } from "./tier0";
export type { BossChallenge } from "./boss";
export { bossById, BOSSES, TIER0_BOSS, TIER1_BOSS, TIER2_BOSS, TIER3_BOSS } from "./boss";

export interface TierMeta {
  tier: number;
  title: string;
  lessons: Lesson[];
  /** The boss challenge that gates the next tier, if any. */
  boss?: BossChallenge;
}

/** All academy tiers in order. Add future tiers here. */
export const TIERS: TierMeta[] = [
  { tier: 0, title: TIER0_TITLE, lessons: TIER0_LESSONS, boss: TIER0_BOSS },
  { tier: 1, title: TIER1_TITLE, lessons: TIER1_LESSONS, boss: TIER1_BOSS },
  { tier: 2, title: TIER2_TITLE, lessons: TIER2_LESSONS, boss: TIER2_BOSS },
  { tier: 3, title: TIER3_TITLE, lessons: TIER3_LESSONS, boss: TIER3_BOSS },
];

/** Every lesson across every tier, ordered by tier then lesson order. */
export const ALL_LESSONS: Lesson[] = TIERS.flatMap((t) =>
  [...t.lessons].sort((a, b) => a.order - b.order),
);

export function lessonById(id: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.id === id);
}

export function tierMeta(tier: number): TierMeta | undefined {
  return TIERS.find((t) => t.tier === tier);
}

export function lessonsForTier(tier: number): Lesson[] {
  return [...(tierMeta(tier)?.lessons ?? [])].sort((a, b) => a.order - b.order);
}

export function tierTotalXp(tier: number): number {
  return lessonsForTier(tier).reduce((sum, l) => sum + l.xpReward, 0);
}
