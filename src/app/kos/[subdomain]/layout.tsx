import { Inter, Merriweather, Plus_Jakarta_Sans } from "next/font/google";

// Tiga pilihan font di Website Builder. Dimuat di sini agar pilihan pemilik benar-benar tampil.
const inter = Inter({ variable: "--font-tenant-inter", subsets: ["latin"] });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-tenant-jakarta", subsets: ["latin"] });
const merriweather = Merriweather({
  variable: "--font-tenant-merriweather",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export default function KosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable} ${jakarta.variable} ${merriweather.variable} contents`}>
      {children}
    </div>
  );
}
