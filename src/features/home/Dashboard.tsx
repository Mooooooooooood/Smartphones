"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useProfileStore, selectLevel, puzzlesSolvedCount, academyStateFrom } from "@/state/profileStore";
import { usePuzzleStore, overallAccuracy } from "@/state/puzzleStore";
import { useGameStore } from "@/state/gameStore";
import { rankForLevel } from "@/domain/progression/rank";
import { todayKey } from "@/domain/progression/leveling";
import { nextRecommended, academyProgress, tierProgress, isTierUnlocked } from "@/domain/academy/progression";
import { dailyForToday, dailyDoneCount, dailyAllComplete, dailyBonusClaimable, DAILY_BONUS_XP } from "@/domain/training/daily";
import TopBar from "@/components/pixel/TopBar";
import PixelPanel from "@/components/pixel/PixelPanel";
import PixelButton from "@/components/pixel/PixelButton";
import PixelStat from "@/components/pixel/PixelStat";
import PixelChest from "@/components/pixel/PixelChest";
import SectionLabel from "@/components/pixel/SectionLabel";
import { AcademyGlyph, PuzzleGlyph, PlayGlyph, StarIcon, FlameIcon } from "@/components/pixel/PixelIcon";
import ChessBuddy from "@/components/characters/ChessBuddy";

type MilestoneState = "done" | "current" | "locked";

function QuestRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="px-track h-2.5 flex-1">
        <div className="px-track-fill" style={{ width: done ? "100%" : "8%", "--fill": done ? "var(--color-good)" : "var(--color-sky)" } as React.CSSProperties} />
      </div>
      <span className="w-24 shrink-0 truncate text-[0.62rem] text-muted">{label}</span>
      <span className={`px-label text-[0.5rem] ${done ? "text-good" : "text-muted2"}`}>{done ? "✓" : "0/1"}</span>
    </div>
  );
}

