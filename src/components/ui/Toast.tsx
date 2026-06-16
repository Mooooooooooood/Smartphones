"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

type Tone = "default" | "good" | "bad";

const TONE_BORDER: Record<Tone, string | undefined> = {
  default: undefined,
  good: "var(--color-good)",
  bad: "var(--color-bad)",
};

/**
 * Transient toast hook — dedupes the hand-rolled `setToast(msg)` +
 * `setTimeout(() => setToast(null), n)` pattern. Returns the current message
 * and a `show()` that auto-clears, cancelling any in-flight timer.
 */
export function useToast(timeoutMs = 1800) {
  const [message, setMessage] = useState<ReactNode | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback(
    (msg: ReactNode) => {
      if (timer.current) clearTimeout(timer.current);
      setMessage(msg);
      timer.current = setTimeout(() => setMessage(null), timeoutMs);
    },
    [timeoutMs],
  );
  return { message, show };
}

/**
 * Pixel toast. `bottom` floats above the nav (fixed); `inline` sits in flow.
 * Renders nothing when `message` is null.
 */
export default function Toast({
  message,
  tone = "default",
  position = "bottom",
  className = "",
}: {
  message: ReactNode | null;
  tone?: Tone;
  position?: "bottom" | "inline";
  className?: string;
}) {
  if (message == null) return null;
  const pos =
    position === "bottom"
      ? "fixed inset-x-0 bottom-[88px] z-40 mx-auto w-fit max-w-[90%]"
      : "mx-auto w-fit max-w-full";
  const border = TONE_BORDER[tone];
  return (
    <div
      className={`px-panel tab-animate-pop px-3 py-2 text-center text-[0.6rem] text-cream ${pos} ${className}`}
      style={border ? { borderColor: border } : undefined}
      role="status"
    >
      {message}
    </div>
  );
}
