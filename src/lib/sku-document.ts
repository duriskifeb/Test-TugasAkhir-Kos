import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { SKU_DOCUMENT_MAX_BYTES, SKU_DOCUMENT_MIME_TYPES } from "@/lib/kos-options";

const extensionByMimeType: Record<(typeof SKU_DOCUMENT_MIME_TYPES)[number], string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

function isSupportedMimeType(type: string): type is keyof typeof extensionByMimeType {
  return SKU_DOCUMENT_MIME_TYPES.some((supportedType) => supportedType === type);
}

export async function uploadSkuDocument(
  supabase: SupabaseClient<Database>,
  userId: string,
  file: File,
): Promise<string> {
  if (!isSupportedMimeType(file.type)) throw new Error("Bukti SKU harus berupa PDF, JPG, atau PNG.");
  const extension = extensionByMimeType[file.type];
  if (file.size > SKU_DOCUMENT_MAX_BYTES) throw new Error("Ukuran bukti SKU maksimal 5 MB.");

  const path = `${userId}/onboarding/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from("tenant-documents")
    .upload(path, file, { contentType: file.type });

  if (error) {
    console.error("Gagal mengunggah bukti SKU:", error);
    throw new Error("Bukti SKU gagal diunggah. Silakan coba lagi.");
  }

  return path;
}

export async function removeSkuDocument(supabase: SupabaseClient<Database>, path: string) {
  const { error } = await supabase.storage.from("tenant-documents").remove([path]);
  if (error) console.error("Gagal membersihkan unggahan bukti SKU:", error);
}
