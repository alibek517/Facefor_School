import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { 
  ClipboardList, 
  UserCheck, 
  UserX, 
  Clock, 
  MapPin, 
  Send, 
  Check, 
  Users,
  Sparkles 
} from 'lucide-react';

export const InspectorAttendance = () => {
  const { 
    classes, 
    students, 
    attendanceList, 
    submitAttendance, 
    inspectorName, 
    setInspectorName 
  } = useSchool();

  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || 'c-9a');
  const [tempInspector, setTempInspector] = useState(inspectorName);

  const d = new Date();
  const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const classStudents = students.filter(s => s.classId === selectedClassId);
  const todayClassAttendance = attendanceList.find(a => a.classId === selectedClassId && (a.date === todayStr || !a.date));

  const [recordsState, setRecordsState] = useState({});

  // Faqat tanlangan sinf (selectedClassId) o'zgarganda yuklash (orqa fondagi sinxronizatsiya navbatchining bosganlarini o'chirib yubormasligi uchun)
  useEffect(() => {
    const initialRecords = {};
    classStudents.forEach(st => {
      const existing = todayClassAttendance?.records?.find(r => r.studentId === st.id);
      if (existing) {
        initialRecords[st.id] = {
          status: existing.status,
          reason: existing.reason || '',
          customAddress: existing.customAddress || st.address,
        };
      } else {
        initialRecords[st.id] = {
          status: 'present',
          reason: '',
          customAddress: st.address,
        };
      }
    });
    setRecordsState(initialRecords);
  }, [selectedClassId]);

  // ⚡ Tugma bosilishi bilanoq darhol xotiraga va serverga avtomatik saqlash
  const handleStatusChange = (studentId, status) => {
    const current = recordsState[studentId] || {};
    let defaultReason = current.reason;
    if (status === 'absent' && !defaultReason) defaultReason = 'Sababsiz';
    if (status === 'present') defaultReason = '';
    if (status === 'late' && !defaultReason) defaultReason = 'Kechikkan';

    const nextState = {
      ...recordsState,
      [studentId]: {
        ...current,
        status,
        reason: defaultReason
      }
    };
    setRecordsState(nextState);

    // Darhol server va bazaga saqlash
    const recordsArray = Object.keys(nextState).map(sId => ({
      studentId: sId,
      status: nextState[sId]?.status || 'present',
      reason: nextState[sId]?.reason || '',
      customAddress: nextState[sId]?.customAddress || '',
      note: ''
    }));

    submitAttendance(selectedClassId, recordsArray, tempInspector, true);
  };

  const handleFieldChange = (studentId, field, value) => {
    const nextState = {
      ...recordsState,
      [studentId]: {
        ...(recordsState[studentId] || {}),
        [field]: value
      }
    };
    setRecordsState(nextState);

    if (field === 'reason') {
      const recordsArray = Object.keys(nextState).map(sId => ({
        studentId: sId,
        status: nextState[sId]?.status || 'present',
        reason: nextState[sId]?.reason || '',
        customAddress: nextState[sId]?.customAddress || '',
        note: ''
      }));
      submitAttendance(selectedClassId, recordsArray, tempInspector, true);
    }
  };

  const handleSaveAttendance = () => {
    setInspectorName(tempInspector);
    const recordsArray = Object.keys(recordsState).map(studentId => ({
      studentId,
      status: recordsState[studentId]?.status || 'present',
      reason: recordsState[studentId]?.reason || '',
      customAddress: recordsState[studentId]?.customAddress || '',
      note: ''
    }));

    submitAttendance(selectedClassId, recordsArray, tempInspector, false);
  };

  const currentClassObj = classes.find(c => c.id === selectedClassId);
  const absentCount = Object.values(recordsState).filter(r => r.status === 'absent').length;

  // 1 dan 11 gacha bo'lgan parallellarni guruhlash (Rasmga mos)
  const gradesList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  return (
    <div className="w-full space-y-3">
      
      {/* Navbatchi ismi */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 transition-colors">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Bugungi Navbatchi:
        </label>
        <input
          type="text"
          value={tempInspector}
          onChange={(e) => setTempInspector(e.target.value)}
          placeholder="Ismingizni kiriting..."
          className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 transition-colors"
        />
      </div>

      {/* Rasmga mos: 1 dan 11 gacha Sinflar Matritsasi */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Sinfni tanlang (1 - 11 sinflar):
          </label>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {classes.length} ta sinf
          </span>
        </div>

        {/* 11 ta Parallel Ustunlar (Gorizontal skroll bilan kichik ekranlarda ham toza) */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-2 sm:gap-3 min-w-[650px] justify-between">
            {gradesList.map(gradeNum => {
              const gradeClasses = classes.filter(c => c.grade === gradeNum);

              return (
                <div key={gradeNum} className="flex-1 flex flex-col items-center">
                  
                  {/* Parallel Raqami (1, 2, 3 ... 11) */}
                  <span className="text-sm font-black text-slate-400 dark:text-slate-500 mb-1.5 select-none">
                    {gradeNum}
                  </span>

                  {/* Shu parallelga tegishli sinflar (1-A, 1-B, 1-D) */}
                  <div className="flex flex-col gap-1 w-full">
                    {gradeClasses.map(c => {
                      const isSel = selectedClassId === c.id;
                      const hasAtt = attendanceList.some(a => a.classId === c.id);

                      return (
                        <button
                          key={c.id}
                          onClick={() => setSelectedClassId(c.id)}
                          className={`w-full py-1 px-1.5 text-center text-xs font-bold rounded-lg border transition-all truncate ${
                            isSel
                              ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                              : hasAtt
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                              : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                          title={`${c.name} (${c.room})`}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tanlangan Sinf Davomatini Olish */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {currentClassObj?.name} sinf davomati
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {currentClassObj?.room} • {classStudents.length} nafar o'quvchi
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {todayClassAttendance && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                Topshirilgan ({todayClassAttendance.timestamp})
              </span>
            )}
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
              1 klikda saqlanadi
            </span>
            {absentCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded">
                Kelmadi: {absentCount}
              </span>
            )}
          </div>
        </div>

        {/* Agar sinfda o'quvchi hali qo'shilmagan bo'lsa */}
        {classStudents.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
            {currentClassObj?.name} sinfiga hali o'quvchilar biriktirilmagan. "O'quvchilar" bo'limidan qo'shishingiz mumkin.
          </div>
        ) : (
          <div className="space-y-2">
            {classStudents.map((student, idx) => {
              const stData = recordsState[student.id] || { status: 'present', reason: '', customAddress: student.address };
              const isAbsent = stData.status === 'absent';
              const isLate = stData.status === 'late';
              const isPresent = stData.status === 'present';

              return (
                <div
                  key={student.id}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isAbsent 
                      ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20' 
                      : isLate 
                      ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20' 
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-5 shrink-0">
                          {idx + 1}.
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {student.fullName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate pl-6">
                        <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span className="truncate">{student.address}</span>
                      </div>
                    </div>

                    {/* 3 ta ixcham tugma */}
                    <div className="flex items-center gap-1 self-start sm:self-center pl-6 sm:pl-0 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                          isPresent
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        Kelgan
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                          isAbsent
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        Kelmadi
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'late')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                          isLate
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        Kechikdi
                      </button>
                    </div>
                  </div>

                  {/* Sabab va Manzil */}
                  {(isAbsent || isLate) && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                          Sababi:
                        </label>
                        <select
                          value={stData.reason}
                          onChange={(e) => handleFieldChange(student.id, 'reason', e.target.value)}
                          className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-rose-500"
                        >
                          <option value="Sababsiz">Sababsiz</option>
                          <option value="Sababli (Kasal)">Sababli (Kasal)</option>
                          <option value="Sababli (Oilaviy)">Sababli (Oilaviy)</option>
                          <option value="Kechikkan">Kechikkan</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                          Manzili:
                        </label>
                        <input
                          type="text"
                          value={stData.customAddress}
                          onChange={(e) => handleFieldChange(student.id, 'customAddress', e.target.value)}
                          placeholder="Yashash manzili..."
                          className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-rose-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Saqlash tugmasi */}
        {classStudents.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleSaveAttendance}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              {currentClassObj?.name} Davomatini Saqlash & Yuborish
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
