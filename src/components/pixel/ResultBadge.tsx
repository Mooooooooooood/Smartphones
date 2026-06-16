export type MatchResult = "win" | "draw" | "loss";

const STYLE: Record<MatchResult, { bg: string; fg: string; letter: string; word: string }> = {
  win: { bg: "var(--color-good)", fg: "var(--color-on-good)", letter: "W", word: "WIN" },
  draw: { bg: "var(--color-ink)", fg: "var(--color-muted)", letter: "D", word: "DRAW" },
  loss: { bg: "var(--color-bad)", fg: "var(--color-on-bad)", letter: "L", word: "LOSS" },
};

/**
 * Win / Draw / Loss badge. `square` shows a single letter (compact, e.g. an
 * activity row); `pill` shows the full word. Colours come from the shared
 * --color-on-* tokens so every result indicator stays in sync.
 */
export default function ResultBadge({
  result,
  variant = "square",
  size = "md",
  className = "",
}: {
  result: MatchResult;
  variant?: "square" | "pill";
  size?: "sm" | "md";
  className?: string;
}) {
  const s = STYLE[result];
  if (variant === "pill") {
    const pad = size === "sm" ? "px-2 py-0.5 text-[0.46rem]" : "px-2.5 py-1 text-[0.52rem]";
    return (
      <span
        className={`px-label inline-block rounded-[5px] border-2 border-[var(--px-edge)] ${pad} ${className}`}
        style={{ background: s.bg, color: s.fg }}
      >
        {s.word}
      </span>
    );
  }
  const box = size === "sm" ? "h-5 w-5 text-[0.5rem]" : "h-6 w-6 text-[0.54rem]";
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-[4px] border-2 border-[var(--px-edge)] font-display ${box} ${className}`}
      style={{ background: s.bg, color: s.fg }}
      aria-label={s.word}
    >
      {s.letter}
    </span>
  );
}
