"use client";

import { useState, useSyncExternalStore } from "react";
import PixelButton from "@/components/pixel/PixelButton";
import CapedHero from "@/components/pixel/CapedHero";
import ChessBuddy from "@/components/characters/ChessBuddy";
import PixelOrnateChest from "@/components/pixel/PixelOrnateChest";
import { fx } from "@/lib/feedback";
import { getPlayerName, setPlayerName, getPlayerSide, setPlayerSide, setPlayerPiece, type PlayerSide } from "@/lib/playerIdentity";

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

const WHITE_PAWN = { body: "#e8dcc0", hi: "#fbf4e2", line: "#9a8d6a", accent: "#fffdf2" };
const BLACK_PAWN = { body: "#2c3349", hi: "#454e6e", line: "#0a0e1c", accent: "#aab6e0" };

type Slide =
  | { kind: "info"; art: React.ReactNode; title: string; body: string }
  | { kind: "setup" };

const SLIDES: Slide[] = [
  { kind: "info", art: <CapedHero size={72} />, title: "Welcome to The Rang", body: "Learn chess as a cozy pixel adventure. First, let's set you up." },
  { kind: "setup" },
  { kind: "info", art: <ChessBuddy piece="pawn" size={64} />, title: "1 · Learn in Academy", body: "Follow the world map. Each stage teaches a move with a quick hands-on board." },
  { kind: "info", art: <ChessBuddy piece="knight" size={64} />, title: "2 · Puzzles & Battles", body: "Sharpen tactics in the Puzzle arena, then challenge the guide cast in Play." },
  { kind: "info", art: <PixelOrnateChest state="ready" size={64} />, title: "3 · Earn & Unlock", body: "Win XP, stars and chests to rank up — and unlock fancier avatar pieces. Ready?" },
];

export default function Onboarding() {
  const onboarded = useOnboarded();
  const [i, setI] = useState(0);
  const [name, setName] = useState(getPlayerName);
  const [side, setSide] = useState<PlayerSide>(getPlayerSide);

  if (onboarded) return null;
  const last = i === SLIDES.length - 1;
  const slide = SLIDES[i];

  function commitSetup() {
    setPlayerName(name.trim());
    setPlayerSide(side);
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
              <h2 className="px-title text-[1.05rem] text-cream">Create Your Hero</h2>
              <p className="mx-auto mt-2 max-w-[260px] text-[0.7rem] leading-relaxed text-muted">Pick a name and a side. You begin as a Pawn — unlock more pieces by playing.</p>
              <input
                value={name}
                maxLength={14}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="px-inset mt-3 w-full bg-transparent px-3 py-2.5 text-center text-[0.85rem] text-cream outline-none"
                style={{ fontFamily: "var(--font-body)" }}
              />
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(["white", "black"] as PlayerSide[]).map((s) => (
                  <button key={s} type="button" onClick={() => { fx.tap(); setSide(s); }}
                    className={`flex flex-col items-center gap-1 rounded-[7px] border-[3px] py-2 ${side === s ? "border-brass" : "border-[var(--px-edge)]"}`}
                    style={{ background: "var(--color-ink)", boxShadow: side === s ? "0 0 0 2px var(--px-edge), 0 0 12px -2px var(--glow-reward)" : "0 0 0 2px var(--px-edge)" }}>
                    <ChessBuddy piece="pawn" size={40} palette={s === "white" ? WHITE_PAWN : BLACK_PAWN} />
                    <span className="px-label text-[0.56rem] text-cream">{s === "white" ? "White" : "Black"}</span>
                  </button>
                ))}
              </div>
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
