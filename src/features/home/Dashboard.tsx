"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useProfileStore, selectLevel, academyStateFrom } from "@/state/profileStore";
import { usePuzzleStore } from "@/state/puzzleStore";
import { useGameStore } from "@/state/gameStore";
import { rankForLevel } from "@/domain/progression/rank";
import { todayKey } from "@/domain/progression/leveling";
import { nextRecommended, tierProgress } from "@/domain/academy/progression";
import { dailyForToday, dailyBonusClaimable, DAILY_BONUS_XP } from "@/domain/training/daily";
import PixelTopBar from "@/components/pixel/PixelTopBar";
import PixelPanel from "@/components/pixel/PixelPanel";
import PixelButton from "@/components/pixel/PixelButton";
import PixelStatPill from "@/components/pixel/PixelStatPill";
import PixelCard from "@/components/pixel/PixelCard";
import PixelRewardChest from "@/components/pixel/PixelRewardChest";
import { CoinIcon, GemIcon, StarIcon, FlameIcon } from "@/components/pixel/PixelIcon";
import ChessBuddy from "@/components/characters/ChessBuddy";
import PlayerAvatar from "@/components/pixel/PlayerAvatar";

function QuestRow({ label, done, coin }: { label: string; done: boolean; coin: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="truncate text-[0.56rem] text-cream">{label}</span>
          <span className="px-label text-[0.44rem] text-muted2">{done ? "1/1" : "0/1"}</span>
        </div>
        <div className="px-track mt-0.5 h-2">
          <div className="px-track-fill" style={{ width: done ? "100%" : "10%", "--fill": done ? "var(--color-good)" : "var(--color-sky)" } as React.CSSProperties} />
        </div>
      </div>
      <span className="px-inset flex shrink-0 items-center gap-0.5 px-1 py-0.5">
        {done ? <span className="text-[0.6rem] text-good">✓</span> : <><CoinIcon size={10} /><span className="font-display text-[0.5rem] text-brass">{coin}</span></>}
      </span>
    </div>
  );
}

