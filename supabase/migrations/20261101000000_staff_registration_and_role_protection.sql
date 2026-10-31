-- Pendaftaran pengelola kos dan penguncian peran akun.
--
-- 1. is_staff_invited(email): dipakai halaman daftar untuk memeriksa undangan dari pemilik kos
--    sebelum akun dibuat. Tabel tenant_staffs tidak bisa dibaca pengunjung yang belum login.
-- 2. handle_new_user: peran akun baru ditetapkan di database. Pengelola hanya lewat undangan,
--    peran admin atau staff dari data pendaftaran diabaikan.
-- 3. Trigger pada profiles: peran hanya bisa diubah admin. SQL Editor dan service role tetap bisa.

-- 1. Cek undangan pengelola (boleh dipanggil sebelum login).
CREATE OR REPLACE FUNCTION public.is_staff_invited(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_staffs WHERE lower(email) = lower(trim(p_email))
  );
$$;

REVOKE ALL ON FUNCTION public.is_staff_invited(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff_invited(TEXT) TO anon, authenticated;

-- 2. Peran akun baru: staff bila diundang, renter bila diminta, selain itu owner.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role user_role;
BEGIN
  IF public.is_staff_invited(new.email) THEN
    v_role := 'staff';
    UPDATE public.tenant_staffs SET status = 'active' WHERE lower(email) = lower(new.email);
  ELSIF new.raw_user_meta_data->>'role' = 'renter' THEN
    v_role := 'renter';
  ELSE
    v_role := 'owner';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    v_role
  );

  RETURN new;
END;
$$;

-- 3. Pengguna tidak bisa menaikkan atau mengganti perannya sendiri.
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- auth.uid() kosong untuk SQL Editor dan service role; keduanya tepercaya.
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN new;
  END IF;

  IF tg_op = 'INSERT' AND new.role NOT IN ('owner', 'renter') THEN
    RAISE EXCEPTION 'Peran % tidak dapat dibuat sendiri.', new.role USING ERRCODE = '42501';
  END IF;

  IF tg_op = 'UPDATE' AND new.role IS DISTINCT FROM old.role THEN
    RAISE EXCEPTION 'Peran akun hanya dapat diubah oleh admin.' USING ERRCODE = '42501';
  END IF;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_role ON public.profiles;
CREATE TRIGGER profiles_protect_role
  BEFORE INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();
