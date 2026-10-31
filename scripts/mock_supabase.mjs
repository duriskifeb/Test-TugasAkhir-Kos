// Server Supabase TIRUAN untuk melihat tampilan (FE) tanpa project Supabase asli.
// Menyajikan sebagian kecil API Supabase (Auth + PostgREST + RPC + Storage) dengan data contoh di memori.
//
// Pakai:   node scripts/mock_supabase.mjs        (default http://127.0.0.1:54321)
// Lalu jalankan aplikasi dengan:
//   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=demo npm run dev
//
// Akun contoh:
//   admin@admin.com   / admin123      (admin)
//   owner@demo.test   / demo12345     (pemilik kos)
//   staff@demo.test   / demo12345     (pengelola kos)
//   renter@demo.test  / demo12345     (penyewa)
//
// BATASAN: bukan database sungguhan. Tidak ada RLS (semua data terlihat oleh semua akun), data hilang saat
// server dihentikan, dan trigger/RPC hanya ditiru secukupnya. Jangan dipakai untuk menguji keamanan atau SQL.

import http from "node:http";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.MOCK_SUPABASE_PORT || 54321);
const day = (d) => new Date(Date.now() + d * 86400000).toISOString();
const dateOnly = (d) => day(d).slice(0, 10);
const uid = () => randomUUID();

// ---------------------------------------------------------------- data contoh
const ids = { admin: uid(), owner: uid(), staff: uid(), renter: uid() };
const users = [
  { id: ids.admin, email: "admin@admin.com", password: "admin123", meta: { full_name: "Super Admin", role: "admin" } },
  { id: ids.owner, email: "owner@demo.test", password: "demo12345", meta: { full_name: "Rizky Pemilik", role: "owner" } },
  { id: ids.staff, email: "staff@demo.test", password: "demo12345", meta: { full_name: "Dewi Pengelola", role: "staff" } },
  { id: ids.renter, email: "renter@demo.test", password: "demo12345", meta: { full_name: "Siti Rahmawati", role: "renter" } },
];

const db = {
  profiles: users.map((u) => ({
    id: u.id, full_name: u.meta.full_name, role: u.meta.role, email: u.email, phone: "0812345678" + (users.indexOf(u) + 10),
    is_suspended: false, created_at: day(-90), updated_at: null,
  })),
  tenants: [], rooms: [], tenant_staffs: [], page_sections: [], renters: [], payments: [], bookings: [], maintenance_requests: [],
};

const melati = uid();
const kenanga = uid();
db.tenants.push(
  { id: melati, owner_id: ids.owner, name: "Kos Melati Residence", subdomain: "melati-residence", plan: "free", logo_url: null, status: "VERIFIED",
    address: "Jl. Mawar No. 12, Wonokromo, Surabaya", description: "Kos nyaman dekat kampus, akses 24 jam.",
    theme: { primaryColor: "#2f5bdc", fontFamily: "Inter", templateStyle: "modern" }, created_at: day(-80) },
  { id: kenanga, owner_id: ids.owner, name: "Kos Kenanga", subdomain: "kenanga", plan: "free", logo_url: null, status: "UNVERIFIED",
    address: "Jl. Kenanga No. 3, Gubeng, Surabaya", description: "Kos putri tenang.",
    theme: { primaryColor: "#2f5bdc", fontFamily: "Inter" }, created_at: day(-2) },
);
db.tenant_staffs.push({ id: uid(), tenant_id: melati, email: "staff@demo.test", name: "Dewi Pengelola", status: "active", created_at: day(-60) });

const facilityPool = ["AC", "WiFi", "Kasur Springbed", "Kamar Mandi Dalam", "Lemari", "Meja Belajar", "Water Heater"];
const roomNames = [...Array.from({ length: 12 }, (_, i) => `Kamar ${101 + i}`), ...Array.from({ length: 12 }, (_, i) => `Kamar ${201 + i}`)];
const statuses = "oooaooroaopoo" + "oaoopoooaoro"; // o=terisi a=tersedia r=perbaikan (p dihitung tersedia)
roomNames.forEach((name, i) => {
  const c = statuses[i] || "o";
  db.rooms.push({
    id: uid(), boarding_house_id: melati, name, price: i < 12 ? 1500000 : 1850000,
    status: c === "o" ? "occupied" : c === "r" ? "maintenance" : "available",
    facilities: facilityPool.slice(0, 3 + (i % 4)), created_at: day(-79 + i), deleted_at: null,
  });
});
["Kenanga A", "Kenanga B", "Kenanga C"].forEach((name) =>
  db.rooms.push({ id: uid(), boarding_house_id: kenanga, name, price: 1300000, status: "available", facilities: ["WiFi", "Lemari"], created_at: day(-2), deleted_at: null }));

