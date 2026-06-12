import { PixelArt } from "@/components/pixel/pixelArt";

/**
 * An ornate treasure chest — teal coffer with gold banding, corner jewels and a
 * keyhole lock. Used for the home Daily Quest reward and the Academy treasure.
 * `locked` desaturates to silver/slate; `ready` glints gold; `open` glows.
 */
const GRID = [
  "    OGGGGGGGGGGGGO    ",
  "   OGggggggggggggGO   ",
  "  OGgWWWWWWWWWWWWggGO  ",
  "  OGWwwwwwwwwwwwwWGO   ",
  "  OGWwJJwwwwwwJJwWGO   ",
  "  OGGGGGGGGGGGGGGGGO   ",
  "  OWWWWWWWWWWWWWWWWO   ",
  "  OWwwwwwwLLwwwwwwWO   ",
  "  OGGGGGGGLLGGGGGGGO   ",
  "  OWwwwwwwllwwwwwwWO   ",
  "  OWWWWWWWWWWWWWWWWO   ",
  "  OWwwwwwwwwwwwwwwWO   ",
  "  OGGGGGGGGGGGGGGGGO   ",
  "   OOOOOOOOOOOOOOOO    ",
];

const READY = { O: "#241806", G: "#f7bd3f", g: "#ffe08a", W: "#2f8f8a", w: "#1f6f6a", J: "#5fe0ff", L: "#5a3a18", l: "#ffe08a" };
const LOCKED = { O: "#1a2140", G: "#9aa6cc", g: "#c2cbe6", W: "#566091", w: "#3c456f", J: "#7683b3", L: "#2a3358", l: "#9aa6cc" };

export default function PixelOrnateChest({
  state = "ready",
  size = 64,
  className = "",
}: {
  state?: "locked" | "ready" | "open";
  size?: number;
  className?: string;
}) {
  const colors = state === "locked" ? LOCKED : READY;
  return (
    <span className={`relative inline-block ${state === "ready" ? "tab-bob" : ""} ${className}`}>
      {state === "open" ? (
        <span className="absolute inset-0 -z-0 rounded-full" style={{ boxShadow: "0 0 18px 4px var(--glow-reward)" }} aria-hidden />
      ) : null}
      <PixelArt grid={GRID} colors={colors} w={21} size={size} />
      {state === "ready" || state === "open" ? (
        <span className="tab-twinkle absolute -right-0.5 top-0 text-[0.5rem] text-[#fff3c4]" aria-hidden>✦</span>
      ) : null}
    </span>
  );
}
