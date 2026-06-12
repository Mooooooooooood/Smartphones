"use client";

import { useState } from "react";
import { useProfileStore, selectLevel, puzzlesSolvedCount } from "@/state/profileStore";
import { CoinIcon, GemIcon, StarIcon, GearGlyph } from "@/components/pixel/PixelIcon";
import PixelSettingsModal from "@/components/pixel/PixelSettingsModal";

/**
 * The arcade status strip from the mockups. Left: a crowned level badge + green
 * XP track. Right: coin (total XP) and gem (puzzles solved) capsules each with a
 * little "+" stud, an optional star, and a gear link to settings. Real profile
 * values themed as currencies — no invented economy.
 */
export default function PixelTopBar({ star = false }: { star?: boolean }) {
  const xp = useProfileStore((s) => s.xp);
  const solvedIds = useProfileStore((s) => s.solvedPuzzleIds);
  const lvl = selectLevel(xp);
  const gems = puzzlesSolvedCount(solvedIds);
  const stars = Math.round(xp / 32);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const fmt = (n: number) => (n > 9999 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}k` : n.toLocaleString());

  return (
    <div className="px-panel flex items-center gap-1.5 px-2 py-1.5">
      {/* level badge */}
      <div className="px-inset flex shrink-0 items-center gap-1 px-1.5 py-1">
        <span className="text-[0.7rem]" aria-hidden>👑</span>
        <span className="px-label text-[0.5rem] text-brass">Lv</span>
        <span className="font-display text-[0.66rem] leading-none text-cream">{lvl.level}</span>
      </div>
      {/* xp track */}
      <div className="px-track h-3 min-w-0 flex-1">
        <div className="px-track-fill" style={{ width: `${Math.round(lvl.progress * 100)}%`, "--fill": "var(--color-good)" } as React.CSSProperties} />
      </div>
      {/* resources */}
      <Capsule icon={<CoinIcon size={13} />} value={fmt(xp)} />
      <Capsule icon={<GemIcon size={13} />} value={fmt(gems)} />
      {star ? <Capsule icon={<StarIcon size={13} />} value={fmt(stars)} /> : null}
      <button type="button" onClick={() => setSettingsOpen(true)} aria-label="Settings" className="px-inset flex h-7 w-7 shrink-0 items-center justify-center text-muted2 active:translate-y-0.5">
        <GearGlyph size={15} />
      </button>
      <PixelSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function Capsule({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="px-inset flex shrink-0 items-center gap-1 py-1 pl-1.5 pr-1">
      {icon}
      <span className="font-display text-[0.56rem] leading-none text-cream">{value}</span>
      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border border-[var(--px-edge)] bg-bad text-[0.5rem] font-bold leading-none text-[color:#2a0709]" aria-hidden>+</span>
    </span>
  );
}
