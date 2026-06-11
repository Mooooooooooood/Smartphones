"use client";

import Link from "next/link";
import { useProfileStore, selectLevel, puzzlesSolvedCount } from "@/state/profileStore";
import { CoinIcon, GemIcon, FlameIcon, GearGlyph } from "@/components/pixel/PixelIcon";

/**
 * Persistent arcade status strip used at the top of every primary screen.
 * Left: level badge + XP mini-track. Right: coin (total XP), gem (puzzles
 * solved) and a gear link to settings. Real profile values, themed as
 * currencies — no invented economy.
 */
export default function TopBar({ streak: showStreak = false }: { streak?: boolean }) {
  const xp = useProfileStore((s) => s.xp);
  const streak = useProfileStore((s) => s.streak);
  const solvedIds = useProfileStore((s) => s.solvedPuzzleIds);
  const lvl = selectLevel(xp);
  const gems = puzzlesSolvedCount(solvedIds);

  return (
    <div className="px-panel flex items-center gap-2 px-2.5 py-2">
      {/* Level badge */}
      <div className="px-inset flex shrink-0 items-center gap-1.5 px-2 py-1">
        <span className="px-label text-[0.5rem] text-brass">Lv</span>
        <span className="font-display text-[0.72rem] leading-none text-cream">{lvl.level}</span>
      </div>
      {/* XP track */}
      <div className="px-track h-3 min-w-0 flex-1">
        <div className="px-track-fill" style={{ width: `${Math.round(lvl.progress * 100)}%` }} />
      </div>
      {/* Resources */}
      <div className="flex shrink-0 items-center gap-1.5">
        <Capsule icon={<CoinIcon size={13} />} value={xp} />
        <Capsule icon={<GemIcon size={13} />} value={gems} />
        {showStreak ? <Capsule icon={<FlameIcon size={13} />} value={streak} /> : null}
        <Link
          href="/profile"
          aria-label="Settings"
          className="px-inset flex h-7 w-7 items-center justify-center text-muted2 active:translate-y-0.5"
        >
          <GearGlyph size={15} />
        </Link>
      </div>
    </div>
  );
}

function Capsule({ icon, value }: { icon: React.ReactNode; value: number }) {
  return (
    <span className="px-inset flex items-center gap-1 px-1.5 py-1">
      {icon}
      <span className="font-display text-[0.6rem] leading-none text-cream">{value > 9999 ? `${Math.floor(value / 1000)}k` : value}</span>
    </span>
  );
}
