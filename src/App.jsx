import React, { useState } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { DirectorDashboard } from './components/DirectorDashboard';
import { InspectorAttendance } from './components/InspectorAttendance';
import { ClassTeacherView } from './components/ClassTeacherView';
import { TeacherJournal } from './components/TeacherJournal';
import { StudentDirectory } from './components/StudentDirectory';
import { SchoolSettings } from './components/SchoolSettings';
import { SchoolMonitor } from './components/SchoolMonitor';
import { BigAdminDashboard } from './components/BigAdminDashboard';
import { Toast } from './components/Toast';
import { LocalNetworkModal } from './components/LocalNetworkModal';
import { Users, Home, Settings, Tv, ShieldCheck, Building } from 'lucide-react';

const MainLayout = () => {
  const { currentUser, hasPermission, activeTab, navigateTo, currentPath, isBigAdmin, currentSchool } = useSchool();

  if (!currentUser) {
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.history.replaceState({ path: '/login' }, '', '/login');
    }
    return <LoginModal />;
  }

  const isDirectorUser = Boolean(
    !isBigAdmin && (
      currentUser?.isDirector || 
      currentUser?.role === 'director' || 
      (currentUser?.category === 'leadership' && (hasPermission('teachers') || hasPermission('leadership'))) ||
      (currentUser?.category === 'administrator' && (hasPermission('teachers') || hasPermission('leadership')))
    )
  );

  const canSeeStudents = !isBigAdmin && isDirectorUser && hasPermission('students');
  const canSeeSettings = !isBigAdmin && isDirectorUser && (hasPermission('teachers') || hasPermission('schedules') || hasPermission('classes') || hasPermission('leadership'));

  // Tizimga kirilganda /login yoki / dan mos sahifaga yo'naltirish
  React.useEffect(() => {
    if (currentUser) {
      if (currentPath === '/login' || (typeof window !== 'undefined' && window.location.pathname === '/login')) {
        let p = '/director';
        if (currentUser.role === 'bigadmin' || isBigAdmin) p = '/bigadmin';
        else if (currentUser.role === 'inspector') p = '/duty';
        else if (currentUser.role === 'class_teacher') p = '/class-teacher';
        else if (currentUser.role === 'subject_teacher') p = '/subject-teacher';
        else if (currentUser.role === 'monitor') p = '/monitor';
        navigateTo(p);
      }
    }
  }, [currentUser, currentPath, isBigAdmin]);

  // BigAdmin faqat /bigadmin sahifasida bo'ladi, boshqa ichki maktab sahifalariga o'ta olmaydi
  React.useEffect(() => {
    if (isBigAdmin && (activeTab !== 'bigadmin' || currentPath !== '/bigadmin')) {
      navigateTo('/bigadmin');
    }
  }, [isBigAdmin, activeTab, currentPath, navigateTo]);

  // Direktor bo'lmagan foydalanuvchilar (masalan, sinf rahbari) uchun faqat o'z kabinetini ochish
  React.useEffect(() => {
    if (!isBigAdmin && !isDirectorUser && activeTab !== 'main') {
      navigateTo(currentPath || '/director');
    }
  }, [currentUser?.id, currentUser?.role, isDirectorUser, isBigAdmin]);

  return (
    <div className="min-h-screen min-w-[250px] flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased overflow-x-hidden transition-colors">
      {/* Yuqori panel */}
      <Navbar />

      {/* Asosiy qism */}
      <main className={`flex-1 w-full mx-auto ${currentUser?.role === 'monitor' ? 'max-w-none px-2 sm:px-6 py-2 sm:py-3' : 'max-w-7xl px-2 sm:px-4 py-3 sm:py-4'}`}>
        {isBigAdmin ? (
          <BigAdminDashboard />
        ) : (
          <>
            {activeTab === 'directory' && canSeeStudents && <StudentDirectory />}
            {activeTab === 'settings' && canSeeSettings && <SchoolSettings />}
            {(activeTab === 'main' || (!canSeeStudents && activeTab === 'directory') || (!canSeeSettings && activeTab === 'settings')) && (
              <>
                {(currentUser?.role === 'director' || currentUser?.isDirector || currentUser?.category === 'leadership' || currentUser?.category === 'administrator') && <DirectorDashboard />}
                {currentUser?.role === 'inspector' && <InspectorAttendance />}
                {currentUser?.role === 'class_teacher' && <ClassTeacherView />}
                {currentUser?.role === 'subject_teacher' && <TeacherJournal />}
                {currentUser?.role === 'monitor' && <SchoolMonitor />}
              </>
            )}
          </>
        )}
      </main>

      {/* Jonli bildirishnoma toast */}
      <Toast />

      {/* Maktab lokal Wi-Fi ogohlantirish modali (Direktor va Navbatchi uchun) */}
      <LocalNetworkModal />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-3 text-center text-[11px] text-slate-400 dark:text-slate-500 transition-colors">
        SmartMaktab CRM • Maktab Davomat va Boshqaruv Tizimi
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <SchoolProvider>
      <MainLayout />
    </SchoolProvider>
  );
}