const renterNames = ["Andi Pratama", "Budi Santoso", "Citra Lestari", "Dewi Anggraini", "Eko Prasetyo", "Fitri Handayani", "Gilang Ramadhan", "Hana Permata",
  "Indra Wijaya", "Joko Susilo", "Kartika Sari", "Lukman Hakim", "Maya Putri", "Nanda Saputra", "Oka Wibowo", "Putri Ayu"];
const occupied = db.rooms.filter((r) => r.boarding_house_id === melati && r.status === "occupied");
occupied.forEach((room, i) => {
  const rid = uid();
  db.renters.push({
    id: rid, tenant_id: melati, room_id: room.id, full_name: renterNames[i % renterNames.length], phone_number: "08123" + String(100000 + i * 7),
    check_in_date: dateOnly(-120 + i * 6), status: "active", created_at: day(-120 + i * 6),
    room_name_snapshot: room.name, monthly_rent_snapshot: room.price,
  });
  for (let m = 0; m < 3; m++) {
    const paid = m > 0 || i % 4 !== 0;
    db.payments.push({
      id: uid(), tenant_id: melati, renter_id: rid, amount: room.price, status: paid ? "paid" : "unpaid",
      due_date: dateOnly(-60 + m * 30 + (i % 5)), paid_at: paid ? day(-58 + m * 30) : null, created_at: day(-62 + m * 30),
      renter_name_snapshot: renterNames[i % renterNames.length], room_name_snapshot: room.name,
    });
  }
});
const free = db.rooms.filter((r) => r.boarding_house_id === melati && r.status === "available");
[["Siti Rahmawati", "081234567890", 3, "pending"], ["Rama Aditya", "085712345678", 6, "pending"], ["Lina Marlina", "081300000001", 9, "pending"],
 ["Yoga Pratama", "081300000002", -10, "approved"], ["Nina Safitri", "081300000003", -20, "rejected"]].forEach(([n, p, d, st], i) => {
  const room = free[i % free.length];
  db.bookings.push({
    id: uid(), boarding_house_id: melati, room_id: room.id, renter_name: n, renter_phone: p, renter_email: null, planned_check_in: dateOnly(d),
    additional_notes: i === 1 ? "Bawa motor" : null, status: st, created_at: day(-i - 1), updated_at: day(-i - 1),
    room_name_snapshot: room.name, room_price_snapshot: room.price, boarding_house_name_snapshot: "Kos Melati Residence",
  });
});
[["Kipas angin mati", "Kipas di kamar tidak berfungsi sejak 10 Oktober.", 0, "pending"], ["Keran bocor", "Keran kamar mandi menetes terus.", 5, "in_progress"],
 ["Lampu koridor", "Lampu koridor lantai 2 sudah diganti.", null, "resolved"], ["AC kurang dingin", "AC perlu dibersihkan.", 9, "pending"]].forEach(([t, d, ri, st]) => {
  const room = ri === null ? null : db.rooms.filter((r) => r.boarding_house_id === melati)[ri];
  db.maintenance_requests.push({
    id: uid(), tenant_id: melati, room_id: room ? room.id : null, reported_by: "Staf", title: t, description: d, status: st, created_at: day(-3),
    room_name_snapshot: room ? room.name : null,
  });
});
// Data kos dari pendaftaran, supaya halaman publik contoh menampilkan lokasi, fasilitas, dan peraturan.
Object.assign(db.tenants.find((t) => t.id === melati), {
  landmark: "Dekat kampus, di sebelah minimarket", latitude: -7.2996, longitude: 112.7342,
  facilities: { kamar_mandi: ["K. Mandi Dalam"], udara: ["AC", "Jendela"], layanan: ["Wifi", "Termasuk Listrik"], keamanan: ["CCTV", "Kunci Gerbang"], cuci: ["Laundry"] },
  rules: { criteria: "mahasiswa", capacity: 2, allowChildren: false, allowCouples: false, requireKtp: true, allowPets: false, curfew: "24jam", noSmoking: true,
    guests: { allowed: true, noOppositeGender: true, overnightAllowed: false, overnightFee: false, curfew: false }, damageFine: true, pickets: false },
});
db.rooms.filter((r) => r.boarding_house_id === melati).forEach((r, i) => {
  r.room_type = i < 12 ? "Tipe Standar" : "Tipe Deluxe"; r.tenant_type = ["putra", "putri", "campur"][i % 3]; r.size_length = 3; r.size_width = i < 12 ? 3 : 4;
});
const sec = (type, order, content) => db.page_sections.push({ id: uid(), tenant_id: melati, section_type: type, content, order_index: order, created_at: day(-70) });
sec("hero", 0, { title: "Kos Nyaman di Jantung Surabaya", subtitle: "Kamar bersih, aman, dan dekat kampus. Siap huni dengan fasilitas lengkap.", ctaText: "Lihat Kamar" });
sec("features", 1, { title: "Fasilitas & Keunggulan", roomsTitle: "Pilihan Kamar", whatsappNumber: "6281234567890",
  items: [{ icon: "CheckCircle2", text: "Lokasi strategis dekat kampus" }, { icon: "CheckCircle2", text: "Keamanan 24 jam dengan CCTV" }, { icon: "CheckCircle2", text: "WiFi cepat di semua kamar" }, { icon: "CheckCircle2", text: "Kebersihan dijaga setiap hari" }] });
