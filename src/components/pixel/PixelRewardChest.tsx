import type { ReactNode } from "react";
import PixelOrnateChest from "@/components/pixel/PixelOrnateChest";

/**
 * A treasure chest with an optional "REWARD" caption and reward chips beneath,
 * as shown beside the Daily Quest panel in the mockup.
 */
export default function PixelRewardChest({
  state = "ready",
  size = 56,
  caption,
  rewards,
  className = "",
}: {
  state?: "locked" | "ready" | "open";
  size?: number;
  caption?: string;
  rewards?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-0.5 ${className}`}>
      <PixelOrnateChest state={state} size={size} />
      {caption ? <span className="px-label text-[0.44rem] text-brass">{caption}</span> : null}
      {rewards ? <div className="flex items-center gap-1.5">{rewards}</div> : null}
    </div>
  );
}
