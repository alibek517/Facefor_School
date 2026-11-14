import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  USERS_AUTH,
  SCHOOL_LEADERSHIP,
  AVAILABLE_PERMISSIONS,
  INITIAL_CLASSES,
  INITIAL_TEACHERS,
  INITIAL_STUDENTS,
  INITIAL_SCHEDULE,
  INITIAL_ATTENDANCE,
  INITIAL_NOTIFICATIONS,
  INITIAL_TEACHER_ATTENDANCE,
  INITIAL_HOURLY_ATTENDANCE,
  INITIAL_SCHOOLS,
  TODAY_DATE
} from '../mockData';
import {
  supabase,
  bigAdminSupabase,
  getSupabaseForSchool,
  setActiveSupabaseClient,
  getActiveSupabaseClient,
  testSupabaseConnection,
  checkSupabaseConnection,
  loadAllSchoolDataFromSupabase,
  saveModuleToSupabase,
  loadCamerasFromSupabase,
  saveCamerasToSupabase,
  insertFaceScanToSupabase,
  loadTodayFaceScansFromSupabase,
  getLocalStatusFromSupabase,
  getLatestCameraFramesFromSupabase,
  sendLocalHeartbeatToSupabase,
  saveLatestCameraFramesToSupabase,
  isQuotaExceeded,
  checkQuota
} from '../supabase';
import { promoteAllClasses } from '../utils/excelAndPromotion';
import { formatPhoneNumber, generateTeacherLogin } from '../utils/phoneFormatter';

const SchoolContext = createContext(null);

// Xavfsiz LocalStorage o'qish funksiyasi
const getSafeStorage = (key, fallback, validator) => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') return fallback;
    const parsed = JSON.parse(item);
    if (validator && !validator(parsed)) return fallback;
    return parsed;
  } catch (e) {
    return fallback;
  }
};

// Yaroqsiz yoki o'chib ketgan Cloudflare quick-tunnel manzillarini eslab qolish va chetlatish
const deadTunnelsSet = new Set([
  'https://preparation-arkansas-roof-stored.trycloudflare.com',
  'https://district-tel-rabbit-passport.trycloudflare.com',
  'https://genuine-starting-bare-episodes.trycloudflare.com'
]);
const tunnelFailureMap = new Map();

const markTunnelFailure = (url, clearCallback) => {
  if (!url || typeof url !== 'string') return;
  const clean = url.trim().replace(/\/+$/, '');
  const count = (tunnelFailureMap.get(clean) || 0) + 1;
  tunnelFailureMap.set(clean, count);
  if (count >= 2) {
    deadTunnelsSet.add(clean);
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('saved_bridge_url');
        if (saved && saved.trim().replace(/\/+$/, '') === clean) {
          localStorage.removeItem('saved_bridge_url');
        }
      } catch (e) {}
    }
    if (typeof clearCallback === 'function') {
      clearCallback(clean);
    }
  }
};

const markTunnelSuccess = (url) => {
  if (!url || typeof url !== 'string') return;
  const clean = url.trim().replace(/\/+$/, '');
  tunnelFailureMap.set(clean, 0);
  deadTunnelsSet.delete(clean);
};

