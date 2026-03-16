-- ==========================================
-- STORAGE SCHEMA: BUCKETS & POLICIES
-- ==========================================

-- 1. Create Buckets (if they don't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('logbooks', 'logbooks', true),
  ('logos', 'logos', true),
  ('avatars', 'avatars', true),
  ('sertifikat', 'sertifikat', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Clear existing policies for these buckets to avoid conflicts
DELETE FROM storage.policies WHERE bucket_id IN ('logbooks', 'logos', 'avatars', 'sertifikat');

-- 3. Set Up SELECT Policy (Everyone can view files in these public buckets)
CREATE POLICY "Public View Access"
ON storage.objects FOR SELECT
USING ( bucket_id IN ('logbooks', 'logos', 'avatars', 'sertifikat') );

-- 4. Set Up INSERT Policy (Authenticated users can upload)
CREATE POLICY "Auth Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id IN ('logbooks', 'logos', 'avatars', 'sertifikat') );

-- 5. Set Up UPDATE/DELETE Policy (Users can manage files in these buckets)
CREATE POLICY "Auth Manage Access"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id IN ('logbooks', 'logos', 'avatars', 'sertifikat') );

CREATE POLICY "Auth Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id IN ('logbooks', 'logos', 'avatars', 'sertifikat') );

-- 6. Special Policy: Allow Anonymous Upload for 'logbooks' (Optional - safer if authenticated only)
-- Use this if you want to allow upload without checking session (easier during dev)
CREATE POLICY "Public Upload to Logbooks"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'logbooks' );
