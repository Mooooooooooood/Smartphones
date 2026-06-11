import type { CSSProperties, ReactNode } from "react";
import type { PixelHue } from "@/components/pixel/PixelPanel";

const HUE_BORDER: Record<Exclude<PixelHue, "none">, string> = {
  blue: "var(--color-sky)",
  orange: "var(--color-peach)",
  green: "var(--color-mint)",
  red: "var(--color-bad)",
  purple: "#8a6fe0",
  gold: "var(--color-brass)",
  gray: "var(--color-frame)",
};

/**
 * A framed portrait tile for a guide / opponent / avatar — a recessed sky-blue
 * inner field inside a coloured pixel border, as in the mockups' character
 * frames. Drop children (a PixelSprite, avatar, or glyph) inside.
 */
export default function PixelCharacterFrame({
  children,
  hue = "blue",
  size = 56,
  className = "",
  style,
}: {
  children: ReactNode;
  hue?: Exclude<PixelHue, "none">;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        background: "linear-gradient(180deg, color-mix(in oklab, var(--color-sky) 30%, var(--color-ink)), var(--color-ink))",
        border: `3px solid ${HUE_BORDER[hue]}`,
        borderRadius: 7,
        boxShadow: "0 0 0 2px var(--px-edge), inset 0 2px 0 rgba(255,255,255,0.16)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
