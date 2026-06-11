import type { ReactNode } from "react";

type Tone = "default" | "gold" | "good" | "blue" | "purple";

const VALUE_TONE: Record<Tone, string> = {
  default: "text-cream",
  gold: "text-brass",
  good: "text-good",
  blue: "text-sky",
  purple: "text-lavdeep",
};

/**
 * Inset "score box" capsule — a pixel-framed stat with an uppercase label and
 * a bold pixel value. Used for rating / win-rate / progress read-outs.
 */
export default function PixelStat({
  label,
  value,
  sub,
  icon,
  tone = "default",
  className = "",
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  icon?: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={`px-inset flex flex-col items-center gap-0.5 px-2 py-2 text-center ${className}`}>
      <span className="px-label text-[0.5rem] text-muted2">{label}</span>
      <span className={`flex items-center gap-1 font-display text-[0.8rem] leading-none ${VALUE_TONE[tone]}`}>
        {icon}
        {value}
      </span>
      {sub ? <span className="text-[0.6rem] text-muted2">{sub}</span> : null}
    </div>
  );
}
