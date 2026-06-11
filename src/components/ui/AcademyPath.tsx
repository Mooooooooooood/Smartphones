"use client";

import Link from "next/link";
import PixelChest from "@/components/pixel/PixelChest";
import ChessBuddy, { type BuddyPiece } from "@/components/characters/ChessBuddy";
import { Cloud, Sparkle, FloatingIsland, MiniIslet, Moon } from "@/components/world/Scenery";

export type StopStatus = "completed" | "active" | "locked" | "ready";

export interface PathStop {
  kind: "lesson" | "chest" | "boss";
  key: string;
  order?: number;
  title: string;
  caption?: string;
  xpReward?: number;
  status: StopStatus;
  href?: string;
  onClick?: () => void;
}

export interface PathGuide {
  piece: BuddyPiece;
  name: string;
  side: "left" | "right";
  line?: string;
  faded?: boolean;
}

const HOST_H = 150; // host strip with the big tier guide
const TOP = 40;
const GAP = 120;
const CARD_GAP = 92; // room under the active island for its mission banner

function xPercent(i: number): number {
  return 50 + 20 * Math.sin((i * Math.PI) / 2);
}

function discFor(stop: PathStop): number {
  if (stop.kind === "boss") return 66;
  if (stop.kind === "chest") return 60;
  return stop.status === "active" ? 74 : 58;
}
function baseWidthFor(stop: PathStop): number {
  if (stop.kind === "boss") return 126;
  if (stop.kind === "chest") return 132;
  return Math.round(discFor(stop) * 1.85);
}

function LockGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/* ---------- scenery ---------- */

/** Layered clouds, sparkles, moon and far islets behind the whole roadmap. */
function SkyDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* horizon glow near the bottom */}
      <div className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: "linear-gradient(to top, var(--horizon), transparent)" }} />
      {/* crescent moon — only visible at night (hidden in light via opacity token) */}
      <Moon className="absolute right-5 top-6 hidden dark:block" size={46} />
      {/* far clouds */}
      <Cloud className="absolute left-4 top-44 tab-drift" scale={0.6} far />
      <Cloud className="absolute right-6 top-72 tab-drift" scale={0.7} far />
      <Cloud className="absolute left-10 top-[420px] tab-drift" scale={0.55} far />
      {/* medium clouds */}
      <Cloud className="absolute -left-3 top-24 tab-bob" scale={1} />
      <Cloud className="absolute -right-4 top-52 tab-bob" scale={1.2} />
      <Cloud className="absolute left-2 top-[340px] tab-bob" scale={0.9} />
      <Cloud className="absolute -right-3 top-[520px] tab-bob" scale={1.05} />
      {/* sparkles + stars */}
      <Sparkle className="absolute right-10 top-32 tab-twinkle" size={12} />
      <Sparkle className="absolute left-1/4 top-60 tab-twinkle" size={9} />
      <Sparkle className="absolute right-1/4 top-[300px] tab-twinkle" size={11} />
      <Sparkle className="absolute left-12 top-[470px] tab-twinkle" size={9} />
      <span className="absolute left-1/2 top-40 h-1 w-1 rounded-full" style={{ background: "var(--star)" }} />
      <span className="absolute right-1/3 top-[260px] h-1.5 w-1.5 rounded-full" style={{ background: "var(--star)" }} />
      <span className="absolute left-1/3 top-[560px] h-1 w-1 rounded-full" style={{ background: "var(--star)" }} />
      {/* tiny floating islets for depth */}
      <MiniIslet className="absolute right-3 top-[200px] tab-bob" w={30} />
      <MiniIslet className="absolute left-3 top-[600px] tab-bob" w={36} />
    </div>
  );
}

/** A grass-topped floating island that tucks under its node disc. */
function IslandBase({ w }: { w: number }) {
  return (
    <FloatingIsland w={w} style={{ marginTop: `-${Math.round(w * 0.3)}px` }} />
  );
}

function lessonDisc(stop: PathStop) {
  const size = discFor(stop);
  const base = "flex items-center justify-center rounded-[7px] font-display border-[3px]";
  if (stop.status === "completed") {
    return (
      <div className={`${base} border-[var(--px-edge)] bg-brass text-base text-[color:var(--color-on-accent)] shadow-[0_3px_0_0_var(--color-brassdeep)]`} style={{ width: size, height: size }}>
        ✓
      </div>
    );
  }
  if (stop.status === "active") {
    return (
      <div className="relative tab-bob">
        <Sparkle className="absolute -right-1 -top-2 tab-twinkle" size={14} />
        <div className={`${base} tab-pulse border-brass bg-[var(--color-ink)] text-lg text-brass shadow-[0_4px_0_0_var(--color-brassdeep)]`} style={{ width: size, height: size }}>
          {stop.order}
        </div>
      </div>
    );
  }
  return (
    <div className={`${base} border-[var(--px-edge)] bg-ink2 text-muted2`} style={{ width: size, height: size }}>
      <LockGlyph />
    </div>
  );
}

function chestTop(stop: PathStop) {
  const ready = stop.status === "ready";
  const claimed = stop.status === "completed";
  return (
    <div className={`relative ${ready ? "tab-bob" : ""}`}>
      {ready ? (
        <>
          <Sparkle className="absolute -left-2 -top-1 tab-twinkle" size={12} />
          <Sparkle className="absolute -right-2 top-1 tab-twinkle" size={14} />
        </>
      ) : null}
      <div className={`grid place-items-center rounded-[7px] ${ready ? "tab-glow-reward" : ""}`}>
        <PixelChest state={claimed ? "open" : stop.status === "locked" ? "locked" : "ready"} size={58} />
      </div>
    </div>
  );
}

