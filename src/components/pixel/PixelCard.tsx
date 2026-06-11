import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { PixelHue } from "@/components/pixel/PixelPanel";

const HUES: Record<"blue" | "green" | "red" | "orange" | "purple" | "gold", { hue: string; deep: string; cta: string }> = {
  blue: { hue: "var(--color-sky)", deep: "#1c50b0", cta: "#2f64c4" },
  green: { hue: "var(--color-mint)", deep: "#1f8f4d", cta: "#2a9456" },
  red: { hue: "var(--color-bad)", deep: "#b32436", cta: "#c23048" },
  orange: { hue: "var(--color-peach)", deep: "#b86a1e", cta: "#c47a26" },
  purple: { hue: "#8a6fe0", deep: "#5a3fc0", cta: "#6d4fb0" },
  gold: { hue: "var(--color-brass)", deep: "var(--color-brassdeep)", cta: "#c98517" },
};

/**
 * A vertical mode card (Academy / Puzzles / Play in the home mockup): coloured
 * pixel frame, a title, an illustration well, a short description and a CTA
 * chip pinned to the bottom. Renders as a Link.
 */
export default function PixelCard({
  href,
  title,
  desc,
  cta,
  hue,
  art,
  className = "",
}: {
  href: string;
  title: string;
  desc: string;
  cta: string;
  hue: keyof typeof HUES;
  art: ReactNode;
  className?: string;
}) {
  const c = HUES[hue];
  return (
    <Link href={href} className={`block active:translate-y-0.5 ${className}`}>
      <div
        className="px-card flex h-full flex-col items-center gap-1 px-1.5 pb-1.5 pt-2 text-center"
        style={{ "--hue": c.hue, "--hue-deep": c.deep } as CSSProperties}
      >
        <span className="px-label text-[0.52rem] text-cream">{title}</span>
        <div
          className="flex h-12 w-full items-center justify-center overflow-hidden rounded-[4px] border-2 border-[var(--px-edge)]"
          style={{ background: "linear-gradient(180deg, color-mix(in oklab, var(--sky-1) 70%, #000 6%), var(--sky-2))" }}
        >
          {art}
        </div>
        <p className="px-1 text-[0.5rem] leading-tight text-cream/90">{desc}</p>
        <span
          className="px-label mt-auto w-full rounded-[4px] border-2 border-[var(--px-edge)] py-1 text-[0.5rem] text-cream"
          style={{ background: `linear-gradient(180deg, ${c.hue}, ${c.cta})` }}
        >
          {cta}
        </span>
      </div>
    </Link>
  );
}

export type { PixelHue };
