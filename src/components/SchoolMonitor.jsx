import React, { useState, useEffect, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { 
  Building, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Maximize, 
  Minimize, 
  BookOpen, 
  CheckCircle2, 
  GraduationCap, 
  Activity, 
  TrendingUp, 
  Calendar,
  Layers,
  ArrowRight,
  X,
  ChevronRight,
  Search
} from 'lucide-react';

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

const MonitorStudentAvatar = ({ student, effectiveBaseUrl }) => {
  const [hasError, setHasError] = useState(false);
  const cleanId = String(student.studentId || student.faceId || student.id || '').replace(/^s-/, '');
  const paddedId = cleanId ? cleanId.padStart(8, '0') : '';
  const photoUrl = `${effectiveBaseUrl}/api/device/photo/${paddedId || cleanId}`;

  useEffect(() => {
    setHasError(false);
  }, [photoUrl, student.id, student.studentId]);

  return (
    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
      {!hasError && cleanId ? (
        <img
          src={photoUrl}
          alt={student.fullName || student.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-black text-xs">
          {(student.fullName || student.name || 'O').charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

export const SchoolMonitor = () => {
  const { 
    classes, 
    students, 
    teachers, 
    attendanceList, 
    teacherAttendance, 
    hourlyAttendance, 
    schedules,
    toggleTeacherPresence,
    faceDevice,
    recentFaceScans,
    cameras,
    bridgeUrl,
    isLocalConnected,
    globalStreamUrl
  } = useSchool();

  const effectiveBaseUrl = isLocalConnected ? (bridgeUrl || 'http://localhost:5001') : (globalStreamUrl || bridgeUrl || 'http://localhost:5001');

  const [activeTab, setActiveTab] = useState('inside');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('c-10a');

  // Hafta kunini aniqlash va tanlangan kun state-i
  const getTodayDayName = () => {
    const dayIndex = new Date().getDay();
    if (dayIndex === 1) return 'Dushanba';
    if (dayIndex === 2) return 'Seshanba';
    if (dayIndex === 3) return 'Chorshanba';
    if (dayIndex === 4) return 'Payshanba';
    if (dayIndex === 5) return 'Juma';
    if (dayIndex === 6) return 'Shanba';
    return 'Dushanba';
  };
  const todayDayName = getTodayDayName();
  const [selectedScheduleDay, setSelectedScheduleDay] = useState(getTodayDayName());

  // O'ng tomondan chiquvchi Sinf/Xodimlar Sidebar holati
  const [drawerTarget, setDrawerTarget] = useState(null);
  const [drawerSearch, setDrawerSearch] = useState('');

  // Jonli soat (sekundlari bilan yuradi)
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // To'liq ekran qilish (Foye monitorlari uchun)
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Bugungi sana (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const year = currentTime.getFullYear();
    const month = String(currentTime.getMonth() + 1).padStart(2, '0');
    const day = String(currentTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [currentTime]);

  // Bugungi Face-ID o'tishlari
  const todayScans = useMemo(() => {
    return (recentFaceScans || []).filter(s => {
      if (!s.timestamp) return false;
      return String(s.timestamp).startsWith(todayStr);
    });
  }, [recentFaceScans, todayStr]);

  // Bugungi rasmiy kiritilgan davomatlar
  const todayAttendanceList = useMemo(() => {
    return (attendanceList || []).filter(a => a.date === todayStr);
  }, [attendanceList, todayStr]);

  // O'quvchining ayni vaqtda maktab ichida ekanligini aniqlash
  const isStudentInsideToday = (st) => {
    const normId = String(st.studentId || st.faceId || st.id || '').replace(/^s-/, '').replace(/^0+/, '');
    const stName = (st.fullName || st.name || '').toLowerCase().trim();

    // 1. Bugungi Face-ID skanlarini tekshiramiz
    const scans = todayScans.filter(s => {
      const sEmp = String(s.employeeNo || '').replace(/^0+/, '');
      const sName = (s.name || '').toLowerCase().trim();
      return (normId && sEmp && sEmp === normId) || (sName && stName && (sName === stName || sName.includes(stName) || stName.includes(sName)));
    });

    if (scans.length > 0) {
      const lastScan = scans[0];
      return lastScan.direction === 'in';
    }

    // 2. Bugungi rasmiy sinf davomatini tekshiramiz
    const classAtt = todayAttendanceList.find(a => a.classId === st.classId);
    if (classAtt && classAtt.records) {
      const rec = classAtt.records.find(r => r.studentId === st.id || r.studentId === st.studentId);
      if (rec) {
        if (rec.lastDirection) {
          return rec.lastDirection === 'in';
        }
        if (rec.status === 'exited') return false;
        return rec.status === 'present';
      }
    }

    // Hech qanday qayd bo'lmasa -> Maktab ichida emas (hali kelmagan)
    return false;
  };

  // 1. O'quvchilar hisob-kitoblari (Sinflar kesimida)
  const classStats = classes.map(c => {
    const classStudents = students.filter(s => s.classId === c.id);
    const classAtt = todayAttendanceList.find(a => a.classId === c.id);
    
    // Sinfdagi mavjud o'quvchilar soni
    const totalCount = classStudents.length;

    // Real vaqtda kelgan o'quvchilar soni (Face-ID + Davomat birlashtirilgan yagona hisob)
    const presentCount = Math.min(totalCount, classStudents.filter(s => isStudentInsideToday(s)).length);
    // Kelmaganlar har doim (Jami o'quvchilar - Kelganlar) ga teng
    const absentCount = Math.max(0, totalCount - presentCount);

    const percent = totalCount > 0 ? Math.min(100, Math.round((presentCount / totalCount) * 100)) : 0;

    return {
      ...c,
      totalCount,
      presentCount,
      absentCount,
      percent,
      hasAtt: todayAttendanceList.some(a => a.classId === c.id)
    };
  });

  // Jami maktab bo'yicha o'quvchilar statistikasi
  const totalStudents = classStats.reduce((sum, c) => sum + c.totalCount, 0) || students.length || 1;
  const totalStudentsPresent = classStats.reduce((sum, c) => sum + c.presentCount, 0);
  const totalStudentsAbsent = Math.max(0, totalStudents - totalStudentsPresent);
  const totalStudentsPercent = totalStudents > 0 
    ? Math.min(100, Math.round((totalStudentsPresent / totalStudents) * 100)) 
    : 0;

  // 2. O'qituvchilar hisob-kitoblari (Bugungi kunda)
  const totalTeachers = teachers.length;
  const teachersPresentList = teachers.filter(t => {
    const tName = (t.name || '').toLowerCase().trim();
    const scans = todayScans.filter(s => {
      const sName = (s.name || '').toLowerCase().trim();
      return sName && tName && (sName === tName || sName.includes(tName) || tName.includes(sName));
    });
    if (scans.length > 0) {
      return scans[0].direction === 'in';
    }
    const att = teacherAttendance.find(ta => ta.teacherId === t.id && ta.date === todayStr);
    return att ? att.status === 'present' : false; // sukut bo'yicha 0 ta
  });
  const totalTeachersPresent = teachersPresentList.length;
  const totalTeachersAbsent = Math.max(0, totalTeachers - totalTeachersPresent);
  const teachersPercent = totalTeachers > 0 ? Math.round((totalTeachersPresent / totalTeachers) * 100) : 0;

  // 3. Maktab ichidagilar umumiy soni
  const totalPeopleInside = totalStudentsPresent + totalTeachersPresent;

  // 4. Soatlar bo'yicha darslar tahlili (Tanlangan sinf uchun)
  const currentClassObj = classes.find(c => c.id === selectedClassId);
  const currentClassStudents = students.filter(s => s.classId === selectedClassId);
  const totalInSelectedClass = currentClassStudents.length || 25;

  // Tanlangan sinfning tanlangan kungi darslari (Dushanba, Seshanba, ...)
  const selectedClassSchedules = schedules.filter(s => 
    s.classId === selectedClassId && (s.day ? s.day === selectedScheduleDay : true)
  );
  // Dars tartibi bo'yicha saralash (1-dars, 2-dars, ...)
  const scheduleLessons = [...selectedClassSchedules].sort((a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0));

  // Sana formatlash (O'zbekcha)
  const dateFormatted = new Intl.DateTimeFormat('uz-UZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(currentTime);

  const timeFormatted = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="w-full min-h-[85vh] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl p-3 sm:p-5 flex flex-col justify-between shadow-xl border border-slate-200 dark:border-slate-800 transition-colors duration-200">
      
      {/* 1. YUQORI MONITOR BOSHQARUV PANELI (TABLO HEADER) */}
      <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        
        {/* Chap tomon: Maktab nomi va Jonli rejim indikatori */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                SmartMaktab Tablosi
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
                Jonli Efir
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{dateFormatted}</p>
          </div>
        </div>

        {/* O'rta: Jonli Raqamli Soat va Face-ID Holati */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 text-center shadow-inner">
            <div className="text-xl sm:text-2xl font-black font-mono tracking-wider text-emerald-600 dark:text-emerald-400">
              {timeFormatted}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <div>
              <div className="font-bold text-[11px] text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span>Face-ID: 6 ta Turniket</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  ONLAYN
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                3 Kirish / 3 Chiqish • {faceDevice?.totalUsers || 737} ta yuz
              </div>
            </div>
          </div>
        </div>

        {/* O'ng tomon: 3 ta Asosiy Bo'lim Tablari va To'liq Ekran */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('inside')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'inside'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>1. Maktab Ichidagilar</span>
            </button>

            <button
              onClick={() => setActiveTab('arrived')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'arrived'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>2. Bugun Kelganlar</span>
            </button>

            <button
              onClick={() => setActiveTab('hourly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'hourly'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>3. Darslar Bo'yicha</span>
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
            title="To'liq ekranga o'tish"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* 2. ASOSIY MAZMUN (3 TA BO'LIM BO'YICHA) */}
      <div className="my-4 flex-1">
        
        {/* ========================================================================= */}
        {/* 1-BO'LIM: MAKTAB ICHIDAGILAR (Hozir ayni vaqtda binoda bo'lganlar) */}
        {/* ========================================================================= */}
        {activeTab === 'inside' && (
          <div className="space-y-4">
            
            {/* Yuqori 3 ta Katta Jonli Metrika */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Jami odamlar */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 dark:from-blue-900/60 dark:to-slate-800/90 border border-blue-200 dark:border-blue-500/30 p-4 rounded-2xl relative overflow-hidden shadow-sm">
                <div className="flex items-center justify-between text-blue-700 dark:text-blue-300">
                  <span className="text-xs font-bold uppercase tracking-wider">Hozir Maktab Ichida</span>
                  <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  {totalPeopleInside}
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-300 ml-2">nafar inson</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  O'quvchilar: <strong className="text-slate-900 dark:text-white">{totalStudentsPresent}</strong> • O'qituvchilar: <strong className="text-slate-900 dark:text-white">{totalTeachersPresent}</strong>
                </div>
              </div>

              {/* O'quvchilar bino ichida */}
              <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Darsdagi O'quvchilar</span>
                  <UserCheck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div className="mt-2 text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
                  {totalStudentsPresent}
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 ml-2">/ {totalStudents}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${totalStudentsPercent}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{totalStudentsPercent}%</span>
                </div>
              </div>

              {/* O'qituvchilar bino ichida */}
              <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Bino Ichidagi O'qituvchilar</span>
                  <GraduationCap className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                </div>
                <div className="mt-2 text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400">
                  {totalTeachersPresent}
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 ml-2">/ {totalTeachers}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${teachersPercent}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{teachersPercent}%</span>
                </div>
              </div>

            </div>

            {/* BARCHA SINFLAR VA XODIMLAR DAVOMAT KARTALARI (FOYE TABLOSI) */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 p-4 rounded-2xl shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 rounded-lg">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Sinflar Bo'yicha O'quvchilar Davomati
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      O'quvchilarning to'liq ro'yxati va holatini ko'rish uchun sinf ustiga bosing
                    </p>
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Jami: <span className="text-slate-900 dark:text-white font-black">{classes.length} ta sinf</span> + Xodimlar
                </div>
              </div>

              {/* Sinflar va Xodimlar Gridi */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {classStats.map(cs => {
                  return (
                    <div
                      key={cs.id}
                      onClick={() => { setDrawerTarget(cs); setDrawerSearch(''); }}
                      className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {cs.name}
                          </span>
                          <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                            cs.percent >= 90 
                              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300' 
                              : cs.percent >= 70
                              ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                          }`}>
                            {cs.percent}%
                          </span>
                        </div>

                        {/* O'quvchilar soni */}
                        <div className="space-y-1 text-[11px]">
                          <div className="text-slate-500 dark:text-slate-400 flex items-center justify-between">
                            <span>Jami:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{cs.totalCount} ta</span>
                          </div>
                          <div className="text-emerald-600 dark:text-emerald-400 flex items-center justify-between font-semibold">
                            <span>✓ Kelgan:</span>
                            <span>{cs.presentCount} ta</span>
                          </div>
                          <div className="text-rose-600 dark:text-rose-400 flex items-center justify-between font-semibold">
                            <span>✗ Kelmagan:</span>
                            <span>{cs.absentCount} ta</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-0.5 transition-transform">
                        <span>Ko'rish</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}

                {/* Xodimlar Kartochkasi */}
                <div
                  onClick={() => {
                    setDrawerTarget({
                      id: 'staff',
                      isStaff: true,
                      name: 'Xodimlar & O\'qituvchilar',
                      totalCount: totalTeachers,
                      presentCount: totalTeachersPresent,
                      absentCount: totalTeachersAbsent,
                      percent: teachersPercent
                    });
                    setDrawerSearch('');
                  }}
                  className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/20 rounded-xl border border-amber-300 dark:border-amber-700/60 hover:border-amber-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-xs font-black text-amber-900 dark:text-amber-200 group-hover:text-amber-700 transition-colors">
                        Xodimlar
                      </span>
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                        {teachersPercent}%
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="text-slate-600 dark:text-slate-400 flex items-center justify-between">
                        <span>Jami:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{totalTeachers} nafar</span>
                      </div>
                      <div className="text-emerald-700 dark:text-emerald-400 flex items-center justify-between font-semibold">
                        <span>✓ Maktabda:</span>
                        <span>{totalTeachersPresent} nafar</span>
                      </div>
                      <div className="text-rose-700 dark:text-rose-400 flex items-center justify-between font-semibold">
                        <span>✗ Chiqqan:</span>
                        <span>{totalTeachersAbsent} nafar</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-amber-200/60 dark:border-amber-800/60 flex items-center justify-between text-[10px] text-amber-700 dark:text-amber-300 font-bold group-hover:translate-x-0.5 transition-transform">
                    <span>Ko'rish</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* O'qituvchilarning Keldi-Ketisi (Jonli Ro'yxat) */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  O'qituvchilar Keldi-Ketisi ({totalTeachersPresent} nafar maktabda)
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Holatni o'zgartirish uchun ustiga bosing</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {teachers.map(t => {
                  const att = teacherAttendance.find(ta => ta.teacherId === t.id);
                  const isPresent = att ? att.status === 'present' : true;

                  return (
                    <div
                      key={t.id}
                      onClick={() => toggleTeacherPresence(t.id)}
                      className={`p-2 rounded-xl border text-xs cursor-pointer select-none transition-all flex flex-col justify-between ${
                        isPresent
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/40 hover:border-emerald-400 text-slate-800 dark:text-emerald-100 shadow-sm'
                          : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/30 hover:border-rose-400 text-slate-700 dark:text-rose-300 opacity-80'
                      }`}
                    >
                      <div>
                        <div className="font-bold truncate text-[11px] text-slate-900 dark:text-inherit">{t.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{t.subject}</div>
                      </div>
                      <div className="mt-2 pt-1 border-t border-slate-200 dark:border-slate-700/40 flex items-center justify-between text-[10px]">
                        <span className={`font-semibold ${isPresent ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {isPresent ? '✓ Maktabda' : '❌ Chiqib ketgan'}
                        </span>
                        {isPresent && (
                          <span className="text-slate-500 dark:text-slate-400 font-mono">{att?.inTime || '08:00'}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 2-BO'LIM: BUGUN MAKTABGA KELGANLAR (Sinflar kesimida foizlar & jami sonlar) */}
        {/* ========================================================================= */}
        {activeTab === 'arrived' && (
          <div className="space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sinflar Kesimida Kunlik Davomat</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Har bir sinfning jami o'quvchilari, kelganlar soni va foiz ko'rsatkichi</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Kelgan: {totalStudentsPresent}</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">Kelmadi: {totalStudentsAbsent}</span>
                <span className="text-blue-600 dark:text-blue-400 font-black text-sm">Umumiy: {totalStudentsPercent}%</span>
              </div>
            </div>

            {/* Barcha 20+ ta Sinf Kartalari Grid ko'rinishida */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {classStats.map(c => {
                const isFull = c.percent === 100;
                const isLow = c.percent < 90;

                return (
                  <div
                    key={c.id}
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all shadow-sm ${
                      isFull
                        ? 'bg-white dark:bg-slate-800/90 border-emerald-300 dark:border-emerald-500/40'
                        : isLow
                        ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/40'
                        : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-slate-900 dark:text-white">{c.name}</span>
                        <span className={`text-xs font-black px-1.5 py-0.5 rounded ${
                          isFull 
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
                            : isLow 
                            ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400' 
                            : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                        }`}>
                          {c.percent}%
                        </span>
                      </div>

                      {/* Kelgan / Jami soni */}
                      <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                        Kelgan: <strong className="text-slate-900 dark:text-white text-sm">{c.presentCount}</strong> / {c.totalCount}
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div
                          className={`h-full rounded-full ${
                            isFull ? 'bg-emerald-500' : isLow ? 'bg-rose-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${c.percent}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span>{c.room}</span>
                      <span className={c.absentCount > 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-600 dark:text-emerald-400'}>
                        {c.absentCount > 0 ? `${c.absentCount} yo'q` : 'To\'liq'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 3-BO'LIM: DARSLAR BO'YICHA JONLI DAVOMAT (SOATLAR TAHLILI) */}
        {/* O'qituvchilarning dars yo'qlamasidan kelib chiqib o'zgaradi! */}
        {/* ========================================================================= */}
        {activeTab === 'hourly' && (
          <div className="space-y-4">
            
            {/* Sinf va Hafta Kunini tanlash paneli */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  Dars Soatlari Bo'yicha Jonli Yo'qlama (Real-time)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  O'qituvchilar dars vaqtida olgan yo'qlamasi asosida har bir darsda qatnashgan o'quvchilar soni
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Hafta kunlari (Dushanba - Shanba) */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
                  {['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'].map(day => {
                    const isSelected = selectedScheduleDay === day;
                    const isToday = todayDayName === day;
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedScheduleDay(day)}
                        className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1 shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{day}</span>
                        {isToday && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-emerald-500 animate-pulse'}`} title="Bugun" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Sinf tanlash */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-xs p-1.5 px-3 rounded-lg outline-none cursor-pointer"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name} sinfi</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tanlangan Sinfning Darslari Bo'yicha Kartalar (1-dars, 2-dars, 3-dars...) */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-700 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {currentClassObj?.name} Sinfida {selectedScheduleDay} Kungi Darslar ({scheduleLessons.length} ta dars)
                  </span>
                  {selectedScheduleDay === todayDayName && (
                    <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      Bugungi kun
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Jami o'quvchilar: <strong className="text-slate-900 dark:text-white">{totalInSelectedClass} nafar</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {scheduleLessons.map(lesson => {
                  // HourlyAttendance-dan real yo'qlamani olish
                  const liveData = hourlyAttendance[lesson.id];
                  const currentClassLive = classStats.find(c => c.id === selectedClassId);
                  const isTodaySelected = selectedScheduleDay === todayDayName;
                  
                  // Agar o'qituvchi darsda yo'qlama qilgan bo'lsa o'sha son; aks holda bugungi jonli turniketdagi kelganlar soni
                  const presentInLesson = liveData 
                    ? liveData.presentCount 
                    : (isTodaySelected ? (currentClassLive?.presentCount || 0) : 0);
                  const absentInLesson = Math.max(0, totalInSelectedClass - presentInLesson);
                  const lessonPercent = totalInSelectedClass > 0 
                    ? Math.min(100, Math.round((presentInLesson / totalInSelectedClass) * 100)) 
                    : 0;

                  return (
                    <div
                      key={lesson.id}
                      className="p-3.5 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all flex flex-col justify-between shadow-sm"
                    >
                      <div>
                        {/* Soat tartibi va vaqti */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-600/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                            {lesson.lessonOrder}-dars ({lesson.time})
                          </span>
                          <span className={`text-xs font-black ${lessonPercent >= 95 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {lessonPercent}%
                          </span>
                        </div>

                        {/* Fan nomi va O'qituvchi */}
                        <h4 className="text-sm font-black text-slate-900 dark:text-white mt-2.5 truncate">
                          {lesson.subject}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {lesson.teacherName || 'O\'qituvchi'}
                        </p>
                      </div>

                      {/* Darsdagi O'quvchilar Soni */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-400">Darsdagi o'quvchilar:</span>
                          <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                            {presentInLesson} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ {totalInSelectedClass}</span>
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div
                            className={`h-full rounded-full ${lessonPercent >= 95 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${lessonPercent}%` }}
                          ></div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                          <span>Kelmaganlar: <strong className="text-rose-600 dark:text-rose-400">{absentInLesson} nafar</strong></span>
                          <span>
                            {liveData ? (
                              <strong className="text-emerald-600 dark:text-emerald-400">✓ O'qituvchi yo'qlamasi</strong>
                            ) : isTodaySelected ? (
                              <span className="text-blue-600 dark:text-blue-400 font-medium">⚡ Jonli turniket</span>
                            ) : (
                              <span className="text-slate-400">Kutilmoqda</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {scheduleLessons.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  {currentClassObj?.name} sinfi uchun {selectedScheduleDay} kuniga dars jadvali hali kiritilmagan.
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* 3. MONITORNING PASTKI AXBOROT QATORI (FOOTER) */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span>SmartMaktab OS — Markaziy Boshqaruv & Foye Monitori</span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
          <span className="text-emerald-600 dark:text-emerald-400">Avtomatik yangilanuvchi tizim</span>
        </div>
        <div className="text-[11px] text-slate-500">
          Rejim: <strong className="text-slate-700 dark:text-slate-300">Katta Tablo</strong>
        </div>
      </div>

      {/* 4. O'NG TOMONDAN CHIQUVCHI SINF / XODIMLAR RO'YXATI SIDEBARI (DRAWER) */}
      {drawerTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          {/* Tashqi fonga bosilganda yopish */}
          <div className="flex-1" onClick={() => setDrawerTarget(null)}></div>

          {/* O'ng tomon Drawer oynasi */}
          <div className="w-full max-w-md sm:max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col z-10 animate-in slide-in-from-right duration-250">
            
            {/* Drawer Yuqori Qismi (Header) */}
            {(() => {
              const liveStats = drawerTarget.isStaff
                ? {
                    name: "Xodimlar & O'qituvchilar",
                    isStaff: true,
                    totalCount: totalTeachers,
                    presentCount: totalTeachersPresent,
                    absentCount: totalTeachersAbsent,
                    percent: teachersPercent
                  }
                : (classStats.find(cs => cs.id === drawerTarget.id) || drawerTarget);
              
              return (
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between gap-2 shrink-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-slate-900 dark:text-white truncate">
                        {liveStats.isStaff ? "Xodimlar & O'qituvchilar" : `${liveStats.name} Sinfi`}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        liveStats.percent >= 90
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                          : liveStats.percent >= 70
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                      }`}>
                        {liveStats.percent}% davomat
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Jami: <strong className="text-slate-800 dark:text-slate-200">{liveStats.totalCount} ta</strong> • 
                      Kelgan: <strong className="text-emerald-600 dark:text-emerald-400">{liveStats.presentCount} ta</strong> • 
                      Kelmagan: <strong className="text-rose-600 dark:text-rose-400">{liveStats.absentCount} ta</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => setDrawerTarget(null)}
                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
                    title="Yopish"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              );
            })()}

            {/* Qidiruv qatori */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={drawerSearch}
                  onChange={(e) => setDrawerSearch(e.target.value)}
                  placeholder={drawerTarget.isStaff ? "O'qituvchini qidirish..." : "O'quvchi F.I.Sh yoki ID bo'yicha qidiruv..."}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* O'quvchilar / Xodimlar Ro'yxati */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {drawerTarget.isStaff ? (
                // O'qituvchilar va Xodimlar
                teachers
                  .filter(t => !drawerSearch || t.name.toLowerCase().includes(drawerSearch.toLowerCase()) || (t.subject && t.subject.toLowerCase().includes(drawerSearch.toLowerCase())))
                  .map(t => {
                    const tName = (t.name || '').toLowerCase().trim();
                    const scans = todayScans.filter(s => {
                      const sName = (s.name || '').toLowerCase().trim();
                      return sName && tName && (sName === tName || sName.includes(tName) || tName.includes(sName));
                    });
                    let isPresent = false;
                    let inTime = null;
                    if (scans.length > 0) {
                      isPresent = scans[0].direction === 'in';
                      inTime = formatScanTime(scans[0]);
                    } else {
                      const att = teacherAttendance.find(ta => ta.teacherId === t.id && ta.date === todayStr);
                      if (att) {
                        isPresent = att.status === 'present';
                        inTime = att.inTime;
                      }
                    }

                    return (
                      <div
                        key={t.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          isPresent 
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60' 
                            : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                            isPresent ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300'
                          }`}>
                            {t.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{t.name}</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{t.subject || t.role || 'O\'qituvchi'}</p>
                            {inTime && (
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">Kirgan vaqti: {inTime}</p>
                            )}
                          </div>
                        </div>

                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg shrink-0 ${
                          isPresent 
                            ? 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300' 
                            : 'bg-rose-100 dark:bg-rose-900/80 text-rose-700 dark:text-rose-300'
                        }`}>
                          {isPresent ? '✓ Maktabda' : '❌ Maktabda emas'}
                        </span>
                      </div>
                    );
                  })
              ) : (
                // Sinf o'quvchilari
                (() => {
                  const classStudents = students.filter(s => s.classId === drawerTarget.id);
                  const classAtt = todayAttendanceList.find(a => a.classId === drawerTarget.id);
                  const q = drawerSearch.toLowerCase();
                  const filteredStudents = classStudents.filter(s => {
                    const name = (s.fullName || s.name || '').toLowerCase();
                    const id = (s.studentId || s.faceId || '').toLowerCase();
                    return !q || name.includes(q) || id.includes(q);
                  });

                  if (filteredStudents.length === 0) {
                    return (
                      <div className="py-12 text-center text-xs text-slate-400">
                        O'quvchi topilmadi
                      </div>
                    );
                  }

                  return filteredStudents.map((st, idx) => {
                    // Davomat holati (Bugun bo'yicha)
                    let inTime = null;
                    let outTime = null;

                    // 1. Bugungi Face-ID skanidan tekshirish
                    const normId = String(st.studentId || st.faceId || st.id || '').replace(/^s-/, '').replace(/^0+/, '');
                    const stName = (st.fullName || st.name || '').toLowerCase().trim();
                    const scans = todayScans.filter(s => {
                      const sEmp = String(s.employeeNo || '').replace(/^0+/, '');
                      const sName = (s.name || '').toLowerCase().trim();
                      return (normId && sEmp && sEmp === normId) || (sName && stName && (sName === stName || sName.includes(stName) || stName.includes(sName)));
                    });

                    if (scans.length > 0) {
                      const inScan = scans.find(s => s.direction === 'in');
                      const outScan = scans.find(s => s.direction === 'out');
                      if (inScan) inTime = formatScanTime(inScan);
                      if (outScan) outTime = formatScanTime(outScan);
                    } else if (classAtt && classAtt.records) {
                      const rec = classAtt.records.find(r => r.studentId === st.id || r.studentId === st.studentId);
                      if (rec) {
                        inTime = rec.inTime;
                        outTime = rec.outTime;
                      }
                    }

                    const isPresent = isStudentInsideToday(st);

                    return (
                      <div
                        key={st.id || idx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                          isPresent 
                            ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-emerald-400' 
                            : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 hover:border-rose-400'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Face-ID Surati */}
                          <MonitorStudentAvatar student={st} effectiveBaseUrl={effectiveBaseUrl} />

                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {st.fullName || st.name}
                            </h4>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono mt-0.5">
                              {st.faceId && (
                                <span className="text-blue-600 dark:text-blue-400 font-semibold">#{st.faceId}</span>
                              )}
                              {inTime && (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Kirdi: {inTime}</span>
                              )}
                              {outTime && (
                                <span className="text-rose-600 dark:text-rose-400 font-bold">Chiqdi: {outTime}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Holat belgisi */}
                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg shrink-0 ${
                          isPresent 
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' 
                            : outTime 
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                        }`}>
                          {isPresent ? '✓ Maktabda' : outTime ? '🚶 Chiqqan' : '✗ Kelmadi'}
                        </span>
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* Drawer Pastki qismi (Footer) */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-center shrink-0">
              <button
                onClick={() => setDrawerTarget(null)}
                className="w-full py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-colors"
              >
                Yopish
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
