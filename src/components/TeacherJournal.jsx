import React, { useState, useEffect, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { DAYS_OF_WEEK } from '../mockData';
import { 
  BookOpen, 
  Check, 
  X, 
  Save, 
  Calendar, 
  UserCheck, 
  UserX, 
  Clock, 
  GraduationCap, 
  AlertCircle, 
  ChevronRight,
  ListOrdered,
  Users
} from 'lucide-react';

// Matnlarni (ayniqsa o'zbekcha tutuq belgilarini: ' ` ’ ʻ) bir xil formatga keltirish
const normalizeText = (str) => {
  return (str || '')
    .toLowerCase()
    .replace(/['`’ʻ]/g, "'")
    .trim();
};

export const TeacherJournal = () => {
  const { 
    currentUser,
    selectedTeacherId, 
    setSelectedTeacherId,
    teachers, 
    classes, 
    students, 
    schedules, 
    updateStudentAttendance,
    recordLessonAttendance,
    showToast 
  } = useSchool();

  // 1. Joriy o'qituvchini aniqlash (currentUser, selectedTeacherId yoki ism bo'yicha)
  const currentTeacher = useMemo(() => {
    const list = teachers || [];
    if (list.length === 0) return null;

    // A. currentUser.teacherId bo'yicha
    if (currentUser?.teacherId) {
      const byCur = list.find(t => t.id === currentUser.teacherId);
      if (byCur) return byCur;
    }

    // B. selectedTeacherId bo'yicha
    if (selectedTeacherId) {
      const bySel = list.find(t => t.id === selectedTeacherId);
      if (bySel) return bySel;
    }

    // C. Ism bo'yicha (currentUser.name mosligi)
    if (currentUser?.name) {
      const curNorm = normalizeText(currentUser.name);
      const byName = list.find(t => normalizeText(t.name) === curNorm || curNorm.includes(normalizeText(t.name)));
      if (byName) return byName;
    }

    // D. Default birinchi o'qituvchi
    return list[0];
  }, [teachers, currentUser, selectedTeacherId]);

  const teacherId = currentTeacher?.id || currentUser?.teacherId || selectedTeacherId;
  const teacherNormName = normalizeText(currentTeacher?.name || currentUser?.name || '');

  // 2. Ushbu o'qituvchining maktab bo'yicha BARCHA darslari
  const allTeacherLessons = useMemo(() => {
    if (!teacherId && !teacherNormName) return [];

    return (schedules || []).filter(s => {
      if (!s) return false;

      // A. ID bo'yicha qat'iy yoki prefiks bilan mos kelish
      if (teacherId) {
        if (s.teacherId === teacherId || String(s.teacherId) === String(teacherId)) return true;
        if (`t-${s.teacherId}` === teacherId || s.teacherId === `t-${teacherId}`) return true;
      }

      // B. O'qituvchi ismi bo'yicha mos kelish
      if (teacherNormName) {
        const sTeacherName = normalizeText(s.teacherName || s.teacher || '');
        if (sTeacherName && (sTeacherName === teacherNormName || sTeacherName.includes(teacherNormName) || teacherNormName.includes(sTeacherName))) {
          return true;
        }
      }

      return false;
    });
  }, [schedules, teacherId, teacherNormName]);

  // Bugungi hafta kunini aniqlash (o'zbekcha)
  const getTodayDayName = () => {
    const dayIndex = new Date().getDay(); // 0: Yakshanba, 1: Dushanba, ..., 6: Shanba
    if (dayIndex === 1) return 'Dushanba';
    if (dayIndex === 2) return 'Seshanba';
    if (dayIndex === 3) return 'Chorshanba';
    if (dayIndex === 4) return 'Payshanba';
    if (dayIndex === 5) return 'Juma';
    if (dayIndex === 6) return 'Shanba';
    return 'Dushanba';
  };

  const todayDay = getTodayDayName();
  const [selectedDay, setSelectedDay] = useState(todayDay);
  const [viewMode, setViewMode] = useState('daily'); // 'daily' (Kunlik jurnal) | 'weekly' (Haftalik jadval)

  // Agar tanlangan kunda dars bo'lmasa, lekin boshqa kunlarda dars bo'lsa, avtomatik ravishda dars bor birinchi kunni tanlash
  useEffect(() => {
    if (allTeacherLessons.length > 0) {
      const hasSelectedDayLessons = allTeacherLessons.some(s => s.day === selectedDay);
      if (!hasSelectedDayLessons) {
        const firstDayWithLesson = DAYS_OF_WEEK.find(d => allTeacherLessons.some(s => s.day === d));
        if (firstDayWithLesson) {
          setSelectedDay(firstDayWithLesson);
        }
      }
    }
  }, [allTeacherLessons]);

  // Tanlangan kunga tegishli bu o'qituvchining darslari
  const dayLessons = useMemo(() => {
    return allTeacherLessons
      .filter(s => s.day === selectedDay)
      .sort((a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0));
  }, [allTeacherLessons, selectedDay]);

  const [selectedLessonId, setSelectedLessonId] = useState('');

  // Kun yoki darslar ro'yxati o'zgarganda birinchi darsni avtomatik tanlash
  useEffect(() => {
    if (dayLessons.length > 0) {
      if (!selectedLessonId || !dayLessons.some(l => l.id === selectedLessonId)) {
        setSelectedLessonId(dayLessons[0].id);
      }
    } else {
      setSelectedLessonId('');
    }
  }, [selectedDay, dayLessons]);

  const activeLesson = (schedules || []).find(l => l.id === selectedLessonId);
  const targetClass = (classes || []).find(c => c.id === activeLesson?.classId);
  const lessonStudents = activeLesson 
    ? (students || []).filter(s => s.classId === activeLesson.classId) 
    : [];

  const [lessonTopic, setLessonTopic] = useState('Dars mavzusi');
  const [attendanceMap, setAttendanceMap] = useState({});

  useEffect(() => {
    if (activeLesson) {
      const initial = {};
      lessonStudents.forEach(st => {
        initial[st.id] = true;
      });
      setAttendanceMap(initial);
    }
  }, [selectedLessonId, activeLesson?.id]);

  const toggleStudent = (studentId) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleSave = () => {
    if (!activeLesson) return;

    let absentCount = 0;
    Object.keys(attendanceMap).forEach(studentId => {
      const isPresent = attendanceMap[studentId];
      if (!isPresent) {
        absentCount++;
        updateStudentAttendance(
          activeLesson.classId,
          studentId,
          'absent',
          `Darsda qatnashmadi (${activeLesson.subject})`,
          `${currentTeacher?.name} darsida yo'q deb belgilandi`
        );
      }
    });

    const presentStudentsCount = lessonStudents.length - absentCount;
    if (recordLessonAttendance) {
      recordLessonAttendance(
        activeLesson.id,
        presentStudentsCount,
        lessonStudents.length,
        activeLesson.subject,
        activeLesson.classId
      );
    }

    if (showToast) {
      showToast(
        'Davomat saqlandi',
        `${targetClass?.name} sinfi (${activeLesson.subject}) dars davomati saqlandi.`,
        'success'
      );
    }
  };

  return (
    <div className="w-full space-y-3">
      
      {/* 1. Sarlavha paneli */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                {currentTeacher?.name || 'Fan O\'qituvchisi'}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-md border border-amber-200 dark:border-amber-800">
                Fan O'qituvchisi
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span>Mutaxassislik fani: <b className="text-slate-800 dark:text-slate-200">{currentTeacher?.subject || 'Belgilanmagan'}</b></span>
              <span>•</span>
              <span>Jami darslar: <b className="text-emerald-600 dark:text-emerald-400 font-bold">{allTeacherLessons.length} ta dars</b></span>
            </div>
          </div>

          {/* O'qituvchi tanlash yoki Rejim almashtirish */}
          <div className="flex items-center gap-2">
            {(currentUser?.isDirector || currentUser?.role === 'director' || teachers.length > 1) && (
              <select
                value={currentTeacher?.id || ''}
                onChange={(e) => setSelectedTeacherId && setSelectedTeacherId(e.target.value)}
                className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 outline-none cursor-pointer"
                title="O'qituvchi profilini tanlash"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    👨‍🏫 {t.name} ({t.subject || 'O\'qituvchi'})
                  </option>
                ))}
              </select>
            )}

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('daily')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                  viewMode === 'daily'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Kunlik Jurnal
              </button>
              <button
                onClick={() => setViewMode('weekly')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                  viewMode === 'weekly'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Haftalik Jadval ({allTeacherLessons.length})
              </button>
            </div>
          </div>
        </div>

        {/* Hafta Kunlari Menyusi */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
              Hafta kunini tanlang:
            </label>
            <span className="text-[10px] text-slate-400">
              Raqamlar shu kungi darslar sonini bildiradi
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {DAYS_OF_WEEK.map(day => {
              const count = allTeacherLessons.filter(s => s.day === day).length;
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{day}</span>
                  {count > 0 ? (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isSelected ? 'bg-amber-800 text-white' : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {count}
                    </span>
                  ) : (
                    <span className="text-[10px] opacity-40 font-normal">
                      0
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tanlangan kundagi darslar tugmalari */}
        {viewMode === 'daily' && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
            {dayLessons.length === 0 ? (
              <div>
                {allTeacherLessons.length > 0 ? (
                  <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{selectedDay} kuni uchun darsingiz yo'q.</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Sizning darslaringiz jadval bo'yicha quyidagi kunlarga biriktirilgan. Kerakli kunni tanlang:
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {DAYS_OF_WEEK.filter(d => allTeacherLessons.some(s => s.day === d)).map(d => {
                        const cnt = allTeacherLessons.filter(s => s.day === d).length;
                        return (
                          <button
                            key={d}
                            onClick={() => setSelectedDay(d)}
                            className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-200 font-bold rounded-lg border border-amber-300 dark:border-amber-700 text-xs flex items-center gap-1 shadow-2xs transition-colors"
                          >
                            <span>👉 {d}</span>
                            <span className="text-[10px] bg-amber-200 dark:bg-amber-900 px-1.5 py-0.2 rounded-full font-black">
                              {cnt} ta dars
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <p className="font-bold text-slate-700 dark:text-slate-300">Hozircha sizga biriktirilgan darslar jadvalda topilmadi.</p>
                    <p className="text-[11px]">Dars jadvali bo'limidan ushbu o'qituvchiga dars biriktirilganini tekshiring.</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  {selectedDay} darslari ({dayLessons.length} ta dars):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {dayLessons.map(l => {
                    const cls = classes.find(c => c.id === l.classId);
                    const isSel = (activeLesson?.id === l.id);
                    return (
                      <button
                        key={l.id}
                        onClick={() => setSelectedLessonId(l.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                          isSel
                            ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">
                          {l.lessonOrder}
                        </span>
                        <span>{cls?.name || 'Sinf'}</span>
                        <span className="opacity-80 text-[11px] font-normal">({l.subject})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. HAFTALIK JADVAL KO'RINISHI                            */}
      {/* ======================================================== */}
      {viewMode === 'weekly' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
                {currentTeacher?.name} — Haftalik Dars Jadvali
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Jami: <b className="text-slate-800 dark:text-slate-200">{allTeacherLessons.length} soat</b> haftalik dars yuklamasi
              </p>
            </div>
            <button
              onClick={() => setViewMode('daily')}
              className="px-2.5 py-1 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Jurnalga qaytish
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {DAYS_OF_WEEK.map(day => {
              const lessons = allTeacherLessons
                .filter(s => s.day === day)
                .sort((a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0));

              return (
                <div 
                  key={day}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{day}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded">
                      {lessons.length} ta dars
                    </span>
                  </div>

                  {lessons.length === 0 ? (
                    <div className="py-3 text-center text-slate-400 dark:text-slate-500 text-[11px]">
                      Dars yo'q
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {lessons.map(l => {
                        const cls = classes.find(c => c.id === l.classId);
                        return (
                          <div
                            key={l.id}
                            onClick={() => {
                              setSelectedDay(day);
                              setSelectedLessonId(l.id);
                              setViewMode('daily');
                            }}
                            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-600 cursor-pointer transition-all flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                {l.lessonOrder}-soat: {cls?.name} ({l.subject})
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {l.time || 'Vaqt belgilanmagan'} • Xona: {cls?.room}
                              </div>
                            </div>
                            <span className="text-amber-600 dark:text-amber-400 text-xs font-bold">
                              Ochish ➔
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. TANLANGAN DARS DAVOMATI                               */}
      {/* ======================================================== */}
      {viewMode === 'daily' && activeLesson && (
        <>
          {/* Dars mavzusi */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Dars mavzusi:
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                {selectedDay} • {activeLesson.time} • Xona: {targetClass?.room}
              </span>
            </div>
            <input
              type="text"
              value={lessonTopic}
              onChange={(e) => setLessonTopic(e.target.value)}
              placeholder="Masalan: 12-mavzu: Amir Temur davlati..."
              className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 transition-colors"
            />
          </div>

          {/* O'quvchilar ro'yxati (Faqat Davomat) */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-white">
                  {targetClass?.name} sinfi ({lessonStudents.length} o'quvchi)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded">
                  {activeLesson.subject}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Kelmagan o'quvchini ustiga bosing
              </span>
            </div>

            <div className="space-y-1.5">
              {lessonStudents.map((st, idx) => {
                const isPresent = attendanceMap[st.id] !== false;

                return (
                  <div
                    key={st.id}
                    onClick={() => toggleStudent(st.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all select-none ${
                      isPresent
                        ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                        : 'border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-5 shrink-0">
                        {idx + 1}.
                      </span>
                      <span className="text-xs font-semibold truncate text-slate-900 dark:text-white">
                        {st.fullName || st.name}
                      </span>
                    </div>

                    <div className="shrink-0">
                      {isPresent ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          <UserCheck className="w-3.5 h-3.5" />
                          Darsda
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md bg-rose-600 text-white shadow-2xs">
                          <UserX className="w-3.5 h-3.5" />
                          Darsda yo'q
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Saqlash tugmasi */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleSave}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Davomatni Saqlash ({targetClass?.name} • {activeLesson.subject})
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
