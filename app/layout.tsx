import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/providers/QueryProvider";
import { SchoolSettingsProvider } from "@/components/providers/SchoolSettingsProvider";
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
  title: "SIMMAS - Sistem Manajemen Magang Siswa",
description: "Sistem Informasi Manajemen Magang Siswa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans bg-[#F4F7FE]`}
        suppressHydrationWarning
      >
        <Providers>
          <SchoolSettingsProvider>
            {children}
          </SchoolSettingsProvider>
        </Providers>
      </body>
    </html>
  );
}
