"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

export type PixelButtonTone = "gold" | "blue" | "green" | "red" | "purple";
type Variant = "solid" | "secondary" | "ghost";

const TONES: Record<PixelButtonTone, { bg: string; hi: string; deep: string; on: string }> = {
  gold: { bg: "var(--color-brass)", hi: "#ffd76b", deep: "var(--color-brassdeep)", on: "var(--color-on-accent)" },
  blue: { bg: "var(--color-sky)", hi: "#8fb6ff", deep: "#1c50b0", on: "#06122e" },
  green: { bg: "var(--color-good)", hi: "#86f0a6", deep: "var(--color-gooddeep)", on: "#06220f" },
  red: { bg: "var(--color-bad)", hi: "#ff8f9e", deep: "#b32436", on: "#2a0709" },
  purple: { bg: "var(--color-lav)", hi: "#cdb8ff", deep: "#5a3fc0", on: "#190a2e" },
};

/**
 * Retro pixel button. Renders a Link when `href` is set, else a button.
 * Min 46px tall for thumb-friendly iPhone tapping. Hard bottom shadow that
 * collapses on :active for a satisfying "press" feel.
 */
export default function PixelButton({
  children,
  onClick,
  href,
  tone = "gold",
  variant = "solid",
  disabled = false,
  type = "button",
  size = "md",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  tone?: PixelButtonTone;
  variant?: Variant;
  disabled?: boolean;
  type?: "button" | "submit";
  size?: "sm" | "md";
  className?: string;
}) {
  const t = TONES[tone];
  const sizeCls = size === "sm" ? "min-h-[40px] text-[0.62rem] px-3" : "min-h-[46px] text-[0.72rem] px-4";
  const variantCls =
    variant === "secondary" ? "px-btn-secondary" : variant === "ghost" ? "px-btn-ghost" : "";
  const toneVars: CSSProperties =
    variant === "solid"
      ? ({ "--btn-bg": t.bg, "--btn-hi": t.hi, "--btn-deep": t.deep, color: t.on } as CSSProperties)
      : {};
  const classes = `px-btn ${variantCls} ${sizeCls} w-full ${className}`;

  if (href && !disabled) {
    return (
      <Link href={href} className={classes} style={toneVars}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} style={toneVars}>
      {children}
    </button>
  );
}
