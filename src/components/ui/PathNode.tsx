import Link from "next/link";
import type { ReactNode } from "react";

export type NodeStatus =
  | "completed"
  | "active"
  | "locked"
  | "boss-locked"
  | "boss-ready";

function LockGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function nodeCircle(status: NodeStatus, order: number | string) {
  const base =
    "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold";
  switch (status) {
    case "completed":
      return <div className={`${base} border border-brass bg-brass text-ink`}>✓</div>;
    case "active":
      return (
        <div className={`${base} border-2 border-brass bg-ink2 text-brass tab-glow`}>{order}</div>
      );
    case "boss-ready":
      return (
        <div className={`${base} border border-brass bg-brass text-ink tab-glow`} aria-hidden>
          ♛
        </div>
      );
    case "boss-locked":
      return (
        <div className={`${base} border border-line bg-panel2 text-muted2`} aria-hidden>
          ♛
        </div>
      );
    default:
      return (
        <div className={`${base} border border-line bg-panel2 text-muted2`}>
          <LockGlyph />
        </div>
      );
  }
}

/** A single node on the Academy progression path. Renders an <li>. */
export default function PathNode({
  order,
  title,
  subtitle,
  xpReward,
  status,
  href,
}: {
  order: number | string;
  title: string;
  subtitle: string;
  xpReward?: number;
  status: NodeStatus;
  href?: string;
}) {
  const locked = status === "locked" || status === "boss-locked";
  const isBoss = status === "boss-locked" || status === "boss-ready";

  const cardClass =
    status === "active" || status === "boss-ready"
      ? "tab-card-accent"
      : `tab-card ${locked ? "opacity-65" : ""}`;

  const right: ReactNode =
    status === "completed" ? (
      <span className="shrink-0 text-[11px] font-semibold text-brass">Mastered</span>
    ) : status === "active" ? (
      <span className="shrink-0 text-[11px] font-semibold text-brass">Continue ›</span>
    ) : xpReward ? (
      <span className="shrink-0 text-[11px] font-semibold text-muted2">+{xpReward} XP</span>
    ) : null;

  const card = (
    <div className={`flex flex-1 items-center gap-3 rounded-2xl px-3.5 py-3 ${cardClass}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-display text-base text-cream">{title}</h3>
          {right}
        </div>
        <p className="truncate text-xs text-muted2">
          {isBoss && locked
            ? "Complete every lesson to unlock"
            : locked
              ? "Finish the previous lesson to unlock"
              : subtitle}
        </p>
      </div>
    </div>
  );

  return (
    <li className="relative flex items-center gap-3">
      {nodeCircle(status, order)}
      {href && !locked ? (
        <Link href={href} className="flex flex-1 transition-transform active:scale-[0.99]">
          {card}
        </Link>
      ) : (
        card
      )}
    </li>
  );
}
