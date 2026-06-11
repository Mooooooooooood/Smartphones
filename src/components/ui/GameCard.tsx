import type { CSSProperties, ReactNode } from "react";

/** Chunky pixel-framed surface used across the app. `accent` = gold arcade card. */
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
  if (variant === "accent") {
    return (
      <div
        className={`px-card ${glow ? "px-glow" : ""} ${className}`}
        style={{ "--hue": "var(--color-brass)", "--hue-deep": "var(--color-brassdeep)" } as CSSProperties}
      >
        {children}
      </div>
    );
  }
  return <div className={`px-panel ${glow ? "px-glow" : ""} ${className}`}>{children}</div>;
}
