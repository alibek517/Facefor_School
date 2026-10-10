-- ==============================================================
-- MAKTAB CRM: SUPABASE TO'LIQ GLOBAL BAZASI UCHUN SQL SKRIPT
-- Bu skriptni Supabase SQL Editor bo'limida 1 marta Run qiling!
-- ==============================================================

-- 1. Asosiy maktab ma'lumotlari (O'quvchilar, Sinflar, O'qituvchilar, Davomat)
CREATE TABLE IF NOT EXISTS school_data (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Turniket Kameralari sozlamalari (3 Kirish, 3 Chiqish)
CREATE TABLE IF NOT EXISTS camera_settings (
  id TEXT PRIMARY KEY,
  name TEXT,
  ip TEXT,
  type TEXT,
  location TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Jonli Face-ID va Turniket o'tishlari logi (Realtime qaydlar)
CREATE TABLE IF NOT EXISTS face_scans (
  id BIGSERIAL PRIMARY KEY,
  employee_no TEXT,
  name TEXT,
  camera_name TEXT,
  camera_ip TEXT,
  direction TEXT,
  time_formatted TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Barcha jadvallarga to'liq ruxsat (RLS - Row Level Security)
ALTER TABLE school_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all on school_data" ON school_data;
CREATE POLICY "Allow public all on school_data" ON school_data FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE camera_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all on camera_settings" ON camera_settings;
DROP POLICY IF EXISTS "Allow public all" ON camera_settings;
CREATE POLICY "Allow public all on camera_settings" ON camera_settings FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE face_scans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all on face_scans" ON face_scans;
CREATE POLICY "Allow public all on face_scans" ON face_scans FOR ALL USING (true) WITH CHECK (true);

-- 5. Real-Time (Jonli sinxronizatsiya) barcha kompyuterlar uchun
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'school_data'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE school_data;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'camera_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE camera_settings;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'face_scans'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE face_scans;
  END IF;
END $$;
