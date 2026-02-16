import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MobileNav } from "@/components/layout/MobileNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CraftFlow — จัดการงานร้านป้าย",
  description: "Internal Tool จัดการงานร้านป้ายครบวงจร by TD ALL CO.,LTD.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0e7490",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <main className="pb-20">
          {children}
        </main>
        <MobileNav />
      </body>
    </html>
  );
}
