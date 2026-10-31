-- Status verifikasi kos hanya boleh diubah admin.
--
-- Kebijakan RLS "Owners can update own tenants" tidak membatasi kolom, jadi pemilik bisa mengubah
-- tenants.status menjadi VERIFIED lewat API (tanpa melalui admin), atau membuat kos yang langsung VERIFIED.
-- Trigger ini menutupnya:
--   1. Kos baru dari pengguna biasa harus berstatus UNVERIFIED.
--   2. Hanya admin yang boleh mengubah status kos.
--
-- auth.uid() kosong untuk SQL Editor dan service role; keduanya tepercaya (sama seperti protect_profile_role).
-- Pendaftaran kos (setup_boarding_house), tambah cabang, dan edit data kos lain selalu memakai UNVERIFIED
-- atau tidak menyentuh kolom status, jadi tidak terpengaruh.

CREATE OR REPLACE FUNCTION public.protect_tenant_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN new;
  END IF;

  IF tg_op = 'INSERT' AND new.status IS DISTINCT FROM 'UNVERIFIED' THEN
    RAISE EXCEPTION 'Kos baru harus berstatus UNVERIFIED sampai admin memverifikasinya.' USING ERRCODE = '42501';
  END IF;

  IF tg_op = 'UPDATE' AND new.status IS DISTINCT FROM old.status THEN
    RAISE EXCEPTION 'Status verifikasi kos hanya dapat diubah oleh admin.' USING ERRCODE = '42501';
  END IF;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS tenants_protect_status ON public.tenants;
CREATE TRIGGER tenants_protect_status
  BEFORE INSERT OR UPDATE OF status ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.protect_tenant_status();