function ModeCard({ href, glyph, title, cta, hue, deep, sprite }: {
  href: string; glyph: React.ReactNode; title: string; cta: string;
  hue: string; deep: string; sprite: React.ReactNode;
}) {
  return (
    <Link href={href} className="block active:translate-y-0.5">
      <div className="px-card flex h-full flex-col items-center gap-1 px-1.5 py-2 text-center" style={{ "--hue": hue, "--hue-deep": deep } as React.CSSProperties}>
        <div className="flex h-9 items-center justify-center">{sprite ?? glyph}</div>
        <span className="px-label text-[0.5rem] text-cream">{title}</span>
        <span className="px-label rounded-[4px] border-2 border-[var(--px-edge)] bg-[var(--color-ink)] px-1.5 py-0.5 text-[0.44rem] text-brass">{cta}</span>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const xp = useProfileStore((s) => s.xp);
  const completed = useProfileStore((s) => s.completed);
  const bossClearedMap = useProfileStore((s) => s.bossCleared);
  const puzzleRating = useProfileStore((s) => s.puzzleRating);
  const solvedIds = useProfileStore((s) => s.solvedPuzzleIds);
  const dailyRaw = useProfileStore((s) => s.daily);
  const claimDailyBonus = useProfileStore((s) => s.claimDailyBonus);
  const matches = useProfileStore((s) => s.matches);
  const attempts = usePuzzleStore((s) => s.attempts);

  useEffect(() => {
    void usePuzzleStore.getState().hydrate();
    void useGameStore.getState().hydrate();
  }, []);

  const lvl = selectLevel(xp);
  const rank = rankForLevel(lvl.level);
  const state = academyStateFrom(completed, bossClearedMap);
  const step = nextRecommended(state);
  const acad = academyProgress(state);
  const t0 = tierProgress(0, state);
  const t1 = tierProgress(1, state);
  const tier1Open = isTierUnlocked(1, state);
  const bossDone = Boolean(bossClearedMap["tier-0"]);
  const solved = puzzlesSolvedCount(solvedIds);
  const acc = overallAccuracy(attempts);
  const fresh = xp === 0;

  const daily = dailyForToday(dailyRaw, todayKey());
  const doneCount = dailyDoneCount(daily);
  const allDone = dailyAllComplete(daily);
  const claimable = dailyBonusClaimable(daily);

  const wins = matches.filter((m) => m.result === "win").length;
  const winRate = matches.length ? Math.round((wins / matches.length) * 100) : 0;

  const t0State: MilestoneState = t0.total > 0 && t0.done === t0.total ? "done" : "current";
  const bossState: MilestoneState = bossDone ? "done" : t0State === "done" ? "current" : "locked";
  const t1State: MilestoneState = !tier1Open ? "locked" : t1.total > 0 && t1.done === t1.total ? "done" : "current";

  return (
    <div className="space-y-2.5">
      <TopBar streak />

      {/* Hero — The Rang + player card */}
      <PixelPanel hue="gold" rivets glow="reward" className="px-3 py-2.5">
        <h1 className="px-title mb-2 text-center text-[1.7rem] leading-none">The Rang</h1>
        <div className="flex items-stretch gap-2.5">
          <div className="relative shrink-0 self-end">
            <div className="px-inset mb-1 max-w-[88px] px-1.5 py-1 text-[0.52rem] leading-tight text-cream">
              {fresh ? "Let's begin!" : "Every move makes you stronger!"}
            </div>
            <ChessBuddy piece="pawn" size={56} className="tab-bob mx-auto" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <ChessBuddy piece={rank.tier >= 5 ? "queen" : rank.tier >= 3 ? "knight" : "pawn"} size={20} />
              <span className="px-label text-[0.58rem] text-cream">{rank.title}</span>
            </div>
            <p className="mt-0.5 text-[0.58rem] text-muted2">Keep learning, future master!</p>
            <div className="px-track mt-1.5 h-3">
              <div className="px-track-fill" style={{ width: `${Math.round(lvl.progress * 100)}%`, "--fill": "var(--color-brass)" } as React.CSSProperties} />
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              <PixelStat label="Rating" value={puzzleRating} tone="gold" />
              <PixelStat label="Win %" value={`${winRate}%`} tone="good" />
            </div>
          </div>
        </div>
      </PixelPanel>

      <PixelButton href={step.href} tone="gold">
        {fresh ? "★ START JOURNEY ★" : "⚔ CONTINUE JOURNEY ⚔"}
      </PixelButton>

      {/* Daily Quest */}
      <PixelPanel className="px-3 py-2.5">
        <SectionLabel icon={<StarIcon size={12} />}>Daily Quest</SectionLabel>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <QuestRow label="Win a match" done={daily.playTaskDone} />
            <QuestRow label="Solve a puzzle" done={daily.puzzleTaskDone} />
            <QuestRow label="Study a lesson" done={daily.academyTaskDone} />
          </div>
          <button
            type="button"
            onClick={claimable ? claimDailyBonus : undefined}
            disabled={!claimable}
            className={`flex shrink-0 flex-col items-center ${claimable ? "tab-bob active:translate-y-0.5" : ""}`}
            aria-label="Daily reward chest"
          >
            <PixelChest state={daily.bonusClaimed ? "open" : claimable ? "ready" : "locked"} size={48} />
            <span className="px-label mt-0.5 text-[0.42rem] text-brass">+{DAILY_BONUS_XP} XP</span>
          </button>
        </div>
        <p className="mt-1.5 text-center text-[0.56rem] text-muted2">
          {daily.bonusClaimed ? "Reward claimed — see you tomorrow!" : claimable ? "Tap the chest to claim your bonus!" : allDone ? "All done!" : `${doneCount}/3 quests complete`}
        </p>
      </PixelPanel>

      {/* Mode cards */}
      <div className="grid grid-cols-3 gap-2">
        <ModeCard href={step.href} title="Academy" cta="ENTER" hue="var(--color-sky)" deep="#1c50b0"
          glyph={<AcademyGlyph size={26} className="text-sky" />} sprite={<ChessBuddy piece="king" size={34} />} />
        <ModeCard href="/puzzles" title="Puzzles" cta="SOLVE" hue="var(--color-mint)" deep="#1f8f4d"
          glyph={<PuzzleGlyph size={26} className="text-mint" />} sprite={<ChessBuddy piece="knight" size={34} />} />
        <ModeCard href="/play" title="Play" cta="BATTLE" hue="var(--color-bad)" deep="#b32436"
          glyph={<PlayGlyph size={26} className="text-coral" />} sprite={<ChessBuddy piece="rook" size={34} />} />
      </div>

      {/* Journey strip */}
      <PixelPanel className="px-3 py-2.5">
        <SectionLabel icon={<FlameIcon size={12} />} action={<Link href="/academy" className="px-label text-[0.5rem] text-muted2">VIEW MAP ›</Link>}>
          Journey
        </SectionLabel>
        <div className="flex items-center justify-between">
          <JourneyNode label="Found." state={t0State} piece="pawn" />
          <Connector on={t0State === "done"} />
          <JourneyNode label="Trial" state={bossState} piece="queen" />
          <Connector on={bossState === "done"} />
          <JourneyNode label="Tactics" state={t1State} piece="bishop" />
        </div>
        <Link href={step.href} className="px-inset mt-2 flex items-center gap-2 px-2 py-1.5 active:translate-y-0.5">
          <span className="px-label text-[0.5rem] text-brass">{step.kind === "boss" ? "TRIAL" : step.kind === "done" ? "DONE" : "NEXT"}</span>
          <span className="min-w-0 flex-1 truncate text-[0.66rem] text-cream">{step.title}</span>
          <span className="text-brass">›</span>
        </Link>
        <p className="mt-1 text-center text-[0.52rem] text-muted2">Academy {Math.round(acad.pct * 100)}% · {solved} solved · {acc.total ? `${Math.round(acc.pct * 100)}% acc` : "no puzzles yet"}</p>
      </PixelPanel>
    </div>
  );
}

function Connector({ on }: { on: boolean }) {
  return <div className={`mx-1 h-1 flex-1 rounded-[2px] ${on ? "bg-good" : "bg-[var(--px-edge)]"}`} />;
}

function JourneyNode({ label, state, piece }: { label: string; state: MilestoneState; piece: "pawn" | "queen" | "bishop" }) {
  const border = state === "current" ? "border-brass tab-pulse" : state === "done" ? "border-good" : "border-[var(--px-edge)]";
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className={`flex h-11 w-11 items-center justify-center rounded-[6px] border-[3px] bg-[var(--color-ink)] ${border}`}>
        {state === "locked" ? <span className="text-muted2">🔒</span> : state === "done" ? <span className="font-display text-good">✓</span> : <ChessBuddy piece={piece} size={30} />}
      </div>
      <span className="px-label text-[0.42rem] text-muted2">{label}</span>
    </div>
  );
}
