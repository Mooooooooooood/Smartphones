import type { AcademyState } from "@/domain/academy/progression";
import { tierProgress, bossStatus, academyProgress } from "@/domain/academy/progression";

/**
 * Achievement registry — each entry computes its own unlock + progress from the
 * player's stats so the badge shelf and the detail modal stay in sync. Pure and
 * testable. `progress` is {current, target}; unlocked when current >= target.
 */
export interface AchievementStats {
  wins: number;
  solved: number;
  streak: number;
  accGames: number;
  accPct: number;
  academy: AcademyState;
}

export interface AchievementDef {
  id: string;
  name: string;
  glyph: string;
  /** One-line "how to unlock" copy. */
  description: string;
  /** XP-flavoured reward note (cosmetic — badges are the reward). */
  reward?: string;
  progress: (s: AchievementStats) => { current: number; target: number };
}

export interface AchievementView extends AchievementDef {
  current: number;
  target: number;
  unlocked: boolean;
  pct: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first-win",
    name: "First Win",
    glyph: "🏆",
    description: "Win your first match against a guide.",
    reward: "Badge",
    progress: (s) => ({ current: Math.min(s.wins, 1), target: 1 }),
  },
  {
    id: "puzzle-master",
    name: "Puzzle Master",
    glyph: "✦",
    description: "Solve 10 puzzles in the Tactics Arena.",
    progress: (s) => ({ current: Math.min(s.solved, 10), target: 10 }),
  },
  {
    id: "tactics-fan",
    name: "Tactics Fan",
    glyph: "⚔",
    description: "Reach 80% accuracy over at least 5 puzzles.",
    progress: (s) => ({ current: s.accGames >= 5 && s.accPct >= 0.8 ? 1 : 0, target: 1 }),
  },
  {
    id: "weekly-warrior",
    name: "Weekly Warrior",
    glyph: "★",
    description: "Keep a 7-day activity streak.",
    progress: (s) => ({ current: Math.min(s.streak, 7), target: 7 }),
  },
  {
    id: "foundations",
    name: "Foundations",
    glyph: "♚",
    description: "Complete every Tier 0 lesson.",
    progress: (s) => {
      const t0 = tierProgress(0, s.academy);
      return { current: t0.done, target: t0.total };
    },
  },
  {
    id: "first-trial",
    name: "Trial Champion",
    glyph: "♛",
    description: "Pass your first Boss Trial.",
    progress: (s) => ({ current: bossStatus("tier-0", s.academy) === "completed" ? 1 : 0, target: 1 }),
  },
  {
    id: "tactician",
    name: "Tactician",
    glyph: "♞",
    description: "Pass the Tier 1 Trial.",
    progress: (s) => ({ current: bossStatus("tier-1", s.academy) === "completed" ? 1 : 0, target: 1 }),
  },
  {
    id: "scholar",
    name: "Scholar",
    glyph: "📖",
    description: "Finish half of all Academy lessons.",
    progress: (s) => {
      const a = academyProgress(s.academy);
      return { current: a.done, target: Math.ceil(a.total / 2) };
    },
  },
];

/** Resolve every achievement against the player's stats. */
export function achievementViews(stats: AchievementStats): AchievementView[] {
  return ACHIEVEMENTS.map((a) => {
    const { current, target } = a.progress(stats);
    const unlocked = current >= target;
    return { ...a, current, target, unlocked, pct: target ? Math.min(1, current / target) : 0 };
  });
}
