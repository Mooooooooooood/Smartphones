"use client";

import Link from "next/link";
import RewardChest from "@/components/ui/RewardChest";
import ChessBuddy, { type BuddyPiece } from "@/components/characters/ChessBuddy";

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

function Cloud({ className = "", scale = 1, far = false }: { className?: string; scale?: number; far?: boolean }) {
  return (
    <svg width={90 * scale} height={48 * scale} viewBox="0 0 90 48" className={className} aria-hidden>
      <path
        d="M22 40 C10 40 6 30 14 26 C12 16 26 12 31 20 C34 10 52 10 55 21 C66 16 78 24 72 33 C80 35 78 44 68 42 Z"
        fill="var(--cloud-fill)"
        stroke="var(--cloud-line)"
        strokeWidth={far ? 1.2 : 2}
        strokeLinejoin="round"
        opacity={far ? 0.6 : 1}
      />
    </svg>
  );
}

function Sparkle({ className = "", size = 10 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" className={className} aria-hidden>
      <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" fill="var(--sparkle)" />
    </svg>
  );
}

function MiniIslet({ className = "", w = 34 }: { className?: string; w?: number }) {
  return (
    <svg width={w} height={w * 0.6} viewBox="0 0 50 30" className={className} aria-hidden style={{ opacity: 0.55 }}>
      <ellipse cx="25" cy="11" rx="22" ry="7" fill="var(--island-grass)" />
      <path d="M4 12 C6 22 14 27 25 27 C36 27 44 22 46 12 C36 18 14 18 4 12 Z" fill="var(--island-dirt)" />
    </svg>
  );
}

/** Layered clouds, sparkles and far islets behind the whole roadmap. */
function SkyDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* horizon glow near the bottom */}
      <div className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: "linear-gradient(to top, var(--horizon), transparent)" }} />
      {/* far clouds */}
      <Cloud className="absolute left-4 top-44 tab-drift" scale={0.6} far />
      <Cloud className="absolute right-6 top-72 tab-drift" scale={0.7} far />
      <Cloud className="absolute left-10 top-[420px] tab-drift" scale={0.55} far />
      {/* medium clouds */}
      <Cloud className="absolute -left-2 top-24 tab-bob" scale={1} />
      <Cloud className="absolute -right-3 top-52 tab-bob" scale={1.2} />
      <Cloud className="absolute left-2 top-[340px] tab-bob" scale={0.9} />
      <Cloud className="absolute -right-2 top-[520px] tab-bob" scale={1.05} />
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

/** A grass-topped, dirt-bottomed floating island with a soft shadow. */
function IslandBase({ w }: { w: number }) {
  return (
    <svg
      width={w}
      height={w * 0.6}
      viewBox="0 0 100 60"
      aria-hidden
      style={{ marginTop: `-${Math.round(w * 0.28)}px`, filter: "drop-shadow(0 7px 5px var(--island-shadow))" }}
    >
      <path d="M6 20 C10 44 26 57 50 57 C74 57 90 44 94 20 C74 32 26 32 6 20 Z" fill="var(--island-dirt)" />
      <path d="M14 26 C20 46 32 53 50 53 C50 53 30 50 22 38 C18 32 15 28 14 26 Z" fill="var(--island-dirt2)" opacity="0.55" />
      {/* dangling rocks/roots */}
      <ellipse cx="34" cy="55" rx="3" ry="6" fill="var(--island-dirt2)" />
      <ellipse cx="64" cy="56" rx="2.6" ry="7" fill="var(--island-dirt2)" />
      {/* grass cap */}
      <ellipse cx="50" cy="18" rx="46" ry="13" fill="var(--island-grass)" />
      <ellipse cx="50" cy="15" rx="38" ry="8.5" fill="var(--island-grass2)" opacity="0.5" />
    </svg>
  );
}

function lessonDisc(stop: PathStop) {
  const size = discFor(stop);
  const base = "flex items-center justify-center rounded-full font-bold";
  if (stop.status === "completed") {
    return (
      <div className={`${base} border-2 border-brass bg-brass text-lg text-[color:var(--color-on-accent)]`} style={{ width: size, height: size }}>
        ✓
      </div>
    );
  }
  if (stop.status === "active") {
    return (
      <div className="relative tab-bob">
        <Sparkle className="absolute -right-1 -top-2 tab-twinkle" size={14} />
        <div className={`${base} tab-pulse border-[3px] border-brass bg-panel text-2xl text-brass shadow-[0_4px_0_0_var(--color-brassdeep)]`} style={{ width: size, height: size }}>
          {stop.order}
        </div>
      </div>
    );
  }
  return (
    <div className={`${base} border border-line bg-ink2 text-muted2`} style={{ width: size, height: size }}>
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
      <div className={`grid place-items-center rounded-2xl ${ready ? "tab-glow" : ""}`}>
        <RewardChest state={claimed ? "claimed" : stop.status === "locked" ? "locked" : "ready"} size={62} />
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
        className={`flex items-center justify-center rounded-2xl border-2 text-3xl ${
          cleared
            ? "border-brass bg-brass text-[color:var(--color-on-accent)] tab-glow"
            : ready
              ? "border-brass bg-brass/20 text-brass tab-glow tab-pulse"
              : "border-line bg-ink2 text-muted2"
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
        <span className="-mt-1 rounded-full border border-line bg-panel/85 px-2 text-[10px] font-bold uppercase tracking-wide text-muted2">
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
          <div className="relative mb-1 max-w-[150px] rounded-2xl border border-line bg-panel px-3 py-1.5 text-center text-[11px] font-semibold text-cream shadow-[0_6px_12px_-8px_var(--card-shadow)]">
            {guide.line}
            <span className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b border-r border-line bg-panel" />
          </div>
        ) : null}
        <div className="relative tab-bob">
          <Cloud className="absolute -bottom-1 left-1/2 -translate-x-1/2" scale={1.5} />
          <ChessBuddy piece={guide.piece} size={92} className="relative" />
        </div>
        <span className="mt-2 rounded-full border border-line bg-panel px-2 py-0.5 text-[9px] font-bold text-muted2">
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
            <span className="absolute -top-2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-l border-t border-brass/50 bg-[var(--color-panel2)]" />
            <Link href={active.href ?? "#"} className="block transition-transform active:scale-[0.99]">
              <div className="tab-card-accent tab-glow flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brass">▶ Current mission</p>
                  <h3 className="truncate font-display text-base text-cream">{active.title}</h3>
                </div>
                <span className="shrink-0 rounded-full border border-brassdeep bg-brass px-3 py-1.5 text-xs font-bold text-[color:var(--color-on-accent)] shadow-[0_3px_0_0_var(--color-brassdeep)]">
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
