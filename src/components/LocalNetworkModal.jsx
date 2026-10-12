import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { WifiOff, Tv, Wifi, AlertTriangle, CheckCircle2, Clock, X, RefreshCw } from 'lucide-react';

export const LocalNetworkModal = () => {
  const { 
    currentUser, 
    isSchoolLocalOnline, 
    localWarningSnoozedUntil, 
    dismissLocalWarning,
    isLocalConnected,
    isInitialized,
    refreshLocalStatus
  } = useSchool();

  // Foydalanuvchini ishdan to'xtatuvchi to'siq oynani butunlay o'chiramiz (tizim bulut/lokal o'rtasida avtomatik erkin ishlaydi)
  return null;

  // Agar maktab lokal tarmog'i online bo'lsa (kamida 1 ta qurilma ulangan bo'lsa) -> modal yo'qoladi!
  if (isSchoolLocalOnline || isLocalConnected) return null;

  // Agar foydalanuvchi "Xo'p"ni bosgan bo'lsa va 10 daqiqa hali o'tmagan bo'lsa -> ko'rsatilmaydi
  const now = Date.now();
  if (localWarningSnoozedUntil && now < localWarningSnoozedUntil) {
    return null;
  }

  const handleManualCheck = async () => {
    setIsChecking(true);
    if (typeof refreshLocalStatus === 'function') {
      await refreshLocalStatus();
    }
    setTimeout(() => setIsChecking(false), 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-300 dark:border-amber-600/50 overflow-hidden transform transition-all scale-100">
        
        {/* Yuqori ogohlantirish lentasi */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 animate-pulse">
              <WifiOff className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                Maktab Lokal Tarmog'i Bilan Aloqa Yo'q
              </h3>
              <p className="text-xs text-amber-100 font-medium">
                Lokalda biron bir qurilma topilmadi
              </p>
            </div>
          </div>
          <button
            onClick={dismissLocalWarning}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal mazmuni */}
        <div className="p-6 space-y-5">
          
          {/* Asosiy ko'rsatmalar bloklari */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-600 dark:text-amber-400 block">
                  1-Qadam
                </span>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Monitorini lokalga ulang
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Foye monitori yoki maktab kompyuterini yoqing
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-600 dark:text-blue-400 block">
                  2-Qadam
                </span>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Wi-Fi'ga ulang
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Qurilmani maktab Wi-Fi tarmog'iga ulang
                </p>
              </div>
            </div>
          </div>

          {/* Tushuntirish matni */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p>
                Maktabdagi <strong>6 ta kamera va turniketlar</strong> ma'lumotlarini qabul qilish va bulutga uzatish uchun maktabdagi kamida bitta qurilma yoki monitor lokal Wi-Fi tarmog'iga ulangan bo'lishi shart.
              </p>
            </div>
            <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400 text-[11px]">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                Maktabdagi qurilma Wi-Fi ga ulangani zahoti ushbu ogohlantirish oynasi <strong>avtomatik ravishda yo'qolib ketadi</strong> va siz Global rejimda ham jonli kamerani ko'ra olasiz.
              </p>
            </div>
          </div>

          {/* Harakat tugmalari */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleManualCheck}
              disabled={isChecking}
              className="w-full sm:w-auto px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-blue-500' : ''}`} />
              <span>{isChecking ? 'Tekshirilmoqda...' : 'Qayta tekshirish'}</span>
            </button>

            <button
              onClick={dismissLocalWarning}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Xo'p, tushundim</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
