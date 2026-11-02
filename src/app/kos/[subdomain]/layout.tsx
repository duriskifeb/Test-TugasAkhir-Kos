import { Inter, Plus_Jakarta_Sans } from "next/font/google";

// Pilihan font di Website Builder. Merriweather dimuat via Google Fonts CDN di root layout.
const inter = Inter({ variable: "--font-tenant-inter", subsets: ["latin"] });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-tenant-jakarta", subsets: ["latin"] });

export default function KosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable} ${jakarta.variable} contents`}>
      {children}
    </div>
  );
}
