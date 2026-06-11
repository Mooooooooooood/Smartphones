import type { ReactNode } from "react";

/**
 * The chunky blue board frame from the live-match mockup: a thick pixel border
 * with corner bolts wrapping the chessboard. `top`/`bottom` slots host the
 * player labels / captured-piece rows that sit inside the frame.
 */
export default function PixelBoardFrame({
  children,
  top,
  bottom,
  className = "",
}: {
  children: ReactNode;
  top?: ReactNode;
  bottom?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-board-frame relative ${className}`}>
      <span className="px-rivet" style={{ top: 4, left: 4 }} aria-hidden />
      <span className="px-rivet" style={{ top: 4, right: 4 }} aria-hidden />
      <span className="px-rivet" style={{ bottom: 4, left: 4 }} aria-hidden />
      <span className="px-rivet" style={{ bottom: 4, right: 4 }} aria-hidden />
      {top ? <div className="mb-1">{top}</div> : null}
      <div className="overflow-hidden rounded-[4px]">{children}</div>
      {bottom ? <div className="mt-1">{bottom}</div> : null}
    </div>
  );
}
