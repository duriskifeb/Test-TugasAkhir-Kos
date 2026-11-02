-- Keep proof-of-business documents private and require one for new house registrations.

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS sku_document_path TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tenant-documents',
  'tenant-documents',
  false,
  5242880,
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png'];

DROP POLICY IF EXISTS "tenant_documents_insert_own_folder" ON storage.objects;
CREATE POLICY "tenant_documents_insert_own_folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'tenant-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "tenant_documents_select_owner_or_admin" ON storage.objects;
CREATE POLICY "tenant_documents_select_owner_or_admin"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'tenant-documents'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

DROP POLICY IF EXISTS "tenant_documents_delete_own_folder" ON storage.objects;
CREATE POLICY "tenant_documents_delete_own_folder"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'tenant-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE OR REPLACE FUNCTION public.setup_boarding_house(p_data JSONB)
RETURNS UUID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_uid         UUID    := auth.uid();
  v_name        TEXT    := btrim(coalesce(p_data->>'name', ''));
  v_subdomain   TEXT    := btrim(regexp_replace(lower(btrim(coalesce(p_data->>'subdomain', ''))), '[^a-z0-9]+', '-', 'g'), '-');
  v_address     TEXT    := btrim(coalesce(p_data->>'address', ''));
  v_sku_document_path TEXT := btrim(coalesce(p_data->>'sku_document_path', ''));
  v_landmark    TEXT    := nullif(btrim(coalesce(p_data->>'landmark', '')), '');
  v_description TEXT    := nullif(btrim(coalesce(p_data->>'description', '')), '');
  v_latitude    DOUBLE PRECISION := nullif(p_data->>'latitude', '')::double precision;
  v_longitude   DOUBLE PRECISION := nullif(p_data->>'longitude', '')::double precision;
  v_room        JSONB   := coalesce(p_data->'room', '{}'::jsonb);
  v_room_type   TEXT    := nullif(btrim(coalesce(v_room->>'type', '')), '');
  v_tenant_type TEXT    := nullif(v_room->>'tenant_type', '');
  v_length      NUMERIC := nullif(v_room->>'size_length', '')::numeric;
  v_width       NUMERIC := nullif(v_room->>'size_width', '')::numeric;
  v_count       INTEGER := nullif(v_room->>'count', '')::integer;
  v_price       NUMERIC := nullif(v_room->>'price', '')::numeric;
  v_room_facilities JSONB := CASE WHEN jsonb_typeof(p_data->'room_facilities') = 'array' THEN p_data->'room_facilities' ELSE '[]'::jsonb END;
  v_highlights  JSONB   := CASE WHEN jsonb_typeof(p_data->'highlights') = 'array' THEN p_data->'highlights' ELSE '[]'::jsonb END;
  v_photos      JSONB   := CASE WHEN jsonb_typeof(p_data->'photos') = 'array' THEN p_data->'photos' ELSE '[]'::jsonb END;
  v_subtitle    TEXT    := CASE
    WHEN nullif(btrim(coalesce(p_data->>'description', '')), '') IS NULL THEN 'Kamar nyaman dengan fasilitas lengkap.'
    WHEN length(btrim(p_data->>'description')) <= 160 THEN btrim(p_data->>'description')
    ELSE coalesce(
      substring(left(btrim(p_data->>'description'), 161) from '^.*[[:alnum:]]{2}\.(?=\s)'),
      regexp_replace(left(btrim(p_data->>'description'), 157), '\s+\S*$', '') || '...'
    )
  END;
  v_tenant_id   UUID;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Anda belum masuk.' USING ERRCODE = '28000';
  END IF;
  IF v_name = '' THEN
    RAISE EXCEPTION 'Nama kos wajib diisi.' USING ERRCODE = '22023';
  END IF;
  IF length(v_subdomain) < 3 THEN
    RAISE EXCEPTION 'Link website minimal 3 karakter (huruf, angka, dan tanda hubung).' USING ERRCODE = '22023';
  END IF;
  IF v_address = '' THEN
    RAISE EXCEPTION 'Alamat kos wajib diisi.' USING ERRCODE = '22023';
  END IF;
  IF v_sku_document_path !~ (
    '^' || v_uid::text || '/onboarding/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|jpg|png)$'
  ) THEN
    RAISE EXCEPTION 'Bukti SKU wajib diunggah dalam format PDF, JPG, atau PNG.' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM storage.objects
    WHERE bucket_id = 'tenant-documents'
      AND name = v_sku_document_path
  ) THEN
    RAISE EXCEPTION 'Bukti SKU belum berhasil diunggah. Silakan unggah ulang.' USING ERRCODE = '22023';
  END IF;
  IF v_tenant_type IS NULL OR v_tenant_type NOT IN ('putra', 'putri', 'campur') THEN
    RAISE EXCEPTION 'Pilih tipe penyewa: putra, putri, atau campur.' USING ERRCODE = '22023';
  END IF;
  IF v_count IS NULL OR v_count < 1 OR v_count > 100 THEN
    RAISE EXCEPTION 'Jumlah kamar harus antara 1 dan 100.' USING ERRCODE = '22023';
  END IF;
  IF v_price IS NULL OR v_price <= 0 THEN
    RAISE EXCEPTION 'Harga sewa per bulan wajib diisi.' USING ERRCODE = '22023';
  END IF;
  IF jsonb_array_length(v_photos) > 6 THEN
    RAISE EXCEPTION 'Maksimal 6 foto.' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements_text(v_photos) AS u
    WHERE u !~ ('^https?://[^/]+/storage/v1/object/public/tenant-assets/' || v_uid::text || '/[^?#[:space:]]+$')
  ) THEN
    RAISE EXCEPTION 'Alamat foto tidak valid. Unggah foto lewat formulir pendaftaran.' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (SELECT 1 FROM public.tenants WHERE subdomain = v_subdomain) THEN
    RAISE EXCEPTION 'Link website ini sudah digunakan, silakan pilih yang lain.' USING ERRCODE = '23505';
  END IF;

  INSERT INTO public.tenants (
    owner_id, name, subdomain, address, sku_document_path, landmark, latitude, longitude,
    description, facilities, rules, status
  )
  VALUES (
    v_uid, v_name, v_subdomain, v_address, v_sku_document_path, v_landmark, v_latitude, v_longitude,
    nullif(btrim(coalesce(p_data->>'description', '')), ''), p_data->'facilities', p_data->'rules', 'UNVERIFIED'
  )
  RETURNING id INTO v_tenant_id;

  INSERT INTO public.rooms (
    boarding_house_id, name, price, status, facilities,
    room_type, tenant_type, size_length, size_width
  )
  SELECT
    v_tenant_id,
    coalesce(v_room_type, 'Kamar') || ' ' || n,
    v_price, 'available', v_room_facilities,
    v_room_type, v_tenant_type, v_length, v_width
  FROM generate_series(1, v_count) AS n;

  INSERT INTO public.page_sections (tenant_id, section_type, content, order_index)
  VALUES
    (v_tenant_id, 'hero', jsonb_build_object(
      'title', v_name,
      'subtitle', v_subtitle,
      'ctaText', 'Lihat Kamar'), 1),
    (v_tenant_id, 'features', jsonb_build_object(
      'title', 'Fasilitas & Keunggulan',
      'roomsTitle', 'Pilihan Kamar',
      'whatsappNumber', '',
      'items', (
        SELECT coalesce(jsonb_agg(jsonb_build_object('icon', 'CheckCircle2', 'text', h)), '[]'::jsonb)
        FROM (SELECT h FROM jsonb_array_elements_text(v_highlights) AS h LIMIT 3) AS top3
      )), 2),
    (v_tenant_id, 'rooms', '{}'::jsonb, 3);

  IF jsonb_array_length(v_photos) > 0 THEN
    INSERT INTO public.page_sections (tenant_id, section_type, content, order_index)
    VALUES (v_tenant_id, 'gallery', jsonb_build_object(
      'title', 'Galeri Foto',
      'images', (
        SELECT jsonb_agg(jsonb_build_object('url', u))
        FROM jsonb_array_elements_text(v_photos) AS u
      )), 4);
  END IF;

  RETURN v_tenant_id;
END;
$$;

REVOKE ALL ON FUNCTION public.setup_boarding_house(JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.setup_boarding_house(JSONB) TO authenticated;
