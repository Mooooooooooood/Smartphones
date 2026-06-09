import Dexie, { type Table } from "dexie";

/**
 * Local persistence. Created lazily via getDb() so importing this module during
 * SSR never touches the browser-only `indexedDB` global.
 *
 * v1: kv (active game PGN — Sprint 1)
 * v2: + profile (singleton) + lessonProgress (Sprint 2)
 * v3: + puzzleAttempts (history) + profile.puzzleRating (Sprint 3)
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
  updatedAt: number;
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

class TabiyaDB extends Dexie {
  kv!: Table<KVRow, string>;
  profile!: Table<ProfileRow, string>;
  lessonProgress!: Table<LessonProgressRow, string>;
  puzzleAttempts!: Table<PuzzleAttemptRow, number>;

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
  }
}

let _db: TabiyaDB | null = null;

export function getDb(): TabiyaDB {
  if (!_db) _db = new TabiyaDB();
  return _db;
}