sec("rooms", 2, {});
sec("gallery", 3, { title: "Galeri Foto", images: [{ url: "http://127.0.0.1:" + PORT + "/storage/v1/object/public/demo/1.svg" }, { url: "http://127.0.0.1:" + PORT + "/storage/v1/object/public/demo/2.svg" }, { url: "http://127.0.0.1:" + PORT + "/storage/v1/object/public/demo/3.svg" }] });

// ---------------------------------------------------------------- relasi untuk select bersarang
const FK = {
  bookings: { rooms: "room_id", tenants: "boarding_house_id" },
  renters: { rooms: "room_id", tenants: "tenant_id" },
  payments: { renters: "renter_id", tenants: "tenant_id" },
  maintenance_requests: { rooms: "room_id", tenants: "tenant_id" },
  rooms: { tenants: "boarding_house_id" },
  tenants: { profiles: "owner_id" },
  tenant_staffs: { tenants: "tenant_id" },
  page_sections: { tenants: "tenant_id" },
};
const DEFAULTS = {
  tenants: () => ({ status: "UNVERIFIED", plan: "free", logo_url: null, theme: { primaryColor: "#2f5bdc", fontFamily: "Inter" } }),
  rooms: () => ({ status: "available", facilities: [], deleted_at: null }),
  renters: () => ({ status: "active" }),
  payments: () => ({ status: "unpaid", paid_at: null }),
  bookings: () => ({ status: "pending", renter_email: null, additional_notes: null, updated_at: new Date().toISOString() }),
  maintenance_requests: () => ({ status: "pending" }),
  tenant_staffs: () => ({ status: "pending" }),
  profiles: () => ({ role: "owner", is_suspended: false }),
};

// ---------------------------------------------------------------- tiruan trigger snapshot (lihat migration 20261031000000)
function applySnapshot(table, row, old) {
  const room = (id) => db.rooms.find((r) => r.id === id);
  if (table === "bookings" && !old) {
    const r = room(row.room_id);
    if (!r || r.deleted_at) throw new Error("Kamar tidak ditemukan atau sudah tidak tersedia.");
    if (r.boarding_house_id !== row.boarding_house_id) throw new Error("Kamar tidak termasuk kos yang dipilih.");
    row.room_name_snapshot = r.name;
    row.room_price_snapshot = r.price;
    row.boarding_house_name_snapshot = db.tenants.find((t) => t.id === row.boarding_house_id)?.name;
  } else if (table === "renters" && !old) {
    const r = row.room_id ? room(row.room_id) : null;
    row.room_name_snapshot = r ? r.name : null;
    row.monthly_rent_snapshot = r ? r.price : null;
  } else if (table === "payments" && !old) {
    const rn = db.renters.find((x) => x.id === row.renter_id);
    if (!rn) throw new Error("Penghuni tidak ditemukan.");
    row.renter_name_snapshot = rn.full_name;
    row.room_name_snapshot = rn.room_id ? room(rn.room_id)?.name ?? null : null;
  } else if (table === "maintenance_requests" && !old) {
    row.room_name_snapshot = row.room_id ? room(row.room_id)?.name ?? null : null;
  }
  if (old) {
    for (const k of Object.keys(row)) if (k.endsWith("_snapshot") && old[k] != null) row[k] = old[k];
  }
}

