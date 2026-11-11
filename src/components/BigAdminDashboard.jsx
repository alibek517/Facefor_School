import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { 
  Building, 
  DoorClosed, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Search, 
  ShieldCheck, 
  Activity, 
  Wifi, 
  WifiOff, 
  ArrowRightLeft, 
  Phone, 
  MapPin, 
  UserCheck, 
  Server, 
  Settings2, 
  Layers,
  Sparkles,
  Camera,
  Database,
  Cloud,
  Key,
  AlertTriangle,
  Loader2,
  Calendar,
  Snowflake,
  Clock,
  PauseCircle,
  PlayCircle
} from 'lucide-react';

export const BigAdminDashboard = () => {
  const {
    schools,
    selectedSchoolId,
    selectSchool,
    createSchool,
    updateSchool,
    updateSchoolSupabase,
    updateSchoolSubscription,
    getSchoolSubscriptionInfo,
    testSupabaseConnection,
    deleteSchool,
    addTurnstileToSchool,
    updateTurnstile,
    deleteTurnstile,
    cameras,
    navigateTo,
    showToast
  } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, active
  const [activeTab, setActiveTab] = useState('schools'); // schools, turnstiles

  // Modallar holati
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [schoolFormData, setSchoolFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    director: '',
    status: 'active',
    initialTurnstiles: []
  });

  const [showTurnstileModal, setShowTurnstileModal] = useState(false);
  const [editingTurnstile, setEditingTurnstile] = useState(null);
  const [turnstileTargetSchoolId, setTurnstileTargetSchoolId] = useState('');
  const [turnstileFormData, setTurnstileFormData] = useState({
    name: '',
    ip: '',
    port: 80,
    type: 'in',
    location: ''
  });

  // Supabase sozlamalari modali holati
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [selectedSchoolForSupabase, setSelectedSchoolForSupabase] = useState(null);
  const [supabaseFormData, setSupabaseFormData] = useState({
    supabaseUrl: '',
    supabaseKey: ''
  });
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Maktab Obunachilik va Muzlatish modali holati
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [managingSchool, setManagingSchool] = useState(null);
  const [subscriptionFormData, setSubscriptionFormData] = useState({
    isFrozen: false,
    subscriptionStart: '',
    subscriptionEnd: '',
    freezeReason: ''
  });

  // Barcha turniketlar yig'indisi
  const allTurnstilesWithSchool = useMemo(() => {
    const list = [];
    (schools || []).forEach(school => {
      (school.turnstiles || []).forEach(t => {
        // Global CAMERAS ro'yxatidan online holatini sinxronlash
        const liveCam = (cameras || []).find(c => c.ip === t.ip || c.id === t.id);
        list.push({
          ...t,
          schoolId: school.id,
          schoolName: school.name,
          schoolCode: school.code,
          online: liveCam ? liveCam.online : Boolean(t.online)
        });
      });
    });
    return list;
  }, [schools, cameras]);

  // Statistik hisob-kitoblar
  const totalSchools = (schools || []).length;
  const totalTurnstiles = allTurnstilesWithSchool.length;
  const onlineTurnstiles = allTurnstilesWithSchool.filter(t => t.online).length;
  const totalInTurnstiles = allTurnstilesWithSchool.filter(t => t.type === 'in').length;
  const totalOutTurnstiles = allTurnstilesWithSchool.filter(t => t.type === 'out').length;

  // Qidiruv va filtrlash
  const filteredSchools = useMemo(() => {
    return (schools || []).filter(s => {
      const matchSearch = (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.director || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.address || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (selectedFilter === 'active') return matchSearch && s.status === 'active';
      return matchSearch;
    });
  }, [schools, searchQuery, selectedFilter]);

  // Maktab qo'shish / tahrirlash oynasini ochish
  const handleOpenSchoolModal = (school = null) => {
    if (school) {
      setEditingSchool(school);
      setSchoolFormData({
        name: school.name || '',
        code: school.code || '',
        address: school.address || '',
        phone: school.phone || '',
        director: school.director || '',
        status: school.status || 'active',
        initialTurnstiles: []
      });
    } else {
      setEditingSchool(null);
      setSchoolFormData({
        name: '',
        code: `SCH-${String(totalSchools + 1).padStart(3, '0')}`,
        address: '',
        phone: '+998 ',
        director: '',
        status: 'active',
        initialTurnstiles: [
          { name: 'Turniket 1 (Kirish)', ip: '', type: 'in', location: 'Bosh kirish' },
          { name: 'Turniket 2 (Chiqish)', ip: '', type: 'out', location: 'Chiqish yo\'lagi' }
        ]
      });
    }
    setShowSchoolModal(true);
  };

  const handleSaveSchool = async (e) => {
    e.preventDefault();
    if (!schoolFormData.name.trim()) {
      showToast('Xatolik', 'Maktab nomi kiritilishi shart!', 'error');
      return;
    }

    if (editingSchool) {
      await updateSchool({
        id: editingSchool.id,
        ...schoolFormData
      });
    } else {
      const validTurnstiles = (schoolFormData.initialTurnstiles || []).filter(t => t.ip && t.ip.trim());
      await createSchool({
        ...schoolFormData,
        turnstiles: validTurnstiles
      });
    }
    setShowSchoolModal(false);
  };

  const handleDeleteSchool = async (schoolId, schoolName) => {
    if (window.confirm(`Haqiqatan ham "${schoolName}" maktabini va unga biriktirilgan barcha turniketlarni o'chirmoqchimisiz?`)) {
      await deleteSchool(schoolId);
    }
  };

  // Turniket biriktirish oynasini ochish
  const handleOpenTurnstileModal = (schoolId, turnstile = null) => {
    setTurnstileTargetSchoolId(schoolId);
    if (turnstile) {
      setEditingTurnstile(turnstile);
      setTurnstileFormData({
        name: turnstile.name || '',
        ip: turnstile.ip || '',
        port: turnstile.port || 80,
        type: turnstile.type || 'in',
        location: turnstile.location || ''
      });
    } else {
      setEditingTurnstile(null);
      const school = schools.find(s => s.id === schoolId);
      const nextIdx = (school?.turnstiles?.length || 0) + 1;
      setTurnstileFormData({
        name: `Turniket ${nextIdx} (${nextIdx % 2 === 1 ? 'Kirish' : 'Chiqish'})`,
        ip: '192.168.',
        port: 80,
        type: nextIdx % 2 === 1 ? 'in' : 'out',
        location: 'Asosiy kirish zali'
      });
    }
    setShowTurnstileModal(true);
  };

  const handleSaveTurnstile = async (e) => {
    e.preventDefault();
    if (!turnstileFormData.ip.trim()) {
      showToast('Xatolik', 'Turniket IP manzili kiritilishi shart!', 'error');
      return;
    }

    if (editingTurnstile) {
      await updateTurnstile(turnstileTargetSchoolId, editingTurnstile.id, turnstileFormData);
    } else {
      await addTurnstileToSchool(turnstileTargetSchoolId, turnstileFormData);
    }
    setShowTurnstileModal(false);
  };

  const handleDeleteTurnstile = async (schoolId, turnstileId, ip, name) => {
    if (window.confirm(`"${name || ip}" turniketini ushbu maktabdan olib tashlamoqchimisiz?`)) {
      await deleteTurnstile(schoolId, turnstileId, ip);
    }
  };

  const handleSwitchToSchoolManagement = (schoolId) => {
    selectSchool(schoolId);
    navigateTo('/director');
  };

  // Supabase sozlamalari modali
  const handleOpenSupabaseModal = (school) => {
    setSelectedSchoolForSupabase(school);
    const isFirstSchool = school.id === 'sch-1';
    setSupabaseFormData({
      supabaseUrl: school.supabaseUrl || (isFirstSchool ? 'https://ffwbxpqfzlkevxhijvtd.supabase.co' : ''),
      supabaseKey: school.supabaseKey || (isFirstSchool ? 'sb_publishable_IN4OpUU6gNpnZINpifQSAg_DZuksmMD' : '')
    });
    setTestResult(null);
    setShowSupabaseModal(true);
  };

  const handleTestConnection = async () => {
    if (!supabaseFormData.supabaseUrl.trim() || !supabaseFormData.supabaseKey.trim()) {
      setTestResult({ success: false, message: 'URL va Anon Key to\'liq kiritilishi shart!' });
      return;
    }
    setTestingSupabase(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(supabaseFormData.supabaseUrl, supabaseFormData.supabaseKey);
      setTestResult(res);
    } catch (e) {
      setTestResult({ success: false, message: e.message || 'Ulanishda xatolik yuz berdi' });
    } finally {
      setTestingSupabase(false);
    }
  };

  const handleSaveSupabase = async (e) => {
    e.preventDefault();
    if (!selectedSchoolForSupabase) return;
    await updateSchoolSupabase(selectedSchoolForSupabase.id, {
      supabaseUrl: supabaseFormData.supabaseUrl.trim(),
      supabaseKey: supabaseFormData.supabaseKey.trim()
    });
    setShowSupabaseModal(false);
  };

  // Obuna va Muzlatish boshqaruvi
  const handleOpenSubscriptionModal = (school) => {
    setManagingSchool(school);
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setSubscriptionFormData({
      isFrozen: Boolean(school.isFrozen),
      subscriptionStart: school.subscriptionStart || todayStr,
      subscriptionEnd: school.subscriptionEnd || defaultEnd,
      freezeReason: school.freezeReason || ''
    });
    setShowSubscriptionModal(true);
  };

  const handleSaveSubscription = async (e) => {
    if (e) e.preventDefault();
    if (!managingSchool) return;
    await updateSchoolSubscription(managingSchool.id, subscriptionFormData);
    setShowSubscriptionModal(false);
  };

  const handleToggleFreezeNow = async () => {
    if (!managingSchool) return;
    const nextFrozen = !subscriptionFormData.isFrozen;
    const updated = {
      ...subscriptionFormData,
      isFrozen: nextFrozen
    };
    setSubscriptionFormData(updated);
    await updateSchoolSubscription(managingSchool.id, updated);
  };

  const handleQuickAddMonths = (months) => {
    const base = subscriptionFormData.subscriptionEnd ? new Date(subscriptionFormData.subscriptionEnd) : new Date();
    const targetTime = Math.max(base.getTime(), Date.now());
    const d = new Date(targetTime);
    d.setMonth(d.getMonth() + months);
    setSubscriptionFormData(prev => ({
      ...prev,
      subscriptionEnd: d.toISOString().split('T')[0],
      isFrozen: false
    }));
  };

  const handleEnterSchoolFromModal = () => {
    if (!managingSchool) return;
    selectSchool(managingSchool.id);
    setShowSubscriptionModal(false);
    navigateTo('/director');
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. Yuqori Banner & Big Admin statusi */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-xl border border-indigo-900/50">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Super Administrator Rejimi (BigAdmin)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Maktablar & Turniketlar Markazi
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              Tizimga istalgancha maktab qo'shing, har bir maktabga alohida Supabase bulut bazasini biriktiring va turniketlarni markazlashgan holda boshqaring.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleOpenSchoolModal()}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi Maktab Qo'shish</span>
            </button>
          </div>
        </div>

        {/* BigAdmin Markaziy Supabase xabarnomasi */}
        <div className="mt-4 px-3.5 py-2.5 rounded-xl bg-indigo-950/70 border border-indigo-700/50 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300 font-medium">BigAdmin Markaziy Supabase:</span>
            <span className="font-mono text-emerald-300 font-bold">rtjymleouwmgjranmfeg.supabase.co</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
            Alohida Markaziy Baza • Faol
          </span>
        </div>

        {/* KPI Statistik bloklar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-medium">
              <Building className="w-3.5 h-3.5" />
              <span>Jami Maktablar</span>
            </div>
            <div className="text-2xl font-black mt-1 text-white">{totalSchools} ta</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Barcha filiallar</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-blue-300 text-xs font-medium">
              <DoorClosed className="w-3.5 h-3.5" />
              <span>Biriktirilgan Turniketlar</span>
            </div>
            <div className="text-2xl font-black mt-1 text-white">{totalTurnstiles} ta</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{totalInTurnstiles} kirish, {totalOutTurnstiles} chiqish</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-medium">
              <Activity className="w-3.5 h-3.5" />
              <span>Faol (Online) Qurilmalar</span>
            </div>
            <div className="text-2xl font-black mt-1 text-emerald-400">{onlineTurnstiles} ta</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Jonli tarmoqda ishlamoqda</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-medium">
              <Server className="w-3.5 h-3.5" />
              <span>Lokal Ko'prik & API</span>
            </div>
            <div className="text-2xl font-black mt-1 text-amber-300">5001-port</div>
            <div className="text-[10px] text-slate-400 mt-0.5">0.0.0.0 (Global & Wi-Fi)</div>
          </div>
        </div>
      </div>

      {/* 2. Filtrlar va Tablar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('schools')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'schools'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Maktablar ({totalSchools})</span>
          </button>

          <button
            onClick={() => setActiveTab('turnstiles')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'turnstiles'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <DoorClosed className="w-3.5 h-3.5" />
            <span>Barcha Turniketlar ({totalTurnstiles})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Qidiruv (nom, kod, direktor)..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* 3. ASOSIY RO'YXAT: Maktablar ko'rinishi */}
      {activeTab === 'schools' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSchools.map((school) => {
            const isCurrentSelected = school.id === selectedSchoolId;
            const turnstiles = school.turnstiles || [];
            const inCount = turnstiles.filter(t => t.type === 'in').length;
            const outCount = turnstiles.filter(t => t.type === 'out').length;
            const onlineCount = turnstiles.filter(t => {
              const liveCam = (cameras || []).find(c => c.ip === t.ip || c.id === t.id);
              return liveCam ? liveCam.online : Boolean(t.online);
            }).length;

            return (
              <div
                key={school.id}
                className={`rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-lg ${
                  isCurrentSelected
                    ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/30 shadow-blue-500/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Maktab kartochkasi bosh qismi (Yuqori blok) */}
                <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 backdrop-blur-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-mono text-xs font-black border border-blue-200 dark:border-blue-800/60">
                          {school.code || 'SCH'}
                        </span>
                        {isCurrentSelected && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Faol Tanlangan
                          </span>
                        )}
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                          {turnstiles.length} ta turniket ({onlineCount} online)
                        </span>
                      </div>
                      <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight truncate">
                        {school.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenSchoolModal(school)}
                        className="p-2 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/80 rounded-xl transition-all border border-slate-200 dark:border-slate-700/80 shadow-2xs cursor-pointer"
                        title="Maktabni tahrirlash"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {schools.length > 1 && (
                        <button
                          onClick={() => handleDeleteSchool(school.id, school.name)}
                          className="p-2 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-all border border-slate-200 dark:border-slate-700/80 shadow-2xs cursor-pointer"
                          title="Maktabni o'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Maktab rekvizitlari */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3.5 text-xs text-slate-700 dark:text-slate-200 font-medium">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-6 h-6 rounded-lg bg-blue-100/70 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <UserCheck className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{school.director || 'Direktor tayinlanmagan'}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate font-mono font-semibold">{school.phone || 'Telefon yo\'q'}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate sm:col-span-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-100/70 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{school.address || 'Manzil kiritilmagan'}</span>
                    </div>
                  </div>

                  {/* Supabase Bulut Bazasi Sozlamalari & Holati */}
                  <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {(school.supabaseUrl || school.id === 'sch-1') ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Supabase Ulangan</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold shadow-2xs">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Supabase Kutilmoqda</span>
                        </span>
                      )}
                      <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[170px]" title={school.supabaseUrl || (school.id === 'sch-1' ? 'https://ffwbxpqfzlkevxhijvtd.supabase.co' : '')}>
                        {school.supabaseUrl ? school.supabaseUrl.replace('https://', '').split('.')[0] + '.supabase.co' : (school.id === 'sch-1' ? 'ffwbxpqfzlkevxhijvtd.supabase.co' : 'Baza kiritilmagan')}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenSupabaseModal(school)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>Supabase Sozlamalari</span>
                    </button>
                  </div>
                </div>

                {/* Biriktirilgan turniketlar bo'limi (Pastki blok) */}
                <div className="p-4 sm:p-5 space-y-3 bg-white dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                        <DoorClosed className="w-4 h-4" />
                      </div>
                      <span>Biriktirilgan Turniketlar ({turnstiles.length} ta)</span>
                    </div>

                    <button
                      onClick={() => handleOpenTurnstileModal(school.id)}
                      className="px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl transition-all flex items-center gap-1.5 border border-blue-200 dark:border-blue-800/80 shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Turniket Biriktirish</span>
                    </button>
                  </div>

                  {turnstiles.length === 0 ? (
                    <div className="p-5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/30">
                      Ushbu maktabga hali turniket biriktirilmagan. "+ Turniket Biriktirish" tugmasini bosing.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {turnstiles.map((cam) => {
                        const liveCam = (cameras || []).find(c => c.ip === cam.ip || c.id === cam.id);
                        const isOnline = liveCam ? liveCam.online : Boolean(cam.online);
                        const isIn = cam.type === 'in';

                        return (
                          <div
                            key={cam.id || cam.ip}
                            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all flex items-center justify-between gap-2 shadow-2xs"
                          >
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? 'bg-emerald-500 ring-2 ring-emerald-500/20 animate-pulse' : 'bg-slate-400'}`} />
                                <span className={`text-[10px] font-black px-1.5 py-0.2 rounded uppercase ${
                                  isIn
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                }`}>
                                  {isIn ? 'Kirish' : 'Chiqish'}
                                </span>
                                <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                                  {cam.name}
                                </span>
                              </div>
                              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate pl-3.5 font-medium">
                                IP: {cam.ip} {cam.location ? `• ${cam.location}` : ''}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleOpenTurnstileModal(school.id, cam)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                                title="Turniketni tahrirlash"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTurnstile(school.id, cam.id, cam.ip, cam.name)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors cursor-pointer"
                                title="Turniketni o'chirish"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Pastki boshqaruv va obuna tugmasi */}
                  <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">
                        {school.code || school.id}
                      </span>
                      {(() => {
                        const sub = getSchoolSubscriptionInfo(school);
                        if (sub.isFrozen) {
                          return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 text-xs font-bold">
                              <Snowflake className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                              Muzlatilgan
                            </span>
                          );
                        }
                        if (sub.isExpired) {
                          return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold">
                              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              Muddati o'tgan
                            </span>
                          );
                        }
                        return (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            {sub.text}
                          </span>
                        );
                      })()}
                    </div>

                    <button
                      onClick={() => handleOpenSubscriptionModal(school)}
                      className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Obuna & Muzlatish Holati</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. ASOSIY RO'YXAT: Barcha Turniketlar umumiy jadvali */}
      {activeTab === 'turnstiles' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Barcha Maktablar Turniketlari Monitoringi</h3>
              <p className="text-xs text-slate-400">Jami {allTurnstilesWithSchool.length} ta turniket apparati tarmoqda</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg">
              {onlineTurnstiles} ta Qurilma Online
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-4">Holat</th>
                  <th className="py-2.5 px-4">Turniket Nomi</th>
                  <th className="py-2.5 px-4">IP Manzili</th>
                  <th className="py-2.5 px-4">Biriktirilgan Maktab</th>
                  <th className="py-2.5 px-4">Yo'nalishi</th>
                  <th className="py-2.5 px-4">Joylashuvi</th>
                  <th className="py-2.5 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {allTurnstilesWithSchool.map((t) => (
                  <tr key={`${t.schoolId}-${t.id || t.ip}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${t.online ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          {t.online ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                      {t.name}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                      http://{t.ip}:{t.port || 80}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[11px]">
                        {t.schoolName}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        t.type === 'in'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}>
                        {t.type === 'in' ? 'Kirish' : 'Chiqish'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">
                      {t.location || 'Asosiy kirish'}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenTurnstileModal(t.schoolId, t)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTurnstile(t.schoolId, t.id, t.ip, t.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== 5. MAKTAB YARATISH / TAHRIRLASH MODALI ==================== */}
      {showSchoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center shadow-sm">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    {editingSchool ? 'Maktabni Tahrirlash' : 'Yangi Maktab Qo\'shish'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Maktab rekvizitlari va sozlamalari</p>
                </div>
              </div>
              <button
                onClick={() => setShowSchoolModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSchool} className="p-4 sm:p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Maktab Nomi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={schoolFormData.name}
                  onChange={(e) => setSchoolFormData({ ...schoolFormData, name: e.target.value })}
                  placeholder="Masalan: 5-sonli ixtisoslashtirilgan maktab"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Maktab Kodi
                  </label>
                  <input
                    type="text"
                    value={schoolFormData.code}
                    onChange={(e) => setSchoolFormData({ ...schoolFormData, code: e.target.value })}
                    placeholder="SCH-005"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Telefon Raqam
                  </label>
                  <input
                    type="text"
                    value={schoolFormData.phone}
                    onChange={(e) => setSchoolFormData({ ...schoolFormData, phone: e.target.value })}
                    placeholder="+998 90 123 45 67"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Direktor F.I.Sh
                </label>
                <input
                  type="text"
                  value={schoolFormData.director}
                  onChange={(e) => setSchoolFormData({ ...schoolFormData, director: e.target.value })}
                  placeholder="Masalan: Karimov Jamshid Aliyevich"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Joylashgan Manzili
                </label>
                <input
                  type="text"
                  value={schoolFormData.address}
                  onChange={(e) => setSchoolFormData({ ...schoolFormData, address: e.target.value })}
                  placeholder="Masalan: Urganch shahri, Al-Xorazmiy ko'chasi 15"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Yangi maktab yaratishda boshlang'ich turniketlar qo'shish imkoniyati */}
              {!editingSchool && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Boshlang'ich Turniketlar (Ixtiyoriy)
                    </span>
                    <button
                      type="button"
                      onClick={() => setSchoolFormData({
                        ...schoolFormData,
                        initialTurnstiles: [
                          ...schoolFormData.initialTurnstiles,
                          { name: `Turniket ${schoolFormData.initialTurnstiles.length + 1}`, ip: '', type: 'in', location: 'Foye' }
                        ]
                      })}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      + Turniket qo'shish
                    </button>
                  </div>

                  {schoolFormData.initialTurnstiles.map((t, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={t.name}
                          onChange={(e) => {
                            const arr = [...schoolFormData.initialTurnstiles];
                            arr[idx].name = e.target.value;
                            setSchoolFormData({ ...schoolFormData, initialTurnstiles: arr });
                          }}
                          placeholder="Nomi"
                          className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={t.ip}
                          onChange={(e) => {
                            const arr = [...schoolFormData.initialTurnstiles];
                            arr[idx].ip = e.target.value;
                            setSchoolFormData({ ...schoolFormData, initialTurnstiles: arr });
                          }}
                          placeholder="192.168.1.X"
                          className="w-full px-2 py-1 text-xs font-mono bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={t.type}
                          onChange={(e) => {
                            const arr = [...schoolFormData.initialTurnstiles];
                            arr[idx].type = e.target.value;
                            setSchoolFormData({ ...schoolFormData, initialTurnstiles: arr });
                          }}
                          className="w-full px-1 py-1 text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none"
                        >
                          <option value="in">Kirish</option>
                          <option value="out">Chiqish</option>
                        </select>
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const arr = schoolFormData.initialTurnstiles.filter((_, i) => i !== idx);
                            setSchoolFormData({ ...schoolFormData, initialTurnstiles: arr });
                          }}
                          className="text-rose-500 hover:text-rose-700 text-sm font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSchoolModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingSchool ? 'Saqlash' : 'Maktabni Yaratish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 6. TURNIKET BIRIKTIRISH / TAHRIRLASH MODALI ==================== */}
      {showTurnstileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white flex items-center justify-center shadow-sm">
                  <DoorClosed className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    {editingTurnstile ? 'Turniketni Tahrirlash' : 'Maktabga Turniket Biriktirish'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {schools.find(s => s.id === turnstileTargetSchoolId)?.name || 'Tanlangan maktab'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTurnstileModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTurnstile} className="p-4 sm:p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Maktabni Tanlang
                </label>
                <select
                  value={turnstileTargetSchoolId}
                  onChange={(e) => setTurnstileTargetSchoolId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white font-medium"
                >
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Turniket Nomi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={turnstileFormData.name}
                  onChange={(e) => setTurnstileFormData({ ...turnstileFormData, name: e.target.value })}
                  placeholder="Masalan: Turniket 1 (Bosh kirish)"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    IP Manzil <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={turnstileFormData.ip}
                    onChange={(e) => setTurnstileFormData({ ...turnstileFormData, ip: e.target.value })}
                    placeholder="192.168.1.35"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    value={turnstileFormData.port}
                    onChange={(e) => setTurnstileFormData({ ...turnstileFormData, port: e.target.value })}
                    placeholder="80"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Yo'nalishi (Turi)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTurnstileFormData({ ...turnstileFormData, type: 'in' })}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      turnstileFormData.type === 'in'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>🟢 Kirish (IN)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTurnstileFormData({ ...turnstileFormData, type: 'out' })}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      turnstileFormData.type === 'out'
                        ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>🔴 Chiqish (OUT)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Joylashuv Joyi
                </label>
                <input
                  type="text"
                  value={turnstileFormData.location}
                  onChange={(e) => setTurnstileFormData({ ...turnstileFormData, location: e.target.value })}
                  placeholder="Masalan: Foye chap eshik yoki 2-bino yo'lagi"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTurnstileModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingTurnstile ? 'Yangilash' : 'Turniketni Biriktirish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 7. MAKTAB SUPABASE SOZLAMALARI MODALI ==================== */}
      {showSupabaseModal && selectedSchoolForSupabase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    Supabase Bulut Bazasi Sozlamalari
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedSchoolForSupabase.name} ({selectedSchoolForSupabase.code || 'SCH'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSupabaseModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSupabase} className="p-4 sm:p-5 space-y-4">
              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-800 dark:text-indigo-300">
                Ushbu maktabga tegishli barcha Face-ID skanlari, o'quvchilar va davomat faqat mana shu Supabase loyihasiga saqlanadi va boshqa maktablar bilan mutlaqo aralashmaydi.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supabase Project URL <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Cloud className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    required
                    value={supabaseFormData.supabaseUrl}
                    onChange={(e) => setSupabaseFormData({ ...supabaseFormData, supabaseUrl: e.target.value })}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supabase Anon / Public Key <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={supabaseFormData.supabaseKey}
                    onChange={(e) => setSupabaseFormData({ ...supabaseFormData, supabaseKey: e.target.value })}
                    placeholder="sb_publishable_... yoki eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Ulanishni tekshirish tugmasi va natijasi */}
              <div className="pt-1">
                <button
                  type="button"
                  disabled={testingSupabase}
                  onClick={handleTestConnection}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                >
                  {testingSupabase ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      <span>Supabase bilan aloqa tekshirilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4 text-indigo-600" />
                      <span>Ulanishni Tekshirish</span>
                    </>
                  )}
                </button>

                {testResult && (
                  <div className={`mt-2.5 p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 border ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                  }`}>
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSupabaseModal(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Bekor Qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saqlash va Biriktirish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 8. MAKTABNI BOSHQARISH VA OBUNACHILIK (ABONENT) MODALI ==================== */}
      {showSubscriptionModal && managingSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${
                  subscriptionFormData.isFrozen
                    ? 'bg-rose-600 shadow-rose-600/30'
                    : 'bg-blue-700 shadow-blue-700/30'
                }`}>
                  {subscriptionFormData.isFrozen ? (
                    <Snowflake className="w-5 h-5 animate-pulse" />
                  ) : (
                    <Building className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{managingSchool.name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-mono text-[11px] font-bold">
                      {managingSchool.code || 'SCH'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Maktab boshqaruvi, abonent to'lovi (obuna) muddati va kirish huquqini nazorat qilish
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubscription} className="p-4 sm:p-5 space-y-4 max-h-[82vh] overflow-y-auto">
              
              {/* 1. Katta Muzlatish / Faollashtirish holati bloki */}
              <div className={`p-4 rounded-2xl border transition-all ${
                subscriptionFormData.isFrozen
                  ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/60'
                  : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900/60'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Joriy Maktab Holati:
                    </div>
                    <div className={`text-base font-black flex items-center gap-2 ${
                      subscriptionFormData.isFrozen
                        ? 'text-rose-700 dark:text-rose-300'
                        : 'text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {subscriptionFormData.isFrozen ? (
                        <>
                          <Snowflake className="w-5 h-5 text-rose-600 animate-spin" />
                          <span>MUZLATILGAN (KIRISH CHEKLANGAN)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span>FAOL REJIMDA (ISHLAMOQDA)</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {subscriptionFormData.isFrozen
                        ? "Muzlatilgan holatda ushbu maktab xodimlari tizimga kira olmaydi, kiringan xodimlar esa zudlik bilan chiqarib yuboriladi."
                        : "Maktab xodimlari (Direktor, O'qituvchilar, Monitor) belgilangan muddatgacha tizimdan to'liq foydalana oladilar."}
                    </p>
                  </div>

                  {/* Zudlik bilan Muzlatish / Muzdan chiqarish tugmasi */}
                  <button
                    type="button"
                    onClick={handleToggleFreezeNow}
                    className={`px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 shrink-0 ${
                      subscriptionFormData.isFrozen
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                        : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                    }`}
                  >
                    {subscriptionFormData.isFrozen ? (
                      <>
                        <PlayCircle className="w-4 h-4" />
                        <span>Muzdan Chiqarish (Faollashtirish)</span>
                      </>
                    ) : (
                      <>
                        <PauseCircle className="w-4 h-4" />
                        <span>Zudlik bilan Muzlatish</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 2. Obunachilik (Abonent) sanalari */}
              <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Obuna Davri (Qachondan - Qachongacha)</span>
                  </label>
                  {subscriptionFormData.subscriptionEnd && (
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {(() => {
                        const today = new Date().setHours(0,0,0,0);
                        const end = new Date(subscriptionFormData.subscriptionEnd).setHours(0,0,0,0);
                        const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
                        if (diff < 0) return `⚠️ Muddati o'tgan (${Math.abs(diff)} kun oldin)`;
                        return `⏳ ${diff} kun qoldi`;
                      })()}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Boshlanish sanasi (Qachondan):
                    </label>
                    <input
                      type="date"
                      required
                      value={subscriptionFormData.subscriptionStart}
                      onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, subscriptionStart: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Tugash sanasi (Qachongacha):
                    </label>
                    <input
                      type="date"
                      required
                      value={subscriptionFormData.subscriptionEnd}
                      onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, subscriptionEnd: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Tezkor muddat qo'shish tugmalari */}
                <div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Tezkor muddat belgilash:
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleQuickAddMonths(1)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors"
                    >
                      +1 Oy Qo'shish
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAddMonths(3)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors"
                    >
                      +3 Oy Qo'shish
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAddMonths(6)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors"
                    >
                      +6 Oy Qo'shish
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAddMonths(12)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors"
                    >
                      +1 Yil Qo'shish
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Muzlatish sababi yoki izoh */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Muzlatish Sababi / Izoh (Ixtiyoriy)
                </label>
                <input
                  type="text"
                  value={subscriptionFormData.freezeReason}
                  onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, freezeReason: e.target.value })}
                  placeholder="Masalan: Oylik to'lov amalga oshirilmagan yoki profilaktika davri"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
                />
              </div>

              {/* 4. Pastki amallar: Saqlash */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setShowSubscriptionModal(false)}
                    className="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Bekor Qilish
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow-lg shadow-blue-700/30 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saqlash va Qo'llash</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
