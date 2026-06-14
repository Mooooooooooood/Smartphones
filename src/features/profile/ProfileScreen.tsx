"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfileStore, selectLevel, puzzlesSolvedCount, academyStateFrom } from "@/state/profileStore";
import { usePuzzleStore, overallAccuracy } from "@/state/puzzleStore";
import { rankForLevel } from "@/domain/progression/rank";
import { academyProgress } from "@/domain/academy/progression";
import PixelTopBar from "@/components/pixel/PixelTopBar";
import PixelPanel from "@/components/pixel/PixelPanel";
import PixelStatPill from "@/components/pixel/PixelStatPill";
import PixelCharacterFrame from "@/components/pixel/PixelCharacterFrame";
import PlayerAvatar from "@/components/pixel/PlayerAvatar";
import PixelSettingsModal from "@/components/pixel/PixelSettingsModal";
import NameEditModal from "@/components/pixel/NameEditModal";
import BadgeEmblem from "@/components/ui/BadgeEmblem";
import AchievementModal from "@/components/pixel/AchievementModal";
import StreakCalendar from "@/components/pixel/StreakCalendar";
import { achievementViews, type AchievementView } from "@/content/achievements";
import { pieceViews } from "@/content/pieceUnlocks";
import { fx } from "@/lib/feedback";
import ChessBuddy, { type BuddyPiece } from "@/components/characters/ChessBuddy";
import { usePlayerName, displayName, usePlayerPiece, setPlayerPiece } from "@/lib/playerIdentity";
import { CoinIcon, GearGlyph } from "@/components/pixel/PixelIcon";

type Hue = "gold" | "purple" | "blue" | "red" | "orange" | "green";
const PIECE_META: Record<BuddyPiece, { name: string; glyph: string; hue: Hue }> = {
  pawn: { name: "Pawn", glyph: "♟", hue: "blue" },
  knight: { name: "Knight", glyph: "♞", hue: "green" },
  bishop: { name: "Bishop", glyph: "♝", hue: "purple" },
  rook: { name: "Rook", glyph: "♜", hue: "orange" },
  queen: { name: "Queen", glyph: "♛", hue: "red" },
  king: { name: "King", glyph: "♚", hue: "gold" },
};

