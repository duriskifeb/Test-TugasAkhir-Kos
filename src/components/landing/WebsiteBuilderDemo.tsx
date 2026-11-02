"use client";

import { useState, type CSSProperties } from "react";
import { BedDouble, CheckCircle2, GripVertical, Image as ImageIcon, Type, type LucideIcon } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { fontStacks } from "./builderFonts";

// Contoh interaktif Website Builder dengan opsi yang sama seperti builder asli.
// Hanya ilustrasi: tidak menyimpan apa pun dan kembali ke awal saat halaman dimuat ulang.

type TemplateStyle = "modern" | "minimalist" | "bold";
type FontName = "Inter" | "Plus Jakarta Sans" | "Merriweather";
type SectionId = "hero" | "features" | "rooms" | "gallery";

const styles: { value: TemplateStyle; label: string }[] = [
  { value: "modern", label: "Modern" },
  { value: "minimalist", label: "Minimalis" },
  { value: "bold", label: "Bold" },
];

const fonts: { value: FontName; label: string; family: string }[] = [
  { value: "Inter", label: "Inter", family: fontStacks["Inter"] },
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans", family: fontStacks["Plus Jakarta Sans"] },
  { value: "Merriweather", label: "Merriweather", family: fontStacks["Merriweather"] },
];

const swatches = [
  { name: "Biru", hex: "#2f5bdc" },
  { name: "Hijau", hex: "#047857" },
  { name: "Merah marun", hex: "#be123c" },
  { name: "Oranye", hex: "#c2410c" },
  { name: "Teal", hex: "#0f766e" },
];

const sectionMeta: Record<SectionId, { title: string; icon: LucideIcon }> = {
  hero: { title: "Teks Pembuka (Hero)", icon: Type },
  features: { title: "Fasilitas & Keunggulan", icon: CheckCircle2 },
  rooms: { title: "Daftar Kamar (Otomatis)", icon: BedDouble },
  gallery: { title: "Galeri Foto", icon: ImageIcon },
};

const chip =
  "flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white px-2 py-2 text-center text-xs font-semibold text-gray-700 transition-colors hover:border-gray-400 has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:checked]:text-primary has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary";

const chipTight = chip.replace("px-2", "px-1");

// Teks tombol dipilih putih atau gelap, mana yang kontrasnya lebih baik terhadap warna pilihan.
function readableOn(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return 1.05 / (luminance + 0.05) >= (luminance + 0.05) / 0.07 ? "#ffffff" : "#1c2541";
}

