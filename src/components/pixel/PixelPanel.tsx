import type { CSSProperties, ReactNode } from "react";

export type PixelHue = "blue" | "orange" | "green" | "red" | "purple" | "gold" | "gray" | "none";

/** Maps a named hue to its border colour + hard drop-shadow colour.
 *  Exported so other pixel primitives (badges, segments) share one source. */
export const PIXEL_HUES: Record<Exclude<PixelHue, "none">, { hue: string; deep: string; tab: string }> = {
  blue: { hue: "var(--color-sky)", deep: "#1c50b0", tab: "#2f64c4" },
  orange: { hue: "var(--color-peach)", deep: "#b86a1e", tab: "#c47a26" },
  green: { hue: "var(--color-mint)", deep: "#1f8f4d", tab: "#2a9456" },
  red: { hue: "var(--color-bad)", deep: "#b32436", tab: "#c23048" },
  purple: { hue: "#8a6fe0", deep: "#5a3fc0", tab: "#6d4fb0" },
  gold: { hue: "var(--color-brass)", deep: "var(--color-brassdeep)", tab: "#c98517" },
  gray: { hue: "var(--color-frame)", deep: "var(--px-edge)", tab: "#3a4a8c" },
};

/**
 * Chunky framed pixel panel. With a `hue` it becomes a coloured arcade card;
 * without one it's the neutral navy panel. `rivets` adds four corner studs.
 * `label` renders a section tab overlapping the top-left edge (with diamonds).
 */
export default function PixelPanel({
  children,
  hue = "none",
  rivets = false,
  glow,
  label,
  labelHue,
  diamonds = true,
  className = "",
  style,
}: {
  children: ReactNode;
  hue?: PixelHue;
  rivets?: boolean;
  glow?: "accent" | "reward";
  label?: ReactNode;
  labelHue?: Exclude<PixelHue, "none">;
  diamonds?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const base = hue === "none" ? "px-panel" : "px-card";
  const glowCls = glow === "accent" ? "px-glow" : glow === "reward" ? "px-glow-reward" : "";
  const hueVars: CSSProperties =
    hue !== "none"
      ? ({ "--hue": PIXEL_HUES[hue].hue, "--hue-deep": PIXEL_HUES[hue].deep } as CSSProperties)
      : {};
  const tabBg = PIXEL_HUES[labelHue ?? (hue === "none" ? "blue" : hue)].tab;

  return (
    <div className={`${base} ${glowCls} ${label ? "mt-2" : ""} ${className}`} style={{ ...hueVars, ...style }}>
      {label ? (
        <span className="px-tab absolute -top-2.5 left-3 z-10" style={{ "--tab-bg": tabBg } as CSSProperties}>
          {diamonds ? <span className="px-tab-diamond">◆</span> : null}
          {label}
        </span>
      ) : null}
      {rivets ? (
        <>
          <span className="px-rivet" style={{ top: 4, left: 4 }} aria-hidden />
          <span className="px-rivet" style={{ top: 4, right: 4 }} aria-hidden />
          <span className="px-rivet" style={{ bottom: 4, left: 4 }} aria-hidden />
          <span className="px-rivet" style={{ bottom: 4, right: 4 }} aria-hidden />
        </>
      ) : null}
      {children}
    </div>
  );
}
