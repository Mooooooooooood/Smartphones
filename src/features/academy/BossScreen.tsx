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
import ChessBuddy, { BUDDIES } from "@/components/characters/ChessBuddy";

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
        <h1 className="px-title text-[1rem] text-cream">Trial not found</h1>
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

        <CoachBubble piece="queen">
          I am {BUDDIES.queen.name}, and this gate is mine to guard. Finish your Tier 0 lessons,
          then come challenge me!
        </CoachBubble>

        <div className="relative overflow-hidden rounded-[1.5rem] border border-line p-6 text-center tab-sky">
          <span className="tab-twinkle absolute left-6 top-6 text-lg text-sun">✦</span>
          <span className="tab-twinkle absolute right-8 top-12 text-sm text-mint">✦</span>
          {/* locked gate */}
          <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-3xl border-2 border-line bg-panel/80 shadow-[0_14px_26px_-16px_var(--card-shadow)]">
            <span className="text-6xl text-muted2/70" aria-hidden>♛</span>
            <span className="absolute -bottom-3 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-panel text-muted2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
            </span>
          </div>
          <h1 className="mt-5 px-title text-[1.05rem] text-cream">{boss.title}</h1>
          <p className="mx-auto mt-1.5 max-w-xs text-[0.66rem] text-muted">
            A 5-question challenge. Pass {boss.passScore} of {boss.questions.length} to unlock Tier 1!
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 rounded-2xl border border-brass/30 bg-surf-sun px-4 py-3">
          <span className="text-sm" aria-hidden>🏆</span>
          <span className="text-sm font-semibold text-cream">Reward · +{boss.xpReward} XP &amp; Tier 1 unlocked</span>
        </div>

        <ActionButton href="/academy" variant="secondary">
          Back to the path
        </ActionButton>
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
        <RewardPanel title={`${boss.title} cleared!`} tone="brass" piece="queen" subtitle="Tier 1 is unlocked.">
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
            piece="queen"
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
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-line bg-surf-sun">
            <ChessBuddy piece="queen" size={62} />
          </div>
          <h2 className="mt-3 px-title text-[0.95rem] text-cream">So close — {score}/{total}</h2>
          <p className="mt-1 text-sm text-muted">
            You need {boss.passScore}/{total} to pass. Brush up on these and challenge me again!
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

      <header className="px-1">
        <p className="px-label text-[0.5rem] text-brass">Boss Trial · Tier {boss.tier}</p>
        <h1 className="px-title text-[1.05rem] text-cream">{boss.title}</h1>
      </header>

      <CoachBubble piece="queen">I am {BUDDIES.queen.name}, your challenge host. {boss.subtitle} — answer {boss.passScore} of {total} correctly to pass.</CoachBubble>

      <GameCard className="p-4">
        <p className="px-label text-[0.5rem] text-muted2">Question {qIndex + 1}</p>
        <h2 className="mt-1 px-title text-[0.82rem] leading-snug text-cream">{question.question}</h2>
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
