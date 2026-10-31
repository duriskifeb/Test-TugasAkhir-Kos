-- Uji pola snapshot pada transaksi (migration 20261031000000_add_transaction_snapshots).
--
-- Jalankan di SQL Editor Supabase, atau: psql "$DATABASE_URL" -f supabase/tests/snapshot_test.sql
-- Semua data uji dibuat di dalam satu transaksi lalu di-ROLLBACK, jadi tidak ada sisa data.
-- Jika ada pengecekan yang gagal, skrip berhenti dengan pesan "GAGAL: ...".

BEGIN;

CREATE FUNCTION pg_temp.expect(ok BOOLEAN, msg TEXT) RETURNS VOID
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT COALESCE(ok, FALSE) THEN
        RAISE EXCEPTION 'GAGAL: %', msg;
    END IF;
END;
$$;

DO $$
DECLARE
    v_owner UUID := gen_random_uuid();
    v_tenant UUID := gen_random_uuid();
    v_room UUID := gen_random_uuid();
    v_b1 UUID := gen_random_uuid();
    v_b2 UUID := gen_random_uuid();
    v_b3 UUID := gen_random_uuid();
    v_renter1 UUID;
    v_renter2 UUID;
    v_maint UUID := gen_random_uuid();
    r RECORD;
    v_count INT;
    v_failed BOOLEAN;
