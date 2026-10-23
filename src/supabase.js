import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://ffwbxpqfzlkevxhijvtd.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_IN4OpUU6gNpnZINpifQSAg_DZuksmMD';

let isSupabaseQuotaExceeded = false;

export function checkQuota(error) {
  if (!error) return false;
  const msg = String(error.message || '');
  const status = error.status || error.code;
  if (status === 402 || msg.includes('exceed_egress_quota') || msg.includes('restricted')) {
    if (!isSupabaseQuotaExceeded) {
      isSupabaseQuotaExceeded = true;
      console.warn('[SUPABASE] Egress kvotasi tugagan (402). Tizim lokal ko\'prik va tunnel orqali uzluksiz ishlamoqda.');
    }
    return true;
  }
  return false;
}

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
  if (isSupabaseQuotaExceeded) return { connected: false, error: 'Quota exceeded', schoolDataReady: false };
  try {
    const { error: camError } = await supabase.from('camera_settings').select('id').limit(1);
    if (camError) {
      checkQuota(camError);
      return { connected: false, error: camError.message, schoolDataReady: false };
    }

    const { data: sData, error: sError } = await supabase.from('school_data').select('key').limit(10);
    if (sError) {
      checkQuota(sError);
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
    checkQuota(e);
    return { connected: false, error: e.message, schoolDataReady: false };
  }
}

/**
 * Supabase dan barcha maktab ma'lumotlarini yuklab olish
 */
export async function loadAllSchoolDataFromSupabase() {
  if (isSupabaseQuotaExceeded) return null;
  try {
    const { data, error } = await supabase
      .from('school_data')
      .select('*');

    if (error) {
      if (!checkQuota(error)) {
        console.warn('[SUPABASE] school_data o\'qishda xatolik:', error.message);
      }
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
    if (!checkQuota(err)) {
      console.error('[SUPABASE] Tarmoq xatosi:', err);
    }
    return null;
  }
}

/**
 * Supabase ga aniq bir modulni (masalan: students, classes, attendanceList) saqlash
 */
export async function saveModuleToSupabase(key, data) {
  if (isSupabaseQuotaExceeded) return false;
  try {
    const { error } = await supabase
      .from('school_data')
      .upsert({
        key,
        data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (error) {
      if (!checkQuota(error)) {
        console.warn(`[SUPABASE] ${key} saqlashda xatolik:`, error.message);
      }
      return false;
    }
    return true;
  } catch (err) {
    if (!checkQuota(err)) {
      console.warn(`[SUPABASE] ${key} saqlashda tarmoq xatosi:`, err);
    }
    return false;
  }
}

/**
 * Supabase dan maktab lokal serverining oxirgi faollik (heartbeat) holatini olish
 */
export async function getLocalStatusFromSupabase() {
  if (isSupabaseQuotaExceeded) return null;
  try {
    const { data, error } = await supabase
      .from('school_data')
      .select('data, updated_at')
      .eq('key', 'local_status')
      .maybeSingle();

    if (error) {
      checkQuota(error);
      return null;
    }
    if (!data || !data.data) return null;
    return data.data;
  } catch (e) {
    checkQuota(e);
    return null;
  }
}

/**
 * Supabase dan kameralar sozlamasini yuklab olish
 */
export async function loadCamerasFromSupabase() {
  if (isSupabaseQuotaExceeded) return null;
  try {
    const { data, error } = await supabase
      .from('camera_settings')
      .select('*');

    if (error) {
      checkQuota(error);
      return null;
    }
    if (!data || data.length === 0) return null;
    return data;
  } catch (err) {
    checkQuota(err);
    return null;
  }
}

/**
 * Supabase ga kameralar sozlamasini saqlash
 */
export async function saveCamerasToSupabase(cameras) {
  if (isSupabaseQuotaExceeded) return false;
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
      if (!checkQuota(error)) {
        console.warn('[SUPABASE] Kameralarni saqlashda xatolik:', error.message);
      }
      return false;
    }
    return true;
  } catch (err) {
    if (!checkQuota(err)) {
      console.warn('[SUPABASE] Kameralar tarmoq xatosi:', err);
    }
    return false;
  }
}

/**
 * Face skanini Supabase face_scans jadvaliga kiritish
 */
export async function insertFaceScanToSupabase(scan) {
  if (isSupabaseQuotaExceeded) return false;
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
      checkQuota(error);
      return false;
    }
    return true;
  } catch (e) {
    checkQuota(e);
    return false;
  }
}

/**
 * Bugungi Face-ID o'tishlarini Supabase dan yuklab olish
 */
export async function loadTodayFaceScansFromSupabase(dateStr) {
  if (isSupabaseQuotaExceeded) return [];
  try {
    const today = dateStr || new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('face_scans')
      .select('*')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59.999`)
      .order('id', { ascending: false })
      .limit(2000);

    if (error) {
      checkQuota(error);
      return [];
    }
    if (!data) return [];
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
    checkQuota(e);
    return [];
  }
}

/**
 * 6 ta kameraning oxirgi bulut kadrlarini Supabase dan olish
 */
export async function getLatestCameraFramesFromSupabase() {
  if (isSupabaseQuotaExceeded) return {};
  try {
    const { data, error } = await supabase
      .from('school_data')
      .select('data')
      .eq('key', 'camera_latest_frames')
      .maybeSingle();

    if (error) {
      checkQuota(error);
      return {};
    }
    if (!data || !data.data) return {};
    return data.data;
  } catch (e) {
    checkQuota(e);
    return {};
  }
}

/**
 * Lokal profil faolligini (Heartbeat) Supabase ga saqlash
 */
export async function sendLocalHeartbeatToSupabase(info = {}) {
  try {
    const payload = {
      online: true,
      timestamp: Date.now(),
      last_heartbeat: new Date().toISOString(),
      bridged_by: info.bridgedBy || 'Lokal Maktab Profili',
      role: info.role || 'device',
      total_cameras: info.totalCameras || 6,
      cameras_online: info.camerasOnline || 6,
      message: "Maktab lokal tarmog'i va profili orqali jonli bog'langan"
    };
    return await saveModuleToSupabase('local_status', payload);
  } catch (e) {
    return false;
  }
}

/**
 * 6 ta kamera kadrlarini Supabase ga saqlash
 */
export async function saveLatestCameraFramesToSupabase(frames) {
  try {
    if (!frames || typeof frames !== 'object' || Object.keys(frames).length === 0) return false;
    return await saveModuleToSupabase('camera_latest_frames', frames);
  } catch (e) {
    return false;
  }
}

