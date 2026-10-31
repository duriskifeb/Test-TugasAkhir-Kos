-- Memastikan profil dibuat otomatis untuk setiap pengguna baru, lalu memperbaiki data lama.
--
-- Latar belakang: di database ini trigger pembuat profil pada auth.users tidak berjalan.
-- Akibatnya akun baru tidak punya baris profil, sehingga dashboard tidak menampilkan
-- sidebar dan pendaftaran kos gagal (tenants.owner_id mengacu ke profiles.id).
--
-- Aman dijalankan ulang.

-- 1. Fungsi pembuat profil. Sama seperti migrasi 20261101000000, ditambah ON CONFLICT
--    agar pendaftaran tidak gagal bila profilnya ternyata sudah ada.
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
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

-- 2. Pasang trigger. Trigger lama yang memakai fungsi yang sama dihapus lebih dulu,
--    apa pun namanya, supaya tidak ada dua trigger yang berjalan bersamaan.
DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN
    SELECT tgname
    FROM pg_trigger
    WHERE tgrelid = 'auth.users'::regclass
      AND NOT tgisinternal
      AND tgfoid = 'public.handle_new_user'::regproc
  LOOP
    EXECUTE format('DROP TRIGGER %I ON auth.users', t.tgname);
  END LOOP;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Lengkapi profil untuk akun yang sudah terlanjur tanpa profil.
INSERT INTO public.profiles (id, email, full_name, phone, role)
SELECT
  u.id,
  u.email,
  u.raw_user_meta_data->>'full_name',
  u.raw_user_meta_data->>'phone',
  CASE
    WHEN public.is_staff_invited(u.email) THEN 'staff'::user_role
    WHEN u.raw_user_meta_data->>'role' = 'renter' THEN 'renter'::user_role
    ELSE 'owner'::user_role
  END
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- 4. Isi email profil yang masih kosong (kebijakan akses pengelola mencocokkan lewat email).
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE u.id = p.id
  AND (p.email IS NULL OR p.email = '');
