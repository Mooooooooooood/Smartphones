"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { lessonById, lessonsForTier, tierMeta, TIER0_BOSS } from "@/content/academy";
import { THEME_LABELS } from "@/content/puzzles/beginner";
import { useProfileStore, academyStateFrom } from "@/state/profileStore";
import { lessonStatus, nextLessonInTier } from "@/domain/academy/progression";
import GameCard from "@/components/ui/GameCard";
import ActionButton from "@/components/ui/ActionButton";
import RewardPanel from "@/components/ui/RewardPanel";
import CoachBubble from "@/components/ui/CoachBubble";
import TopProgress from "@/components/ui/TopProgress";
import Skeleton from "@/components/ui/Skeleton";

const LessonBoard = dynamic(() => import("@/components/LessonBoard"), {
  ssr: false,
  loading: () => <div className="mx-auto aspect-square w-full max-w-[320px] tab-skeleton" />,
});

const LETTERS = ["A", "B", "C", "D", "E"];

function LessonLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-3 w-full rounded-full" />
      <Skeleton className="h-9 w-3/4" />
      <Skeleton className="mx-auto aspect-square w-full max-w-[320px]" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export default function LessonScreen({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const completed = useProfileStore((s) => s.completed);
  const bossClearedMap = useProfileStore((s) => s.bossCleared);
  const hydrated = useProfileStore((s) => s.hydrated);
  const completeLesson = useProfileStore((s) => s.completeLesson);

  useEffect(() => {
    void useProfileStore.getState().hydrate();
  }, []);

  const lesson = useMemo(() => lessonById(lessonId), [lessonId]);

  const [picked, setPicked] = useState<number | null>(null);
  const [firstTry, setFirstTry] = useState(true);
  const [justEarned, setJustEarned] = useState<number | null>(null);

  if (!lesson) {
    return (
      <div className="py-12 text-center">
        <h1 className="font-display text-2xl text-cream">Lesson not found</h1>
        <Link href="/academy" className="mt-3 inline-block text-brass">
          Back to Academy
        </Link>
      </div>
    );
  }

  if (!hydrated) {
    return <LessonLoading />;
  }

  const state = academyStateFrom(completed, bossClearedMap);

  if (lessonStatus(lesson, state) === "locked") {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-line bg-panel2 text-muted2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </div>
        <h1 className="font-display text-2xl text-cream">Locked</h1>
        <p className="mt-2 text-sm text-muted">Finish the earlier lessons first.</p>
        <Link href="/academy" className="mt-3 inline-block text-brass">
          Back to Academy
        </Link>
      </div>
    );
  }

  const tierLessons = lessonsForTier(lesson.tier);
  const tierTitle = tierMeta(lesson.tier)?.title ?? "Academy";
  const alreadyDone = Boolean(completed[lesson.id]);
  const correct = picked !== null && picked === lesson.quiz.correctIndex;
  const nextSeq = nextLessonInTier(lesson);
  const bossNext = !nextSeq && lesson.tier === 0; // last Tier 0 lesson → Trial
  const mastered = alreadyDone || justEarned !== null;
  const theme = lesson.relatedPuzzleTheme;

  function choose(i: number) {
    if (!lesson || correct) return;
    setPicked(i);
    if (i !== lesson.quiz.correctIndex) setFirstTry(false);
  }

  async function finish() {
    if (!lesson || !correct || alreadyDone) return;
    const earnedStars = firstTry ? 3 : 2;
    const ok = await completeLesson(lesson.id, lesson.xpReward, earnedStars);
    if (ok) setJustEarned(lesson.xpReward);
  }

  const stars = completed[lesson.id]?.stars ?? (firstTry ? 3 : 2);

  return (
    <div className="space-y-4 pb-4">
      <TopProgress
        value={lesson.order / tierLessons.length}
        exitHref="/academy"
        trailing={`${lesson.order}/${tierLessons.length}`}
      />

      <header>
        <p className="text-[11px] uppercase tracking-[0.16em] text-brass">{tierTitle}</p>
        <div className="mt-0.5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-3xl text-cream">{lesson.title}</h1>
            <p className="mt-0.5 text-sm text-muted">{lesson.subtitle}</p>
          </div>
          <span className="shrink-0 rounded-full border border-brass/40 bg-brass/10 px-2.5 py-1 text-[11px] font-semibold text-brass">
            +{lesson.xpReward} XP
          </span>
        </div>
      </header>

      {lesson.fen ? (
        <GameCard className="p-3">
          <div className="mx-auto w-full max-w-[320px]">
            <LessonBoard fen={lesson.fen} />
          </div>
          {lesson.boardCaption ? (
            <p className="mt-2 text-center text-xs text-muted2">{lesson.boardCaption}</p>
          ) : null}
        </GameCard>
      ) : null}

      <CoachBubble piece="bishop">{lesson.explanation}</CoachBubble>

      <ul className="space-y-1.5">
        {lesson.keyPoints.map((k, i) => (
          <li key={i} className="flex gap-2 text-sm text-muted">
            <span className="text-brass">•</span>
            <span>{k}</span>
          </li>
        ))}
      </ul>

      {/* Quiz */}
      <GameCard className="p-4">
        <p className="text-[11px] uppercase tracking-wider text-muted2">Checkpoint</p>
        <h2 className="mt-0.5 font-display text-lg text-cream">{lesson.quiz.question}</h2>
        <div className="mt-3 space-y-2.5">
          {lesson.quiz.choices.map((c, i) => {
            const isPicked = picked === i;
            const showCorrect = picked !== null && i === lesson.quiz.correctIndex;
            const showWrong = isPicked && i !== lesson.quiz.correctIndex;
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={correct}
                className={`flex min-h-[52px] w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition-colors disabled:cursor-default ${
                  showCorrect
                    ? "border-good/60 bg-good/15 text-cream"
                    : showWrong
                      ? "border-bad/60 bg-bad/15 text-cream"
                      : "border-line bg-panel text-cream hover:border-muted2"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${
                    showCorrect
                      ? "border-good/60 text-good"
                      : showWrong
                        ? "border-bad/60 text-bad"
                        : "border-line text-muted2"
                  }`}
                >
                  {LETTERS[i]}
                </span>
                <span className="flex-1">{c}</span>
                {showCorrect ? <span className="text-good">✓</span> : null}
                {showWrong ? <span className="text-bad">✗</span> : null}
              </button>
            );
          })}
        </div>
        {picked !== null && !correct ? (
          <p className="mt-3 text-xs text-warn">Not quite — review the lesson and try again.</p>
        ) : null}
        {correct && !mastered ? (
          <p className="mt-3 text-xs text-good">Correct! Claim your reward below.</p>
        ) : null}
      </GameCard>

      {/* Completion / actions */}
      {mastered ? (
        <RewardPanel
          title="Lesson mastered!"
          xp={justEarned}
          tone="brass"
          piece="bishop"
          subtitle={`${stars}★ earned${alreadyDone && justEarned === null ? " · already completed" : ""}`}
        >
          {nextSeq ? (
            <div className="mb-3 flex items-center justify-center gap-2 text-xs text-muted2">
              <span>Unlocks next</span>
              <span className="rounded-full border border-line bg-ink2 px-2 py-0.5 text-cream">
                {nextSeq.title}
              </span>
            </div>
          ) : bossNext ? (
            <div className="mb-3 text-center text-xs text-muted2">Tier 0 complete — the Trial awaits!</div>
          ) : null}

          {theme ? (
            <ActionButton href={`/puzzles?theme=${theme}`} variant="secondary" className="mb-2">
              Practice {THEME_LABELS[theme]} ›
            </ActionButton>
          ) : null}

          <div className="flex gap-2">
            <ActionButton href="/academy" variant="secondary">
              Path
            </ActionButton>
            {nextSeq ? (
              <ActionButton onClick={() => router.push(`/academy/${nextSeq.id}`)}>
                Continue ›
              </ActionButton>
            ) : bossNext ? (
              <ActionButton onClick={() => router.push(`/academy/boss/${TIER0_BOSS.id}`)}>
                Take Trial ›
              </ActionButton>
            ) : null}
          </div>
        </RewardPanel>
      ) : (
        <div className="space-y-2.5">
          <ActionButton onClick={finish} disabled={!correct}>
            Complete lesson (+{lesson.xpReward} XP)
          </ActionButton>
          <ActionButton href="/academy" variant="secondary">
            Back to Path
          </ActionButton>
        </div>
      )}
    </div>
  );
}
