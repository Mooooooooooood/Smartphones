import type { ReactNode } from "react";

type Tone = "default" | "gold" | "good" | "blue" | "purple" | "red";

const VALUE_TONE: Record<Tone, string> = {
  default: "text-cream",
  gold: "text-brass",
  good: "text-good",
  blue: "text-sky",
  purple: "text-lavdeep",
  red: "text-bad",
};

/**
 * Inset score capsule used in the home player card, profile, and recaps.
 * An uppercase label sits above a bold pixel value with an optional icon.
 * Matches the mockup's 2×2 stat grid (XP / WIN RATE / STREAK / RATING).
 */
export default function PixelStatPill({
  label,
  value,
  icon,
  tone = "default",
  className = "",
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={`px-inset flex items-center gap-1.5 px-2 py-1.5 ${className}`}>
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <div className="min-w-0 leading-none">
        <div className="px-label text-[0.46rem] text-muted2">{label}</div>
        <div className={`mt-0.5 font-display text-[0.66rem] ${VALUE_TONE[tone]}`}>{value}</div>
      </div>
    </div>
  );
}
