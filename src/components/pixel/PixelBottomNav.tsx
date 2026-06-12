"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeGlyph, AcademyGlyph, PuzzleGlyph, PlayGlyph, ProfileGlyph } from "@/components/pixel/PixelIcon";

const TABS = [
  { href: "/", label: "Home", Icon: HomeGlyph },
  { href: "/academy", label: "Academy", Icon: AcademyGlyph },
  { href: "/puzzles", label: "Puzzles", Icon: PuzzleGlyph },
  { href: "/play", label: "Play", Icon: PlayGlyph },
  { href: "/profile", label: "Profile", Icon: ProfileGlyph },
];

/**
 * Fixed pixel bottom nav from the mockups: five framed icon tiles, the active
 * one raised in gold. Honors the iPhone home-indicator safe area.
 */
export default function PixelBottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-md px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="px-panel flex items-stretch justify-between gap-1 px-1.5 py-1.5" style={{ borderRadius: "9px 9px 0 0" }}>
          {TABS.map(({ href, label, Icon }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <Link key={href} href={href} className="flex flex-1 flex-col items-center gap-0.5" aria-current={active ? "page" : undefined}>
                <span
                  className={`flex h-8 w-full items-center justify-center rounded-[5px] border-2 ${
                    active
                      ? "tab-navbounce border-[var(--px-edge)] bg-brass text-[color:var(--color-on-accent)] shadow-[0_2px_0_0_var(--color-brassdeep)]"
                      : "border-[var(--px-edge)] bg-[var(--color-ink)] text-muted2"
                  }`}
                >
                  <Icon size={19} />
                </span>
                <span className={`px-label text-[0.4rem] ${active ? "text-brass" : "text-muted2"}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
