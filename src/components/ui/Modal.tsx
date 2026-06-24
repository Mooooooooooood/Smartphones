"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

/**
 * Centered overlay primitive: a dimmed, blurred backdrop with click-outside to
 * close. Encapsulates the `fixed inset-0 ... backdrop-blur-sm` + stop-propagation
 * pattern that screens/modals were hand-rolling. Renders nothing when closed.
 */
export default function Modal({
  open,
  onClose,
  children,
  dismissOnBackdrop = true,
  z = 90,
  className = "",
}: {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  dismissOnBackdrop?: boolean;
  z?: number;
  className?: string;
}) {
  useEffect(() => {
    if (!open || !onClose) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 grid place-items-center bg-[rgba(4,6,20,0.55)] p-4 backdrop-blur-sm"
      style={{ zIndex: z }}
      role="presentation"
      onClick={dismissOnBackdrop ? onClose : undefined}
    >
      <div className={`w-full max-w-[320px] ${className}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
