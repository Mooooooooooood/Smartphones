import type { CSSProperties, ReactNode } from "react";

export type PixelHue = "blue" | "orange" | "green" | "red" | "purple" | "gold" | "gray" | "none";

/** Maps a named hue to its border colour + hard drop-shadow colour. */
const HUES: Record<Exclude<PixelHue, "none">, { hue: string; deep: string }> = {
  blue: { hue: "var(--color-sky)", deep: "#1c50b0" },
  orange: { hue: "var(--color-peach)", deep: "#b86a1e" },
  green: { hue: "var(--color-mint)", deep: "#1f8f4d" },
  red: { hue: "var(--color-bad)", deep: "#b32436" },
  purple: { hue: "var(--color-lav)", deep: "#5a3fc0" },
  gold: { hue: "var(--color-brass)", deep: "var(--color-brassdeep)" },
  gray: { hue: "var(--color-frame)", deep: "var(--px-edge)" },
};

/**
 * Chunky framed pixel panel. With a `hue` it becomes a coloured arcade card;
 * without one it's the neutral navy panel. `rivets` adds four corner studs.
 */
export default function PixelPanel({
  children,
  hue = "none",
  rivets = false,
  glow,
  className = "",
  style,
}: {
  children: ReactNode;
  hue?: PixelHue;
  rivets?: boolean;
  glow?: "accent" | "reward";
  className?: string;
  style?: CSSProperties;
}) {
  const base = hue === "none" ? "px-panel" : "px-card";
  const glowCls = glow === "accent" ? "px-glow" : glow === "reward" ? "px-glow-reward" : "";
  const hueVars: CSSProperties =
    hue !== "none"
      ? ({ "--hue": HUES[hue].hue, "--hue-deep": HUES[hue].deep } as CSSProperties)
      : {};

  return (
    <div className={`${base} ${glowCls} ${className}`} style={{ ...hueVars, ...style }}>
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
