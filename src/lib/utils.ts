// --- Class Utility ---
// Menggabungkan class names secara kondisional
// Contoh: cn("text-sm", isActive && "font-bold", "text-gray-900")
type ClassValue = string | number | boolean | null | undefined;
export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flat()
    .filter(Boolean)
    .join(" ");
}

// --- Currency Formatter ---
// Memformat angka ke format Rupiah Indonesia
// Contoh: formatRupiah(2500000) → "Rp 2.500.000"
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// --- Initials Generator ---
// Mengambil inisial dari nama lengkap
// Contoh: getInitials("Alex Johnson") → "AJ"
export function getInitials(fullName: string): string {
  if (!fullName) return "?";
  return fullName
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

// --- Date Formatter ---
// Memformat tanggal ke format Indonesia
// Contoh: formatDate("2024-01-15") → "15 Januari 2024"
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// --- Slug Generator ---
// Mengubah string menjadi URL-friendly slug
// Contoh: toSlug("Kos Sejahtera Indah") → "kos-sejahtera-indah"
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .trim();
}
