import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { 
  Building,
  Home,
  Users,
  Settings, 
  ClipboardList, 
  GraduationCap, 
  BookOpen, 
  Bell, 
  LogOut, 
  User, 
  Check, 
  AlertCircle, 
  Clock,
  Tv,
  Sun,
  Moon,
  Wifi,
  Cloud,
  WifiOff,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export const Navbar = () => {
  const {
    currentUser,
    hasPermission,
    activeTab,
    logout,
    quickSwitchRole,
    switchStaffMember,
    leadership,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    classes,
    teachers,
    selectedTeacherId,
    theme,
    toggleTheme,
    isLocalConnected,
    isSchoolLocalOnline,
    localBridgeInfo,
    networkMode,
    navigateTo,
    currentPath,
    schools,
    selectedSchoolId,
    selectSchool,
    isBigAdmin
  } = useSchool();

  const [showNotifications, setShowNotifications] = useState(false);

  // Faqat Direktor va Sinf Rahbari bildirishnomalarni ko'ra oladi
  // Boshqalarga (Navbatchi, Monitor, Fan o'qituvchisi) bildirishnoma kerak emas!
  const isDirector = currentUser?.role === 'director';
  const isClassTeacher = currentUser?.role === 'class_teacher';
  const canViewNotifications = isDirector || isClassTeacher;

  // Sinf rahbarining sinfini aniqlash
  const myTeacherObj = (teachers || []).find(t => t.id === currentUser?.teacherId || t.id === selectedTeacherId);
  const myClassId = currentUser?.classId || myTeacherObj?.classId || 'c-10a';
  const myClassObj = (classes || []).find(c => c.id === myClassId);

  // Filtrlangan bildirishnomalar:
  // 1. Direktorga: Barcha sinflarniki kelib turadi
  // 2. Sinf rahbariga: Faqat o'zining sinfiga tegishli bildirishnomalar keladi
  // 3. Boshqalarga: Bildirishnomalar ko'rsatilmaydi
  const visibleNotifications = useMemo(() => {
    if (isDirector) {
      return notifications || [];
    }
    if (isClassTeacher) {
      return (notifications || []).filter(n => {
        return n.classId === myClassId || (myClassObj && n.title?.includes(myClassObj.name));
      });
    }
    return [];
  }, [notifications, isDirector, isClassTeacher, myClassId, myClassObj]);

  
  const isDirectorUser = Boolean(
    currentUser?.isDirector || 
    currentUser?.role === 'director' || 
    currentUser?.role === 'bigadmin' ||
    (currentUser?.category === 'leadership' && (hasPermission?.('teachers') || hasPermission?.('leadership'))) ||
    (currentUser?.category === 'administrator' && (hasPermission?.('teachers') || hasPermission?.('leadership')))
  );

  const canSeeStudents = isDirectorUser && (hasPermission?.('students') || isBigAdmin);
  const canSeeSettings = isDirectorUser && (hasPermission?.('teachers') || hasPermission?.('schedules') || hasPermission?.('classes') || hasPermission?.('leadership') || isBigAdmin);

  const unreadCount = visibleNotifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
      <div className={`w-full ${currentUser?.role === 'monitor' ? 'max-w-none px-4 sm:px-6' : 'max-w-7xl mx-auto px-2 sm:px-4 lg:px-6'}`}>
        
        {/* Asosiy qator: Logo, Rollar, Foydalanuvchi */}
        <div className="flex items-center justify-between h-14 gap-2">
          
          {/* Logo */}
          <div 
            onClick={() => navigateTo('/director')}
            className="flex items-center gap-2 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
            title="Bosh sahifa (Direktor)"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-sm">
              <Building className="w-4 h-4" />
            </div>
            <div className="hidden xs:block">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                SmartMaktab
              </span>
            </div>
          </div>

          

          {/* O'rta: Yagona 1 Qatorlik Navigatsiya Paneli */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {/* BigAdmin Paneli */}
            {isBigAdmin && (
              <button
                onClick={() => navigateTo('/bigadmin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  (activeTab === 'bigadmin' || currentPath === '/bigadmin')
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">BigAdmin</span>
              </button>
            )}

            {/* Asosiy rol / Foye tablosi */}
            {currentUser?.role === 'monitor' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-900/60 text-xs font-black shadow-xs shrink-0">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>Foye Tablosi (Monitor)</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (currentUser?.role === 'inspector') navigateTo('/duty');
                  else if (currentUser?.role === 'class_teacher') navigateTo('/class-teacher');
                  else if (currentUser?.role === 'subject_teacher') navigateTo('/subject-teacher');
                  else navigateTo('/director');
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  (activeTab === 'main' && (!isBigAdmin || currentPath === '/director'))
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>
                  {currentUser?.role === 'bigadmin' && 'Direktor Paneli'}
                  {currentUser?.role === 'director' && 'Direktor'}
                  {currentUser?.role === 'inspector' && 'Navbatchi'}
                  {currentUser?.role === 'class_teacher' && (myClassObj ? `${myClassObj.name} Rahbari` : 'Sinf Rahbari')}
                  {currentUser?.role === 'subject_teacher' && "Fan O'qituvchisi"}
                  {currentUser?.category === 'leadership' && currentUser?.role !== 'director' && (currentUser?.detail || currentUser?.role || 'Rahbariyat')}
                  {currentUser?.category === 'administrator' && (currentUser?.detail || 'Administrator')}
                </span>
              </button>
            )}

            {/* O'quvchilar CRUD */}
            {canSeeStudents && (
              <button
                onClick={() => navigateTo('/students')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'directory'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>O'quvchilar</span>
              </button>
            )}

            {/* O'qituvchilar va Fanlar CRUD */}
            {canSeeSettings && (
              <button
                onClick={() => navigateTo('/teachers')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'settings'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>O'qituvchilar & Darslar</span>
              </button>
            )}
          </div>

          {/* O'ng tomon: Mavzu, Bildirishnoma, Foydalanuvchi ismi va Chiqish */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Tarmoq holati nishoni (100% Global Jonli Rejim) */}
            <div 
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
              title="Kameralar va Turniketlar Global Onlayn Holatda"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Global Live</span>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded font-mono font-semibold ml-0.5">
                Onlayn
              </span>
            </div>

            {/* Dark / Light almashtirish tugmasi */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title={theme === 'dark' ? "Yorug' rejim (Light mode)" : "Tungi rejim (Dark mode)"}
              aria-label="Mavzuni almashtirish"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-spin-once" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Bildirishnoma tugmasi (Faqat Direktor va Sinf Rahbari uchun) */}
            {canViewNotifications && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative transition-colors"
                  title={isClassTeacher ? `${myClassObj?.name || '10-A'} sinf bildirishnomalari` : "Direktor: Barcha sinflar bildirishnomalari"}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                  )}
                </button>

                {/* Bildirishnomalar oynasi */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
                    <div className="p-3 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between text-xs border-b border-slate-800">
                      <div>
                        <span className="font-bold block">
                          {isClassTeacher ? `${myClassObj?.name || 'Sinf'} Bildirishnomalari` : 'Barcha Sinflar Bildirishnomalari'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {unreadCount > 0 ? `${unreadCount} ta yangi xabar` : 'Barchasi o\'qilgan'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllNotificationsRead && markAllNotificationsRead(isClassTeacher ? myClassId : null)}
                            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-blue-300 px-2 py-0.5 rounded transition-colors"
                            title="Barchasini o'qilgan deb belgilash"
                          >
                            O'qildi
                          </button>
                        )}
                        {visibleNotifications.length > 0 && (
                          <button
                            onClick={() => clearNotifications && clearNotifications(isClassTeacher ? myClassId : null)}
                            className="text-[10px] bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-rose-200 px-1.5 py-0.5 rounded transition-colors"
                            title="Tozalash"
                          >
                            Tozalash
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {visibleNotifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          <Bell className="w-6 h-6 mx-auto mb-2 text-slate-500 opacity-30" />
                          {isClassTeacher 
                            ? `${myClassObj?.name || 'Sinfingiz'} bo'yicha bildirishnoma yo'q` 
                            : "Yangi bildirishnoma yo'q"}
                        </div>
                      ) : (
                        visibleNotifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-start gap-2.5 ${
                              n.isRead ? 'opacity-65 bg-white dark:bg-slate-900' : 'bg-blue-50/50 dark:bg-blue-950/40'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {!n.isRead ? (
                                <span className="w-2 h-2 rounded-full bg-blue-600 block mt-1"></span>
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 block mt-1"></span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                                  {n.title}
                                </span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 font-mono">
                                  {n.time || ''}
                                </span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5 leading-snug">
                                {n.message}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profil ma'lumoti */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <User className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400 shrink-0" />
              <div className="text-left max-w-[90px] sm:max-w-[130px] truncate">
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {currentUser?.name}
                </span>
              </div>
            </div>

            {/* Chiqish (Logout) */}
            <button
              onClick={logout}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1"
              title="Tizimdan chiqish"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Chiqish</span>
            </button>

          </div>
        </div>

      </div>
    </header>
  );
};
