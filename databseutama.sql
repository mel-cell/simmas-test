-- ==========================================
-- CETAK BIRU DATABASE SIMMAS (FULL MASTER BLUEPRINT)
-- ==========================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Enums
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('ADMIN', 'GURU', 'SISWA');
    END IF;
END $$;

-- 3. Function: Auto-Update Timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Table: SEKOLAH_SETTINGS
CREATE TABLE IF NOT EXISTS sekolah_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  npsn TEXT,
  nama_sekolah TEXT DEFAULT 'SMK Negeri 6 Malang',
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

-- 5. Table: PROFILES
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

-- 6. Table: DUDI
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

-- 7. Table: MAGANG
CREATE TABLE IF NOT EXISTS magang (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  siswa_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  guru_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  dudi_id UUID REFERENCES public.dudi(id) ON DELETE CASCADE,
  tgl_mulai DATE,
  tgl_selesai DATE,
  status TEXT DEFAULT 'menunggu',
  pilihan_ke INTEGER,
  nilai_akhir FLOAT,
  sertifikat_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Table: LOGBOOKS
CREATE TABLE IF NOT EXISTS logbooks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  magang_id UUID REFERENCES public.magang(id) ON DELETE CASCADE,
  tanggal DATE DEFAULT CURRENT_DATE,
  jam_input TIMESTAMPTZ DEFAULT NOW(),
  kegiatan TEXT NOT NULL,
  kendala TEXT,
  gambar_url TEXT,
  status TEXT DEFAULT 'pending',
  catatan_guru TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Table: ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id),
  target_role user_role,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Table: ACTIVITY_LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. SECURITY: DISABLE RLS (UNTUK DEVELOPMENT)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.magang DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.logbooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dudi DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sekolah_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;

-- 12. INITIAL DATA SEEDING (SEKOLAH & DUDI)
INSERT INTO public.sekolah_settings (id, nama_sekolah) VALUES (1, 'SMK Negeri 6 Malang') ON CONFLICT (id) DO UPDATE SET nama_sekolah = EXCLUDED.nama_sekolah;

INSERT INTO public.dudi (nama_perusahaan, alamat, penanggung_jawab, email, no_telp, kuota_maksimal)
VALUES 
  ('PT. Teknologi Nusantara', 'Jl. Jend. Sudirman No. 12, Jakarta', 'Budi Setiawan', 'hrd@teknus.com', '021-5551234', 5),
  ('CV. Digital Kreativa', 'Jl. Diponegoro No. 45, Surabaya', 'Siti Aminah', 'contact@kreativa.id', '031-777888', 3),
  ('Sentra Solusi IT', 'Komp. Perkantoran Hijau Blok A, Bandung', 'Andi Wijaya', 'admin@sentrasolusi.com', '022-999333', 4)
ON CONFLICT DO NOTHING;

-- 13. TRIGGERS (MANUAL ONLY)
-- Trigger untuk auto-update "updated_at"
DROP TRIGGER IF EXISTS update_sekolah_settings_modtime ON sekolah_settings;
CREATE TRIGGER update_sekolah_settings_modtime BEFORE UPDATE ON sekolah_settings FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_profiles_modtime ON profiles;
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_dudi_modtime ON dudi;
CREATE TRIGGER update_dudi_modtime BEFORE UPDATE ON dudi FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_magang_modtime ON magang;
CREATE TRIGGER update_magang_modtime BEFORE UPDATE ON magang FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_logbooks_modtime ON logbooks;
CREATE TRIGGER update_logbooks_modtime BEFORE UPDATE ON logbooks FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_announcements_modtime ON announcements;
CREATE TRIGGER update_announcements_modtime BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- CLEANUP (Remove Automatic Triggers if they exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_siswa_bypassing_auth();