export const SchoolProvider = ({ children }) => {
  // Mavzu (Dark / Light)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('school_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('school_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('school_theme', 'light');
      }
    } catch (e) {
      console.warn('Theme effect error:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Autentifikatsiya tokeni generatori va tekshiruvchi
  const generateAuthToken = (user) => {
    try {
      const payload = {
        id: user.id,
        login: user.login,
        role: user.role,
        schoolId: user.schoolId || 'sch-1',
        createdAt: Date.now()
      };
      return 'authtok_' + btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    } catch (e) {
      return 'authtok_' + Date.now();
    }
  };

  const verifyAuthToken = (token) => {
    if (!token || typeof token !== 'string' || !token.startsWith('authtok_')) return null;
    try {
      const raw = decodeURIComponent(escape(atob(token.replace('authtok_', ''))));
      const parsed = JSON.parse(raw);
      if (parsed && parsed.login && parsed.id) {
        return parsed;
      }
    } catch (e) {}
    return null;
  };

  // Autentifikatsiya (Login holati) - Saytga kirganda token bilan tekshiradi, bo'lmasa login page ochiladi!
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const saved = typeof window !== 'undefined' ? localStorage.getItem('school_user') : null;
      if (token && saved) {
        const verified = verifyAuthToken(token);
        const parsed = JSON.parse(saved);
        if (verified && parsed && verified.login === parsed.login) {
          const isLocal = typeof window !== 'undefined' && (
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.startsWith('192.168.') ||
            window.location.hostname.startsWith('10.')
          );
          if (isLocal && (parsed.role === 'bigadmin' || parsed.login === 'bigadmin')) {
            try {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('school_user');
            } catch (e) {}
            return null;
          }
          return parsed;
        }
      }
    } catch (e) {}

    // Token bo'lmasa yoki yaroqsiz bo'lsa, login sahifasi ochiladi
    return null;
  });

  const [selectedTeacherId, setSelectedTeacherId] = useState(() => {
    try {
      const saved = localStorage.getItem('school_teacher_id');
      if (saved && saved !== 't-urazmetov') return saved;
      return '';
    } catch (e) {
      return '';
    }
  });

  const [inspectorName, setInspectorName] = useState(() => {
    try {
      const saved = localStorage.getItem('school_inspector_name');
      if (saved && !saved.includes('Qodirov Alijon')) return saved;
      return 'Navbatchi xodim';
    } catch (e) {
      return 'Navbatchi xodim';
    }
  });

  const filterRealTeachers = (list) => {
    if (!Array.isArray(list) || list.length === 0) return INITIAL_TEACHERS;
    const filtered = list.filter(t => 
      t && 
      t.id !== 't-00000558' && 
      t.id !== 't-00000706' && 
      t.faceId !== '00000558' && 
      t.faceId !== '00000706' &&
      !String(t.name || '').toLowerCase().includes('mamashev viktor') &&
      !String(t.name || '').toLowerCase().includes('maxmudjanov elbek')
    );
    const hasIzzat = filtered.some(t => t.id === 't-00000784' || String(t.name || '').toLowerCase().includes('urazmetov izzat'));
    if (!hasIzzat) {
      const izzatObj = INITIAL_TEACHERS.find(t => t.id === 't-00000784');
      if (izzatObj) return [izzatObj, ...filtered];
    }
    return filtered.length > 0 ? filtered : INITIAL_TEACHERS;
  };

  const filterRealStudents = (list) => {
    if (!Array.isArray(list)) return [];
    return list.filter(s => {
      if (!s) return false;
      const sId = String(s.studentId || s.id || s.employeeNo || '').replace(/^s-/, '').replace(/^0+/, '');
      const sName = String(s.fullName || s.name || '').toLowerCase().trim();
      // Urazmetov Izzat o'qituvchi, o'quvchilar ro'yxatida bo'lmasligi shart!
      if (sId === '784' || s.id === 's-00000784' || s.studentId === '00000784' || s.employeeNo === '00000784') return false;
      if (sName.includes('urazmetov izzat') || sName.includes("o'razmetov izzat") || sName.includes("o‘razmetov izzat")) return false;
      return true;
    });
  };

  const filterValidNotifications = (list) => {
    if (!Array.isArray(list)) return [];
    return list.filter(n => 
      n && 
      n.id !== 'notif-1' && 
      !String(n.title || '').includes('10-A sinf davomati topshirildi') &&
      !String(n.message || '').includes('Navbatchi 10-A sinf davomatini yubordi')
    );
  };

  // Asosiy ma'lumotlar - 100% DINAMIK: LocalStorage'da saqlanmaydi, doimo Supabase bulutidan olinadi
  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [teachers, setTeachersRaw] = useState(() => filterRealTeachers(INITIAL_TEACHERS));
  const setTeachers = (val) => setTeachersRaw(prev => filterRealTeachers(typeof val === 'function' ? val(prev) : val));
  const [students, setStudentsRaw] = useState(() => filterRealStudents(INITIAL_STUDENTS));
  const setStudents = (val) => setStudentsRaw(prev => filterRealStudents(typeof val === 'function' ? val(prev) : val));
  const [schedules, setSchedules] = useState(INITIAL_SCHEDULE);
  const [attendanceList, setAttendanceList] = useState(INITIAL_ATTENDANCE);
  const [teacherAttendance, setTeacherAttendance] = useState(INITIAL_TEACHER_ATTENDANCE);
  const [hourlyAttendance, setHourlyAttendance] = useState(INITIAL_HOURLY_ATTENDANCE);
  const [leadership, setLeadership] = useState(SCHOOL_LEADERSHIP);
  const [notifications, setNotificationsRaw] = useState(() => filterValidNotifications(INITIAL_NOTIFICATIONS));
  const setNotifications = (val) => setNotificationsRaw(prev => filterValidNotifications(typeof val === 'function' ? val(prev) : val));
  const [activeToast, setActiveToast] = useState(null);

  // Hikvision Face-ID qurilmasi holati (192.168.1.35)
  const [faceDevice, setFaceDevice] = useState({
    online: true,
    ip: '192.168.1.35',
    model: 'DS-K1T343MFWX',
    totalUsers: 737,
    lastSync: new Date().toISOString()
  });
  const [recentFaceScans, setRecentFaceScans] = useState([]);

  // 6 ta Turniket Kameralari (Foydalanuvchi tanlagan tartib: Chiqish 6, Chiqish 2, Chiqish 1, Kirish 3, Kirish 4, Kirish 5)
  const DEFAULT_CAMERAS = [
    { id: 'cam-6', ip: '192.168.1.13', type: 'out', name: 'Turniket 6 (Chiqish)', location: 'Chiqish yo\'lagi (3)', online: true },
    { id: 'cam-2', ip: '192.168.1.32', type: 'out', name: 'Turniket 2 (Chiqish)', location: 'Bosh kirish eshigi (2)', online: true },
    { id: 'cam-1', ip: '192.168.1.35', type: 'out', name: 'Turniket 1 (Chiqish)', location: 'Bosh kirish eshigi (1)', online: true },
    { id: 'cam-3', ip: '192.168.1.36', type: 'in', name: 'Turniket 3 (Kirish)', location: 'Bosh kirish eshigi (3)', online: true },
    { id: 'cam-4', ip: '192.168.1.86', type: 'in', name: 'Turniket 4 (Kirish)', location: 'Chiqish yo\'lagi (1)', online: true },
    { id: 'cam-5', ip: '192.168.1.33', type: 'in', name: 'Turniket 5 (Kirish)', location: 'Chiqish yo\'lagi (2)', online: true },
  ];

  const [cameras, setCameras] = useState(DEFAULT_CAMERAS);

  // Maktablar (Schools) ro'yxati va tanlangan maktab (BigAdmin uchun)
  const [schools, setSchools] = useState(() => {
    return getSafeStorage('school_list', INITIAL_SCHOOLS);
  });
  const [selectedSchoolId, setSelectedSchoolId] = useState(() => {
    try {
      const saved = localStorage.getItem('school_selected_id');
      if (saved) return saved;
    } catch (e) {}
    return 'sch-1';
  });

  const currentSchool = schools.find(s => s.id === selectedSchoolId) || schools[0] || null;

  const selectSchool = async (schoolId) => {
    // 1. Joriy maktab ma'lumotlarini o'sha maktab obyekti ichida xavfsiz saqlash
    setSchools(prev => prev.map(s => {
      if (s.id === selectedSchoolId) {
        return {
          ...s,
          students,
          classes,
          teachers,
          schedules,
          attendanceList,
          teacherAttendance,
          hourlyAttendance,
          turnstiles: cameras
        };
      }
      return s;
    }));

    setSelectedSchoolId(schoolId);
    try {
      localStorage.setItem('school_selected_id', schoolId);
    } catch (e) {}

    const found = schools.find(s => s.id === schoolId);
    if (found) {
      // 1b. Tanlangan maktab uchun tegishli Supabase klientini faollashtirish
      if (found.supabaseUrl && found.supabaseKey) {
        setActiveSupabaseClient(getSupabaseForSchool(found));
      } else if (found.id === 'sch-1') {
        setActiveSupabaseClient(supabase);
      } else {
        setActiveSupabaseClient(null);
      }

      const isFirstSchool = found.id === 'sch-1';
      // 2. Yangi maktab ma'lumotlarini yuklash (hech bir maktab boshqasi bilan aralashmaydi!)
      setClasses(Array.isArray(found.classes) && found.classes.length > 0 ? found.classes : (isFirstSchool ? INITIAL_CLASSES : []));
      setTeachers(Array.isArray(found.teachers) && found.teachers.length > 0 ? found.teachers : (isFirstSchool ? INITIAL_TEACHERS : []));
      setStudents(Array.isArray(found.students) && found.students.length > 0 ? found.students : (isFirstSchool ? INITIAL_STUDENTS : []));
      setSchedules(Array.isArray(found.schedules) && found.schedules.length > 0 ? found.schedules : (isFirstSchool ? INITIAL_SCHEDULE : []));
      setAttendanceList(Array.isArray(found.attendanceList) && found.attendanceList.length > 0 ? found.attendanceList : (isFirstSchool ? INITIAL_ATTENDANCE : []));
      setTeacherAttendance(Array.isArray(found.teacherAttendance) && found.teacherAttendance.length > 0 ? found.teacherAttendance : (isFirstSchool ? INITIAL_TEACHER_ATTENDANCE : []));
      setHourlyAttendance(found.hourlyAttendance || {});
      setCameras(Array.isArray(found.turnstiles) ? found.turnstiles : (isFirstSchool ? DEFAULT_CAMERAS : []));

      // 3. Agar server mavjud bo'lsa, o'sha maktabning yangi ma'lumotlarini alohida yuklab olish
      try {
        const targetUrl = getActiveBridgeUrl();
        if (targetUrl) {
          const res = await fetch(`${targetUrl}/api/school/data?schoolId=${schoolId}`, { signal: AbortSignal.timeout(3000) });
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              const d = json.data;
              if (Array.isArray(d.students)) setStudents(d.students);
              if (Array.isArray(d.classes)) setClasses(d.classes);
              if (Array.isArray(d.teachers)) setTeachers(d.teachers);
              if (Array.isArray(d.schedules)) setSchedules(d.schedules);
              if (Array.isArray(d.attendanceList)) setAttendanceList(d.attendanceList);
              if (Array.isArray(d.teacherAttendance)) setTeacherAttendance(d.teacherAttendance);
              if (d.hourlyAttendance) setHourlyAttendance(d.hourlyAttendance);
              if (Array.isArray(d.cameras) && d.cameras.length > 0) setCameras(d.cameras);
            }
          }
        }
      } catch (e) {}

      showToast('Maktab tanlandi', `${found.name} boshqaruviga o'tildi.`, 'info');
    }
  };

  // 6 ta kameraning oxirgi bulut kadrlari (Global rejim uchun)
  const [cameraLatestFrames, setCameraLatestFrames] = useState({});

  // Tarmoq holati (Lokal Wi-Fi vs Global Bulut)
  const isLocalHostEnv = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname.startsWith('192.168.') || 
    window.location.hostname.startsWith('10.')
  );
  const [networkMode, setNetworkMode] = useState(isLocalHostEnv ? 'detecting' : 'global');
  const [isLocalConnected, setIsLocalConnected] = useState(false);
  const [isSchoolLocalOnline, setIsSchoolLocalOnline] = useState(true);
  const [localBridgeInfo, setLocalBridgeInfo] = useState(null);
  const supabaseChannelRef = useRef(null);
  const isChannelSubscribedRef = useRef(false);
  const lastSavedFramesTime = useRef(0);
  const localFailuresCount = useRef(0);
  const manualRetryLocal = useRef(false);

  const currentUserRef = useRef(currentUser);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  const selectedSchoolIdRef = useRef(selectedSchoolId);
  useEffect(() => { selectedSchoolIdRef.current = selectedSchoolId; }, [selectedSchoolId]);

  const [globalStreamUrl, setGlobalStreamUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryBridge = urlParams.get('bridge') || urlParams.get('tunnel');
      if (queryBridge) {
        const clean = queryBridge.trim().replace(/\/+$/, '');
        if (!deadTunnelsSet.has(clean)) {
          try { localStorage.setItem('saved_bridge_url', clean); } catch (e) {}
          return clean;
        }
      }
      try {
        const saved = localStorage.getItem('saved_bridge_url');
        if (saved) {
          const cleanSaved = saved.trim().replace(/\/+$/, '');
          if (deadTunnelsSet.has(cleanSaved) || cleanSaved.includes('preparation-arkansas-roof-stored') || cleanSaved.includes('district-tel-rabbit-passport')) {
            localStorage.removeItem('saved_bridge_url');
            return '';
          }
          return cleanSaved;
        }
      } catch (e) {}
    }
    return '';
  });
  const globalStreamUrlRef = useRef(globalStreamUrl);

  const handleDeadTunnelEviction = (deadUrl) => {
    if (globalStreamUrlRef.current && globalStreamUrlRef.current.replace(/\/+$/, '') === deadUrl) {
      globalStreamUrlRef.current = '';
      setGlobalStreamUrl('');
      setIsSchoolLocalOnline(false);
    }
  };

  const syncFromBridge = async (targetUrl) => {
    if (!targetUrl || !targetUrl.startsWith('http')) return;
    const cleanUrl = targetUrl.replace(/\/+$/, '');
    if (deadTunnelsSet.has(cleanUrl)) return;
    try {
      const sRes = await fetch(`${cleanUrl}/api/school/data`, { signal: AbortSignal.timeout(3000) }).catch(() => null);
      if (sRes && sRes.ok) {
        markTunnelSuccess(cleanUrl);
        const sJson = await sRes.json().catch(() => null);
        if (sJson && sJson.data) {
          if (sJson.data.students && sJson.data.students.length > 0) setStudents(sJson.data.students);
          if (sJson.data.classes && sJson.data.classes.length > 0) setClasses(sJson.data.classes);
          if (sJson.data.teachers && sJson.data.teachers.length > 0) setTeachers(sJson.data.teachers);
          if (sJson.data.leadership && sJson.data.leadership.length > 0) setLeadership(sJson.data.leadership);
          if (sJson.data.schedules && sJson.data.schedules.length > 0) setSchedules(sJson.data.schedules);
          if (sJson.data.attendanceList) setAttendanceList(sJson.data.attendanceList);
          if (sJson.data.teacherAttendance) setTeacherAttendance(sJson.data.teacherAttendance);
          if (sJson.data.hourlyAttendance) setHourlyAttendance(sJson.data.hourlyAttendance);
        }
      } else {
        markTunnelFailure(cleanUrl, handleDeadTunnelEviction);
      }

      if (deadTunnelsSet.has(cleanUrl)) return;

      const evRes = await fetch(`${cleanUrl}/api/device/events`, { signal: AbortSignal.timeout(3000) }).catch(() => null);
      if (evRes && evRes.ok) {
        markTunnelSuccess(cleanUrl);
        const evJson = await evRes.json().catch(() => null);
        if (evJson && Array.isArray(evJson.data) && evJson.data.length > 0) {
          setRecentFaceScans(evJson.data);
        }
      }
      setIsSchoolLocalOnline(true);
    } catch (e) {
      markTunnelFailure(cleanUrl, handleDeadTunnelEviction);
    }
  };

  const updateGlobalStreamUrl = (url, syncToCloud = false) => {
    const clean = (url || '').trim().replace(/\/+$/, '');
    if (!clean) {
      globalStreamUrlRef.current = '';
      setGlobalStreamUrl('');
      return;
    }
    if (deadTunnelsSet.has(clean)) return;
    if (globalStreamUrlRef.current === clean && !syncToCloud) return;
    globalStreamUrlRef.current = clean;
    setGlobalStreamUrl(clean);
    if (typeof window !== 'undefined' && clean) {
      try { localStorage.setItem('saved_bridge_url', clean); } catch (e) {}
    }
    syncFromBridge(clean);
    // Faqat foydalanuvchi interfeysdan qo'lda o'zgartirganda Supabase ga saqlash (cheksiz Realtime siklidan himoya)
    if (syncToCloud) {
      saveModuleToSupabase('global_stream_url', clean).catch(() => {});
    }
  };

  const setManualGlobalStreamUrl = (url) => {
    updateGlobalStreamUrl(url, true);
  };

  // Relay (ntfy.sh) orqali maktabning eng so'nggi jonli tunnel manzilini avtomatik aniqlash (Vercel va mobil qurilmalar uchun)
  useEffect(() => {
    if (isLocalHostEnv) return;
    const fetchLatestBridge = async () => {
      try {
        const res = await fetch('https://ntfy.sh/maktab_bridge_alibek517/json?poll=1', { signal: AbortSignal.timeout(4000) }).catch(() => null);
        if (res && res.ok) {
          const text = await res.text().catch(() => '');
          const lines = text.trim().split('\n');
          for (let i = lines.length - 1; i >= 0; i--) {
            try {
              const parsed = JSON.parse(lines[i]);
              if (parsed.message && parsed.message.startsWith('http') && parsed.message.includes('trycloudflare.com')) {
                const candidate = parsed.message.trim().replace(/\/+$/, '');
                if (!deadTunnelsSet.has(candidate)) {
                  updateGlobalStreamUrl(candidate);
                  break;
                }
              }
            } catch (e) {}
          }
        }
      } catch (e) {}
    };
    fetchLatestBridge();
    const interval = setInterval(fetchLatestBridge, 15000);
    return () => clearInterval(interval);
  }, [isLocalHostEnv]);

  // URL Routing tizimi: path va mos rol/tab tahlili
  const parsePath = (rawPath) => {
    let p = (rawPath || '/login').toLowerCase().trim();
    if (!p.startsWith('/')) p = '/' + p;
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);

    if (p === '/login' || p === '/kirish' || p === '/auth') {
      return { path: '/login', role: null, tab: 'login' };
    }
    if (p === '/bigadmin' || p === '/schools' || p === '/superadmin') {
      return { path: '/bigadmin', role: 'bigadmin', tab: 'bigadmin' };
    }
    if (p === '/students' || p === '/directory' || p === '/oquvchilar') {
      return { path: '/students', role: 'director', tab: 'directory' };
    }
    if (p === '/teachers' || p === '/settings' || p === '/oqituvchilar' || p === '/darslar') {
      return { path: '/teachers', role: 'director', tab: 'settings' };
    }
    if (p === '/teacher-attendance' || p === '/oqituvchilar-davomati' || p === '/teacherattendance') {
      return { path: '/teacher-attendance', role: 'director', tab: 'teacher_attendance' };
    }
    if (p === '/duty' || p === '/inspector' || p === '/navbatchi') {
      return { path: '/duty', role: 'inspector', tab: 'main' };
    }
    if (p === '/class-teacher' || p === '/teacher' || p === '/sinfraxbari') {
      return { path: '/class-teacher', role: 'class_teacher', tab: 'main' };
    }
    if (p === '/subject-teacher' || p === '/journal' || p === '/fanoqituvchisi') {
      return { path: '/subject-teacher', role: 'subject_teacher', tab: 'main' };
    }
    if (p === '/monitor' || p === '/foye' || p === '/tablo') {
      return { path: '/monitor', role: 'monitor', tab: 'main' };
    }
    if (p === '/director' || p === '/boshqaruv' || p === '/dashboard') {
      return { path: '/director', role: 'director', tab: 'main' };
    }
    return { path: '/login', role: null, tab: 'login' };
  };

  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      const init = parsePath(window.location.pathname);
      return init.path;
    }
    return '/login';
  });

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const init = parsePath(window.location.pathname);
      return init.tab;
    }
    return 'main';
  });

  const navigateTo = (targetPath) => {
    // Agar BigAdmin tizimda bo'lsa, boshqa sahifalarga o'tish taqiqlanadi
    if (currentUserRef.current?.role === 'bigadmin' || currentUserRef.current?.isBigAdmin) {
      targetPath = '/bigadmin';
    }
    const route = parsePath(targetPath);
    setActiveTab(route.tab);
    setCurrentPath(route.path);

    if (typeof window !== 'undefined' && window.location.pathname !== route.path) {
      window.history.pushState({ path: route.path }, '', route.path);
    }

    if (currentUserRef.current?.role !== 'bigadmin' && route.role && currentUser?.role !== route.role) {
      quickSwitchRole(route.role, false, true);
    }
  };

  const [isInitialized, setIsInitialized] = useState(false);
  const [localWarningSnoozedUntil, setLocalWarningSnoozedUntil] = useState(() => {
    try {
      const saved = localStorage.getItem('school_local_warning_snooze');
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val > Date.now()) return val;
      }
    } catch (e) {}
    return null;
  });

  const dismissLocalWarning = () => {
    const snoozeTime = Date.now() + 10 * 60 * 1000; // 10 daqiqa bezovta qilmaydi
    setLocalWarningSnoozedUntil(snoozeTime);
    try {
      localStorage.setItem('school_local_warning_snooze', snoozeTime.toString());
    } catch (e) {}
  };

  // Brauzer tarixi (Back / Forward) va boshlang'ich URL ni kuzatish
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const route = parsePath(window.location.pathname);
      setCurrentPath(route.path);
      setActiveTab(route.tab);
      quickSwitchRole(route.role, false, true);
    };

    window.addEventListener('popstate', handlePopState);

    // Dastlabki yuklanganda mavjud URL ga moslash
    const rawP = window.location.pathname;
    let targetP = rawP;
    if (!currentUserRef.current) {
      targetP = '/login';
    } else if (rawP === '/' || rawP === '/login') {
      targetP = currentUserRef.current.role === 'bigadmin' ? '/bigadmin' : '/director';
    }
    const initialRoute = parsePath(targetP);
    if (window.location.pathname !== initialRoute.path) {
      window.history.replaceState({ path: initialRoute.path }, '', initialRoute.path);
    }
    setCurrentPath(initialRoute.path);
    setActiveTab(initialRoute.tab);
    if (initialRoute.role && initialRoute.role !== 'director') {
      quickSwitchRole(initialRoute.role, false, true);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // LocalStorage keshlarini tozalash va faqat foydalanuvchi sessiyasini saqlash (100% dinamik bulut rejimi)
  useEffect(() => {
    const keysToPurge = [
      'school_classes',
      'school_teachers',
      'school_students',
      'school_schedules',
      'school_attendance',
      'school_notifications',
      'school_teacher_attendance',
      'school_hourly_attendance',
      'school_leadership',
      'school_cameras'
    ];
    keysToPurge.forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });
  }, []);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('school_user', JSON.stringify(currentUser));
        if (!localStorage.getItem('auth_token')) {
          localStorage.setItem('auth_token', generateAuthToken(currentUser));
        }
      } else {
        localStorage.removeItem('school_user');
        localStorage.removeItem('auth_token');
      }
      localStorage.setItem('school_teacher_id', selectedTeacherId);
      localStorage.setItem('school_inspector_name', inspectorName);
    } catch (e) {}
  }, [currentUser, selectedTeacherId, inspectorName]);

  // O'qituvchi holatini o'zgartirish (maktab ichida / tashqarida)
  const toggleTeacherPresence = (teacherId) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTeacherAttendance(prev => {
      const existing = prev.find(t => t.teacherId === teacherId);
      if (existing) {
        const newStatus = existing.status === 'present' ? 'absent' : 'present';
        return prev.map(t => t.teacherId === teacherId ? {
          ...t,
          status: newStatus,
          inTime: newStatus === 'present' ? currentTime : t.inTime,
          outTime: newStatus === 'absent' ? currentTime : null
        } : t);
      } else {
        return [...prev, { teacherId, status: 'present', inTime: currentTime, outTime: null }];
      }
    });
  };

  // Dars soati bo'yicha jonli yo'qlama yangilash
  const recordLessonAttendance = (scheduleId, presentCount, totalCount, subject, teacher, order) => {
    setHourlyAttendance(prev => ({
      ...prev,
      [scheduleId]: {
        presentCount,
        totalCount,
        subject,
        teacher,
        order,
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    }));
  };

  // Toast
  const showToast = (title, message, type = 'info') => {
    setActiveToast({ title, message, type, id: Date.now() });
    setTimeout(() => {
      setActiveToast(null);
    }, 3500);
  };

  // Face-ID orqali kelgan shaxsni avtomatik davomatga yozish
  const handleIncomingFaceScan = (scan) => {
    if (!scan) return;

    const getTodayDateStr = () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const scanName = (scan.name || '').toLowerCase().trim();
    const scanEmpNo = (scan.employeeNo || '').trim();
    const cleanScanEmp = scanEmpNo.replace(/^s-/, '').replace(/^0+/, '');
    const isExit = scan.direction === 'out';

    // 1. O'qituvchilar orasidan qidirish (O'qituvchilar birinchi navbatda tekshiriladi)
    const matchedTeacher = teachers.find(t => {
      const tName = (t.name || '').toLowerCase().trim();
      const tEmp = String(t.faceId || t.id || '').replace(/^t-/, '').replace(/^0+/, '');
      return (
        (cleanScanEmp && tEmp && cleanScanEmp === tEmp) ||
        tName === scanName ||
        (scanEmpNo && (t.id === scanEmpNo || t.id === `t-${scanEmpNo}` || t.faceId === scanEmpNo)) ||
        (tName.length > 5 && (scanName.includes(tName) || tName.includes(scanName)))
      );
    });

    // 2. O'quvchilar orasidan qidirish
    const matchedStudent = !matchedTeacher ? students.find(s => {
      const sName = (s.fullName || s.name || '').toLowerCase().trim();
      const sEmp = String(s.studentId || s.employeeNo || s.id || '').replace(/^s-/, '').replace(/^0+/, '');
      return (
        (cleanScanEmp && sEmp && cleanScanEmp === sEmp) ||
        sName === scanName ||
        (scanEmpNo && (s.studentId === scanEmpNo || s.id === scanEmpNo || s.faceId === scanEmpNo)) ||
        (sName.length > 5 && (scanName.includes(sName) || sName.includes(scanName)))
      );
    }) : null;

    // Scan obyektidagi ismni rasmiy bazadagi to'liq ism bilan aniqlash
    const officialName = matchedStudent 
      ? (matchedStudent.fullName || matchedStudent.name) 
      : (matchedTeacher ? matchedTeacher.name : scan.name);

    const resolvedScan = {
      ...scan,
      name: officialName || scan.name
    };

    setRecentFaceScans(prev => {
      const filtered = prev.filter(s => s.serialNo !== resolvedScan.serialNo);
      return [resolvedScan, ...filtered].slice(0, 3000);
    });

    if (matchedTeacher) {
      setTeacherAttendance(prev => {
        const todayDate = getTodayDateStr();
        const curTime = scan.timeFormatted || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const existing = prev.find(t => t.teacherId === matchedTeacher.id && (t.date === todayDate || !t.date));
        let updated;
        if (existing) {
          updated = prev.map(t => (t.teacherId === matchedTeacher.id && (t.date === todayDate || !t.date)) ? {
            ...t,
            date: todayDate,
            status: isExit ? 'absent' : 'present',
            inTime: isExit ? (t.inTime || curTime) : curTime,
            outTime: isExit ? curTime : t.outTime,
            lastDirection: isExit ? 'out' : 'in',
            lastSeenTime: curTime
          } : t);
        } else {
          updated = [...prev, {
            teacherId: matchedTeacher.id,
            date: todayDate,
            status: isExit ? 'absent' : 'present',
            inTime: isExit ? null : curTime,
            outTime: isExit ? curTime : null,
            lastDirection: isExit ? 'out' : 'in',
            lastSeenTime: curTime
          }];
        }
        saveModuleToSupabase('teacherAttendance', updated).catch(() => {});
        saveToServer('teacherAttendance', updated);
        return updated;
      });

      if (isExit) {
        showToast(
          '🚶 O\'qituvchi Chiqdi',
          `🔴 ${matchedTeacher.name} maktabdan chiqdi (${scan.timeFormatted})`,
          'info'
        );
      } else {
        showToast(
          '🟢 O\'qituvchi Kirdi',
          `🟢 ${matchedTeacher.name} maktabga kirdi (${scan.timeFormatted})`,
          'success'
        );
      }
      return;
    }

    if (matchedStudent) {
      setAttendanceList(prev => {
        const todayDate = getTodayDateStr();
        const attIndex = prev.findIndex(a => a.classId === matchedStudent.classId && a.date === todayDate);
        let updated;
        if (attIndex >= 0) {
          const currentAtt = { ...prev[attIndex] };
          const recIndex = currentAtt.records.findIndex(r => r.studentId === matchedStudent.id);
          if (recIndex >= 0) {
            currentAtt.records[recIndex] = {
              ...currentAtt.records[recIndex],
              status: isExit ? 'exited' : 'present',
              inTime: isExit ? (currentAtt.records[recIndex].inTime || scan.timeFormatted) : scan.timeFormatted,
              outTime: isExit ? scan.timeFormatted : currentAtt.records[recIndex].outTime,
              lastDirection: isExit ? 'out' : 'in',
              lastSeenTime: scan.timeFormatted
            };
          } else {
            currentAtt.records.push({
              studentId: matchedStudent.id,
              status: isExit ? 'exited' : 'present',
              inTime: isExit ? null : scan.timeFormatted,
              outTime: isExit ? scan.timeFormatted : null,
              lastDirection: isExit ? 'out' : 'in',
              lastSeenTime: scan.timeFormatted
            });
          }
          updated = [...prev];
          updated[attIndex] = currentAtt;
        } else {
          updated = [
            ...prev,
            {
              id: 'att-face-' + Date.now(),
              date: todayDate,
              classId: matchedStudent.classId,
              inspectorName: `Turniket: ${scan.cameraName || 'Face-ID'}`,
              timestamp: scan.timeFormatted,
              records: [
                {
                  studentId: matchedStudent.id,
                  status: isExit ? 'exited' : 'present',
                  inTime: isExit ? null : scan.timeFormatted,
                  outTime: isExit ? scan.timeFormatted : null,
                  lastDirection: isExit ? 'out' : 'in',
                  lastSeenTime: scan.timeFormatted
                }
              ]
            }
          ];
        }
        saveModuleToSupabase('attendanceList', updated).catch(() => {});
        saveToServer('attendanceList', updated);
        return updated;
      });

      const studentDisplayName = matchedStudent.fullName || matchedStudent.name;
      if (isExit) {
        showToast(
          '🚶 Chiqish Turniketi',
          `🔴 ${studentDisplayName} (${classes.find(c => c.id === matchedStudent.classId)?.name || 'O\'quvchi'}) maktabdan chiqdi (${scan.timeFormatted})`,
          'info'
        );
      } else {
        showToast(
          '🟢 Kirish Turniketi',
          `🟢 ${studentDisplayName} (${classes.find(c => c.id === matchedStudent.classId)?.name || 'O\'quvchi'}) maktabga kirdi (${scan.timeFormatted})`,
          'success'
        );
      }
      return;
    }

    // Tizimda nomi topilmagan bo'lsa ham foye tablosi uchun xabar berish
    showToast(
      isExit ? 'Turniket Chiqish' : 'Turniket Kirish',
      `${isExit ? '🔴' : '🟢'} ${scan.name} (${scan.timeFormatted}) - ${scan.cameraName || 'Turniket'}`,
      'info'
    );
  };

  // Hikvision Ko'prik serveri bilan avtomatik bog'lanish (Port 5001 yoki Cloudflare tunnel)
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const bridgeHost = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
  const isCloudflareTunnel = typeof window !== 'undefined' && window.location.hostname.includes('trycloudflare.com');
  const validGlobalStream = (globalStreamUrl && globalStreamUrl.startsWith('http') && !deadTunnelsSet.has(globalStreamUrl.replace(/\/+$/, ''))) ? globalStreamUrl : '';
  const BRIDGE_API = (isLocalHostEnv && !isHttps) 
    ? `http://${bridgeHost}:5001` 
    : (isCloudflareTunnel ? (typeof window !== 'undefined' ? window.location.origin : '') : validGlobalStream);

  const getActiveBridgeUrl = () => {
    if (BRIDGE_API && !deadTunnelsSet.has(BRIDGE_API.replace(/\/+$/, ''))) return BRIDGE_API;
    if (validGlobalStream) return validGlobalStream;
    return '';
  };

  // Serverga va Supabase bulut bazasiga markaziy saqlash (Maktablar bo'yicha qat'iy izolyatsiya qilingan!)
  const saveToServer = async (key, data) => {
    // 1. Tanlangan maktab obyekti ichida darhol yangilash (aralashib ketmaydi!)
    setSchools(prev => prev.map(s => {
      if (s.id === selectedSchoolId) {
        return { ...s, [key]: data };
      }
      return s;
    }));

    // 2. Supabase bulut bazasiga saqlash (agar kvota tugamagan bo'lsa)
    if (!isQuotaExceeded()) {
      saveModuleToSupabase(key, data).catch(() => {});
    }

    // 3. Faol ko'prik serveriga aynan o'sha maktab ID si bilan yuborish
    const targetUrl = getActiveBridgeUrl();
    if (targetUrl) {
      try {
        fetch(`${targetUrl}/api/school/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schoolId: selectedSchoolId, key, data })
        }).catch(() => {});
      } catch (e) {}
    }
  };

  // Butun maktab ma'lumotlarini bir martada Supabase bulutiga to'liq yuklash (Migratsiya)
  const syncAllToSupabase = async () => {
    showToast('Bulutga yuklanmoqda', 'Barcha 737 o\'quvchi va ma\'lumotlar Supabase bulutiga yuklanmoqda...', 'info');
    let successCount = 0;
    try {
      if (students && students.length > 0) {
        const ok = await saveModuleToSupabase('students', students);
        if (ok) successCount++;
      }
      if (classes && classes.length > 0) {
        const ok = await saveModuleToSupabase('classes', classes);
        if (ok) successCount++;
      }
      if (teachers && teachers.length > 0) {
        const ok = await saveModuleToSupabase('teachers', teachers);
        if (ok) successCount++;
      }
      if (schedules && schedules.length > 0) {
        const ok = await saveModuleToSupabase('schedules', schedules);
        if (ok) successCount++;
      }
      if (attendanceList) {
        const ok = await saveModuleToSupabase('attendanceList', attendanceList);
        if (ok) successCount++;
      }
      if (teacherAttendance) {
        const ok = await saveModuleToSupabase('teacherAttendance', teacherAttendance);
        if (ok) successCount++;
      }
      if (hourlyAttendance) {
        const ok = await saveModuleToSupabase('hourlyAttendance', hourlyAttendance);
        if (ok) successCount++;
      }
      if (cameras && cameras.length > 0) {
        const ok = await saveCamerasToSupabase(cameras);
        if (ok) successCount++;
      }

      if (successCount >= 3) {
        showToast('Supabase ga Yuklandi!', `Barcha ma'lumotlar Supabase bulut bazasiga muvaffaqiyatli o'tkazildi! (${successCount} ta modul)`, 'success');
        return true;
      } else {
        showToast('Diqqat', 'Supabase ga yuklashda xatolik yuz berdi. Iltimos SQL skript bajarilganini tekshiring.', 'warning');
        return false;
      }
    } catch (err) {
      showToast('Xatolik', 'Supabase bilan bog\'lanishda xato: ' + err.message, 'error');
      return false;
    }
  };

  useEffect(() => {
    let es = null;
    let supabaseChannel = null;

    // 1. Dastlabki yuklash: Avval Supabase Bulutidan, keyin Serverdan tekshirish
    const loadGlobalData = async () => {
      try {
        // A. Supabase bulutidan yuklash
        const cloudData = await loadAllSchoolDataFromSupabase();
        if (cloudData) {
          if (cloudData.students && cloudData.students.length > 0) {
            const cleanStudents = filterRealStudents(cloudData.students);
            setStudents(cleanStudents);
            if (cleanStudents.length !== cloudData.students.length) {
              saveModuleToSupabase('students', cleanStudents).catch(() => {});
            }
          }
          if (cloudData.classes && cloudData.classes.length > 0) setClasses(cloudData.classes);
          if (cloudData.teachers && cloudData.teachers.length > 0) {
            const cleanTeachers = filterRealTeachers(cloudData.teachers);
            setTeachers(cleanTeachers);
            if (cleanTeachers.length !== cloudData.teachers.length) {
              saveModuleToSupabase('teachers', cleanTeachers).catch(() => {});
            }
          }
          if (cloudData.leadership && Array.isArray(cloudData.leadership) && cloudData.leadership.length > 0) setLeadership(cloudData.leadership);
          if (cloudData.schedules && cloudData.schedules.length > 0) setSchedules(cloudData.schedules);
          if (cloudData.attendanceList) setAttendanceList(cloudData.attendanceList);
          if (cloudData.teacherAttendance) setTeacherAttendance(cloudData.teacherAttendance);
          if (cloudData.hourlyAttendance) setHourlyAttendance(cloudData.hourlyAttendance);
          if (cloudData.notifications && Array.isArray(cloudData.notifications)) {
            const cleanNotifs = filterValidNotifications(cloudData.notifications);
            setNotifications(cleanNotifs);
            if (cleanNotifs.length !== cloudData.notifications.length) {
              saveModuleToSupabase('notifications', cleanNotifs).catch(() => {});
            }
          }
          if (cloudData.cameras && Array.isArray(cloudData.cameras) && cloudData.cameras.length >= 6) {
            setCameras(cloudData.cameras);
          }
          if (cloudData.global_stream_url) {
            const gUrl = typeof cloudData.global_stream_url === 'string' ? cloudData.global_stream_url : cloudData.global_stream_url?.url;
            if (gUrl && !isLocalHostEnv) updateGlobalStreamUrl(gUrl);
          }
          if (cloudData.camera_latest_frames && typeof cloudData.camera_latest_frames === 'object') {
            setCameraLatestFrames(cloudData.camera_latest_frames);
          }
          console.log('[SUPABASE] Barcha ma\'lumotlar Supabase bulut bazasidan yuklandi.');
        }

        if (!cloudData?.cameras || !Array.isArray(cloudData.cameras) || cloudData.cameras.length < 6) {
          const cloudCameras = await loadCamerasFromSupabase();
          if (cloudCameras && cloudCameras.length > 0) {
            setCameras(prev => prev.map(c => {
              const fresh = cloudCameras.find(x => x.id === c.id || x.ip === c.ip);
              return fresh ? { ...c, ...fresh } : c;
            }));
          }
        }

        // Bugungi barcha yuz skanlarini Supabase dan yuklab olish
        const todayDateStr = (() => {
          const d = new Date();
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        })();
        const cloudScans = await loadTodayFaceScansFromSupabase(todayDateStr);
        if (cloudScans && cloudScans.length > 0) {
          setRecentFaceScans(prev => {
            const combined = [...prev];
            cloudScans.forEach(cs => {
              if (!combined.some(x => x.serialNo === cs.serialNo && x.cameraIp === cs.cameraIp)) {
                combined.push(cs);
              }
            });
            return combined.slice(0, 3000);
          });
        }

        // Supabase dan maktabning oxirgi lokal heartbeat holatini tekshirish
        const localStatus = await getLocalStatusFromSupabase();
        if (localStatus && localStatus.online) {
          const isFresh = (Date.now() - (localStatus.timestamp || 0)) < 45000;
          setIsSchoolLocalOnline(isFresh);
        }

        // B. Mahalliy ko'prik serveridan ham tekshirish (agar Supabase bo'sh bo'lsa)
        if (!cloudData || !cloudData.students || cloudData.students.length === 0) {
          const res = await fetch(`${BRIDGE_API}/api/school/data`).catch(() => null);
          if (res && res.ok) {
            const json = await res.json();
            if (json.data) {
            if (!cloudData?.students && json.data.students && json.data.students.length > 0) {
              setStudents(json.data.students);
              saveModuleToSupabase('students', json.data.students);
            }
            if (!cloudData?.classes && json.data.classes && json.data.classes.length > 0) {
              setClasses(json.data.classes);
              saveModuleToSupabase('classes', json.data.classes);
            }
            if (!cloudData?.teachers && json.data.teachers && json.data.teachers.length > 0) {
              setTeachers(json.data.teachers);
              saveModuleToSupabase('teachers', json.data.teachers);
            }
            if (!cloudData?.leadership && json.data.leadership && json.data.leadership.length > 0) {
              setLeadership(json.data.leadership);
              saveModuleToSupabase('leadership', json.data.leadership);
            }
            if (!cloudData?.schedules && json.data.schedules && json.data.schedules.length > 0) {
              setSchedules(json.data.schedules);
              saveModuleToSupabase('schedules', json.data.schedules);
            }
            if (!cloudData?.attendanceList && json.data.attendanceList) {
              setAttendanceList(json.data.attendanceList);
              saveModuleToSupabase('attendanceList', json.data.attendanceList);
            }
            }
          }
        }
      } catch (err) {
        console.warn('Ma\'lumotlarni yuklashda ogohlantirish:', err);
      }
    };

    loadGlobalData();

    // 2. Supabase Realtime: Barcha kompyuterlar va qurilmalar uchun jonli sinxronizatsiya
    if (!isQuotaExceeded()) {
      try {
        supabaseChannel = supabase
          .channel('school_global_realtime');
        supabaseChannelRef.current = supabaseChannel;

        supabaseChannel
          .on('postgres_changes', { event: '*', schema: 'public', table: 'school_data' }, (payload) => {
            if (payload.new && payload.new.key) {
              const { key, data } = payload.new;
              if (key === 'local_status' && data) {
                const isFresh = data.online && (Date.now() - (data.timestamp || 0) < 45000);
                setIsSchoolLocalOnline(isFresh);
              }
              else if (key === 'students' && Array.isArray(data)) setStudents(data);
              else if (key === 'classes' && Array.isArray(data)) setClasses(data);
              else if (key === 'teachers' && Array.isArray(data)) setTeachers(data);
              else if (key === 'schedules' && Array.isArray(data)) setSchedules(data);
              else if (key === 'attendanceList' && Array.isArray(data)) setAttendanceList(data);
              else if (key === 'teacherAttendance' && Array.isArray(data)) setTeacherAttendance(data);
              else if (key === 'hourlyAttendance') setHourlyAttendance(data);
              else if (key === 'notifications' && Array.isArray(data)) setNotifications(data);
              else if (key === 'global_stream_url') {
                const gUrl = typeof data === 'string' ? data : data?.url;
                if (gUrl && !isLocalHostEnv) updateGlobalStreamUrl(gUrl);
              }
              else if (key === 'camera_latest_frames' && data && typeof data === 'object') {
                setCameraLatestFrames(data);
              }
              else if (key === 'cameras' && Array.isArray(data) && data.length >= 6) {
                setCameras(data);
              }
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'camera_settings' }, () => {
            loadCamerasFromSupabase().then(cams => {
              if (cams && cams.length > 0) {
                setCameras(prev => prev.map(c => {
                  const fresh = cams.find(x => x.id === c.id || x.ip === c.ip);
                  return fresh ? { ...c, ...fresh } : c;
                }));
              }
            });
          })
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'face_scans' }, (payload) => {
            if (payload.new) {
              const scan = {
                id: `scan-${payload.new.id}`,
                employeeNo: payload.new.employee_no,
                name: payload.new.name,
                cameraName: payload.new.camera_name,
                cameraIp: payload.new.camera_ip,
                direction: payload.new.direction,
                timeFormatted: payload.new.time_formatted,
                timestamp: payload.new.created_at
              };
              handleIncomingFaceScan(scan);
            }
          })
          .on('broadcast', { event: 'camera_frame' }, ({ payload }) => {
            if (payload && payload.ip && payload.frame) {
              setCameraLatestFrames(prev => ({
                ...prev,
                [payload.ip]: payload.frame
              }));
              setIsSchoolLocalOnline(true);
            }
          })
          .on('broadcast', { event: 'local_heartbeat' }, ({ payload }) => {
            if (payload) {
              setIsSchoolLocalOnline(true);
              setLocalBridgeInfo(payload);
            }
          })
          .on('broadcast', { event: 'live_face_scan' }, ({ payload }) => {
            if (payload) {
              handleIncomingFaceScan(payload);
            }
          })
          .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
              isChannelSubscribedRef.current = true;
              console.log('[SUPABASE REALTIME] Jonli kanal ulandi.');
            } else {
              isChannelSubscribedRef.current = false;
              if (status === 'CHANNEL_ERROR') {
                if (err && (String(err).includes('402') || String(err.message || '').includes('402'))) {
                  checkQuota({ status: 402 });
                  try { supabase.removeAllChannels(); } catch (e) {}
                }
              }
            }
          });
      } catch (e) {}
    }

    // 3. Kameralar holati va lokal/global tarmoqni tekshirib borish
    const connectSSE = () => {
      if (es || typeof window === 'undefined' || !window.EventSource) return;
      try {
        es = new EventSource(`${BRIDGE_API}/api/device/stream`);
        es.addEventListener('scan', (e) => {
          try {
            const scan = JSON.parse(e.data);
            handleIncomingFaceScan(scan);
          } catch (e) {}
        });
        es.addEventListener('connected', (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.device) setFaceDevice(data.device);
            if (data.cameras) setCameras(data.cameras);
            if (data.globalStreamUrl && !isLocalHostEnv) updateGlobalStreamUrl(data.globalStreamUrl);
          } catch (e) {}
        });
        es.addEventListener('global_stream_url', (e) => {
          try {
            const data = typeof e.data === 'string' && e.data.startsWith('{') ? JSON.parse(e.data) : { url: e.data };
            if (data.url && !isLocalHostEnv) updateGlobalStreamUrl(data.url);
          } catch (e) {}
        });
        es.addEventListener('school_data_sync', (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.students && data.students.length > 0) setStudents(data.students);
            if (data.classes && data.classes.length > 0) setClasses(data.classes);
            if (data.teachers && data.teachers.length > 0) setTeachers(data.teachers);
            if (data.schedules && data.schedules.length > 0) setSchedules(data.schedules);
            if (data.attendanceList) setAttendanceList(data.attendanceList);
            if (data.teacherAttendance) setTeacherAttendance(data.teacherAttendance);
            if (data.hourlyAttendance) setHourlyAttendance(data.hourlyAttendance);
          } catch (err) {}
        });
        es.addEventListener('student_updated', (e) => {
          try {
            const { studentId, updatedData } = JSON.parse(e.data);
            setStudents(prev => prev.map(s => (s.id === studentId || s.studentId === studentId) ? { ...s, ...updatedData } : s));
          } catch (err) {}
        });
        es.addEventListener('cameras_updated', (e) => {
          try {
            const updatedCameras = JSON.parse(e.data);
            if (Array.isArray(updatedCameras)) setCameras(updatedCameras);
          } catch (err) {}
        });
        es.addEventListener('schools_updated', (e) => {
          try {
            const updatedSchools = JSON.parse(e.data);
            if (Array.isArray(updatedSchools)) {
              setSchools(updatedSchools);
              try { localStorage.setItem('school_list', JSON.stringify(updatedSchools)); } catch (err) {}
            }
          } catch (err) {}
        });
        es.addEventListener('school_subscription_updated', (e) => {
          try {
            const payload = JSON.parse(e.data);
            if (Array.isArray(payload.schools)) {
              setSchools(payload.schools);
              try { localStorage.setItem('school_list', JSON.stringify(payload.schools)); } catch (err) {}
            }
            // Agar joriy kirib turgan foydalanuvchi muzlatilgan maktabga tegishli bo'lsa, zudlik bilan chiqarish!
            if (currentUserRef.current && currentUserRef.current.role !== 'bigadmin') {
              const mySchId = currentUserRef.current.schoolId || selectedSchoolIdRef.current;
              if (payload.schoolId === mySchId) {
                const isNowFrozen = Boolean(payload.isFrozen);
                const isExpired = payload.subscriptionEnd && (new Date(payload.subscriptionEnd).getTime() < new Date().setHours(0,0,0,0));
                if (isNowFrozen || isExpired) {
                  logout();
                  showToast(
                    'Faoliyat to\'xtatildi',
                    isNowFrozen 
                      ? `Maktab bosh administrator tomonidan muzlatildi (${payload.freezeReason || "To'xtatilgan"}). Tizimdan chiqarildingiz.`
                      : "Ushbu maktab uchun obuna muddati tugaganligi sababli tizimdan chiqarildingiz.",
                    'error'
                  );
                }
              }
            }
          } catch (err) {}
        });
        es.onerror = () => {
          if (es) {
            try { es.close(); } catch (err) {}
            es = null;
          }
        };
      } catch (err) {}
    };

    const pollDevice = async () => {
      let localReachable = false;
      const activeBridge = (BRIDGE_API && !deadTunnelsSet.has(BRIDGE_API.replace(/\/+$/, ''))) ? BRIDGE_API : '';
      const shouldProbeLocal = Boolean(activeBridge) && (localFailuresCount.current === 0 || manualRetryLocal.current || (localFailuresCount.current % 3 === 0));
      manualRetryLocal.current = false;

      if (shouldProbeLocal) {
        try {
          const res = await fetch(`${activeBridge}/api/device/status`, { signal: AbortSignal.timeout(3000) }).catch(() => null);
          if (res && res.ok) {
            markTunnelSuccess(activeBridge);
            const json = await res.json().catch(() => null);
            if (json) {
              if (json.data) setFaceDevice(json.data);
              if (json.cameras) setCameras(json.cameras);
              if (json.globalStreamUrl) updateGlobalStreamUrl(json.globalStreamUrl);
              localReachable = true;
              localFailuresCount.current = 0;
              setIsLocalConnected(true);
              setIsSchoolLocalOnline(true);
              setNetworkMode('local');
            }
          } else {
            markTunnelFailure(activeBridge, handleDeadTunnelEviction);
          }
        } catch (err) {
          markTunnelFailure(activeBridge, handleDeadTunnelEviction);
        }

        if (!localReachable) {
          localFailuresCount.current += 1;
        }
      }

      if (localReachable) {
        connectSSE();
        // Ushbu qurilma lokalga ulangan - u Global va Localni bir-biriga bog'lovchi faol ko'prikdir
        const hbInfo = {
          bridgedBy: currentUser?.fullName || currentUser?.name || 'Lokal Maktab Profili',
          role: currentUser?.role || 'monitor',
          totalCameras: 6,
          camerasOnline: 6
        };
        sendLocalHeartbeatToSupabase(hbInfo).catch(() => {});
        if (supabaseChannelRef.current && isChannelSubscribedRef.current) {
          try {
            supabaseChannelRef.current.send({
              type: 'broadcast',
              event: 'local_heartbeat',
              payload: { online: true, timestamp: Date.now(), ...hbInfo }
            });
          } catch (e) {}
        }

        try {
          const evRes = await fetch(`${activeBridge}/api/device/events`, { signal: AbortSignal.timeout(3000) }).catch(() => null);
          if (evRes && evRes.ok) {
            const evJson = await evRes.json().catch(() => null);
            if (evJson && evJson.data) setRecentFaceScans(evJson.data);
          }
        } catch (e) {}
      } else {
        // Lokal server bilan to'g'ridan-to'g'ri aloqa yo'q (tashqi internet rejimida)
        if (es) {
          try { es.close(); } catch (err) {}
          es = null;
        }
        setIsLocalConnected(false);
        setNetworkMode('global');

        // Agar Cloudflare global stream tunnel faol bo'lsa, voqealarni tunnel orqali to'liq yuklaymiz
        let tunnelReachable = false;
        const activeTunnel = getActiveBridgeUrl();
        if (activeTunnel && !deadTunnelsSet.has(activeTunnel.replace(/\/+$/, ''))) {
          try {
            const evRes = await fetch(`${activeTunnel}/api/device/events`, { signal: AbortSignal.timeout(3000) }).catch(() => null);
            if (evRes && evRes.ok) {
              markTunnelSuccess(activeTunnel);
              const evJson = await evRes.json().catch(() => null);
              if (evJson && Array.isArray(evJson.data) && evJson.data.length > 0) {
                setRecentFaceScans(evJson.data);
              }
              setIsSchoolLocalOnline(true);
              tunnelReachable = true;
            } else {
              markTunnelFailure(activeTunnel, handleDeadTunnelEviction);
            }
          } catch (e) {
            markTunnelFailure(activeTunnel, handleDeadTunnelEviction);
          }
        }

        // Agar tunnel orqali aloqa bo'lmasa, Supabase dan "local_status" heartbeat ni tekshiramiz
        if (!tunnelReachable) {
          try {
            const localStatus = await getLocalStatusFromSupabase();
            if (localStatus && localStatus.online) {
              const isFresh = (Date.now() - (localStatus.timestamp || 0)) < 45000;
              setIsSchoolLocalOnline(isFresh);
              if (isFresh) setLocalBridgeInfo(localStatus);
            } else {
              setIsSchoolLocalOnline(false);
            }
          } catch (e) {
            setIsSchoolLocalOnline(false);
          }
        }

        // Supabase dan oxirgi kamera kadrlarini yangilab turish (Global rejim uchun)
        try {
          const cloudFrames = await getLatestCameraFramesFromSupabase();
          if (cloudFrames && typeof cloudFrames === 'object' && Object.keys(cloudFrames).length > 0) {
            setCameraLatestFrames(prev => ({ ...prev, ...cloudFrames }));
          }
        } catch (e) {}
      }

      setIsInitialized(true);
      fetchSchoolsFromBackend();
    };

    pollDevice();
    const interval = setInterval(pollDevice, 2000);

    return () => {
      clearInterval(interval);
      if (es) {
        try { es.close(); } catch (err) {}
        es = null;
      }
      if (supabaseChannel) supabase.removeChannel(supabaseChannel);
    };
  }, []);

  // Lokal profil uchun kamera kadrlarini uzluksiz tezkor relay qilish (har 1.2 soniyada)
  useEffect(() => {
    if (!isLocalConnected) return;

    let isMounted = true;
    const relayInterval = setInterval(async () => {
      if (!isMounted) return;
      try {
        const res = await fetch(`${BRIDGE_API}/api/camera/latest_frames`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.frames && typeof json.frames === 'object') {
            const frameEntries = Object.entries(json.frames);
            if (frameEntries.length > 0) {
              setCameraLatestFrames(prev => ({ ...prev, ...json.frames }));

              if (supabaseChannelRef.current && isChannelSubscribedRef.current) {
                for (const [ip, frame] of frameEntries) {
                  try {
                    supabaseChannelRef.current.send({
                      type: 'broadcast',
                      event: 'camera_frame',
                      payload: { ip, frame, timestamp: Date.now() }
                    });
                  } catch (e) {}
                }
              }

              const now = Date.now();
              if (now - lastSavedFramesTime.current > 1500) {
                lastSavedFramesTime.current = now;
                saveLatestCameraFramesToSupabase(json.frames).catch(() => {});
              }
            }
          }
        }
      } catch (err) {}
    }, 1200);

    return () => {
      isMounted = false;
      clearInterval(relayInterval);
    };
  }, [isLocalConnected]);

  const refreshLocalStatus = async () => {
    manualRetryLocal.current = true;
    localFailuresCount.current = 0;
    try {
      const status = await getLocalStatusFromSupabase();
      if (status && status.online) {
        const isFresh = (Date.now() - (status.timestamp || 0)) < 45000;
        setIsSchoolLocalOnline(isFresh);
        if (isFresh) setLocalBridgeInfo(status);
      }
      const cloudFrames = await getLatestCameraFramesFromSupabase();
      if (cloudFrames && typeof cloudFrames === 'object') {
        setCameraLatestFrames(prev => ({ ...prev, ...cloudFrames }));
      }
    } catch (e) {}
  };

  // Turniket yo'nalishini almashtirish (Kirish <-> Chiqish)
  const updateCameraType = async (cameraId, newType) => {
    const typeLabel = newType === 'in' ? 'Kirish' : 'Chiqish';
    const updated = cameras.map(c => {
      if (c.id === cameraId) {
        const updatedName = c.name ? c.name.replace(/\((Kirish|Chiqish)\)/i, `(${typeLabel})`) : `Turniket (${typeLabel})`;
        return { ...c, type: newType, name: updatedName };
      }
      return c;
    });
    setCameras(updated);

    // 1. Supabase bulut bazasiga saqlash (Tartibi bilan ham saqlanadi)
    await saveCamerasToSupabase(updated);
    saveModuleToSupabase('cameras', updated).catch(() => {});

    // 2. Mahalliy ko'prik serveriga jo'natish
    try {
      await fetch(`${BRIDGE_API}/api/device/cameras/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      showToast('Kamera Saqlandi', `Turniket yo'nalishi "${typeLabel}" ga o'zgartirildi`, 'info');
    } catch (e) {}
  };

  // Kameralar joylashuvi va tartibini saqlash
  const reorderCameras = async (newOrder) => {
    if (!Array.isArray(newOrder) || newOrder.length === 0) return;
    setCameras(newOrder);
    
    // Supabase bulutiga aynan yangi tartibi bilan saqlaymiz
    await saveCamerasToSupabase(newOrder);
    await saveModuleToSupabase('cameras', newOrder);

    try {
      await fetch(`${BRIDGE_API}/api/device/cameras/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      showToast('Joylashuv Saqlandi', 'Kameralar tartibi va joylashuvi Supabase bulutida saqlandi', 'success');
    } catch (e) {}
  };

  // O'quvchi sinfini o'zgartirish (Serverga va barcha kompyuterlarga bir vaqtda saqlanadi)
  const changeStudentClass = async (studentId, newClassId) => {
    const targetClass = classes.find(c => c.id === newClassId);
    const targetClassName = targetClass ? targetClass.name : (newClassId === 'graduated' ? 'Maktabni tugatgan (Bitiruvchi)' : '');

    setStudents(prev => {
      const next = prev.map(s => {
        if (s.id === studentId || s.studentId === studentId) {
          return {
            ...s,
            classId: newClassId,
            className: targetClassName || s.className
          };
        }
        return s;
      });
      saveToServer('students', next);
      return next;
    });

    try {
      await fetch(`${BRIDGE_API}/api/school/update-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentId, 
          updatedData: { 
            classId: newClassId,
            className: targetClassName
          } 
        })
      });
    } catch (e) {}

    showToast('Sinf yangilandi', `O'quvchi ${targetClassName || 'yangi sinf'}ga biriktirildi. Supabase bulut bazasida saqlandi.`, 'success');
  };

  // Apparatdagi foydalanuvchilar ro'yxatini yuklash
  const fetchDeviceUsers = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/device/users?limit=200');
      if (res.ok) {
        const json = await res.json();
        return json.users || [];
      }
    } catch (e) {}
    return [];
  };

  // Login
  const login = (loginText, passwordText) => {
    const cleanLogin = loginText.trim().toLowerCase();
    const cleanPass = passwordText.trim();

    // 1. Har bir maktabning foye monitori login va parolini tekshirish (Direktor o'zgartirgan bo'lishi mumkin)
    const matchedSchoolByMonitor = schools.find(s => {
      const mLogin = (s.monitorLogin || (s.id === 'sch-1' ? 'monitor' : `monitor_${s.id}`)).toLowerCase().trim();
      const mPass = String(s.monitorPassword || '123').trim();
      return mLogin === cleanLogin && mPass === cleanPass;
    });

    let found = null;
    if (matchedSchoolByMonitor) {
      found = {
        id: `u-mon-${matchedSchoolByMonitor.id}`,
        login: matchedSchoolByMonitor.monitorLogin || cleanLogin,
        password: cleanPass,
        role: 'monitor',
        schoolId: matchedSchoolByMonitor.id,
        name: `${matchedSchoolByMonitor.name} - Foye Ekrani (Monitor)`,
        detail: 'Eshik oldidagi katta tablo',
        permissions: ['cameras']
      };
    } else {
      // 2. Maktab direktori hisoblari
      const matchedSchoolByDirector = schools.find(s => {
        if (!s.directorLogin) return false;
        const dLogin = s.directorLogin.toLowerCase().trim();
        const dPass = String(s.directorPassword || '123').trim();
        return dLogin === cleanLogin && dPass === cleanPass;
      });

      if (matchedSchoolByDirector) {
        found = {
          id: `u-dir-${matchedSchoolByDirector.id}`,
          login: matchedSchoolByDirector.directorLogin,
          password: cleanPass,
          role: 'director',
          schoolId: matchedSchoolByDirector.id,
          name: `${matchedSchoolByDirector.name} Direktori`,
          detail: matchedSchoolByDirector.director || 'Maktab Rahbariyati',
          isDirector: true,
          permissions: ['dashboard', 'cameras', 'playback', 'students', 'teachers', 'leadership', 'classes', 'schedules', 'attendance_control', 'class_attendance', 'notifications', 'settings']
        };
      } else {
        // 3. Standart USERS_AUTH ro'yxatini tekshirish
        found = USERS_AUTH.find(
          u => {
            // Agar u-mon bo'lsa, lekin joriy maktab paroli almashtirilgan bo'lsa, eski USERS_AUTH monitor paroli o'tmasin
            if (u.role === 'monitor') {
              const sch = schools.find(s => s.id === (u.schoolId || 'sch-1'));
              if (sch && sch.monitorPassword && sch.monitorPassword !== u.password) {
                return false;
              }
            }
            return u.login.toLowerCase() === cleanLogin && u.password === cleanPass;
          }
        );

        // 4. Barcha O'qituvchilarning Login va Parolini tekshirish (dinamik)
        if (!found) {
          const matchedTeacher = (teachers || []).find(t => {
            const tLogin = (t.login || generateTeacherLogin(t.name)).toLowerCase().trim();
            const tPass = String(t.password || '123').trim();
            const cleanPhone = (t.phone || '').replace(/[^0-9]/g, '');
            const inputPhone = cleanLogin.replace(/[^0-9]/g, '');
            const matchesPhone = cleanPhone && inputPhone && cleanPhone.endsWith(inputPhone) && inputPhone.length >= 7;
            return (tLogin === cleanLogin || matchesPhone) && tPass === cleanPass;
          });

          if (matchedTeacher) {
            const isClassTeacher = Boolean(matchedTeacher.classId);
            const tClassObj = (classes || []).find(c => c.id === matchedTeacher.classId);
            found = {
              id: `u-${matchedTeacher.id}`,
              login: matchedTeacher.login || generateTeacherLogin(matchedTeacher.name),
              password: cleanPass,
              role: isClassTeacher ? 'class_teacher' : 'subject_teacher',
              schoolId: selectedSchoolId || 'sch-1',
              name: matchedTeacher.name,
              detail: isClassTeacher ? `${tClassObj?.name || ''} sinf rahbari` : `${matchedTeacher.subject || 'Fan'} o'qituvchisi`,
              teacherId: matchedTeacher.id,
              classId: matchedTeacher.classId || null,
              subject: matchedTeacher.subject || '',
              permissions: isClassTeacher ? ['class_attendance', 'notifications'] : ['grades_journal']
            };
          }
        }

        // 5. Rahbariyat va ma'muriyat a'zolarini tekshirish
        if (!found) {
          const matchedStaff = (leadership || []).find(s => {
            if (!s.login) return false;
            const sLogin = String(s.login).toLowerCase().trim();
            const sPass = String(s.password || '123').trim();
            return sLogin === cleanLogin && sPass === cleanPass;
          });

          if (matchedStaff) {
            found = {
              id: matchedStaff.id || `u-${matchedStaff.login}`,
              login: matchedStaff.login,
              password: matchedStaff.password || '123',
              role: matchedStaff.isDirector ? 'director' : 'director',
              schoolId: selectedSchoolId || 'sch-1',
              name: matchedStaff.name,
              detail: matchedStaff.role || matchedStaff.detail || 'Rahbariyat',
              category: matchedStaff.category || 'leadership',
              isDirector: Boolean(matchedStaff.isDirector),
              permissions: Array.isArray(matchedStaff.permissions) ? matchedStaff.permissions : ['dashboard', 'students', 'cameras', 'teachers']
            };
          }
        }
      }
    }

    if (found) {

      // Agar oddiy maktab foydalanuvchisi bo'lsa, uning maktabi muzlatilgan yoki obuna muddati tugaganligini tekshirish!
      if (found.role !== 'bigadmin') {
        const userSchId = found.schoolId || selectedSchoolId || 'sch-1';
        const userSchool = schools.find(s => s.id === userSchId);
        if (userSchool) {
          const isNowFrozen = Boolean(userSchool.isFrozen);
          const isExpired = userSchool.subscriptionEnd && (new Date(userSchool.subscriptionEnd).getTime() < new Date().setHours(0,0,0,0));
          if (isNowFrozen) {
            return {
              success: false,
              error: `Kirish rad etildi: "${userSchool.name}" maktabi faoliyati bosh administrator tomonidan muzlatilgan! ${userSchool.freezeReason ? `(Sabab: ${userSchool.freezeReason})` : ''}`
            };
          }
          if (isExpired) {
            return {
              success: false,
              error: `Kirish rad etildi: "${userSchool.name}" maktabi uchun obuna muddati tugagan (${userSchool.subscriptionEnd})! Iltimos, bosh administrator bilan bog'laning.`
            };
          }
        }
      }

      // Auth tokenni yaratish va saqlash
      const token = generateAuthToken(found);
      try {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('school_user', JSON.stringify(found));
      } catch (e) {}

      setCurrentUser(found);
      if (found.schoolId && found.role !== 'bigadmin') {
        selectSchool(found.schoolId);
      }
      if (found.teacherId) {
        setSelectedTeacherId(found.teacherId);
      }
      showToast('Xush kelibsiz', `${found.name} sifatida kirdingiz.`, 'success');

      let p = '/director';
      if (found.role === 'bigadmin') p = '/bigadmin';
      else if (found.role === 'inspector') p = '/duty';
      else if (found.role === 'class_teacher') p = '/class-teacher';
      else if (found.role === 'subject_teacher') p = '/subject-teacher';
      else if (found.role === 'monitor') p = '/monitor';
      navigateTo(p);

      return { success: true };
    } else {
      return { success: false, error: 'Login yoki parol xato!' };
    }
  };

  // Chiqish
  const logout = () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('school_user');
    } catch (e) {}
    setCurrentUser(null);
    navigateTo('/login');
    showToast('Chiqildi', 'Tizimdan muvaffaqiyatli chiqildi.', 'info');
  };

  // Tezkor almashtirish
  const quickSwitchRole = (role, updateUrl = true, silent = false) => {
    // Agar BigAdmin tizimda bo'lsa, boshqa rollarga o'tish bloklanadi
    if (currentUserRef.current?.role === 'bigadmin' && role !== 'bigadmin') {
      return;
    }
    let match = USERS_AUTH.find(u => u.role === role);
    if (!match && role === 'class_teacher') {
      const classTeacher = teachers.find(t => t.classId) || teachers[0];
      const teacherClass = classes.find(c => c.id === classTeacher?.classId);
      match = {
        id: 'u-cl-10a',
        login: 'sinfraxbari',
        role: 'class_teacher',
        name: classTeacher ? classTeacher.name : 'Davletova Gulasal',
        detail: teacherClass ? `${teacherClass.name} sinf rahbari` : '10-A sinf rahbari',
        teacherId: classTeacher?.id || 't-1791520951199',
        classId: classTeacher?.classId || 'c-10a'
      };
    } else if (!match && role === 'subject_teacher') {
      const subjTeacher = teachers[0];
      match = {
        id: 'u-sub-t1',
        login: 'oqituvchi',
        role: 'subject_teacher',
        name: subjTeacher ? subjTeacher.name : 'Davletova Gulasal',
        detail: subjTeacher?.subject ? `${subjTeacher.subject} fani o'qituvchisi` : 'Fan o\'qituvchisi',
        teacherId: subjTeacher?.id || 't-1791520951199'
      };
    }

    if (match) {
      if (match.role === 'class_teacher') {
        const tObj = teachers.find(t => t.id === match.teacherId) || teachers.find(t => t.classId);
        if (tObj && tObj.classId) {
          match = { ...match, classId: tObj.classId };
        }
      }
      setCurrentUser(match);
      if (match.teacherId) {
        setSelectedTeacherId(match.teacherId);
      }
      if (!silent) {
        showToast('Rol almashtirildi', `${match.name} (${match.detail || match.role}) rejimiga o'tildi.`, 'info');
      }

      if (updateUrl) {
        let p = '/director';
        if (role === 'bigadmin') p = '/bigadmin';
        else if (role === 'inspector') p = '/duty';
        else if (role === 'class_teacher') p = '/class-teacher';
        else if (role === 'subject_teacher') p = '/subject-teacher';
        else if (role === 'monitor') p = '/monitor';
        else if (role === 'director') {
          p = activeTab === 'directory' ? '/students' : (activeTab === 'settings' ? '/teachers' : '/director');
        }
        if (typeof window !== 'undefined' && window.location.pathname !== p) {
          window.history.pushState({ path: p }, '', p);
        }
        setCurrentPath(p);
      }
    }
  };

  const switchStaffMember = (staffId) => {
    const member = leadership.find(m => m.id === staffId);
    if (member) {
      const staffUser = {
        id: member.id,
        login: member.login || 'staff',
        role: member.isDirector ? 'director' : (member.category === 'administrator' ? 'admin' : 'deputy_director'),
        name: member.name,
        detail: member.role || (member.category === 'administrator' ? 'Administrator' : "Direktor o'rinbosari"),
        isDirector: Boolean(member.isDirector),
        category: member.category || 'leadership',
        permissions: Array.isArray(member.permissions) ? member.permissions : ['dashboard']
      };
      setCurrentUser(staffUser);
      navigateTo('/director');
      showToast('Xodim tanlandi', `${member.name} profiliga o'tildi.`, 'info');
    }
  };

  // =================== BIG ADMIN: MAKTABLAR VA TURNIKETLARNI BOSHQARISH ===================
  const fetchSchoolsFromBackend = async () => {
    try {
      const bridgeHost = localBridgeInfo?.ip || 'localhost';
      const bridgePort = localBridgeInfo?.port || 5001;
      const res = await fetch(`http://${bridgeHost}:${bridgePort}/api/schools`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.schools) && data.schools.length > 0) {
          setSchools(data.schools);
          try { localStorage.setItem('school_list', JSON.stringify(data.schools)); } catch (e) {}
        }
      }
    } catch (e) {}
  };

  const createSchool = async (newSchoolData) => {
    const tempId = newSchoolData.id || `sch-${Date.now()}`;
    const schoolObj = {
      id: tempId,
      name: newSchoolData.name.trim(),
      code: newSchoolData.code ? newSchoolData.code.trim() : `SCH-${(schools.length + 1).toString().padStart(3, '0')}`,
      address: newSchoolData.address ? newSchoolData.address.trim() : '',
      phone: newSchoolData.phone ? newSchoolData.phone.trim() : '',
      director: newSchoolData.director ? newSchoolData.director.trim() : '',
      status: newSchoolData.status || 'active',
      createdAt: new Date().toISOString(),
      turnstiles: Array.isArray(newSchoolData.turnstiles) ? newSchoolData.turnstiles.map((t, idx) => ({
        id: t.id || `cam-${Date.now()}-${idx}`,
        schoolId: tempId,
        name: t.name ? t.name.trim() : `Turniket (${t.ip})`,
        ip: t.ip.trim(),
        type: t.type === 'out' ? 'out' : 'in',
        location: t.location ? t.location.trim() : 'Bosh kirish',
        port: Number(t.port) || 80,
        online: false
      })) : []
    };

    setSchools(prev => {
      const updated = [...prev, schoolObj];
      try { localStorage.setItem('school_list', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    if (schoolObj.turnstiles.length > 0) {
      setCameras(prev => [...prev.filter(c => !schoolObj.turnstiles.some(st => st.ip === c.ip)), ...schoolObj.turnstiles]);
    }

    try {
      const bridgeHost = localBridgeInfo?.ip || 'localhost';
      const bridgePort = localBridgeInfo?.port || 5001;
      const res = await fetch(`http://${bridgeHost}:${bridgePort}/api/schools/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schoolObj)
      });
      if (res.ok) {
        const d = await res.json();
        if (d.success && d.schools) {
          setSchools(d.schools);
          try { localStorage.setItem('school_list', JSON.stringify(d.schools)); } catch (e) {}
        }
      }
    } catch (err) {}

    showToast('Muvaffaqiyatli', `${schoolObj.name} muvaffaqiyatli yaratildi!`, 'success');
    return schoolObj;
  };

  const updateSchool = async (schoolData) => {
    setSchools(prev => {
      const updated = prev.map(s => s.id === schoolData.id ? { ...s, ...schoolData } : s);
      try { localStorage.setItem('school_list', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    try {
      const bridgeHost = localBridgeInfo?.ip || 'localhost';
      const bridgePort = localBridgeInfo?.port || 5001;
      await fetch(`http://${bridgeHost}:${bridgePort}/api/schools/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schoolData)
      });
    } catch (e) {}

    showToast('Yangilandi', 'Maktab ma\'lumotlari yangilandi.', 'success');
  };

  const updateSchoolSupabase = async (schoolId, { supabaseUrl, supabaseKey }) => {
    const url = (supabaseUrl || '').trim();
    const key = (supabaseKey || '').trim();

    setSchools(prev => {
      const updated = prev.map(s => {
        if (s.id === schoolId) {
          return { ...s, supabaseUrl: url, supabaseKey: key };
        }
        return s;
      });
      try { localStorage.setItem('school_list', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    if (selectedSchoolId === schoolId) {
      if (url && key) {
        const client = getSupabaseForSchool({ supabaseUrl: url, supabaseKey: key });
        setActiveSupabaseClient(client);
      } else if (schoolId === 'sch-1') {
        setActiveSupabaseClient(supabase);
      }
    }

    try {
      const bridgeHost = localBridgeInfo?.ip || 'localhost';
      const bridgePort = localBridgeInfo?.port || 5001;
      await fetch(`http://${bridgeHost}:${bridgePort}/api/schools/supabase/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: schoolId, supabaseUrl: url, supabaseKey: key })
      });
    } catch (e) {}

    showToast('Muvaffaqiyatli', 'Supabase sozlamalari yangilandi!', 'success');
  };

  // Har bir maktab direktori o'z foye monitorining login va parolini erkin o'zgartira oladi
  const updateSchoolMonitorCredentials = async (schoolId, { monitorLogin, monitorPassword }) => {
    const cleanLogin = (monitorLogin || '').trim();
    const cleanPassword = (monitorPassword || '').trim();

    if (!cleanLogin) {
      showToast('Xatolik', 'Monitor logini bo\'sh bo\'lishi mumkin emas!', 'warning');
      return { success: false, error: 'Login bo\'sh bo\'lmasligi kerak' };
    }
    if (!cleanPassword) {
      showToast('Xatolik', 'Monitor paroli bo\'sh bo\'lishi mumkin emas!', 'warning');
      return { success: false, error: 'Parol bo\'sh bo\'lmasligi kerak' };
    }

    let updatedSchool = null;
    setSchools(prev => {
      const updated = prev.map(s => {
        if (s.id === schoolId) {
          updatedSchool = { ...s, monitorLogin: cleanLogin, monitorPassword: cleanPassword };
          return updatedSchool;
        }
        return s;
      });
      try { localStorage.setItem('school_list', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    // 1. Supabase bulut bazasiga saqlash
    try {
      if (updatedSchool) {
        saveModuleToSupabase('monitor_credentials', {
          schoolId,
          monitorLogin: cleanLogin,
          monitorPassword: cleanPassword,
          updatedAt: new Date().toISOString()
        }).catch(() => {});
      }
    } catch (e) {}

    // 2. Lokal ko'prik serveriga uzatish
    try {
      const bridgeHost = localBridgeInfo?.ip || 'localhost';
      const bridgePort = localBridgeInfo?.port || 5001;
      await fetch(`http://${bridgeHost}:${bridgePort}/api/schools/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: schoolId, monitorLogin: cleanLogin, monitorPassword: cleanPassword }),
        signal: AbortSignal.timeout(3000)
      }).catch(() => {});
    } catch (e) {}

    showToast('Muvaffaqiyatli', `Foye monitori uchun yangi login: "${cleanLogin}" muvaffaqiyatli o'rnatildi!`, 'success');
    return { success: true };
  };

  // Maktab obunasi holati va qolgan kunlarni hisoblash
  const getSchoolSubscriptionInfo = (school) => {
    if (!school) return { status: 'unknown', text: "Noma'lum", badge: "Noma'lum", daysLeft: 0, isFrozen: false, isExpired: false, color: 'slate' };
    const isFrozen = Boolean(school.isFrozen);
    const subEnd = school.subscriptionEnd;
    
    if (isFrozen) {
      return {
        status: 'frozen',
        text: 'Muzlatilgan',
        badge: 'Muzlatilgan (To\'xtatilgan)',
        reason: school.freezeReason || 'Administrator tomonidan muzlatilgan',
        isFrozen: true,
        isExpired: false,
        daysLeft: 0,
        color: 'rose'
      };
    }

    if (!subEnd) {
      return {
        status: 'active',
        text: 'Cheksiz Faol',
        badge: 'Obuna Faol',
        isFrozen: false,
        isExpired: false,
        daysLeft: 999,
        color: 'emerald'
      };
    }

    const today = new Date().setHours(0,0,0,0);
    const end = new Date(subEnd).setHours(0,0,0,0);
    const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: 'expired',
        text: 'Muddati tugagan',
        badge: `Muddati o'tgan (${Math.abs(diffDays)} kun oldin)`,
        daysLeft: diffDays,
        isFrozen: false,
        isExpired: true,
        color: 'amber'
      };
    }

    return {
      status: 'active',
      text: `${diffDays} kun qoldi`,
      badge: `Obuna Faol (${diffDays} kun)`,
      daysLeft: diffDays,
      isFrozen: false,
      isExpired: false,
      color: diffDays <= 7 ? 'amber' : 'emerald'
    };
  };

  // Maktab obunasi va muzlatish parametrlarini yangilash (BigAdmin)
  const updateSchoolSubscription = async (schoolId, subscriptionData) => {
    const isFrozen = Boolean(subscriptionData.isFrozen);
    const subStart = subscriptionData.subscriptionStart || new Date().toISOString().split('T')[0];
    const subEnd = subscriptionData.subscriptionEnd || '';
    const reason = subscriptionData.freezeReason || '';

    setSchools(prev => {
      const updated = prev.map(s => {
        if (s.id === schoolId) {
          return {
            ...s,
            isFrozen,
            subscriptionStart: subStart,
            subscriptionEnd: subEnd,
            freezeReason: reason
          };
        }
        return s;
      });
      try { localStorage.setItem('school_list', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    // Agar kirib turgan oddiy xodim shu muzlatilgan maktabga tegishli bo'lsa, zudlik bilan chiqarib yuborish!
    if (currentUser && currentUser.role !== 'bigadmin') {
      const mySchoolId = currentUser.schoolId || selectedSchoolId;
      if (schoolId === mySchoolId) {
        const isExpired = subEnd && (new Date(subEnd).getTime() < new Date().setHours(0,0,0,0));
        if (isFrozen || isExpired) {
          logout();
          showToast(
            'Maktab faoliyati to\'xtatildi',
            isFrozen
              ? `Ushbu maktab faoliyati bosh administrator tomonidan muzlatildi (${reason || "Muzlatilgan"}). Tizimdan chiqarildingiz.`
              : "Ushbu maktab uchun obuna muddati tugaganligi sababli tizimdan chiqarildingiz.",
            'error'
          );
        }
      }
    }

    try {
      const bridgeHost = localBridgeInfo?.ip || 'localhost';
      const bridgePort = localBridgeInfo?.port || 5001;
      await fetch(`http://${bridgeHost}:${bridgePort}/api/schools/subscription/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: schoolId,
          isFrozen,
          subscriptionStart: subStart,
          subscriptionEnd: subEnd,
          freezeReason: reason
        })
      });
    } catch (e) {}

    showToast(
      'Muvaffaqiyatli',
      isFrozen
        ? 'Maktab faoliyati muzlatildi va xodimlar tizimdan chiqarildi.'
        : 'Maktab obunasi va faollik muddati yangilandi!',
      isFrozen ? 'warning' : 'success'
    );
  };

  // Agar maktab muzlatilsa yoki muddati tugasa, kirib turgan xodimlarni darhol tizimdan chiqarish!
  useEffect(() => {
    if (currentUser && currentUser.role !== 'bigadmin') {
      const mySchoolId = currentUser.schoolId || selectedSchoolId;
      const mySchool = schools.find(s => s.id === mySchoolId);
      if (mySchool) {
        const isNowFrozen = Boolean(mySchool.isFrozen);
        const isExpired = mySchool.subscriptionEnd && (new Date(mySchool.subscriptionEnd).getTime() < new Date().setHours(0,0,0,0));
        if (isNowFrozen || isExpired) {
          logout();
          showToast(
            'Obuna to\'xtatilgan',
            isNowFrozen
              ? `Ushbu maktab faoliyati muzlatilganligi sababli tizimdan chiqarildingiz! ${mySchool.freezeReason ? `(${mySchool.freezeReason})` : ''}`
              : "Ushbu maktab uchun obuna muddati tugaganligi sababli tizimdan chiqarildingiz.",
            'error'
          );
        }
      }
    }
  }, [schools, currentUser?.id, selectedSchoolId]);

  const deleteSchool = async (schoolId) => {
    if (schools.length <= 1) {
      showToast('Rad etildi', 'Kamida bitta maktab qolishi shart!', 'error');
      return false;
    }

    setSchools(prev => {
      const updated = prev.filter(s => s.id !== schoolId);
      try { localStorage.setItem('school_list', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    if (selectedSchoolId === schoolId) {
      const remaining = schools.filter(s => s.id !== schoolId);
      if (remaining[0]) setSelectedSchoolId(remaining[0].id);
    }

    try {
      const bridgeHost = localBridgeInfo?.ip || 'localhost';
      const bridgePort = localBridgeInfo?.port || 5001;
      await fetch(`http://${bridgeHost}:${bridgePort}/api/schools/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: schoolId })
      });
    } catch (e) {}

    showToast('O\'chirildi', 'Maktab va unga biriktirilgan turniketlar olib tashlandi.', 'info');
    return true;
  };

  const addTurnstileToSchool = async (schoolId, turnstileData) => {
    const targetSchoolId = schoolId || selectedSchoolId || 'sch-1';
    const newCam = {
      id: `cam-${Date.now()}`,
      schoolId: targetSchoolId,
      name: turnstileData.name ? turnstileData.name.trim() : `Turniket (${turnstileData.ip})`,
      ip: turnstileData.ip.trim(),
      type: turnstileData.type === 'out' ? 'out' : 'in',
      location: turnstileData.location ? turnstileData.location.trim() : 'Kirish yo\'lagi',
      port: Number(turnstileData.port) || 80,
      online: false,
      lastEvent: null
    };

    setSchools(prev => {
      const updated = prev.map(s => {
        if (s.id === targetSchoolId) {
          const tList = Array.isArray(s.turnstiles) ? [...s.turnstiles, newCam] : [newCam];
          return { ...s, turnstiles: tList };
        }
        return s;
      });
      try { localStorage.setItem('school_list', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    setCameras(prev => [...prev.filter(c => c.ip !== newCam.ip), newCam]);

    try {
      const bridgeHost = localBridgeInfo?.ip || 'localhost';
      const bridgePort = localBridgeInfo?.port || 5001;
      await fetch(`http://${bridgeHost}:${bridgePort}/api/schools/cameras/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCam)
      });
    } catch (e) {}

    showToast('Turniket biriktirildi', `${newCam.name} muvaffaqiyatli qo'shildi!`, 'success');
  };

  const updateTurnstile = async (schoolId, turnstileId, updateData) => {
    setSchools(prev => {
      const updated = prev.map(s => {
        if (s.id === schoolId && Array.isArray(s.turnstiles)) {
          const tList = s.turnstiles.map(t => (t.id === turnstileId || t.ip === updateData.ip) ? { ...t, ...updateData } : t);
          return { ...s, turnstiles: tList };
        }
        return s;
      });
      try { localStorage.setItem('school_list', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    setCameras(prev => prev.map(c => (c.id === turnstileId || c.ip === updateData.ip) ? { ...c, ...updateData } : c));

    try {
      const bridgeHost = localBridgeInfo?.ip || 'localhost';
      const bridgePort = localBridgeInfo?.port || 5001;
      await fetch(`http://${bridgeHost}:${bridgePort}/api/schools/cameras/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId, id: turnstileId, ...updateData })
      });
    } catch (e) {}

    showToast('Turniket yangilandi', 'Turniket sozlamalari saqlandi.', 'success');
  };

  const deleteTurnstile = async (schoolId, turnstileId, ip) => {
    setSchools(prev => {
      const updated = prev.map(s => {
        if (s.id === schoolId && Array.isArray(s.turnstiles)) {
          const tList = s.turnstiles.filter(t => t.id !== turnstileId && t.ip !== ip);
          return { ...s, turnstiles: tList };
        }
        return s;
      });
      try { localStorage.setItem('school_list', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    setCameras(prev => prev.filter(c => c.id !== turnstileId && c.ip !== ip));

    try {
      const bridgeHost = localBridgeInfo?.ip || 'localhost';
      const bridgePort = localBridgeInfo?.port || 5001;
      await fetch(`http://${bridgeHost}:${bridgePort}/api/schools/cameras/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId, id: turnstileId, ip })
      });
    } catch (e) {}

    showToast('Turniket olib tashlandi', 'Turniket maktabdan olib tashlandi.', 'info');
  };

  // =================== CRUD: O'QUVCHILAR (100% DINAMIK VA FACE-ID SINXRON) ===================
  const addStudent = (studentData) => {
    // Eng katta mavjud ID raqamini aniqlash (Face-ID kamerasi uchun to'g'ri 8 xonali raqam)
    let maxEmp = 0;
    (students || []).forEach(s => {
      const num = parseInt(String(s.studentId || s.employeeNo || s.id || '').replace(/^s-/, ''), 10);
      if (!isNaN(num) && num > maxEmp && num < 90000000) {
        maxEmp = num;
      }
    });
    const nextEmpNo = String(maxEmp + 1).padStart(8, '0');
    const cleanEmp = (studentData.employeeNo || studentData.studentId || '')
      ? String(studentData.employeeNo || studentData.studentId).replace(/^s-/, '').replace(/\D/g, '')
      : '';
    const assignedEmpNo = (cleanEmp && cleanEmp.length <= 8 && parseInt(cleanEmp, 10) > 0)
      ? cleanEmp.padStart(8, '0')
      : nextEmpNo;

    const newStudent = {
      ...studentData,
      id: `s-${assignedEmpNo}`,
      studentId: assignedEmpNo,
      employeeNo: assignedEmpNo,
      isFaceEnrolled: false
    };

    setStudents(prev => {
      const next = [newStudent, ...prev];
      saveToServer('students', next);
      return next;
    });

    const targetUrl = getActiveBridgeUrl();
    if (targetUrl) {
      try {
        fetch(`${targetUrl}/api/school/add-student`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student: newStudent })
        }).catch(() => {});
      } catch (e) {}
    }

    showToast('Qo\'shildi', 'Yangi o\'quvchi saqlandi va Face-ID ga kiritildi.', 'success');
  };

  const updateStudent = (studentId, updatedData) => {
    let resolvedData = { ...updatedData };
    if (resolvedData.name && !resolvedData.fullName) {
      resolvedData.fullName = resolvedData.name;
    } else if (resolvedData.fullName && !resolvedData.name) {
      resolvedData.name = resolvedData.fullName;
    }
    if (updatedData.classId) {
      const cls = classes.find(c => c.id === updatedData.classId);
      if (cls) resolvedData.className = cls.name;
    }
    let updatedStudentObj = null;
    setStudents(prev => {
      const next = prev.map(s => {
        if (s.id === studentId || s.studentId === studentId) {
          updatedStudentObj = { ...s, ...resolvedData };
          return updatedStudentObj;
        }
        return s;
      });
      saveToServer('students', next);
      return next;
    });

    // Jonli skanerlar (recentFaceScans) dagi eski ismlarni ham darhol yangilaymiz
    if (updatedStudentObj) {
      const emp = String(updatedStudentObj.studentId || updatedStudentObj.employeeNo || updatedStudentObj.id || '').replace(/^s-/, '').replace(/^0+/, '');
      const newName = updatedStudentObj.fullName || updatedStudentObj.name;
      if (emp && newName) {
        setRecentFaceScans(prev => (prev || []).map(sc => {
          const scEmp = String(sc.employeeNo || '').replace(/^0+/, '');
          if (scEmp && scEmp === emp) {
            return { ...sc, name: newName };
          }
          return sc;
        }));
      }
    }

    const targetUrl = getActiveBridgeUrl();
    if (targetUrl && updatedStudentObj) {
      try {
        fetch(`${targetUrl}/api/school/update-student`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, updatedData: resolvedData, student: updatedStudentObj })
        }).catch(() => {});
      } catch (e) {}
    }
    showToast('Yangilandi', 'O\'quvchi ma\'lumotlari yangilandi va Face-ID apparatlariga uzatildi.', 'info');
  };

  const deleteStudent = async (studentId) => {
    const studentToDel = students.find(s => s.id === studentId || s.studentId === studentId);
    const empNo = studentToDel ? (studentToDel.studentId || String(studentToDel.id).replace(/^s-/, '')) : String(studentId).replace(/^s-/, '');

    // 1. Frontend & Supabase holatidan o'chirish
    setStudents(prev => {
      const next = prev.filter(s => s.id !== studentId && s.studentId !== studentId);
      saveToServer('students', next);
      return next;
    });

    // 2. Face-ID apparatlaridan o'chirish
    const targetUrl = getActiveBridgeUrl();
    if (targetUrl) {
      try {
        fetch(`${targetUrl}/api/school/delete-student`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, employeeNo: empNo })
        }).catch(() => {});
      } catch (e) {}
    }

    showToast('O\'chirildi', 'O\'quvchi bazadan va barcha Face-ID terminallaridan o\'chirildi.', 'success');
  };

  // O'quvchini O'qituvchiga o'tkazish (Turniketdan adashib o'quvchiga tushgan o'qituvchilar uchun)
  const convertStudentToTeacher = (studentId, options = {}) => {
    const student = students.find(s => s.id === studentId || s.studentId === studentId);
    if (!student) return false;

    const empNo = student.studentId || (student.id ? String(student.id).replace(/^s-/, '') : Date.now());
    const newTeacher = {
      id: `t-${empNo}`,
      name: student.fullName || student.name,
      role: options.role || (options.classId ? 'Sinf rahbari' : 'O\'qituvchi'),
      subject: options.subject || 'Boshlang\'ich ta\'lim',
      classId: options.classId || (options.role === 'Sinf rahbari' ? student.classId : null) || null,
      phone: formatPhoneNumber(student.phone || student.parentPhone || ''),
      faceId: student.faceId || student.studentId || empNo,
      faceURL: student.faceURL || null
    };

    setTeachers(prev => {
      const exists = prev.some(t => t.id === newTeacher.id || (t.faceId && t.faceId === newTeacher.faceId) || t.name.toLowerCase() === newTeacher.name.toLowerCase());
      const next = exists 
        ? prev.map(t => (t.id === newTeacher.id || (t.faceId && t.faceId === newTeacher.faceId) || t.name.toLowerCase() === newTeacher.name.toLowerCase()) ? { ...t, ...newTeacher } : t)
        : [newTeacher, ...prev];
      saveToServer('teachers', next);
      return next;
    });

    setStudents(prev => {
      const next = prev.filter(s => s.id !== studentId && s.studentId !== studentId);
      saveToServer('students', next);
      return next;
    });

    showToast('O\'qituvchiga o\'tkazildi', `${newTeacher.name} o'qituvchilar safiga muvaffaqiyatli ko'chirildi!`, 'success');
    return true;
  };

  // Aniqlangan o'qituvchilarni ommaviy ko'chirish
  const batchConvertStudentsToTeachers = (studentIds) => {
    if (!studentIds || studentIds.length === 0) return 0;
    const targetStudents = students.filter(s => studentIds.includes(s.id) || studentIds.includes(s.studentId));
    if (targetStudents.length === 0) return 0;

    let updatedTeachers = [...teachers];
    targetStudents.forEach(st => {
      const empNo = st.studentId || (st.id ? String(st.id).replace(/^s-/, '') : Date.now());
      let subject = "Boshlang'ich ta'lim";
      if (st.name.includes('Viktor')) subject = 'Jismoniy tarbiya';
      if (st.name.includes('Elbek')) subject = 'Informatika';
      if (st.name.includes('Indira')) subject = 'Ingliz tili';
      if (st.name.includes('Dilfuza')) subject = 'Musiqa';

      const tObj = {
        id: `t-${empNo}`,
        name: st.fullName || st.name,
        role: st.classId ? 'Sinf rahbari' : 'O\'qituvchi',
        subject,
        classId: st.classId || null,
        phone: formatPhoneNumber(st.phone || st.parentPhone || ''),
        faceId: st.studentId,
        faceURL: st.faceURL || null
      };
      const idx = updatedTeachers.findIndex(t => t.id === tObj.id || (t.faceId && t.faceId === tObj.faceId) || t.name.toLowerCase() === tObj.name.toLowerCase());
      if (idx >= 0) {
        updatedTeachers[idx] = { ...updatedTeachers[idx], ...tObj };
      } else {
        updatedTeachers.push(tObj);
      }
    });

    const nextStudents = students.filter(s => !studentIds.includes(s.id) && !studentIds.includes(s.studentId));
    setTeachers(updatedTeachers);
    setStudents(nextStudents);
    saveToServer('teachers', updatedTeachers);
    saveToServer('students', nextStudents);

    showToast('O\'qituvchilar ajratildi', `${targetStudents.length} nafar o'qituvchi o'quvchilar ro'yxatidan o'qituvchilar bo'limiga o'tkazildi!`, 'success');
    return targetStudents.length;
  };

  // Sinf ko'tarish: 11-sinflar bitiradi, 10->11, ..., 1->2 ko'tariladi, 1-sinflar bo'shaydi
  const promoteClasses = async () => {
    const { updatedStudents, updatedClasses, graduatedCount, promotedCount } = promoteAllClasses(students, classes);
    setStudents(updatedStudents);
    setClasses(updatedClasses);

    // Ham lokal (server/school_db.json), ham global (Supabase) da saqlash
    await saveToServer('students', updatedStudents);
    await saveToServer('classes', updatedClasses);

    showToast(
      'Sinflar muvaffaqiyatli ko\'tarildi!',
      `${promotedCount} ta o'quvchi keyingi sinfga o'tdi. ${graduatedCount} ta 11-sinf o'quvchisi maktabni tugatdi. 1-A va 1-B sinflari yangi o'quvchilar uchun bo'shatildi!`,
      'success'
    );
    return { graduatedCount, promotedCount };
  };

  // Excel orqali o'quvchilarni ommaviy yuklash (1-sinflar yoki istalgan boshqa sinfga)
  const importStudentsFromExcel = async (newStudents, defaultClassId) => {
    if (!newStudents || newStudents.length === 0) return 0;
    
    // Eng katta mavjud ID raqamini aniqlash (Face-ID kamerasi uchun to'g'ri 8 xonali raqam)
    let maxEmp = 0;
    (students || []).forEach(s => {
      const num = parseInt(String(s.studentId || s.employeeNo || s.id || '').replace(/^s-/, ''), 10);
      if (!isNaN(num) && num > maxEmp && num < 90000000) {
        maxEmp = num;
      }
    });

    const formatted = newStudents.map((st, idx) => {
      const targetClass = classes.find(c => c.name.toLowerCase() === (st.className || '').toLowerCase().trim()) 
                          || classes.find(c => c.id === defaultClassId) 
                          || classes[0];
      const nextEmpNo = String(maxEmp + idx + 1).padStart(8, '0');
      const photoData = st.photo || st.photoUrl || st.faceURL || null;

      return {
        id: `s-${nextEmpNo}`,
        studentId: nextEmpNo,
        employeeNo: nextEmpNo,
        name: st.name || st.fullName,
        fullName: st.fullName || st.name,
        classId: targetClass?.id || defaultClassId || 'c-1a',
        className: targetClass?.name || '1-A',
        grade: targetClass?.grade || 1,
        address: st.address || 'Bog\'ot tumani',
        parentName: st.parentName || 'Ota-ona',
        parentPhone: st.parentPhone || st.phone || '',
        phone: st.phone || st.parentPhone || '',
        faceURL: photoData && typeof photoData === 'string' && photoData.startsWith('http') ? photoData : null,
        photo: photoData,
        photoUrl: photoData,
        isFaceEnrolled: false,
        gender: st.gender || 'O\'g\'il'
      };
    });

    const nextStudents = [...formatted, ...students];
    setStudents(nextStudents);
    saveToServer('students', nextStudents);

    // Barcha yangi o'quvchilarni (ayniqsa fotosuratlilarni) Face-ID apparatlari va ko'prik serverga uzatish!
    const targetUrl = getActiveBridgeUrl();
    if (targetUrl) {
      formatted.forEach(st => {
        try {
          fetch(`${targetUrl}/api/school/add-student`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student: st })
          }).catch(() => {});
        } catch (e) {}
      });
    }

    showToast('Excel yuklandi', `${formatted.length} ta o'quvchi muvaffaqiyatli qo'shildi va tizimga saqlandi!`, 'success');
    return formatted.length;
  };

  // =================== CRUD: O'QITUVCHILAR (FACE-ID VA RASM BILAN) ===================
  const addTeacher = (teacherData) => {
    let maxEmp = 0;
    (students || []).concat(teachers || []).forEach(p => {
      const num = parseInt(String(p.faceId || p.employeeNo || p.studentId || p.id || '').replace(/^[st]-/, ''), 10);
      if (!isNaN(num) && num > maxEmp && num < 90000000) {
        maxEmp = num;
      }
    });
    const nextEmpNo = String(maxEmp + 1).padStart(8, '0');
    const assignedEmpNo = teacherData.faceId || teacherData.employeeNo || nextEmpNo;

    const newTeacher = {
      ...teacherData,
      id: 't-' + assignedEmpNo,
      faceId: assignedEmpNo,
      employeeNo: assignedEmpNo,
      photo: teacherData.photo || null,
      photoUrl: teacherData.photoUrl || teacherData.photo || null
    };

    setTeachers(prev => {
      const next = [newTeacher, ...prev];
      saveToServer('teachers', next);
      return next;
    });

    const targetUrl = getActiveBridgeUrl();
    if (targetUrl) {
      try {
        fetch(`${targetUrl}/api/school/save-teacher`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teacher: newTeacher })
        }).catch(() => {});
      } catch (e) {}
    }

    showToast('Qo\'shildi', 'Yangi o\'qituvchi saqlandi va Face-ID ga kiritildi.', 'success');
  };

  const updateTeacher = (teacherId, updatedData) => {
    let updatedTeacherObj = null;
    setTeachers(prev => {
      const next = prev.map(t => {
        if (t.id === teacherId) {
          updatedTeacherObj = { 
            ...t, 
            ...updatedData,
            photo: updatedData.photo !== undefined ? updatedData.photo : t.photo,
            photoUrl: updatedData.photoUrl !== undefined ? updatedData.photoUrl : (updatedData.photo !== undefined ? updatedData.photo : t.photoUrl)
          };
          return updatedTeacherObj;
        }
        return t;
      });
      saveToServer('teachers', next);
      return next;
    });

    const targetUrl = getActiveBridgeUrl();
    if (targetUrl && updatedTeacherObj) {
      try {
        fetch(`${targetUrl}/api/school/save-teacher`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teacher: updatedTeacherObj })
        }).catch(() => {});
      } catch (e) {}
    }

    showToast('Yangilandi', 'O\'qituvchi ma\'lumotlari va Face-ID surati yangilandi.', 'info');
  };

  const deleteTeacher = (teacherId) => {
    const teacherToDelete = (teachers || []).find(t => t.id === teacherId);
    setTeachers(prev => {
      const next = prev.filter(t => t.id !== teacherId);
      saveToServer('teachers', next);
      return next;
    });
    setSchedules(prev => {
      const next = prev.filter(s => s.teacherId !== teacherId);
      saveToServer('schedules', next);
      return next;
    });

    const targetUrl = getActiveBridgeUrl();
    if (targetUrl && teacherToDelete) {
      try {
        fetch(`${targetUrl}/api/school/delete-teacher`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teacherId: teacherToDelete.id, employeeNo: teacherToDelete.employeeNo || teacherToDelete.faceId })
        }).catch(() => {});
      } catch (e) {}
    }

    showToast('O\'chirildi', 'O\'qituvchi tizimdan va Face-ID dan o\'chirildi.', 'info');
  };

  // =================== CRUD: DARS FANLARI / JADVAL ===================
  const addSchedule = (scheduleData) => {
    const newSchedule = {
      ...scheduleData,
      id: 'sch-' + Date.now()
    };
    setSchedules(prev => {
      const next = [...prev, newSchedule];
      saveToServer('schedules', next);
      saveModuleToSupabase('schedules', next).catch(() => {});
      return next;
    });
    showToast('Qo\'shildi', 'Dars fani jadvalga qo\'shildi.', 'success');
  };

  const updateSchedule = (scheduleId, updatedData) => {
    setSchedules(prev => {
      const next = prev.map(s => s.id === scheduleId ? { ...s, ...updatedData } : s);
      saveToServer('schedules', next);
      saveModuleToSupabase('schedules', next).catch(() => {});
      return next;
    });
    showToast('Yangilandi', 'Dars fani jadvali yangilandi.', 'info');
  };

  const batchAssignTeacherToSchedule = ({ scheduleId, classId, subject, teacherId, teacherName, applyToAll = false }) => {
    let affectedCount = 0;
    const cleanSubj = (subject || '').toLowerCase().replace(/['`’ʻ]/g, "'").trim();

    setSchedules(prev => {
      const next = prev.map(s => {
        const sSubj = (s.subject || '').toLowerCase().replace(/['`’ʻ]/g, "'").trim();
        const isMatch = applyToAll
          ? (s.classId === classId && (sSubj === cleanSubj || sSubj.includes(cleanSubj) || cleanSubj.includes(sSubj)))
          : (s.id === scheduleId);

        if (isMatch) {
          affectedCount++;
          return {
            ...s,
            teacherId: teacherId || null,
            teacherName: teacherName || ''
          };
        }
        return s;
      });

      saveToServer('schedules', next);
      saveModuleToSupabase('schedules', next).catch(() => {});
      return next;
    });

    const msg = applyToAll
      ? `"${subject}" fanining ${affectedCount} ta darsiga ${teacherName || "o'qituvchi"} biriktirildi.`
      : `Darsga ${teacherName || "o'qituvchi"} biriktirildi.`;
    showToast('O\'qituvchi belgilandi', msg, 'success');
  };

  const deleteSchedule = (scheduleId) => {
    setSchedules(prev => {
      const next = prev.filter(s => s.id !== scheduleId);
      saveToServer('schedules', next);
      saveModuleToSupabase('schedules', next).catch(() => {});
      return next;
    });
    showToast('O\'chirildi', 'Dars fani olib tashlandi.', 'info');
  };

  // =================== CRUD: SINFLAR ===================
  const addClass = (classData) => {
    const newClass = {
      ...classData,
      id: 'c-' + Date.now(),
      studentsCount: 0
    };
    setClasses(prev => {
      const next = [...prev, newClass];
      saveToServer('classes', next);
      return next;
    });
    showToast('Qo\'shildi', 'Yangi sinf ochildi.', 'success');
  };

  const updateClass = (classId, updatedData) => {
    setClasses(prev => {
      const next = prev.map(c => c.id === classId ? { ...c, ...updatedData } : c);
      saveToServer('classes', next);
      saveModuleToSupabase('classes', next).catch(() => {});
      return next;
    });

    if (updatedData.teacherId !== undefined) {
      setTeachers(prev => {
        const next = prev.map(t => {
          if (t.id === updatedData.teacherId) {
            return { ...t, classId };
          }
          if (t.classId === classId && t.id !== updatedData.teacherId) {
            return { ...t, classId: null };
          }
          return t;
        });
        saveToServer('teachers', next);
        saveModuleToSupabase('teachers', next).catch(() => {});
        return next;
      });
    }
    showToast('Saqlandi', 'Sinf ma\'lumotlari yangilandi.', 'success');
  };

  const deleteClass = (classId) => {
    setClasses(prev => {
      const next = prev.filter(c => c.id !== classId);
      saveToServer('classes', next);
      return next;
    });
    setStudents(prev => {
      const next = prev.filter(s => s.classId !== classId);
      saveToServer('students', next);
      return next;
    });
    setSchedules(prev => {
      const next = prev.filter(s => s.classId !== classId);
      saveToServer('schedules', next);
      return next;
    });
    showToast('O\'chirildi', 'Sinf o\'chirildi.', 'info');
  };

  // =================== CRUD: RAHBARIYAT VA ADMINISTRATORLAR ===================
  const addStaffMember = (memberData) => {
    const newMember = {
      ...memberData,
      id: memberData.id || `staff-${Date.now()}`,
      phone: memberData.phone ? formatPhoneNumber(memberData.phone) : '',
      permissions: Array.isArray(memberData.permissions) ? memberData.permissions : ['dashboard'],
      isDirector: Boolean(memberData.isDirector)
    };
    setLeadership(prev => {
      const next = [...prev, newMember];
      saveToServer('leadership', next);
      saveModuleToSupabase('leadership', next).catch(() => {});
      return next;
    });
    showToast('Qo\'shildi', `${newMember.name} xodimlar ro'yxatiga qo'shildi.`, 'success');
    return newMember;
  };

  const updateStaffMember = (id, updatedData) => {
    const formattedData = { ...updatedData };
    if (formattedData.phone) {
      formattedData.phone = formatPhoneNumber(formattedData.phone);
    }
    setLeadership(prev => {
      const next = prev.map(m => m.id === id ? { ...m, ...formattedData } : m);
      saveToServer('leadership', next);
      saveModuleToSupabase('leadership', next).catch(() => {});
      return next;
    });

    // Agar hozirda shu xodim tizimda faol bo'lsa, uning session ruxsatlari ham jonli yangilanadi
    if (currentUser && (currentUser.id === id || currentUser.login === formattedData.login)) {
      setCurrentUser(prev => ({ ...prev, ...formattedData }));
    }

    showToast('Saqlandi', 'Xodim ma\'lumotlari va ruxsatlari yangilandi.', 'success');
  };

  const deleteStaffMember = (id) => {
    const member = leadership.find(m => m.id === id);
    if (member?.isDirector) {
      showToast('Rad etildi', 'Maktab direktorini o\'chirib bo\'lmaydi!', 'error');
      return false;
    }
    setLeadership(prev => {
      const next = prev.filter(m => m.id !== id);
      saveToServer('leadership', next);
      saveModuleToSupabase('leadership', next).catch(() => {});
      return next;
    });
    showToast('O\'chirildi', 'Xodim ro\'yxatdan olib tashlandi.', 'info');
    return true;
  };

  // Direktor tomonidan belgilangan ruxsatlarni tekshirish ("shu hodim ga o'zi korsa boladigan narsa lar korinadi")
  const hasPermission = (permKey) => {
    if (!currentUser) return false;
    // Direktor har doim barcha bo'limlarni ko'rish va boshqarish huquqiga ega
    if (currentUser.isDirector || currentUser.role === 'director') return true;
    if (Array.isArray(currentUser.permissions)) {
      return currentUser.permissions.includes(permKey);
    }
    // Standart rollar bo'yicha ruxsatlar
    if (currentUser.role === 'inspector') return ['dashboard', 'attendance_control'].includes(permKey);
    if (currentUser.role === 'class_teacher') return ['class_attendance', 'notifications'].includes(permKey);
    if (currentUser.role === 'subject_teacher') return ['grades_journal'].includes(permKey);
    if (currentUser.role === 'monitor') return ['cameras'].includes(permKey);
    return false;
  };

  // Davomat topshirish (Navbatchi yoki o'qituvchi)
  const submitAttendance = (classId, records, customInspector, silent = false) => {
    const classObj = classes.find(c => c.id === classId);
    const className = classObj ? classObj.name : 'Sinf';
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const usedInspector = customInspector || inspectorName;
    const d = new Date();
    const todayDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const existingIndex = attendanceList.findIndex(a => a.classId === classId && a.date === todayDate);
    const newEntry = {
      id: existingIndex >= 0 ? attendanceList[existingIndex].id : 'att-' + Date.now(),
      date: todayDate,
      classId,
      inspectorName: usedInspector,
      timestamp: currentTime,
      records
    };

    let updated = [];
    if (existingIndex >= 0) {
      updated = [...attendanceList];
      updated[existingIndex] = newEntry;
    } else {
      updated = [newEntry, ...attendanceList];
    }
    setAttendanceList(updated);
    saveToServer('attendanceList', updated);
    saveModuleToSupabase('attendanceList', updated).catch(() => {});

    if (!silent) {
      const absents = records.filter(r => r.status === 'absent');
      const newNotif = {
        id: 'notif-' + Date.now(),
        target: 'all',
        type: 'attendance_alert',
        title: `${className} davomati topshirildi`,
        message: `${usedInspector} tomonidan davomat olindi (${absents.length} kelmadi).`,
        classId,
        className,
        time: currentTime,
        date: todayDate,
        isRead: false
      };

      setNotifications(prev => {
        // Avvalgi aynan shu sinf va kungi eskirgan takroriy xabarni o'chirib, yangisini boshiga qo'shamiz
        const filtered = prev.filter(x => !(x.classId === classId && x.date === todayDate && x.title === newNotif.title));
        const updated = [newNotif, ...filtered].slice(0, 50);
        saveModuleToSupabase('notifications', updated).catch(() => {});
        saveToServer('notifications', updated);
        return updated;
      });
      showToast('Davomat saqlandi', `${className} davomati saqlandi va yuborildi.`, 'success');
    }
  };

  // Sinf rahbari yoki navbatchi holatni o'zgartirishi
  const updateStudentAttendance = (classId, studentId, newStatus, reason = '', note = '') => {
    const d = new Date();
    const todayDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    setAttendanceList(prev => {
      const attIndex = prev.findIndex(a => a.classId === classId && a.date === todayDate);
      if (attIndex === -1) {
        const newClassAtt = {
          id: 'att-' + todayDate + '-' + classId,
          classId: classId,
          date: todayDate,
          inspectorName: 'Sinf Rahbari',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          records: [{ studentId, status: newStatus, reason, note }]
        };
        const updatedList = [newClassAtt, ...prev];
        saveToServer('attendanceList', updatedList);
        saveModuleToSupabase('attendanceList', updatedList).catch(() => {});
        return updatedList;
      }

      const currentClassAtt = { ...prev[attIndex] };
      const recIndex = currentClassAtt.records.findIndex(r => r.studentId === studentId);
      
      if (recIndex >= 0) {
        currentClassAtt.records[recIndex] = {
          ...currentClassAtt.records[recIndex],
          status: newStatus,
          reason: reason || currentClassAtt.records[recIndex].reason,
          note: note || currentClassAtt.records[recIndex].note
        };
      } else {
        currentClassAtt.records.push({ studentId, status: newStatus, reason, note });
      }

      const updatedList = [...prev];
      updatedList[attIndex] = currentClassAtt;
      saveToServer('attendanceList', updatedList);
      saveModuleToSupabase('attendanceList', updatedList).catch(() => {});
      return updatedList;
    });

    showToast('O\'zgartirildi', 'Holat yangilandi.', 'info');
  };

  const addNotification = (notif) => {
    const newEntry = {
      id: notif.id || 'notif-' + Date.now(),
      target: notif.target || 'all',
      type: notif.type || 'alert',
      title: notif.title || 'Bildirishnoma',
      message: notif.message || '',
      classId: notif.classId || null,
      time: notif.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: notif.date || new Date().toISOString().split('T')[0],
      isRead: false
    };

    setNotifications(prev => {
      const filtered = prev.filter(x => !(x.classId === newEntry.classId && x.title === newEntry.title && x.time === newEntry.time));
      const updated = [newEntry, ...filtered].slice(0, 50);
      saveModuleToSupabase('notifications', updated).catch(() => {});
      saveToServer('notifications', updated);
      return updated;
    });
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
      saveModuleToSupabase('notifications', updated).catch(() => {});
      saveToServer('notifications', updated);
      return updated;
    });
  };

  const markAllNotificationsRead = (classIdFilter = null) => {
    setNotifications(prev => {
      const updated = prev.map(n => {
        if (!classIdFilter || n.classId === classIdFilter) {
          return { ...n, isRead: true };
        }
        return n;
      });
      saveModuleToSupabase('notifications', updated).catch(() => {});
      saveToServer('notifications', updated);
      return updated;
    });
    showToast('O\'qildi', 'Bildirishnomalar o\'qilgan deb belgilandi.', 'info');
  };

  const clearNotifications = (classIdFilter = null) => {
    setNotifications(prev => {
      const updated = classIdFilter ? prev.filter(n => n.classId !== classIdFilter) : [];
      saveModuleToSupabase('notifications', updated).catch(() => {});
      saveToServer('notifications', updated);
      return updated;
    });
    showToast('Tozalandi', 'Bildirishnomalar tozalandi.', 'info');
  };

  const contextValue = {
    theme,
    toggleTheme,
    currentUser,
    login,
    logout,
    quickSwitchRole,
    switchStaffMember,
    selectedTeacherId,
    setSelectedTeacherId,
    inspectorName,
    setInspectorName,
    classes: classes || [],
    teachers: teachers || [],
    leadership: leadership || [],
    setLeadership,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    hasPermission,
    AVAILABLE_PERMISSIONS,
    students: students || [],
    schedules: schedules || [],
    attendanceList: attendanceList || [],
    notifications: notifications || [],
    teacherAttendance: teacherAttendance || [],
    hourlyAttendance: hourlyAttendance || {},
    toggleTeacherPresence,
    recordLessonAttendance,
    activeToast,
    showToast,
    submitAttendance,
    updateStudentAttendance,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    addNotification,
    // CRUD
    addStudent,
    updateStudent,
    deleteStudent,
    convertStudentToTeacher,
    batchConvertStudentsToTeachers,
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
    // Face-ID Hikvision & Kameralar
    faceDevice,
    recentFaceScans,
    fetchDeviceUsers,
    cameras,
    updateCameraType,
    reorderCameras,
    changeStudentClass,
    bridgeUrl: BRIDGE_API,
    syncAllToSupabase,
    promoteClasses,
    importStudentsFromExcel,
    resetToAllFaceStudents: async () => {
      try {
        const res = await fetch(`${BRIDGE_API}/api/school/sync-face-students`, { method: 'POST' });
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            setStudents(json.data);
            saveModuleToSupabase('students', json.data).catch(() => {});
            showToast('Muvaffaqiyatli sinxronlandi!', `Face-ID apparatidagi barcha ${json.total || 737} ta yuz sinxronlandi va Supabase ga saqlandi. Barcha sinflar va kiritilgan o'zgarishlaringiz saqlab qolindi!`, 'success');
            return;
          }
        }
      } catch (err) {}
      showToast('Sinxronlash', 'Server bilan bog\'lanishda xatolik yuz berdi.', 'error');
    },
    // Tarmoq holati (Lokal vs Global) va ogohlantirish boshqaruvi
    networkMode,
    isLocalConnected,
    isSchoolLocalOnline,
    localBridgeInfo,
    refreshLocalStatus,
    globalStreamUrl,
    setGlobalStreamUrl: setManualGlobalStreamUrl,
    updateGlobalStreamUrl,
    cameraLatestFrames,
    isInitialized,
    localWarningSnoozedUntil,
    dismissLocalWarning,
    // URL Routing boshqaruvi
    currentPath,
    navigateTo,
    activeTab,
    setActiveTab,
    // Big Admin & Maktablar va Turniketlar boshqaruvi
    schools,
    selectedSchoolId,
    currentSchool,
    selectSchool,
    createSchool,
    updateSchool,
    updateSchoolSupabase,
    updateSchoolSubscription,
    updateSchoolMonitorCredentials,
    getSchoolSubscriptionInfo,
    testSupabaseConnection,
    bigAdminSupabase,
    deleteSchool,
    addTurnstileToSchool,
    updateTurnstile,
    deleteTurnstile,
    fetchSchoolsFromBackend,
    isLocalHostEnv,
    isBigAdmin: Boolean(currentUser?.role === 'bigadmin' || currentUser?.isBigAdmin)
  };

  return (
    <SchoolContext.Provider value={contextValue}>
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    return {
      theme: 'light',
      toggleTheme: () => {},
      currentUser: USERS_AUTH[0],
      classes: INITIAL_CLASSES,
      teachers: INITIAL_TEACHERS,
      students: INITIAL_STUDENTS,
      schedules: INITIAL_SCHEDULE,
      attendanceList: INITIAL_ATTENDANCE,
      notifications: INITIAL_NOTIFICATIONS,
      login: () => {},
      logout: () => {},
      quickSwitchRole: () => {},
      showToast: () => {},
      currentPath: '/director',
      navigateTo: () => {},
      activeTab: 'main',
      setActiveTab: () => {},
    };
  }
  return context;
};
