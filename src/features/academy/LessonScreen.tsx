"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { lessonById, tierMeta, TIER0_BOSS } from "@/content/academy";
import { THEME_LABELS } from "@/content/puzzles/beginner";
import { useProfileStore, academyStateFrom } from "@/state/profileStore";
import { lessonStatus, nextLessonInTier } from "@/domain/academy/progression";
import { lessonSteps } from "@/domain/academy/lessonRun";
import { isInteractive, hasBoard, type LessonStep } from "@/domain/academy/lessonSteps";
import GameCard from "@/components/ui/GameCard";
import ActionButton from "@/components/ui/ActionButton";
import PixelButton from "@/components/pixel/PixelButton";
import RewardPanel from "@/components/ui/RewardPanel";
import TopProgress from "@/components/ui/TopProgress";
import Skeleton from "@/components/ui/Skeleton";
import ChessBuddy, { BUDDIES } from "@/components/characters/ChessBuddy";
import { fx } from "@/lib/feedback";

const LessonInteractiveBoard = dynamic(() => import("@/components/LessonInteractiveBoard"), {
  ssr: false,
  loading: () => <div className="mx-auto aspect-square w-full max-w-[340px] tab-skeleton rounded-xl" />,
});

const LETTERS = ["A", "B", "C", "D", "E"];

function stepKind(step: LessonStep): "Story" | "Watch" | "Try" | "Checkpoint" {
  if (step.type === "intro") return "Story";
  if (step.type === "explain" || step.type === "board-demo") return "Watch";
  if (step.type === "multiple-choice" || step.type === "true-false") return "Checkpoint";
  return "Try";
}

function LessonLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-3 w-full rounded-full" />
      <Skeleton className="h-9 w-3/4" />
      <Skeleton className="mx-auto aspect-square w-full max-w-[340px]" />
      <Skeleton className="h-24 w-full" />
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
  const steps = useMemo(() => (lesson ? lessonSteps(lesson) : []), [lesson]);

  const [idx, setIdx] = useState(0);
  const [solved, setSolved] = useState(false);
  const [mcPicked, setMcPicked] = useState<number | null>(null);
  const [tfPicked, setTfPicked] = useState<boolean | null>(null);
  const [stepWrong, setStepWrong] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [boardKey, setBoardKey] = useState(0);
  const [anyWrong, setAnyWrong] = useState(false);
  const [finished, setFinished] = useState(false);
  const [justEarned, setJustEarned] = useState<number | null>(null);

  if (!lesson) {
    return (
      <div className="py-12 text-center">
        <h1 className="px-title text-[1rem] text-cream">Lesson not found</h1>
        <Link href="/academy" className="mt-3 inline-block text-brass">
          Back to Academy
        </Link>
      </div>
    );
  }

  if (!hydrated) return <LessonLoading />;

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
        <h1 className="px-title text-[1rem] text-cream">Locked</h1>
        <p className="mt-2 text-sm text-muted">Finish the earlier lessons first.</p>
        <Link href="/academy" className="mt-3 inline-block text-brass">
          Back to Academy
        </Link>
      </div>
    );
  }

  const tierTitle = tierMeta(lesson.tier)?.title ?? "Academy";
  const alreadyDone = Boolean(completed[lesson.id]);
  const nextSeq = nextLessonInTier(lesson);
  const bossNext = !nextSeq && lesson.tier === 0;
  const theme = lesson.relatedPuzzleTheme;

  const step = steps[idx];
  const isLast = idx === steps.length - 1;
  const interactive = isInteractive(step);
  const canAdvance =
    step.type === "multiple-choice"
      ? mcPicked === step.correctIndex
      : step.type === "true-false"
        ? tfPicked === step.answer
        : step.type === "tap-square" || step.type === "tap-piece" || step.type === "make-move"
          ? solved
          : true;

  const stepGuide = "guide" in step ? step.guide : undefined;
  const guide = stepGuide ?? lesson.guide ?? "bishop";

  function resetStepState() {
    setSolved(false);
    setMcPicked(null);
    setTfPicked(null);
    setStepWrong(false);
    setShowHint(false);
    setBoardKey(0);
  }

  /** Reset the current board step so the player can try again from scratch. */
  function retryBoard() {
    setStepWrong(false);
    setShowHint(false);
    setBoardKey((k) => k + 1);
  }
  /** Re-enable all answers on a multiple-choice step. */
  function retryChoice() {
    setMcPicked(null);
  }

  async function finish() {
    setFinished(true);
    if (!lesson || alreadyDone) return;
    const stars = anyWrong ? 2 : 3;
    const ok = await completeLesson(lesson.id, lesson.xpReward, stars);
    if (ok) setJustEarned(lesson.xpReward);
  }

  function goNext() {
    if (!canAdvance) return;
    if (isLast) {
      void finish();
      return;
    }
    setIdx((i) => i + 1);
    resetStepState();
  }

  function goBack() {
    if (idx === 0) return;
    setIdx((i) => i - 1);
    resetStepState();
  }

  function handleBoardResult(correct: boolean) {
    if (correct) {
      setSolved(true);
      setStepWrong(false);
      fx.correct();
    } else {
      setStepWrong(true);
      setAnyWrong(true);
      fx.wrong();
    }
  }

  function pickChoice(i: number) {
    if (step.type !== "multiple-choice" || mcPicked === step.correctIndex) return;
    fx[i === step.correctIndex ? "correct" : "wrong"]();
    setMcPicked(i);
    if (i !== step.correctIndex) setAnyWrong(true);
  }

  function pickTrueFalse(v: boolean) {
    if (step.type !== "true-false" || tfPicked === step.answer) return;
    setTfPicked(v);
    if (v !== step.answer) setAnyWrong(true);
  }

  /* ---------- Reward stage ---------- */
  if (finished) {
    const stars = completed[lesson.id]?.stars ?? (anyWrong ? 2 : 3);
    return (
      <div className="space-y-4 pb-4">
        <TopProgress value={1} exitHref="/academy" trailing="Done" />
        <RewardPanel
          title="Lesson mastered!"
          xp={justEarned}
          tone="brass"
          piece={guide}
          subtitle={`${stars}★ earned${alreadyDone && justEarned === null ? " · already completed" : ""}`}
        >
          {nextSeq ? (
            <div className="mb-3 flex items-center justify-center gap-2 text-xs text-muted2">
              <span>Unlocks next</span>
              <span className="rounded-full border border-line bg-ink2 px-2 py-0.5 text-cream">{nextSeq.title}</span>
            </div>
          ) : bossNext ? (
            <div className="mb-3 text-center text-xs text-muted2">Tier 0 complete — the Trial awaits!</div>
          ) : null}

          {theme ? (
            <Link
              href={`/puzzles?theme=${theme}`}
              className="mb-2 flex items-center gap-2.5 rounded-2xl border border-lav/40 bg-surf-lav p-3 transition-transform active:scale-[0.99]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-lav/40 bg-panel text-xl text-lavdeep">
                ✦
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-sm font-semibold text-cream">Practice {THEME_LABELS[theme]}</span>
                <span className="block text-[11px] text-muted2">Try it in the Tactics Arena</span>
              </span>
              <span className="shrink-0 text-lavdeep">›</span>
            </Link>
          ) : null}

          <div className="flex gap-2">
            <ActionButton href="/academy" variant="secondary">
              Path
            </ActionButton>
            {nextSeq ? (
              <ActionButton onClick={() => router.push(`/academy/${nextSeq.id}`)}>Continue ›</ActionButton>
            ) : bossNext ? (
              <ActionButton onClick={() => router.push(`/academy/boss/${TIER0_BOSS.id}`)}>Take Trial ›</ActionButton>
            ) : (
              <ActionButton href="/academy">Finish ✓</ActionButton>
            )}
          </div>
        </RewardPanel>
      </div>
    );
  }

  /* ---------- Active stage ---------- */
  const kind = stepKind(step);

  return (
    <div className="space-y-4 pb-4">
      <TopProgress value={(idx + 1) / steps.length} exitHref="/academy" trailing={`${idx + 1}/${steps.length}`} />

      {/* step rail */}
      <div className="flex items-center gap-1.5">
        {steps.map((s, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < idx ? "bg-good" : i === idx ? "bg-brass" : "bg-line"
            }`}
          />
        ))}
      </div>

      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="px-label text-[0.5rem] text-brass">{tierTitle} · Stage {lesson.order}</p>
          <h1 className="truncate px-title text-[0.92rem] leading-tight text-cream">{lesson.title}</h1>
        </div>
        <span className="px-inset shrink-0 px-2 py-1 text-[0.52rem] font-bold text-brass">+{lesson.xpReward} XP</span>
      </header>

      {/* stage card */}
      <GameCard variant={interactive ? "accent" : "default"} glow={interactive} className="p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="tab-bob flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-surf-blue">
            <ChessBuddy piece={guide} size={38} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brass">
              {kind} · {BUDDIES[guide].name}
            </p>
            <p className="text-sm font-semibold leading-snug text-cream">
              {step.type === "intro"
                ? step.title
                : step.type === "explain"
                  ? step.title ?? "Let's learn"
                  : "prompt" in step
                    ? step.prompt
                    : ""}
            </p>
          </div>
        </div>

        {step.type === "intro" ? <p className="text-sm leading-relaxed text-muted">{step.text}</p> : null}

        {step.type === "explain" ? (
          <div className="space-y-2.5">
            <p className="text-sm leading-relaxed text-muted">{step.text}</p>
            {step.points ? (
              <ul className="space-y-1.5">
                {step.points.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted">
                    <span className="text-brass">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {hasBoard(step) ? (
          <div className="space-y-2">
            <div className="px-board-frame mx-auto w-full max-w-[340px]">
              <div className="overflow-hidden rounded-[4px]">
                <LessonInteractiveBoard key={`${idx}-${boardKey}`} step={step} solved={solved} onResult={handleBoardResult} showHint={showHint} />
              </div>
            </div>
            {step.type === "board-demo" && step.caption ? (
              <p className="text-center text-xs text-muted2">{step.caption}</p>
            ) : null}

            {interactive ? (
              solved ? (
                <p className="rounded-xl border border-good/40 bg-good/10 px-3 py-2 text-center text-sm font-semibold text-gooddeep">
                  {"successText" in step ? step.successText : "Correct!"}
                </p>
              ) : stepWrong ? (
                <div className="rounded-xl border border-warn/40 bg-surf-sun px-3 py-2">
                  <p className="text-center text-xs font-medium text-warn">
                    {("failureText" in step && step.failureText) || "Not quite — try again!"}
                  </p>
                  <div className="mt-2 flex justify-center gap-2">
                    <PixelButton onClick={retryBoard} tone="gold" size="sm" className="!w-auto">↺ Retry</PixelButton>
                    {"hint" in step && step.hint ? (
                      <PixelButton onClick={() => setShowHint(true)} variant="secondary" size="sm" className="!w-auto">Hint</PixelButton>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="text-center text-xs text-muted2">👆 {step.type === "make-move" ? "Make your move on the board" : "Tap the board to answer"}</p>
              )
            ) : null}

            {showHint && "hint" in step && step.hint && !solved ? (
              <p className="text-center text-[11px] text-brass">💡 {step.hint}</p>
            ) : null}
          </div>
        ) : null}

        {/* multiple choice */}
        {step.type === "multiple-choice" ? (
          <div className="mt-1 space-y-2.5">
            {step.choices.map((c, i) => {
              const isPicked = mcPicked === i;
              const showCorrect = mcPicked !== null && i === step.correctIndex;
              const showWrong = isPicked && i !== step.correctIndex;
              return (
                <button
                  key={i}
                  onClick={() => pickChoice(i)}
                  disabled={canAdvance}
                  className={`flex min-h-[52px] w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left text-sm transition-transform active:translate-y-0.5 disabled:cursor-default ${
                    showCorrect
                      ? "border-good/60 bg-good/15 text-cream"
                      : showWrong
                        ? "border-bad/60 bg-bad/15 text-cream"
                        : "border-line bg-panel text-cream shadow-[0_3px_0_0_var(--color-line)] hover:border-brass/50"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      showCorrect ? "bg-good/20 text-gooddeep" : showWrong ? "bg-bad/20 text-bad" : "bg-ink2 text-muted"
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
            {canAdvance ? (
              <p className="text-center text-sm font-semibold text-gooddeep">{step.successText ?? "Correct!"}</p>
            ) : mcPicked !== null ? (
              <div className="flex flex-col items-center gap-1.5">
                <p className="text-center text-xs text-warn">Not quite — try another answer.</p>
                <PixelButton onClick={retryChoice} tone="gold" size="sm" className="!w-auto">↺ Retry</PixelButton>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* true / false */}
        {step.type === "true-false" ? (
          <div className="mt-1 space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              {[true, false].map((v) => {
                const isPicked = tfPicked === v;
                const correct = canAdvance && v === step.answer;
                const wrong = isPicked && v !== step.answer;
                return (
                  <button
                    key={String(v)}
                    onClick={() => pickTrueFalse(v)}
                    disabled={tfPicked === step.answer}
                    className={`flex min-h-[56px] items-center justify-center gap-2 rounded-2xl border text-sm font-bold transition-transform active:translate-y-0.5 ${
                      correct
                        ? "border-good/60 bg-good/15 text-gooddeep"
                        : wrong
                          ? "border-bad/60 bg-bad/15 text-bad"
                          : "border-line bg-panel text-cream shadow-[0_3px_0_0_var(--color-line)]"
                    }`}
                  >
                    {v ? "✓ True" : "✗ False"}
                  </button>
                );
              })}
            </div>
            {canAdvance ? (
              <p className="text-center text-sm font-semibold text-gooddeep">{step.successText ?? "Correct!"}</p>
            ) : tfPicked !== null ? (
              <p className="text-center text-xs text-warn">Not quite — think again!</p>
            ) : null}
          </div>
        ) : null}
      </GameCard>

      {/* nav */}
      <div className="flex gap-2.5">
        {idx > 0 ? (
          <ActionButton onClick={goBack} variant="secondary" className="max-w-[110px]">
            ‹ Back
          </ActionButton>
        ) : (
          <ActionButton href="/academy" variant="secondary" className="max-w-[110px]">
            Exit
          </ActionButton>
        )}
        <ActionButton onClick={goNext} disabled={!canAdvance}>
          {isLast ? `Finish (+${lesson.xpReward} XP) ✓` : interactive ? (canAdvance ? "Continue ›" : "Solve to continue") : "Continue ›"}
        </ActionButton>
      </div>
    </div>
  );
}
