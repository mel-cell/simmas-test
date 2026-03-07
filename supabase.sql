-- ==========================================
-- STRUKTUR DATABASE SIMMAS (FINAL - READY TO DEPLOY)
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

-- 10. Triggers for modified columns
DROP TRIGGER IF EXISTS update_profiles_modtime ON profiles;
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_dudi_modtime ON dudi;
CREATE TRIGGER update_dudi_modtime BEFORE UPDATE ON dudi FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_magang_modtime ON magang;
CREATE TRIGGER update_magang_modtime BEFORE UPDATE ON magang FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_logbooks_modtime ON logbooks;
CREATE TRIGGER update_logbooks_modtime BEFORE UPDATE ON logbooks FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- 11. Security (RLS) - AKTIFKAN SEMUA
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE magang ENABLE ROW LEVEL SECURITY;
ALTER TABLE logbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE dudi ENABLE ROW LEVEL SECURITY;
ALTER TABLE sekolah_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Kebijakan Keamanan)

-- Profiles: Pemilik bisa lihat sendiri, Admin bisa semua
DROP POLICY IF EXISTS "View own profile" ON profiles;
CREATE POLICY "View own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin access all profiles" ON profiles;
CREATE POLICY "Admin access all profiles" ON profiles FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN');

-- Announcements: Semua yang sudah login bisa baca
DROP POLICY IF EXISTS "Anyone logged in can view announcements" ON announcements;
CREATE POLICY "Anyone logged in can view announcements" ON announcements FOR SELECT USING (auth.role() = 'authenticated');

-- DUDI: Semua yang login bisa lihat daftar DUDI
DROP POLICY IF EXISTS "Anyone logged in can view dudi" ON dudi;
CREATE POLICY "Anyone logged in can view dudi" ON dudi FOR SELECT USING (auth.role() = 'authenticated');

-- Sekolah Settings: Semua yang login bisa lihat info sekolah
DROP POLICY IF EXISTS "Anyone logged in can view school settings" ON sekolah_settings;
CREATE POLICY "Anyone logged in can view school settings" ON sekolah_settings FOR SELECT USING (auth.role() = 'authenticated');

-- Activity Logs: Hanya Admin yang bisa lihat
DROP POLICY IF EXISTS "Only admin can view activity logs" ON activity_logs;
CREATE POLICY "Only admin can view activity logs" ON activity_logs FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN');

-- 12. Trigger: Auto-Sync User from Auth to Public Profiles
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, (new.raw_user_meta_data->>'role')::user_role);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