function SortableRow({ id }: { id: SectionId }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const { title, icon: Icon } = sectionMeta[id];

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 rounded-lg border bg-white px-2 py-1.5 ${
        isDragging ? "relative z-10 border-primary shadow-pop" : "border-gray-200"
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Geser bagian ${title}`}
        className="grid size-7 shrink-0 cursor-grab touch-none place-items-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      <Icon aria-hidden className="size-4 shrink-0 text-gray-500" />
      <span className="text-xs font-medium text-gray-800">{title}</span>
    </div>
  );
}

export function WebsiteBuilderDemo() {
  const [style, setStyle] = useState<TemplateStyle>("modern");
  const [color, setColor] = useState(swatches[0].hex);
  const [font, setFont] = useState<FontName>("Inter");
  const [title, setTitle] = useState("Kos nyaman di pusat kota");
  const [order, setOrder] = useState<SectionId[]>(["hero", "features", "rooms", "gallery"]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setOrder((items) => arrayMove(items, items.indexOf(active.id as SectionId), items.indexOf(over.id as SectionId)));
  };

  // Pratinjau meniru perbedaan gaya di halaman publik kos.
  const on = readableOn(color);
  const radius = style === "minimalist" ? "rounded-none" : "rounded-xl";
  const cardClass = `${radius} ${
    style === "minimalist"
      ? "border border-gray-300"
      : style === "bold"
        ? "border-2 shadow-card"
        : "border border-gray-200 shadow-card"
  } bg-white`;
  const cardStyle: CSSProperties | undefined = style === "bold" ? { borderColor: color } : undefined;
  const buttonStyle: CSSProperties =
    style === "minimalist"
      ? { color, borderColor: color, background: "#ffffff" }
      : { color: on, background: color, borderColor: style === "bold" ? color : "transparent" };
  const buttonClass = `inline-flex min-h-9 items-center justify-center px-3 text-xs font-semibold ${
    style === "minimalist" ? "rounded-none border" : style === "bold" ? "rounded-lg border-2" : "rounded-lg border"
  }`;

  const sections: Record<SectionId, React.ReactNode> = {
    hero: (
      <section key="hero" className="px-5 py-6" style={{ background: `color-mix(in oklab, ${color} 10%, white)` }}>
        <p className="text-2xl leading-tight font-bold text-balance break-words">{title.trim() || "Judul besar"}</p>
        <p className="mt-2 max-w-sm text-sm text-gray-700">Kamar nyaman dengan fasilitas lengkap di lokasi strategis.</p>
        <span className={`${buttonClass} mt-4`} style={buttonStyle}>
          Lihat Kamar
        </span>
      </section>
    ),
    features: (
      <section key="features" className="px-5 py-5">
        <p className="text-lg font-bold">Fasilitas & Keunggulan</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-3">
          {["Lokasi Strategis", "Keamanan 24 Jam", "Kamar Mandi Dalam"].map((item) => (
            <li key={item} className={`flex items-center gap-2 px-3 py-2 text-xs font-medium ${cardClass}`} style={cardStyle}>
              <CheckCircle2 aria-hidden className="size-4 shrink-0" style={{ color }} />
              {item}
            </li>
          ))}
        </ul>
      </section>
    ),
    rooms: (
      <section key="rooms" className="px-5 py-5">
        <p className="text-lg font-bold">Pilihan Kamar</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            { name: "Kamar Standar", info: "AC, Wi-Fi", price: "Rp 1.450.000" },
            { name: "Kamar Deluxe", info: "AC, Wi-Fi, kamar mandi dalam", price: "Rp 1.650.000" },
          ].map((room) => (
            <div key={room.name} className={`flex flex-col p-3 ${cardClass}`} style={cardStyle}>
              <p className="text-sm font-bold">{room.name}</p>
              <p className="mt-0.5 text-xs text-gray-600">{room.info}</p>
              <p className="mt-2 text-sm font-semibold" style={{ color }}>
                {room.price} <span className="text-xs font-normal text-gray-600">per bulan</span>
              </p>
              <span className={`${buttonClass} mt-3 w-full`} style={buttonStyle}>
                Pesan via WhatsApp
              </span>
            </div>
          ))}
        </div>
      </section>
    ),
    gallery: (
      <section key="gallery" className="px-5 py-5">
        <p className="text-lg font-bold">Galeri Foto</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`grid aspect-[16/10] place-items-center bg-gray-100 text-gray-500 ${radius}`}
              style={{ background: `color-mix(in oklab, ${color} ${8 + i * 4}%, #eef1f8)` }}
            >
              <ImageIcon aria-hidden className="size-5" />
            </div>
          ))}
        </div>
      </section>
    ),
  };

  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
      <div className="space-y-4 md:self-start md:[@media(min-height:760px)]:sticky md:[@media(min-height:760px)]:top-20">
        <fieldset>
          <legend className="mb-1.5 text-xs font-semibold text-gray-600">Gaya halaman</legend>
          <div className="grid grid-cols-3 gap-2">
            {styles.map((option) => (
              <label key={option.value} className={chip}>
                <input
                  type="radio"
                  name="demo-style"
                  value={option.value}
                  checked={style === option.value}
                  onChange={() => setStyle(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 text-xs font-semibold text-gray-600">Warna utama</legend>
          <div className="flex flex-wrap items-center gap-2">
            {swatches.map((swatch) => (
              <label
                key={swatch.hex}
                className="grid size-8 cursor-pointer place-items-center rounded-full border-2 border-transparent has-[:checked]:border-gray-900 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary"
              >
                <input
                  type="radio"
                  name="demo-color"
                  value={swatch.hex}
                  checked={color.toLowerCase() === swatch.hex}
                  onChange={() => setColor(swatch.hex)}
                  className="sr-only"
                />
                <span aria-hidden className="size-5 rounded-full" style={{ background: swatch.hex }} />
                <span className="sr-only">{swatch.name}</span>
              </label>
            ))}
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <input
                type="color"
                aria-label="Warna kustom"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="size-8 cursor-pointer rounded-md border border-gray-300 bg-white p-0.5"
              />
              Kustom
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 text-xs font-semibold text-gray-600">Jenis huruf</legend>
          <div className="grid grid-cols-3 gap-2">
            {fonts.map((option) => (
              <label key={option.value} className={chipTight}>
                <input
                  type="radio"
                  name="demo-font"
                  value={option.value}
                  checked={font === option.value}
                  onChange={() => setFont(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="demo-title" className="mb-1.5 block text-xs font-semibold text-gray-600">
            Judul besar
          </label>
          <input
            id="demo-title"
            type="text"
            maxLength={50}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="field"
          />
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold text-gray-600">Urutan bagian</p>
          <DndContext id="demo-urutan-bagian" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={order} strategy={verticalListSortingStrategy}>
              <div className="space-y-1.5">
                {order.map((id) => (
                  <SortableRow key={id} id={id} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <p className="mt-1.5 text-xs text-gray-600">Geser ikon titik-titik untuk mengubah urutan.</p>
        </div>
      </div>

      <div
        role="region"
        aria-label="Pratinjau halaman kos"
        className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
        style={{ fontFamily: fonts.find((f) => f.value === font)?.family }}
      >
        <nav
          className={`flex h-12 items-center justify-between gap-3 bg-white px-5 ${
            style === "minimalist" ? "border-b border-gray-300" : "border-b border-gray-200"
          }`}
        >
          <span className="truncate text-sm font-bold" style={{ color }}>
            Kos Sejahtera
          </span>
          <span className="flex gap-4 text-xs font-medium text-gray-600">
            <span>Beranda</span>
            <span>Kamar</span>
          </span>
        </nav>
        {order.map((id) => sections[id])}
      </div>
    </div>
  );
}
