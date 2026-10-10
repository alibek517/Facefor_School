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
import { Toast } from './components/Toast';
import { LocalNetworkModal } from './components/LocalNetworkModal';
import { Users, Home, Settings, Tv } from 'lucide-react';

const MainLayout = () => {
  const { currentUser, hasPermission } = useSchool();
  const [activeTab, setActiveTab] = useState('main'); // 'main' | 'directory' | 'settings'

  if (!currentUser) {
    return <LoginModal />;
  }

  const isDirectorUser = Boolean(
    currentUser?.isDirector || 
    currentUser?.role === 'director' || 
    (currentUser?.category === 'leadership' && (hasPermission('teachers') || hasPermission('leadership'))) ||
    (currentUser?.category === 'administrator' && (hasPermission('teachers') || hasPermission('leadership')))
  );

  const canSeeStudents = isDirectorUser && hasPermission('students');
  const canSeeSettings = isDirectorUser && (hasPermission('teachers') || hasPermission('schedules') || hasPermission('classes') || hasPermission('leadership'));

  // Direktor bo'lmagan foydalanuvchilar (masalan, sinf rahbari) uchun faqat o'z kabinetini ochish
  React.useEffect(() => {
    if (!isDirectorUser && activeTab !== 'main') {
      setActiveTab('main');
    }
  }, [currentUser?.id, currentUser?.role, isDirectorUser]);

  return (
    <div className="min-h-screen min-w-[250px] flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased overflow-x-hidden transition-colors">
      {/* Yuqori panel */}
      <Navbar />

      {/* Ichki sub-menyu: Asosiy kabinet, O'quvchilar va Sozlamalar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-2 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 shrink-0">
            
            {/* 1. Asosiy rol ekrani */}
            <button
              onClick={() => setActiveTab('main')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                activeTab === 'main'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>
                {currentUser?.role === 'director' && 'Direktor'}
                {currentUser?.role === 'inspector' && 'Navbatchi'}
                {currentUser?.role === 'class_teacher' && 'Sinf Rahbari'}
                {currentUser?.role === 'subject_teacher' && 'Fan O\'qituvchisi'}
                {currentUser?.role === 'monitor' && 'Foye Tablosi (Monitor)'}
                {currentUser?.category === 'leadership' && currentUser?.role !== 'director' && (currentUser?.role || 'Rahbariyat')}
                {currentUser?.category === 'administrator' && (currentUser?.role || 'Administrator')}
              </span>
            </button>

            {/* 2. O'quvchilar CRUD */}
            {canSeeStudents && (
              <button
                onClick={() => setActiveTab('directory')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                  activeTab === 'directory'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>O'quvchilar</span>
              </button>
            )}

            {/* 3. O'qituvchilar va Fanlar CRUD */}
            {canSeeSettings && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
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

          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium shrink-0 hidden sm:block">
            Jonli Maktab Tizimi
          </div>
        </div>
      </div>

      {/* Asosiy qism */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
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
