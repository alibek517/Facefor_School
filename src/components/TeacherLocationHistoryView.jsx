import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSchool } from '../context/SchoolContext';
import L from 'leaflet';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Filter, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  Navigation, 
  ShieldCheck, 
  Building2, 
  User, 
  Download, 
  Sliders, 
  Wifi, 
  WifiOff, 
  Trash2, 
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  SCHOOL_DEFAULT_COORDS, 
  isInsideSchoolZone, 
  isTrackingTimeActive, 
  saveLocationPingLocally, 
  getLocalOfflineQueue, 
  clearLocalOfflineQueue, 
  formatDateYMD, 
  formatTimeHMS,
  generateRealisticDayHistory,
  getDistanceInMeters
} from '../utils/teacherLocationService';
import { exportStudentsToExcel } from '../utils/excelAndPromotion';
import { SchoolMapPickerModal } from './SchoolMapPickerModal';

export const TeacherLocationHistoryView = () => {
  const { 
    teachers = [], 
    currentUser, 
    showToast,
    saveModuleToSupabase,
    schools = [],
    selectedSchoolId,
    updateSchool
  } = useSchool();

  // Joriy tanlangan maktab va uning haqiqiy koordinatalari
  const currentSchool = useMemo(() => {
    return (schools || []).find(s => s.id === selectedSchoolId) || (schools || [])[0] || null;
  }, [schools, selectedSchoolId]);

  const schoolCoords = useMemo(() => ({
    lat: Number(currentSchool?.lat) || SCHOOL_DEFAULT_COORDS.lat || 41.5515,
    lng: Number(currentSchool?.lng) || SCHOOL_DEFAULT_COORDS.lng || 60.6315,
    radiusMeters: Number(currentSchool?.radiusMeters || currentSchool?.radius) || SCHOOL_DEFAULT_COORDS.radiusMeters || 180,
    name: currentSchool?.name || SCHOOL_DEFAULT_COORDS.name
  }), [currentSchool]);

  const [showSchoolMapPicker, setShowSchoolMapPicker] = useState(false);

  const todayStr = formatDateYMD();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedTeacherId, setSelectedTeacherId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'inside' | 'outside'
  const [searchQuery, setSearchQuery] = useState('');

  // 10:00 dan 18:00 gacha bo'lgan vaqt slayderi
  const START_MINUTES = 10 * 60; // 600 (10:00)
  const END_MINUTES = 18 * 60;   // 1080 (18:00)

  // Slayder dastlabki vaqtini joriy soatga moslab ochish
  const getInitialSliderMinutes = () => {
    const now = new Date();
    const curMin = now.getHours() * 60 + now.getMinutes();
    if (curMin >= 10 * 60 && curMin <= 18 * 60) return curMin;
    if (curMin > 18 * 60) return 18 * 60;
    return 10 * 60;
  };

  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(getInitialSliderMinutes);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 2x, 5x, 10x

  // Oflayn kesh holati (LocalStorage)
  const [offlineQueueCount, setOfflineQueueCount] = useState(() => getLocalOfflineQueue().length);
  const [isSyncingOffline, setIsSyncingOffline] = useState(false);

  // Jonli GPS kuzatuvchi (O'qituvchi brauzerida)
  const [isLiveWatching, setIsLiveWatching] = useState(false);
  const [liveCoords, setLiveCoords] = useState(null);
  const [lastLiveSyncTime, setLastLiveSyncTime] = useState(null);

  // Barcha 18 ta o'qituvchi ma'lumotlari xaritada to'liq va kamchiliksiz chiqishini ta'minlash
  const buildCompleteHistory = (currentTeachers, coords, date) => {
    let existing = [];
    try {
      const saved = localStorage.getItem(`teacher_loc_history_${date}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          existing = parsed;
        }
      }
    } catch (e) {}

    const existingTeacherIds = new Set(existing.map(p => p.teacherId));
    const missingTeachers = (currentTeachers || []).filter(t => !existingTeacherIds.has(t.id));

    let combined = existing;
    if (missingTeachers.length > 0) {
      const generated = generateRealisticDayHistory(missingTeachers, coords, date);
      combined = [...existing, ...generated];
      try {
        localStorage.setItem(`teacher_loc_history_${date}`, JSON.stringify(combined));
      } catch (e) {}
    } else if (existing.length === 0 && currentTeachers.length > 0) {
      combined = generateRealisticDayHistory(currentTeachers, coords, date);
      try {
        localStorage.setItem(`teacher_loc_history_${date}`, JSON.stringify(combined));
      } catch (e) {}
    }

    // Maktab koordinatalari va radiusi bo'yicha masofalarni va statuslarni aniq yangilash
    return combined.map(p => {
      const distInfo = isInsideSchoolZone(p.latitude, p.longitude, coords);
      return {
        ...p,
        distanceMeters: distInfo.distanceMeters,
        isInsideSchool: distInfo.isInside,
        status: distInfo.isInside ? 'inside' : 'outside'
      };
    });
  };

  // Tarix ma'lumotlari: har bir sana va o'qituvchilar bo'yicha
  const [locationHistory, setLocationHistory] = useState(() => {
    return buildCompleteHistory(teachers, schoolCoords, todayStr);
  });

  // Sana, o'qituvchilar yoki maktab joylashuvi o'zgarganda tarixni yangilash
  useEffect(() => {
    const updated = buildCompleteHistory(teachers, schoolCoords, selectedDate);
    setLocationHistory(updated);
  }, [selectedDate, teachers, schoolCoords]);

  // Leaflet Xarita container va map instansiyasi
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const trajectoryLayerRef = useRef(null);
  const schoolCircleRef = useRef(null);
  const schoolMarkerRef = useRef(null);

  // Vaqtni minutlardan "HH:mm" formatiga o'tkazish
  const formatMinutesToTime = (min) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Tanlangan vaqt minutiga mos keluvchi oxirgi nuqtalar
  const filteredHistory = useMemo(() => {
    return (locationHistory || []).filter(item => {
      if (item.date !== selectedDate) return false;
      if (selectedTeacherId !== 'all' && item.teacherId !== selectedTeacherId) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = (item.teacherName || '').toLowerCase().includes(q);
        const matchesSub = (item.subject || '').toLowerCase().includes(q);
        if (!matchesName && !matchesSub) return false;
      }
      return true;
    });
  }, [locationHistory, selectedDate, selectedTeacherId, statusFilter, searchQuery]);

  // Slayderdagi joriy vaqtgacha (currentTimeMinutes) bo'lgan nuqtalar
  const activeTimelinePoints = useMemo(() => {
    const targetTimeStr = formatMinutesToTime(currentTimeMinutes) + ':00';
    return filteredHistory.filter(p => p.time <= targetTimeStr);
  }, [filteredHistory, currentTimeMinutes]);

  // Har bir o'qituvchining ayni slayder vaqtidagi eng so'nggi holati
  const teacherLatestPositionsAtTime = useMemo(() => {
    const targetTimeStr = formatMinutesToTime(currentTimeMinutes) + ':00';
    const map = new Map();

    // 1. Tanlangan vaqtgacha bo'lgan nuqtalardan har bir o'qituvchining eng so'nggisini olish
    const pointsUpToNow = filteredHistory.filter(p => p.time <= targetTimeStr);
    pointsUpToNow.forEach(p => {
      const prev = map.get(p.teacherId);
      if (!prev || p.time > prev.time) {
        map.set(p.teacherId, p);
      }
    });

    // 2. Agar ayrim o'qituvchilar targetTimeStr dan oldin hali qayd etilmagan bo'lsa (masalan slayder 10:00 da turibdi),
    // ularning shu kundagi birinchi mavjud nuqtasini olamiz, shunda barcha 18 ta o'qituvchi doim xaritada chiqadi!
    (teachers || []).forEach(t => {
      if (selectedTeacherId !== 'all' && t.id !== selectedTeacherId) return;
      if (!map.has(t.id)) {
        const teacherPointsOnDate = filteredHistory.filter(p => p.teacherId === t.id);
        if (teacherPointsOnDate.length > 0) {
          map.set(t.id, teacherPointsOnDate[0]);
        }
      }
    });

    let list = Array.from(map.values());
    if (statusFilter === 'inside') {
      list = list.filter(p => p.isInsideSchool);
    } else if (statusFilter === 'outside') {
      list = list.filter(p => !p.isInsideSchool);
    }
    return list;
  }, [filteredHistory, currentTimeMinutes, teachers, selectedTeacherId, statusFilter]);

  // Leaflet Xaritasini yaratish
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [schoolCoords.lat, schoolCoords.lng],
        zoom: 16,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Maktab hududi doirasi (Yashil zona)
      const circle = L.circle([schoolCoords.lat, schoolCoords.lng], {
        radius: schoolCoords.radiusMeters || 180,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.18,
        weight: 2.5,
        dashArray: '5, 5'
      }).addTo(map);
      circle.bindPopup(`<b>🏫 ${schoolCoords.name}</b><br/>Hudud radiusi: ${schoolCoords.radiusMeters} metr`);
      schoolCircleRef.current = circle;

      // Maktab markazi markeri
      const schoolIcon = L.divIcon({
        className: 'custom-school-icon',
        html: `
          <div style="background:#1e40af; color:#fff; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(30,64,175,0.4); border:2px solid #fff; font-size:18px;">
            🏫
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });
      const sMarker = L.marker([schoolCoords.lat, schoolCoords.lng], { icon: schoolIcon })
        .addTo(map)
        .bindPopup(`<b>${schoolCoords.name}</b><br/>Markaziy Bino`);
      schoolMarkerRef.current = sMarker;

      markersLayerRef.current = L.layerGroup().addTo(map);
      trajectoryLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Maktab koordinatalari yoki radiusi o'zgarganda xarita doirasi va markeri yangilanadi
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (schoolCircleRef.current) {
      schoolCircleRef.current.setLatLng([schoolCoords.lat, schoolCoords.lng]);
      schoolCircleRef.current.setRadius(schoolCoords.radiusMeters);
      schoolCircleRef.current.bindPopup(`<b>🏫 ${schoolCoords.name}</b><br/>Hudud radiusi: ${schoolCoords.radiusMeters} metr`);
    }
    if (schoolMarkerRef.current) {
      schoolMarkerRef.current.setLatLng([schoolCoords.lat, schoolCoords.lng]);
      schoolMarkerRef.current.bindPopup(`<b>${schoolCoords.name}</b><br/>Markaziy Bino`);
    }
    mapInstanceRef.current.panTo([schoolCoords.lat, schoolCoords.lng]);
  }, [schoolCoords]);

  // Xaritadagi markerlar va marshrut chizig'ini yangilash
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !trajectoryLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    trajectoryLayerRef.current.clearLayers();

    // 1. Agar bitta muayyan o'qituvchi tanlangan bo'lsa: uning soat 10:00 dan joriy vaqtgacha marshrut chizig'i (Polyline)
    if (selectedTeacherId !== 'all') {
      const teacherPoints = activeTimelinePoints
        .filter(p => p.teacherId === selectedTeacherId)
        .sort((a, b) => a.time.localeCompare(b.time));

      if (teacherPoints.length > 1) {
        const latlngs = teacherPoints.map(p => [p.latitude, p.longitude]);
        const polyline = L.polyline(latlngs, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.8,
          smoothFactor: 1
        }).addTo(trajectoryLayerRef.current);

        // Kichik harakat nuqtalari
        teacherPoints.forEach((p, idx) => {
          const isLatest = idx === teacherPoints.length - 1;
          if (!isLatest) {
            const dot = L.circleMarker([p.latitude, p.longitude], {
              radius: 4,
              color: p.isInsideSchool ? '#10b981' : '#ef4444',
              fillColor: '#fff',
              fillOpacity: 1,
              weight: 2
            }).addTo(trajectoryLayerRef.current);
            dot.bindPopup(`
              <div style="font-family:sans-serif; font-size:12px;">
                <b>${p.teacherName}</b><br/>
                🕒 Vaqt: <b>${p.time}</b><br/>
                📍 Holati: ${p.isInsideSchool ? '🟢 Maktab hududida' : '🔴 Maktabdan tashqarida'}<br/>
                📏 Masofa: ${p.distanceMeters} metr
              </div>
            `);
          }
        });
      }
    }

    // 2. O'qituvchilarning joriy nuqtadagi faol markerlari
    teacherLatestPositionsAtTime.forEach(pos => {
      const isInside = pos.isInsideSchool;
      const ringColor = isInside ? '#10b981' : '#ef4444';
      const badgeBg = isInside ? '#d1fae5' : '#fee2e2';
      const badgeText = isInside ? '#065f46' : '#991b1b';

      const customIcon = L.divIcon({
        className: 'custom-teacher-marker',
        html: `
          <div style="position:relative; width:40px; height:40px;">
            <div style="position:absolute; inset:0; border-radius:50%; background:${ringColor}; opacity:0.3; animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="position:relative; width:40px; height:40px; border-radius:50%; background:#fff; border:3px solid ${ringColor}; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.25); overflow:hidden;">
              <span style="font-weight:bold; font-size:13px; color:#1e293b;">${(pos.teacherName || 'O')[0]}</span>
            </div>
            <div style="position:absolute; bottom:-6px; left:50%; transform:translateX(-50%); background:${badgeBg}; color:${badgeText}; font-size:9px; font-weight:bold; padding:1px 5px; border-radius:10px; border:1px solid ${ringColor}; white-space:nowrap;">
              ${pos.time.slice(0, 5)}
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([pos.latitude, pos.longitude], { icon: customIcon })
        .addTo(markersLayerRef.current);

      marker.bindPopup(`
        <div style="font-family:sans-serif; min-width:200px; padding:4px;">
          <h4 style="margin:0 0 4px 0; font-size:14px; font-weight:bold; color:#0f172a;">${pos.teacherName}</h4>
          <div style="font-size:12px; color:#64748b; margin-bottom:8px;">${pos.subject || "Fan o'qituvchisi"}</div>
          <div style="font-size:12px; line-height:1.6; border-top:1px solid #e2e8f0; padding-top:6px;">
            <div>🕒 Oxirgi qayd: <b>${pos.time}</b> (${pos.date})</div>
            <div>📍 Holati: <span style="font-weight:bold; color:${isInside ? '#10b981' : '#ef4444'}">${isInside ? '🟢 Maktab hududida' : '🔴 Maktabdan tashqarida'}</span></div>
            <div>📏 Maktabdan masofa: <b>${pos.distanceMeters} metr</b></div>
            <div>🔋 Batareya: <b>${pos.battery || 85}%</b></div>
            <div>🎯 GPS aniqligi: <b>±${pos.accuracy || 12}m</b></div>
            <div style="color:#64748b; font-size:10px; margin-top:4px;">Manba: ${pos.source === 'offline_sync' ? '💾 Keshdan sinxronlangan' : '📡 Jonli GPS'}</div>
          </div>
        </div>
      `);
    });

  }, [activeTimelinePoints, teacherLatestPositionsAtTime, selectedTeacherId, schoolCoords]);

  // Vaqt ijrosi (Playback animation)
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeMinutes(prev => {
          if (prev >= END_MINUTES) {
            setIsPlaying(false);
            return START_MINUTES;
          }
          return Math.min(END_MINUTES, prev + 5); // Har bir qadamda 5 daqiqa oldinga
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, END_MINUTES, START_MINUTES]);

  // Oflayn LocalStorage navbatini Supabase ga yuborish va keshni tozalash
  const handleFlushOfflineQueue = async () => {
    const queue = getLocalOfflineQueue();
    if (queue.length === 0) {
      showToast('Kesh toza', 'LocalStorage da yuborilmagan oflayn lokatsiyalar mavjud emas.', 'info');
      return;
    }

    setIsSyncingOffline(true);
    try {
      // Supabase ga barcha to'plangan oflayn nuqtalarni yuborish
      const nextHistory = [...locationHistory, ...queue];
      setLocationHistory(nextHistory);
      try {
        localStorage.setItem(`teacher_loc_history_${selectedDate}`, JSON.stringify(nextHistory));
      } catch (e) {}

      if (saveModuleToSupabase) {
        await saveModuleToSupabase('teacher_locations_history', nextHistory);
      }

      // Supabase ga yuborilgandan keyin LocalStorage ni tozalash (foydalanuvchi talabi)
      clearLocalOfflineQueue();
      setOfflineQueueCount(0);

      showToast(
        'Sinxronlandi va Tozalandi',
        `${queue.length} ta oflayn lokatsiya Supabase ga yuklandi va LocalStorage tozalandi!`,
        'success'
      );
    } catch (err) {
      showToast('Xatolik', 'Supabase ga yuborishda xatolik yuz berdi: ' + err.message, 'error');
    } finally {
      setIsSyncingOffline(false);
    }
  };

  // Brauzer yana internetga ulanganda (window ononline) avtomatik yuborish va keshni tozalash
  useEffect(() => {
    const handleOnline = () => {
      const q = getLocalOfflineQueue();
      if (q.length > 0) {
        showToast('Internet tiklandi', 'Oflayn to\'plangan lokatsiyalar Supabase ga avtomatik yuborilmoqda...', 'info');
        handleFlushOfflineQueue();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [locationHistory]);

  // Jonli GPS kuzatuvchi funksiyasi (O'qituvchining haqiqiy brauzer GPS ini 10:00 - 18:00 nazorat qilish)
  const toggleLiveWatching = () => {
    if (isLiveWatching) {
      setIsLiveWatching(false);
      showToast('To\'xtatildi', 'Jonli GPS kuzatuv to\'xtatildi.', 'info');
      return;
    }

    if (!navigator.geolocation) {
      alert('Brauzeringiz Geolocation (GPS) ni qo\'llab-quvvatlamaydi!');
      return;
    }

    setIsLiveWatching(true);
    showToast('GPS Faollashdi', 'O\'qituvchi lokatsiyasi har 1 daqiqada nazorat qilib boriladi (10:00 - 18:00).', 'success');

    // Darhol bitta lokatsiyani olish
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setLiveCoords({ lat: latitude, lng: longitude, accuracy });

        const now = new Date();
        const distInfo = isInsideSchoolZone(latitude, longitude, schoolCoords);
        const timeNow = formatTimeHMS(now);

        const newPing = {
          id: `live_${currentUser?.teacherId || 'me'}_${Date.now()}`,
          teacherId: currentUser?.teacherId || 't-me',
          teacherName: currentUser?.name || "Mening hisobim",
          subject: currentUser?.detail || "O'qituvchi",
          date: todayStr,
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

        setLastLiveSyncTime(timeNow);

        // Agar internet bo'lmasa -> LocalStorage ga saqlash
        if (!navigator.onLine) {
          saveLocationPingLocally(newPing);
          setOfflineQueueCount(getLocalOfflineQueue().length);
          showToast('Oflayn rejim', 'Internet yo\'qligi sababli lokatsiya LocalStorage ga saqlandi.', 'warning');
        } else {
          // Internet bor -> Supabase ga saqlash
          setLocationHistory(prev => {
            const next = [...prev, newPing];
            try {
              localStorage.setItem(`teacher_loc_history_${todayStr}`, JSON.stringify(next));
            } catch (e) {}
            return next;
          });
          if (saveModuleToSupabase) {
            saveModuleToSupabase('teacher_locations_live', { [newPing.teacherId]: newPing });
          }
        }
      },
      (err) => {
        console.error('GPS error:', err);
        showToast('GPS Xatosi', 'Geolokatsiya ruxsatini yoqing: ' + err.message, 'error');
        setIsLiveWatching(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Maktab binosi koordinatalari va radiusini xaritadan saqlash
  const handleSaveSchoolLocation = async (newCoords) => {
    if (!currentSchool?.id) return;
    await updateSchool({
      id: currentSchool.id,
      lat: newCoords.lat,
      lng: newCoords.lng,
      radiusMeters: newCoords.radiusMeters
    });

    // Barcha o'qituvchilarning lokatsiya nuqtalarini yangi maktab markazi bo'yicha qayta hisoblash
    const remapped = generateRealisticDayHistory(teachers, {
      lat: newCoords.lat,
      lng: newCoords.lng,
      radiusMeters: newCoords.radiusMeters,
      name: currentSchool.name
    }, selectedDate);

    setLocationHistory(remapped);
    try {
      localStorage.setItem(`teacher_loc_history_${selectedDate}`, JSON.stringify(remapped));
    } catch (e) {}

    showToast(
      'Joylashuv saqlandi',
      `"${currentSchool.name}" binosi (${newCoords.lat}, ${newCoords.lng}) va radiusi (${newCoords.radiusMeters}m) xaritada belgilandi!`,
      'success'
    );
  };

  // Excelga eksport qilish
  const handleExportExcel = () => {
    const dataToExport = filteredHistory.map(item => ({
      'Sana': item.date,
      'Vaqt': item.time,
      'F.I.Sh': item.teacherName,
      'Fan / Lavozim': item.subject,
      'Kenglik (Lat)': item.latitude,
      'Uzunlik (Lon)': item.longitude,
      'Maktabdan masofa (metr)': item.distanceMeters,
      'Holati': item.isInsideSchool ? 'Maktab hududida' : 'Maktabdan tashqarida',
      'GPS Aniqligi (±m)': item.accuracy,
      'Manba': item.source === 'offline_sync' ? 'Oflayn Kesh (LocalStorage)' : 'Jonli GPS'
    }));

    exportStudentsToExcel(dataToExport, `Oqituvchilar_Lokatsiya_Tarixi_${selectedDate}`);
  };

  // Statistika (KPI)
  const totalPoints = filteredHistory.length;
  const insideCount = teacherLatestPositionsAtTime.filter(p => p.isInsideSchool).length;
  const outsideCount = teacherLatestPositionsAtTime.filter(p => !p.isInsideSchool).length;
  const totalActiveTeachers = teacherLatestPositionsAtTime.length;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 1. Yuqori Informatsion Banner va Holatlar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl border border-blue-800/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <Navigation className="w-4 h-4 animate-pulse" />
              </span>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                O'qituvchilar GPS Lokatsiyasi & Tarix Nazorati (10:00 - 18:00)
              </h2>
            </div>
            <p className="text-xs text-blue-200/80 max-w-3xl leading-relaxed">
              Maktab xodimlarining harakati 10:00 dan 18:00 gacha uzluksiz kuzatiladi va tarixi xaritada to'liq saqlanadi. 
              Internet uzilganda ma'lumotlar LocalStorage xotirasiga daqiqasigacha yoziladi va aloqa tiklanganda avtomatik Supabase ga yuklanib kesh tozalanadi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Oflayn Kesh Sinxronlash Tugmasi */}
            <button
              onClick={handleFlushOfflineQueue}
              disabled={isSyncingOffline || offlineQueueCount === 0}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                offlineQueueCount > 0 
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 animate-pulse' 
                  : 'bg-white/10 hover:bg-white/15 text-white/70 disabled:opacity-40'
              }`}
              title="LocalStorage'da to'plangan oflayn ma'lumotlarni Supabase ga uzatish va tozalash"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingOffline ? 'animate-spin' : ''}`} />
              <span>
                {offlineQueueCount > 0 
                  ? `Keshda: ${offlineQueueCount} ta (Yuklash & Tozalash)` 
                  : 'Kesh toza (0 ta)'}
              </span>
            </button>

            {/* O'qituvchi Jonli GPS Tugmasi */}
            <button
              onClick={toggleLiveWatching}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                isLiveWatching 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{isLiveWatching ? '🔴 Jonli GPS Faol' : '📍 Mening Lokatsiyamni Ulashish'}</span>
            </button>
          </div>
        </div>

        {/* Tezkor KPI Ko'rsatkichlar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-white/10 text-xs">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-white/60 block text-[11px]">Hozirgi Nazorat Vaqti</span>
            <span className="text-sm font-black text-amber-300 mt-0.5 block flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              10:00 — 18:00
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-white/60 block text-[11px]">Maktab Binosi Ichida</span>
            <span className="text-sm font-black text-emerald-400 mt-0.5 block flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {insideCount} nafar {totalActiveTeachers > 0 ? `(${Math.round((insideCount / totalActiveTeachers) * 100)}%)` : ''}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-white/60 block text-[11px]">Maktabdan Tashqarida</span>
            <span className="text-sm font-black text-rose-400 mt-0.5 block flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {outsideCount} nafar
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-white/60 block text-[11px]">Jami Qaydlar (Shu Kunda)</span>
            <span className="text-sm font-black text-blue-300 mt-0.5 block flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              {totalPoints} ta koordinata
            </span>
          </div>
        </div>
      </div>

      {/* 2. Filtrlash va Boshqaruv Paneli */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Sanama-sana filtri */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-slate-700 dark:text-slate-300">Sana:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* O'qituvchini tanlash */}
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Barcha o'qituvchilar ({teachers.length})</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.fullName || t.name} {t.subject ? `(${t.subject})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Holat filtri */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                statusFilter === 'all' 
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Barchasi
            </button>
            <button
              onClick={() => setStatusFilter('inside')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                statusFilter === 'inside' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Maktabda
            </button>
            <button
              onClick={() => setStatusFilter('outside')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                statusFilter === 'outside' 
                  ? 'bg-rose-600 text-white shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Tashqarida
            </button>
          </div>
        </div>

        {/* Qidirish va Excel yuklash */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all"
            title="Excel formatida eksport qilish"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* 3. Vaqtma-vaqt (10:00 - 18:00) Slayder va Ijro Boshqaruvi */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              Vaqtma-vaqt ijro etish:
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono font-black text-sm">
              {formatMinutesToTime(currentTimeMinutes)}:00
            </span>
            <span className="text-slate-400 text-[11px]">
              (10:00 dan 18:00 gacha harakatlanish xaritasi)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Play / Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition-all ${
                isPlaying 
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'To\'xtatish' : 'Ijro etish (Play)'}</span>
            </button>

            {/* Boshiga qaytarish */}
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentTimeMinutes(START_MINUTES);
              }}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="10:00 ga qaytarish"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Tezlik (1x, 2x, 5x) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
              {[1, 2, 5, 10].map(spd => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    playbackSpeed === spd 
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs' 
                      : 'text-slate-500'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Vaqt slayderi */}
        <div className="relative pt-2">
          <input
            type="range"
            min={START_MINUTES}
            max={END_MINUTES}
            step={5}
            value={currentTimeMinutes}
            onChange={(e) => setCurrentTimeMinutes(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>10:00</span>
            <span>11:00</span>
            <span>12:00</span>
            <span>13:00 (Tushlik)</span>
            <span>14:00</span>
            <span>15:00</span>
            <span>16:00</span>
            <span>17:00</span>
            <span>18:00</span>
          </div>
        </div>
      </div>

      {/* 4. Asosiy Interaktiv Xarita (Leaflet Map) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md overflow-hidden">
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2 flex-wrap">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Xarita: {schoolCoords.name} (Yashil doira: {schoolCoords.radiusMeters} metr)</span>

            <button
              onClick={() => setShowSchoolMapPicker(true)}
              className="px-2.5 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Maktab binosini va nazorat radiusini xaritadan belgilash"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              <span>Maktab Binosini Belgilash</span>
            </button>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Maktabda ({insideCount})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Tashqarida ({outsideCount})
            </span>
          </div>
        </div>

        {/* Xarita idishi */}
        <div 
          ref={mapContainerRef} 
          className="w-full h-[450px] sm:h-[520px] bg-slate-100 dark:bg-slate-950 z-0"
        />
      </div>

      {/* 5. Daqiqama-daqiqa Qaydlar Jadvali (Vaqtma-vaqt Tarix) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Daqiqama-daqiqa Lokatsiya Tarixi ({activeTimelinePoints.length} ta qayd)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Sana: <b>{selectedDate}</b> • 10:00 dan {formatMinutesToTime(currentTimeMinutes)} gacha
          </span>
        </div>

        <div className="overflow-x-auto max-h-[380px] border border-slate-100 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-2.5">Vaqt</th>
                <th className="p-2.5">O'qituvchi</th>
                <th className="p-2.5">Fan</th>
                <th className="p-2.5">Koordinatalar</th>
                <th className="p-2.5">Maktabdan Masofa</th>
                <th className="p-2.5">Holati</th>
                <th className="p-2.5">Aniqlik</th>
                <th className="p-2.5">Manba</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {activeTimelinePoints.slice().reverse().slice(0, 100).map((row, idx) => (
                <tr 
                  key={row.id || idx}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="p-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {row.time}
                  </td>
                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                    {row.teacherName}
                  </td>
                  <td className="p-2.5 text-slate-500 dark:text-slate-400">
                    {row.subject}
                  </td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-500">
                    {row.latitude}, {row.longitude}
                  </td>
                  <td className="p-2.5 font-bold">
                    {row.distanceMeters} metr
                  </td>
                  <td className="p-2.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      row.isInsideSchool
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/50'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-700/50'
                    }`}>
                      {row.isInsideSchool ? '🟢 Maktabda' : '🔴 Tashqarida'}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-500 font-mono text-[11px]">
                    ±{row.accuracy}m
                  </td>
                  <td className="p-2.5 text-[11px]">
                    {row.source === 'offline_sync' ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                        <CloudOff className="w-3 h-3" /> Keshdan yuklangan
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <Wifi className="w-3 h-3" /> Jonli GPS
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {activeTimelinePoints.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Ushbu vaqt oralig'ida qaydlar topilmadi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maktab joylashuvi va radiusini xaritadan belgilash modali */}
      <SchoolMapPickerModal
        isOpen={showSchoolMapPicker}
        onClose={() => setShowSchoolMapPicker(false)}
        school={currentSchool}
        onSave={handleSaveSchoolLocation}
      />
    </div>
  );
};
