-- Mengamankan unggahan foto ke bucket tenant-assets (foto kos dan galeri Website Builder).
--
-- Sebelumnya, pengguna yang sudah masuk boleh mengunggah berkas apa pun, dengan ukuran berapa pun,
-- ke folder mana pun di bucket ini. Sekarang:
--   1. Bucket hanya menerima JPG, PNG, dan WebP, maksimal 5 MB per berkas (ditegakkan oleh Supabase Storage).
--   2. Unggah hanya boleh ke folder sendiri: folder bernama id pengguna (pendaftaran kos) atau id kos milik
--      pengguna (Website Builder).
--   3. Pengguna boleh menghapus berkas di folder sendiri, supaya unggahan yang dibatalkan bisa dibersihkan.
--
-- Aman dijalankan ulang.

UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'tenant-assets';

-- Kebijakan unggah lama (izin untuk siapa saja yang sudah masuk, di folder mana pun)
DROP POLICY IF EXISTS "Allow authenticated users to upload assets" ON storage.objects;
DROP POLICY IF EXISTS "tenant_assets_insert_own_folder" ON storage.objects;
CREATE POLICY "tenant_assets_insert_own_folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'tenant-assets'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM public.tenants t
        WHERE t.id::text = (storage.foldername(name))[1]
          AND t.owner_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "tenant_assets_delete_own_folder" ON storage.objects;
CREATE POLICY "tenant_assets_delete_own_folder"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'tenant-assets'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM public.tenants t
        WHERE t.id::text = (storage.foldername(name))[1]
          AND t.owner_id = auth.uid()
      )
    )
  );
