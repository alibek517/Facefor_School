import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { 
  Users, 
  UserCheck, 
  UserX, 
  LogOut, 
  Calendar, 
  Search, 
  FileSpreadsheet, 
  Printer, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  PhoneCall,
  LayoutGrid,
  List
} from 'lucide-react';
import { StudentAvatar } from './StudentAvatar';
import { formatPhoneNumber } from '../utils/phoneFormatter';
import { exportStudentAttendanceToExcel } from '../utils/excelAndPromotion';
import { evaluateStudentDayAttendance } from '../utils/attendanceScheduleHelper';

// O'zbekiston mahalliy vaqti bo'yicha bugungi sanani olish (YYYY-MM-DD)
const getTodayDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Sana bo'yicha hafta kunini chiroyli nomlash
const formatFullDateUz = (dateStr) => {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    const months = [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentyabr', 'Oktabr', 'Noyabr', 'Dekabr'
    ];
    return `${days[date.getDay()]}, ${d}-${months[date.getMonth()]} ${y}-yil`;
  } catch (e) {
    return dateStr;
  }
};

// Vaqtni 24-soatlik standartda formatlash
const formatTime24 = (timeStr, fallback = '--:--') => {
  if (!timeStr) return fallback;
  const pmMatch = String(timeStr).match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (pmMatch) {
    let h = parseInt(pmMatch[1], 10);
    const m = pmMatch[2];
    const ampm = pmMatch[3].toUpperCase();
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}`;
  }
  const cleanMatch = String(timeStr).match(/^(\d{1,2}):(\d{2})/);
  if (cleanMatch) {
    return `${cleanMatch[1].padStart(2, '0')}:${cleanMatch[2]}`;
  }
  return timeStr;
};

// Sinf og'irligini hisoblash (1-A dan 11-sinfgacha ketma-ket saralash uchun)
const getClassSortWeight = (targetClassId, cMap) => {
  const cls = cMap ? cMap[targetClassId] : null;
  const name = cls ? (cls.name || '') : String(targetClassId || '');
  const clean = name.trim();
  const match = clean.match(/^(\d+)\s*[-_ ]?\s*([A-Za-zА-Яа-яЎўҚқҒғҲҳ]?)/);
  if (match) {
    const grade = parseInt(match[1], 10);
    const letter = (match[2] || '').toUpperCase();
    const letterCode = letter ? letter.charCodeAt(0) : 0;
    return grade * 1000 + letterCode;
  }
  if (cls && typeof cls.grade === 'number') {
    return cls.grade * 1000;
  }
  const matchId = String(targetClassId || '').match(/^c-(\d+)([a-zа-я])?/i);
  if (matchId) {
    const grade = parseInt(matchId[1], 10);
    const letter = (matchId[2] || '').toUpperCase();
    const letterCode = letter ? letter.charCodeAt(0) : 0;
    return grade * 1000 + letterCode;
  }
  return 999999;
};

export const StudentAttendanceHistoryView = () => {
  const { 
    students = [], 
    classes = [], 
    attendanceList = [], 
    schedules = [],
    recentFaceScans = [], 
    cameras = [], 
    bridgeUrl, 
    isLocalConnected, 
    globalStreamUrl 
  } = useSchool();

  const effectiveBaseUrl = isLocalConnected ? (bridgeUrl || 'http://localhost:5001') : (globalStreamUrl || bridgeUrl || 'http://localhost:5001');

  // Tanlangan sana (Dastlab bugungi kun)
  const todayStr = useMemo(() => getTodayDateStr(), []);
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateStr());

  // Filtrlash holatlari
  const [selectedTab, setSelectedTab] = useState('all'); // 'all' | 'inside' | 'entered' | 'exited' | 'absent'
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [visibleCount, setVisibleCount] = useState(60);

  // Kameralar xaritasi
  const cameraMap = useMemo(() => {
    const map = {};
    (cameras || []).forEach(cam => {
      map[cam.id] = cam;
      if (cam.ip) map[cam.ip] = cam;
    });
    return map;
  }, [cameras]);

  // Turniket lokatsiyasini aniqlash (1..3 Kirish, 4..6 Chiqish)
  const getTurniketGateName = (scan, direction = 'in') => {
    const ip = scan?.cameraIp || scan?.ip;
    const ipMap = {
      '192.168.1.35': 'Turniket 1 (Kirish) • Bosh kirish eshigi (1)',
      '192.168.1.36': 'Turniket 2 (Kirish) • Bosh kirish eshigi (2)',
      '192.168.1.33': 'Turniket 3 (Kirish) • Bosh kirish eshigi (3)',
      '192.168.1.86': 'Turniket 4 (Chiqish) • Chiqish yo\'lagi (1)',
      '192.168.1.32': 'Turniket 5 (Chiqish) • Chiqish yo\'lagi (2)',
      '192.168.1.13': 'Turniket 6 (Chiqish) • Chiqish yo\'lagi (3)',
    };
    if (ip && ipMap[ip]) return ipMap[ip];

    let name = scan?.cameraName || scan?.inspectorName || '';
    if (name) {
      name = name.replace(/^Turniket:\s*/i, '');
      if (name.includes('Turniket 4') || name.includes("Chiqish yo'lagi (1)")) return "Turniket 4 (Chiqish) • Chiqish yo'lagi (1)";
      if (name.includes('Turniket 5') || name.includes("Chiqish yo'lagi (2)")) return "Turniket 5 (Chiqish) • Chiqish yo'lagi (2)";
      if (name.includes('Turniket 6') || name.includes("Chiqish yo'lagi (3)")) return "Turniket 6 (Chiqish) • Chiqish yo'lagi (3)";
      if (name.includes('Turniket 1')) return "Turniket 1 (Kirish) • Bosh kirish eshigi (1)";
      if (name.includes('Turniket 2')) return "Turniket 2 (Kirish) • Bosh kirish eshigi (2)";
      if (name.includes('Turniket 3')) return "Turniket 3 (Kirish) • Bosh kirish eshigi (3)";
      return name;
    }
    return direction === 'out' 
      ? 'Turniket 4 (Chiqish) • Chiqish yo\'lagi (1)' 
      : 'Turniket 1 (Kirish) • Bosh kirish eshigi (1)';
  };

  // Sinflar xaritasi
  const classMap = useMemo(() => {
    const map = {};
    (classes || []).forEach(c => {
      if (c && c.id) map[c.id] = c;
    });
    return map;
  }, [classes]);

  // Sinflarni kichigidan kattasiga tartiblash (1-A dan 11-sinfgacha)
  const sortedClasses = useMemo(() => {
    return [...(classes || [])].sort((a, b) => {
      const wA = getClassSortWeight(a.id, classMap);
      const wB = getClassSortWeight(b.id, classMap);
      if (wA !== wB) return wA - wB;
      return (a.name || '').localeCompare(b.name || '', 'uz');
    });
  }, [classes, classMap]);

  // Tanlangan sana bo'yicha davomat yozuvlari
  const selectedDateRecords = useMemo(() => {
    return (attendanceList || [])
      .filter(att => att.date === selectedDate)
      .flatMap(att => 
        (att.records || []).map(r => ({ ...r, classId: att.classId, inspector: att.inspectorName, date: att.date }))
      );
  }, [attendanceList, selectedDate]);

  // Tanlangan sana bo'yicha Face-ID turniket skanlari
  const selectedDateScans = useMemo(() => {
    return (recentFaceScans || []).filter(s => {
      if (!s.timestamp) return false;
      return String(s.timestamp).startsWith(selectedDate);
    });
  }, [recentFaceScans, selectedDate]);

  // 🎯 Barcha o'quvchilarning tanlangan sana bo'yicha HAQIQIY davomat ro'yxati (soxta ma'lumotlarsiz)
  const enrichedStudents = useMemo(() => {
    return (students || [])
      .filter(s => s.status !== 'graduated' && s.classId !== 'graduated')
      .map(student => {
        const normId = String(student.studentId || student.faceId || student.id || '')
          .replace(/^s-/, '')
          .replace(/^0+/, '');
        const stName = (student.fullName || student.name || '').toLowerCase().trim();

        // 1. Shu sanadagi haqiqiy Face-ID o'tishlari
        const scans = selectedDateScans.filter(s => {
          const sEmp = String(s.employeeNo || '').replace(/^0+/, '');
          const sName = (s.name || '').toLowerCase().trim();
          return (sEmp && normId && (sEmp === normId || sEmp.endsWith(normId) || normId.endsWith(sEmp))) ||
                 (sName && stName && (sName === stName || sName.includes(stName) || stName.includes(sName)));
        });

        const inScans = scans.filter(s => s.direction === 'in');
        const outScans = scans.filter(s => s.direction === 'out');
        const firstInScan = inScans[inScans.length - 1] || inScans[0];
        const lastScan = scans[0];

        // 2. O'qituvchi / Navbatchi yozgan davomat yozuvi
        const attRecord = selectedDateRecords.find(r => 
          r.studentId === student.id || r.studentId === student.studentId ||
          (normId && String(r.studentId || '').replace(/^s-/, '').replace(/^0+/, '') === normId)
        );

        let hasEntered = false;
        let hasExited = false;
        let isInside = false;
        let entryTime = null;
        let exitTime = null;
        let gateName = "Turniket qayd etilmadi";
        let scheduleStatus = 'absent';
        let scheduleLabel = 'Kelmagan';
        let scheduleDetail = '';

        if (scans.length > 0) {
          const dayEval = evaluateStudentDayAttendance({
            scans,
            attRecord,
            classId: student.classId,
            schedules,
            dateStr: selectedDate
          });
          hasEntered = dayEval.hasEntered;
          hasExited = dayEval.hasExited && dayEval.scheduleStatus !== 'inside';
          isInside = dayEval.scheduleStatus === 'inside';
          entryTime = dayEval.firstEntryTime || formatTime24(firstInScan?.timeFormatted, '07:50');
          exitTime = dayEval.lastExitTime || null;
          scheduleStatus = dayEval.scheduleStatus;
          scheduleLabel = dayEval.scheduleLabel;
          scheduleDetail = dayEval.scheduleDetail;
          gateName = getTurniketGateName(hasExited ? (dayEval.lastExitScan || lastScan) : (dayEval.firstEntryScan || firstInScan), hasExited ? 'out' : 'in');
        } else if (attRecord && (attRecord.status === 'present' || attRecord.status === 'exited' || attRecord.inTime)) {
          hasEntered = true;
          hasExited = attRecord.status === 'exited' || attRecord.lastDirection === 'out';
          isInside = hasEntered && !hasExited;
          entryTime = formatTime24(attRecord.inTime, '08:00');
          exitTime = hasExited ? formatTime24(attRecord.outTime, '13:00') : null;
          scheduleStatus = hasExited ? 'completed_all' : 'inside';
          scheduleLabel = hasExited ? 'Barcha darsga kirgan' : 'Maktab ichida';
          gateName = attRecord.inspector ? `Qayd: ${attRecord.inspector}` : 'Turniket 1 (Kirish) • Bosh kirish eshigi (1)';
        }

        const cls = classMap[student.classId];

        return {
          ...student,
          className: cls ? cls.name : (student.className || 'Sinf biriktirilmagan'),
          hasEntered,
          hasExited,
          isInside,
          entryTime,
          exitTime,
          gateName,
          scheduleStatus,
          scheduleLabel,
          scheduleDetail,
          statusType: hasEntered ? (hasExited ? 'exited' : 'inside') : 'absent'
        };
      })
      .sort((a, b) => {
        // Sinf bo'yicha o'sish tartibi (1-A dan 11-gacha)
        const wA = getClassSortWeight(a.classId, classMap);
        const wB = getClassSortWeight(b.classId, classMap);
        if (wA !== wB) return wA - wB;
        // Sinf ichida alifbo bo'yicha (A-Z)
        const nameA = String(a.fullName || a.name || '').trim();
        const nameB = String(b.fullName || b.name || '').trim();
        return nameA.localeCompare(nameB, 'uz', { sensitivity: 'base' });
      });
  }, [students, selectedDateScans, selectedDateRecords, selectedDate, todayStr, classMap, schedules]);

  // Tanlangan sinf bo'yicha cheklangan ro'yxat (KPI hisoblash uchun)
  const scopedStudents = useMemo(() => {
    if (!selectedClassId || selectedClassId === 'all') return enrichedStudents;
    return enrichedStudents.filter(s => s.classId === selectedClassId);
  }, [enrichedStudents, selectedClassId]);

  // Statistik hisob-kitoblar (KPI)
  const totalCount = scopedStudents.length || 0;
  const insideStudents = useMemo(() => scopedStudents.filter(s => s.isInside), [scopedStudents]);
  const enteredStudents = useMemo(() => scopedStudents.filter(s => s.hasEntered), [scopedStudents]);
  const exitedStudents = useMemo(() => scopedStudents.filter(s => s.hasExited), [scopedStudents]);
  const completedAllStudents = useMemo(() => scopedStudents.filter(s => s.scheduleStatus === 'completed_all'), [scopedStudents]);
  const leftEarlyStudents = useMemo(() => scopedStudents.filter(s => s.scheduleStatus === 'left_early'), [scopedStudents]);
  const outdoorStudents = useMemo(() => scopedStudents.filter(s => s.scheduleStatus === 'outdoor_lesson'), [scopedStudents]);
  const absentStudents = useMemo(() => scopedStudents.filter(s => !s.hasEntered), [scopedStudents]);

  const insidePercent = totalCount > 0 ? Math.round((insideStudents.length / totalCount) * 100) : 0;
  const enteredPercent = totalCount > 0 ? Math.round((enteredStudents.length / totalCount) * 100) : 0;
  const absentPercent = totalCount > 0 ? Math.round((absentStudents.length / totalCount) * 100) : 0;

  // Qidiruv va Tab bo'yicha filtrlangan yakuniy ro'yxat
  const filteredStudents = useMemo(() => {
    let list = scopedStudents;
    if (selectedTab === 'inside') list = insideStudents;
    else if (selectedTab === 'entered') list = enteredStudents;
    else if (selectedTab === 'exited') list = exitedStudents;
    else if (selectedTab === 'completed_all') list = completedAllStudents;
    else if (selectedTab === 'left_early') list = leftEarlyStudents;
    else if (selectedTab === 'outdoor_lesson') list = outdoorStudents;
    else if (selectedTab === 'absent') list = absentStudents;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(st => {
        const name = (st.fullName || st.name || '').toLowerCase();
        const addr = (st.address || '').toLowerCase();
        const pName = (st.parentName || '').toLowerCase();
        const ph = String(st.phone || st.parentPhone || '');
        const id = String(st.studentId || st.faceId || st.id || '').toLowerCase();
        return name.includes(q) || addr.includes(q) || pName.includes(q) || ph.includes(q) || id.includes(q);
      });
    }

    return list;
  }, [scopedStudents, insideStudents, enteredStudents, exitedStudents, absentStudents, selectedTab, searchTerm]);

  // Sanani oldinga yoki orqaga 1 kunga surish (kelajak sanaga o'tmaydi)
  const shiftDate = (days) => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const cur = new Date(y, m - 1, d);
      cur.setDate(cur.getDate() + days);
      const nextStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      if (nextStr > todayStr) {
        setSelectedDate(todayStr);
        return;
      }
      setSelectedDate(nextStr);
    } catch (e) {}
  };

  // Excelga yuklab olish
  const handleExportExcel = () => {
    const className = selectedClassId === 'all' 
      ? 'Barcha_sinflar' 
      : (classes.find(c => c.id === selectedClassId)?.name || 'Sinf');
    exportStudentAttendanceToExcel(filteredStudents, selectedDate, className);
  };

  // Chop etish (Print)
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      
      {/* 1. YUQORI SARLAVHA VA HARAKATLAR */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                O'quvchilar Davomati & Tarix
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 font-mono">
                {selectedDate}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Turniket va Face-ID orqali maktabga kelganlar, chiqib ketganlar va kelmaganlar tarixi
            </p>
          </div>
        </div>

        {/* Tugmalar: Excel, Chop etish, Bugun */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Shu sanadagi davomatni Excel (.xlsx) ga yuklash"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Excel</span> Hisobot
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Chop etish"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Chop etish</span>
          </button>

          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
              selectedDate === todayStr 
                ? 'bg-blue-600 text-white shadow-blue-500/20' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Bugun</span>
          </button>
        </div>
      </div>

      {/* 2. SANA BOSHQARUVI (INTERAKTIV KALENDAR VA TEZKOR TUGMALAR) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Sana Tanlagich & Kun O'tkazgich */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => shiftDate(-1)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="Bir kun oldingi sana"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-inner">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                max={todayStr}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v) setSelectedDate(v > todayStr ? todayStr : v);
                }}
                className="text-xs sm:text-sm font-bold bg-transparent text-slate-900 dark:text-white outline-none cursor-pointer font-mono"
              />
            </div>

            <button
              onClick={() => shiftDate(1)}
              disabled={selectedDate >= todayStr}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
              title="Bir kun keyingi sana"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1 hidden lg:inline">
              {formatFullDateUz(selectedDate)}
            </span>
          </div>

          {/* Tezkor Sanalar (Bugun, Kecha, 2 kun oldin, 1 hafta oldin) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedDate(todayStr)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                selectedDate === todayStr 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Bugun
            </button>

            {[-1, -2, -3, -7].map(offset => {
              const d = new Date();
              d.setDate(d.getDate() + offset);
              const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              const label = offset === -1 ? 'Kecha' : (offset === -7 ? '1 hafta oldin' : `${Math.abs(offset)} kun oldin`);
              const isSelected = selectedDate === dStr;

              return (
                <button
                  key={offset}
                  onClick={() => setSelectedDate(dStr)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    isSelected 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. ASOSIY STATISTIKA (KPI KARTALAR) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
        
        {/* Jami O'quvchilar */}
        <div 
          onClick={() => { setSelectedTab('all'); setVisibleCount(60); }}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            selectedTab === 'all' 
              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-sm ring-2 ring-blue-500/20' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Jami O'quvchilar</span>
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1.5">
            {totalCount} <span className="text-xs font-normal text-slate-400">nafar</span>
          </div>
        </div>

        {/* Maktabda (Bino ichida) */}
        <div 
          onClick={() => { setSelectedTab('inside'); setVisibleCount(60); }}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            selectedTab === 'inside' 
              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 shadow-sm ring-2 ring-emerald-500/20' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Bino Ichida
            </span>
            <Building className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
            {insideStudents.length} <span className="text-xs font-normal text-slate-400">({insidePercent}%)</span>
          </div>
        </div>

        {/* Kelganlar */}
        <div 
          onClick={() => { setSelectedTab('entered'); setVisibleCount(60); }}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            selectedTab === 'entered' 
              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-sm ring-2 ring-blue-500/20' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 text-xs font-semibold">
            <span>Bugun Kelganlar</span>
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1.5">
            {enteredStudents.length} <span className="text-xs font-normal text-slate-400">({enteredPercent}%)</span>
          </div>
        </div>

        {/* Chiqib ketganlar */}
        <div 
          onClick={() => { setSelectedTab('exited'); setVisibleCount(60); }}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            selectedTab === 'exited' 
              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 shadow-sm ring-2 ring-amber-500/20' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <span>Chiqib Ketgan</span>
            <LogOut className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1.5">
            {exitedStudents.length} <span className="text-xs font-normal text-slate-400">nafar</span>
          </div>
        </div>

        {/* Kelmaganlar (Qizil - Darhol e'tibor qaratish uchun) */}
        <div 
          onClick={() => { setSelectedTab('absent'); setVisibleCount(60); }}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
            selectedTab === 'absent' 
              ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-400 dark:border-rose-700 shadow-sm ring-2 ring-rose-500/20' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 text-xs font-semibold">
            <span>Kelmaganlar</span>
            <UserX className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1.5">
            {absentStudents.length} <span className="text-xs font-normal text-slate-400">({absentPercent}%)</span>
          </div>
        </div>

      </div>

      {/* 4. FILTRLAR VA SINFLAR RO'YXATI */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
        
        {/* Qidiruv, Holat Tablari va Ko'rinish Turi */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Holat Tablari */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {[
              { id: 'all', label: 'Barchasi', count: totalCount, color: 'blue' },
              { id: 'inside', label: 'Bino Ichida', count: insideStudents.length, color: 'emerald' },
              { id: 'entered', label: 'Kelganlar', count: enteredStudents.length, color: 'blue' },
              { id: 'completed_all', label: 'Barcha darsga kirgan', count: completedAllStudents.length, color: 'emerald' },
              { id: 'left_early', label: 'Ketib qolgan', count: leftEarlyStudents.length, color: 'rose' },
              { id: 'outdoor_lesson', label: 'Jismoniy / CHQBT', count: outdoorStudents.length, color: 'cyan' },
              { id: 'exited', label: 'Chiqib ketgan', count: exitedStudents.length, color: 'amber' },
              { id: 'absent', label: 'Kelmaganlar', count: absentStudents.length, color: 'rose' }
            ].map(tab => {
              const isSelected = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setSelectedTab(tab.id); setVisibleCount(60); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    isSelected 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Qidiruv va Ko'rinish (Grid / Table) */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(60); }}
                placeholder="O'quvchi ismi, ID, ota-onasi yoki telefon..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Grid / Table Toggle */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                title="Karta ko'rinishi"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                title="Jadval ko'rinishi"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Sinflar Tanlagichi (1-A dan boshlab tartiblangan) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => { setSelectedClassId('all'); setVisibleCount(60); }}
            className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-all ${
              selectedClassId === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Barcha sinflar ({enrichedStudents.length})
          </button>

          {sortedClasses.map(c => {
            const count = enrichedStudents.filter(s => s.classId === c.id).length;
            const isSelected = selectedClassId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setSelectedClassId(c.id); setVisibleCount(60); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <span>{c.name}</span>
                <span className={`text-[10px] font-mono px-1 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* 5. O'QUVCHILAR RO'YXATI (KARTA YOKI JADVAL) */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
          <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Ushbu filtr bo'yicha hech qanday o'quvchi topilmadi
          </h3>
          <p className="text-xs text-slate-400">
            Boshqa sanani tanlang yoki filtr sozlamalarini tozalang
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* GRID KARTA KO'RINISHI */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredStudents.slice(0, visibleCount).map((st) => {
            return (
              <div
                key={st.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  st.hasEntered 
                    ? (st.hasExited 
                        ? 'bg-amber-50/30 dark:bg-amber-950/15 border-amber-200 dark:border-amber-900/50' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300')
                    : 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                }`}
              >
                <div>
                  {/* Yuqori qism: Avatar, Ism, Sinf, Holati nishoni */}
                  <div className="flex items-start gap-3">
                    <StudentAvatar student={st} effectiveBaseUrl={effectiveBaseUrl} />
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate" title={st.fullName || st.name}>
                          {st.fullName || st.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                          {st.className}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          #{st.studentId || st.faceId || st.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Davomat Holati */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                    {st.hasEntered ? (
                      <>
                        <div className="flex items-center justify-between text-xs gap-1">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            1-kirish: <b className="text-slate-800 dark:text-slate-200 font-mono">{st.entryTime || '--:--'}</b>
                          </span>
                          
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            st.scheduleStatus === 'left_early'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              : st.scheduleStatus === 'completed_all'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : st.scheduleStatus === 'outdoor_lesson'
                              ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300'
                              : st.hasExited
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              st.scheduleStatus === 'left_early'
                                ? 'bg-rose-500'
                                : st.scheduleStatus === 'outdoor_lesson'
                                ? 'bg-cyan-500'
                                : st.hasExited
                                ? 'bg-emerald-500'
                                : 'bg-emerald-500 animate-pulse'
                            }`}></span>
                            {st.hasExited ? `Oxirgi chiqish: ${st.exitTime || '--:--'}` : 'Bino ichida'}
                          </span>
                        </div>

                        {st.scheduleLabel && (
                          <div className={`text-[10px] font-bold px-2 py-0.5 rounded-lg inline-block ${
                            st.scheduleStatus === 'completed_all'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : st.scheduleStatus === 'left_early'
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                              : st.scheduleStatus === 'outdoor_lesson'
                              ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`} title={st.scheduleDetail || st.scheduleLabel}>
                            {st.scheduleLabel}
                          </div>
                        )}

                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate" title={st.gateName}>
                          📍 {st.gateName}
                        </div>
                      </>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            Maktabga kelmadi
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold">
                            Kelmadi
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          Turniketdan o'tish qayd etilmadi
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pastki qism: Ota-onasi va Qo'ng'iroq qilish tugmasi */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1 text-[11px] text-slate-600 dark:text-slate-400 truncate">
                    <span className="text-slate-400">Ota-onasi:</span> <b className="text-slate-700 dark:text-slate-300">{st.parentName || 'Kiritilmagan'}</b>
                  </div>

                  {st.parentPhone || st.phone ? (
                    <a
                      href={`tel:${st.parentPhone || st.phone}`}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
                      title="Ota-onasiga qo'ng'iroq qilish"
                    >
                      <PhoneCall className="w-3 h-3 text-emerald-600" />
                      <span>Qo'ng'iroq</span>
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-400">Tel yo'q</span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (

        /* JADVAL KO'RINISHI (TABLE VIEW) */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">№</th>
                  <th className="py-3 px-3">O'quvchi F.I.Sh</th>
                  <th className="py-3 px-3">Sinfi</th>
                  <th className="py-3 px-3">Holati</th>
                  <th className="py-3 px-3">Kirgan vaqti</th>
                  <th className="py-3 px-3">Chiqqan vaqti</th>
                  <th className="py-3 px-3">Turniket</th>
                  <th className="py-3 px-3">Ota-onasi</th>
                  <th className="py-3 px-3 text-right">Aloqa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.slice(0, visibleCount).map((st, idx) => (
                  <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <StudentAvatar student={st} effectiveBaseUrl={effectiveBaseUrl} size="sm" />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {st.fullName || st.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            #{st.studentId || st.faceId || st.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-blue-700 dark:text-blue-300">
                        {st.className}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {st.hasEntered ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          st.hasExited 
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400' 
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.hasExited ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                          {st.hasExited ? 'Chiqib ketgan' : 'Bino ichida'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400">
                          <XCircle className="w-3 h-3" />
                          Kelmagan
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {st.hasEntered ? (st.entryTime || '07:50') : '---'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                      {st.hasExited ? (st.exitTime || '13:00') : (st.hasEntered ? 'Bino ichida' : '---')}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-500 dark:text-slate-400 max-w-xs truncate" title={st.gateName}>
                      {st.hasEntered ? st.gateName : 'Turniket qayd etilmadi'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {st.parentName || 'Kiritilmagan'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {st.parentPhone || st.phone ? (
                        <a
                          href={`tel:${st.parentPhone || st.phone}`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold font-mono text-[11px]"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{formatPhoneNumber(st.parentPhone || st.phone)}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[10px]">---</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      )}

      {/* Ko'proq ko'rsatish (Load More) tugmasi */}
      {filteredStudents.length > visibleCount && (
        <div className="text-center pt-2">
          <button
            onClick={() => setVisibleCount(prev => prev + 60)}
            className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            Yana 60 ta o'quvchini ko'rsatish ({visibleCount} / {filteredStudents.length})
          </button>
        </div>
      )}

    </div>
  );
};
