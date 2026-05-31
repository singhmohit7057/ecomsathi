-- ============================================================
-- Migration 005: Storage Buckets & Policies
-- EcomSathi — file storage configuration
-- ============================================================

-- ------------------------------------------------------------
-- Create storage buckets
-- ------------------------------------------------------------
-- uploads  : general-purpose bucket used by free tools (anon + auth)
-- pdf      : PDF-only bucket for documents, invoices, labels
-- images   : product and listing images
-- videos   : product demo videos
-- labels   : shipping / barcode labels (PDF or image)
-- exports  : generated exports (CSV, XLSX, etc.) — no MIME restriction
-- ------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'uploads',
    'uploads',
    false,
    52428800,   -- 50 MiB
    ARRAY['application/pdf','image/jpeg','image/png','image/webp','image/gif']
  ),
  (
    'pdf',
    'pdf',
    false,
    52428800,   -- 50 MiB
    ARRAY['application/pdf']
  ),
  (
    'images',
    'images',
    false,
    20971520,   -- 20 MiB
    ARRAY['image/jpeg','image/png','image/webp','image/gif','image/bmp']
  ),
  (
    'videos',
    'videos',
    false,
    524288000,  -- 500 MiB
    ARRAY['video/mp4','video/quicktime','video/x-msvideo','video/webm','video/x-matroska']
  ),
  (
    'labels',
    'labels',
    false,
    52428800,   -- 50 MiB
    ARRAY['application/pdf','image/jpeg','image/png']
  ),
  (
    'exports',
    'exports',
    false,
    52428800,   -- 50 MiB
    NULL        -- no MIME restriction; any export format is allowed
  )
ON CONFLICT (id) DO UPDATE SET
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================
-- Storage RLS Policies
-- ============================================================
-- Folder convention:  <bucket>/<user_uuid>/...
-- The first path segment is always the owner's auth.uid().
-- ============================================================

-- ------------------------------------------------------------
-- INSERT: authenticated users upload to their own folder only
-- ------------------------------------------------------------
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('uploads', 'pdf', 'images', 'videos', 'labels', 'exports')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ------------------------------------------------------------
-- INSERT: anonymous users may upload to the 'uploads' bucket
--         (supports free/guest tools that don't require sign-in)
-- ------------------------------------------------------------
CREATE POLICY "Anonymous can upload to uploads"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'uploads');

-- ------------------------------------------------------------
-- ALL: service role bypasses RLS (used by edge functions)
-- ------------------------------------------------------------
CREATE POLICY "Service role full access"
ON storage.objects
TO service_role
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------
-- SELECT: authenticated users read only their own files
-- ------------------------------------------------------------
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id IN ('uploads', 'pdf', 'images', 'videos', 'labels', 'exports')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ------------------------------------------------------------
-- DELETE: authenticated users delete only their own files
-- ------------------------------------------------------------
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id IN ('uploads', 'pdf', 'images', 'videos', 'labels', 'exports')
  AND (storage.foldername(name))[1] = auth.uid()::text
);
