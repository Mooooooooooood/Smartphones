import Dexie, { type Table } from "dexie";

/**
 * Local persistence. Created lazily via getDb() so importing this module during
 * SSR never touches the browser-only `indexedDB` global.
 *
 * v1: kv (active game PGN — Sprint 1)
 * v2: + profile (singleton) + lessonProgress (Sprint 2)
 * v3: + puzzleAttempts (history) + profile.puzzleRating (Sprint 3)
 * v4: + bossResults + dailyTraining (Sprint 5)
 * v5: + rewardClaims (Sprint 5E — claimable chests)
 * v6: + matches + profile.playRating (Sprint 7 — bot matches)
 */

export interface KVRow {
  key: string;
  value: unknown;
}

export interface ProfileRow {
  id: string; // always "me" for the single local player
  xp: number;
  streak: number;
  lastActiveDate: string | null; // local day key, e.g. "2026-06-09"
  /** Puzzle rating (Sprint 3). Optional for rows written before v3. */
  puzzleRating?: number;
  /** Play (bot match) rating (Sprint 7). Optional for older rows. */
  playRating?: number;
  /** Spendable coin balance (Sprint 18). Optional for older rows. */
  coins?: number;
  /** Owned cosmetic ids (Sprint 18). Optional for older rows. */
  owned?: Record<string, true>;
  updatedAt: number;
}

export type MatchResult = "win" | "loss" | "draw";

export interface MatchRow {
  id?: number; // auto-incremented primary key
  opponentId: string;
  opponentName: string;
  result: MatchResult;
  reason: string; // checkmate / stalemate / draw / resignation
  userColor: "w" | "b";
  moves: number;
  pgn: string;
  /** SAN move list for reliable replay (Sprint 9). Optional for older rows. */
  sans?: string[];
  xpAwarded: number;
  ratingBefore: number;
  ratingAfter: number;
  startedAt: number;
  finishedAt: number;
}

export interface LessonProgressRow {
  lessonId: string;
  status: "completed";
  stars: number;
  score: number;
  completedAt: number;
}

export interface PuzzleAttemptRow {
  id?: number; // auto-incremented primary key
  puzzleId: string;
  theme: string;
  correct: boolean;
  attemptedMove: string; // UCI the player played
  correctMove: string; // UCI of the puzzle's answer
  ratingBefore: number;
  ratingAfter: number;
  xpAwarded: number;
  attemptedAt: number;
}

export interface BossResultRow {
  bossId: string; // primary key, e.g. "tier-0"
  tier: number;
  passed: boolean;
  score: number;
  total: number;
  xpAwarded: number;
  completedAt: number;
}

export interface DailyTrainingRow {
  date: string; // primary key, local day key "2026-06-09"
  academyTaskDone: boolean;
  puzzleTaskDone: boolean;
  playTaskDone: boolean;
  bonusClaimed: boolean;
  completedAt: number | null;
  updatedAt: number;
}

export interface RewardClaimRow {
  id: string; // primary key, e.g. "tier0-mid"
  xpAwarded: number;
  claimedAt: number;
}

class TabiyaDB extends Dexie {
  kv!: Table<KVRow, string>;
  profile!: Table<ProfileRow, string>;
  lessonProgress!: Table<LessonProgressRow, string>;
  puzzleAttempts!: Table<PuzzleAttemptRow, number>;
  bossResults!: Table<BossResultRow, string>;
  dailyTraining!: Table<DailyTrainingRow, string>;
  rewardClaims!: Table<RewardClaimRow, string>;
  matches!: Table<MatchRow, number>;

  constructor() {
    super("tabiya");
    this.version(1).stores({ kv: "key" });
    this.version(2).stores({ kv: "key", profile: "id", lessonProgress: "lessonId" });
    this.version(3).stores({
      kv: "key",
      profile: "id",
      lessonProgress: "lessonId",
      puzzleAttempts: "++id, puzzleId, attemptedAt",
    });
    this.version(4).stores({
      kv: "key",
      profile: "id",
      lessonProgress: "lessonId",
      puzzleAttempts: "++id, puzzleId, attemptedAt",
      bossResults: "bossId, tier",
      dailyTraining: "date",
    });
    this.version(5).stores({
      kv: "key",
      profile: "id",
      lessonProgress: "lessonId",
      puzzleAttempts: "++id, puzzleId, attemptedAt",
      bossResults: "bossId, tier",
      dailyTraining: "date",
      rewardClaims: "id",
    });
    this.version(6).stores({
      kv: "key",
      profile: "id",
      lessonProgress: "lessonId",
      puzzleAttempts: "++id, puzzleId, attemptedAt",
      bossResults: "bossId, tier",
      dailyTraining: "date",
      rewardClaims: "id",
      matches: "++id, finishedAt",
    });
  }
}

let _db: TabiyaDB | null = null;

export function getDb(): TabiyaDB {
  if (!_db) _db = new TabiyaDB();
  return _db;
}