BEGIN
    -- Fixture: pemilik, kos, satu kamar seharga 1.000.000
    INSERT INTO auth.users (id, email) VALUES (v_owner, 'snapshot-test-' || v_owner || '@example.test');
    INSERT INTO public.profiles (id, full_name, role) VALUES (v_owner, 'Penguji Snapshot', 'owner')
        ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.tenants (id, owner_id, name, subdomain, status)
        VALUES (v_tenant, v_owner, 'Kos Melati', 'melati-' || v_tenant, 'VERIFIED');
    INSERT INTO public.rooms (id, boarding_house_id, name, price)
        VALUES (v_room, v_tenant, 'Kamar 101', 1000000);

    -- 1. Booking pertama. Klien mencoba mengirim snapshot palsu; harus ditimpa dari master.
    INSERT INTO public.bookings (id, boarding_house_id, room_id, renter_name, renter_phone, planned_check_in,
                                 room_name_snapshot, room_price_snapshot, boarding_house_name_snapshot)
    VALUES (v_b1, v_tenant, v_room, 'Siti Rahmawati', '081234567890', CURRENT_DATE + 3, 'PALSU', 1, 'PALSU');

    SELECT * INTO r FROM public.bookings WHERE id = v_b1;
    PERFORM pg_temp.expect(r.room_name_snapshot = 'Kamar 101', 'snapshot nama kamar diambil dari master, bukan dari klien');
    PERFORM pg_temp.expect(r.room_price_snapshot = 1000000, 'snapshot harga diambil dari master, bukan dari klien');
    PERFORM pg_temp.expect(r.boarding_house_name_snapshot = 'Kos Melati', 'snapshot nama kos diambil dari master');

    -- 2. Setujui booking: penghuni, status kamar, dan tagihan dibuat dalam satu transaksi.
    v_renter1 := public.approve_booking(v_b1);

    SELECT * INTO r FROM public.renters WHERE id = v_renter1;
    PERFORM pg_temp.expect(r.room_name_snapshot = 'Kamar 101' AND r.monthly_rent_snapshot = 1000000, 'snapshot penghuni terisi');
    SELECT * INTO r FROM public.payments WHERE renter_id = v_renter1;
    PERFORM pg_temp.expect(r.amount = 1000000, 'nominal tagihan pertama = harga master saat disetujui');
    PERFORM pg_temp.expect(r.renter_name_snapshot = 'Siti Rahmawati' AND r.room_name_snapshot = 'Kamar 101', 'snapshot tagihan terisi');
    PERFORM pg_temp.expect((SELECT status FROM public.rooms WHERE id = v_room) = 'occupied', 'status kamar menjadi occupied');
    PERFORM pg_temp.expect((SELECT status FROM public.bookings WHERE id = v_b1) = 'approved', 'status booking menjadi approved');

    -- 3. Keluhan untuk kamar tersebut
    INSERT INTO public.maintenance_requests (id, tenant_id, room_id, reported_by, title, description)
        VALUES (v_maint, v_tenant, v_room, 'Staf', 'Kipas mati', 'Kipas tidak berfungsi');
    PERFORM pg_temp.expect((SELECT room_name_snapshot FROM public.maintenance_requests WHERE id = v_maint) = 'Kamar 101', 'snapshot keluhan terisi');

    -- 4. UBAH MASTER: nama dan harga kamar berubah. Status juga dikembalikan ke available.
    UPDATE public.rooms SET name = 'Kamar VIP A', price = 2000000, status = 'available' WHERE id = v_room;

    -- 5. Transaksi LAMA harus tetap menampilkan nilai lama.
    SELECT * INTO r FROM public.bookings WHERE id = v_b1;
    PERFORM pg_temp.expect(r.room_name_snapshot = 'Kamar 101' AND r.room_price_snapshot = 1000000, 'booking lama tidak berubah');
    SELECT * INTO r FROM public.renters WHERE id = v_renter1;
    PERFORM pg_temp.expect(r.room_name_snapshot = 'Kamar 101' AND r.monthly_rent_snapshot = 1000000, 'penghuni lama tidak berubah');
    SELECT * INTO r FROM public.payments WHERE renter_id = v_renter1;
    PERFORM pg_temp.expect(r.amount = 1000000 AND r.room_name_snapshot = 'Kamar 101', 'tagihan lama tidak berubah');
    PERFORM pg_temp.expect((SELECT room_name_snapshot FROM public.maintenance_requests WHERE id = v_maint) = 'Kamar 101', 'keluhan lama tidak berubah');

    -- 6. Transaksi BARU memakai nilai baru.
    INSERT INTO public.bookings (id, boarding_house_id, room_id, renter_name, renter_phone, planned_check_in)
        VALUES (v_b2, v_tenant, v_room, 'Budi Santoso', '085712345678', CURRENT_DATE + 5);
    SELECT * INTO r FROM public.bookings WHERE id = v_b2;
    PERFORM pg_temp.expect(r.room_name_snapshot = 'Kamar VIP A' AND r.room_price_snapshot = 2000000, 'booking baru memakai nilai baru');
    v_renter2 := public.approve_booking(v_b2);
    SELECT * INTO r FROM public.payments WHERE renter_id = v_renter2;
    PERFORM pg_temp.expect(r.amount = 2000000 AND r.room_name_snapshot = 'Kamar VIP A', 'tagihan baru memakai nilai baru');

    -- 7. Snapshot tidak bisa diubah lewat UPDATE.
    UPDATE public.bookings SET room_price_snapshot = 5, room_name_snapshot = 'DIUBAH' WHERE id = v_b1;
    SELECT * INTO r FROM public.bookings WHERE id = v_b1;
    PERFORM pg_temp.expect(r.room_price_snapshot = 1000000 AND r.room_name_snapshot = 'Kamar 101', 'snapshot tidak bisa diubah setelah terisi');

    -- 8. Booking yang sudah diproses tidak bisa disetujui dua kali.
    v_failed := FALSE;
    BEGIN
        PERFORM public.approve_booking(v_b1);
    EXCEPTION WHEN OTHERS THEN
        v_failed := TRUE;
    END;
    PERFORM pg_temp.expect(v_failed, 'approve_booking menolak booking yang bukan pending');
    SELECT count(*) INTO v_count FROM public.payments WHERE renter_id = v_renter1;
    PERFORM pg_temp.expect(v_count = 1, 'tidak ada tagihan ganda');

    -- 9. Atomik: jika pembuatan tagihan gagal, booking, penghuni, dan kamar ikut dibatalkan.
    UPDATE public.rooms SET status = 'available' WHERE id = v_room;
    INSERT INTO public.bookings (id, boarding_house_id, room_id, renter_name, renter_phone, planned_check_in)
        VALUES (v_b3, v_tenant, v_room, 'Dewi Lestari', '081300000000', CURRENT_DATE + 9);
    ALTER TABLE public.payments ADD CONSTRAINT tmp_snapshot_test_fail CHECK (amount < 0) NOT VALID;
    v_failed := FALSE;
    BEGIN
        PERFORM public.approve_booking(v_b3);
    EXCEPTION WHEN OTHERS THEN
        v_failed := TRUE;
    END;
    ALTER TABLE public.payments DROP CONSTRAINT tmp_snapshot_test_fail;
    PERFORM pg_temp.expect(v_failed, 'approve_booking gagal ketika tagihan tidak bisa dibuat');
    PERFORM pg_temp.expect((SELECT status FROM public.bookings WHERE id = v_b3) = 'pending', 'booking tetap pending setelah gagal');
    PERFORM pg_temp.expect((SELECT status FROM public.rooms WHERE id = v_room) = 'available', 'status kamar tidak berubah setelah gagal');
    SELECT count(*) INTO v_count FROM public.renters WHERE full_name = 'Dewi Lestari';
    PERFORM pg_temp.expect(v_count = 0, 'penghuni tidak dibuat setelah gagal');

    -- 10. Menghapus master tidak diizinkan selama ada riwayat (RESTRICT).
    v_failed := FALSE;
    BEGIN
        DELETE FROM public.rooms WHERE id = v_room;
    EXCEPTION WHEN restrict_violation OR foreign_key_violation THEN
        v_failed := TRUE;
    END;
    PERFORM pg_temp.expect(v_failed, 'hapus permanen kamar yang punya riwayat ditolak');

    v_failed := FALSE;
    BEGIN
        DELETE FROM public.renters WHERE id = v_renter1;
    EXCEPTION WHEN restrict_violation OR foreign_key_violation THEN
        v_failed := TRUE;
    END;
    PERFORM pg_temp.expect(v_failed, 'hapus permanen penghuni yang punya tagihan ditolak');

    -- 11. Soft delete: riwayat utuh, tetapi kamar tidak bisa dipesan lagi.
    UPDATE public.rooms SET deleted_at = now() WHERE id = v_room;
    SELECT * INTO r FROM public.bookings WHERE id = v_b1;
    PERFORM pg_temp.expect(r.room_name_snapshot = 'Kamar 101', 'riwayat utuh setelah kamar di-soft-delete');
    v_failed := FALSE;
    BEGIN
        INSERT INTO public.bookings (boarding_house_id, room_id, renter_name, renter_phone, planned_check_in)
            VALUES (v_tenant, v_room, 'Terlambat', '0800', CURRENT_DATE + 1);
    EXCEPTION WHEN OTHERS THEN
        v_failed := TRUE;
    END;
    PERFORM pg_temp.expect(v_failed, 'kamar yang sudah dihapus tidak bisa dipesan');

    RAISE NOTICE 'Semua pengecekan snapshot LULUS.';
END;
$$;

ROLLBACK;
