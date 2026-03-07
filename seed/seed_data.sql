-- ==========================================
-- SEED DATA SIMMAS (LENGKAP)
-- ==========================================

-- 1. Sekolah Settings
INSERT INTO public.sekolah_settings (id, npsn, nama_sekolah, alamat_sekolah, telepon, email, website, kepala_sekolah, nip_kepala_sekolah)
VALUES (1, '20532456', 'SMK Negeri 1 Surabaya', 'Jl. SMEA No.4, Wonokromo, Kec. Wonokromo, Kota SBY, Jawa Timur 60243', '(031) 8292038', 'info@smkn1-sby.sch.id', 'https://smkn1-sby.sch.id', 'Dr. Bambang Gatot Prabowo, M.Pd.', '197001011995011001')
ON CONFLICT (id) DO UPDATE SET 
  nama_sekolah = EXCLUDED.nama_sekolah,
  alamat_sekolah = EXCLUDED.alamat_sekolah;

-- 2. DUDI Partner
INSERT INTO public.dudi (nama_perusahaan, alamat, penanggung_jawab, email, no_telp, kuota_maksimal)
VALUES 
  ('PT. Teknologi Nusantara', 'Jl. Jend. Sudirman No. 12, Jakarta', 'Budi Setiawan', 'hrd@teknus.com', '021-5551234', 5),
  ('CV. Digital Kreativa', 'Jl. Diponegoro No. 45, Surabaya', 'Siti Aminah', 'contact@kreativa.id', '031-777888', 3),
  ('Sentra Solusi IT', 'Komp. Perkantoran Hijau Blok A, Bandung', 'Andi Wijaya', 'admin@sentrasolusi.com', '022-999333', 4)
ON CONFLICT DO NOTHING;

-- 3. Announcements
INSERT INTO public.announcements (title, content, target_role, is_pinned)
VALUES 
  ('Pembukaan Pendaftaran Magang', 'Pendaftaran magang akan dibuka pada tanggal 1 April 2024.', 'SISWA', true),
  ('Sosialisasi Laporan', 'Sosialisasi laporan mingguan akan diadakan via Zoom.', 'GURU', false)
ON CONFLICT DO NOTHING;

-- ==========================================
-- NOTE: UNTUK USER AUTH, SEBAIKNYA MENGGUNAKAN DASHBOARD SUPABASE 
-- ATAU SIGN UP MANUAL KARENA PASSWORD HASHING SQL SANGAT SPESIFIK.
-- TAPI JIKA INGIN PAKAI SQL, GUNAKAN CONTOH BERIKUT:
-- ==========================================

/* 
-- CONTOH INSERT AUTH USER (GANTI UUID DAN EMAIL):
-- UUID DAPAT DI-GENERATE SENDIRI
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
VALUES (
  '00000000-0000-0000-0000-000000000001', 
  '00000000-0000-0000-0000-000000000000', 
  'admin@gmail.com', 
  extensions.pgcrypto.crypt('password123', extensions.pgcrypto.gen_salt('bf')), 
  NOW(), 
  '{"provider":"email","providers":["email"]}', 
  '{"full_name":"Admin Pro","role":"ADMIN"}', 
  false, 
  'authenticated'
);
*/