function bossTop(stop: PathStop) {
  const cleared = stop.status === "completed";
  const ready = stop.status === "ready";
  return (
    <div className="relative">
      {/* gate flags */}
      <span className="absolute -left-1 -top-2 text-sm" aria-hidden>{ready || cleared ? "🚩" : ""}</span>
      <div
        className={`flex items-center justify-center rounded-[7px] border-[3px] font-display text-2xl ${
          cleared
            ? "border-[var(--px-edge)] bg-brass text-[color:var(--color-on-accent)] tab-glow-reward"
            : ready
              ? "border-brass bg-[var(--color-ink)] text-brass tab-glow tab-pulse"
              : "border-[var(--px-edge)] bg-ink2 text-muted2"
        }`}
        style={{ width: 66, height: 66 }}
        aria-hidden
      >
        {cleared ? "✓" : ready ? "♛" : <LockGlyph size={22} />}
      </div>
    </div>
  );
}

function NodeIsland({ stop }: { stop: PathStop }) {
  const top =
    stop.kind === "chest" ? chestTop(stop) : stop.kind === "boss" ? bossTop(stop) : lessonDisc(stop);
  return (
    <div className="flex flex-col items-center" style={{ width: baseWidthFor(stop) }}>
      {top}
      <IslandBase w={baseWidthFor(stop)} />
      {stop.caption ? (
        <span className="px-label -mt-1 rounded-[4px] border-2 border-[var(--px-edge)] bg-[var(--color-panel)] px-1.5 py-0.5 text-[0.46rem] text-muted2">
          {stop.caption}
        </span>
      ) : null}
    </div>
  );
}

function GuideHost({ guide }: { guide: PathGuide }) {
  return (
    <div className={`relative flex px-2 pt-3 ${guide.side === "right" ? "justify-end" : "justify-start"}`} style={{ height: HOST_H }}>
      <div className={`relative flex flex-col items-center ${guide.faded ? "opacity-60" : ""}`}>
        {guide.line ? (
          <div className="px-inset relative mb-1 max-w-[150px] px-2.5 py-1.5 text-center text-[0.58rem] font-semibold text-cream">
            {guide.line}
          </div>
        ) : null}
        <div className="relative tab-bob">
          <Cloud className="absolute -bottom-1 left-1/2 -translate-x-1/2" scale={1.5} />
          <ChessBuddy piece={guide.piece} size={84} className="relative" />
        </div>
        <span className="px-label mt-2 rounded-[4px] border-2 border-[var(--px-edge)] bg-[var(--color-panel)] px-1.5 py-0.5 text-[0.46rem] text-brass">
          {guide.name}
        </span>
      </div>
    </div>
  );
}

export default function AcademyPath({ stops, guide }: { stops: PathStop[]; guide?: PathGuide }) {
  const activeIndex = stops.findIndex((s) => s.status === "active");

  const y = (i: number) => TOP + i * GAP + (activeIndex >= 0 && i > activeIndex ? CARD_GAP : 0);
  const lastY = y(stops.length - 1);
  const pathHeight = lastY + 84;

  const points = stops.map((s, i) => `${xPercent(i).toFixed(2)} ${y(i)}`);
  const baseLine = `M ${points.join(" L ")}`;
  const reached = Math.max(activeIndex >= 0 ? activeIndex : 0, stops.filter((s) => s.status === "completed").length - 1);
  const progress = `M ${points.slice(0, Math.max(1, reached + 1)).join(" L ")}`;

  const active = activeIndex >= 0 ? stops[activeIndex] : null;

  return (
    <div className="tab-sky relative overflow-hidden">
      <SkyDecor />

      {guide ? <GuideHost guide={guide} /> : <div style={{ height: 12 }} />}

      <div className="relative" style={{ height: pathHeight }}>
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 100 ${pathHeight}`} preserveAspectRatio="none" aria-hidden>
          <path d={baseLine} fill="none" stroke="var(--cloud-line)" strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="0.5 12" vectorEffect="non-scaling-stroke" />
          <path d={progress} fill="none" stroke="var(--color-brass)" strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="0.5 12" vectorEffect="non-scaling-stroke" />
        </svg>

        {stops.map((stop, i) => {
          const tappable = Boolean(stop.href) && stop.status !== "locked";
          const node = <NodeIsland stop={stop} />;
          return (
            <div key={stop.key} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${xPercent(i)}%`, top: y(i) }}>
              {tappable ? (
                <Link href={stop.href!} className="block transition-transform active:scale-95" aria-label={stop.title}>
                  {node}
                </Link>
              ) : stop.onClick ? (
                <button type="button" onClick={stop.onClick} className="block transition-transform active:scale-95" aria-label={stop.title}>
                  {node}
                </button>
              ) : (
                node
              )}
            </div>
          );
        })}

        {/* Mission banner anchored under the current island */}
        {active ? (
          <div className="absolute left-1/2 w-[86%] -translate-x-1/2" style={{ top: y(activeIndex) + discFor(active) / 2 + 30 }}>
            <Link href={active.href ?? "#"} className="block transition-transform active:translate-y-0.5">
              <div className="px-card tab-glow flex items-center justify-between gap-3 px-3.5 py-2.5" style={{ "--hue": "var(--color-brass)", "--hue-deep": "var(--color-brassdeep)" } as React.CSSProperties}>
                <div className="min-w-0">
                  <p className="px-label text-[0.5rem] text-brass">▶ Current Mission</p>
                  <h3 className="truncate px-label mt-0.5 text-[0.68rem] text-cream">{active.title}</h3>
                </div>
                <span className="px-label shrink-0 rounded-[4px] border-2 border-[var(--px-edge)] bg-brass px-2 py-1 text-[0.5rem] text-[color:var(--color-on-accent)]">
                  +{active.xpReward} XP
                </span>
              </div>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
