import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { 
  Building, 
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
  WifiOff
} from 'lucide-react';

export const Navbar = () => {
  const {
    currentUser,
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
    currentPath
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

  const unreadCount = visibleNotifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        
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

          {/* Headerdagi tez o'tish (Path bilan o'zgaruvchi navigatsiya) */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 gap-1">
            <button
              onClick={() => navigateTo('/director')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                (currentUser?.role === 'director' || currentPath === '/director' || currentPath === '/students' || currentPath === '/teachers')
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              Direktor
            </button>

            <button
              onClick={() => navigateTo('/duty')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                (currentUser?.role === 'inspector' || currentPath === '/duty')
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Navbatchi
            </button>

            <button
              onClick={() => navigateTo('/class-teacher')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                (currentUser?.role === 'class_teacher' || currentPath === '/class-teacher')
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Sinf Rahbari
            </button>

            <button
              onClick={() => navigateTo('/subject-teacher')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                (currentUser?.role === 'subject_teacher' || currentPath === '/subject-teacher')
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Fan O'qituvchisi
            </button>

            <button
              onClick={() => navigateTo('/monitor')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                (currentUser?.role === 'monitor' || currentPath === '/monitor')
                  ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              Monitor (Foye)
            </button>

            {/* Rahbariyat / Admin xodimini tanlash tanlagichi */}
            {leadership && leadership.length > 0 && (
              <select
                value={leadership.some(m => m.id === currentUser?.id) ? currentUser?.id : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    switchStaffMember(e.target.value);
                  }
                }}
                className="text-xs font-semibold p-1 px-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none hover:border-blue-400 transition-colors"
                title="Rahbariyat va Admin xodimlari profiliga o'tish (Ruxsatlarni tekshirish)"
              >
                <option value="">Xodimlar ({leadership.length})</option>
                {leadership.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name.split(' ')[0]} ({m.role ? m.role.split(',')[0].trim() : 'Xodim'})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* O'ng tomon: Mavzu, Bildirishnoma, Foydalanuvchi ismi va Chiqish */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Tarmoq holati nishoni (Lokal Wi-Fi vs Global Bulut) */}
            <div 
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                isLocalConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : isSchoolLocalOnline
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700'
              }`}
              title={
                isLocalConnected 
                  ? "Maktab lokal serveriga to'g'ridan-to'g'ri ulangan (Ko'prik profili faol)" 
                  : isSchoolLocalOnline 
                    ? `Global Bulut rejimida (Maktabdagi ${localBridgeInfo?.bridged_by || 'profil'} orqali jonli bog'langan)` 
                    : "Global Bulut rejimida (Maktab lokal tarmog'iga ulanish kutilmoqda)"
              }
            >
              {isLocalConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Wi-Fi Lokal</span>
                </>
              ) : isSchoolLocalOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <Cloud className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Global Live</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Global Bulut</span>
                  <span className="text-[10px] bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-1 rounded font-semibold ml-0.5">
                    Lokal kutilmoqda
                  </span>
                </>
              )}
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
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              title="Chiqish"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>
        </div>

        {/* Mobil uchun tezkor rolni tanlash (Kichik ekranlarda) */}
        <div className="flex md:hidden overflow-x-auto py-1.5 gap-1 no-scrollbar border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => navigateTo('/director')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition-colors ${
              (currentUser?.role === 'director' || currentPath === '/director' || currentPath === '/students' || currentPath === '/teachers') ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Direktor
          </button>
          <button
            onClick={() => navigateTo('/duty')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition-colors ${
              (currentUser?.role === 'inspector' || currentPath === '/duty') ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Navbatchi
          </button>
          <button
            onClick={() => navigateTo('/class-teacher')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition-colors ${
              (currentUser?.role === 'class_teacher' || currentPath === '/class-teacher') ? 'bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Sinf Rahbari
          </button>
          <button
            onClick={() => navigateTo('/subject-teacher')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition-colors ${
              (currentUser?.role === 'subject_teacher' || currentPath === '/subject-teacher') ? 'bg-amber-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Fan O'qituvchisi
          </button>
          <button
            onClick={() => navigateTo('/monitor')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition-colors ${
              (currentUser?.role === 'monitor' || currentPath === '/monitor') ? 'bg-purple-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Monitor (Foye)
          </button>
        </div>

      </div>
    </header>
  );
};
