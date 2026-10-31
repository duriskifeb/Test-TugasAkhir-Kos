import { Inter, Merriweather, Plus_Jakarta_Sans } from "next/font/google";

// Tiga pilihan font Website Builder untuk pratinjau di landing. preload dimatikan agar
// berkas font baru diunduh saat pengunjung benar-benar memilihnya.
export const inter = Inter({ subsets: ["latin"], preload: false });
export const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], preload: false });
export const merriweather = Merriweather({ subsets: ["latin"], weight: ["400", "700", "900"], preload: false });
