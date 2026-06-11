import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import PwaRegister from "@/components/PwaRegister";

const display = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });

export const metadata: Metadata = {
  applicationName: "Tabiya",
  title: { default: "Tabiya — Chess Learning Game", template: "%s · Tabiya" },
  description: "A friendly, bright chess learning game — lessons, puzzles, and matches.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Tabiya" },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Tabiya — Chess Learning Game",
    description: "A friendly, bright chess learning game.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1729" },
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
          <main className="flex-1 px-4 pb-28 pt-[max(1.25rem,env(safe-area-inset-top))]">{children}</main>
          <BottomNav />
        </div>
        <PwaRegister />
      </body>
    </html>
  );
}
