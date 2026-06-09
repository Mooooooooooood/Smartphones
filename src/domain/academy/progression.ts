import {
  ALL_LESSONS,
  TIERS,
  lessonsForTier,
  tierMeta,
  type Lesson,
  type BossChallenge,
} from "@/content/academy";

/**
 * Pure academy progression logic — no React, no persistence. The UI passes a
 * snapshot of what the player has done and asks what is unlocked / next.
 */
export interface AcademyState {
  /** Set of completed lesson ids (any tier). */
  completedLessonIds: Record<string, boolean>;
  /** Set of cleared boss ids, e.g. { "tier-0": true }. */
  bossCleared: Record<string, boolean>;
}

export type LessonStatus = "completed" | "available" | "locked";
export type BossStatus = "completed" | "ready" | "locked";

export function isLessonComplete(id: string, s: AcademyState): boolean {
  return Boolean(s.completedLessonIds[id]);
}

export function tierLessonsDone(tier: number, s: AcademyState): number {
  return lessonsForTier(tier).filter((l) => isLessonComplete(l.id, s)).length;
}

export function isTierComplete(tier: number, s: AcademyState): boolean {
  const lessons = lessonsForTier(tier);
  return lessons.length > 0 && lessons.every((l) => isLessonComplete(l.id, s));
}

export function isBossCleared(bossId: string, s: AcademyState): boolean {
  return Boolean(s.bossCleared[bossId]);
}

/** A tier's own boss unlocks once every lesson in that tier is complete. */
export function isBossUnlocked(bossId: string, s: AcademyState): boolean {
  const boss = bossForId(bossId);
  if (!boss) return false;
  return isTierComplete(boss.tier, s);
}

/** Tier 0 is always open; later tiers open once the previous tier's boss is cleared. */
export function isTierUnlocked(tier: number, s: AcademyState): boolean {
  if (tier <= 0) return true;
  const prev = tierMeta(tier - 1);
  if (!prev) return true;
  if (!prev.boss) return isTierComplete(tier - 1, s);
  return isBossCleared(prev.boss.id, s);
}

export function lessonStatus(lesson: Lesson, s: AcademyState): LessonStatus {
  if (!isTierUnlocked(lesson.tier, s)) return "locked";
  if (isLessonComplete(lesson.id, s)) return "completed";
  if (lesson.order === 1) return "available";
  const prev = lessonsForTier(lesson.tier).find((l) => l.order === lesson.order - 1);
  return prev && isLessonComplete(prev.id, s) ? "available" : "locked";
}

export function bossStatus(bossId: string, s: AcademyState): BossStatus {
  if (isBossCleared(bossId, s)) return "completed";
  if (isBossUnlocked(bossId, s)) return "ready";
  return "locked";
}

function bossForId(bossId: string): BossChallenge | undefined {
  return TIERS.map((t) => t.boss).find((b) => b?.id === bossId);
}

/** The next lesson in the same tier after `lesson`, or null. */
export function nextLessonInTier(lesson: Lesson): Lesson | null {
  return lessonsForTier(lesson.tier).find((l) => l.order === lesson.order + 1) ?? null;
}

export type NextStepKind = "lesson" | "boss" | "done";

export interface NextStep {
  kind: NextStepKind;
  href: string;
  title: string;
  /** Short call-to-action label. */
  cta: string;
  lesson?: Lesson;
  boss?: BossChallenge;
}

/** What the player should do next, walking tiers in order. */
export function nextRecommended(s: AcademyState): NextStep {
  for (const t of TIERS) {
    if (!isTierUnlocked(t.tier, s)) break;
    const next = lessonsForTier(t.tier).find((l) => !isLessonComplete(l.id, s));
    if (next) {
      return {
        kind: "lesson",
        href: `/academy/${next.id}`,
        title: next.title,
        cta: "Continue lesson",
        lesson: next,
      };
    }
    if (t.boss && !isBossCleared(t.boss.id, s)) {
      return {
        kind: "boss",
        href: `/academy/boss/${t.boss.id}`,
        title: t.boss.title,
        cta: "Take the Trial",
        boss: t.boss,
      };
    }
  }
  return { kind: "done", href: "/puzzles", title: "Keep training", cta: "Solve puzzles" };
}

export interface Progress {
  done: number;
  total: number;
  pct: number;
}

export function tierProgress(tier: number, s: AcademyState): Progress {
  const total = lessonsForTier(tier).length;
  const done = tierLessonsDone(tier, s);
  return { done, total, pct: total ? done / total : 0 };
}

export function academyProgress(s: AcademyState): Progress {
  const total = ALL_LESSONS.length;
  const done = ALL_LESSONS.filter((l) => isLessonComplete(l.id, s)).length;
  return { done, total, pct: total ? done / total : 0 };
}

/** Human-readable description of where the player is in the journey. */
export function currentStageLabel(s: AcademyState): string {
  const step = nextRecommended(s);
  if (step.kind === "lesson" && step.lesson) {
    return tierMeta(step.lesson.tier)?.title ?? "Academy";
  }
  if (step.kind === "boss" && step.boss) return step.boss.title;
  return "All tiers cleared";
}
