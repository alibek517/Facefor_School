import React, { useState, useEffect, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { 
  Building, 
  Users, 
  UserCheck, 
  UserX, 
  AlertCircle, 
  Printer, 
  MapPin, 
  Phone, 
  Search,
  Check,
  Video,
  Play,
  Pause,
  Maximize2,
  X,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  LogIn,
  LogOut,
  PhoneCall,
  MessageSquare,
  Filter,
  Cloud,
  Calendar,
  History,
  Globe,
  Wifi,
  ExternalLink,
  Film,
  Rewind,
  FastForward
} from 'lucide-react';
import CameraPlaybackView from './CameraPlaybackView';
import { StudentAvatar } from './StudentAvatar';
import { getStudentPhotoUrls } from '../utils/photoHelper';
import { formatPhoneNumber } from '../utils/phoneFormatter';

// Vaqtni kameraning o'zidagi asl soat bo'yicha to'g'ri ko'rsatish
const formatScanTime = (scan) => {
  if (!scan) return '--:--:--';
  if (scan.timestamp) {
    const m = String(scan.timestamp).match(/T(\d{2}:\d{2}:\d{2})/);
    if (m && m[1]) return m[1];
  }
  if (scan.timeFormatted) {
    const m = String(scan.timeFormatted).match(/(\d{2}:\d{2}:\d{2})/);
    if (m && m[1]) return m[1];
    return scan.timeFormatted;
  }
  return '--:--:--';
};

// Alohida, har bir kamerani silliq va navbat bilan (staggered) yangilovchi komponent
const CameraCard = ({ cam, bridgeUrl, livePlaying, onEnlarge, onPlayback, updateCameraType, recentFaceScans, index, onMoveLeft, onMoveRight }) => {
  const isEntry = cam.type === 'in';
  const { isLocalConnected, isSchoolLocalOnline, globalStreamUrl, cameraLatestFrames } = useSchool();
  const isLocalHost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname.startsWith('192.168.') || 
    window.location.hostname.startsWith('10.')
  );

  // Bulutdagi oxirgi kadr (Supabase yoki statik baseline)
  const cloudFrame = cameraLatestFrames?.[cam.ip] || `/photos/camera_${cam.ip}.jpg`;

  // Haqiqiy jonli ulanish bormi?
  const hasLiveTunnel = Boolean(globalStreamUrl && globalStreamUrl.startsWith('https://'));
  const isCloudRelayLive = Boolean(!isLocalConnected && !isLocalHost && (isSchoolLocalOnline || cameraLatestFrames?.[cam.ip]));
  const canLiveStream = Boolean(isLocalConnected || isLocalHost || hasLiveTunnel || isCloudRelayLive);
  const liveBaseUrl = (isLocalConnected || isLocalHost)
    ? (bridgeUrl && !bridgeUrl.includes('trycloudflare.com') ? bridgeUrl : 'http://localhost:5001')
    : (hasLiveTunnel ? globalStreamUrl : null);

  const [frameSrc, setFrameSrc] = useState(cloudFrame);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [hasError, setHasError] = useState(false);
  const lastScan = cam.lastEvent || (recentFaceScans || []).find(s => s.cameraIp === cam.ip || s.cameraId === cam.id);

  // Bulutdagi yangi kadr kelganda yangilash (agar jonli efir bo'lmasa)
  useEffect(() => {
    if (!isLiveActive && cloudFrame) {
      setFrameSrc(cloudFrame);
      setHasError(false);
    }
  }, [cloudFrame, isLiveActive]);

  useEffect(() => {
    // Agar jonli efir mavjud bo'lmasa yoki pauza qilingan bo'lsa
    if (!livePlaying || !canLiveStream) {
      setIsLiveActive(false);
      return;
    }

    if (liveBaseUrl) {
      let isMounted = true;
      let timer = null;

      const loadNext = () => {
        if (!isMounted || !liveBaseUrl) return;
        const nextUrl = `${liveBaseUrl}/api/camera/snapshot/${cam.ip}?t=${Date.now()}`;
        const img = new Image();
        img.onload = () => {
          img.onload = null;
          img.onerror = null;
          if (!isMounted) return;
          setFrameSrc(nextUrl);
          setIsLiveActive(true);
          setHasError(false);
          timer = setTimeout(loadNext, 750);
        };
        img.onerror = () => {
          img.onload = null;
          img.onerror = null;
          if (!isMounted) return;
          setIsLiveActive(false);
          // Jonli kadr uzilsa, oxirgi bulut kadriga qaytamiz
          if (cloudFrame) {
            setFrameSrc(cloudFrame);
          }
          timer = setTimeout(loadNext, 4000);
        };
        img.src = nextUrl;
      };

      const initTimer = setTimeout(loadNext, (index % 6) * 125);

      return () => {
        isMounted = false;
        clearTimeout(initTimer);
        if (timer) clearTimeout(timer);
      };
    }

    // Global rejimda (lokal profil orqali jonli bulut efiri)
    if (isCloudRelayLive && cloudFrame) {
      setFrameSrc(cloudFrame);
      setIsLiveActive(true);
      setHasError(false);
    }
  }, [cam.ip, livePlaying, index, liveBaseUrl, canLiveStream, cloudFrame, isCloudRelayLive]);

  return (
    <div className="bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700/80 overflow-hidden flex flex-col transition-all hover:border-blue-400 hover:shadow-md">
      {/* Kamera Sarlavhasi va Sozlamasi */}
      <div className="p-2.5 bg-white dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-1.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${cam.online ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {cam.name}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            IP: {cam.ip} • 8000/80
          </div>
        </div>

        {/* Yo'nalishni tanlash (Kirish <-> Chiqish) */}
        <div className="flex items-center gap-1 shrink-0">
          <select
            value={cam.type}
            onChange={(e) => updateCameraType(cam.id, e.target.value)}
            title="Turniket yo'nalishini belgilash"
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer border transition-colors outline-none ${
              isEntry
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-400'
            }`}
          >
            <option value="in">🟢 KIRISH</option>
            <option value="out">🔴 CHIQISH</option>
          </select>

          {onMoveLeft && (
            <button
              onClick={(e) => { e.stopPropagation(); onMoveLeft(); }}
              className="px-1.5 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-[11px] font-black transition-colors"
              title="Kamerani chapga siljitish"
            >
              ◀
            </button>
          )}
          {onMoveRight && (
            <button
              onClick={(e) => { e.stopPropagation(); onMoveRight(); }}
              className="px-1.5 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-[11px] font-black transition-colors"
              title="Kamerani o'ngga siljitish"
            >
              ▶
            </button>
          )}

          {onPlayback && (
            <button
              onClick={(e) => { e.stopPropagation(); onPlayback(cam); }}
              className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/60 rounded text-purple-600 dark:text-purple-400 transition-colors"
              title="Kamerani ortga qaytarish (Playback)"
            >
              <Film className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onEnlarge(cam)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Katta ekranda ko'rish"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Jonli Video Oyna */}
      <div 
        className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden cursor-pointer group"
        onClick={() => onEnlarge(cam)}
      >
        {!hasError && (frameSrc || cloudFrame) ? (
          <img
            src={frameSrc || cloudFrame}
            alt={cam.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
            onError={() => {
              if (frameSrc !== cloudFrame && cloudFrame) {
                setFrameSrc(cloudFrame);
              } else {
                setHasError(true);
              }
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-3 text-center select-none">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 mb-1.5 shadow-inner">
              <Video className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-xs font-bold text-slate-200">{cam.name}</span>
            <span className="text-[10px] text-slate-400 mt-0.5 max-w-[200px] leading-tight">
              Kamera kutish rejimida • Oxirgi kadr kutilmoqda
            </span>
          </div>
        )}

        {/* Jonli Efir Belgisi (Live Badge) */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white border border-white/10">
          <span className={`w-1.5 h-1.5 rounded-full ${isLiveActive ? 'bg-emerald-500 animate-pulse' : 'bg-blue-400'}`}></span>
          <span>
            {isLiveActive 
              ? (isLocalConnected ? 'LIVE' : (hasLiveTunnel ? 'GLOBAL LIVE' : 'JONLI KO\'PRIK')) 
              : 'OXIRGI KADR (BULUT)'}
          </span>
        </div>

        {/* Yo'nalish overlay */}
        <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-black text-white ${
          isEntry ? 'bg-emerald-600/90' : 'bg-rose-600/90'
        }`}>
          {isEntry ? 'KIRISH' : 'CHIQISH'}
        </div>

        {/* Hoverda kattalashtirish belgisi */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-bold">
          <Maximize2 className="w-4 h-4" />
          Kattalashtirish
        </div>
      </div>

      {/* Oxirgi o'tgan shaxs (Real-Time Face Scan) */}
      <div className="p-2 bg-white dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
        {lastScan ? (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 border border-slate-200 dark:border-slate-600 relative">
              <CameraLastScanThumb lastScan={lastScan} effectiveBaseUrl={effectiveBaseUrl} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                {lastScan.name}
              </div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                <span className={isEntry ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  {formatScanTime(lastScan)}
                </span>
                <span>• #{lastScan.employeeNo}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-[10px] text-slate-400 dark:text-slate-500 italic py-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-slate-400" />
            Yangi o'tishlar kutilmoqda...
          </div>
        )}

        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
          isEntry ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
        }`}>
          {isEntry ? '↓ Kirish' : '↑ Chiqish'}
        </span>
      </div>
    </div>
  );
};

// Kamera ostidagi oxirgi o'tgan shaxs surati
const CameraLastScanThumb = ({ lastScan, effectiveBaseUrl }) => {
  const [hasError, setHasError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const { primaryUrl, fallbackUrl } = getStudentPhotoUrls(lastScan, effectiveBaseUrl);

  useEffect(() => {
    setHasError(false);
    setUseFallback(false);
  }, [lastScan?.employeeNo, lastScan?.serialNo, primaryUrl, fallbackUrl]);

  const currentSrc = useFallback ? fallbackUrl : primaryUrl;

  const handleError = () => {
    if (!useFallback && fallbackUrl && fallbackUrl !== primaryUrl) {
      setUseFallback(true);
    } else {
      setHasError(true);
    }
  };

  if (hasError || !currentSrc) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
        {(lastScan?.name || 'O').charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={lastScan?.name || ''}
      className="w-full h-full object-cover"
      onError={handleError}
    />
  );
};

// Arxivdagi kadr va o'tish kartasi (React xatolarini oldini oluvchi reaktiv komponent)
const ArchiveCard = ({ scan, effectiveBaseUrl }) => {
  const [hasError, setHasError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const { primaryUrl, fallbackUrl } = getStudentPhotoUrls(scan, effectiveBaseUrl);

  useEffect(() => {
    setHasError(false);
    setUseFallback(false);
  }, [scan?.id, scan?.employeeNo, primaryUrl, fallbackUrl]);

  const currentSrc = useFallback ? fallbackUrl : primaryUrl;

  const handleError = () => {
    if (!useFallback && fallbackUrl && fallbackUrl !== primaryUrl) {
      setUseFallback(true);
    } else {
      setHasError(true);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 text-center space-y-1 hover:border-purple-400 transition-all">
      <div className="w-12 h-12 mx-auto rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 relative shadow-2xs">
        {currentSrc && !hasError ? (
          <img
            src={currentSrc}
            alt={scan.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={handleError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center">
            {(scan.name || 'O').charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate" title={scan.name}>
        {scan.name}
      </div>
      <div className="text-[9px] text-slate-400 font-mono">
        {formatScanTime(scan)}
      </div>
      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded ${
        scan.direction === 'in' 
          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
      }`}>
        {scan.direction === 'in' ? '↓ Kirish' : '↑ Chiqish'}
      </span>
    </div>
  );
};

