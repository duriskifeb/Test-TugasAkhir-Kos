-------------------------------------------------------
-- FIX: Perbaiki fungsi handle_new_user agar membaca
-- role dari raw_user_meta_data dengan benar.
-- Sebelumnya trigger selalu default ke 'owner' meskipun
-- sudah dikirim role 'renter' dari signUp options.data
-------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _role user_role;
  _raw_role TEXT;
BEGIN
  -- Ambil nilai role dari metadata yang dikirim saat signUp
  _raw_role := new.raw_user_meta_data->>'role';
  
  -- Validasi: apakah nilai tersebut valid sebagai user_role enum?
  -- Jika tidak valid atau kosong, default ke 'owner'
  IF _raw_role IN ('admin', 'owner', 'staff', 'renter') THEN
    _role := _raw_role::user_role;
  ELSE
    _role := 'owner'::user_role;
  END IF;

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    _role
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
