-- Snapshot data master pada tabel transaksi.
--
-- Nilai master (nama kamar, harga, nama kos, nama penghuni) disalin ke tabel transaksi saat
-- transaksi dibuat, sehingga mengubah atau menghapus master tidak mengubah riwayat.
-- Foreign key tetap dipertahankan untuk relasi dan laporan.
--
-- TIDAK di-snapshot karena harus selalu terbaru: rooms.status, rooms.facilities,
-- status aktif staf, dan konfigurasi website (page_sections, tenants.theme).
--
-- Migration ini aman dijalankan ulang (idempotent).

-------------------------------------------------------
-- 1. Kolom snapshot (nullable dulu agar backfill aman)
-------------------------------------------------------
ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS room_name_snapshot TEXT,
    ADD COLUMN IF NOT EXISTS room_price_snapshot DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS boarding_house_name_snapshot TEXT;

ALTER TABLE public.renters
    ADD COLUMN IF NOT EXISTS room_name_snapshot TEXT,
    ADD COLUMN IF NOT EXISTS monthly_rent_snapshot DECIMAL(12,2);

ALTER TABLE public.payments
    ADD COLUMN IF NOT EXISTS renter_name_snapshot TEXT,
    ADD COLUMN IF NOT EXISTS room_name_snapshot TEXT;

ALTER TABLE public.maintenance_requests
    ADD COLUMN IF NOT EXISTS room_name_snapshot TEXT;

-- Soft delete kamar: kamar yang "dihapus" hanya diberi tanda, barisnya tetap ada untuk riwayat.
ALTER TABLE public.rooms
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-------------------------------------------------------
-- 2. Backfill dari data master saat ini
--    COALESCE + WHERE ... IS NULL: nilai yang sudah terisi tidak pernah ditimpa.
-------------------------------------------------------
UPDATE public.bookings b
SET room_name_snapshot = COALESCE(b.room_name_snapshot, r.name),
    room_price_snapshot = COALESCE(b.room_price_snapshot, r.price),
    boarding_house_name_snapshot = COALESCE(b.boarding_house_name_snapshot, t.name)
FROM public.rooms r, public.tenants t
WHERE r.id = b.room_id
  AND t.id = b.boarding_house_id
  AND (b.room_name_snapshot IS NULL
       OR b.room_price_snapshot IS NULL
       OR b.boarding_house_name_snapshot IS NULL);

UPDATE public.renters x
SET room_name_snapshot = COALESCE(x.room_name_snapshot, r.name),
    monthly_rent_snapshot = COALESCE(x.monthly_rent_snapshot, r.price)
FROM public.rooms r
WHERE r.id = x.room_id
  AND (x.room_name_snapshot IS NULL OR x.monthly_rent_snapshot IS NULL);

UPDATE public.payments p
SET renter_name_snapshot = COALESCE(p.renter_name_snapshot, rn.full_name),
    room_name_snapshot = COALESCE(p.room_name_snapshot, rn.room_name_snapshot)
FROM public.renters rn
WHERE rn.id = p.renter_id
  AND (p.renter_name_snapshot IS NULL OR p.room_name_snapshot IS NULL);

UPDATE public.maintenance_requests m
SET room_name_snapshot = r.name
FROM public.rooms r
WHERE r.id = m.room_id
  AND m.room_name_snapshot IS NULL;

-- NOT NULL hanya untuk kolom yang pasti terisi. Kamar pada renters, payments (nama kamar), dan
-- maintenance_requests bersifat opsional (penghuni tanpa kamar, keluhan area umum), jadi tetap nullable.
ALTER TABLE public.bookings
    ALTER COLUMN room_name_snapshot SET NOT NULL,
    ALTER COLUMN room_price_snapshot SET NOT NULL,
    ALTER COLUMN boarding_house_name_snapshot SET NOT NULL;

ALTER TABLE public.payments
    ALTER COLUMN renter_name_snapshot SET NOT NULL;

-------------------------------------------------------
-- 3. Foreign key ke master: RESTRICT, bukan CASCADE / SET NULL
--    Riwayat tidak ikut terhapus atau kehilangan relasi ketika master dihapus.
-------------------------------------------------------
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_room_id_fkey;
ALTER TABLE public.bookings
    ADD CONSTRAINT bookings_room_id_fkey
    FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE RESTRICT;

