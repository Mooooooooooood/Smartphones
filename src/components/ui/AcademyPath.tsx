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
  /** For interactive chest nodes. */
  onClick?: () => void;
}

export interface PathGuide {
  piece: BuddyPiece;
  name: string;
  side: "left" | "right";
  line?: string;
  faded?: boolean;
}

const TOP = 56;
const GAP = 116;
const CARD_GAP = 80;

function xPercent(i: number): number {
  return 50 + 20 * Math.sin((i * Math.PI) / 2);
}

function sizeFor(stop: PathStop): number {
  if (stop.kind === "boss") return 80;
  if (stop.kind === "chest") return 66;
  return stop.status === "active" ? 80 : 64;
}

function LockGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/** Soft floating-island platform that nodes perch on. */
function Island({ width = 84 }: { width?: number }) {
  return (
    <svg width={width} height={width * 0.42} viewBox="0 0 84 36" aria-hidden className="-mt-2">
      <ellipse cx="42" cy="10" rx="34" ry="9" fill="var(--color-mint)" opacity="0.9" />
      <path d="M9 11 C12 26 22 33 42 33 C62 33 72 26 75 11 C66 17 52 19 42 19 C32 19 18 17 9 11 Z" fill="#a9744f" />
      <path d="M9 11 C18 17 32 19 42 19 C52 19 66 17 75 11 C72 16 64 18 42 18 C20 18 12 16 9 11 Z" fill="var(--color-mint)" opacity="0.55" />
    </svg>
  );
}

function Cloud({ className = "", scale = 1 }: { className?: string; scale?: number }) {
  return (
    <svg
      width={90 * scale}
      height={48 * scale}
      viewBox="0 0 90 48"
      className={className}
      aria-hidden
    >
      <path
        d="M22 40 C10 40 6 30 14 26 C12 16 26 12 31 20 C34 10 52 10 55 21 C66 16 78 24 72 33 C80 35 78 44 68 42 Z"
        fill="var(--cloud-fill)"
        stroke="var(--cloud-line)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NodeInner({ stop }: { stop: PathStop }) {
  const size = sizeFor(stop);

  if (stop.kind === "chest") {
    return (
      <div className={stop.status === "ready" ? "tab-bob" : ""}>
        <RewardChest
          state={stop.status === "completed" ? "claimed" : stop.status === "locked" ? "locked" : "ready"}
          size={size}
        />
      </div>
    );
  }

  if (stop.kind === "boss") {
    const cleared = stop.status === "completed";
    const ready = stop.status === "ready";
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border text-3xl ${
          cleared
            ? "border-brass bg-brass text-[color:var(--color-on-accent)] tab-glow"
            : ready
              ? "border-brass bg-brass/20 text-brass tab-glow tab-pulse"
              : "border-line bg-ink2 text-muted2"
        }`}
        style={{ width: size, height: size }}
        aria-hidden
      >
        {cleared ? "✓" : ready ? "♛" : <LockGlyph size={22} />}
      </div>
    );
  }

  const base = "flex items-center justify-center rounded-full text-lg font-bold";
  if (stop.status === "completed") {
    return (
      <div className={`${base} border-2 border-brass bg-brass text-[color:var(--color-on-accent)]`} style={{ width: size, height: size }}>
        ✓
      </div>
    );
  }
  if (stop.status === "active") {
    return (
      <div
        className={`${base} tab-pulse border-[3px] border-brass bg-panel text-2xl text-brass`}
        style={{ width: size, height: size }}
      >
        {stop.order}
      </div>
    );
  }
  return (
    <div className={`${base} border border-line bg-ink2 text-muted2`} style={{ width: size, height: size }}>
      <LockGlyph />
    </div>
  );
}

export default function AcademyPath({ stops, guide }: { stops: PathStop[]; guide?: PathGuide }) {
  const activeIndex = stops.findIndex((s) => s.status === "active");

  const y = (i: number) => TOP + i * GAP + (activeIndex >= 0 && i > activeIndex ? CARD_GAP : 0);
  const lastY = y(stops.length - 1);
  const height = lastY + 76;

  const points = stops.map((s, i) => `${xPercent(i).toFixed(2)} ${y(i)}`);
  const base = `M ${points.join(" L ")}`;
  const reached = Math.max(activeIndex >= 0 ? activeIndex : 0, stops.filter((s) => s.status === "completed").length - 1);
  const progress = `M ${points.slice(0, Math.max(1, reached + 1)).join(" L ")}`;

  const active = activeIndex >= 0 ? stops[activeIndex] : null;

  return (
    <div className="tab-sky relative px-1 py-2" style={{ height: height + 16 }}>
      {/* decorative clouds + stars */}
      <Cloud className="absolute left-3 top-6 opacity-80 tab-bob" scale={0.9} />
      <Cloud className="absolute right-2 top-24 opacity-70" scale={1.1} />
      <Cloud className="absolute left-6 bottom-10 opacity-70 tab-bob" scale={0.8} />
      <span className="absolute right-10 top-12 h-1.5 w-1.5 rounded-full" style={{ background: "var(--star)" }} />
      <span className="absolute left-1/3 top-40 h-1 w-1 rounded-full" style={{ background: "var(--star)" }} />
      <span className="absolute right-1/4 bottom-24 h-1.5 w-1.5 rounded-full" style={{ background: "var(--star)" }} />

      {/* tier guide character */}
      {guide ? (
        <div
          className={`absolute top-1 ${guide.side === "left" ? "left-1" : "right-1"} z-10 flex flex-col items-center ${
            guide.faded ? "opacity-60" : ""
          }`}
        >
          <div className="tab-bob">
            <ChessBuddy piece={guide.piece} size={66} />
          </div>
          {guide.line ? (
            <span className="mt-0.5 max-w-[92px] rounded-full border border-line bg-panel px-2 py-0.5 text-center text-[9px] font-semibold text-muted">
              {guide.line}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="relative" style={{ height }}>
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden>
          <path d={base} fill="none" stroke="var(--cloud-line)" strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="1 11" vectorEffect="non-scaling-stroke" />
          <path d={progress} fill="none" stroke="var(--color-brass)" strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="1 11" vectorEffect="non-scaling-stroke" />
        </svg>

        {stops.map((stop, i) => {
          const island = stop.kind !== "lesson" || stop.status === "active";
          const node = (
            <div className="flex flex-col items-center" style={{ width: stop.kind === "boss" ? 96 : 84 }}>
              <NodeInner stop={stop} />
              {island ? <Island width={stop.kind === "boss" ? 92 : 78} /> : <div className="mt-1.5 h-2 w-12 rounded-full bg-[var(--card-shadow)] opacity-40 blur-[1px]" />}
              {stop.caption ? (
                <span className="-mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted2">{stop.caption}</span>
              ) : null}
            </div>
          );
          const tappable = Boolean(stop.href) && stop.status !== "locked";
          return (
            <div
              key={stop.key}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${xPercent(i)}%`, top: y(i) }}
            >
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

        {active ? (
          <div className="absolute left-1/2 w-[88%] -translate-x-1/2" style={{ top: y(activeIndex) + sizeFor(active) / 2 + 18 }}>
            <Link href={active.href ?? "#"} className="block transition-transform active:scale-[0.99]">
              <div className="tab-card-accent tab-glow flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-brass">Continue</p>
                  <h3 className="truncate font-display text-base text-cream">{active.title}</h3>
                </div>
                <span className="shrink-0 rounded-full border border-brass/50 bg-brass/15 px-3 py-1.5 text-xs font-bold text-brass">
                  Start +{active.xpReward} XP
                </span>
              </div>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
