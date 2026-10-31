// Menyiapkan foto sebelum diunggah.
//
// 1. Memeriksa isi berkas (tanda pengenal di awal berkas), bukan hanya nama atau tipe yang diklaim peramban.
//    Hanya JPG, PNG, dan WebP. SVG dan HTML yang menyamar sebagai gambar ditolak.
// 2. Menggambar ulang foto ke JPEG. Cara ini membuang seluruh metadata, termasuk koordinat GPS di EXIF,
//    memastikan berkas benar-benar gambar yang bisa dibuka, memutar foto sesuai orientasi kamera, dan
//    memperkecil foto besar. Foto potret maupun lanskap diterima apa adanya.
//
// Pemeriksaan di sini membantu pengguna dan membersihkan data. Penegakan sesungguhnya ada di bucket
// penyimpanan (jenis berkas, ukuran, dan folder) lewat migrasi 20261101030000.

import { MAX_PHOTO_BYTES, PHOTO_MAX_SIDE } from "./kos-options";

export class PhotoError extends Error {}

export type ImageFormat = "jpeg" | "png" | "webp";

/** Jenis gambar menurut isi berkas (bukan nama atau tipe kiriman). Null bila bukan JPG, PNG, atau WebP. */
export async function detectImageFormat(file: Blob): Promise<ImageFormat | null> {
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const text = (from: number, to: number) => String.fromCharCode(...head.slice(from, to));
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "jpeg";
  if (head[0] === 0x89 && text(1, 4) === "PNG" && head[4] === 0x0d && head[5] === 0x0a && head[6] === 0x1a && head[7] === 0x0a) return "png";
  if (text(0, 4) === "RIFF" && text(8, 12) === "WEBP") return "webp";
  return null;
}

export async function preparePhoto(file: File): Promise<File> {
  if (file.size === 0) throw new PhotoError(`${file.name} kosong.`);
  if (file.size > MAX_PHOTO_BYTES) throw new PhotoError(`${file.name} lebih dari 5 MB.`);
  if (!(await detectImageFormat(file))) {
    throw new PhotoError(`${file.name} bukan foto JPG, PNG, atau WebP yang valid.`);
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      throw new PhotoError(`${file.name} tidak bisa dibuka sebagai gambar.`);
    }
  }

  const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new PhotoError("Peramban Anda tidak bisa memproses foto.");
  }
  // PNG transparan menjadi berlatar putih, bukan hitam.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) throw new PhotoError(`${file.name} gagal diproses.`);

  const base = file.name.replace(/\.[^.]*$/, "").replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "foto";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
}
