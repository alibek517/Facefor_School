import React, { useState, useEffect, useRef } from 'react';
import { useSchool } from '../context/SchoolContext';
import { 
  MapPin, 
  Clock, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { 
  SCHOOL_DEFAULT_COORDS, 
  isInsideSchoolZone, 
  isTrackingTimeActive, 
  saveLocationPingLocally, 
  getLocalOfflineQueue, 
  clearLocalOfflineQueue, 
  formatDateYMD, 
  formatTimeHMS 
} from '../utils/teacherLocationService';

export const TeacherGPSWatcherBar = () => {
  const { 
    currentUser, 
    showToast, 
    saveModuleToSupabase, 
    schools = [], 
    selectedSchoolId 
  } = useSchool();

  const currentSchool = (schools || []).find(s => s.id === selectedSchoolId) || (schools || [])[0];
  const schoolCoords = {
    lat: Number(currentSchool?.lat) || SCHOOL_DEFAULT_COORDS.lat || 41.5515,
    lng: Number(currentSchool?.lng) || SCHOOL_DEFAULT_COORDS.lng || 60.6315,
    radiusMeters: Number(currentSchool?.radiusMeters || currentSchool?.radius) || SCHOOL_DEFAULT_COORDS.radiusMeters || 180,
    name: currentSchool?.name || SCHOOL_DEFAULT_COORDS.name
  };

  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [offlineCount, setOfflineCount] = useState(() => getLocalOfflineQueue().length);
  const [lastPingTime, setLastPingTime] = useState(null);
  const [currentDistance, setCurrentDistance] = useState(null);
  const [isInside, setIsInside] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  const isTrackingHour = isTrackingTimeActive();

  // Bitta lokatsiya pingini olish va yuborish/saqlash
  const captureAndSendLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation qo\'llab-quvvatlanmaydi');
      return;
    }

    setIsUpdating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setGpsError(null);
        const { latitude, longitude, accuracy } = pos.coords;
        const now = new Date();
        const distInfo = isInsideSchoolZone(latitude, longitude, schoolCoords);
        const timeNow = formatTimeHMS(now);
        const dateToday = formatDateYMD(now);

        setCurrentDistance(distInfo.distanceMeters);
        setIsInside(distInfo.isInside);
        setLastPingTime(timeNow);

        const ping = {
          id: `loc_${currentUser?.teacherId || currentUser?.id || 't'}_${Date.now()}`,
          teacherId: currentUser?.teacherId || currentUser?.id || 't-me',
          teacherName: currentUser?.name || "O'qituvchi",
          subject: currentUser?.detail || currentUser?.subject || "Ta'lim",
          date: dateToday,
          time: timeNow,
          timestamp: now.toISOString(),
          latitude: +latitude.toFixed(6),
          longitude: +longitude.toFixed(6),
          accuracy: Math.round(accuracy),
          speed: pos.coords.speed || 0,
          isInsideSchool: distInfo.isInside,
          distanceMeters: distInfo.distanceMeters,
          status: distInfo.isInside ? 'inside' : 'outside',
          battery: 90,
          source: navigator.onLine ? 'gps' : 'offline_sync'
        };

        // Agar internet yo'q bo'lsa -> LocalStorage ga saqlaymiz
        if (!navigator.onLine) {
          saveLocationPingLocally(ping);
          setOfflineCount(getLocalOfflineQueue().length);
        } else {
          // Internet bor bo'lsa -> Supabase ga yuboramiz
          try {
            // LocalStorage da eski oflayn nuqtalar bo'lsa ularni ham qo'shib yuborish
            const backlog = getLocalOfflineQueue();
            const allToSend = [...backlog, ping];

            // LocalStorage ga kunlik tarix sifatida qo'shish
            try {
              const prevHistRaw = localStorage.getItem(`teacher_loc_history_${dateToday}`);
              const prevHist = prevHistRaw ? JSON.parse(prevHistRaw) : [];
              localStorage.setItem(`teacher_loc_history_${dateToday}`, JSON.stringify([...prevHist, ...allToSend]));
            } catch (e) {}

            if (saveModuleToSupabase) {
              await saveModuleToSupabase('teacher_locations_live', { [ping.teacherId]: ping });
            }

            // Muvaffaqiyatli yuborilgach, LocalStorage oflayn navbatini butunlay tozalaymiz
            if (backlog.length > 0) {
              clearLocalOfflineQueue();
              setOfflineCount(0);
            }
          } catch (e) {
            // Xatolik bo'lsa ham LocalStorage ga saqlab qolamiz
            saveLocationPingLocally(ping);
            setOfflineCount(getLocalOfflineQueue().length);
          }
        }
        setIsUpdating(false);
      },
      (err) => {
        console.warn('GPS signal olib bo\'lmadi:', err.message);
        setGpsError(err.message);
        setIsUpdating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // 10:00 dan 18:00 gacha har 60 soniyada (1 daqiqa) avtomatik kuzatuv
  useEffect(() => {
    // Ilk yuklanishda lokatsiyani olish
    captureAndSendLocation();

    const interval = setInterval(() => {
      if (isTrackingTimeActive()) {
        captureAndSendLocation();
      }
    }, 60000); // 1 daqiqada bir marta

    return () => clearInterval(interval);
  }, [currentUser]);

  // Online / Offline hodisalarini tinglash
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      captureAndSendLocation(); // Aloqa tiklanganda darhol oflayn keshni yuborish
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-900/90 to-indigo-950 text-white shadow-md border border-blue-800/40 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Chap tomon: Holat va indikator */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-blue-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-100">
                GPS Lokatsiya Nazorati (10:00 - 18:00)
              </span>
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                isTrackingHour 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-slate-700 text-slate-300'
              }`}>
                {isTrackingHour ? 'Faol nazorat' : 'Nazorat oralig\'ida emas'}
              </span>
            </div>

            <div className="text-[11px] text-blue-200/80 mt-0.5 flex flex-wrap items-center gap-2">
              {currentDistance !== null ? (
                <span>
                  Holat: <b className={isInside ? 'text-emerald-400' : 'text-amber-300'}>
                    {isInside ? '🟢 Maktab hududida' : '🔴 Maktabdan tashqarida'}
                  </b> ({currentDistance} m)
                </span>
              ) : (
                <span>GPS signali qidirilmoqda...</span>
              )}
              {lastPingTime && <span>• Oxirgi qayd: <b>{lastPingTime}</b></span>}
            </div>
          </div>
        </div>

        {/* O'ng tomon: Internet va Kesh holati */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Internet nishoni */}
          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
            isOnline 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{isOnline ? 'Online' : 'Oflayn'}</span>
          </span>

          {/* Oflayn kesh ko'rsatkichi */}
          {offlineCount > 0 && (
            <span className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold animate-pulse">
              Keshda: {offlineCount} ta (Internetda yuklanadi)
            </span>
          )}

          {/* Yangilash tugmasi */}
          <button
            onClick={captureAndSendLocation}
            disabled={isUpdating}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 transition-colors disabled:opacity-50"
            title="Lokatsiyani hozir yangilash"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>
    </div>
  );
};
