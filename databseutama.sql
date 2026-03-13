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
  status TEXT DEFAULT 'aktif', -- 'aktif' (Ready), 'magang' (On-site), 'selesai', 'non-aktif'
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
  status TEXT DEFAULT 'menunggu', -- 'menunggu', 'aktif', 'selesai', 'dibatalkan'
  pilihan_ke INTEGER,
  nilai_akhir FLOAT,
  sertifikat_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 7.1 CONSTRAINT: CEGAH DOUBLE PLOT (Berdasarkan admin.md baris 73)
-- Satu siswa tidak boleh punya lebih dari satu penempatan 'aktif' atau 'menunggu'
-- =========================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_magang 
ON public.magang (siswa_id) 
WHERE status IN ('aktif', 'menunggu');

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

-- 13. FUNCTIONS & TRIGGERS
-- Function for auto-status sync (Sync profiles.status based on magang.status)
CREATE OR REPLACE FUNCTION sync_profile_status_from_magang()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        IF NEW.status = 'aktif' THEN
            UPDATE public.profiles SET status = 'magang' WHERE id = NEW.siswa_id;
        ELSIF NEW.status = 'selesai' THEN
            UPDATE public.profiles SET status = 'selesai' WHERE id = NEW.siswa_id;
        ELSIF NEW.status = 'dibatalkan' OR NEW.status = 'menunggu' THEN
            -- Kembalikan ke 'aktif' (Ready) jika dibatalkan atau masih menunggu
            UPDATE public.profiles SET status = 'aktif' WHERE id = NEW.siswa_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers Area
DROP TRIGGER IF EXISTS trg_sync_magang_to_profile ON magang;
CREATE TRIGGER trg_sync_magang_to_profile AFTER INSERT OR UPDATE ON magang FOR EACH ROW EXECUTE PROCEDURE sync_profile_status_from_magang();

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

-- =========================================================================
-- 14. RPC FUNCTIONS (Bypass Auth Limits & Management)
-- =========================================================================

-- 14.1 Create Siswa
CREATE OR REPLACE FUNCTION public.create_siswa_bypassing_auth(
  p_email text,
  p_password text,
  p_nama text,
  p_nis text,
  p_nohp text,
  p_kelas text,
  p_jurusan text,
  p_alamat text,
  p_dudi_id uuid,
  p_guru_id uuid,
  p_status text
) RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
  encrypted_pw text;
BEGIN
  encrypted_pw := crypt(p_password, gen_salt('bf'));
  new_user_id := gen_random_uuid();

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
    last_sign_in_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token,
    is_super_admin, is_sso_user, is_anonymous
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated', p_email, encrypted_pw, now(), 
    now(), '{"provider":"email","providers":["email"]}', 
    format('{"full_name":"%s","role":"SISWA"}', p_nama)::jsonb, 
    now(), now(), '', '', '', '',
    false, false, false
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), new_user_id, format('{"sub":"%s","email":"%s"}', new_user_id::text, p_email)::jsonb, 
    'email', new_user_id::text, now(), now(), now()
  );

  INSERT INTO public.profiles (
    id, full_name, email, role, nomor_induk, kelas, jurusan, no_telp, alamat, status
  ) VALUES (
    new_user_id, p_nama, p_email, 'SISWA', p_nis, p_kelas, p_jurusan, p_nohp, p_alamat, 'aktif'
  );

  IF p_dudi_id IS NOT NULL OR p_guru_id IS NOT NULL THEN
    INSERT INTO public.magang (siswa_id, dudi_id, guru_id, status) 
    VALUES (new_user_id, p_dudi_id, p_guru_id, p_status);
  END IF;

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 14.2 Create Guru
CREATE OR REPLACE FUNCTION public.create_guru_bypassing_auth(
  p_email text,
  p_password text,
  p_nama text,
  p_nip text,
  p_nohp text,
  p_mata_pelajaran text,
  p_alamat text,
  p_status text
) RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
  encrypted_pw text;
