import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const display = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });

export const metadata: Metadata = {
  title: "Tabiya — Chess Mastery",
  description: "A premium, structured chess training experience.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Tabiya" },
};

export const viewport: Viewport = {
  themeColor: "#17120c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
          <main className="flex-1 px-4 pb-24 pt-5">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
