import React from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  Building,
  Home,
  Users,
  Settings,
  ClipboardList,
  GraduationCap,
  BookOpen,
  UserCheck,
  Calendar,
  ShieldCheck,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X
} from 'lucide-react';

export const Sidebar = ({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) => {
  const {
    currentUser,
    hasPermission,
    activeTab,
    logout,
    classes,
    teachers,
    selectedTeacherId,
    navigateTo,
    currentPath,
    currentSchool,
    isBigAdmin
  } = useSchool();

  if (!currentUser || currentUser?.role === 'monitor') return null;

  const myTeacherObj = (teachers || []).find(t => t.id === currentUser?.teacherId || t.id === selectedTeacherId);
  const myClassId = currentUser?.classId || myTeacherObj?.classId || (classes?.[0]?.id || '');
  const myClassObj = (classes || []).find(c => c.id === myClassId);

  const isDirectorUser = Boolean(
    !isBigAdmin && (
      currentUser?.isDirector ||
      currentUser?.role === 'director' ||
      (currentUser?.category === 'leadership' && (hasPermission?.('teachers') || hasPermission?.('leadership'))) ||
      (currentUser?.category === 'administrator' && (hasPermission?.('teachers') || hasPermission?.('leadership')))
    )
  );

  const canSeeStudents = !isBigAdmin && isDirectorUser && hasPermission?.('students');
  const canSeeSettings = !isBigAdmin && isDirectorUser && (hasPermission?.('teachers') || hasPermission?.('schedules') || hasPermission?.('classes') || hasPermission?.('leadership'));
  const canSeeTeacherAttendance = !isBigAdmin && (isDirectorUser || currentUser?.role === 'inspector');

  const handleNav = (path) => {
    navigateTo(path);
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [];

  if (isBigAdmin) {
    navItems.push({
      id: 'bigadmin',
      label: 'BigAdmin',
      icon: ShieldCheck,
      active: true,
      onClick: () => handleNav('/bigadmin')
    });
  } else {
    const isTeacherAccount = Boolean(
      currentUser?.role === 'class_teacher' ||
      currentUser?.role === 'subject_teacher' ||
      currentUser?.teacherId
    );

    if (isTeacherAccount) {
      if (myClassId || currentUser?.role === 'class_teacher') {
        navItems.push({
          id: 'class-teacher',
          label: myClassObj ? `${myClassObj.name} Rahbari` : 'Sinf Rahbari',
          icon: GraduationCap,
          active: currentPath === '/class-teacher',
          onClick: () => handleNav('/class-teacher')
        });
      }
      navItems.push({
        id: 'subject-teacher',
        label: 'Dars Jurnali',
        icon: BookOpen,
        active: currentPath === '/subject-teacher',
        onClick: () => handleNav('/subject-teacher')
      });
    } else {
      const mainLabel =
        currentUser?.role === 'director'
          ? 'Direktor'
          : currentUser?.role === 'inspector'
          ? 'Navbatchi'
          : currentUser?.category === 'leadership'
          ? (currentUser?.detail || currentUser?.role || 'Rahbariyat')
          : currentUser?.category === 'administrator'
          ? (currentUser?.detail || 'Administrator')
          : 'Bosh sahifa';

      navItems.push({
        id: 'main',
        label: mainLabel,
        icon: Home,
        active: activeTab === 'main',
        onClick: () => handleNav(currentUser?.role === 'inspector' ? '/duty' : '/director')
      });
    }

    if (canSeeStudents) {
      navItems.push({
        id: 'directory',
        label: "O'quvchilar",
        icon: Users,
        active: activeTab === 'directory',
        onClick: () => handleNav('/students')
      });
      navItems.push({
        id: 'student_attendance',
        label: "O'quvchilar Davomati",
        icon: Calendar,
        active: activeTab === 'student_attendance',
        onClick: () => handleNav('/student-attendance')
      });
    }

    if (canSeeSettings) {
      navItems.push({
        id: 'settings',
        label: "O'qituvchilar & Darslar",
        icon: Settings,
        active: activeTab === 'settings',
        onClick: () => handleNav('/teachers')
      });
    }

    if (canSeeTeacherAttendance) {
      navItems.push({
        id: 'teacher_attendance',
        label: "O'qituvchilar Davomati",
        icon: UserCheck,
        active: activeTab === 'teacher_attendance',
        onClick: () => handleNav('/teacher-attendance')
      });
      navItems.push({
        id: 'reports',
        label: 'Hisobotlar',
        icon: ClipboardList,
        active: activeTab === 'reports',
        onClick: () => handleNav('/reports')
      });
    }
  }

  const sidebarContent = (isMobile = false) => {
    const isCollapsed = !isMobile && collapsed;
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors">
        {/* Yuqori Logo qismi */}
        <div className={`h-14 px-3 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-slate-200 dark:border-slate-800 shrink-0`}>
          <div
            onClick={() => handleNav(isBigAdmin ? '/bigadmin' : '/director')}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-90 transition-opacity"
            title="SmartMaktab"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-sm shrink-0">
              <Building className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight truncate">
                  SmartMaktab
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  {currentSchool?.name || 'Boshqaruv Tizimi'}
                </div>
              </div>
            )}
          </div>

          {isMobile ? (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Yopish"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            !isCollapsed && (
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Yig'ish"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )
          )}
        </div>

        {/* Yig'ilgan holatda kengaytirish tugmasi */}
        {!isMobile && isCollapsed && (
          <div className="px-2 pt-2 flex justify-center">
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Kengaytirish"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigatsiya bo'limlari */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-1">
          {!isCollapsed && (
            <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Asosiy Menyu
            </div>
          )}
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                title={item.label}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-2.5 px-3'} py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  item.active
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Pastki profil va chiqish */}
        <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 shrink-0">
          {!isCollapsed && (
            <div className="px-2.5 py-2 mb-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                {currentUser?.name || 'Foydalanuvchi'}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                {currentUser?.detail || currentUser?.role || ''}
              </div>
            </div>
          )}
          <button
            onClick={logout}
            title="Tizimdan chiqish"
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-2 px-3'} py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Chiqish</span>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar (doim qotib turadi - fixed) */}
      <aside
        className={`hidden lg:block fixed top-0 left-0 h-screen z-40 transition-all duration-200 print:hidden ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent(false)}
      </aside>
      {/* Fixed sidebar ostiga kontent kirib ketmasligi uchun joy ajratuvchi */}
      <div
        className={`hidden lg:block shrink-0 transition-all duration-200 print:hidden ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      />

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex print:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <aside className="relative w-64 max-w-[80vw] h-full z-10 shadow-2xl">
            {sidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