BEGIN
  encrypted_pw := crypt(p_password, gen_salt('bf'));
  new_user_id := gen_random_uuid();

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
    last_sign_in_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token,
    is_super_admin, is_sso_user, is_anonymous
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated', p_email, encrypted_pw, now(), 
    now(), '{"provider":"email","providers":["email"]}', 
    format('{"full_name":"%s","role":"GURU"}', p_nama)::jsonb, 
    now(), now(), '', '', '', '',
    false, false, false
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), new_user_id, format('{"sub":"%s","email":"%s"}', new_user_id::text, p_email)::jsonb, 
    'email', new_user_id::text, now(), now(), now()
  );

  INSERT INTO public.profiles (
    id, full_name, email, role, nomor_induk, jurusan, no_telp, alamat, status
  ) VALUES (
    new_user_id, p_nama, p_email, 'GURU', p_nip, p_mata_pelajaran, p_nohp, p_alamat, p_status
  );

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 14.3 Generic User Management (RPC)
CREATE OR REPLACE FUNCTION public.create_generic_user_bypassing_auth(
  p_email text, p_password text, p_nama text, p_role text, p_is_verified boolean
) RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
  confirmed_at timestamp with time zone;
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RAISE EXCEPTION 'Email % sudah terdaftar', p_email;
  END IF;

  new_user_id := gen_random_uuid();
  confirmed_at := CASE WHEN p_is_verified THEN now() ELSE NULL END;

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
    last_sign_in_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at, is_super_admin, is_sso_user, is_anonymous
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated', p_email, 
    crypt(p_password, gen_salt('bf')), confirmed_at, 
    now(), '{"provider":"email","providers":["email"]}', 
    format('{"full_name":"%s","role":"%s"}', p_nama, upper(p_role))::jsonb, 
    now(), now(), false, false, false
  );

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) 
  VALUES (gen_random_uuid(), new_user_id, format('{"sub":"%s","email":"%s"}', new_user_id::text, p_email)::jsonb, 'email', new_user_id::text, now(), now(), now());

  INSERT INTO public.profiles (id, full_name, email, role, status) VALUES (new_user_id, p_nama, p_email, upper(p_role)::user_role, 'aktif');

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION public.update_user_bypassing_auth(
  p_user_id uuid, p_email text, p_nama text, p_role text, p_is_verified boolean, p_password text DEFAULT NULL
) RETURNS boolean AS $$
BEGIN
  IF p_password IS NOT NULL AND p_password <> '' THEN
    UPDATE auth.users SET 
      email = p_email, 
      email_confirmed_at = CASE WHEN p_is_verified THEN now() ELSE NULL END,
      encrypted_password = crypt(p_password, gen_salt('bf')),
      raw_user_meta_data = raw_user_meta_data || format('{"full_name":"%s","role":"%s"}', p_nama, upper(p_role))::jsonb,
      updated_at = now()
    WHERE id = p_user_id;
  ELSE
    UPDATE auth.users SET 
      email = p_email, 
      email_confirmed_at = CASE WHEN p_is_verified THEN now() ELSE NULL END,
      raw_user_meta_data = raw_user_meta_data || format('{"full_name":"%s","role":"%s"}', p_nama, upper(p_role))::jsonb,
      updated_at = now()
    WHERE id = p_user_id;
  END IF;

  UPDATE auth.identities SET identity_data = identity_data || format('{"email":"%s"}', p_email)::jsonb, updated_at = now() 
  WHERE user_id = p_user_id AND provider = 'email';

  UPDATE public.profiles SET full_name = p_nama, email = p_email, role = upper(p_role)::user_role, updated_at = now() WHERE id = p_user_id;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION public.delete_user_bypassing_auth(p_user_id uuid) RETURNS boolean AS $$
BEGIN
  DELETE FROM auth.users WHERE id = p_user_id;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION public.get_all_users_admin()
RETURNS TABLE (id uuid, full_name text, email text, role text, is_verified boolean, created_at timestamp with time zone) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.full_name, p.email, p.role::text, (au.email_confirmed_at IS NOT NULL) AS is_verified, p.created_at
  FROM public.profiles p LEFT JOIN auth.users au ON au.id = p.id ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
