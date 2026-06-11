import type { Metadata, Viewport } from "next";
import { Press_Start_2P, Pixelify_Sans } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import PwaRegister from "@/components/PwaRegister";

const display = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-press",
  display: "swap",
});
const body = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: "The Rang",
  title: { default: "The Rang — Retro Chess Quest", template: "%s · The Rang" },
  description: "A retro pixel-art chess adventure — lessons, puzzles, and battles.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "The Rang" },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "The Rang — Retro Chess Quest",
    description: "A retro pixel-art chess adventure.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#121a3e" },
    { media: "(prefers-color-scheme: dark)", color: "#080d24" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full">
        <div id="tabiya-root" className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
          <main className="flex-1 px-3 pb-[88px] pt-[max(0.75rem,env(safe-area-inset-top))]">{children}</main>
          <BottomNav />
        </div>
        <PwaRegister />
      </body>
    </html>
  );
}
