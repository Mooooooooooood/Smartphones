"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeGlyph,
  AcademyGlyph,
  PuzzleGlyph,
  PlayGlyph,
  ProfileGlyph,
} from "@/components/pixel/PixelIcon";

const TABS = [
  { href: "/", label: "Home", Icon: HomeGlyph },
  { href: "/academy", label: "Academy", Icon: AcademyGlyph },
  { href: "/puzzles", label: "Puzzles", Icon: PuzzleGlyph },
  { href: "/play", label: "Play", Icon: PlayGlyph },
  { href: "/profile", label: "Profile", Icon: ProfileGlyph },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-md px-2 pb-[env(safe-area-inset-bottom)]">
        <div
          className="px-panel flex items-stretch justify-between gap-1 px-1.5 py-1.5"
          style={{ borderRadius: "10px 10px 0 0" }}
        >
          {TABS.map(({ href, label, Icon }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-1 flex-col items-center gap-1 py-1"
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={`flex h-8 w-full items-center justify-center rounded-[5px] border-2 ${
                    active
                      ? "border-[var(--px-edge)] bg-brass text-[color:var(--color-on-accent)] shadow-[0_2px_0_0_var(--color-brassdeep)]"
                      : "border-transparent text-muted2"
                  }`}
                >
                  <Icon size={20} />
                </span>
                <span
                  className={`px-label text-[0.42rem] ${active ? "text-brass" : "text-muted2"}`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
