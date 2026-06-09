import { create } from "zustand";
import { levelInfo, nextStreak, todayKey, type LevelInfo } from "@/domain/progression/leveling";
import { TIER0_LESSONS } from "@/content/academy/tier0";
import {
  loadLessonProgress,
  loadProfile,
  saveLessonProgress,
  saveProfile,
} from "@/data/profileRepository";
import { loadPuzzleAttempts, savePuzzleAttempt } from "@/data/puzzleRepository";
import { DEFAULT_PUZZLE_RATING, nextRating } from "@/domain/progression/rating";

export interface CompletedLesson {
  stars: number;
  score: number;
}
type CompletedMap = Record<string, CompletedLesson>;
type IdSet = Record<string, true>;

export interface PuzzleResult {
  ratingBefore: number;
  ratingAfter: number;
  xpAwarded: number;
  /** First time this puzzle is solved correctly (the moment XP is awarded). */
  firstSolve: boolean;
  /** First time this puzzle is attempted at all (the only attempt that moves rating). */
  firstAttempt: boolean;
}

export interface RecordPuzzleArgs {
  puzzleId: string;
  theme: string;
  /** The puzzle's difficulty rating. */
  puzzleRating: number;
  correct: boolean;
  attemptedMove: string; // UCI played
  correctMove: string; // UCI answer
  xpReward: number;
}

interface ProfileState {
  xp: number;
  streak: number;
  lastActiveDate: string | null;
  completed: CompletedMap;

  // Sprint 3 — puzzle progress
  puzzleRating: number;
  solvedPuzzleIds: IdSet;
  attemptedPuzzleIds: IdSet;

  hydrated: boolean;

  hydrate: () => Promise<void>;
  /** Marks a lesson complete. Awards XP and updates the streak only the first time. */
  completeLesson: (lessonId: string, xpReward: number, stars: number) => Promise<boolean>;
  /**
   * Records the outcome of a puzzle attempt. Rating moves on the first attempt
   * of each puzzle; XP and streak update only on the first correct solve.
   */
  recordPuzzleResult: (args: RecordPuzzleArgs) => Promise<PuzzleResult>;
}

const TOTAL = TIER0_LESSONS.length;

export const useProfileStore = create<ProfileState>((set, get) => {
  /** Persist the singleton profile row from the current store snapshot. */
  function persistProfile() {
    const s = get();
    return saveProfile({
      id: "me",
      xp: s.xp,
      streak: s.streak,
      lastActiveDate: s.lastActiveDate,
      puzzleRating: s.puzzleRating,
      updatedAt: Date.now(),
    });
  }

  return {
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    completed: {},
    puzzleRating: DEFAULT_PUZZLE_RATING,
    solvedPuzzleIds: {},
    attemptedPuzzleIds: {},
    hydrated: false,

    hydrate: async () => {
      if (get().hydrated) return;
      const [profile, progress, attempts] = await Promise.all([
        loadProfile(),
        loadLessonProgress(),
        loadPuzzleAttempts(),
      ]);

      const completed: CompletedMap = {};
      for (const row of progress) completed[row.lessonId] = { stars: row.stars, score: row.score };

      const solvedPuzzleIds: IdSet = {};
      const attemptedPuzzleIds: IdSet = {};
      for (const a of attempts) {
        attemptedPuzzleIds[a.puzzleId] = true;
        if (a.correct) solvedPuzzleIds[a.puzzleId] = true;
      }

      set({
        xp: profile?.xp ?? 0,
        streak: profile?.streak ?? 0,
        lastActiveDate: profile?.lastActiveDate ?? null,
        completed,
        puzzleRating: profile?.puzzleRating ?? DEFAULT_PUZZLE_RATING,
        solvedPuzzleIds,
        attemptedPuzzleIds,
        hydrated: true,
      });
    },

    completeLesson: async (lessonId, xpReward, stars) => {
      const { completed, xp, streak, lastActiveDate } = get();
      if (completed[lessonId]) return false; // already done — never award twice

      const today = todayKey();
      const newStreak = nextStreak(lastActiveDate, streak, today);
      const newXp = xp + xpReward;
      const newCompleted: CompletedMap = { ...completed, [lessonId]: { stars, score: stars } };

      set({ xp: newXp, streak: newStreak, lastActiveDate: today, completed: newCompleted });

      await Promise.all([
        persistProfile(),
        saveLessonProgress({ lessonId, status: "completed", stars, score: stars, completedAt: Date.now() }),
      ]);
      return true;
    },

    recordPuzzleResult: async (args) => {
      const state = get();
      const ratingBefore = state.puzzleRating;
      const firstAttempt = !state.attemptedPuzzleIds[args.puzzleId];
      const firstSolve = args.correct && !state.solvedPuzzleIds[args.puzzleId];

      // Rating only moves on the very first attempt — no farming by retrying.
      const ratingAfter = firstAttempt
        ? nextRating(ratingBefore, args.puzzleRating, args.correct)
        : ratingBefore;
      const xpAwarded = firstSolve ? args.xpReward : 0;

      const today = todayKey();
      const newXp = state.xp + xpAwarded;
      // A genuinely solved puzzle counts as meaningful activity for the streak.
      const newStreak = xpAwarded > 0 ? nextStreak(state.lastActiveDate, state.streak, today) : state.streak;
      const newLastActive = xpAwarded > 0 ? today : state.lastActiveDate;

      set({
        xp: newXp,
        streak: newStreak,
        lastActiveDate: newLastActive,
        puzzleRating: ratingAfter,
        attemptedPuzzleIds: { ...state.attemptedPuzzleIds, [args.puzzleId]: true },
        solvedPuzzleIds: args.correct
          ? { ...state.solvedPuzzleIds, [args.puzzleId]: true }
          : state.solvedPuzzleIds,
      });

      await Promise.all([
        persistProfile(),
        savePuzzleAttempt({
          puzzleId: args.puzzleId,
          theme: args.theme,
          correct: args.correct,
          attemptedMove: args.attemptedMove,
          correctMove: args.correctMove,
          ratingBefore,
          ratingAfter,
          xpAwarded,
          attemptedAt: Date.now(),
        }),
      ]);

      return { ratingBefore, ratingAfter, xpAwarded, firstSolve, firstAttempt };
    },
  };
});

/* ---------- pure selectors (not hooks) ---------- */

export function selectLevel(xp: number): LevelInfo {
  return levelInfo(xp);
}

export function academyProgress(completed: Record<string, unknown>): {
  done: number;
  total: number;
  pct: number;
} {
  const done = Object.keys(completed).length;
  return { done, total: TOTAL, pct: TOTAL ? done / TOTAL : 0 };
}

export function puzzlesSolvedCount(solved: Record<string, unknown>): number {
  return Object.keys(solved).length;
}

export function lessonStatus(
  order: number,
  completed: Record<string, unknown>,
): "completed" | "available" | "locked" {
  const lesson = TIER0_LESSONS.find((l) => l.order === order);
  if (!lesson) return "locked";
  if (completed[lesson.id]) return "completed";
  if (order === 1) return "available";
  const prev = TIER0_LESSONS.find((l) => l.order === order - 1);
  return prev && completed[prev.id] ? "available" : "locked";
}

/** First lesson not yet completed (always available, since lessons unlock in order). */
export function nextLesson(completed: Record<string, unknown>) {
  return [...TIER0_LESSONS].sort((a, b) => a.order - b.order).find((l) => !completed[l.id]) ?? null;
}
