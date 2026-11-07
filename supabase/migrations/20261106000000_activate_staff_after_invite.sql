-- Pengelola hanya dapat membaca undangan milik email akunnya sendiri.
CREATE POLICY "Staff can view own invitations"
  ON public.tenant_staffs FOR SELECT
  TO authenticated
  USING (lower(trim(email)) = lower(trim(auth.jwt()->>'email')));

-- Email undangan membuat profil staff, tetapi akses baru aktif setelah verifikasi email.
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

CREATE OR REPLACE FUNCTION public.activate_staff_invitation()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT := lower(trim(auth.jwt()->>'email'));
BEGIN
  IF auth.uid() IS NULL OR v_email IS NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE public.tenant_staffs
  SET status = 'active'
  WHERE lower(trim(email)) = v_email
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'staff'
    );

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.activate_staff_invitation() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.activate_staff_invitation() TO authenticated;

-- Aktifkan undangan lama yang sudah diterima dan memiliki profil staff.
UPDATE public.tenant_staffs AS staff
SET status = 'active'
WHERE EXISTS (
  SELECT 1
  FROM public.profiles
  WHERE lower(trim(profiles.email)) = lower(trim(staff.email))
    AND profiles.role = 'staff'
);