ALTER TABLE public.renters DROP CONSTRAINT IF EXISTS renters_room_id_fkey;
ALTER TABLE public.renters
    ADD CONSTRAINT renters_room_id_fkey
    FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE RESTRICT;

ALTER TABLE public.maintenance_requests DROP CONSTRAINT IF EXISTS maintenance_requests_room_id_fkey;
ALTER TABLE public.maintenance_requests
    ADD CONSTRAINT maintenance_requests_room_id_fkey
    FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE RESTRICT;

ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_renter_id_fkey;
ALTER TABLE public.payments
    ADD CONSTRAINT payments_renter_id_fkey
    FOREIGN KEY (renter_id) REFERENCES public.renters(id) ON DELETE RESTRICT;

-------------------------------------------------------
-- 4. Trigger: salin snapshot dari master saat transaksi dibuat
--    Dijalankan di database, jadi nilai dari klien (termasuk harga) selalu ditimpa.
--    SECURITY DEFINER agar tetap bisa membaca master walau RLS pemanggil membatasinya.
-------------------------------------------------------

-- 4a. bookings: nama kamar, harga kamar, nama kos
CREATE OR REPLACE FUNCTION public.snapshot_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_room public.rooms%ROWTYPE;
    v_tenant_name TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        SELECT * INTO v_room FROM public.rooms WHERE id = NEW.room_id;
        IF NOT FOUND OR v_room.deleted_at IS NOT NULL THEN
            RAISE EXCEPTION 'Kamar tidak ditemukan atau sudah tidak tersedia.';
        END IF;
        IF v_room.boarding_house_id <> NEW.boarding_house_id THEN
            RAISE EXCEPTION 'Kamar tidak termasuk kos yang dipilih.';
        END IF;

        SELECT name INTO v_tenant_name FROM public.tenants WHERE id = NEW.boarding_house_id;

        NEW.room_name_snapshot := v_room.name;
        NEW.room_price_snapshot := v_room.price;
        NEW.boarding_house_name_snapshot := v_tenant_name;
    ELSE
        -- Snapshot tidak boleh berubah setelah terisi.
        NEW.room_name_snapshot := COALESCE(OLD.room_name_snapshot, NEW.room_name_snapshot);
        NEW.room_price_snapshot := COALESCE(OLD.room_price_snapshot, NEW.room_price_snapshot);
        NEW.boarding_house_name_snapshot := COALESCE(OLD.boarding_house_name_snapshot, NEW.boarding_house_name_snapshot);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_snapshot ON public.bookings;
CREATE TRIGGER bookings_snapshot
    BEFORE INSERT OR UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.snapshot_booking();

-- 4b. renters: nama kamar dan harga sewa bulanan saat check-in
CREATE OR REPLACE FUNCTION public.snapshot_renter()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_room public.rooms%ROWTYPE;
BEGIN
    IF TG_OP = 'INSERT' OR NEW.room_id IS DISTINCT FROM OLD.room_id THEN
        -- Penghuni baru, atau dipindah ke kamar lain: ambil dari master saat ini.
        IF NEW.room_id IS NULL THEN
            NEW.room_name_snapshot := NULL;
            NEW.monthly_rent_snapshot := NULL;
        ELSE
            SELECT * INTO v_room FROM public.rooms WHERE id = NEW.room_id;
            NEW.room_name_snapshot := v_room.name;
            NEW.monthly_rent_snapshot := v_room.price;
        END IF;
    ELSE
        NEW.room_name_snapshot := COALESCE(OLD.room_name_snapshot, NEW.room_name_snapshot);
        NEW.monthly_rent_snapshot := COALESCE(OLD.monthly_rent_snapshot, NEW.monthly_rent_snapshot);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS renters_snapshot ON public.renters;
CREATE TRIGGER renters_snapshot
    BEFORE INSERT OR UPDATE ON public.renters
    FOR EACH ROW EXECUTE FUNCTION public.snapshot_renter();

