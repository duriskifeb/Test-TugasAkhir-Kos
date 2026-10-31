import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Build Kos | Manajemen Kos Modern",
    template: "%s | Build Kos",
  },
  description:
    "Platform manajemen kos-kosan all-in-one. Kelola kamar, penyewa, pembayaran, dan bangun website booking properti Anda dengan mudah.",
  keywords: ["kos", "kosan", "manajemen properti", "booking kamar", "indekos"],
  authors: [{ name: "Build Kos" }],
  creator: "Build Kos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
