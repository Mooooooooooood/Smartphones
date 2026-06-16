import type { MoveKind } from "@/domain/chess/replay";
import { moveKindLabel } from "@/domain/chess/replay";

/** Pixel-framed colour token for each move-quality chip. Exported so callers
 *  (e.g. the move-list quality dot) can reuse the same background. */
export const KIND_STYLE: Record<MoveKind, { bg: string; fg: string }> = {
  mate: { bg: "var(--color-brass)", fg: "var(--color-on-accent)" },
  promo: { bg: "var(--color-lav)", fg: "var(--color-on-purple)" },
  castle: { bg: "var(--color-sky)", fg: "var(--color-on-blue)" },
  capture: { bg: "var(--color-bad)", fg: "var(--color-on-bad)" },
  check: { bg: "var(--color-good)", fg: "var(--color-on-good)" },
  develop: { bg: "var(--color-frame)", fg: "var(--color-cream)" },
  quiet: { bg: "var(--color-frame)", fg: "var(--color-muted2)" },
};

/** Small labelled chip describing the quality/kind of a move. */
export default function MoveChip({ kind }: { kind: MoveKind }) {
  const s = KIND_STYLE[kind];
  return (
    <span
      className="px-label rounded-[4px] border-2 border-[var(--px-edge)] px-1.5 py-0.5 text-[0.46rem]"
      style={{ background: s.bg, color: s.fg }}
    >
      {moveKindLabel(kind)}
    </span>
  );
}
