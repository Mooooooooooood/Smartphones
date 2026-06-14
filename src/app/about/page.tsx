"use client";

import Link from "next/link";
import Image from "next/image";
import ChessBuddy from "@/components/characters/ChessBuddy";
import PixelPanel from "@/components/pixel/PixelPanel";
import PixelButton from "@/components/pixel/PixelButton";
import type { BuddyPiece } from "@/components/characters/ChessBuddy";

const FEATURES: { piece: BuddyPiece; title: string; desc: string }[] = [
  { piece: "rook", title: "Learn the Academy", desc: "Bite-size lessons take you from the pieces to real tactics." },
  { piece: "knight", title: "Solve Daily Puzzles", desc: "A fresh puzzle every day, plus a Smart Review that resurfaces what you missed." },
  { piece: "queen", title: "Battle the Guides", desc: "Play characterful bots, then replay the game move-by-move with a coach." },
  { piece: "pawn", title: "Evolve Your Piece", desc: "Earn coins, climb the ranks, and customise your board and avatar." },
];

const SHOTS = [
  { src: "/screenshots/home.png", alt: "The Rang home screen" },
  { src: "/screenshots/puzzles.png", alt: "Tactics puzzle screen" },
  { src: "/screenshots/play.png", alt: "Playing a match" },
];

export default function AboutPage() {
  return (
    <div className="space-y-3 pb-4">
      {/* Hero */}
      <PixelPanel hue="blue" rivets className="px-3 pb-3 pt-2.5 text-center">
        <div className="relative mx-auto flex items-center justify-center gap-2 overflow-hidden rounded-[5px] border-2 border-[var(--px-edge)] py-3"
          style={{ background: "linear-gradient(180deg, var(--sky-1), var(--sky-2))" }}>
          <ChessBuddy piece="knight" size={40} className="absolute left-3 bottom-0" />
          <span className="tab-twinkle absolute right-4 top-1.5 text-[0.7rem] text-sun" aria-hidden>✦</span>
          <h1 className="px-title flex items-baseline gap-1 leading-none">
            <span className="text-[0.95rem]">The</span>
            <span className="text-[2.1rem]">Rang</span>
          </h1>
        </div>
        <p className="mt-2 text-[0.66rem] leading-snug text-cream">Learn chess as a pixel quest.</p>
        <p className="mt-1 text-[0.54rem] text-muted2">A cozy retro chess adventure — lessons, puzzles, and battles, all offline on your phone.</p>
        <div className="mt-2.5">
          <PixelButton href="/" tone="gold">⚔ START PLAYING ⚔</PixelButton>
        </div>
      </PixelPanel>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 gap-2">
        {FEATURES.map((f) => (
          <PixelPanel key={f.title} hue="none" className="flex items-center gap-2.5 px-2.5 py-2">
            <div className="px-inset flex h-11 w-11 shrink-0 items-center justify-center">
              <ChessBuddy piece={f.piece} size={32} />
            </div>
            <div className="min-w-0">
              <p className="px-label text-[0.56rem] text-brass">{f.title}</p>
              <p className="text-[0.56rem] leading-snug text-muted2">{f.desc}</p>
            </div>
          </PixelPanel>
        ))}
      </div>

      {/* Screenshot strip */}
      <PixelPanel hue="purple" label="A Peek Inside" labelHue="purple" className="px-2.5 pb-2.5 pt-3">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {SHOTS.map((s) => (
            <div key={s.src} className="shrink-0 overflow-hidden rounded-[6px] border-2 border-[var(--px-edge)]">
              <Image src={s.src} alt={s.alt} width={120} height={260} className="px-crisp h-[200px] w-auto" unoptimized />
            </div>
          ))}
        </div>
        <p className="mt-1 text-center text-[0.46rem] text-muted2">Actual in-game screens</p>
      </PixelPanel>

      {/* Install CTA */}
      <PixelPanel hue="green" className="px-2.5 py-2.5 text-center">
        <p className="px-label text-[0.56rem] text-good">Play like an app</p>
        <p className="mt-1 text-[0.54rem] leading-snug text-muted2">
          In Safari, tap <span className="text-cream">Share</span> → <span className="text-cream">Add to Home Screen</span> to install The Rang.
          It works fully offline and your progress stays on your device.
        </p>
      </PixelPanel>

      {/* Credits */}
      <div className="pt-1 text-center">
        <p className="text-[0.5rem] text-muted2">Original puzzles, art, and code. No accounts, no ads, no tracking.</p>
        <Link href="/" className="px-label mt-1 inline-block text-[0.5rem] text-brass">‹ Back to the game</Link>
      </div>
    </div>
  );
}
