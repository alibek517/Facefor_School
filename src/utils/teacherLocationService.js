// O'qituvchilar GPS Lokatsiyasi Xizmati (10:00 - 18:00 Nazorati & Oflayn Kesh)

export const SCHOOL_DEFAULT_COORDS = {
  lat: 41.5515,
  lng: 60.6315,
  radiusMeters: 180, // Maktab hududi radiusi (metrda)
  name: "24-sonli umumiy o'rta ta'lim maktabi"
};

export const OFFLINE_LOCATION_STORAGE_KEY = 'offline_teacher_location_queue';

// Haversine formulasi orqali ikki koordinata orasidagi aniq masofani hisoblash (metrda)
export function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371e3; // Yer radiusi (metr)
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// O'qituvchi maktab hududi (binosi) ichidami yoki tashqarisidami?
export function isInsideSchoolZone(lat, lon, schoolCoords = SCHOOL_DEFAULT_COORDS) {
  const target = schoolCoords || SCHOOL_DEFAULT_COORDS;
  const dist = getDistanceInMeters(lat, lon, target.lat, target.lng);
  const radius = target.radiusMeters || 180;
  return {
    isInside: dist <= radius,
    distanceMeters: dist,
    radiusMeters: radius
  };
}

// 10:00 dan 18:00 gacha bo'lgan vaqt oralig'ini tekshirish
export function isTrackingTimeActive(dateObj = new Date()) {
  const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
  const hours = d.getHours();
  // 10:00 dan 18:00:00 gacha (10, 11, 12, 13, 14, 15, 16, 17-soatlar)
  return hours >= 10 && hours < 18;
}

// Oflayn holatda ma'lumotlarni daqiqasigacha LocalStorage'ga saqlash
export function saveLocationPingLocally(ping) {
  if (!ping) return false;
  try {
    const raw = localStorage.getItem(OFFLINE_LOCATION_STORAGE_KEY);
    const queue = raw ? JSON.parse(raw) : [];
    queue.push({
      ...ping,
      offlineRecordedAt: new Date().toISOString()
    });
    localStorage.setItem(OFFLINE_LOCATION_STORAGE_KEY, JSON.stringify(queue));
    return true;
  } catch (e) {
    console.error('LocalStorage ga saqlashda xatolik:', e);
    return false;
  }
}

// LocalStorage'dagi oflayn navbatni o'qish
export function getLocalOfflineQueue() {
  try {
    const raw = localStorage.getItem(OFFLINE_LOCATION_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

// LocalStorage'dagi oflayn navbatni tozalash (Supabase ga muvaffaqiyatli yuborilgandan keyin)
export function clearLocalOfflineQueue() {
  try {
    localStorage.removeItem(OFFLINE_LOCATION_STORAGE_KEY);
    return true;
  } catch (e) {
    return false;
  }
}

// Sanani formatlash (YYYY-MM-DD)
export function formatDateYMD(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Vaqtni formatlash (HH:mm:ss)
export function formatTimeHMS(d = new Date()) {
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// Barcha o'qituvchilar uchun 10:00 - 18:00 oralig'ida daqiqama-daqiqa (har 15-30 daqiqa yoki 5 daqiqa)
// realistik harakatlanish tarixi (breadcrumbs) ni yaratish
export function generateRealisticDayHistory(teachers = [], schoolCoords = SCHOOL_DEFAULT_COORDS, dateStr = formatDateYMD()) {
  const points = [];
  const baseLat = schoolCoords.lat || 41.5515;
  const baseLng = schoolCoords.lng || 60.6315;

  (teachers || []).forEach((t, tIdx) => {
    // Har bir o'qituvchining o'ziga xos harakat trayektoriyasi
    // Masalan, 10:00 da maktabda, 13:00 da tushlikka yaqin kafelarga chiqadi, 14:00 da qaytib keladi, 17:30 da chiqadi
    const isOutForLunch = (tIdx % 3 === 0);
    const isLateComer = (tIdx % 5 === 0);

    // 10:00 dan 18:00 gacha har 15 daqiqada bitta qadam
    for (let h = 10; h <= 17; h++) {
      for (let m = 0; m < 60; m += 15) {
        const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
        const timestamp = `${dateStr}T${timeStr}.000Z`;

        let offsetLat = (Math.sin(h * 3 + tIdx) * 0.0003);
        let offsetLng = (Math.cos(m * 2 + tIdx) * 0.0003);

        // Tushlik vaqti (13:00 - 13:45) tashqariga chiqishi
        if (isOutForLunch && h === 13 && m < 45) {
          offsetLat += 0.0028 + (tIdx * 0.0004); // ~350 metr uzoqda
          offsetLng += 0.0025 + (tIdx * 0.0004);
        } else if (isLateComer && h === 10 && m < 30) {
          // Kechikib kelayotgan (10:00 - 10:30 yo'lda)
          offsetLat += 0.0040 - (m * 0.0001);
          offsetLng += 0.0035 - (m * 0.0001);
        }

        const lat = +(baseLat + offsetLat).toFixed(6);
        const lng = +(baseLng + offsetLng).toFixed(6);

        const distInfo = isInsideSchoolZone(lat, lng, schoolCoords);

        points.push({
          id: `loc_${t.id}_${h}_${m}`,
          teacherId: t.id,
          teacherName: t.fullName || t.name,
          subject: t.subject || "Ta'lim",
          date: dateStr,
          time: timeStr,
          timestamp,
          latitude: lat,
          longitude: lng,
          accuracy: +(10 + (tIdx % 5) * 2).toFixed(1),
          speed: distInfo.isInside ? 0 : 1.2,
          isInsideSchool: distInfo.isInside,
          distanceMeters: distInfo.distanceMeters,
          status: distInfo.isInside ? 'inside' : 'outside',
          battery: Math.max(30, 95 - (h - 10) * 8),
          source: 'gps'
        });
      }
    }
  });

  return points;
}
