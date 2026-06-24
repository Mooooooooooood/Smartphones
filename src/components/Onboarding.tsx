"use client";

import { useState, useSyncExternalStore } from "react";
import PixelButton from "@/components/pixel/PixelButton";
import CapedHero from "@/components/pixel/CapedHero";
import ChessBuddy from "@/components/characters/ChessBuddy";
import PixelOrnateChest from "@/components/pixel/PixelOrnateChest";
import { fx } from "@/lib/feedback";
import { getPlayerName, setPlayerName, setPlayerPiece } from "@/lib/playerIdentity";

const KEY = "rang-onboarded";
const listeners = new Set<() => void>();

export function isOnboarded(): boolean {
  if (typeof localStorage === "undefined") return true;
  return localStorage.getItem(KEY) === "1";
}
export function setOnboarded(): void {
  try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}
function useOnboarded(): boolean {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    isOnboarded,
    () => true,
  );
}

type Slide =
  | { kind: "info"; art: React.ReactNode; title: string; body: string }
  | { kind: "setup" };

const SLIDES: Slide[] = [
  { kind: "info", art: <CapedHero size={72} />, title: "Welcome to Pawnquest", body: "Learn chess as a cozy pixel adventure. First, let's set you up." },
  { kind: "setup" },
  { kind: "info", art: <ChessBuddy piece="pawn" size={64} />, title: "1 · Learn in Academy", body: "Follow the world map. Each stage teaches a move with a quick hands-on board." },
  { kind: "info", art: <ChessBuddy piece="knight" size={64} />, title: "2 · Puzzles & Battles", body: "Sharpen tactics in the Puzzle arena, then challenge the guide cast in Play." },
  { kind: "info", art: <PixelOrnateChest state="ready" size={64} />, title: "3 · Earn & Unlock", body: "Win XP, coins and chests to rank up — and unlock fancier avatar pieces. Ready?" },
];

export default function Onboarding() {
  const onboarded = useOnboarded();
  const [i, setI] = useState(0);
  const [name, setName] = useState(getPlayerName);

  if (onboarded) return null;
  const last = i === SLIDES.length - 1;
  const slide = SLIDES[i];

  function commitSetup() {
    setPlayerName(name.trim());
    setPlayerPiece("pawn");
  }
  function finish() {
    commitSetup();
    fx.chest();
    setOnboarded();
  }
  function next() {
    if (slide.kind === "setup") commitSetup();
    setI((n) => n + 1);
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(4,6,20,0.82)] p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Welcome">
      <div className="w-full max-w-[330px]">
        <div className="mb-2 flex justify-end">
          <button type="button" onClick={finish} className="px-label text-[0.56rem] text-muted2 active:translate-y-0.5">Skip ✕</button>
        </div>
        <div className="px-card tab-glow-reward px-4 py-5 text-center" style={{ "--hue": "var(--color-brass)", "--hue-deep": "var(--color-brassdeep)" } as React.CSSProperties}>
          {slide.kind === "setup" ? (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center">
                <ChessBuddy piece="pawn" size={56} className="tab-bob" />
              </div>
              <h2 className="px-title mt-1 text-[1.05rem] text-cream">Create Your Hero</h2>
              <p className="mx-auto mt-2 max-w-[260px] text-[0.7rem] leading-relaxed text-muted">Name your hero. You begin as a Pawn — unlock mightier pieces as you play.</p>
              <input
                value={name}
                maxLength={14}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="px-inset mt-3 w-full bg-transparent px-3 py-2.5 text-center text-[0.85rem] text-cream outline-none"
                style={{ fontFamily: "var(--font-body)" }}
              />
            </>
          ) : (
            <>
              <div className="mx-auto flex h-24 w-24 items-center justify-center">{slide.art}</div>
              <h2 className="px-title mt-2 text-[1.05rem] text-cream">{slide.title}</h2>
              <p className="mx-auto mt-2 max-w-[260px] text-[0.7rem] leading-relaxed text-muted">{slide.body}</p>
            </>
          )}

          {/* progress dots */}
          <div className="mt-3 flex justify-center gap-1.5">
            {SLIDES.map((_, n) => (
              <span key={n} className={`h-2 w-2 rounded-full border-2 border-[var(--px-edge)] ${n === i ? "bg-brass" : "bg-[var(--color-ink)]"}`} />
            ))}
          </div>

          <div className="mt-4">
            {last ? (
              <PixelButton onClick={finish} tone="gold">★ START ADVENTURE ★</PixelButton>
            ) : (
              <PixelButton onClick={next} tone="blue">NEXT ›</PixelButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