function MapDot({ n, state }: { n: number; state: "done" | "current" | "locked" }) {
  const cls = state === "current" ? "border-brass bg-[#234a9e] tab-pulse" : state === "done" ? "border-[#2f64c4] bg-[#234a9e]" : "border-[#243056] bg-[#1a2344]";
  return (
    <div className="flex flex-col items-center">
      {state === "current" ? <span className="text-[0.55rem] leading-none" aria-hidden>🚩</span> : <span className="h-[0.55rem]" />}
      <div className={`flex h-7 w-7 items-center justify-center rounded-full border-[3px] ${cls} shadow-[0_0_0_2px_var(--px-edge)]`}>
        <span className="font-display text-[0.5rem] text-cream">{state === "locked" ? "🔒" : n}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const xp = useProfileStore((s) => s.xp);
  const streak = useProfileStore((s) => s.streak);
  const completed = useProfileStore((s) => s.completed);
  const bossClearedMap = useProfileStore((s) => s.bossCleared);
  const puzzleRating = useProfileStore((s) => s.puzzleRating);
  const dailyRaw = useProfileStore((s) => s.daily);
  const claimDailyBonus = useProfileStore((s) => s.claimDailyBonus);
  const matches = useProfileStore((s) => s.matches);

  useEffect(() => {
    void usePuzzleStore.getState().hydrate();
    void useGameStore.getState().hydrate();
  }, []);

  const lvl = selectLevel(xp);
  const rank = rankForLevel(lvl.level);
  const state = academyStateFrom(completed, bossClearedMap);
  const step = nextRecommended(state);
  const t0 = tierProgress(0, state);
  const fresh = xp === 0;

  const daily = dailyForToday(dailyRaw, todayKey());
  const claimable = dailyBonusClaimable(daily);

  const wins = matches.filter((m) => m.result === "win").length;
  const winRate = matches.length ? Math.round((wins / matches.length) * 100) : 0;

  // Journey strip: five nodes centred on current lesson order.
  const cur = Math.max(1, t0.done + 1);
  const mapBase = Math.max(1, cur - 2);
  const mapNodes = [0, 1, 2, 3, 4].map((i) => {
    const n = mapBase + i;
    const stt: "done" | "current" | "locked" = n < cur ? "done" : n === cur ? "current" : "locked";
    return { n, stt };
  });

  return (
    <div className="space-y-2">
      <PixelTopBar />

      {/* Hero + player card */}
      <PixelPanel hue="blue" rivets className="px-2.5 pb-2.5 pt-2">
        {/* title */}
        <div className="relative flex items-center justify-center gap-2 overflow-hidden rounded-[5px] border-2 border-[var(--px-edge)] py-2"
          style={{ background: "linear-gradient(180deg, var(--sky-1), var(--sky-2))" }}>
          <ChessBuddy piece="rook" size={34} className="absolute left-2 bottom-0" />
          <span className="tab-twinkle absolute right-3 top-1 text-[0.6rem] text-sun" aria-hidden>✦</span>
          <h1 className="px-title text-[1.75rem] leading-none">The Rang</h1>
        </div>

        {/* player card */}
        <div className="mt-2 flex items-stretch gap-2">
          <div className="flex w-[92px] shrink-0 flex-col items-center">
            <div className="px-inset mb-1 px-1.5 py-1 text-center text-[0.46rem] leading-tight text-cream">
              {fresh ? "Let's begin!" : "Every move makes you stronger!"}
            </div>
            <PlayerAvatar size={48} className="tab-bob" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="px-label text-[0.7rem] text-cream">Player</span>
            </div>
            <div className="mt-0.5 flex items-center gap-1">
              <span aria-hidden>⚔️</span>
              <span className="px-label text-[0.54rem] text-good">{rank.title}</span>
            </div>
            <p className="text-[0.5rem] text-muted2">Keep learning, future master!</p>
            <div className="mt-1.5 grid grid-cols-2 gap-1">
              <PixelStatPill label="XP" value={`${lvl.intoLevel}/${lvl.span}`} icon={<StarIcon size={11} />} tone="blue" />
              <PixelStatPill label="Win Rate" value={`${winRate}%`} tone="good" />
              <PixelStatPill label="Streak" value={`${streak}d`} icon={<FlameIcon size={11} />} tone="gold" />
              <PixelStatPill label="Rating" value={puzzleRating} tone="purple" />
            </div>
          </div>
        </div>
      </PixelPanel>

      <PixelButton href={step.href} tone="gold">⚔ {fresh ? "START JOURNEY" : "CONTINUE JOURNEY"} ⚔</PixelButton>

      {/* Daily Quest */}
      <PixelPanel hue="purple" label="Daily Quest" labelHue="purple" className="px-2.5 pb-2.5 pt-3">
        <div className="flex items-center gap-2.5">
          <div className="min-w-0 flex-1 space-y-1">
            <QuestRow label="Win 2 Matches" done={daily.playTaskDone} coin={150} />
            <QuestRow label="Solve 3 Puzzles" done={daily.puzzleTaskDone} coin={100} />
            <QuestRow label="Study 1 Lesson" done={daily.academyTaskDone} coin={50} />
          </div>
          <button type="button" onClick={claimable ? claimDailyBonus : undefined} disabled={!claimable} className="shrink-0" aria-label="Daily reward chest">
            <PixelRewardChest
              state={daily.bonusClaimed ? "open" : claimable ? "ready" : "locked"}
              size={46}
              caption="REWARD"
              rewards={<><span className="flex items-center gap-0.5"><CoinIcon size={10} /><span className="font-display text-[0.5rem] text-brass">{DAILY_BONUS_XP}</span></span><span className="flex items-center gap-0.5"><GemIcon size={10} /><span className="font-display text-[0.5rem] text-sky">5</span></span></>}
            />
          </button>
        </div>
      </PixelPanel>

      {/* Mode cards */}
      <div className="grid grid-cols-3 gap-2">
        <PixelCard href={step.href} hue="blue" title="Academy" desc="Learn tactics and strategies." cta="ENTER"
          art={<ChessBuddy piece="pawn" size={36} />} />
        <PixelCard href="/puzzles" hue="green" title="Puzzles" desc="Sharpen your mind with puzzles." cta="SOLVE"
          art={<ChessBuddy piece="knight" size={36} />} />
        <PixelCard href="/play" hue="red" title="Play" desc="Battle a friendly opponent." cta="BATTLE"
          art={<span className="px-title text-[1.1rem] text-bad">VS</span>} />
      </div>

      {/* Journey map */}
      <PixelPanel hue="purple" label="Journey Map" labelHue="purple" className="px-2.5 pb-2 pt-3">
        <div className="flex items-center justify-between gap-1">
          {mapNodes.map((m, i) => (
            <div key={m.n} className="flex items-center">
              <Link href={step.href}><MapDot n={m.n} state={m.stt} /></Link>
              {i < mapNodes.length - 1 ? <span className="mx-0.5 h-0.5 w-3 bg-[var(--px-edge)]" /> : null}
            </div>
          ))}
          <Link href="/academy" className="px-inset flex h-8 w-8 items-center justify-center rounded-[5px]" aria-label="View all">
            <span className="text-[1rem]" aria-hidden>🏰</span>
          </Link>
        </div>
        <div className="mt-1 text-right">
          <Link href="/academy" className="px-label text-[0.44rem] text-brass">View All ›</Link>
        </div>
      </PixelPanel>
    </div>
  );
}
