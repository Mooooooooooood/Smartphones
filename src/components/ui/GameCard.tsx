import type { ReactNode } from "react";

/** Layered premium surface used across the app. */
export default function GameCard({
  children,
  variant = "default",
  glow = false,
  className = "",
}: {
  children: ReactNode;
  variant?: "default" | "accent";
  glow?: boolean;
  className?: string;
}) {
  const base = variant === "accent" ? "tab-card-accent" : "tab-card";
  return <div className={`${base} ${glow ? "tab-glow" : ""} ${className}`}>{children}</div>;
}
