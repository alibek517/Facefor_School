import React, { useState, useMemo, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { 
  GraduationCap, 
  Phone, 
  MapPin, 
  AlertCircle, 
  Edit2, 
  Check, 
  Save, 
  X,
  Users,
  Calendar,
  ClipboardList,
  Search,
  Plus,
  Download,
  Lock,
  Clock,
  BookOpen,
  UserCheck,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { formatPhoneNumber, handlePhoneInputChange } from '../utils/phoneFormatter';
import { exportStudentsToExcel } from '../utils/excelAndPromotion';
import { DAYS_OF_WEEK } from '../mockData';
import { StudentAvatar } from './StudentAvatar';

export const ClassTeacherView = () => {
  const { 
    currentUser,
    selectedTeacherId, 
    teachers, 
    classes, 
    students, 
    schedules,
    attendanceList, 
    updateStudentAttendance,
    addStudent,
    updateStudent,
    bridgeUrl,
    globalStreamUrl,
    isLocalConnected,
    showToast
  } = useSchool();

  const effectiveBaseUrl = isLocalConnected ? (bridgeUrl || 'http://localhost:5001') : (globalStreamUrl || bridgeUrl || 'http://localhost:5001');

  // Rol tekshiruvi: Sinf rahbari faqat o'z sinfini ko'radi
  const isClassTeacher = currentUser?.role === 'class_teacher';
  const currentTeacher = (teachers || []).find(t => t.id === currentUser?.teacherId || t.id === selectedTeacherId) || (teachers || []).find(t => t.classId) || (teachers || [])[0];

  const assignedClassId = currentUser?.classId || currentTeacher?.classId || 'c-10a';
  const [selectedClassId, setSelectedClassId] = useState(assignedClassId);

  // Agar oddiy sinf rahbari bo'lsa, sinf qat'iy o'ziga biriktirilgan sinf bo'ladi
  const effectiveClassId = isClassTeacher ? assignedClassId : selectedClassId;
  const myClass = (classes || []).find(c => c.id === effectiveClassId) || (classes || []).find(c => c.id === assignedClassId) || (classes || [])[0];

  // Ichki faol tab: 'attendance' | 'students' | 'schedule'
  const [activeTab, setActiveTab] = useState('attendance');

  // Davomat holatini tahrirlash modali
  const [editingAttendanceStudent, setEditingAttendanceStudent] = useState(null);
  const [newStatus, setNewStatus] = useState('present');
  const [newReason, setNewReason] = useState('');

  // O'quvchilar bo'limi uchun holatlar
  const [studentSearch, setStudentSearch] = useState('');
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [newStudentFullName, setNewStudentFullName] = useState('');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // O'quvchi ma'lumotlarini tahrirlash modali
  const [editingStudentData, setEditingStudentData] = useState(null);
  const [editFullName, setEditFullName] = useState('');
  const [editParentName, setEditParentName] = useState('');
  const [editParentPhone, setEditParentPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Dars jadvali ko'rinish rejimi: 'grid' (Haftalik) | 'daily' (Kunlik)
  const [scheduleViewMode, setScheduleViewMode] = useState('grid');
  const [selectedDayTab, setSelectedDayTab] = useState(DAYS_OF_WEEK[0]);

  if (!myClass) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 text-center transition-colors">
        <GraduationCap className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Sizga biriktirilgan sinf topilmadi</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Iltimos maktab ma'muriyati bilan bog'laning.</p>
      </div>
    );
  }

  // FAQAT ushbu sinfga tegishli o'quvchilar va darslar
  const myStudents = useMemo(() => {
    return (students || []).filter(s => s.classId === myClass.id);
  }, [students, myClass.id]);

  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return myStudents;
    const q = studentSearch.toLowerCase().trim();
    return myStudents.filter(s => 
      (s.fullName || s.name || '').toLowerCase().includes(q) ||
      (s.parentName || '').toLowerCase().includes(q) ||
      (s.address || '').toLowerCase().includes(q) ||
      (s.parentPhone || '').includes(q)
    );
  }, [myStudents, studentSearch]);

  const mySchedules = useMemo(() => {
    return (schedules || []).filter(s => s.classId === myClass.id);
  }, [schedules, myClass.id]);

  const myAttendance = (attendanceList || []).find(a => a.classId === myClass.id);
  const absentRecords = myAttendance?.records?.filter(r => r.status === 'absent') || [];
  const lateRecords = myAttendance?.records?.filter(r => r.status === 'late') || [];
  const presentCount = myAttendance?.records ? myAttendance.records.filter(r => r.status === 'present').length : (myStudents.length - absentRecords.length - lateRecords.length);

  // Davomat tahrirlash ochish
  const handleOpenAttendanceEdit = (student, currentRec) => {
    setEditingAttendanceStudent(student);
    setNewStatus(currentRec?.status || 'present');
    setNewReason(currentRec?.reason || 'Sababsiz');
  };

  // Davomat tahrirlashni saqlash
  const handleSaveAttendanceEdit = () => {
    if (editingAttendanceStudent) {
      updateStudentAttendance(myClass.id, editingAttendanceStudent.id, newStatus, newReason);
      setEditingAttendanceStudent(null);
      if (showToast) {
        showToast('Saqlandi', `${editingAttendanceStudent.fullName} davomat holati yangilandi.`, 'success');
      }
    }
  };

  // Yangi o'quvchi qo'shish (faqat o'z sinfiga)
  const handleAddStudentSubmit = (e) => {
    e.preventDefault();
    if (!newStudentFullName.trim()) return;

    addStudent({
      fullName: newStudentFullName.trim(),
      name: newStudentFullName.trim(),
      classId: myClass.id,
      className: myClass.name,
      parentName: newParentName.trim(),
      parentPhone: newParentPhone.trim(),
      phone: newParentPhone.trim(),
      address: newAddress.trim() || 'Noma\'lum',
      studentId: `s-${Date.now().toString().slice(-6)}`
    });

    setNewStudentFullName('');
    setNewParentName('');
    setNewParentPhone('');
    setNewAddress('');
    setAddStudentModalOpen(false);
  };

  // O'quvchi ma'lumotlarini tahrirlashni ochish
  const handleOpenStudentEdit = (student) => {
    setEditingStudentData(student);
    setEditFullName(student.fullName || student.name || '');
    setEditParentName(student.parentName || '');
    setEditParentPhone(student.parentPhone || student.phone || '');
    setEditAddress(student.address || '');
  };

  // O'quvchi tahrirlashni saqlash
  const handleSaveStudentEdit = (e) => {
    e.preventDefault();
    if (!editingStudentData || !editFullName.trim()) return;

    updateStudent(editingStudentData.id, {
      fullName: editFullName.trim(),
      name: editFullName.trim(),
      parentName: editParentName.trim(),
      parentPhone: editParentPhone.trim(),
      phone: editParentPhone.trim(),
      address: editAddress.trim() || 'Noma\'lum'
    });

    setEditingStudentData(null);
  };

  // Excel ga eksport qilish
  const handleExportExcel = () => {
    exportStudentsToExcel(myStudents, `${myClass.name}_sinfi_oquvchilari`);
  };

  return (
    <div className="w-full space-y-3">
      
      {/* 1. Sarlavha paneli */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 transition-colors shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              {currentTeacher?.name || currentUser?.name || 'Sinf Rahbari'}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800">
              Sinf Rahbari
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs text-slate-500 dark:text-slate-400">Biriktirilgan sinf:</span>
            
            {/* Agar sinf rahbari bo'lsa, sinf tanlash qulflangan */}
            {isClassTeacher ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                <Lock className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                <span>{myClass.name} sinfi</span>
                <span className="text-[10px] opacity-75 font-normal">({myClass.room || 'Xona belgilanmagan'})</span>
              </div>
            ) : (
              <select
                value={myClass.id}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 outline-none cursor-pointer"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} sinfi ({c.room})</option>
                ))}
              </select>
            )}

            <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              O'quvchilar: <b className="text-slate-800 dark:text-slate-200">{myStudents.length}</b> nafar
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
              myAttendance 
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${myAttendance ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {myAttendance ? 'Bugungi davomat topshirilgan' : 'Davomat kutilmoqda'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Sinf Rahbari Ichki Tablari (Davomat, O'quvchilar, Dars Jadvali) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-1.5 border border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto no-scrollbar transition-colors">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === 'attendance'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Sinf Davomati</span>
          {absentRecords.length > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-black">
              {absentRecords.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === 'students'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Mening O'quvchilarim</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            activeTab === 'students' ? 'bg-blue-800 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}>
            {myStudents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === 'schedule'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Sinf Dars Jadvali</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            activeTab === 'schedule' ? 'bg-blue-800 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}>
            {mySchedules.length}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. TAB 1: SINF DAVOMATI                                   */}
      {/* ======================================================== */}
      {activeTab === 'attendance' && (
        <div className="space-y-3">
          
          {/* Tezkor hisobot kartalari */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Jami o'quvchilar</span>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{myStudents.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-2xs">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Kelganlar</span>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{presentCount}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/20 shadow-2xs">
              <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">Kelmaganlar</span>
              <p className="text-lg font-black text-rose-700 dark:text-rose-300 mt-0.5">{absentRecords.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/20 shadow-2xs">
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Kechikkanlar</span>
              <p className="text-lg font-black text-amber-700 dark:text-amber-300 mt-0.5">{lateRecords.length}</p>
            </div>
          </div>

          {/* Kelmaganlar haqida tezkor ogohlantirish */}
          {absentRecords.length > 0 && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl p-3 transition-colors">
              <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 text-xs font-bold mb-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>Bugun {absentRecords.length} nafar o'quvchi darsga kelmadi:</span>
              </div>

              <div className="space-y-2">
                {absentRecords.map(rec => {
                  const st = myStudents.find(s => s.id === rec.studentId);
                  if (!st) return null;

                  return (
                    <div key={st.id} className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors">
                      <div className="min-w-0 flex items-center gap-2.5">
                        <StudentAvatar student={st} effectiveBaseUrl={effectiveBaseUrl} size="w-9 h-9" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{st.fullName || st.name}</span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 rounded">
                              {rec.reason || 'Sababsiz'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{rec.customAddress || st.address || 'Manzil kiritilmagan'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                        <a
                          href={`tel:${st.parentPhone || st.phone}`}
                          className="px-2.5 py-1 text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 transition-colors"
                          title={formatPhoneNumber(st.parentPhone || st.phone)}
                        >
                          <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>{formatPhoneNumber(st.parentPhone || st.phone) || "Qo'ng'iroq"}</span>
                        </a>
                        <button
                          onClick={() => handleOpenAttendanceEdit(st, rec)}
                          className="px-2 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md flex items-center gap-1 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>O'zgartirish</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sinf O'quvchilari Davomati Ro'yxati */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-white">
                {myClass.name} sinf davomat ro'yxati ({myStudents.length} nafar o'quvchi)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Xona: <b className="text-slate-700 dark:text-slate-300">{myClass.room}</b>
              </span>
            </div>

            <div className="space-y-1.5">
              {myStudents.map((st, idx) => {
                const rec = myAttendance?.records?.find(r => r.studentId === st.id);
                const isAbsent = rec?.status === 'absent';
                const isLate = rec?.status === 'late';

                return (
                  <div
                    key={st.id}
                    className="p-2 sm:p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-5 shrink-0 text-center">{idx + 1}.</span>
                      <StudentAvatar student={st} effectiveBaseUrl={effectiveBaseUrl} size="w-8 h-8" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">{st.fullName || st.name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate block">
                          {st.address || "Manzil ko'rsatilmagan"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isAbsent ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded">
                          Kelmadi
                        </span>
                      ) : isLate ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded">
                          Kechikdi
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded">
                          Kelgan
                        </span>
                      )}

                      <button
                        onClick={() => handleOpenAttendanceEdit(st, rec)}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        title="Davomat holatini o'zgartirish"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. TAB 2: MENING O'QUVCHILARIM (FAQAT O'Z SINF)           */}
      {/* ======================================================== */}
      {activeTab === 'students' && (
        <div className="space-y-3">
          
          {/* Xavfsizlik va ruxsat eslatmasi */}
          <div className="bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl p-3 flex items-center justify-between gap-2 transition-colors">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <p className="text-xs text-indigo-900 dark:text-indigo-200 font-medium">
                Siz faqat o'zingizning <b className="font-extrabold">{myClass.name} sinfingiz</b> o'quvchilari ro'yxatini ko'rish va boshqarish huquqiga egasiz.
              </p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 rounded-md shrink-0">
              {myStudents.length} nafar o'quvchi
            </span>
          </div>

          {/* Qidiruv va boshqaruv asboblar paneli */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 transition-colors shadow-2xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="O'quvchi ismi, ota-onasi yoki manzili bo'yicha qidirish..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
              <button
                onClick={handleExportExcel}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors"
                title="Sinf o'quvchilarini Excel fayliga yuklab olish"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>

              <button
                onClick={() => setAddStudentModalOpen(true)}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ O'quvchi qo'shish</span>
              </button>
            </div>
          </div>

          {/* O'quvchilar ro'yxati */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors shadow-2xs">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                {studentSearch ? 'Qidiruv bo\'yicha o\'quvchi topilmadi.' : 'Sinfda hozircha o\'quvchilar mavjud emas.'}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map((st, index) => (
                  <div 
                    key={st.id || index}
                    className="p-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-5 shrink-0 text-center">
                        {index + 1}.
                      </span>
                      
                      <StudentAvatar student={st} effectiveBaseUrl={effectiveBaseUrl} size="w-10 h-10" />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {st.fullName || st.name}
                          </h4>
                          {st.studentId && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              #{st.studentId}
                            </span>
                          )}
                          {(st.isFaceEnrolled || st.faceURL) && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
                              Face-ID
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          {st.parentName && (
                            <span>Ota-onasi: <b className="text-slate-700 dark:text-slate-300 font-medium">{st.parentName}</b></span>
                          )}
                          {st.address && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[200px] sm:max-w-[260px]">{st.address}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Telefon va Tahrirlash tugmalari */}
                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0 pl-8 sm:pl-0">
                      {(st.parentPhone || st.phone) ? (
                        <a
                          href={`tel:${st.parentPhone || st.phone}`}
                          className="px-2.5 py-1 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 transition-colors"
                          title="Qo'ng'iroq qilish"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{formatPhoneNumber(st.parentPhone || st.phone)}</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Raqam yo'q</span>
                      )}

                      <button
                        onClick={() => handleOpenStudentEdit(st)}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                        title="O'quvchi ma'lumotlarini tahrirlash"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. TAB 3: SINF DARS JADVALI (FAQAT O'Z SINF)              */}
      {/* ======================================================== */}
      {activeTab === 'schedule' && (
        <div className="space-y-3">
          
          {/* Info va Ko'rinish rejimi */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 transition-colors shadow-2xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  {myClass.name} sinfining haftalik dars jadvali
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Jami darslar soni: <b className="text-slate-800 dark:text-slate-200">{mySchedules.length} ta</b> • Xona: <b className="text-slate-800 dark:text-slate-200">{myClass.room}</b>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setScheduleViewMode('grid')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  scheduleViewMode === 'grid'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Haftalik jadval
              </button>
              <button
                onClick={() => setScheduleViewMode('daily')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  scheduleViewMode === 'daily'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Kunlik ko'rinish
              </button>
            </div>
          </div>

          {/* Haftalik Grid Ko'rinishi */}
          {scheduleViewMode === 'grid' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                      <th className="p-2.5 font-bold w-20 text-center">Soat</th>
                      {DAYS_OF_WEEK.map(day => (
                        <th key={day} className="p-2.5 font-bold text-center border-l border-slate-200 dark:border-slate-800">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[1, 2, 3, 4, 5, 6].map(order => {
                      const sampleTime = mySchedules.find(s => s.lessonOrder === order)?.time || `${8 + order - 1}:30 - ${9 + order - 1}:15`;

                      return (
                        <tr key={order} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="p-2.5 font-bold text-center bg-slate-50/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 text-[11px] whitespace-nowrap">
                            <span className="block font-black text-slate-800 dark:text-slate-200">{order}-soat</span>
                            <span className="text-[10px] text-slate-400 block">{sampleTime}</span>
                          </td>

                          {DAYS_OF_WEEK.map(day => {
                            const lesson = mySchedules.find(s => s.day === day && s.lessonOrder === order);
                            const teacher = teachers.find(t => t.id === lesson?.teacherId);

                            return (
                              <td key={day} className="p-2 border-l border-slate-200 dark:border-slate-800 align-top">
                                {lesson ? (
                                  <div className="p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 space-y-1 shadow-2xs">
                                    <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                      {lesson.subject}
                                    </div>
                                    <div className="text-[11px] font-medium truncate flex items-center gap-1">
                                      {teacher ? (
                                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                                          👨‍🏫 {teacher.name}
                                        </span>
                                      ) : lesson.teacherName ? (
                                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                                          👨‍🏫 {lesson.teacherName}
                                        </span>
                                      ) : (
                                        <span className="text-slate-400 italic">
                                          ⚠️ O'qituvchi belgilanmagan
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                                      Xona: {myClass.room}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-14 flex items-center justify-center text-slate-300 dark:text-slate-700 text-xs">
                                    —
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Kunlik Ko'rinish */}
          {scheduleViewMode === 'daily' && (
            <div className="space-y-3">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
                {DAYS_OF_WEEK.map(day => {
                  const dayCount = mySchedules.filter(s => s.day === day).length;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDayTab(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                        selectedDayTab === day
                          ? 'bg-blue-700 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {day} ({dayCount})
                    </button>
                  );
                })}
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs space-y-2">
                {(() => {
                  const dayLessons = mySchedules
                    .filter(s => s.day === selectedDayTab)
                    .sort((a, b) => a.lessonOrder - b.lessonOrder);

                  if (dayLessons.length === 0) {
                    return (
                      <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                        {selectedDayTab} kuni uchun dars jadvali kiritilmagan.
                      </div>
                    );
                  }

                  return dayLessons.map(lesson => {
                    const teacher = teachers.find(t => t.id === lesson.teacherId);

                    return (
                      <div
                        key={lesson.id}
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center shrink-0">
                            {lesson.lessonOrder}
                          </span>
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                              {lesson.subject}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{lesson.time || `${lesson.lessonOrder}-soat`}</span>
                              <span>•</span>
                              <span>Xona: {myClass.room}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center">
                          {teacher ? (
                            <span className="px-2.5 py-1 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800">
                              👨‍🏫 {teacher.name}
                            </span>
                          ) : lesson.teacherName ? (
                            <span className="px-2.5 py-1 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800">
                              👨‍🏫 {lesson.teacherName}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[11px] text-slate-400 italic bg-slate-100 dark:bg-slate-800 rounded">
                              ⚠️ Fan o'qituvchisi belgilanmagan
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MODALLAR                                              */}
      {/* ======================================================== */}

      {/* Modal 1: Davomat holatini o'zgartirish */}
      {editingAttendanceStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-xs w-full p-4 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-white">Davomat holatini o'zgartirish</span>
              <button onClick={() => setEditingAttendanceStudent(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{editingAttendanceStudent.fullName || editingAttendanceStudent.name}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{editingAttendanceStudent.address || "Manzil ko'rsatilmagan"}</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">Holati:</label>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => setNewStatus('present')}
                  className={`py-1 text-[11px] font-bold rounded transition-colors ${
                    newStatus === 'present' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Kelgan
                </button>
                <button
                  type="button"
                  onClick={() => setNewStatus('absent')}
                  className={`py-1 text-[11px] font-bold rounded transition-colors ${
                    newStatus === 'absent' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Kelmadi
                </button>
                <button
                  type="button"
                  onClick={() => setNewStatus('late')}
                  className={`py-1 text-[11px] font-bold rounded transition-colors ${
                    newStatus === 'late' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Kechikdi
                </button>
              </div>
            </div>

            {newStatus !== 'present' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">Sababi:</label>
                <select
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="Sababsiz">Sababsiz</option>
                  <option value="Sababli (Kasal)">Sababli (Kasal)</option>
                  <option value="Sababli (Oilaviy)">Sababli (Oilaviy)</option>
                  <option value="Kechikkan">Kechikkan</option>
                </select>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-1.5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingAttendanceStudent(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleSaveAttendanceEdit}
                className="px-3 py-1.5 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded flex items-center gap-1 shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Yangi O'quvchi Qo'shish (Faqat ushbu sinfga) */}
      {addStudentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>{myClass.name} sinfiga yangi o'quvchi qo'shish</span>
              </h3>
              <button onClick={() => setAddStudentModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  O'quvchi F.I.Sh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Karimova Dilnoza Sherzod qizi"
                  value={newStudentFullName}
                  onChange={(e) => setNewStudentFullName(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Biriktiriladigan sinf:
                </label>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-indigo-700 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{myClass.name} sinfi (Sizning sinfingiz)</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ota-onasi F.I.Sh:
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Karimov Sherzod"
                  value={newParentName}
                  onChange={(e) => setNewParentName(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Telefon raqami (+998-XX-XXX-XX-XX):
                </label>
                <input
                  type="text"
                  placeholder="+998-90-123-45-67"
                  value={newParentPhone}
                  onChange={(e) => handlePhoneInputChange(e.target.value, setNewParentPhone)}
                  className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Yashash manzili:
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Bog'ot tumani, Guliston MFY, 12-uy"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddStudentModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: O'quvchi ma'lumotlarini tahrirlash */}
      {editingStudentData && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <span>O'quvchi ma'lumotlarini tahrirlash</span>
              </h3>
              <button onClick={() => setEditingStudentData(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentEdit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  O'quvchi F.I.Sh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ota-onasi F.I.Sh:
                </label>
                <input
                  type="text"
                  value={editParentName}
                  onChange={(e) => setEditParentName(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Telefon raqami (+998-XX-XXX-XX-XX):
                </label>
                <input
                  type="text"
                  placeholder="+998-90-123-45-67"
                  value={editParentPhone}
                  onChange={(e) => handlePhoneInputChange(e.target.value, setEditParentPhone)}
                  className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Yashash manzili:
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStudentData(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
