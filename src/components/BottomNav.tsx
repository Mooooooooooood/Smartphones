"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ICON = {
  width: 25,
  height: 25,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function HomeIcon() {
  return (
    <svg {...ICON}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}
function AcademyIcon() {
  return (
    <svg {...ICON}>
      <path d="M12 4 2 9l10 5 10-5z" />
      <path d="M6 11.5V16c0 1.2 2.7 2.5 6 2.5s6-1.3 6-2.5v-4.5" />
    </svg>
  );
}
function PuzzleIcon() {
  return (
    <svg {...ICON}>
      <path d="M9 4a2 2 0 1 1 4 0c0 .6.4 1 1 1h2a1 1 0 0 1 1 1v2c0 .6.4 1 1 1a2 2 0 1 1 0 4c-.6 0-1 .4-1 1v2a1 1 0 0 1-1 1h-2c-.6 0-1 .4-1 1a2 2 0 1 1-4 0c0-.6-.4-1-1-1H5a1 1 0 0 1-1-1v-2c0-.6-.4-1-1-1a2 2 0 1 1 0-4c.6 0 1-.4 1-1V6a1 1 0 0 1 1-1h2c.6 0 1-.4 1-1z" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg {...ICON}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="M3.5 9h17M3.5 14.5h17M9 3.5v17M14.5 3.5v17" />
    </svg>
  );
}
function ProfileIcon() {
  return (
    <svg {...ICON}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
    </svg>
  );
}

const TABS = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/academy", label: "Academy", Icon: AcademyIcon },
  { href: "/puzzles", label: "Puzzles", Icon: PuzzleIcon },
  { href: "/play", label: "Play", Icon: PlayIcon },
  { href: "/profile", label: "Profile", Icon: ProfileIcon },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-md border-t border-line bg-panel/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_18px_-12px_rgba(30,41,59,0.25)] backdrop-blur">
        <ul className="flex items-stretch justify-between">
          {TABS.map(({ href, label, Icon }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className={`flex flex-col items-center gap-1 py-2 text-[10px] font-semibold transition-colors ${
                    active ? "text-brass" : "text-muted2 hover:text-muted"
                  }`}
                >
                  <span
                    className={`flex h-9 w-12 items-center justify-center rounded-xl border transition-colors ${
                      active ? "border-brass/40 bg-brass/15" : "border-transparent"
                    }`}
                  >
                    <Icon />
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
