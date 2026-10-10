import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://ffwbxpqfzlkevxhijvtd.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_IN4OpUU6gNpnZINpifQSAg_DZuksmMD';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

/**
 * Supabase ulanish holatini tekshirish
 */
export async function checkSupabaseConnection() {
  try {
    const { error: camError } = await supabase.from('camera_settings').select('id').limit(1);
    if (camError) {
      return { connected: false, error: camError.message, schoolDataReady: false };
    }

    const { data: sData, error: sError } = await supabase.from('school_data').select('key').limit(10);
    if (sError) {
      return { 
        connected: true, 
        schoolDataReady: false, 
        error: sError.message 
      };
    }

    return { 
      connected: true, 
      schoolDataReady: true, 
      keysCount: sData?.length || 0 
    };
  } catch (e) {
    return { connected: false, error: e.message, schoolDataReady: false };
  }
}

/**
 * Supabase dan barcha maktab ma'lumotlarini yuklab olish
 */
export async function loadAllSchoolDataFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('school_data')
      .select('*');

    if (error) {
      console.warn('[SUPABASE] school_data o\'qishda xatolik:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const result = {};
    for (const row of data) {
      result[row.key] = row.data;
    }
    return result;
  } catch (err) {
    console.error('[SUPABASE] Tarmoq xatosi:', err);
    return null;
  }
}

/**
 * Supabase ga aniq bir modulni (masalan: students, classes, attendanceList) saqlash
 */
export async function saveModuleToSupabase(key, data) {
  try {
    const { error } = await supabase
      .from('school_data')
      .upsert({
        key,
        data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (error) {
      console.warn(`[SUPABASE] ${key} saqlashda xatolik:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[SUPABASE] ${key} saqlashda tarmoq xatosi:`, err);
    return false;
  }
}

/**
 * Supabase dan maktab lokal serverining oxirgi faollik (heartbeat) holatini olish
 */
export async function getLocalStatusFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('school_data')
      .select('data, updated_at')
      .eq('key', 'local_status')
      .maybeSingle();

    if (error || !data || !data.data) return null;
    return data.data;
  } catch (e) {
    return null;
  }
}

/**
 * Supabase dan kameralar sozlamasini yuklab olish
 */
export async function loadCamerasFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('camera_settings')
      .select('*');

    if (error || !data || data.length === 0) return null;
    return data;
  } catch (err) {
    return null;
  }
}

/**
 * Supabase ga kameralar sozlamasini saqlash
 */
export async function saveCamerasToSupabase(cameras) {
  try {
    const rows = cameras.map((c, idx) => ({
      id: c.id,
      name: c.name,
      ip: c.ip,
      type: c.type,
      location: c.location || '',
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('camera_settings')
      .upsert(rows, { onConflict: 'id' });

    // school_data ga ham uning aynan tartibi bilan saqlab qo'yamiz
    await saveModuleToSupabase('cameras', cameras);

    if (error) {
      console.warn('[SUPABASE] Kameralarni saqlashda xatolik:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[SUPABASE] Kameralar tarmoq xatosi:', err);
    return false;
  }
}

/**
 * Face skanini Supabase face_scans jadvaliga kiritish
 */
export async function insertFaceScanToSupabase(scan) {
  try {
    const { error } = await supabase
      .from('face_scans')
      .insert([{
        employee_no: scan.employeeNo || '',
        name: scan.name || '',
        camera_name: scan.cameraName || '',
        camera_ip: scan.cameraIp || '',
        direction: scan.direction || 'in',
        time_formatted: scan.timeFormatted || '',
        created_at: new Date().toISOString()
      }]);

    if (error) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Bugungi Face-ID o'tishlarini Supabase dan yuklab olish
 */
export async function loadTodayFaceScansFromSupabase(dateStr) {
  try {
    const today = dateStr || new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('face_scans')
      .select('*')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59.999`)
      .order('id', { ascending: false })
      .limit(2000);

    if (error || !data) return [];
    return data.map(row => ({
      id: `scan-cloud-${row.id}`,
      employeeNo: row.employee_no,
      name: row.name,
      cameraName: row.camera_name,
      cameraIp: row.camera_ip,
      direction: row.direction,
      timeFormatted: row.time_formatted,
      timestamp: row.created_at,
      serialNo: row.id
    }));
  } catch (e) {
    return [];
  }
}
