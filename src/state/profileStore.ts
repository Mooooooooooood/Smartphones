import { create } from "zustand";
import { levelInfo, nextStreak, todayKey, type LevelInfo } from "@/domain/progression/leveling";
import { DEFAULT_PUZZLE_RATING, DEFAULT_PLAY_RATING, eloUpdate, nextRating } from "@/domain/progression/rating";
import { bossById } from "@/content/academy";
import type { AcademyState } from "@/domain/academy/progression";
import {
  dailyForToday,
  dailyBonusClaimable,
  withBonusClaimed,
  withTaskDone,
  DAILY_BONUS_XP,
  type DailyTask,
  type DailyTraining,
} from "@/domain/training/daily";
import {
  loadLessonProgress,
  loadProfile,
  saveLessonProgress,
  saveProfile,
} from "@/data/profileRepository";
import { loadPuzzleAttempts, savePuzzleAttempt } from "@/data/puzzleRepository";
import { loadBossResults, saveBossResult } from "@/data/academyRepository";
import { loadDailyTraining, saveDailyTraining } from "@/data/dailyRepository";
import { loadRewardClaims, saveRewardClaim } from "@/data/rewardRepository";
import { loadMatches, saveMatch } from "@/data/matchRepository";
import type { BossResultRow, MatchResult, MatchRow } from "@/data/db";

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
  firstSolve: boolean;
  firstAttempt: boolean;
}

export interface RecordPuzzleArgs {
  puzzleId: string;
  theme: string;
  puzzleRating: number;
  correct: boolean;
  attemptedMove: string;
  correctMove: string;
  xpReward: number;
}

export interface BossOutcome {
  passed: boolean;
  xpAwarded: number;
  firstClear: boolean;
}

export interface RecordMatchArgs {
  opponentId: string;
  opponentName: string;
  opponentRating: number;
  xpReward: number;
  outcome: MatchResult;
  reason: string;
  userColor: "w" | "b";
  moves: number;
  pgn: string;
  startedAt: number;
  finishedAt: number;
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

  // Sprint 5 — boss gates + daily training
  bossCleared: IdSet;
  bossResults: Record<string, BossResultRow>;
  daily: DailyTraining | null;

  // Sprint 5E — claimable milestone reward chests
  claimedRewards: IdSet;

  // Sprint 7 — bot matches
  playRating: number;
  matches: MatchRow[];

  hydrated: boolean;

  hydrate: () => Promise<void>;
  /** Record a finished bot match: awards XP, updates play rating, marks daily play. Returns XP awarded. */
  recordMatch: (args: RecordMatchArgs) => Promise<number>;
  completeLesson: (lessonId: string, xpReward: number, stars: number) => Promise<boolean>;
  recordPuzzleResult: (args: RecordPuzzleArgs) => Promise<PuzzleResult>;
  /** Record a boss attempt. Awards XP only on the first pass. */
  completeBoss: (bossId: string, passed: boolean, score: number, total: number) => Promise<BossOutcome>;
  /** Mark a daily-training task done (idempotent; resets on a new day). */
  markDailyTask: (task: DailyTask) => Promise<void>;
  /** Claim the once-per-day completion bonus. Returns XP awarded (0 if not claimable). */
  claimDailyBonus: () => Promise<number>;
  /** Claim a one-time milestone reward chest. Returns XP awarded (0 if already claimed). */
  claimReward: (rewardId: string, xp: number) => Promise<number>;
}

