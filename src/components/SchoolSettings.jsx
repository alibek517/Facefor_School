import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { DAYS_OF_WEEK } from '../mockData';
import { formatPhoneNumber, handlePhoneInputChange } from '../utils/phoneFormatter';
import { 
  Users, 
  BookOpen, 
  Building, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Clock, 
  Phone,
  Calendar,
  Grid,
  List,
  ShieldCheck,
  CheckSquare,
  Square,
  Film,
  Video,
  LayoutDashboard,
  Bell,
  Key,
  Lock,
  Check,
  GraduationCap,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { StudentAvatar } from './StudentAvatar';

export const SchoolSettings = () => {
  const { 
    teachers, 
    classes, 
    schedules, 
    leadership = [],
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    AVAILABLE_PERMISSIONS = [],
    addTeacher, 
    updateTeacher, 
    deleteTeacher,
    addSchedule, 
    updateSchedule, 
    batchAssignTeacherToSchedule,
    deleteSchedule,
    addClass,
    updateClass,
    deleteClass,
    faceDevice,
    recentFaceScans,
    fetchDeviceUsers,
    bridgeUrl,
    isLocalConnected,
    globalStreamUrl,
    showToast
  } = useSchool();

  const effectiveBaseUrl = isLocalConnected ? (bridgeUrl || 'http://localhost:5001') : (globalStreamUrl || bridgeUrl || 'http://localhost:5001');

  // Rahbariyat va Administratorlar modali holati
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [staffForm, setStaffForm] = useState({
    name: '',
    role: '',
    category: 'leadership',
    phone: '',
    login: '',
    password: '',
    isDirector: false,
    permissions: ['dashboard']
  });

  const openAddStaff = (category = 'leadership') => {
    setEditingStaffId(null);
    setStaffForm({
      name: '',
      role: category === 'leadership' ? "Direktor o'rinbosari" : "Administrator (ma'muriyat)",
      category: category,
      phone: '',
      login: '',
      password: '123',
      isDirector: false,
      permissions: category === 'leadership' 
        ? ['dashboard', 'cameras', 'playback', 'students', 'teachers', 'schedules', 'notifications']
        : ['dashboard', 'students', 'cameras']
    });
    setStaffModalOpen(true);
  };

  const openEditStaff = (member) => {
    setEditingStaffId(member.id);
    setStaffForm({
      name: member.name || '',
      role: member.role || '',
      category: member.category || 'leadership',
      phone: member.phone || '',
      login: member.login || '',
      password: member.password || '',
      isDirector: Boolean(member.isDirector),
      permissions: Array.isArray(member.permissions) ? member.permissions : ['dashboard']
    });
    setStaffModalOpen(true);
  };

  const handleSaveStaff = (e) => {
    e.preventDefault();
    if (!staffForm.name.trim()) return;

    if (editingStaffId) {
      updateStaffMember(editingStaffId, staffForm);
    } else {
      addStaffMember(staffForm);
    }
    setStaffModalOpen(false);
  };

  const toggleStaffPermission = (permKey) => {
    if (staffForm.isDirector) return;
    setStaffForm(prev => {
      const perms = prev.permissions || [];
      if (perms.includes(permKey)) {
        return { ...prev, permissions: perms.filter(k => k !== permKey) };
      } else {
        return { ...prev, permissions: [...perms, permKey] };
      }
    });
  };

  const selectAllStaffPermissions = () => {
    const allKeys = (AVAILABLE_PERMISSIONS || []).map(p => p.key);
    setStaffForm(prev => ({ ...prev, permissions: allKeys }));
  };

  const clearAllStaffPermissions = () => {
    if (staffForm.isDirector) return;
    setStaffForm(prev => ({ ...prev, permissions: [] }));
  };

  // 1. Dars bo'yicha bitta fanga o'qituvchi belgilash modali
  const [assignTeacherModalOpen, setAssignTeacherModalOpen] = useState(false);
  const [selectedLessonForTeacher, setSelectedLessonForTeacher] = useState(null);
  const [chosenTeacherId, setChosenTeacherId] = useState('');
  const [chosenTeacherName, setChosenTeacherName] = useState('');
  const [applyToAllSameSubject, setApplyToAllSameSubject] = useState(true);

  const handleOpenAssignTeacher = (lesson) => {
    setSelectedLessonForTeacher(lesson);
    setChosenTeacherId(lesson.teacherId || '');
    const foundTeacher = teachers.find(t => t.id === lesson.teacherId);
    setChosenTeacherName(lesson.teacherName || foundTeacher?.name || '');
    setApplyToAllSameSubject(true);
    setAssignTeacherModalOpen(true);
  };

  const handleSaveAssignTeacher = (e) => {
    e.preventDefault();
    if (!selectedLessonForTeacher) return;
    const teacher = teachers.find(t => t.id === chosenTeacherId);
    const teacherName = teacher ? teacher.name : chosenTeacherName;

    if (batchAssignTeacherToSchedule) {
      batchAssignTeacherToSchedule({
        scheduleId: selectedLessonForTeacher.id,
        classId: selectedLessonForTeacher.classId,
        subject: selectedLessonForTeacher.subject,
        teacherId: chosenTeacherId,
        teacherName: teacherName,
        applyToAll: applyToAllSameSubject
      });
    } else {
      updateSchedule(selectedLessonForTeacher.id, {
        teacherId: chosenTeacherId,
        teacherName: teacherName
      });
    }

    setAssignTeacherModalOpen(false);
  };

  // 2. Butun sinf bo'yicha barcha fan o'qituvchilarini belgilash modali
  const [classTeachersModalOpen, setClassTeachersModalOpen] = useState(false);
  const [selectedClassForTeachersId, setSelectedClassForTeachersId] = useState('');
  const [classTeachersMap, setClassTeachersMap] = useState({});
  const [classHeadTeacherId, setClassHeadTeacherId] = useState('');

  const openClassTeachersModal = (classId) => {
    const targetClassId = classId || selectedClassForSchedule;
    setSelectedClassForTeachersId(targetClassId);
    const cObj = classes.find(c => c.id === targetClassId);
    setClassHeadTeacherId(cObj?.teacherId || '');

    // Shu sinf darslaridagi barcha fanlarni topish
    const classLessons = schedules.filter(s => s.classId === targetClassId);
    const map = {};
    classLessons.forEach(l => {
      if (l.subject && map[l.subject] === undefined) {
        map[l.subject] = l.teacherId || '';
      }
    });
    setClassTeachersMap(map);
    setClassTeachersModalOpen(true);
  };

  const handleClassTeacherMapChange = (subject, teacherId) => {
    setClassTeachersMap(prev => ({
      ...prev,
      [subject]: teacherId
    }));
  };

  const handleAutoAssignRecommended = () => {
    const updatedMap = { ...classTeachersMap };
    Object.keys(updatedMap).forEach(subj => {
      const cleanSubj = subj.toLowerCase().trim();
      const matched = teachers.find(t => {
        const tSubj = (t.subject || '').toLowerCase().trim();
        return tSubj.includes(cleanSubj) || cleanSubj.includes(tSubj);
      });
      if (matched) {
        updatedMap[subj] = matched.id;
      }
    });
    setClassTeachersMap(updatedMap);
  };

  const handleSaveClassTeachers = (e) => {
    e.preventDefault();
    const targetClassId = selectedClassForTeachersId;
    if (!targetClassId) return;

    // 1. Sinf rahbarini yangilash
    if (classHeadTeacherId !== undefined) {
      updateClass(targetClassId, { teacherId: classHeadTeacherId || null });
    }

    // 2. Har bir fan bo'yicha barcha darslarga biriktirish
    Object.entries(classTeachersMap).forEach(([subject, teacherId]) => {
      const teach = teachers.find(t => t.id === teacherId);
      if (batchAssignTeacherToSchedule) {
        batchAssignTeacherToSchedule({
          classId: targetClassId,
          subject,
          teacherId: teacherId || null,
          teacherName: teach ? teach.name : '',
          applyToAll: true
        });
      }
    });

    const cObj = classes.find(c => c.id === targetClassId);
    if (showToast) {
      showToast('Saqlandi', `${cObj?.name || 'Sinf'} barcha fan o'qituvchilari belgilandi!`, 'success');
    }
    setClassTeachersModalOpen(false);
  };

  const [activeSubTab, setActiveSubTab] = useState('schedules'); // 'schedules' | 'teachers' | 'leadership' | 'classes' | 'face_id'
  const [scheduleViewMode, setScheduleViewMode] = useState('grid');
  const [selectedClassForSchedule, setSelectedClassForSchedule] = useState('c-10a');
  const [selectedDayFilter, setSelectedDayFilter] = useState('all');

  // Face-ID qurilmadagi foydalanuvchilar modali
  const [deviceUsers, setDeviceUsers] = useState([]);
  const [loadingDeviceUsers, setLoadingDeviceUsers] = useState(false);
  const [showDeviceUsersModal, setShowDeviceUsersModal] = useState(false);
  const [deviceUserSearch, setDeviceUserSearch] = useState('');

  // Teacher modal
  const [teacherModal, setTeacherModal] = useState(false);
  const [editTeacherId, setEditTeacherId] = useState(null);
  const [tName, setTName] = useState('');
  const [tSubject, setTSubject] = useState('');
  const [tPhone, setTPhone] = useState('');
  const [tClassId, setTClassId] = useState('');

  // Schedule modal
  const [schModal, setSchModal] = useState(false);
  const [editSchId, setEditSchId] = useState(null);
  const [schDay, setSchDay] = useState('Dushanba');
  const [schOrder, setSchOrder] = useState(1);
  const [schClassId, setSchClassId] = useState('c-10a');
  const [schTeacherId, setSchTeacherId] = useState(teachers[0]?.id || '');
  const [schSubject, setSchSubject] = useState(teachers[0]?.subject || 'Matematika');
  const [schTime, setSchTime] = useState('08:30 - 09:15');

  // Class modal
  const [classModal, setClassModal] = useState(false);
  const [editClassId, setEditClassId] = useState(null);
  const [classNameInput, setClassNameInput] = useState('');
  const [classRoomInput, setClassRoomInput] = useState('');
  const [classTeacherIdInput, setClassTeacherIdInput] = useState('');
  const [classGradeInput, setClassGradeInput] = useState(1);

  // ====== O'qituvchi boshqaruvi ======
  const openAddTeacher = () => {
    setEditTeacherId(null);
    setTName('');
    setTSubject('');
    setTPhone('');
    setTClassId('');
    setTeacherModal(true);
  };

  const openEditTeacher = (t) => {
    setEditTeacherId(t.id);
    setTName(t.name);
    setTSubject(t.subject);
    setTPhone(formatPhoneNumber(t.phone || ''));
    setTClassId(t.classId || '');
    setTeacherModal(true);
  };

  const handleTeacherSubmit = (e) => {
    e.preventDefault();
    if (!tName.trim()) return;

    const data = {
      name: tName,
      subject: tSubject,
      phone: formatPhoneNumber(tPhone),
      classId: tClassId || null,
      role: tClassId ? 'Sinf rahbari' : "Fan o'qituvchisi"
    };

    if (editTeacherId) {
      updateTeacher(editTeacherId, data);
    } else {
      addTeacher(data);
    }
    setTeacherModal(false);
  };

  const handleDeleteTeacher = (id, name) => {
    if (window.confirm(`${name} o'chirilsinmi?`)) {
      deleteTeacher(id);
    }
  };

  // ====== Dars jadvali boshqaruvi ======
  const openAddSchedule = () => {
    setEditSchId(null);
    setSchDay('Dushanba');
    setSchOrder(1);
    setSchClassId(selectedClassForSchedule);
    setSchTeacherId(teachers[0]?.id || '');
    setSchSubject(teachers[0]?.subject || 'Matematika');
    setSchTime('08:30 - 09:15');
    setSchModal(true);
  };

  const openEditSchedule = (s) => {
    setEditSchId(s.id);
    setSchDay(s.day || 'Dushanba');
    setSchOrder(s.lessonOrder);
    setSchClassId(s.classId);
    setSchTeacherId(s.teacherId);
    setSchSubject(s.subject);
    setSchTime(s.time);
    setSchModal(true);
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!schSubject.trim()) return;

    const teach = teachers.find(t => t.id === schTeacherId);

    const data = {
      day: schDay,
      lessonOrder: Number(schOrder),
      classId: schClassId,
      teacherId: schTeacherId,
      subject: schSubject,
      teacherName: teach ? teach.name : '',
      time: schTime
    };

    if (editSchId) {
      updateSchedule(editSchId, data);
    } else {
      addSchedule(data);
    }
    setSchModal(false);
  };

  const handleDeleteSchedule = (id) => {
    if (window.confirm('Bu dars jadvali olib tashlansinmi?')) {
      deleteSchedule(id);
    }
  };

  // ====== Sinf boshqaruvi ======
  const openAddClass = () => {
    setEditClassId(null);
    setClassNameInput('');
    setClassRoomInput('');
    setClassTeacherIdInput('');
    setClassGradeInput(1);
    setClassModal(true);
  };

  const openEditClass = (c) => {
    setEditClassId(c.id);
    setClassNameInput(c.name || '');
    setClassRoomInput(c.room || '');
    const currentTeacher = teachers.find(t => t.id === c.teacherId || t.classId === c.id);
    setClassTeacherIdInput(currentTeacher?.id || c.teacherId || '');
    setClassGradeInput(c.grade || parseInt(c.name, 10) || 1);
    setClassModal(true);
  };

  const handleClassSubmit = (e) => {
    e.preventDefault();
    if (!classNameInput.trim()) return;

    const data = {
      name: classNameInput.trim(),
      room: classRoomInput.trim() || '101-xona',
      grade: Number(classGradeInput) || parseInt(classNameInput, 10) || 1,
      teacherId: classTeacherIdInput || null
    };

    if (editClassId) {
      updateClass(editClassId, data);
    } else {
      addClass(data);
    }
    setClassModal(false);
  };

  const handleDeleteClass = (id, name) => {
    if (window.confirm(`${name} sinfi o'chirilsinmi?`)) {
      deleteClass(id);
    }
  };

  const handleOpenDeviceUsers = async () => {
    setShowDeviceUsersModal(true);
    setLoadingDeviceUsers(true);
    const users = await fetchDeviceUsers();
    setDeviceUsers(users);
    setLoadingDeviceUsers(false);
  };

  const classSchedules = schedules.filter(s => s.classId === selectedClassForSchedule);
  const selectedClassObj = classes.find(c => c.id === selectedClassForSchedule);
  const lessonOrders = [1, 2, 3, 4, 5, 6];

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 space-y-3 transition-colors">
      
      {/* 5 ta Ichki Tab: Dars Jadvali, O'qituvchilar, Rahbariyat, Sinflar, Face-ID */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab('schedules')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'schedules' ? 'bg-blue-700 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Dars Jadvali ({schedules.length})
          </button>

          <button
            onClick={() => setActiveSubTab('teachers')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'teachers' ? 'bg-blue-700 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            O'qituvchilar ({teachers.length})
          </button>

          <button
            onClick={() => setActiveSubTab('leadership')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'leadership' ? 'bg-blue-700 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Rahbariyat ({leadership.length})
          </button>

          <button
            onClick={() => setActiveSubTab('classes')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'classes' ? 'bg-blue-700 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Sinflar ({classes.length})
          </button>

          <button
            onClick={() => setActiveSubTab('face_id')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'face_id' ? 'bg-blue-700 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${faceDevice?.online ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span>Face-ID Terminal ({faceDevice?.ip || '192.168.1.35'})</span>
          </button>
        </div>

        {/* Qo'shish tugmalari */}
        <div className="flex items-center gap-1.5">
          {activeSubTab === 'schedules' && (
            <>
              <button
                onClick={() => openClassTeachersModal(selectedClassForSchedule)}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs transition-colors"
                title="Ushbu sinfning barcha fan o'qituvchilarini belgilash"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Fan O'qituvchilarini Belgilash</span>
              </button>
              <button
                onClick={openAddSchedule}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Dars Qo'shish</span>
              </button>
            </>
          )}

          {activeSubTab === 'teachers' && (
            <button
              onClick={openAddTeacher}
              className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              O'qituvchi Qo'shish
            </button>
          )}

          {activeSubTab === 'leadership' && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => openAddStaff('leadership')}
                className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Rahbariyat Qo'shish
              </button>
              <button
                onClick={() => openAddStaff('administrator')}
                className="px-2.5 py-1 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Admin Qo'shish
              </button>
            </div>
          )}

          {activeSubTab === 'classes' && (
            <button
              onClick={openAddClass}
              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Sinf Ochish
            </button>
          )}
        </div>
      </div>

      {/* 1. DARS JADVALI */}
      {activeSubTab === 'schedules' && (
        <div className="space-y-3">
          
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Sinf jadvali:</span>
              <select
                value={selectedClassForSchedule}
                onChange={(e) => setSelectedClassForSchedule(e.target.value)}
                className="text-xs font-bold p-1 px-2 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 outline-none text-blue-700 dark:text-blue-400 transition-colors"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} sinfi</option>
                ))}
              </select>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                ({classSchedules.length} ta dars kiritilgan)
              </span>

              <button
                onClick={() => openClassTeachersModal(selectedClassForSchedule)}
                className="px-2 py-0.5 text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-md flex items-center gap-1 transition-colors"
                title="Ushbu sinf darslariga fan o'qituvchilarini biriktirish"
              >
                <Users className="w-3 h-3" />
                <span>Fan o'qituvchilarini belgilash</span>
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setScheduleViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  scheduleViewMode === 'grid' ? 'bg-blue-700 text-white shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title="Haftalik Panjara"
              >
                <Grid className="w-3.5 h-3.5" />
                Haftalik Jadval
              </button>
              <button
                onClick={() => setScheduleViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  scheduleViewMode === 'list' ? 'bg-blue-700 text-white shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title="Ro'yxat ko'rinishi"
              >
                <List className="w-3.5 h-3.5" />
                Ro'yxat
              </button>
            </div>
          </div>

          {/* HAFTALIK PANJARA */}
          {scheduleViewMode === 'grid' && (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 shadow-2xs">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                    <th className="p-2 border-r border-slate-200 dark:border-slate-700 text-center w-10">#</th>
                    {DAYS_OF_WEEK.map(d => (
                      <th key={d} className="p-2 border-r border-slate-200 dark:border-slate-700 text-center font-bold">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {lessonOrders.map(order => (
                    <tr key={order} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center font-black text-slate-400 dark:text-slate-500 bg-slate-50/80 dark:bg-slate-800/60">
                        {order}
                      </td>

                      {DAYS_OF_WEEK.map(day => {
                        const lesson = classSchedules.find(s => s.day === day && s.lessonOrder === order);
                        const teacher = teachers.find(t => t.id === lesson?.teacherId);

                        return (
                          <td 
                            key={day} 
                            className="p-1.5 border-r border-slate-200 dark:border-slate-700 align-top h-20 w-[15%] relative group"
                          >
                            {lesson ? (
                              <div 
                                onClick={() => handleOpenAssignTeacher(lesson)}
                                className="p-2 bg-blue-50/80 dark:bg-slate-800/90 hover:bg-blue-100/90 dark:hover:bg-slate-750 rounded-lg border border-blue-200 dark:border-slate-700 text-[11px] h-full flex flex-col justify-between transition-all cursor-pointer shadow-2xs hover:shadow-xs hover:border-blue-400 dark:hover:border-blue-500"
                                title="O'qituvchini belgilash yoki tahrirlash uchun bosing"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-bold text-blue-900 dark:text-blue-300 leading-tight truncate">
                                      {lesson.subject}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditSchedule(lesson);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-opacity"
                                      title="Dars vaqtini to'liq tahrirlash"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  
                                  {/* O'qituvchi nomi badge */}
                                  <div className="mt-1">
                                    {lesson.teacherName || teacher?.name ? (
                                      <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 truncate flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/50">
                                        <span className="shrink-0">👨‍🏫</span>
                                        <span className="truncate">{lesson.teacherName || teacher?.name}</span>
                                      </div>
                                    ) : (
                                      <div className="text-[10px] font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200/60 dark:border-amber-800/50">
                                        <span>⚠️</span>
                                        <span className="truncate">O'qituvchi tanlash</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="text-[9px] text-slate-400 dark:text-slate-500 flex items-center justify-between mt-1">
                                  <span>{lesson.time}</span>
                                  <span className="text-[9px] text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
                                    Belgilash ✎
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div 
                                onClick={() => {
                                  setEditSchId(null);
                                  setSchDay(day);
                                  setSchOrder(order);
                                  setSchClassId(selectedClassForSchedule);
                                  setSchTeacherId(teachers[0]?.id || '');
                                  setSchSubject(teachers[0]?.subject ? teachers[0].subject.split('/')[0].trim() : 'Matematika');
                                  setSchTime(
                                    order === 1 ? '08:30 - 09:15' :
                                    order === 2 ? '09:20 - 10:05' :
                                    order === 3 ? '10:15 - 11:00' :
                                    order === 4 ? '11:10 - 11:55' :
                                    order === 5 ? '12:05 - 12:50' :
                                    '13:00 - 13:45'
                                  );
                                  setSchModal(true);
                                }}
                                className="h-full flex flex-col items-center justify-center text-[10px] text-slate-300 dark:text-slate-600 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg hover:border-blue-400 hover:text-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer p-1"
                                title="Ushbu soatga dars qo'shish"
                              >
                                <Plus className="w-3 h-3 opacity-60" />
                                <span className="text-[9px]">+</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* RO'YXAT KO'RINIShI */}
          {scheduleViewMode === 'list' && (
            <div className="space-y-1.5">
              {classSchedules.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                  {selectedClassObj?.name} sinfiga hali dars jadvali kiritilmagan.
                </div>
              ) : (
                classSchedules.map(s => {
                  const teacher = teachers.find(t => t.id === s.teacherId);

                  return (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 rounded">
                            {s.day}
                          </span>
                          <span className="text-xs font-bold px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded">
                            {s.lessonOrder}-soat
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{s.subject}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          <span>{s.time}</span>
                          <span>• {s.teacherName || teacher?.name || 'Biriktirilmagan'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => handleOpenAssignTeacher(s)}
                          className="px-2 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-1 transition-colors"
                          title="Fan o'qituvchisini belgilash"
                        >
                          <Users className="w-3 h-3" />
                          <span>O'qituvchi belgilash</span>
                        </button>
                        <button
                          onClick={() => openEditSchedule(s)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(s.id)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>
      )}

      {/* 2. O'QITUVCHILAR RO'YXATI */}
      {activeSubTab === 'teachers' && (
        <div className="space-y-1.5">
          {teachers.map(t => {
            const cl = classes.find(c => c.id === t.classId);
            const photoSrc = t.faceURL && !t.faceURL.includes('192.168.')
              ? t.faceURL
              : (t.faceId ? `${effectiveBaseUrl}/api/device/photo/${t.faceId}` : null);

            return (
              <div
                key={t.id}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <StudentAvatar student={t} effectiveBaseUrl={effectiveBaseUrl} size="w-9 h-9" rounded="rounded-full" />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{t.name}</span>
                      {cl && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded">
                          {cl.name} rahbari
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-3">
                      <span>Fani: <b className="text-slate-700 dark:text-slate-300">{t.subject}</b></span>
                      {t.phone && <span>• Tel: {formatPhoneNumber(t.phone)}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditTeacher(t)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
                    title="Tahrirlash"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTeacher(t.id, t.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. RAHBARIYAT VA ADMINISTRATORLAR */}
      {activeSubTab === 'leadership' && (
        <div className="space-y-4">
          
          {/* Rahbariyat Bloki */}
          <div className="bg-slate-50/70 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>Rahbariyat ({leadership.filter(m => m.category === 'leadership' || !m.category).length})</span>
              </h3>
              <button
                onClick={() => openAddStaff('leadership')}
                className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Rahbariyat a'zosi qo'shish
              </button>
            </div>

            <div className="space-y-2">
              {leadership.filter(m => m.category === 'leadership' || !m.category).map((person) => {
                const permsCount = Array.isArray(person.permissions) ? person.permissions.length : 0;
                return (
                  <div
                    key={person.id}
                    className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-blue-300 dark:hover:border-blue-500 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        person.isDirector ? 'bg-blue-700 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}>
                        {person.name ? person.name.charAt(0) : 'R'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{person.name}</span>
                          {person.isDirector && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 rounded">
                              Direktor
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 truncate">
                          {person.role}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                          {person.phone && (
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-2.5 h-2.5" />
                              {formatPhoneNumber(person.phone)}
                            </span>
                          )}
                          {person.login && (
                            <span className="font-mono">
                              Login: <b className="text-slate-700 dark:text-slate-300">{person.login}</b>
                            </span>
                          )}
                          <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            {person.isDirector ? 'Barcha ruxsatlar' : `${permsCount} ta ruxsat`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => openEditStaff(person)}
                        className="px-2 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-700/80 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg flex items-center gap-1 transition-colors border border-slate-200 dark:border-slate-600"
                        title="Tahrirlash va Ruxsatlar"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Tahrirlash / Ruxsatlar</span>
                      </button>
                      {!person.isDirector && (
                        <button
                          onClick={() => {
                            if (window.confirm(`${person.name} xodimlar safidan o'chirilsinmi?`)) {
                              deleteStaffMember(person.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors border border-slate-200 dark:border-slate-600"
                          title="O'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Administratorlar Bloki */}
          <div className="bg-slate-50/70 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
                <span>Administratorlar ({leadership.filter(m => m.category === 'administrator').length})</span>
              </h3>
              <button
                onClick={() => openAddStaff('administrator')}
                className="px-2.5 py-1 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Administrator qo'shish
              </button>
            </div>

            <div className="space-y-2">
              {leadership.filter(m => m.category === 'administrator').map((person) => {
                const permsCount = Array.isArray(person.permissions) ? person.permissions.length : 0;
                return (
                  <div
                    key={person.id}
                    className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                        {person.name ? person.name.charAt(0) : 'A'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{person.name}</div>
                        <div className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 truncate">{person.role}</div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                          {person.phone && (
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-2.5 h-2.5" />
                              {formatPhoneNumber(person.phone)}
                            </span>
                          )}
                          {person.login && (
                            <span className="font-mono">
                              Login: <b className="text-slate-700 dark:text-slate-300">{person.login}</b>
                            </span>
                          )}
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            {permsCount} ta ruxsat
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => openEditStaff(person)}
                        className="px-2 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-700/80 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-lg flex items-center gap-1 transition-colors border border-slate-200 dark:border-slate-600"
                        title="Tahrirlash va Ruxsatlar"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Tahrirlash / Ruxsatlar</span>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`${person.name} administratorlar safidan o'chirilsinmi?`)) {
                            deleteStaffMember(person.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors border border-slate-200 dark:border-slate-600"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* 4. SINFLAR RO'YXATI */}
      {activeSubTab === 'classes' && (
        <div className="space-y-1.5">
          {classes.map(c => {
            const teacher = teachers.find(t => t.id === c.teacherId || t.classId === c.id);

            return (
              <div
                key={c.id}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{c.name} sinfi</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">({c.room})</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium shrink-0">Sinf rahbari:</span>
                    <select
                      value={c.teacherId || teacher?.id || ''}
                      onChange={(e) => updateClass(c.id, { teacherId: e.target.value || null })}
                      className="text-xs py-0.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium outline-none focus:ring-1 focus:ring-blue-500 max-w-[220px] truncate"
                    >
                      <option value="">— Biriktirilmagan —</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} {t.subject ? `(${t.subject})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => openClassTeachersModal(c.id)}
                    className="px-2 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-1 transition-colors"
                    title="Fan o'qituvchilarini belgilash"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Fan o'qituvchilari</span>
                  </button>

                  <button
                    onClick={() => openEditClass(c)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
                    title="Sinfni tahrirlash"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteClass(c.id, c.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                    title="Sinfni o'chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. FACE-ID TERMINAL SUB-TAB */}
      {activeSubTab === 'face_id' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Hikvision Face-ID Terminali ({faceDevice?.model || 'DS-K1T343MFWX'})
                    </h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      faceDevice?.online 
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/50' 
                        : 'bg-amber-100 text-amber-700 border border-amber-300'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${faceDevice?.online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                      {faceDevice?.online ? 'ONLAYN VA FAOL' : 'ULANMOQDA...'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    IP: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{faceDevice?.ip || '192.168.1.35'}</span> • Port: 80 • Protokol: ISAPI Digest
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenDeviceUsers}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Qurilmadagi Foydalanuvchilar ({faceDevice?.totalUsers || 737})</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Jami Ro'yxatdan O'tgan</div>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {faceDevice?.totalUsers || 737} nafar
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Oxirgi Sinxronlash</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                  {new Date(faceDevice?.lastSync || Date.now()).toLocaleTimeString()}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Jonli Hodisalar (Bugun)</div>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {recentFaceScans.length} ta
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Ulanish Turi</div>
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1">
                  Server HTTP Bridge
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Face-ID Device Users */}
      {showDeviceUsersModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-xl w-full max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Face-ID Qurilmasidagi Barcha Shaxslar ({deviceUsers.length})
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Hikvision terminalining ichki xotirasida saqlangan foydalanuvchilar
                </p>
              </div>
              <button
                onClick={() => setShowDeviceUsersModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-slate-100 dark:border-slate-800">
              <input
                type="text"
                placeholder="Ism yoki ID bo'yicha qidirish..."
                value={deviceUserSearch}
                onChange={(e) => setDeviceUserSearch(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {loadingDeviceUsers ? (
                <div className="py-10 text-center text-xs text-slate-500">
                  Yuklanmoqda...
                </div>
              ) : (
                deviceUsers
                  .filter(u => !deviceUserSearch || (u.name && u.name.toLowerCase().includes(deviceUserSearch.toLowerCase())) || (u.employeeNo && u.employeeNo.includes(deviceUserSearch)))
                  .map(u => (
                    <div
                      key={u.employeeNo}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {u.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          ID: {u.employeeNo} • {u.gender === 'female' ? 'Ayol' : 'Erkak'}
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 shrink-0">
                        {u.numOfFace ? `✓ ${u.numOfFace} ta Yuz` : 'Yuz yo\'q'}
                      </span>
                    </div>
                  ))
              )}
            </div>

            <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowDeviceUsersModal(false)}
                className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Dars Qo'shish / Tahrirlash */}
      {schModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full p-4 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {editSchId ? "Darsni Tahrirlash" : "Yangi Dars Qo'shish"}
              </span>
              <button onClick={() => setSchModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">Hafta kuni:</label>
                <select
                  value={schDay}
                  onChange={(e) => setSchDay(e.target.value)}
                  className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none font-medium"
                >
                  {DAYS_OF_WEEK.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">Sinf:</label>
                  <select
                    value={schClassId}
                    onChange={(e) => setSchClassId(e.target.value)}
                    className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">Soat:</label>
                  <select
                    value={schOrder}
                    onChange={(e) => setSchOrder(e.target.value)}
                    className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num}-soat</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">Fan o'qituvchisi:</label>
                <select
                  value={schTeacherId}
                  onChange={(e) => {
                    setSchTeacherId(e.target.value);
                    const t = teachers.find(teach => teach.id === e.target.value);
                    if (t) setSchSubject(t.subject.split('/')[0].trim());
                  }}
                  className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="">— Biriktirilmagan —</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">Fan nomi:</label>
                <input
                  type="text"
                  required
                  value={schSubject}
                  onChange={(e) => setSchSubject(e.target.value)}
                  placeholder="Masalan: Algebra"
                  className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">Vaqt:</label>
                <input
                  type="text"
                  value={schTime}
                  onChange={(e) => setSchTime(e.target.value)}
                  placeholder="08:30 - 09:15"
                  className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-1.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSchModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded flex items-center gap-1 shadow-sm transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: O'qituvchi Qo'shish / Tahrirlash */}
      {teacherModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full p-4 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {editTeacherId ? "O'qituvchini Tahrirlash" : "Yangi O'qituvchi Qo'shish"}
              </span>
              <button onClick={() => setTeacherModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTeacherSubmit} className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">F.I.Sh:</label>
                <input
                  type="text"
                  required
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                  placeholder="Masalan: Rustamov Alisher"
                  className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">Fani:</label>
                <input
                  type="text"
                  required
                  value={tSubject}
                  onChange={(e) => setTSubject(e.target.value)}
                  placeholder="Masalan: Fizika"
                  className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">Telefon:</label>
                <input
                  type="text"
                  required
                  value={tPhone}
                  onChange={(e) => handlePhoneInputChange(e.target.value, setTPhone)}
                  placeholder="+998-90-123-45-67"
                  maxLength={17}
                  className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">Sinf rahbari (ixtiyoriy):</label>
                <select
                  value={tClassId}
                  onChange={(e) => setTClassId(e.target.value)}
                  className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="">Faqat fan o'qituvchisi (Sinf yo'q)</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} sinf rahbari</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-1.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTeacherModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded flex items-center gap-1 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Sinf Ochish / Tahrirlash */}
      {classModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full p-4 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {editClassId ? "Sinfni Tahrirlash" : "Yangi Sinf Ochish"}
              </span>
              <button onClick={() => setClassModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleClassSubmit} className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">Sinf nomi:</label>
                <input
                  type="text"
                  required
                  value={classNameInput}
                  onChange={(e) => setClassNameInput(e.target.value)}
                  placeholder="Masalan: 10-A"
                  className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">Xona raqami:</label>
                <input
                  type="text"
                  value={classRoomInput}
                  onChange={(e) => setClassRoomInput(e.target.value)}
                  placeholder="Masalan: 404-xona"
                  className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">Bosqich (Sinf raqami):</label>
                <select
                  value={classGradeInput}
                  onChange={(e) => setClassGradeInput(Number(e.target.value))}
                  className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(g => (
                    <option key={g} value={g}>{g}-sinf</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">Sinf rahbari (O'qituvchi):</label>
                <select
                  value={classTeacherIdInput}
                  onChange={(e) => setClassTeacherIdInput(e.target.value)}
                  className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                >
                  <option value="">— Biriktirilmagan —</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.subject ? `(${t.subject})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-1.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setClassModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded flex items-center gap-1 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  {editClassId ? 'Saqlash' : 'Ochish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Darsga Fan O'qituvchisini Belgilash */}
      {assignTeacherModalOpen && selectedLessonForTeacher && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-4 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3.5 transition-colors">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Fan O'qituvchisini Belgilash
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {selectedClassObj?.name} sinfi • {selectedLessonForTeacher.subject}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setAssignTeacherModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignTeacher} className="space-y-3">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-750 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Dars vaqti:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedLessonForTeacher.day}, {selectedLessonForTeacher.lessonOrder}-soat ({selectedLessonForTeacher.time})</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Fani:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{selectedLessonForTeacher.subject}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Fan O'qituvchisini tanlang:
                </label>
                <select
                  value={chosenTeacherId}
                  onChange={(e) => {
                    setChosenTeacherId(e.target.value);
                    const t = teachers.find(teach => teach.id === e.target.value);
                    if (t) setChosenTeacherName(t.name);
                  }}
                  className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">— Biriktirilmagan —</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject}) {t.phone ? `• ${t.phone}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Yoki o'qituvchi ismini kiriting:
                </label>
                <input
                  type="text"
                  value={chosenTeacherName}
                  onChange={(e) => setChosenTeacherName(e.target.value)}
                  placeholder="Masalan: Xo'jayev Farrux"
                  className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 flex items-start gap-2">
                <input
                  type="checkbox"
                  id="bulkSyncSubject"
                  checked={applyToAllSameSubject}
                  onChange={(e) => setApplyToAllSameSubject(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="bulkSyncSubject" className="text-[11px] font-medium text-emerald-900 dark:text-emerald-200 cursor-pointer">
                  Shu sinfdagi <b>barcha "{selectedLessonForTeacher.subject}"</b> darslariga ushbu o'qituvchini biriktirish
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-1.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAssignTeacherModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Biriktirish va Saqlash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Butun Sinf Bo'yicha Barcha Fan O'qituvchilarini Belgilash */}
      {classTeachersModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
            
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {classes.find(c => c.id === selectedClassForTeachersId)?.name} sinfi — Fan O'qituvchilarini Belgilash
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ushbu sinfga biriktirilgan fanlar va ularning o'qituvchilari
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setClassTeachersModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-[250px]">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Sinf Rahbari:</span>
                <select
                  value={classHeadTeacherId}
                  onChange={(e) => setClassHeadTeacherId(e.target.value)}
                  className="text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-semibold flex-1"
                >
                  <option value="">— Sinf rahbari belgilanmagan —</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleAutoAssignRecommended}
                className="px-2.5 py-1 text-xs font-bold bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-1 transition-colors"
                title="Fan nomi bo'yicha mos o'qituvchilarni avtomatik tanlash"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Mos o'qituvchilarni tavsiya qilish</span>
              </button>
            </div>

            <form onSubmit={handleSaveClassTeachers} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {Object.keys(classTeachersMap).length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Ushbu sinf dars jadvalida hali fanlar kiritilmagan.
                  </div>
                ) : (
                  Object.keys(classTeachersMap).map((subject) => {
                    const currentTeacherId = classTeachersMap[subject] || '';
                    const assignedTeacher = teachers.find(t => t.id === currentTeacherId);
                    const lessonCount = schedules.filter(s => s.classId === selectedClassForTeachersId && s.subject?.toLowerCase().trim() === subject.toLowerCase().trim()).length;

                    return (
                      <div
                        key={subject}
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors shadow-2xs"
                      >
                        <div className="min-w-[160px]">
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {subject}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Haftada {lessonCount || 0} soat dars
                          </div>
                        </div>

                        <div className="flex-1 max-w-sm">
                          <select
                            value={currentTeacherId}
                            onChange={(e) => handleClassTeacherMapChange(subject, e.target.value)}
                            className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="">— O'qituvchi biriktirilmagan —</option>
                            {teachers.map(t => (
                              <option key={t.id} value={t.id}>
                                {t.name} ({t.subject})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-32 shrink-0 text-right">
                          {assignedTeacher ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              ✓ Biriktirilgan
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              ⚠️ Tanlanmagan
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-850">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Barcha darslar belgilangan o'qituvchilarga yangilanadi
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setClassTeachersModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Barchasini Saqlash</span>
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL 7: Rahbariyat va Administrator Qo'shish / Tahrirlash va Ruxsatlar */}
      {staffModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-xl w-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
            
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {editingStaffId ? "Xodimni Tahrirlash va Ruxsatlar" : (staffForm.category === 'leadership' ? "Yangi Rahbariyat A'zosi Qo'shish" : "Yangi Administrator Qo'shish")}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Direktor tomonidan xodimning ko'rish huquqlari va ruxsatlari belgilanadi
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setStaffModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">F.I.Sh:</label>
                    <input
                      type="text"
                      required
                      value={staffForm.name}
                      onChange={(e) => setStaffForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Masalan: Davlatova Muyassar"
                      className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">Lavozimi (Roli):</label>
                    <input
                      type="text"
                      required
                      value={staffForm.role}
                      onChange={(e) => setStaffForm(p => ({ ...p, role: e.target.value }))}
                      placeholder="Masalan: Direktor o'rinbosari"
                      className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">Kategoriya:</label>
                    <select
                      value={staffForm.category}
                      onChange={(e) => setStaffForm(p => ({ ...p, category: e.target.value }))}
                      className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="leadership">Rahbariyat</option>
                      <option value="administrator">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">Telefon raqami:</label>
                    <input
                      type="text"
                      value={staffForm.phone}
                      onChange={(e) => handlePhoneInputChange(e.target.value, (val) => setStaffForm(p => ({ ...p, phone: val })))}
                      placeholder="+998-XX-XXX-XX-XX"
                      maxLength={17}
                      className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">Login:</label>
                    <input
                      type="text"
                      value={staffForm.login}
                      onChange={(e) => setStaffForm(p => ({ ...p, login: e.target.value }))}
                      placeholder="login"
                      className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Ruxsat etilgan modullar & bo'limlar:</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Xodim faqat belgilangan modullarni ko'ra oladi
                      </p>
                    </div>

                    {!staffForm.isDirector && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={selectAllStaffPermissions}
                          className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Barchasini belgilash
                        </button>
                        <span className="text-slate-300 dark:text-slate-700">|</span>
                        <button
                          type="button"
                          onClick={clearAllStaffPermissions}
                          className="text-[10px] font-bold text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
                        >
                          Tozalash
                        </button>
                      </div>
                    )}
                  </div>

                  {staffForm.isDirector ? (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-200 font-semibold">
                      ⭐️ Direktor barcha bo'limlarga to'liq kirish huquqiga ega.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(AVAILABLE_PERMISSIONS || []).map((perm) => {
                        const isGranted = (staffForm.permissions || []).includes(perm.key);
                        return (
                          <div
                            key={perm.key}
                            onClick={() => toggleStaffPermission(perm.key)}
                            className={`p-2.5 rounded-lg border flex items-start gap-2.5 cursor-pointer transition-all select-none ${
                              isGranted
                                ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isGranted}
                              onChange={() => {}}
                              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold leading-tight">{perm.label}</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                                {perm.desc}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setStaffModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Saqlash</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