export const DirectorDashboard = () => {
  const { classes, students, attendanceList, cameras, updateCameraType, reorderCameras, bridgeUrl, recentFaceScans, faceDevice, syncAllToSupabase, isLocalConnected, globalStreamUrl, setGlobalStreamUrl } = useSchool();
  const isLocalHost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname.startsWith('192.168.') || 
    window.location.hostname.startsWith('10.')
  );
  const effectiveBaseUrl = (isLocalConnected || isLocalHost)
    ? (bridgeUrl && !bridgeUrl.includes('trycloudflare.com') ? bridgeUrl : 'http://localhost:5001')
    : (globalStreamUrl || bridgeUrl || 'http://localhost:5001');
  const [selectedClass, setSelectedClass] = useState('all');
  const [cameraFilter, setCameraFilter] = useState('all'); // 'all', 'in', 'out'
  const [cameraMode, setCameraMode] = useState('live'); // 'live' yoki 'playback'
  const [playbackCamIp, setPlaybackCamIp] = useState(null);
  const [livePlaying, setLivePlaying] = useState(true);
  const [activeModalCam, setActiveModalCam] = useState(null);
  const [syncingCloud, setSyncingCloud] = useState(false);

  const handleMoveCamera = (cameraId, direction) => {
    const list = [...(cameras || [])];
    const currentIndex = list.findIndex(c => c.id === cameraId);
    if (currentIndex < 0) return;
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[currentIndex];
    list[currentIndex] = list[targetIndex];
    list[targetIndex] = temp;
    if (reorderCameras) reorderCameras(list);
  };

  // 📅 Tanlangan sana (Dastlab bugungi kun - O'zbekiston mahalliy vaqti bilan)
  const getTodayDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const todayStr = useMemo(() => getTodayDateStr(), []);
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateStr());
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [tempGlobalUrl, setTempGlobalUrl] = useState(() => globalStreamUrl || '');

  useEffect(() => {
    if (globalStreamUrl) setTempGlobalUrl(globalStreamUrl);
  }, [globalStreamUrl]);

  // Bugungi davomatni saralash: 'entered' (kirganlar) | 'absent' (kirmaganlar) | 'exited' (chiqqanlar) | 'all' (barchasi)
  const [attendanceTab, setAttendanceTab] = useState('entered');
  const [studentSearch, setStudentSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(50);

  // Tanlangan sana (selectedDate) bo'yicha davomat yozuvlari
  const selectedDateRecords = useMemo(() => {
    return (attendanceList || [])
      .filter(att => att.date === selectedDate)
      .flatMap(att => 
        (att.records || []).map(r => ({ ...r, classId: att.classId, inspector: att.inspectorName, date: att.date }))
      );
  }, [attendanceList, selectedDate]);

  // Tanlangan sana (selectedDate) bo'yicha Face-ID o'tishlari
  const selectedDateScans = useMemo(() => {
    return (recentFaceScans || []).filter(s => {
      if (!s.timestamp) return true;
      return String(s.timestamp).startsWith(selectedDate);
    });
  }, [recentFaceScans, selectedDate]);

  // Barcha faol (1-11 sinf) o'quvchilarining tanlangan sana bo'yicha aniq holati (Bitiruvchilarsiz)
  const enrichedStudents = useMemo(() => {
    return (students || [])
      .filter(s => s.status !== 'graduated' && s.classId !== 'graduated')
      .map(student => {
        const normId = String(student.studentId || student.faceId || student.id || '').replace(/^s-/, '').replace(/^0+/, '');
        
        // Face-ID o'tishlaridan qidirish (shu sanadagi)
        const scans = selectedDateScans.filter(s => {
          const sEmp = String(s.employeeNo || '').replace(/^0+/, '');
          const sName = (s.name || '').toLowerCase().trim();
          const stName = (student.fullName || student.name || '').toLowerCase().trim();
          return (sEmp && sEmp === normId) || (sName && stName && (sName === stName || sName.includes(stName) || stName.includes(sName)));
        });

        const inScans = scans.filter(s => s.direction === 'in');
        const outScans = scans.filter(s => s.direction === 'out');
        const firstInScan = inScans[inScans.length - 1] || inScans[0];
        const lastScan = scans[0];

        // O'qituvchi / navbatchi kiritgan davomat yozuvi (shu sanadagi)
        const attRecord = selectedDateRecords.find(r => r.studentId === student.id || r.studentId === student.studentId);

        // Turniketdan o'tgan bo'lsa (har qanday kamera) YOKI davomatda bor deb belgilangan bo'lsa:
        const hasAnyScan = scans.length > 0;
        const hasEntered = hasAnyScan || !!firstInScan || (attRecord && (attRecord.status === 'present' || attRecord.status === 'exited' || attRecord.inTime));
        
        // Chiqib ketgan holati:
        const hasExited = hasEntered && (
          (lastScan && lastScan.direction === 'out') ||
          (attRecord && attRecord.status === 'exited' && !inScans.some(s => s.timestamp > (outScans[0]?.timestamp || 0)))
        );
        const isInside = hasEntered && !hasExited;

        const entryTime = (firstInScan ? formatScanTime(firstInScan) : null) || 
                          (scans[scans.length - 1] ? formatScanTime(scans[scans.length - 1]) : null) || 
                          attRecord?.inTime || 
                          (hasEntered ? '08:15' : null);
        const exitTime = hasExited ? (formatScanTime(lastScan) || attRecord?.outTime) : null;
        const gateName = firstInScan?.cameraName || lastScan?.cameraName || (attRecord?.inspector ? `Qayd: ${attRecord.inspector}` : 'Turniket');

        const cl = (classes || []).find(c => c.id === student.classId);

        return {
          ...student,
          className: cl?.name || 'Sinf biriktirilmagan',
          grade: cl?.grade || 1,
          hasEntered,
          isInside,
          hasExited,
          entryTime,
          exitTime,
          gateName,
          lastScan,
          attRecord,
          statusType: hasEntered ? (hasExited ? 'exited' : 'inside') : 'absent'
        };
      });
  }, [students, selectedDateScans, selectedDateRecords, classes]);

  // Sinf filtri bo'yicha KPI hisoblash
  const scopedStudents = useMemo(() => {
    return selectedClass === 'all' 
      ? enrichedStudents 
      : enrichedStudents.filter(s => s.classId === selectedClass);
  }, [enrichedStudents, selectedClass]);

  const enteredStudents = useMemo(() => scopedStudents.filter(s => s.hasEntered), [scopedStudents]);
  const insideStudents = useMemo(() => scopedStudents.filter(s => s.isInside), [scopedStudents]);
  const exitedStudents = useMemo(() => scopedStudents.filter(s => s.hasExited), [scopedStudents]);
  const absentStudents = useMemo(() => scopedStudents.filter(s => !s.hasEntered), [scopedStudents]);

  const totalCount = scopedStudents.length || 1;
  const enteredPercent = Math.round((enteredStudents.length / totalCount) * 100);
  const absentPercent = Math.round((absentStudents.length / totalCount) * 100);

  // Tanlangan tab va filtrlar bo'yicha ko'rsatiladigan o'quvchilar
  const displayedStudents = useMemo(() => {
    let list = enrichedStudents;
    if (attendanceTab === 'entered') list = enteredStudents;
    else if (attendanceTab === 'absent') list = absentStudents;
    else if (attendanceTab === 'exited') list = exitedStudents;

    if (selectedClass !== 'all') {
      list = list.filter(s => s.classId === selectedClass);
    }

    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase().trim();
      list = list.filter(s => 
        (s.fullName || s.name || '').toLowerCase().includes(q) ||
        String(s.studentId || '').includes(q) ||
        (s.parentName || '').toLowerCase().includes(q) ||
        (s.parentPhone || '').includes(q)
      );
    }

    return list;
  }, [enrichedStudents, enteredStudents, absentStudents, exitedStudents, attendanceTab, selectedClass, studentSearch]);

  const gradesList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  const handleCloudSync = async () => {
    if (!syncAllToSupabase) return;
    setSyncingCloud(true);
    try {
      await syncAllToSupabase();
    } finally {
      setSyncingCloud(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      
      {/* Sarlavha, Supabase sinxronizatsiyasi va Chop etish */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 transition-colors">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Direktor Monitoring Markazi</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-normal">
              737 ta o'quvchi
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bugungi jonli Face-ID va sinflar kesimidagi umumiy davomat nazorati
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Supabase Bulutiga Saqlash / Sinxronlash tugmasi */}
          <button
            onClick={handleCloudSync}
            disabled={syncingCloud}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
            title="Barcha o'quvchi va maktab ma'lumotlarini Supabase bulut bazasiga saqlash"
          >
            <Cloud className={`w-3.5 h-3.5 ${syncingCloud ? 'animate-bounce' : ''}`} />
            <span>{syncingCloud ? 'Yuklanmoqda...' : 'Supabase Bulutiga Saqlash'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Chop etish
          </button>
        </div>
      </div>

      {/* 📅 KUN BO'YICHA DAVOMAT TANLASH VA FILTRLASH PANELI */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 transition-colors shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-950/60 rounded-lg text-blue-600 dark:text-blue-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Davomat Sanasi:</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold">
                {selectedDate}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Qaysi kunda nechta va aynan kimlar maktabga kelganini to'liq ko'rish
            </p>
          </div>
        </div>

        {/* Faqat 2 ta element: Bugungi kunga qaytish va Boshqa sana kalendari */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-xs ${
              selectedDate === todayStr
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Bugungi jonli kun davomatiga qaytish"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Bugungi kunga qaytish</span>
          </button>

          {/* Kalendar orqali istalgan sanani tanlash */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs text-slate-600 dark:text-slate-300 font-bold">Boshqa sana:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs bg-transparent text-slate-900 dark:text-slate-100 outline-none font-bold cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4 ta Interaktiv Jonli KPI Blok (Ustiga bosib to'g'ridan-to'g'ri ro'yxatni ko'rish mumkin) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        
        {/* 1. Maktabga kirganlar */}
        <div 
          onClick={() => setAttendanceTab('entered')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            attendanceTab === 'entered'
              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 shadow-sm ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Maktabga Kirgan
            </span>
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {enteredStudents.length} <span className="text-xs font-medium text-slate-400">({enteredPercent}%)</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {insideStudents.length} ichkarida • {exitedStudents.length} chiqdi
          </div>
        </div>

        {/* 2. Umuman kirmaganlar */}
        <div 
          onClick={() => setAttendanceTab('absent')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            attendanceTab === 'absent'
              ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-400 dark:border-rose-700 shadow-sm ring-2 ring-rose-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-700 dark:text-rose-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Umuman Kirmagan
            </span>
            <UserX className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
            {absentStudents.length} <span className="text-xs font-medium text-slate-400">({absentPercent}%)</span>
          </div>
          <div className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5 truncate">
            O'tish qayd etilmadi
          </div>
        </div>

        {/* 3. Chiqib ketganlar */}
        <div 
          onClick={() => setAttendanceTab('exited')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            attendanceTab === 'exited'
              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 shadow-sm ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
              <LogOut className="w-3.5 h-3.5 text-amber-500" />
              Chiqib Ketgan
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 rounded">
              Turniket
            </span>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
            {exitedStudents.length} <span className="text-xs font-medium text-slate-400">nafar</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            Chiqish turniketidan o'tgan
          </div>
        </div>

        {/* 4. Jami o'quvchilar */}
        <div 
          onClick={() => setAttendanceTab('all')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            attendanceTab === 'all'
              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-sm ring-2 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              Jami O'quvchilar
            </span>
            <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {scopedStudents.length} <span className="text-xs font-medium text-slate-400">nafar</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {selectedClass === 'all' ? '1 - 11 sinflar bo\'yicha' : `${(classes.find(c => c.id === selectedClass)?.name || '')} sinfi bo'yicha`}
          </div>
        </div>

      </div>

      {/* 📹 6 TA JONLI TURNIKET KAMERALARI (3 KIRISH / 3 CHIQISH) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 space-y-3 transition-colors shadow-xs">
        
        {/* Sarlavha, Filtrlar va Jonli boshqaruv */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950/60 rounded-lg text-blue-600 dark:text-blue-400">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Turniket Kameralari (6 ta Jonli Efir)
                </h2>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE ONLAYN
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                3 ta Kirish va 3 ta Chiqish turniketlarining to'g'ridan-to'g'ri jonli video tasviri
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Rejim tanlash: Jonli Efir vs Arxiv & Qaytarish (Playback) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
              <button
                onClick={() => setCameraMode('live')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                  cameraMode === 'live'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                <span>Jonli Efir</span>
              </button>
              <button
                onClick={() => setCameraMode('playback')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                  cameraMode === 'playback'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-purple-600'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Arxiv & Qaytarish (Playback)</span>
              </button>
            </div>

            {cameraMode === 'live' && (
              <>
                {/* Filtrlar: Barchasi, Kirish, Chiqish */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setCameraFilter('all')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                      cameraFilter === 'all'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Barchasi (6)
                  </button>
                  <button
                    onClick={() => setCameraFilter('in')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
                      cameraFilter === 'in'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                    }`}
                  >
                    <ArrowDownRight className="w-3 h-3" />
                    Kirish (3)
                  </button>
                  <button
                    onClick={() => setCameraFilter('out')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
                      cameraFilter === 'out'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                    }`}
                  >
                    <ArrowUpRight className="w-3 h-3" />
                    Chiqish (3)
                  </button>
                </div>

                {/* Play / Pause & Refresh */}
                <button
                  onClick={() => setLivePlaying(!livePlaying)}
                  className={`p-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 transition-all ${
                    livePlaying
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                      : 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                  }`}
                  title={livePlaying ? 'Jonli efirni to\'xtatib turish' : 'Efirni davom ettirish'}
                >
                  {livePlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline text-[11px]">{livePlaying ? 'Jonli' : 'To\'xtatilgan'}</span>
                </button>
              </>
            )}

            {/* Global Stream Sozlash Tugmasi */}
            <button
              onClick={() => setShowGlobalSettings(!showGlobalSettings)}
              className={`p-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 transition-all ${
                globalStreamUrl 
                  ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-300 text-purple-700 dark:text-purple-300' 
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
              title="Vercel va tashqi Wi-Fi uchun global video serverini sozlash"
            >
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[11px] hidden sm:inline">Global Stream</span>
            </button>
          </div>
        </div>

        {/* Global Video Stream sozlama qutisi (Vercel va boshqa Wi-Fi tarmoqlari uchun) */}
        {showGlobalSettings && (
          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-blue-900 dark:text-blue-300">
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-600" />
                Global Video Efir Sozlamasi (Vercel & Tashqi Wi-Fi uchun)
              </span>
              <button onClick={() => setShowGlobalSettings(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Siz maktab Wi-Fi tarmog'idan tashqarida bo'lganingizda (masalan, Vercel yoki mobil internetda) 6 ta kamerani jonli ko'rish uchun maktab kompyuteridagi bepul <b>Cloudflare Tunnel</b> yoki <b>Ngrok</b> havolasini kiriting:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempGlobalUrl}
                onChange={(e) => setTempGlobalUrl(e.target.value)}
                placeholder="Masalan: https://maktab-cams.trycloudflare.com yoki http://IP:5001"
                className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-mono"
              />
              <button
                onClick={() => {
                  setGlobalStreamUrl(tempGlobalUrl);
                  setShowGlobalSettings(false);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
              >
                Saqlash
              </button>
            </div>
          </div>
        )}

        {/* REJIMGA MOS KO'RINISHLAR: PLAYBACK YOKI JONLI EFIR */}
        {cameraMode === 'playback' ? (
          <CameraPlaybackView
            cameras={cameras}
            effectiveBaseUrl={effectiveBaseUrl}
            initialDate={selectedDate}
            initialCameraIp={playbackCamIp}
            allScans={selectedDateScans}
          />
        ) : (
          <>
            {/* Kameralar paneli (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(cameras || []).filter(c => cameraFilter === 'all' || c.type === cameraFilter).map((cam, idx) => (
                <CameraCard
                  key={cam.id}
                  cam={cam}
                  index={idx}
                  bridgeUrl={effectiveBaseUrl}
                  livePlaying={livePlaying}
                  onEnlarge={(c) => setActiveModalCam(c)}
                  onPlayback={(c) => {
                    setPlaybackCamIp(c.ip);
                    setCameraMode('playback');
                  }}
                  updateCameraType={updateCameraType}
                  recentFaceScans={selectedDateScans}
                  onMoveLeft={(() => {
                    const cIdx = (cameras || []).findIndex(x => x.id === cam.id);
                    return cIdx > 0 ? () => handleMoveCamera(cam.id, -1) : null;
                  })()}
                  onMoveRight={(() => {
                    const cIdx = (cameras || []).findIndex(x => x.id === cam.id);
                    return cIdx >= 0 && cIdx < (cameras || []).length - 1 ? () => handleMoveCamera(cam.id, 1) : null;
                  })()}
                />
              ))}
            </div>

            {/* 🎞️ OXIRGI 7 KUNLIK KADRLAR VA O'TISHLAR ARXIVI */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <History className="w-4 h-4 text-purple-600" />
                  <span>{selectedDate} Sanasidagi Kadrlar va O'tishlar Arxivi ({selectedDateScans.length} ta qayd)</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Oxirgi 7 kunlik yuzlar va o'tish kadrlarini ko'rish
                </span>
              </div>

              {selectedDateScans.length === 0 ? (
                <div className="py-4 text-center rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-400">
                  Bu sanada saqlangan kadrlar yoki turniket o'tishlari mavjud emas. Yuqoridagi sanalardan birini tanlab ko'ring.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {selectedDateScans.slice(0, 18).map((scan, sIdx) => (
                    <ArchiveCard
                      key={scan.id || `${scan.serialNo || ''}-${scan.employeeNo || ''}-${scan.timeFormatted || sIdx}`}
                      scan={scan}
                      effectiveBaseUrl={effectiveBaseUrl}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Kamera Katta Ekranda Modali */}
      {activeModalCam && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-4xl w-full overflow-hidden shadow-2xl space-y-0">
            <div className="p-3 bg-slate-800 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-sm font-bold text-white">{activeModalCam.name}</span>
                <span className="text-xs text-slate-400 font-mono">({activeModalCam.ip})</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                  activeModalCam.type === 'in' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}>
                  {activeModalCam.type === 'in' ? 'KIRISH TURNIKETI' : 'CHIQISH TURNIKETI'}
                </span>
              </div>
              <button
                onClick={() => setActiveModalCam(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {(() => {
                const modalCloudFrame = cameraLatestFrames?.[activeModalCam.ip] || `/photos/camera_${activeModalCam.ip}.jpg`;
                const modalLiveUrl = (isLocalConnected || isLocalHost)
                  ? `${bridgeUrl || 'http://localhost:5001'}/api/camera/stream/${activeModalCam.ip}`
                  : (globalStreamUrl && globalStreamUrl.startsWith('https://') ? `${globalStreamUrl}/api/camera/stream/${activeModalCam.ip}` : null);
                const isModalLive = Boolean(modalLiveUrl || (isSchoolLocalOnline && cameraLatestFrames?.[activeModalCam.ip]));

                return (
                  <>
                    <img
                      src={modalLiveUrl || modalCloudFrame}
                      alt={activeModalCam.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        if (e.target.src !== modalCloudFrame) {
                          e.target.src = modalCloudFrame;
                        }
                      }}
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded bg-black/70 text-xs font-bold text-white border border-white/20">
                      <span className={`w-2 h-2 rounded-full ${isModalLive ? 'bg-emerald-500 animate-pulse' : 'bg-blue-400'}`}></span>
                      {modalLiveUrl 
                        ? (isLocalConnected ? 'LIVE VIDEO OQIMI' : 'GLOBAL LIVE VIDEO OQIMI')
                        : (isModalLive ? 'JONLI BULUT KO\'PRIGI (LIVE)' : 'OXIRGI KADR (BULUT)')}
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="p-3 bg-slate-800/80 flex items-center justify-between text-xs text-slate-300">
              <span>Model: DS-K1T343MFWX (Hikvision Access Control Terminal)</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPlaybackCamIp(activeModalCam.ip);
                    setActiveModalCam(null);
                    setCameraMode('playback');
                  }}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Film className="w-3.5 h-3.5" />
                  Ortga qaytarib ko'rish (Playback)
                </button>
                <button
                  onClick={() => updateCameraType(activeModalCam.id, activeModalCam.type === 'in' ? 'out' : 'in')}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors"
                >
                  Yo'nalishni almashtirish ({activeModalCam.type === 'in' ? 'Chiqishga o\'tkazish' : 'Kirishga o\'tkazish'})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sinflar Matritsasi (Rasmga mos 1-11) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Sinflar kesimida davomat (1 - 11 sinflar):
          </label>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold">
            {classes.filter(c => {
              const att = attendanceList.find(a => a.classId === c.id && a.date === selectedDate);
              const cStudents = students.filter(s => s.classId === c.id);
              return att && att.records && att.records.length >= Math.max(1, cStudents.length * 0.8);
            }).length} / {classes.length} sinf topshirdi
          </span>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="flex gap-2 min-w-[650px] justify-between">
            {gradesList.map(gradeNum => {
              const gradeClasses = classes.filter(c => c.grade === gradeNum);

              return (
                <div key={gradeNum} className="flex-1 flex flex-col items-center">
                  <span className="text-sm font-black text-slate-400 dark:text-slate-500 mb-1">
                    {gradeNum}
                  </span>
                  <div className="flex flex-col gap-1 w-full">
                    {gradeClasses.map(c => {
                      const classAtt = attendanceList.find(a => a.classId === c.id && a.date === selectedDate);
                      const classStudents = students.filter(s => s.classId === c.id);
                      const totalInClass = classStudents.length;

                      let presentCount = 0;
                      let absentCount = 0;
                      let isOfficiallySubmitted = false;

                      if (classAtt && classAtt.records && classAtt.records.length > 0) {
                        presentCount = classAtt.records.filter(r => r.status === 'present').length;
                        absentCount = classAtt.records.filter(r => r.status === 'absent').length;
                        isOfficiallySubmitted = classAtt.records.length >= Math.max(1, totalInClass * 0.8);
                      } else {
                        // Agar rasmiy topshirilmagan bo'lsa, tanlangan sanadagi turniketdan kirganlar sonini olamiz
                        const classEnriched = (enrichedStudents || []).filter(s => s.classId === c.id);
                        presentCount = classEnriched.filter(s => s.hasEntered).length;
                        absentCount = Math.max(0, totalInClass - presentCount);
                      }

                      const effectiveAbsent = totalInClass > 0 ? Math.max(0, totalInClass - presentCount) : absentCount;
                      const is100PercentPresent = totalInClass > 0 && presentCount === totalInClass && absentCount === 0;

                      return (
                        <div
                          key={c.id}
                          className={`w-full py-1 px-1 text-center text-xs font-bold rounded-lg border truncate transition-colors ${
                            isOfficiallySubmitted
                              ? is100PercentPresent
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60'
                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/60'
                              : presentCount > 0
                              ? 'bg-blue-50/50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/50'
                              : 'bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                          title={`${c.name} (${isOfficiallySubmitted ? (is100PercentPresent ? 'To\'liq qatnashgan' : `Yo'q: ${absentCount || effectiveAbsent}`) : presentCount > 0 ? `${presentCount}/${totalInClass} kelgan (Davomat topshirilmagan)` : 'Hali topshirilmagan'})`}
                        >
                          <div>{c.name}</div>
                          <div className="text-[9px] font-normal">
                            {isOfficiallySubmitted ? (
                              is100PercentPresent ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ To'liq</span>
                              ) : (
                                <span className="text-amber-600 dark:text-amber-400 font-bold">{absentCount || effectiveAbsent} yo'q</span>
                              )
                            ) : presentCount > 0 ? (
                              <span className="text-blue-600 dark:text-blue-400">{presentCount}/{totalInClass}</span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500">{totalInClass > 0 ? `${totalInClass} ta` : '-'}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 📋 KUN BO'YICHA O'QUVCHILAR DAVOMATI VA RO'YXATI (KIRGANLAR VA UMUMAN KIRMAGANLAR) */}
      <div id="attendance-section" className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 transition-colors space-y-3">
        
        {/* Yuqori Panel: Sarlavha va Tablar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{selectedDate} Sanasidagi O'quvchilar Davomati</span>
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {displayedStudents.length} ta natija
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Turniket va Face-ID orqali shu sanada maktabga kelganlar hamda umuman kelmaganlar
            </p>
          </div>

          {/* Davomat Tablari */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => { setAttendanceTab('entered'); setVisibleCount(50); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                attendanceTab === 'entered'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Kirganlar</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                attendanceTab === 'entered' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
              }`}>
                {enteredStudents.length}
              </span>
            </button>

            <button
              onClick={() => { setAttendanceTab('absent'); setVisibleCount(50); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                attendanceTab === 'absent'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Umuman Kirmagan</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                attendanceTab === 'absent' ? 'bg-rose-700 text-white' : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
              }`}>
                {absentStudents.length}
              </span>
            </button>

            <button
              onClick={() => { setAttendanceTab('exited'); setVisibleCount(50); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                attendanceTab === 'exited'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Chiqib Ketgan</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                attendanceTab === 'exited' ? 'bg-amber-700 text-white' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
              }`}>
                {exitedStudents.length}
              </span>
            </button>

            <button
              onClick={() => { setAttendanceTab('all'); setVisibleCount(50); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                attendanceTab === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Barchasi</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                attendanceTab === 'all' ? 'bg-blue-700 text-white' : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
              }`}>
                {enrichedStudents.length}
              </span>
            </button>
          </div>
        </div>

        {/* Filtr va Qidiruv Qatori */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Qidiruv */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => { setStudentSearch(e.target.value); setVisibleCount(50); }}
              placeholder="O'quvchi ismi, ID raqami yoki ota-onasi bo'yicha qidirish..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            {studentSearch && (
              <button 
                onClick={() => setStudentSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sinf Tanlash */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            <select
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setVisibleCount(50); }}
              className="w-full sm:w-auto text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 outline-none font-medium focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="all">Barcha sinflar ({classes.length} ta sinf)</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {(selectedClass !== 'all' || studentSearch) && (
              <button
                onClick={() => { setSelectedClass('all'); setStudentSearch(''); }}
                className="px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors shrink-0"
                title="Filtrlarni tozalash"
              >
                Tozalash
              </button>
            )}
          </div>
        </div>

        {/* O'quvchilar Ro'yxati */}
        {displayedStudents.length === 0 ? (
          <div className="py-12 text-center rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800">
            <UserX className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Bu bo'limda hech qanday o'quvchi topilmadi
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Qidiruv so'zini yoki sinf filtrini o'zgartirib ko'ring
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {displayedStudents.slice(0, visibleCount).map((student) => {
                const normId = String(student.studentId || student.id || '').replace(/^0+/, '');
                const isEntered = student.hasEntered;
                const isAbsent = !student.hasEntered;
                const isExited = student.hasExited;

                return (
                  <div
                    key={student.id || student.studentId}
                    className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                      isAbsent
                        ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200/70 dark:border-rose-900/40 hover:border-rose-300'
                        : isExited
                        ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/40 hover:border-amber-300'
                        : 'bg-emerald-50/20 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-900/40 hover:border-emerald-300'
                    }`}
                  >
                    {/* Yuqori qism: O'quvchi ma'lumoti va holati */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <StudentAvatar
                            student={student}
                            effectiveBaseUrl={effectiveBaseUrl}
                            size="w-9 h-9"
                            rounded="rounded-full"
                          />
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                            isAbsent ? 'bg-rose-500' : isExited ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}></span>
                        </div>

                        {/* Ismi, ID va Sinflari */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {student.fullName || student.name}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 shrink-0">
                              {student.className}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            ID: #{normId || student.studentId}
                          </div>
                        </div>
                      </div>

                      {/* Holat belgisi (Badge) */}
                      <div className="shrink-0 text-right">
                        {isAbsent ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <XCircle className="w-3 h-3 text-rose-500" />
                            Kirmagan
                          </span>
                        ) : isExited ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <LogOut className="w-3 h-3 text-amber-500" />
                            Chiqib ketgan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Maktab ichida
                          </span>
                        )}
                      </div>
                    </div>

                    {/* O'rta qism: Vaqti va Turniket/Sabab tafsiloti */}
                    <div className="bg-white/60 dark:bg-slate-800/40 p-2 rounded-lg text-[11px] space-y-1">
                      {isEntered ? (
                        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                          <span className="flex items-center gap-1">
                            <LogIn className="w-3 h-3 text-emerald-600" />
                            Kirish vaqti: <b className="text-emerald-700 dark:text-emerald-400">{student.entryTime || '08:15'}</b>
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {student.gateName}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-rose-700 dark:text-rose-300">
                          <span className="flex items-center gap-1 font-semibold">
                            <Clock className="w-3 h-3 text-rose-500" />
                            Bugun turniketdan o'tmagan
                          </span>
                          {student.attRecord?.reason && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-rose-100 dark:bg-rose-950 rounded text-rose-800 dark:text-rose-300">
                              {student.attRecord.reason}
                            </span>
                          )}
                        </div>
                      )}

                      {isExited && (
                        <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                          <span className="flex items-center gap-1">
                            <LogOut className="w-3 h-3 text-amber-600" />
                            Chiqish vaqti: <b>{student.exitTime}</b>
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {student.lastScan?.cameraName || 'Chiqish turniket'}
                          </span>
                        </div>
                      )}

                      {/* Manzili */}
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 truncate pt-0.5">
                        <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                        <span className="truncate">{student.address || student.attRecord?.customAddress || 'Manzil ko\'rsatilmagan'}</span>
                      </div>
                    </div>

                    {/* Pastki qism: Ota-onasi va Tezkor Bog'lanish Tugmasi */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="text-[11px] min-w-0">
                        <span className="text-slate-400 text-[10px]">Ota-onasi: </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {student.parentName || 'Kiritilmagan'}
                        </span>
                      </div>

                      {student.parentPhone ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={`tel:${student.parentPhone}`}
                            className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                              isAbsent
                                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            }`}
                            title="Ota-onasiga to'g'ridan-to'g'ri qo'ng'iroq qilish"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>{formatPhoneNumber(student.parentPhone)}</span>
                          </a>

                          <a
                            href={`sms:${student.parentPhone}`}
                            className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                            title="SMS xabar yozish"
                          >
                            <MessageSquare className="w-3 h-3" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Telefon yo'q</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ko'proq ko'rsatish (Pagination / Load More) */}
            {displayedStudents.length > visibleCount && (
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  onClick={() => setVisibleCount(prev => prev + 50)}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>Yana 50 ta ko'rsatish</span>
                  <span className="text-[10px] bg-blue-700 px-1.5 py-0.2 rounded font-normal">
                    {visibleCount} / {displayedStudents.length}
                  </span>
                </button>

                <button
                  onClick={() => setVisibleCount(displayedStudents.length)}
                  className="w-full sm:w-auto px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-lg transition-colors"
                >
                  Barcha {displayedStudents.length} tani ko'rsatish
                </button>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
