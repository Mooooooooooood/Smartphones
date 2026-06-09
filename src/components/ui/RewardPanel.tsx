import type { ReactNode } from "react";

/**
 * Celebratory completion moment for lessons and puzzles. Animates in with a
 * pop and floats a "+XP" marker when XP is awarded.
 */
export default function RewardPanel({
  title,
  xp = null,
  subtitle,
  tone = "brass",
  children,
}: {
  title: string;
  xp?: number | null;
  subtitle?: string;
  tone?: "brass" | "good";
  children?: ReactNode;
}) {
  const accent = tone === "good" ? "text-good" : "text-brass";
  const ring =
    tone === "good" ? "border-good/50 bg-good/15 text-good" : "border-brass/50 bg-brass/15 text-brass";

  return (
    <div className="tab-card-accent tab-animate-pop tab-glow overflow-hidden p-5 text-center">
      <div
        className={`relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border text-2xl ${ring}`}
      >
        <span aria-hidden>✓</span>
        {xp != null && xp > 0 ? (
          <span className={`tab-floatup absolute -top-1 text-sm font-bold ${accent}`}>+{xp}</span>
        ) : null}
      </div>
      <h3 className="mt-3 font-display text-xl text-cream">{title}</h3>
      {xp != null && xp > 0 ? (
        <p className={`mt-1 text-sm font-semibold ${accent}`}>+{xp} XP earned</p>
      ) : null}
      {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
