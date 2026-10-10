import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { USERS_AUTH } from '../mockData';
import { LogIn, Key, User, Lock, Shield, Check, Sun, Moon } from 'lucide-react';

export const LoginModal = () => {
  const { login, theme, toggleTheme } = useSchool();
  const [username, setUsername] = useState('direktor');
  const [password, setPassword] = useState('123');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = login(username, password);
    if (!res.success) {
      setError(res.error);
    }
  };

  const handleQuickSelect = (user) => {
    setUsername(user.login);
    setPassword(user.password);
    login(user.login, user.password);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-3 transition-colors">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 relative transition-colors">
        
        {/* Mavzu almashtirish tugmasi (Login oynasida) */}
        <button
          onClick={toggleTheme}
          type="button"
          className="absolute top-4 right-4 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          title={theme === 'dark' ? "Yorug' rejim" : "Tungi rejim"}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Yuqori logotip */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-700 text-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">SmartMaktab</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tizimga kirish uchun login va parolni kiriting</p>
        </div>

        {/* Xato xabari */}
        {error && (
          <div className="mb-4 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-850 text-rose-700 dark:text-rose-400 text-xs rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {/* Login Forma */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Login</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Loginni kiriting"
                required
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Parol</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parolni kiriting"
                required
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Kirish
          </button>
        </form>

        {/* Tezkor kirish hisoblari (Demo uchun juda qulay) */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 text-center">
            Tezkor kirish (Login / Parol: 123)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {USERS_AUTH.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickSelect(u)}
                className="p-2 text-left border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-blue-50/50 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{u.name}</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{u.login}</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
