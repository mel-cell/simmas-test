-- ==========================================
-- STRUKTUR DATABASE SIMMAS (NEW CLEAN VERSION)
-- ==========================================

-- 1. Extensions & Enums
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'GURU', 'SISWA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Function: Auto-Update Timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Table: SEKOLAH_SETTINGS
CREATE TABLE IF NOT EXISTS sekolah_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  npsn TEXT,
  nama_sekolah TEXT,
  alamat_sekolah TEXT,
  telepon TEXT,
  email TEXT,
  website TEXT,
  kepala_sekolah TEXT,
  nip_kepala_sekolah TEXT,
  logo_url TEXT,
  header_surat_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table: PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'SISWA',
  nomor_induk TEXT UNIQUE,
  kelas TEXT,
  jurusan TEXT,
  no_telp TEXT,
  alamat TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'aktif',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 5. Table: DUDI
CREATE TABLE IF NOT EXISTS dudi (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nama_perusahaan TEXT NOT NULL,
  alamat TEXT NOT NULL,
  penanggung_jawab TEXT NOT NULL,
  email TEXT,
  no_telp TEXT,
  kuota_maksimal INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Table: MAGANG
CREATE TABLE IF NOT EXISTS magang (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  siswa_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  guru_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  dudi_id UUID REFERENCES dudi(id) ON DELETE CASCADE,
  tgl_mulai DATE,
  tgl_selesai DATE,
  status TEXT DEFAULT 'menunggu',
  pilihan_ke INTEGER,
  nilai_akhir FLOAT,
  sertifikat_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Table: LOGBOOKS
CREATE TABLE IF NOT EXISTS logbooks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  magang_id UUID REFERENCES magang(id) ON DELETE CASCADE,
  tanggal DATE DEFAULT CURRENT_DATE,
  jam_input TIMESTAMPTZ DEFAULT NOW(),
  kegiatan TEXT NOT NULL,
  kendala TEXT,
  gambar_url TEXT,
  status TEXT DEFAULT 'pending',
  catatan_guru TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Table: ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id),
  target_role user_role,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Table: ACTIVITY_LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. DISABLE RLS (KEAMANAN SEDERHANA, ANTI ERROR)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE magang DISABLE ROW LEVEL SECURITY;
ALTER TABLE logbooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE dudi DISABLE ROW LEVEL SECURITY;
ALTER TABLE sekolah_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

-- 11. INSERT DATA AWAL (SEEDING) 
INSERT INTO public.sekolah_settings (id, npsn, nama_sekolah, alamat_sekolah, telepon, email, website, kepala_sekolah, nip_kepala_sekolah)
VALUES (1, '20532456', 'SMK Negeri 1 Surabaya', 'Jl. SMEA No.4, Wonokromo, Kec. Wonokromo, Kota SBY, Jawa Timur 60243', '(031) 8292038', 'info@smkn1-sby.sch.id', 'https://smkn1-sby.sch.id', 'Dr. Bambang Gatot Prabowo, M.Pd.', '197001011995011001')
ON CONFLICT (id) DO UPDATE SET 
  nama_sekolah = EXCLUDED.nama_sekolah,
  alamat_sekolah = EXCLUDED.alamat_sekolah;

INSERT INTO public.dudi (nama_perusahaan, alamat, penanggung_jawab, email, no_telp, kuota_maksimal)
VALUES 
  ('PT. Teknologi Nusantara', 'Jl. Jend. Sudirman No. 12, Jakarta', 'Budi Setiawan', 'hrd@teknus.com', '021-5551234', 5),
  ('CV. Digital Kreativa', 'Jl. Diponegoro No. 45, Surabaya', 'Siti Aminah', 'contact@kreativa.id', '031-777888', 3),
  ('Sentra Solusi IT', 'Komp. Perkantoran Hijau Blok A, Bandung', 'Andi Wijaya', 'admin@sentrasolusi.com', '022-999333', 4)
ON CONFLICT DO NOTHING;

-- 12. BIKIN AKUN ADMIN DENGAN CARA AMAN (TANPA TRIGGER)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  new_admin_id UUID := gen_random_uuid();
BEGIN
  -- Tambahkan akun ke tabel Auth
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@gmail.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', 
      new_admin_id, 
      'authenticated', 'authenticated', 
      'admin@gmail.com', 
      crypt('password123', gen_salt('bf')), 
      NOW(), 
      '{"provider":"email","providers":["email"]}', 
      '{"full_name":"Admin Pro","role":"ADMIN"}', 
      false, NOW(), NOW()
    );

    -- Tambahkan manual ke tabel Profiles (Tanpa bergantung sama Trigger otomatis yang sering error)
    INSERT INTO public.profiles (id, full_name, email, role, nomor_induk)
    VALUES (new_admin_id, 'Admin Pro', 'admin@gmail.com', 'ADMIN', 'ADM001');
  END IF;
END $$;
