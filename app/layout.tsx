import { Toaster } from "sonner";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai, Geist_Mono } from "next/font/google";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { AccessDeniedToast } from "@/components/auth/AccessDeniedToast";
import { Suspense } from "react";
import "./globals.css";

const sans = IBM_Plex_Sans_Thai({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  subsets: ["latin", "thai"],
  variable: "--font-ibm-plex",
  display: 'swap',
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
        className={`${sans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >
        <Sidebar />
        <main className="pb-20 md:pb-4 md:pl-64 min-h-screen flex flex-col transition-all duration-300">
          {children}

        </main>
        <Toaster position="top-center" richColors />
        <Suspense><AccessDeniedToast /></Suspense>
        <MobileNav />

      </body>
    </html>
  );
}