// ---------------------------------------------------------------- parser PostgREST
function splitTop(s) {
  const out = []; let depth = 0, cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) { out.push(cur); cur = ""; } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out.map((x) => x.trim());
}
function parseSelect(sel) {
  const items = [];
  for (const raw of splitTop(sel || "*")) {
    const m = raw.match(/^(?:([\w]+):)?([\w*]+)(?:!\w+)?(?:\((.*)\))?$/s);
    if (!m) continue;
    const [, alias, name, inner] = m;
    items.push({ alias: alias || name, name, sub: inner !== undefined ? parseSelect(inner) : null });
  }
  return items;
}
function project(table, row, items) {
  if (!row) return row;
  const out = {};
  for (const it of items) {
    if (it.name === "*" && !it.sub) { Object.assign(out, row); continue; }
    if (it.sub) {
      const fk = FK[table]?.[it.name];
      const target = fk ? db[it.name]?.find((x) => x.id === row[fk]) : null;
      out[it.alias] = target ? project(it.name, target, it.sub) : null;
    } else out[it.alias] = row[it.name];
  }
  return out;
}
function matches(row, filters) {
  return filters.every(({ col, op, val }) => {
    const v = row[col];
    const s = v === null || v === undefined ? null : String(v);
    switch (op) {
      case "eq": return s === val;
      case "neq": return s !== val;
      case "gt": return s !== null && s > val;
      case "gte": return s !== null && s >= val;
      case "lt": return s !== null && s < val;
      case "lte": return s !== null && s <= val;
      case "in": return val.slice(1, -1).split(",").map((x) => x.replace(/^"|"$/g, "")).includes(s);
      case "is": return val === "null" ? s === null : val === "true" ? v === true : v === false;
      case "like": case "ilike": return s !== null && new RegExp("^" + val.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*") + "$", op === "ilike" ? "i" : "").test(s);
      default: return true;
    }
  });
}
const RESERVED = new Set(["select", "order", "limit", "offset", "on_conflict", "columns"]);
function parseFilters(url) {
  const f = [];
  for (const [col, raw] of url.searchParams) {
    if (RESERVED.has(col)) continue;
    const i = raw.indexOf(".");
    if (i > 0) f.push({ col, op: raw.slice(0, i), val: raw.slice(i + 1) });
  }
  return f;
}
function sortRows(rows, order) {
  if (!order) return rows;
  const keys = order.split(",").map((p) => { const [col, dir] = p.split("."); return { col, desc: dir === "desc" }; });
  return [...rows].sort((a, b) => {
    for (const { col, desc } of keys) {
      const x = a[col], y = b[col];
      if (x === y) continue;
      if (x === null || x === undefined) return 1;
      if (y === null || y === undefined) return -1;
      return (x > y ? 1 : -1) * (desc ? -1 : 1);
    }
    return 0;
  });
}

// ---------------------------------------------------------------- auth tiruan
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const userJson = (u) => ({
  id: u.id, aud: "authenticated", role: "authenticated", email: u.email, email_confirmed_at: day(-90), phone: "", confirmed_at: day(-90),
  last_sign_in_at: new Date().toISOString(), app_metadata: { provider: "email", providers: ["email"] }, user_metadata: u.meta, identities: [],
  created_at: day(-90), updated_at: new Date().toISOString(),
});
function session(u) {
  const exp = Math.floor(Date.now() / 1000) + 86400;
  const token = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: u.id, email: u.email, role: "authenticated", aud: "authenticated", exp, iat: exp - 86400, user_metadata: u.meta, app_metadata: { provider: "email" } })}.mock`;
  return { access_token: token, token_type: "bearer", expires_in: 86400, expires_at: exp, refresh_token: "r-" + u.id, user: userJson(u) };
}
function userFromAuth(req) {
  const t = (req.headers.authorization || "").replace(/^Bearer /i, "");
  try {
    const p = JSON.parse(Buffer.from(t.split(".")[1], "base64url").toString());
    return users.find((u) => u.id === p.sub) || null;
  } catch { return null; }
}

// ---------------------------------------------------------------- RPC tiruan
function approveBooking(id) {
  const b = db.bookings.find((x) => x.id === id);
  if (!b) throw new Error("Booking tidak ditemukan.");
  if (b.status !== "pending") throw new Error("Booking sudah diproses.");
  b.status = "approved"; b.updated_at = new Date().toISOString();
  const renter = { id: uid(), tenant_id: b.boarding_house_id, room_id: b.room_id, full_name: b.renter_name, phone_number: b.renter_phone, check_in_date: b.planned_check_in, status: "active", created_at: new Date().toISOString() };
  applySnapshot("renters", renter, null); db.renters.push(renter);
  const room = db.rooms.find((r) => r.id === b.room_id); if (room) room.status = "occupied";
  const pay = { id: uid(), tenant_id: b.boarding_house_id, renter_id: renter.id, amount: renter.monthly_rent_snapshot ?? 0, status: "unpaid", paid_at: null, created_at: new Date().toISOString(),
    due_date: new Date(new Date(b.planned_check_in).getTime() + 7 * 86400000).toISOString().slice(0, 10) };
  applySnapshot("payments", pay, null); db.payments.push(pay);
  return renter.id;
}

// Meniru fungsi database setup_boarding_house: validasi, pesan, dan hasilnya sama dengan versi SQL.
function setupBoardingHouse(d, user) {
  const fail = (message, code) => { throw Object.assign(new Error(message), { code }); };
  if (!user) fail("Anda belum masuk.", "28000");
  d = d || {};
  const room = d.room || {};
  const name = String(d.name ?? "").trim();
  const subdomain = String(d.subdomain ?? "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const address = String(d.address ?? "").trim();
  const count = Number(room.count);
  const photos = Array.isArray(d.photos) ? d.photos : [];
  if (!name) fail("Nama kos wajib diisi.", "22023");
  if (subdomain.length < 3) fail("Link website minimal 3 karakter (huruf, angka, dan tanda hubung).", "22023");
  if (!address) fail("Alamat kos wajib diisi.", "22023");
  if (!["putra", "putri", "campur"].includes(room.tenant_type)) fail("Pilih tipe penyewa: putra, putri, atau campur.", "22023");
  if (!(count >= 1 && count <= 100)) fail("Jumlah kamar harus antara 1 dan 100.", "22023");
  if (!(Number(room.price) > 0)) fail("Harga sewa per bulan wajib diisi.", "22023");
  if (photos.length > 6) fail("Maksimal 6 foto.", "22023");
  // Alamat foto harus berkas milik pemanggil di bucket tenant-assets (sama dengan fungsi SQL).
  const ownPhoto = new RegExp("^https?://[^/]+/storage/v1/object/public/tenant-assets/" + user.id + "/[^?#\\s]+$");
  if (photos.some((u) => typeof u !== "string" || !ownPhoto.test(u))) fail("Alamat foto tidak valid. Unggah foto lewat formulir pendaftaran.", "22023");
  if (db.tenants.some((t) => t.subdomain === subdomain)) fail("Link website ini sudah digunakan, silakan pilih yang lain.", "23505");

  const now = new Date().toISOString();
  const type = String(room.type ?? "").trim() || null;
  const tenant = { id: uid(), owner_id: user.id, name, subdomain, plan: "free", logo_url: null, status: "UNVERIFIED", address, landmark: String(d.landmark ?? "").trim() || null,
    latitude: d.latitude ?? null, longitude: d.longitude ?? null, description: String(d.description ?? "").trim() || null, facilities: d.facilities ?? null, rules: d.rules ?? null, theme: {}, created_at: now };
  db.tenants.push(tenant);
  for (let i = 1; i <= count; i++) {
    db.rooms.push({ id: uid(), boarding_house_id: tenant.id, name: `${type ?? "Kamar"} ${i}`, price: Number(room.price), status: "available", facilities: d.room_facilities ?? [],
      room_type: type, tenant_type: room.tenant_type, size_length: room.size_length ?? null, size_width: room.size_width ?? null, created_at: now, deleted_at: null });
  }
  const add = (section_type, order_index, content) => db.page_sections.push({ id: uid(), tenant_id: tenant.id, section_type, content, order_index, created_at: now });
  // Subjudul hero dipotong di akhir kalimat atau batas kata, sama seperti fungsi SQL.
  const desc = tenant.description;
  const subtitle = !desc ? "Kamar nyaman dengan fasilitas lengkap." : desc.length <= 160 ? desc
    : desc.slice(0, 161).match(/^.*[A-Za-z0-9]{2}\.(?=\s)/)?.[0] ?? desc.slice(0, 157).replace(/\s+\S*$/, "") + "...";
  add("hero", 1, { title: name, subtitle, ctaText: "Lihat Kamar" });
  add("features", 2, { title: "Fasilitas & Keunggulan", roomsTitle: "Pilihan Kamar", whatsappNumber: "", items: (d.highlights ?? []).slice(0, 3).map((text) => ({ icon: "CheckCircle2", text })) });
  add("rooms", 3, {});
  if (photos.length) add("gallery", 4, { title: "Galeri Foto", images: photos.map((url) => ({ url })) });
  return tenant.id;
}

// ---------------------------------------------------------------- server
const send = (res, status, body, extra = {}) => {
  const payload = body === undefined ? "" : typeof body === "string" ? body : JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json", ...extra });
  res.end(payload);
};
const readBody = (req) => new Promise((resolve) => {
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString() || "null")); } catch { resolve(null); } });
});
const pgErr = (res, status, message, code = "P0001") => send(res, status, { code, details: null, hint: null, message });

// Unggahan biner: badan mentah, dan pengambilan berkas dari multipart/form-data.
const uploads = [];
const readRaw = (req) => new Promise((resolve) => {
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => resolve(Buffer.concat(chunks)));
});
function multipartFile(raw, contentType) {
  const boundary = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!boundary) return { type: contentType.split(";")[0].trim(), bytes: raw };
  const marker = Buffer.from("--" + (boundary[1] || boundary[2]));
  let start = raw.indexOf(marker);
  while (start >= 0) {
    const next = raw.indexOf(marker, start + marker.length);
    const part = raw.subarray(start + marker.length, next < 0 ? raw.length : next);
    const split = part.indexOf("\r\n\r\n");
    const head = part.subarray(0, split < 0 ? 0 : split).toString();
    if (/filename=/i.test(head)) {
      const body = part.subarray(split + 4, part.length - 2); // buang \r\n penutup bagian
      return { type: (head.match(/content-type:\s*([^\r\n;]+)/i) || [])[1]?.trim() || "", bytes: body };
    }
    start = next;
  }
  return { type: "", bytes: Buffer.alloc(0) };
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Headers", "*, authorization, apikey, content-type, x-client-info, prefer, accept, accept-profile, content-profile, range, x-supabase-api-version");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,HEAD,OPTIONS");
  res.setHeader("Access-Control-Expose-Headers", "Content-Range");
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  try {
    // ---- storage
    if (path.startsWith("/storage/v1/object/public/")) {
      const n = Number((path.match(/(\d+)\.svg$/) || [0, 1])[1]);
      const hue = ["#dbe7ff", "#fef3c7", "#d6e4ff"][(n - 1) % 3];
      res.writeHead(200, { "Content-Type": "image/svg+xml" });
      return res.end(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="${hue}"/><text x="400" y="310" font-family="sans-serif" font-size="40" fill="#1c2541" text-anchor="middle">Foto contoh ${n}</text></svg>`);
    }
    // Daftar unggahan untuk pengujian (hanya ada di server tiruan ini).
    if (path === "/__uploads") return send(res, 200, uploads);
    if (path.startsWith("/storage/v1/object/") && req.method === "POST") {
      const raw = await readRaw(req);
      const [bucket, ...rest] = decodeURIComponent(path.replace("/storage/v1/object/", "")).split("/");
      const name = rest.join("/");
      const file = multipartFile(raw, req.headers["content-type"] || "");
      const storageErr = (status, error, message) => send(res, status, { statusCode: String(status), error, message });

      // Meniru kebijakan dan batas bucket tenant-assets (migrasi 20261101030000).
      if (bucket === "tenant-assets") {
        const user = userFromAuth(req);
        const folder = name.includes("/") ? name.split("/")[0] : null;
        const allowed = user && folder && (folder === user.id || db.tenants.some((t) => t.id === folder && t.owner_id === user.id));
        if (!allowed) return storageErr(403, "Unauthorized", "new row violates row-level security policy");
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return storageErr(415, "invalid_mime_type", `mime type ${file.type || "(kosong)"} is not supported`);
        if (file.bytes.length > 5 * 1024 * 1024) return storageErr(413, "Payload too large", "The object exceeded the maximum allowed size");
      }
      const has = (text) => file.bytes.includes(Buffer.from(text));
      uploads.push({ bucket, name, contentType: file.type, size: file.bytes.length, magic: file.bytes.subarray(0, 4).toString("hex"), hasExif: has("Exif"), hasGps: has("GPS"), hasSecret: has("KOORDINAT-RAHASIA") });
      return send(res, 200, { Key: `${bucket}/${name}`, Id: uid() });
    }
    // Hapus berkas (supabase.storage.remove): hanya di folder sendiri atau folder kos milik sendiri.
    if (path === "/storage/v1/object/tenant-assets" && req.method === "DELETE") {
      const user = userFromAuth(req);
      const prefixes = ((await readBody(req)) || {}).prefixes || [];
      const removed = [];
      for (const name of prefixes) {
        const folder = String(name).split("/")[0];
        const allowed = user && (folder === user.id || db.tenants.some((t) => t.id === folder && t.owner_id === user.id));
        const i = uploads.findIndex((u) => u.bucket === "tenant-assets" && u.name === name);
        if (allowed && i >= 0) removed.push(...uploads.splice(i, 1));
      }
      return send(res, 200, removed.map((u) => ({ name: u.name, bucket_id: u.bucket })));
    }
    if (path.startsWith("/storage/v1/object/")) { await readBody(req); return send(res, 200, { Key: path.replace("/storage/v1/object/", ""), Id: uid() }); }

    // ---- auth
    if (path === "/auth/v1/token") {
      const body = (await readBody(req)) || {};
      if (url.searchParams.get("grant_type") === "refresh_token") {
        const u = users.find((x) => "r-" + x.id === body.refresh_token);
        return u ? send(res, 200, session(u)) : send(res, 400, { code: 400, error_code: "refresh_token_not_found", msg: "Invalid Refresh Token" });
      }
      const u = users.find((x) => x.email.toLowerCase() === String(body.email || "").toLowerCase() && x.password === body.password);
      return u ? send(res, 200, session(u)) : send(res, 400, { code: 400, error_code: "invalid_credentials", msg: "Invalid login credentials" });
    }
    if (path === "/auth/v1/signup") {
      const body = (await readBody(req)) || {};
      if (users.some((x) => x.email.toLowerCase() === String(body.email).toLowerCase()))
        return send(res, 422, { code: 422, error_code: "user_already_exists", msg: "User already registered" });
      // Meniru trigger handle_new_user: staff bila diundang, renter bila diminta, selain itu owner.
      const invites = db.tenant_staffs.filter((s) => s.email.toLowerCase() === String(body.email).toLowerCase());
      const role = invites.length ? "staff" : body.data?.role === "renter" ? "renter" : "owner";
      invites.forEach((s) => { s.status = "active"; });
      const meta = { ...(body.data || {}), role };
      const u = { id: uid(), email: body.email, password: body.password, meta };
      users.push(u);
      db.profiles.push({ id: u.id, full_name: meta.full_name ?? null, role, email: u.email, phone: meta.phone ?? null, is_suspended: false, created_at: new Date().toISOString(), updated_at: null });
      return send(res, 200, session(u));
    }
    if (path === "/auth/v1/user") {
      const u = userFromAuth(req);
      if (!u) return send(res, 401, { code: 401, error_code: "bad_jwt", msg: "invalid JWT" });
      if (req.method === "PUT") { const body = (await readBody(req)) || {}; if (body.password) u.password = body.password; }
      return send(res, 200, userJson(u));
    }
    if (path === "/auth/v1/recover") { await readBody(req); return send(res, 200, {}); }
    if (path === "/auth/v1/logout") return send(res, 204);

    // ---- rpc
    if (path.startsWith("/rest/v1/rpc/")) {
      const fn = path.split("/").pop();
      const body = (await readBody(req)) || {};
      if (fn === "approve_booking") return send(res, 200, JSON.stringify(approveBooking(body.p_booking_id)));
      if (fn === "is_admin") return send(res, 200, JSON.stringify(userFromAuth(req)?.meta.role === "admin"));
      if (fn === "is_staff_invited") return send(res, 200, JSON.stringify(db.tenant_staffs.some((s) => s.email.toLowerCase() === String(body.p_email || "").trim().toLowerCase())));
      if (fn === "setup_boarding_house") {
        try { return send(res, 200, JSON.stringify(setupBoardingHouse(body.p_data, userFromAuth(req)))); }
        catch (e) { return pgErr(res, 400, e.message, e.code || "P0001"); }
      }
      return pgErr(res, 404, `Fungsi ${fn} tidak ada di server tiruan`, "PGRST202");
    }

    // ---- tabel
    const m = path.match(/^\/rest\/v1\/([a-z_]+)$/);
    if (!m) return send(res, 404, { message: "Not found (server tiruan)" });
    const table = m[1];
    if (!db[table]) return pgErr(res, 404, `Tabel ${table} tidak ada di server tiruan`, "PGRST205");

    const prefer = req.headers.prefer || "";
    const wantsObject = (req.headers.accept || "").includes("vnd.pgrst.object");
    const items = parseSelect(url.searchParams.get("select"));
    const filters = parseFilters(url);
    const respond = (status, rows, extra = {}) => {
      const out = rows.map((r) => project(table, r, items));
      if (wantsObject) {
        if (out.length !== 1) return send(res, 406, { code: "PGRST116", details: `The result contains ${out.length} rows`, hint: null, message: "JSON object requested, multiple (or no) rows returned" });
        return send(res, status, out[0], extra);
      }
      return send(res, status, out, extra);
    };

    if (req.method === "GET" || req.method === "HEAD") {
      let rows = sortRows(db[table].filter((r) => matches(r, filters)), url.searchParams.get("order"));
      const total = rows.length;
      const off = Number(url.searchParams.get("offset") || 0);
      const lim = url.searchParams.get("limit");
      rows = rows.slice(off, lim ? off + Number(lim) : undefined);
      const range = { "Content-Range": total === 0 ? "*/0" : `${off}-${off + rows.length - 1}/${total}` };
      if (req.method === "HEAD") { res.writeHead(200, range); return res.end(); }
      return respond(200, rows, range);
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      const list = Array.isArray(body) ? body : [body];
      const created = [];
      const onConflict = url.searchParams.get("on_conflict") || "id";
      for (const input of list) {
        const existing = prefer.includes("merge-duplicates") ? db[table].find((r) => r[onConflict] === input[onConflict]) : null;
        if (existing) { Object.assign(existing, input); created.push(existing); continue; }
        const row = { id: uid(), created_at: new Date().toISOString(), ...(DEFAULTS[table]?.() || {}), ...input };
        if (table === "tenants" && !row.subdomain && row.name) row.subdomain = String(row.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        applySnapshot(table, row, null);
        db[table].push(row);
        created.push(row);
        if (table === "renters") { /* status kamar diubah oleh aplikasi sendiri */ }
      }
      return prefer.includes("return=representation") ? respond(201, created) : send(res, 201);
    }

    if (req.method === "PATCH") {
      const body = (await readBody(req)) || {};
      const hit = db[table].filter((r) => matches(r, filters));
      for (const row of hit) {
        const before = { ...row };
        Object.assign(row, body);
        if (table === "bookings" || table === "renters" || table === "payments" || table === "maintenance_requests") applySnapshot(table, row, before);
        if (table === "bookings") row.updated_at = new Date().toISOString();
      }
      return prefer.includes("return=representation") ? respond(200, hit) : send(res, 204);
    }

    if (req.method === "DELETE") {
      const hit = db[table].filter((r) => matches(r, filters));
      const refs = { rooms: ["bookings", "renters", "maintenance_requests"], renters: ["payments"] }[table] || [];
      for (const row of hit) {
        if (refs.some((t) => db[t].some((x) => x[table === "rooms" ? "room_id" : "renter_id"] === row.id)))
          return pgErr(res, 409, `update or delete on table "${table}" violates foreign key constraint`, "23001");
      }
      db[table] = db[table].filter((r) => !hit.includes(r));
      return send(res, 204);
    }

    return send(res, 405, { message: "Method not allowed" });
  } catch (e) {
    return pgErr(res, 400, e.message);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Supabase TIRUAN berjalan di http://127.0.0.1:${PORT}`);
  console.log("Akun: admin@admin.com/admin123, owner@demo.test, staff@demo.test, renter@demo.test (kata sandi demo12345)");
});