export default function ProfileScreen() {
  const xp = useProfileStore((s) => s.xp);
  const streak = useProfileStore((s) => s.streak);
  const completed = useProfileStore((s) => s.completed);
  const bossClearedMap = useProfileStore((s) => s.bossCleared);
  const puzzleRating = useProfileStore((s) => s.puzzleRating);
  const solvedIds = useProfileStore((s) => s.solvedPuzzleIds);
  const matches = useProfileStore((s) => s.matches);
  const attempts = usePuzzleStore((s) => s.attempts);
  const lastActiveDate = useProfileStore((s) => s.lastActiveDate);
  const claimedRewards = useProfileStore((s) => s.claimedRewards);
  const claimReward = useProfileStore((s) => s.claimReward);
  const addCoins = useProfileStore((s) => s.addCoins);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);
  const [openAch, setOpenAch] = useState<AchievementView | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  usePlayerName(); // re-render on name change
  const myPiece = usePlayerPiece();

  useEffect(() => {
    void usePuzzleStore.getState().hydrate();
  }, []);

  const lvl = selectLevel(xp);
  const rank = rankForLevel(lvl.level);
  const state = academyStateFrom(completed, bossClearedMap);
  const acad = academyProgress(state);
  const solved = puzzlesSolvedCount(solvedIds);
  const acc = overallAccuracy(attempts);

  const wins = matches.filter((m) => m.result === "win").length;
  const winRate = matches.length ? Math.round((wins / matches.length) * 100) : 0;
  const recent = matches.slice(0, 4);

  const achievements = achievementViews({ wins, solved, streak, accGames: acc.total, accPct: acc.pct, academy: state });
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const pieces = pieceViews({ solved, wins, academy: state });
  const pieceUnlockedCount = pieces.filter((p) => p.unlocked).length;

  return (
    <div className="space-y-2.5">
      <PixelTopBar star />

      <h1 className="px-title text-center text-[1.4rem]">Profile</h1>

      {/* Player card */}
      <PixelPanel hue="blue" label="Player Card" className="flex items-stretch gap-2.5 px-2.5 pb-2.5 pt-3">
        <div className="flex shrink-0 flex-col items-center gap-1">
          <PixelCharacterFrame hue={PIECE_META[myPiece].hue} size={66}>
            <PlayerAvatar size={52} />
          </PixelCharacterFrame>
          <span className="px-label rounded-[4px] border-2 border-[var(--px-edge)] bg-brass px-1.5 py-0.5 text-[0.54rem] text-[color:var(--color-on-accent)]">Lv. {lvl.level}</span>
        </div>
        <div className="min-w-0 flex-1">
          <button type="button" onClick={() => { fx.tap(); setNameOpen(true); }} className="flex items-center gap-1.5 active:translate-y-0.5">
            <span className="px-label text-[0.82rem] text-cream">{displayName()}</span>
            <span className="text-[0.72rem] text-brass" aria-hidden>✎</span>
          </button>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-[0.74rem]" aria-hidden>{PIECE_META[myPiece].glyph}</span>
            <span className="px-label text-[0.6rem] text-good">{rank.title}</span>
          </div>
          <p className="mt-1 text-[0.62rem] text-muted2">Keep learning, future master!</p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <div className="px-track h-3 flex-1">
              <div className="px-track-fill" style={{ width: `${Math.round(lvl.progress * 100)}%`, "--fill": "var(--color-good)" } as React.CSSProperties} />
            </div>
            <span className="px-label text-[0.52rem] text-muted2">{lvl.intoLevel}/{lvl.span}</span>
          </div>
        </div>
      </PixelPanel>

      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-2">
        <PixelStatPill label="Win Rate" value={`${winRate}%`} icon={<span aria-hidden>🏆</span>} tone="good" />
        <PixelStatPill label="Rating" value={puzzleRating} icon={<span aria-hidden>🧩</span>} tone="purple" />
        <PixelStatPill label="Academy" value={`${acad.done}/${acad.total}`} icon={<span aria-hidden>📖</span>} tone="blue" />
      </div>

      {/* Your Pieces collection */}
      <PixelPanel hue="purple" label="Your Pieces" labelHue="purple" className="px-2.5 pb-2.5 pt-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[0.56rem] text-muted2">Tap an unlocked piece to wear it.</span>
          <span className="px-label text-[0.54rem] text-brass">{pieceUnlockedCount}/{pieces.length}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {pieces.map((p) => {
            const meta = PIECE_META[p.piece];
            const isMe = myPiece === p.piece;
            return (
              <button
                key={p.piece}
                type="button"
                onClick={() => {
                  if (p.unlocked) {
                    fx.correct();
                    setPlayerPiece(p.piece);
                    setToast(`Now wearing the ${meta.name}!`);
                    setTimeout(() => setToast(null), 1800);
                  } else {
                    fx.tap();
                    setOpenAch({ id: `piece-${p.piece}`, name: meta.name, glyph: meta.glyph, description: p.hint, reward: "Avatar piece", progress: () => ({ current: p.current, target: p.target }), current: p.current, target: p.target, unlocked: false, pct: p.pct, coins: 0 });
                  }
                }}
                className="active:translate-y-0.5"
              >
                <div className={`flex flex-col items-center gap-1 rounded-[7px] border-[3px] px-1 py-2 ${isMe ? "border-brass bg-[var(--color-ink)]" : "border-[var(--px-edge)] bg-[var(--color-ink)]"}`} style={isMe ? { boxShadow: "0 0 0 2px var(--px-edge), 0 0 12px -2px var(--glow-reward)" } : { boxShadow: "0 0 0 2px var(--px-edge)" }}>
                  <div className={p.unlocked ? "" : "opacity-30 grayscale"}>
                    <ChessBuddy piece={p.piece} size={34} />
                  </div>
                  <span className={`px-label text-[0.5rem] ${p.unlocked ? "text-cream" : "text-muted2"}`}>
                    {p.unlocked ? (isMe ? "Wearing" : meta.name) : "🔒"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </PixelPanel>

      {/* Streak calendar */}
      <PixelPanel hue="orange" label="Daily Streak" labelHue="orange" className="px-2.5 pb-2.5 pt-3">
        <StreakCalendar streak={streak} lastActiveDate={lastActiveDate} />
      </PixelPanel>

      {/* Achievements */}
      <PixelPanel hue="gold" label="Achievements" labelHue="gold" diamonds className="px-2.5 pb-2.5 pt-3">
        <div className="mb-1.5 flex justify-end">
          <span className="px-label text-[0.54rem] text-brass">{unlockedCount}/{achievements.length}</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {achievements.map((a) => {
            const claimable = a.unlocked && a.coins > 0 && !claimedRewards[`ach-${a.id}`];
            return (
              <button key={a.id} type="button" onClick={() => { fx.tap(); setOpenAch(a); }} className="relative active:translate-y-0.5">
                {claimable ? <span className="tab-pulse absolute -right-0.5 -top-0.5 z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[var(--px-edge)] bg-bad text-[0.5rem] font-bold text-cream">!</span> : null}
                <BadgeEmblem glyph={a.glyph} label={a.name} unlocked={a.unlocked} />
              </button>
            );
          })}
        </div>
      </PixelPanel>

      {/* Recent activity */}
      <PixelPanel hue="green" label="Recent Activity" labelHue="green" className="px-2.5 pb-2.5 pt-3">
        {recent.length === 0 ? (
          <p className="py-2 text-center text-[0.66rem] text-muted2">Play a match to start your record.</p>
        ) : (
          <ul className="space-y-1.5">
            {recent.map((m, i) => {
              const delta = m.ratingAfter - m.ratingBefore;
              const replayable = Boolean(m.id && ((m.sans && m.sans.length) || m.pgn));
              const win = m.result === "win";
              const row = (
                <div className="px-inset flex items-center gap-2 px-2 py-1.5">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] border-2 border-[var(--px-edge)] font-display text-[0.54rem] ${win ? "bg-good text-[color:#06220f]" : m.result === "draw" ? "bg-[var(--color-ink)] text-muted" : "bg-bad text-[color:#2a0709]"}`}>
                    {win ? "W" : m.result === "draw" ? "D" : "L"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[0.64rem] text-cream">{m.opponentName}</div>
                    <div className="px-label text-[0.46rem] text-muted2">Quick Match</div>
                  </div>
                  <span className={`px-label text-[0.54rem] ${win ? "text-good" : "text-bad"}`}>{delta >= 0 ? "+" : ""}{delta}</span>
                  <span className="flex items-center gap-0.5"><CoinIcon size={11} /><span className="font-display text-[0.52rem] text-brass">{m.xpAwarded}</span></span>
                  {replayable ? <span className="text-brass">▶</span> : <span className="w-2" />}
                </div>
              );
              return <li key={m.id ?? i}>{replayable ? <Link href={`/play/review?id=${m.id}`}>{row}</Link> : row}</li>;
            })}
          </ul>
        )}
      </PixelPanel>

      {/* Settings button */}
      <button type="button" onClick={() => setSettingsOpen(true)} className="px-btn px-btn-secondary mx-auto flex w-[70%] items-center justify-center gap-2 !text-[0.66rem]">
        <GearGlyph size={14} /> SETTINGS ›
      </button>

      <Link href="/about" className="px-label mx-auto block w-fit pt-1 text-[0.5rem] text-muted2">About The Rang ›</Link>

      <PixelSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <NameEditModal open={nameOpen} onClose={() => setNameOpen(false)} />
      <AchievementModal
        achievement={openAch}
        claimed={openAch ? Boolean(claimedRewards[`ach-${openAch.id}`]) : false}
        onClaim={openAch && openAch.unlocked && openAch.coins > 0 ? () => {
          const a = openAch;
          fx.chest();
          void claimReward(`ach-${a.id}`, 0);
          void addCoins(a.coins);
          setToast(`+${a.coins} coins claimed!`);
          setTimeout(() => setToast(null), 1800);
          setOpenAch(null);
        } : undefined}
        onClose={() => setOpenAch(null)}
      />

      {/* transient toast */}
      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[130] flex justify-center px-4">
          <span className="px-panel tab-animate-pop px-3 py-2 text-[0.66rem] text-cream">{toast}</span>
        </div>
      ) : null}
    </div>
  );
}
