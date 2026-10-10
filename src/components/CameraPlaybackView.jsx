import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Rewind, 
  Calendar, 
  Clock, 
  Video, 
  Maximize2, 
  X, 
  ChevronRight, 
  Check, 
  Film, 
  Search,
  Filter,
  UserCheck,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { StudentAvatar } from './StudentAvatar';

// Soniyalarni "HH:mm:ss" ko'rinishiga o'tkazish
const secondsToTimeStr = (totalSec) => {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// "HH:mm:ss" yoki "HH:mm" ni soniyalarga o'tkazish
const timeStrToSeconds = (timeStr) => {
  if (!timeStr) return 0;
  const parts = String(timeStr).trim().split(':').map(Number);
  const h = parts[0] || 0;
  const m = parts[1] || 0;
  const s = parts[2] || 0;
  return h * 3600 + m * 60 + s;
};

export const CameraPlaybackView = ({ 
  cameras = [], 
  effectiveBaseUrl, 
  initialDate,
  initialCameraIp,
  allScans = [] 
}) => {
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState(initialDate || todayStr);
  const [availableDates, setAvailableDates] = useState([todayStr]);
  
  // Kamera tanlash: 'all' (barchasi sinxron) yoki aniq kamera id / ip
  const [selectedCameraIp, setSelectedCameraIp] = useState(initialCameraIp || cameras[0]?.ip || '192.168.1.35');
  const [viewMode, setViewMode] = useState('single'); // 'single' yoki 'grid'

  useEffect(() => {
    if (initialCameraIp) {
      setSelectedCameraIp(initialCameraIp);
    }
  }, [initialCameraIp]);

  // Vaqt oralig'i (Start time va End time)
  const [startTimeStr, setStartTimeStr] = useState('07:30:00');
  const [endTimeStr, setEndTimeStr] = useState('18:00:00');

  // Joriy ko'rilayotgan vaqt (soniyalarda, 0 dan 86399 gacha)
  const [currentSeconds, setCurrentSeconds] = useState(() => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    // Default: joriy vaqtdan 15 daqiqa oldin yoki 08:30
    return Math.max(7 * 3600, h * 3600 + m * 60 + s - 900);
  });

  // Pleyer holatlari
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 0.5, 1, 2, 4, 8
  const [fullscreenCam, setFullscreenCam] = useState(null);

  // Timeline ma'lumotlari (yozib olingan soatlar va skanerlash voqealari)
  const [timelineData, setTimelineData] = useState(null);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);

  // Vaqt oralig'i chegaralari
  const minSeconds = useMemo(() => Math.max(0, timeStrToSeconds(startTimeStr)), [startTimeStr]);
  const maxSeconds = useMemo(() => Math.min(86399, timeStrToSeconds(endTimeStr)), [endTimeStr]);

  const activeCam = useMemo(() => {
    return cameras.find(c => c.ip === selectedCameraIp || c.id === selectedCameraIp) || cameras[0] || {
      name: 'Turniket Kamerasi',
      ip: selectedCameraIp,
      type: 'in'
    };
  }, [cameras, selectedCameraIp]);

  // Mavjud sanalarni yuklash
  useEffect(() => {
    if (!effectiveBaseUrl) return;
    fetch(`${effectiveBaseUrl}/api/camera/playback/dates`)
      .then(r => r.json())
      .then(d => {
        if (d?.success && Array.isArray(d.dates) && d.dates.length > 0) {
          setAvailableDates(d.dates);
        }
      })
      .catch(() => {});
  }, [effectiveBaseUrl]);

  // Tanlangan kamera va sana bo'yicha timeline ma'lumotlarini olish
  useEffect(() => {
    if (!effectiveBaseUrl || !selectedCameraIp) return;
    setIsLoadingTimeline(true);
    fetch(`${effectiveBaseUrl}/api/camera/playback/timeline?ip=${selectedCameraIp}&date=${selectedDate}`)
      .then(r => r.json())
      .then(d => {
        if (d?.success) {
          setTimelineData(d);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingTimeline(false));
  }, [effectiveBaseUrl, selectedCameraIp, selectedDate]);

  // Play / Pause timer tsikli
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.max(80, Math.round(1000 / playbackSpeed));
    const timer = setInterval(() => {
      setCurrentSeconds(prev => {
        const next = prev + 1;
        if (next > maxSeconds) {
          setIsPlaying(false);
          return maxSeconds;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, maxSeconds]);

  // Joriy vaqt satri "HH:mm:ss"
  const currentTimeStr = useMemo(() => secondsToTimeStr(currentSeconds), [currentSeconds]);

  // Tezkor oraliq belgilash (Presets)
  const applyPreset = (start, end) => {
    setStartTimeStr(start);
    setEndTimeStr(end);
    const startSec = timeStrToSeconds(start);
    setCurrentSeconds(startSec);
  };

  // Turniket voqealari (hozirgi kamera va sana uchun)
  const cameraEvents = useMemo(() => {
    const list = timelineData?.events || (allScans || []).filter(s => 
      (s.cameraIp === selectedCameraIp || s.cameraId === selectedCameraIp) &&
      (!s.timestamp || s.timestamp.startsWith(selectedDate))
    ).map(s => {
      const [hh, mm, ss] = (s.timeFormatted || '00:00:00').split(':').map(Number);
      return {
        id: s.id,
        name: s.name,
        employeeNo: s.employeeNo,
        timeFormatted: s.timeFormatted,
        seconds: (hh || 0) * 3600 + (mm || 0) * 60 + (ss || 0),
        direction: s.direction
      };
    });

    return list.sort((a, b) => a.seconds - b.seconds);
  }, [timelineData, allScans, selectedCameraIp, selectedDate]);

  // Eng yaqin voqealarni filtrlash (Joriy vaqt atrofidagi voqealar)
  const nearbyEvents = useMemo(() => {
    return cameraEvents.filter(ev => Math.abs(ev.seconds - currentSeconds) <= 1800);
  }, [cameraEvents, currentSeconds]);

  // Kadr URL manzili
  const getFrameUrl = (ip, seconds) => {
    const tStr = secondsToTimeStr(seconds);
    return `${effectiveBaseUrl}/api/camera/playback/frame?ip=${ip}&date=${selectedDate}&time=${tStr}&_=${Math.floor(seconds / 2)}`;
  };

  // Slider orqali vaqtni surish
  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setCurrentSeconds(val);
  };

  // 10 soniya oldinga / ortga sakrash
  const stepSeconds = (delta) => {
    setCurrentSeconds(prev => {
      const n = prev + delta;
      return Math.max(minSeconds, Math.min(maxSeconds, n));
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-5 border border-purple-200 dark:border-purple-900/50 shadow-md space-y-4">
      
      {/* 1. YUQORI BOSHQARUV PANEL: Sarlavha, Sana, Oraliqlar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl text-white shadow-sm">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Turniket Kameralari Playback (Ortga Qaytarib Ko'rish)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                ARXIV & REWIND
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Istalgan sana va vaqt oralig'ini tanlab, o'quvchilar va kameralar harakatini orqaga qaytarib tomosha qiling
            </p>
          </div>
        </div>

        {/* Sana tanlash va Ko'rinish rejimi */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sana tanlagich */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="font-bold text-slate-700 dark:text-slate-300 hidden sm:inline">Sana:</span>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold outline-none cursor-pointer"
            />
          </div>

          {/* Bugun tugmasi */}
          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedDate === todayStr
                ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 text-purple-700 dark:text-purple-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Bugun
          </button>

          {/* Rejim: Yagona kamera vs 6 ta Grid */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('single')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'single'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Katta Kamera
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              6 ta Kamera (Grid)
            </button>
          </div>
        </div>
      </div>

      {/* 2. KAMERANI TANLASH VA TEZKOR VAQT ORALIG'I TUGMALARI */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-purple-50/50 dark:bg-purple-950/20 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/40">
        
        {/* Kamera tanlash tugmalari */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0 mr-1 flex items-center gap-1">
            <Video className="w-3.5 h-3.5 text-purple-600" />
            Kamera:
          </span>
          {(cameras || []).map(c => {
            const isSelected = selectedCameraIp === c.ip;
            const isEntry = c.type === 'in';
            return (
              <button
                key={c.id || c.ip}
                onClick={() => {
                  setSelectedCameraIp(c.ip);
                  if (viewMode === 'grid') setViewMode('single');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isEntry ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tezkor vaqt oraliqlari (Presets) */}
        <div className="flex items-center gap-1 flex-wrap shrink-0">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1">Oraliqlar:</span>
          <button
            onClick={() => applyPreset('07:30:00', '09:00:00')}
            className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-400"
          >
            Ertalabki oqim (07:30-09:00)
          </button>
          <button
            onClick={() => applyPreset('09:00:00', '13:00:00')}
            className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-400"
          >
            Dars vaqti (09:00-13:00)
          </button>
          <button
            onClick={() => applyPreset('13:00:00', '15:30:00')}
            className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-400"
          >
            Tushlik / Chiqish (13:00-15:30)
          </button>
          <button
            onClick={() => applyPreset('07:00:00', '18:00:00')}
            className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-400"
          >
            To'liq kun (07:00-18:00)
          </button>
        </div>
      </div>

      {/* 3. ASOSIY VIDEO VA EVENT MONITORING QISMI */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Chap qism (3 ustun): Video o'yinchi */}
        <div className="lg:col-span-3 space-y-3">
          
          {/* Video Oyna */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex items-center justify-center group">
            {viewMode === 'single' ? (
              <>
                <img 
                  key={`${selectedCameraIp}-${Math.floor(currentSeconds / 2)}`}
                  src={getFrameUrl(selectedCameraIp, currentSeconds)}
                  alt={activeCam.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Agar arxiv kadr topilmasa zaxira statik kadr
                    e.target.onerror = null;
                    e.target.src = `/photos/camera_${selectedCameraIp}.jpg`;
                  }}
                />

                {/* Video OSD Yozuvi (Yuqori chap: Kamera, Vaqt, Holat) */}
                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                  <div className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-xs font-bold border border-white/10 flex items-center gap-1.5 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                    <span>REWIND PLAYBACK: {activeCam.name}</span>
                  </div>

                  <div className={`px-2 py-1 rounded-lg text-[11px] font-black text-white shadow-md ${
                    activeCam.type === 'in' ? 'bg-emerald-600/90' : 'bg-rose-600/90'
                  }`}>
                    {activeCam.type === 'in' ? '🟢 KIRISH' : '🔴 CHIQISH'}
                  </div>
                </div>

                {/* Katta raqamli soat (Yuqori o'ng) */}
                <div className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md text-emerald-400 font-mono text-sm sm:text-base font-black border border-emerald-500/30 shadow-lg tracking-wider">
                  {selectedDate} • {currentTimeStr}
                </div>

                {/* Kattalashtirish tugmasi */}
                <button
                  onClick={() => setFullscreenCam(activeCam)}
                  className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/70 hover:bg-black text-white opacity-80 hover:opacity-100 transition-all border border-white/20"
                  title="To'liq ekranda ko'rish"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              /* 6 ta Kamera Grid Ko'rinishi (Barchasi shu soniyada sinxron) */
              <div className="w-full h-full grid grid-cols-2 sm:grid-cols-3 gap-1 p-1 bg-slate-950">
                {(cameras || []).map(c => (
                  <div 
                    key={c.id || c.ip} 
                    className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-800 cursor-pointer hover:border-purple-500 transition-colors"
                    onClick={() => {
                      setSelectedCameraIp(c.ip);
                      setViewMode('single');
                    }}
                  >
                    <img 
                      src={getFrameUrl(c.ip, currentSeconds)}
                      alt={c.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `/photos/camera_${c.ip}.jpg`;
                      }}
                    />
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white">
                      {c.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. INTERAKTIV 24-SOATLIK TIMELINE SLIDER (VAQT CHIZIG'I) */}
          <div className="bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-800 text-white space-y-3 shadow-lg">
            
            {/* Timeline boshqaruv sarlavhasi va oraliq belgilash */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="font-extrabold text-slate-200">Vaqt Chizig'i (Timeline)</span>
                <span className="text-[11px] text-purple-300 font-mono">
                  [{startTimeStr.slice(0, 5)} ➔ {endTimeStr.slice(0, 5)}]
                </span>
              </div>

              {/* Boshlanish va Tugash vaqtini qo'lda kiritish */}
              <div className="flex items-center gap-2 text-[11px]">
                <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                  <span className="text-slate-400">Boshlanish:</span>
                  <input
                    type="time"
                    step="1"
                    value={startTimeStr}
                    onChange={(e) => setStartTimeStr(e.target.value.length === 5 ? `${e.target.value}:00` : e.target.value)}
                    className="bg-transparent text-emerald-400 font-bold outline-none font-mono"
                  />
                </div>
                <span className="text-slate-500">➔</span>
                <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                  <span className="text-slate-400">Tugash:</span>
                  <input
                    type="time"
                    step="1"
                    value={endTimeStr}
                    onChange={(e) => setEndTimeStr(e.target.value.length === 5 ? `${e.target.value}:00` : e.target.value)}
                    className="bg-transparent text-rose-400 font-bold outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Slider chizig'i va voqea nuqtalari */}
            <div className="relative pt-2 pb-1">
              
              {/* Skanerlash voqealari nuqtalari (Event Markers) */}
              <div className="absolute top-0 left-0 right-0 h-2 flex items-center pointer-events-none">
                {cameraEvents.map((ev, idx) => {
                  if (ev.seconds < minSeconds || ev.seconds > maxSeconds) return null;
                  const percent = ((ev.seconds - minSeconds) / (maxSeconds - minSeconds)) * 100;
                  const isEntry = ev.direction === 'in';
                  return (
                    <div
                      key={ev.id || idx}
                      className="absolute -top-0.5 transform -translate-x-1/2 cursor-pointer pointer-events-auto group/marker"
                      style={{ left: `${Math.max(1, Math.min(99, percent))}%` }}
                      onClick={() => setCurrentSeconds(ev.seconds)}
                      title={`${ev.timeFormatted} - ${ev.name} (${isEntry ? 'Kirish' : 'Chiqish'})`}
                    >
                      <div className={`w-2 h-2 rounded-full ${isEntry ? 'bg-emerald-400 ring-2 ring-emerald-900' : 'bg-rose-400 ring-2 ring-rose-900'} group-hover/marker:scale-150 transition-transform`}></div>
                    </div>
                  );
                })}
              </div>

              {/* Asosiy vaqt slayderi */}
              <input
                type="range"
                min={minSeconds}
                max={maxSeconds}
                value={currentSeconds}
                onChange={handleSliderChange}
                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
              />

              {/* Soat belgilarini ko'rsatuvchi o'q */}
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1 px-1 select-none">
                <span>{startTimeStr.slice(0, 5)}</span>
                <span>09:00</span>
                <span>11:00</span>
                <span>13:00</span>
                <span>15:00</span>
                <span>17:00</span>
                <span>{endTimeStr.slice(0, 5)}</span>
              </div>
            </div>

            {/* 5. PLEYER BOSHQARUV TUGMALARI (Play, Pause, -10s, +10s, Tezlik) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
              
              {/* Chap: -10s, Play/Pause, +10s, Reset */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => stepSeconds(-10)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 text-xs font-bold"
                  title="10 soniya ortga qaytarish"
                >
                  <Rewind className="w-4 h-4 text-purple-400" />
                  <span className="hidden sm:inline">-10s</span>
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shadow-md ${
                    isPlaying
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>To'xtatish (Pause)</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Ijro etish (Play)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => stepSeconds(10)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 text-xs font-bold"
                  title="10 soniya oldinga o'tkazish"
                >
                  <FastForward className="w-4 h-4 text-purple-400" />
                  <span className="hidden sm:inline">+10s</span>
                </button>

                <button
                  onClick={() => setCurrentSeconds(minSeconds)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs"
                  title="Oraliq boshiga qaytish"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* O'rta: Joriy Aniq Vaqt Ko'rsatkichi va o'zgartirish */}
              <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700">
                <span className="text-[11px] text-slate-400 font-bold">Joriy Vaqt:</span>
                <input
                  type="time"
                  step="1"
                  value={currentTimeStr}
                  onChange={(e) => {
                    const sec = timeStrToSeconds(e.target.value);
                    setCurrentSeconds(Math.max(minSeconds, Math.min(maxSeconds, sec)));
                  }}
                  className="bg-transparent text-emerald-400 font-mono font-black text-sm outline-none cursor-pointer"
                />
              </div>

              {/* O'ng: Ijro Tezligi (Speed 0.5x, 1x, 2x, 4x, 8x) */}
              <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-xl border border-slate-700">
                {[0.5, 1, 2, 4, 8].map(spd => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      playbackSpeed === spd
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* O'ng qism (1 ustun): Shu vaqtdagi Turniket Voqealari ro'yxati */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-200 dark:border-slate-700/80 space-y-3 flex flex-col h-full max-h-[580px]">
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
                O'tish Voqealari
              </h3>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono font-bold">
              {cameraEvents.length} ta qayd
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            Ro'yxatdagi istalgan o'quvchi yoki o'qituvchini bosganingizda, video darhol u o'tgan soniyaga o'tadi:
          </p>

          {/* O'tishlar ro'yxati (Scrollable) */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-xs">
            {cameraEvents.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Bu kamera uchun o'tishlar topilmadi
              </div>
            ) : (
              cameraEvents.map((ev, idx) => {
                const isSelected = Math.abs(ev.seconds - currentSeconds) <= 2;
                const isEntry = ev.direction === 'in';
                const empPadded = (ev.employeeNo || '').replace(/^s-/, '').padStart(8, '0');

                return (
                  <div
                    key={ev.id || idx}
                    onClick={() => setCurrentSeconds(ev.seconds)}
                    className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-purple-100 dark:bg-purple-950/80 border-purple-400 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <StudentAvatar
                        student={{ employeeNo: empPadded, name: ev.name }}
                        effectiveBaseUrl={effectiveBaseUrl}
                        size="w-7 h-7"
                        rounded="rounded-lg"
                      />
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                          {ev.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          #{ev.employeeNo}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-[11px] font-mono font-black ${
                        isEntry ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {ev.timeFormatted}
                      </div>
                      <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                        isEntry ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700' : 'bg-rose-100 dark:bg-rose-950 text-rose-700'
                      }`}>
                        {isEntry ? 'Kirish' : 'Chiqish'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

      {/* FULLSCREEN MODAL (Agar kattalashtirilsa) */}
      {fullscreenCam && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-5xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
            
            {/* Modal Sarlavhasi */}
            <div className="p-3 bg-slate-800 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
                <span className="text-sm font-bold text-white">PLAYBACK KATTA EKRAN: {fullscreenCam.name}</span>
                <span className="text-xs text-purple-300 font-mono">({selectedDate} • {currentTimeStr})</span>
              </div>
              <button
                onClick={() => setFullscreenCam(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Video oynasi */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <img
                src={getFrameUrl(fullscreenCam.ip, currentSeconds)}
                alt={fullscreenCam.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Modal boshqaruv pulti */}
            <div className="p-3 bg-slate-800/90 border-t border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => stepSeconds(-10)}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-xs font-bold flex items-center gap-1"
                >
                  <Rewind className="w-3.5 h-3.5" /> -10s
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 text-white ${
                    isPlaying ? 'bg-amber-600' : 'bg-purple-600'
                  }`}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  {isPlaying ? 'Pauza' : 'Ijro etish'}
                </button>
                <button
                  onClick={() => stepSeconds(10)}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-xs font-bold flex items-center gap-1"
                >
                  +10s <FastForward className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 max-w-md mx-2">
                <input
                  type="range"
                  min={minSeconds}
                  max={maxSeconds}
                  value={currentSeconds}
                  onChange={handleSliderChange}
                  className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div className="text-emerald-400 font-mono font-bold text-sm">
                {currentTimeStr}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CameraPlaybackView;