-- 4c. payments: nama penghuni dan nama kamar saat tagihan terbit
--     (kolom amount sudah menyimpan nominal tagihan, jadi tidak perlu snapshot lagi)
CREATE OR REPLACE FUNCTION public.snapshot_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_renter_name TEXT;
    v_room_name TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        SELECT rn.full_name, rm.name
        INTO v_renter_name, v_room_name
        FROM public.renters rn
        LEFT JOIN public.rooms rm ON rm.id = rn.room_id
        WHERE rn.id = NEW.renter_id;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Penghuni tidak ditemukan.';
        END IF;

        NEW.renter_name_snapshot := v_renter_name;
        NEW.room_name_snapshot := v_room_name;
    ELSE
        NEW.renter_name_snapshot := COALESCE(OLD.renter_name_snapshot, NEW.renter_name_snapshot);
        NEW.room_name_snapshot := COALESCE(OLD.room_name_snapshot, NEW.room_name_snapshot);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS payments_snapshot ON public.payments;
CREATE TRIGGER payments_snapshot
    BEFORE INSERT OR UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.snapshot_payment();

-- 4d. maintenance_requests: nama kamar saat keluhan dicatat (NULL = area umum)
CREATE OR REPLACE FUNCTION public.snapshot_maintenance_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.room_id IS NULL THEN
            NEW.room_name_snapshot := NULL;
        ELSE
            SELECT name INTO NEW.room_name_snapshot FROM public.rooms WHERE id = NEW.room_id;
        END IF;
    ELSE
        NEW.room_name_snapshot := COALESCE(OLD.room_name_snapshot, NEW.room_name_snapshot);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS maintenance_requests_snapshot ON public.maintenance_requests;
CREATE TRIGGER maintenance_requests_snapshot
    BEFORE INSERT OR UPDATE ON public.maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION public.snapshot_maintenance_request();

-------------------------------------------------------
-- 5. approve_booking: setujui booking dalam SATU transaksi database
--    (status booking, penghuni baru, kamar terisi, tagihan pertama). Jika salah satu gagal,
--    semuanya dibatalkan. SECURITY INVOKER: RLS pemanggil (pemilik atau staf) tetap berlaku.
--    Harga tagihan diambil dari snapshot penghuni (master saat disetujui), bukan dari klien.
-------------------------------------------------------
CREATE OR REPLACE FUNCTION public.approve_booking(p_booking_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_booking public.bookings%ROWTYPE;
    v_renter_id UUID;
    v_rent DECIMAL(12,2);
BEGIN
    SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking tidak ditemukan.';
    END IF;
    IF v_booking.status <> 'pending' THEN
        RAISE EXCEPTION 'Booking sudah diproses.';
    END IF;

    UPDATE public.bookings SET status = 'approved', updated_at = now() WHERE id = p_booking_id;

    INSERT INTO public.renters (tenant_id, room_id, full_name, phone_number, check_in_date, status)
    VALUES (v_booking.boarding_house_id, v_booking.room_id, v_booking.renter_name,
            v_booking.renter_phone, v_booking.planned_check_in, 'active')
    RETURNING id, monthly_rent_snapshot INTO v_renter_id, v_rent;

    UPDATE public.rooms SET status = 'occupied' WHERE id = v_booking.room_id;

    -- Tagihan pertama jatuh tempo 7 hari setelah rencana check-in.
    INSERT INTO public.payments (tenant_id, renter_id, amount, due_date, status)
    VALUES (v_booking.boarding_house_id, v_renter_id, COALESCE(v_rent, 0),
            v_booking.planned_check_in + 7, 'unpaid');

    RETURN v_renter_id;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_booking(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_booking(UUID) TO authenticated;

-------------------------------------------------------
-- 6. Kamar yang sudah di-soft-delete tidak terlihat oleh publik
--    (policy lama "Public can view rooms" membuka semua kamar, termasuk yang sudah dihapus)
-------------------------------------------------------
DROP POLICY IF EXISTS "Public can view rooms" ON public.rooms;
CREATE POLICY "Public can view rooms"
    ON public.rooms FOR SELECT
    USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Anyone can view available rooms" ON public.rooms;
CREATE POLICY "Anyone can view available rooms"
    ON public.rooms FOR SELECT
    USING (status = 'available'::room_status AND deleted_at IS NULL);
