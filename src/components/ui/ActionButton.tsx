"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary:
    "border-brassdeep bg-brass text-[color:var(--color-on-accent)] shadow-[0_4px_0_0_var(--color-brassdeep)] active:translate-y-0.5 active:shadow-[0_2px_0_0_var(--color-brassdeep)] hover:bg-brassdeep",
  secondary: "border-line bg-panel text-cream shadow-[0_3px_0_0_var(--color-line)] hover:border-muted2",
  ghost: "border-transparent bg-transparent text-muted hover:text-cream",
};

/**
 * Thumb-friendly action. Renders a Link when `href` is set, otherwise a button.
 * Minimum 48px tall for comfortable iPhone tapping.
 */
export default function ActionButton({
  children,
  onClick,
  href,
  variant = "primary",
  disabled = false,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: Variant;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const classes = `flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition-transform active:scale-[0.98] disabled:opacity-40 ${VARIANTS[variant]} ${className}`;

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
