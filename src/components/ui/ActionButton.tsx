"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary: "px-btn",
  secondary: "px-btn px-btn-secondary",
  ghost: "px-btn px-btn-ghost",
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
  const classes = `${VARIANTS[variant]} min-h-[46px] w-full !text-[0.7rem] ${className}`;

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
