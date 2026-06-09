"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfileStore, academyStateFrom } from "@/state/profileStore";
import { bossById } from "@/content/academy";
import { bossStatus, nextRecommended } from "@/domain/academy/progression";
import GameCard from "@/components/ui/GameCard";
import ActionButton from "@/components/ui/ActionButton";
import RewardPanel from "@/components/ui/RewardPanel";
import TopProgress from "@/components/ui/TopProgress";
import CoachBubble from "@/components/ui/CoachBubble";
import Skeleton from "@/components/ui/Skeleton";

const LETTERS = ["A", "B", "C", "D", "E"];

export default function BossScreen({ bossId }: { bossId: string }) {
  const hydrated = useProfileStore((s) => s.hydrated);
  const completed = useProfileStore((s) => s.completed);
  const bossClearedMap = useProfileStore((s) => s.bossCleared);
  const completeBoss = useProfileStore((s) => s.completeBoss);

  useEffect(() => {
    void useProfileStore.getState().hydrate();
  }, []);

  const boss = bossById(bossId);

  const [qIndex, setQIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [reveal, setReveal] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [retaking, setRetaking] = useState(false);
  const [outcome, setOutcome] = useState<{ passed: boolean; xpAwarded: number } | null>(null);

  if (!boss) {
    return (
      <div className="py-12 text-center">
        <h1 className="font-display text-2xl text-cream">Trial not found</h1>
        <Link href="/academy" className="mt-3 inline-block text-brass">
          Back to Academy
        </Link>
      </div>
    );
  }

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const state = academyStateFrom(completed, bossClearedMap);
  const status = bossStatus(bossId, state);
  const clearedAlready = status === "completed";

  if (status === "locked") {
    return (
      <div className="space-y-4">
        <TopProgress value={0} exitHref="/academy" />
        <div className="py-10 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-panel2 text-3xl text-muted2">
            ♛
          </div>
          <h1 className="font-display text-2xl text-cream">{boss.title}</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted">
            Finish all Tier 0 lessons to unlock the Trial.
          </p>
          <Link href="/academy" className="mt-4 inline-block text-brass">
            Back to the path
          </Link>
        </div>
      </div>
    );
  }

  const total = boss.questions.length;
  const question = boss.questions[qIndex];

  function choose(i: number) {
    if (reveal) return;
    setPicked(i);
    setReveal(true);
    setAnswers((a) => {
      const copy = [...a];
      copy[qIndex] = i === question.correctIndex;
      return copy;
    });
  }

  async function advance() {
    if (qIndex < total - 1) {
      setQIndex((n) => n + 1);
      setPicked(null);
      setReveal(false);
      return;
    }
    // finished — score and record once
    const score = answers.filter(Boolean).length;
    const passed = score >= boss!.passScore;
    const result = await completeBoss(boss!.id, passed, score, total);
    setOutcome({ passed: result.passed, xpAwarded: result.xpAwarded });
    setFinished(true);
  }

  function retry() {
    setQIndex(0);
    setPicked(null);
    setReveal(false);
    setAnswers([]);
    setFinished(false);
    setOutcome(null);
    setRetaking(true);
  }

  // Already-cleared landing (before any retake run)
  if (clearedAlready && !retaking && !finished) {
    const step = nextRecommended(state);
    return (
      <div className="space-y-4">
        <TopProgress value={1} exitHref="/academy" trailing="Cleared" />
        <RewardPanel title={`${boss.title} cleared`} tone="brass" subtitle="Tier 1 is unlocked.">
          <div className="flex gap-2">
            <ActionButton onClick={retry} variant="secondary">
              Retake
            </ActionButton>
            <ActionButton href={step.href}>Continue ›</ActionButton>
          </div>
        </RewardPanel>
      </div>
    );
  }

  // Result screen
  if (finished && outcome) {
    const score = answers.filter(Boolean).length;
    const step = nextRecommended(state);
    if (outcome.passed) {
      return (
        <div className="space-y-4">
          <TopProgress value={1} exitHref="/academy" trailing={`${score}/${total}`} />
          <RewardPanel
            title="Trial passed!"
            xp={outcome.xpAwarded || null}
            tone="brass"
            subtitle={`Score ${score}/${total} · Tier 1 unlocked`}
          >
            <div className="flex gap-2">
              <ActionButton href="/academy" variant="secondary">
                Path
              </ActionButton>
              <ActionButton href={step.href}>Start Tier 1 ›</ActionButton>
            </div>
          </RewardPanel>
        </div>
      );
    }
    // failed
    const reviewConcepts = boss.concepts.filter((_, i) => answers[i] === false);
    return (
      <div className="space-y-4">
        <TopProgress value={1} exitHref="/academy" trailing={`${score}/${total}`} />
        <GameCard className="p-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-warn/50 bg-warn/15 text-2xl text-warn">
            !
          </div>
          <h2 className="mt-3 font-display text-xl text-cream">Not yet — {score}/{total}</h2>
          <p className="mt-1 text-sm text-muted">
            You need {boss.passScore}/{total} to pass. Review and try again.
          </p>
          {reviewConcepts.length > 0 ? (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {reviewConcepts.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-line bg-ink2 px-2.5 py-1 text-[11px] text-muted"
                >
                  {c}
                </span>
              ))}
            </div>
          ) : null}
        </GameCard>
        <div className="space-y-2.5">
          <ActionButton onClick={retry}>Try again</ActionButton>
          <ActionButton href="/academy" variant="secondary">
            Review lessons
          </ActionButton>
        </div>
      </div>
    );
  }

  // Active quiz
  return (
    <div className="space-y-4 pb-4">
      <TopProgress
        value={(qIndex + (reveal ? 1 : 0)) / total}
        exitHref="/academy"
        trailing={`${qIndex + 1}/${total}`}
      />

      <header>
        <p className="text-[11px] uppercase tracking-[0.16em] text-brass">Boss Trial · Tier {boss.tier}</p>
        <h1 className="font-display text-2xl text-cream">{boss.title}</h1>
      </header>

      <CoachBubble glyph="♛">{boss.subtitle} — answer {boss.passScore} of {total} correctly to pass.</CoachBubble>

      <GameCard className="p-4">
        <p className="text-[11px] uppercase tracking-wider text-muted2">Question {qIndex + 1}</p>
        <h2 className="mt-0.5 font-display text-lg text-cream">{question.question}</h2>
        <div className="mt-3 space-y-2.5">
          {question.choices.map((c, i) => {
            const isCorrect = i === question.correctIndex;
            const showCorrect = reveal && isCorrect;
            const showWrong = reveal && picked === i && !isCorrect;
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={reveal}
                className={`flex min-h-[52px] w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition-colors disabled:cursor-default ${
                  showCorrect
                    ? "border-good/60 bg-good/15 text-cream"
                    : showWrong
                      ? "border-bad/60 bg-bad/15 text-cream"
                      : "border-line bg-panel text-cream hover:border-muted2"
                }`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line text-xs font-bold text-muted2">
                  {LETTERS[i]}
                </span>
                <span className="flex-1">{c}</span>
                {showCorrect ? <span className="text-good">✓</span> : null}
                {showWrong ? <span className="text-bad">✗</span> : null}
              </button>
            );
          })}
        </div>
      </GameCard>

      <ActionButton onClick={advance} disabled={!reveal}>
        {qIndex < total - 1 ? "Next question ›" : "Finish trial"}
      </ActionButton>
    </div>
  );
}
