"use client";

import Link from "next/link";
import RewardChest from "@/components/ui/RewardChest";

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
}

const TOP = 44;
const GAP = 116;
const CARD_GAP = 80; // extra room under the active node for its Start card

/** Gentle left↔right weave so the path reads as a winding map. */
function xPercent(i: number): number {
  return 50 + 20 * Math.sin((i * Math.PI) / 2);
}

function sizeFor(stop: PathStop): number {
  if (stop.kind === "boss") return 76;
  if (stop.kind === "chest") return 54;
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

function NodeInner({ stop }: { stop: PathStop }) {
  const size = sizeFor(stop);

  if (stop.kind === "chest") {
    return <RewardChest state={stop.status === "completed" ? "claimed" : stop.status === "locked" ? "locked" : "ready"} size={size} />;
  }

  if (stop.kind === "boss") {
    const ready = stop.status === "ready" || stop.status === "completed";
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border text-3xl ${
          ready ? "border-brass bg-brass/20 text-brass tab-glow" : "border-line bg-ink2 text-muted2"
        }`}
        style={{ width: size, height: size }}
        aria-hidden
      >
        {ready ? "♛" : <LockGlyph size={22} />}
      </div>
    );
  }

  // lesson
  const base = "flex items-center justify-center rounded-full text-lg font-bold";
  if (stop.status === "completed") {
    return (
      <div className={`${base} border-2 border-brass bg-brass text-ink`} style={{ width: size, height: size }}>
        ✓
      </div>
    );
  }
  if (stop.status === "active") {
    return (
      <div
        className={`${base} tab-pulse border-[3px] border-brass bg-ink2 text-2xl text-brass`}
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

export default function AcademyPath({ stops }: { stops: PathStop[] }) {
  const activeIndex = stops.findIndex((s) => s.status === "active");

  // Vertical position of each node centre, adding room under the active node.
  const y = (i: number) => TOP + i * GAP + (activeIndex >= 0 && i > activeIndex ? CARD_GAP : 0);
  const lastY = y(stops.length - 1);
  const height = lastY + 70;

  // Build the rail polyline through node centres (x in 0..100, y in px).
  const points = stops.map((s, i) => `${xPercent(i).toFixed(2)} ${y(i)}`);
  const base = `M ${points.join(" L ")}`;
  const reached = Math.max(activeIndex >= 0 ? activeIndex : 0, stops.filter((s) => s.status === "completed").length - 1);
  const progress = `M ${points.slice(0, Math.max(1, reached + 1)).join(" L ")}`;

  const active = activeIndex >= 0 ? stops[activeIndex] : null;

  return (
    <div className="relative" style={{ height }}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d={base} fill="none" stroke="#dbe3ee" strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path d={progress} fill="none" stroke="#60a5fa" strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" strokeOpacity={0.85} vectorEffect="non-scaling-stroke" />
      </svg>

      {stops.map((stop, i) => {
        const tappable = Boolean(stop.href) && stop.status !== "locked";
        const node = (
          <div className="flex flex-col items-center" style={{ width: stop.kind === "boss" ? 96 : 84 }}>
            <NodeInner stop={stop} />
            {stop.caption ? (
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted2">
                {stop.caption}
              </span>
            ) : null}
          </div>
        );
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
            ) : (
              node
            )}
          </div>
        );
      })}

      {/* Start / Continue card attached beneath the active node */}
      {active ? (
        <div
          className="absolute left-1/2 w-[88%] -translate-x-1/2"
          style={{ top: y(activeIndex) + sizeFor(active) / 2 + 12 }}
        >
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
  );
}