export const useProfileStore = create<ProfileState>((set, get) => {
  function persistProfile() {
    const s = get();
    return saveProfile({
      id: "me",
      xp: s.xp,
      streak: s.streak,
      lastActiveDate: s.lastActiveDate,
      puzzleRating: s.puzzleRating,
      playRating: s.playRating,
      updatedAt: Date.now(),
    });
  }

  /** Apply a daily task, bump the streak (meaningful activity), and persist. */
  async function touchDaily(task: DailyTask) {
    const s = get();
    const today = todayKey();
    const base = dailyForToday(s.daily, today);
    const updated = withTaskDone(base, task);
    const newStreak = nextStreak(s.lastActiveDate, s.streak, today);
    set({ daily: updated, streak: newStreak, lastActiveDate: today });
    await Promise.all([persistProfile(), saveDailyTraining(updated)]);
  }

  return {
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    completed: {},
    puzzleRating: DEFAULT_PUZZLE_RATING,
    solvedPuzzleIds: {},
    attemptedPuzzleIds: {},
    bossCleared: {},
    bossResults: {},
    daily: null,
    claimedRewards: {},
    playRating: DEFAULT_PLAY_RATING,
    matches: [],
    hydrated: false,

    hydrate: async () => {
      if (get().hydrated) return;
      const today = todayKey();
      const [profile, progress, attempts, bosses, daily, rewards, matches] = await Promise.all([
        loadProfile(),
        loadLessonProgress(),
        loadPuzzleAttempts(),
        loadBossResults(),
        loadDailyTraining(today),
        loadRewardClaims(),
        loadMatches(),
      ]);

      const completed: CompletedMap = {};
      for (const row of progress) completed[row.lessonId] = { stars: row.stars, score: row.score };

      const solvedPuzzleIds: IdSet = {};
      const attemptedPuzzleIds: IdSet = {};
      for (const a of attempts) {
        attemptedPuzzleIds[a.puzzleId] = true;
        if (a.correct) solvedPuzzleIds[a.puzzleId] = true;
      }

      const bossCleared: IdSet = {};
      const bossResults: Record<string, BossResultRow> = {};
      for (const b of bosses) {
        bossResults[b.bossId] = b;
        if (b.passed) bossCleared[b.bossId] = true;
      }

      const claimedRewards: IdSet = {};
      for (const r of rewards) claimedRewards[r.id] = true;

      set({
        xp: profile?.xp ?? 0,
        streak: profile?.streak ?? 0,
        lastActiveDate: profile?.lastActiveDate ?? null,
        completed,
        puzzleRating: profile?.puzzleRating ?? DEFAULT_PUZZLE_RATING,
        solvedPuzzleIds,
        attemptedPuzzleIds,
        bossCleared,
        bossResults,
        claimedRewards,
        playRating: profile?.playRating ?? DEFAULT_PLAY_RATING,
        matches,
        // Only keep the row if it belongs to today, otherwise start fresh on demand.
        daily: daily && daily.date === today ? daily : null,
        hydrated: true,
      });
    },

    recordMatch: async (m) => {
      const s = get();
      const score = m.outcome === "win" ? 1 : m.outcome === "draw" ? 0.5 : 0;
      const xpAwarded =
        m.outcome === "win"
          ? m.xpReward
          : m.outcome === "draw"
            ? Math.round(m.xpReward / 2)
            : Math.max(5, Math.round(m.xpReward * 0.2));
      const ratingBefore = s.playRating;
      const ratingAfter = eloUpdate(ratingBefore, m.opponentRating, score);
      const today = todayKey();

      const row: MatchRow = {
        opponentId: m.opponentId,
        opponentName: m.opponentName,
        result: m.outcome,
        reason: m.reason,
        userColor: m.userColor,
        moves: m.moves,
        pgn: m.pgn,
        xpAwarded,
        ratingBefore,
        ratingAfter,
        startedAt: m.startedAt,
        finishedAt: m.finishedAt,
      };

      set({
        xp: s.xp + xpAwarded,
        streak: nextStreak(s.lastActiveDate, s.streak, today),
        lastActiveDate: today,
        playRating: ratingAfter,
      });

      await Promise.all([persistProfile(), saveMatch(row)]);
      const matches = await loadMatches();
      set({ matches });
      await touchDaily("play");
      return xpAwarded;
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
      await touchDaily("academy");
      return true;
    },

    recordPuzzleResult: async (args) => {
      const state = get();
      const ratingBefore = state.puzzleRating;
      const firstAttempt = !state.attemptedPuzzleIds[args.puzzleId];
      const firstSolve = args.correct && !state.solvedPuzzleIds[args.puzzleId];

      const ratingAfter = firstAttempt
        ? nextRating(ratingBefore, args.puzzleRating, args.correct)
        : ratingBefore;
      const xpAwarded = firstSolve ? args.xpReward : 0;

      const today = todayKey();
      const newXp = state.xp + xpAwarded;
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

      // Solving a puzzle correctly satisfies the daily puzzle task.
      if (args.correct) await touchDaily("puzzle");

      return { ratingBefore, ratingAfter, xpAwarded, firstSolve, firstAttempt };
    },

    completeBoss: async (bossId, passed, score, total) => {
      const boss = bossById(bossId);
      const state = get();
      const already = Boolean(state.bossCleared[bossId]);
      const firstClear = passed && !already;
      const xpAwarded = firstClear ? boss?.xpReward ?? 0 : 0;

      const prev = state.bossResults[bossId];
      const row: BossResultRow = {
        bossId,
        tier: boss?.tier ?? 0,
        passed: passed || Boolean(prev?.passed),
        score,
        total,
        xpAwarded: (prev?.xpAwarded ?? 0) + xpAwarded,
        completedAt: Date.now(),
      };

      if (firstClear) {
        const today = todayKey();
        set({
          xp: state.xp + xpAwarded,
          streak: nextStreak(state.lastActiveDate, state.streak, today),
          lastActiveDate: today,
          bossCleared: { ...state.bossCleared, [bossId]: true },
          bossResults: { ...state.bossResults, [bossId]: row },
        });
      } else {
        set({ bossResults: { ...state.bossResults, [bossId]: row } });
      }

      await Promise.all([persistProfile(), saveBossResult(row)]);
      // Passing the trial satisfies the daily academy task.
      if (passed) await touchDaily("academy");

      return { passed, xpAwarded, firstClear };
    },

    markDailyTask: async (task) => {
      await touchDaily(task);
    },

    claimDailyBonus: async () => {
      const s = get();
      const today = todayKey();
      const d = dailyForToday(s.daily, today);
      if (!dailyBonusClaimable(d)) return 0;
      const updated = withBonusClaimed(d);
      set({
        daily: updated,
        xp: s.xp + DAILY_BONUS_XP,
        streak: nextStreak(s.lastActiveDate, s.streak, today),
        lastActiveDate: today,
      });
      await Promise.all([persistProfile(), saveDailyTraining(updated)]);
      return DAILY_BONUS_XP;
    },

    claimReward: async (rewardId, xp) => {
      const s = get();
      if (s.claimedRewards[rewardId]) return 0; // already claimed — never again
      const today = todayKey();
      set({
        claimedRewards: { ...s.claimedRewards, [rewardId]: true },
        xp: s.xp + xp,
        streak: nextStreak(s.lastActiveDate, s.streak, today),
        lastActiveDate: today,
      });
      await Promise.all([
        persistProfile(),
        saveRewardClaim({ id: rewardId, xpAwarded: xp, claimedAt: Date.now() }),
      ]);
      return xp;
    },
  };
});

/* ---------- pure selectors (not hooks) ---------- */

export function selectLevel(xp: number): LevelInfo {
  return levelInfo(xp);
}

export function puzzlesSolvedCount(solved: Record<string, unknown>): number {
  return Object.keys(solved).length;
}

/** Build the pure academy snapshot the progression domain expects. */
export function academyStateFrom(
  completed: Record<string, unknown>,
  bossCleared: Record<string, unknown>,
): AcademyState {
  const completedLessonIds: Record<string, boolean> = {};
  for (const id of Object.keys(completed)) completedLessonIds[id] = true;
  const cleared: Record<string, boolean> = {};
  for (const id of Object.keys(bossCleared)) cleared[id] = true;
  return { completedLessonIds, bossCleared: cleared };
}
