import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = () => {
  const { activeToast } = useSchool();

  if (!activeToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
      <div className={`flex items-start gap-3 p-4 rounded-2xl shadow-2xl border max-w-md ${
        activeToast.type === 'success'
          ? 'bg-slate-900 text-white border-emerald-500/40'
          : activeToast.type === 'error'
          ? 'bg-rose-900 text-white border-rose-500/40'
          : 'bg-slate-900 text-white border-blue-500/40'
      }`}>
        {activeToast.type === 'success' ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        ) : activeToast.type === 'error' ? (
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        ) : (
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200">
            {activeToast.title}
          </h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            {activeToast.message}
          </p>
        </div>
      </div>
    </div>
  );
};
