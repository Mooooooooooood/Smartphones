import type { ReactNode } from "react";

/**
 * Little arcade section tab — an uppercase pixel label on a gold underline,
 * with an optional right-aligned action. Used to head panels/sections.
 */
export default function SectionLabel({
  children,
  icon,
  action,
  className = "",
}: {
  children: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-1.5 flex items-center justify-between gap-2 ${className}`}>
      <span className="flex items-center gap-1.5">
        {icon}
        <span className="px-label text-[0.6rem] text-brass">{children}</span>
      </span>
      {action}
    </div>
  );
}
