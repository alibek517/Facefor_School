import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useSchool } from '../context/SchoolContext';
import { evaluateStudentDayAttendance } from '../utils/attendanceScheduleHelper';
import {
  Building2,
  GraduationCap,
  Briefcase,
  Users,
  UserCheck,
  Search,
  Calendar,
  Copy,
  FileText,
  FileSpreadsheet,
  Printer,
  Columns,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Filter,
  Check,
  Menu,
  X
} from 'lucide-react';

const getTodayDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatTime24 = (timeStr) => {
  if (!timeStr) return '';
  const pmMatch = String(timeStr).match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (pmMatch) {
    let h = parseInt(pmMatch[1], 10);
    const m = pmMatch[2];
    const ampm = pmMatch[3].toUpperCase();
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}`;
  }
  const cleanMatch = String(timeStr).match(/^(\d{1,2}):(\d{2})/);
  if (cleanMatch) {
    return `${cleanMatch[1].padStart(2, '0')}:${cleanMatch[2]}`;
  }
  return '';
};

const extractScanTime = (scan) => {
  if (!scan) return '';
  if (scan.timeFormatted) {
    const t = formatTime24(scan.timeFormatted);
    if (t) return t;
  }
  if (scan.timestamp) {
    const d = new Date(scan.timestamp);
    if (!isNaN(d.getTime())) {
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
  }
  return '';
};

const timeToMinutes = (hhmm) => {
  if (!hhmm) return null;
  const m = String(hhmm).match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
};

const getClassSortWeight = (cls) => {
  const name = (cls?.name || '').trim();
  const match = name.match(/^(\d+)\s*[-_ ]?\s*([A-Za-zА-Яа-яЎўҚқҒғҲҳ]?)/);
  if (match) {
    const grade = parseInt(match[1], 10);
    const letter = (match[2] || '').toUpperCase();
    return grade * 1000 + (letter ? letter.charCodeAt(0) : 0);
  }
  if (typeof cls?.grade === 'number') return cls.grade * 1000;
  return 999999;
};

const normalizeId = (val) => String(val || '').replace(/^0+/, '').trim().toLowerCase();

const getAttendanceBadgeClass = (percent) => {
  if (percent >= 85) return 'bg-emerald-600 text-white';
  if (percent >= 60) return 'bg-amber-500 text-white';
  return 'bg-rose-700 text-white';
};

const NAV_ITEMS = [
  { id: 'school', label: 'MAKTAB MIQYOSIDA', short: 'Maktab', icon: Building2 },
  { id: 'classes_summary', label: 'SINFLAR KESIMIDA', short: 'Sinflar', icon: GraduationCap },
  { id: 'departments_summary', label: "BO'LIMLAR KESIMIDA", short: "Bo'limlar", icon: Briefcase },
  { id: 'class_detail', label: 'SINF MIQYOSIDA', short: 'Sinf', icon: Users },
  { id: 'department_detail', label: "BO'LIM MIQYOSIDA", short: "Bo'lim", icon: UserCheck },
];

export const AttendanceReportView = () => {
  const {
    students = [],
    classes = [],
    teachers = [],
    leadership = [],
    technicalStaff = [],
    attendanceList = [],
    teacherAttendance = [],
    schedules = [],
    recentFaceScans = [],
    currentSchool,
    showToast
  } = useSchool();

  // Navigatsiya va filter holatlari
  const [activeSection, setActiveSection] = useState('classes_summary');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState(getTodayDateStr);
  const [lateThreshold, setLateThreshold] = useState('08:30');
  const [tableSearch, setTableSearch] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState("O'qituvchilar");
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'ontime' | 'late' | 'excused' | 'unexcused'
  const [gradeFilter, setGradeFilter] = useState('all');

  // Jadval saralash, sahifalash va ustunlar ko'rinishi
  const [sortConfig, setSortConfig] = useState({ key: 'index', dir: 'asc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showColMenu, setShowColMenu] = useState(false);
  const [visibleCols, setVisibleCols] = useState({
    index: true,
    name: true,
    total: true,
    percent: true,
    ontime: true,
    late: true,
    excused: true,
    unexcused: true,
    classOrDept: true,
    status: true,
    entryTime: true,
    exitTime: true,
    reason: true
  });

  // Sinflarni tartiblash (1-A .. 11-Z)
  const sortedClasses = useMemo(() => {
    return [...(classes || [])].sort((a, b) => {
      const wA = getClassSortWeight(a);
      const wB = getClassSortWeight(b);
      if (wA !== wB) return wA - wB;
      return (a.name || '').localeCompare(b.name || '', 'uz');
    });
  }, [classes]);

  const activeClassId = selectedClassId || sortedClasses[0]?.id || '';

  const classMap = useMemo(() => {
    const map = {};
    sortedClasses.forEach(c => { map[c.id] = c; });
    return map;
  }, [sortedClasses]);

  const lateMinutes = useMemo(() => timeToMinutes(lateThreshold) ?? (8 * 60 + 30), [lateThreshold]);

  // Tanlangan sanadagi Face-ID skanlar
  const dateScans = useMemo(() => {
    return (recentFaceScans || []).filter(s => {
      if (!s?.timestamp) return false;
      return String(s.timestamp).startsWith(selectedDate);
    });
  }, [recentFaceScans, selectedDate]);

  // Skanlarni ID va ism bo'yicha indekslash
  const scanIndex = useMemo(() => {
    const byId = new Map();
    const byName = new Map();
    dateScans.forEach(scan => {
      const empId = normalizeId(scan.employeeNo || scan.studentId || scan.personId);
      const nameKey = String(scan.name || '').trim().toLowerCase();
      if (empId) {
        if (!byId.has(empId)) byId.set(empId, []);
        byId.get(empId).push(scan);
      }
      if (nameKey) {
        if (!byName.has(nameKey)) byName.set(nameKey, []);
        byName.get(nameKey).push(scan);
      }
    });
    return { byId, byName };
  }, [dateScans]);

  // Tanlangan sanadagi sinf davomati yozuvlari (o'quvchi ID bo'yicha)
  const studentAttMap = useMemo(() => {
    const map = new Map();
    (attendanceList || [])
      .filter(a => a.date === selectedDate)
      .forEach(att => {
        (att.records || []).forEach(r => {
          const sid = String(r.studentId || r.id || '');
          if (sid) map.set(sid, r);
        });
      });
    return map;
  }, [attendanceList, selectedDate]);

  // Tanlangan sanadagi o'qituvchilar davomati xaritasi
  const teacherAttMap = useMemo(() => {
    const map = new Map();
    (teacherAttendance || []).forEach(rec => {
      if (rec.date && rec.date !== selectedDate) return;
      const tid = String(rec.teacherId || rec.id || '');
      if (tid) map.set(tid, rec);
    });
    return map;
  }, [teacherAttendance, selectedDate]);

  // Barcha o'quvchilarning tanlangan sanadagi holatini hisoblash
  const evaluatedStudents = useMemo(() => {
    return (students || []).map(st => {
      const stName = st.fullName || st.name || "Noma'lum";
      const idCandidates = [st.faceId, st.studentId, st.id].map(normalizeId).filter(Boolean);
      let scans = [];
      for (const cid of idCandidates) {
        if (scanIndex.byId.has(cid)) {
          scans = scanIndex.byId.get(cid);
          break;
        }
      }
      if (scans.length === 0) {
        const nk = stName.trim().toLowerCase();
        if (nk && scanIndex.byName.has(nk)) {
          scans = scanIndex.byName.get(nk);
        }
      }

      const attRec = studentAttMap.get(String(st.id)) || studentAttMap.get(String(st.studentId));
      const dayEval = evaluateStudentDayAttendance({
        scans,
        attRecord: attRec,
        classId: st.classId,
        schedules,
        dateStr: selectedDate
      });

      const entryTime = dayEval.firstEntryTime;
      const exitTime = dayEval.lastExitTime;
      const hasEntered = dayEval.hasEntered;

      let status = 'unexcused'; // 'ontime' | 'late' | 'excused' | 'unexcused'
      if (hasEntered) {
        const mins = timeToMinutes(entryTime);
        if (attRec?.status === 'late' || (mins !== null && mins > lateMinutes)) {
          status = 'late';
        } else {
          status = 'ontime';
        }
      } else {
        const reasonText = String(attRec?.reason || '').trim();
        const isExcused = Boolean(
          attRec?.status === 'excused' ||
          attRec?.excused ||
          (reasonText && !/^sababsiz$/i.test(reasonText))
        );
        status = isExcused ? 'excused' : 'unexcused';
      }

      const cls = classMap[st.classId];
      return {
        id: st.id || st.studentId,
        code: st.faceId || st.studentId || '',
        name: stName,
        classId: st.classId,
        className: cls?.name || st.className || 'Biriktirilmagan',
        grade: cls?.grade || null,
        status,
        scheduleStatus: dayEval.scheduleStatus,
        scheduleLabel: dayEval.scheduleLabel,
        scheduleDetail: dayEval.scheduleDetail,
        entryTime,
        exitTime,
        reason: attRec?.reason || dayEval.scheduleDetail || '',
        parentPhone: st.parentPhone || st.phone || ''
      };
    });
  }, [students, scanIndex, studentAttMap, classMap, lateMinutes, schedules, selectedDate]);

  // Bo'limlar ro'yxatini shakllantirish (O'qituvchilar, Rahbariyat, Ma'muriyat va boshqalar)
  const evaluatedStaff = useMemo(() => {
    const list = [];
    const seenIds = new Set();

    const classifyDepartment = (person, defaultDept) => {
      const roleStr = String(person.role || person.position || person.department || '').toLowerCase();
      if (person.department) return person.department;
      if (roleStr.includes('hamshira') || roleStr.includes('shifokor')) return 'Hamshira';
      if (roleStr.includes('amaliyot')) return 'Amaliyot';
      if (roleStr.includes('psixolog')) return 'Psixolog';
      if (roleStr.includes('kutubxona')) return 'Kutubxona';
      if (roleStr.includes('admin') || person.category === 'administrator') return "Ma'muriyat";
      if (roleStr.includes('direktor') || person.category === 'leadership') return 'Rahbariyat';
      return defaultDept;
    };

    const pushMember = (person, defaultDept) => {
      const key = String(person.id || person.name || '').trim();
      if (!key || seenIds.has(key)) return;
      seenIds.add(key);

      const pName = person.fullName || person.name || "Noma'lum";
      const idCandidates = [person.faceId, person.employeeNo, person.id].map(normalizeId).filter(Boolean);
      let scans = [];
      for (const cid of idCandidates) {
        if (scanIndex.byId.has(cid)) {
          scans = scanIndex.byId.get(cid);
          break;
        }
      }
      if (scans.length === 0) {
        const nk = pName.trim().toLowerCase();
        if (nk && scanIndex.byName.has(nk)) {
          scans = scanIndex.byName.get(nk);
        }
      }

      const sortedScans = [...scans].sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
      const inScans = sortedScans.filter(s => s.direction !== 'out' && s.type !== 'out');
      const outScans = sortedScans.filter(s => s.direction === 'out' || s.type === 'out');

      const firstIn = inScans[0] || sortedScans[0] || null;
      const lastOut = outScans[outScans.length - 1] || null;
      const entryTime = extractScanTime(firstIn);
      const exitTime = extractScanTime(lastOut);

      const tAtt = teacherAttMap.get(String(person.id));
      const hasEntered = Boolean(firstIn) || tAtt?.status === 'present' || tAtt?.isPresent === true;

      let status = 'unexcused';
      if (hasEntered) {
        const mins = timeToMinutes(entryTime || formatTime24(tAtt?.entryTime));
        if (tAtt?.status === 'late' || (mins !== null && mins > lateMinutes)) {
          status = 'late';
        } else {
          status = 'ontime';
        }
      } else {
        const reasonText = String(tAtt?.reason || '').trim();
        const isExcused = Boolean(tAtt?.status === 'excused' || (reasonText && !/^sababsiz$/i.test(reasonText)));
        status = isExcused ? 'excused' : 'unexcused';
      }

      list.push({
        id: person.id || pName,
        code: person.faceId || '',
        name: pName,
        department: classifyDepartment(person, defaultDept),
        roleLabel: person.subject ? `${person.role || "O'qituvchi"} (${person.subject})` : (person.role || defaultDept),
        status,
        entryTime: entryTime || formatTime24(tAtt?.entryTime) || '',
        exitTime: exitTime || formatTime24(tAtt?.exitTime) || '',
        reason: tAtt?.reason || '',
        phone: person.phone || ''
      });
    };

    (teachers || []).forEach(t => pushMember(t, "O'qituvchilar"));
    (leadership || []).forEach(l => pushMember(l, 'Rahbariyat'));
    (technicalStaff || []).forEach(t => pushMember({ ...t, department: t.department || 'Texnik xodimlar' }, 'Texnik xodimlar'));

    return list;
  }, [teachers, leadership, technicalStaff, scanIndex, teacherAttMap, lateMinutes]);

  // Sinflar kesimida umumiy jadval
  const classSummaryRows = useMemo(() => {
    const byClass = new Map();
    sortedClasses.forEach(c => {
      byClass.set(c.id, {
        id: c.id,
        name: c.name,
        grade: c.grade,
        total: 0,
        ontime: 0,
        late: 0,
        excused: 0,
        unexcused: 0
      });
    });

    evaluatedStudents.forEach(st => {
      if (!byClass.has(st.classId)) {
        byClass.set(st.classId || 'none', {
          id: st.classId || 'none',
          name: st.className,
          grade: st.grade,
          total: 0,
          ontime: 0,
          late: 0,
          excused: 0,
          unexcused: 0
        });
      }
      const row = byClass.get(st.classId || 'none');
      row.total += 1;
      if (st.status === 'ontime') row.ontime += 1;
      else if (st.status === 'late') row.late += 1;
      else if (st.status === 'excused') row.excused += 1;
      else row.unexcused += 1;
    });

    return Array.from(byClass.values())
      .filter(r => gradeFilter === 'all' || String(r.grade) === String(gradeFilter))
      .map((r, idx) => {
        const present = r.ontime + r.late;
        const percent = r.total > 0 ? Math.round((present / r.total) * 100) : 0;
        return { ...r, index: idx + 1, present, percent };
      });
  }, [sortedClasses, evaluatedStudents, gradeFilter]);

  // Bo'limlar kesimida umumiy jadval
  const departmentSummaryRows = useMemo(() => {
    const map = new Map();
    evaluatedStaff.forEach(st => {
      const dept = st.department || "O'qituvchilar";
      if (!map.has(dept)) {
        map.set(dept, {
          id: dept,
          name: dept,
          total: 0,
          ontime: 0,
          late: 0,
          excused: 0,
          unexcused: 0
        });
      }
      const row = map.get(dept);
      row.total += 1;
      if (st.status === 'ontime') row.ontime += 1;
      else if (st.status === 'late') row.late += 1;
      else if (st.status === 'excused') row.excused += 1;
      else row.unexcused += 1;
    });

    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .map((r, idx) => {
        const present = r.ontime + r.late;
        const percent = r.total > 0 ? Math.round((present / r.total) * 100) : 0;
        return { ...r, index: idx + 1, present, percent };
      });
  }, [evaluatedStaff]);

  const departmentNames = useMemo(() => departmentSummaryRows.map(d => d.name), [departmentSummaryRows]);
  const activeDeptName = departmentNames.includes(selectedDeptId) ? selectedDeptId : (departmentNames[0] || "O'qituvchilar");

  // Maktab miqyosida umumiy statistika
  const schoolTotals = useMemo(() => {
    const total = evaluatedStudents.length;
    const ontime = evaluatedStudents.filter(s => s.status === 'ontime').length;
    const late = evaluatedStudents.filter(s => s.status === 'late').length;
    const excused = evaluatedStudents.filter(s => s.status === 'excused').length;
    const unexcused = evaluatedStudents.filter(s => s.status === 'unexcused').length;
    const present = ontime + late;
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, ontime, late, excused, unexcused, present, percent };
  }, [evaluatedStudents]);

  const isSummaryMode = activeSection === 'classes_summary' || activeSection === 'departments_summary';

  // Joriy ko'rinish uchun qatorlarni filtrlash va saralash
  const rawRows = useMemo(() => {
    if (activeSection === 'classes_summary') return classSummaryRows;
    if (activeSection === 'departments_summary') return departmentSummaryRows;
    const matchesStatus = (s) => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'completed_all' || statusFilter === 'left_early' || statusFilter === 'outdoor_lesson') {
        return s.scheduleStatus === statusFilter;
      }
      return s.status === statusFilter;
    };

    if (activeSection === 'class_detail') {
      return evaluatedStudents
        .filter(s => s.classId === activeClassId)
        .filter(matchesStatus)
        .map((s, idx) => ({ ...s, index: idx + 1 }));
    }
    if (activeSection === 'department_detail') {
      return evaluatedStaff
        .filter(s => s.department === activeDeptName)
        .filter(s => statusFilter === 'all' || s.status === statusFilter)
        .map((s, idx) => ({ ...s, index: idx + 1 }));
    }
    // activeSection === 'school' -> Barcha o'quvchilar
    return evaluatedStudents
      .filter(s => gradeFilter === 'all' || String(s.grade) === String(gradeFilter))
      .filter(s => !selectedClassId || selectedClassId === 'all' || s.classId === selectedClassId)
      .filter(matchesStatus)
      .map((s, idx) => ({ ...s, index: idx + 1 }));
  }, [
    activeSection,
    classSummaryRows,
    departmentSummaryRows,
    evaluatedStudents,
    evaluatedStaff,
    activeClassId,
    activeDeptName,
    statusFilter,
    gradeFilter,
    selectedClassId
  ]);

  const filteredAndSortedRows = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    const filtered = q
      ? rawRows.filter(r =>
          String(r.name || '').toLowerCase().includes(q) ||
          String(r.className || r.department || r.roleLabel || '').toLowerCase().includes(q) ||
          String(r.code || '').toLowerCase().includes(q)
        )
      : rawRows;

    const { key, dir } = sortConfig;
    const mult = dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * mult;
      return String(av || '').localeCompare(String(bv || ''), 'uz') * mult;
    });
  }, [rawRows, tableSearch, sortConfig]);

  // Sahifalash
  const totalEntries = filteredAndSortedRows.length;
  const effectivePageSize = pageSize === 'all' ? Math.max(1, totalEntries) : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalEntries / effectivePageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * effectivePageSize;
  const paginatedRows = filteredAndSortedRows.slice(startIdx, startIdx + effectivePageSize);

  const toggleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-3 h-3 opacity-40 inline ml-1" />;
    return sortConfig.dir === 'asc'
      ? <ArrowUp className="w-3 h-3 text-blue-600 inline ml-1" />
      : <ArrowDown className="w-3 h-3 text-blue-600 inline ml-1" />;
  };

  // Eksport uchun ma'lumotlarni tayyorlash
  const buildExportMatrix = () => {
    if (isSummaryMode) {
      const headers = ['N', 'Nomi', 'Barcha', 'Davomat (%)', 'Kelgan: Vaqtida', 'Kelgan: Kechikkan', 'Kelmagan: Sababli', 'Kelmagan: Sababsiz'];
      const rows = filteredAndSortedRows.map((r, i) => [
        i + 1,
        r.name,
        r.total,
        `${r.percent}%`,
        r.ontime,
        r.late,
        r.excused,
        r.unexcused
      ]);
      return { headers, rows };
    } else {
      const statusLabel = (s) =>
        s === 'ontime' ? 'Vaqtida' : s === 'late' ? 'Kechikkan' : s === 'excused' ? 'Sababli' : 'Sababsiz';
      const headers = [
        'N',
        'F.I.O',
        activeSection === 'department_detail' ? "Bo'lim / Lavozim" : 'Sinf',
        'Holati',
        'Kirish vaqti',
        'Chiqish vaqti',
        'Sabab / Izoh'
      ];
      const rows = filteredAndSortedRows.map((r, i) => [
        i + 1,
        r.name,
        activeSection === 'department_detail' ? (r.roleLabel || r.department) : r.className,
        statusLabel(r.status),
        r.entryTime || '-',
        r.exitTime || '-',
        r.reason || '-'
      ]);
      return { headers, rows };
    }
  };

  const handleCopy = async () => {
    const { headers, rows } = buildExportMatrix();
    const text = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      showToast?.('Nusxalandi', `${rows.length} ta qator buferga nusxalandi`, 'success');
    } catch {
      showToast?.('Xatolik', 'Buferga nusxalab bo\'lmadi', 'error');
    }
  };

  const handleCSV = () => {
    const { headers, rows } = buildExportMatrix();
    const csv = '\uFEFF' + [headers, ...rows]
      .map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `davomat_${activeSection}_${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast?.('CSV yuklandi', `davomat_${activeSection}_${selectedDate}.csv`, 'success');
  };

  const handleExcel = () => {
    const { headers, rows } = buildExportMatrix();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Davomat');
    XLSX.writeFile(wb, `davomat_${activeSection}_${selectedDate}.xlsx`);
    showToast?.('Excel yuklandi', `davomat_${activeSection}_${selectedDate}.xlsx`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const sectionTitle = useMemo(() => {
    if (activeSection === 'school') return "Maktab Miqyosida — Barcha O'quvchilar";
    if (activeSection === 'classes_summary') return 'Sinflar Kesimida';
    if (activeSection === 'departments_summary') return "Bo'limlar Kesimida";
    if (activeSection === 'class_detail') {
      const cls = classMap[activeClassId];
      return `Sinf Miqyosida${cls ? ` — ${cls.name}` : ''}`;
    }
    return `Bo'lim Miqyosida — ${activeDeptName}`;
  }, [activeSection, classMap, activeClassId, activeDeptName]);

  const filteredNavItems = useMemo(() => {
    const q = sidebarSearch.trim().toLowerCase();
    if (!q) return NAV_ITEMS;
    return NAV_ITEMS.filter(item => item.label.toLowerCase().includes(q));
  }, [sidebarSearch]);

  const shiftDate = (days) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dt = new Date(y, m - 1, d + days);
    const next = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    setSelectedDate(next);
    setPage(1);
  };

  const statusBadge = (status) => {
    if (status === 'ontime') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
          <CheckCircle2 className="w-3 h-3" /> Vaqtida
        </span>
      );
    }
    if (status === 'late') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
          <Clock className="w-3 h-3" /> Kechikkan
        </span>
      );
    }
    if (status === 'excused') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300">
          <AlertTriangle className="w-3 h-3" /> Sababli
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300">
        <XCircle className="w-3 h-3" /> Sababsiz
      </span>
    );
  };

  // Jami qatori (Summary jadvallar uchun)
  const summaryFooter = useMemo(() => {
    if (!isSummaryMode) return null;
    const total = filteredAndSortedRows.reduce((s, r) => s + r.total, 0);
    const ontime = filteredAndSortedRows.reduce((s, r) => s + r.ontime, 0);
    const late = filteredAndSortedRows.reduce((s, r) => s + r.late, 0);
    const excused = filteredAndSortedRows.reduce((s, r) => s + r.excused, 0);
    const unexcused = filteredAndSortedRows.reduce((s, r) => s + r.unexcused, 0);
    const percent = total > 0 ? Math.round(((ontime + late) / total) * 100) : 0;
    return { total, ontime, late, excused, unexcused, percent };
  }, [isSummaryMode, filteredAndSortedRows]);

  const availableGrades = useMemo(() => {
    const set = new Set();
    sortedClasses.forEach(c => {
      if (c.grade) set.add(c.grade);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [sortedClasses]);

  const colOptions = isSummaryMode
    ? [
        { key: 'index', label: 'N' },
        { key: 'name', label: 'Nomi' },
        { key: 'total', label: 'Barcha' },
        { key: 'percent', label: 'Davomat %' },
        { key: 'ontime', label: 'Vaqtida' },
        { key: 'late', label: 'Kechikkan' },
        { key: 'excused', label: 'Sababli' },
        { key: 'unexcused', label: 'Sababsiz' }
      ]
    : [
        { key: 'index', label: 'N' },
        { key: 'name', label: 'F.I.O' },
        { key: 'classOrDept', label: activeSection === 'department_detail' ? "Bo'lim / Lavozim" : 'Sinf' },
        { key: 'status', label: 'Holati' },
        { key: 'entryTime', label: 'Kirish vaqti' },
        { key: 'exitTime', label: 'Chiqish vaqti' },
        { key: 'reason', label: 'Sabab / Izoh' }
      ];

  return (
    <div className="flex flex-col lg:flex-row gap-3 min-h-[calc(100vh-140px)]">
      {/* CHAP SIDEBAR (Rasm 2 uslubida) */}
      <aside className="lg:w-64 shrink-0 print:hidden">
        {/* Mobil ochish tugmasi */}
        <div className="lg:hidden mb-2 flex items-center justify-between bg-slate-900 text-white px-3 py-2.5 rounded-xl">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>{sectionTitle}</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block bg-slate-900 text-slate-200 rounded-2xl shadow-lg border border-slate-800 overflow-hidden sticky top-16`}>
          {/* Sidebar Sarlavhasi */}
          <div className="p-4 border-b border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-black text-sm">
                SM
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-white tracking-wide truncate">
                  {currentSchool?.name || 'SmartMaktab'}
                </div>
                <div className="text-[11px] text-slate-400">Davomat Hisoboti</div>
              </div>
            </div>

            {/* Sidebar Search */}
            <div className="mt-3 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Bo'lim qidirish..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Asosiy 5 ta bo'lim */}
          <nav className="p-2 space-y-1">
            {filteredNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setPage(1);
                    setTableSearch('');
                    setStatusFilter('all');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left text-[11px] font-bold tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {(item.id === 'class_detail' || item.id === 'department_detail') && (
                    <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Tezkor statistika bloki */}
          <div className="p-3 m-2 rounded-xl bg-slate-800/70 border border-slate-700/60 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Umumiy davomat:</span>
              <span className="font-black text-emerald-400">{schoolTotals.percent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${schoolTotals.percent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>Kelgan: <b className="text-slate-200">{schoolTotals.present}</b></span>
              <span>Jami: <b className="text-slate-200">{schoolTotals.total}</b></span>
            </div>
          </div>
        </div>
      </aside>

      {/* ASOSIY KONTENT (Rasm 1 uslubida) */}
      <section className="flex-1 min-w-0 space-y-3">
        {/* Maktab miqyosida tezkor karta ko'rsatkichlari */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            onClick={() => { setStatusFilter('all'); setPage(1); }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === 'all' && !isSummaryMode
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 ring-1 ring-blue-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
            }`}
          >
            <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Barcha O'quvchi</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{schoolTotals.total}</div>
          </button>

          <button
            onClick={() => { if (!isSummaryMode) { setStatusFilter('ontime'); setPage(1); } }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === 'ontime' && !isSummaryMode
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 ring-1 ring-emerald-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
            }`}
          >
            <div className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Vaqtida</div>
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{schoolTotals.ontime}</div>
          </button>

          <button
            onClick={() => { if (!isSummaryMode) { setStatusFilter('late'); setPage(1); } }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === 'late' && !isSummaryMode
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 ring-1 ring-amber-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
            }`}
          >
            <div className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">Kechikkan</div>
            <div className="text-xl font-black text-amber-700 dark:text-amber-300 mt-0.5">{schoolTotals.late}</div>
          </button>

          <button
            onClick={() => { if (!isSummaryMode) { setStatusFilter('excused'); setPage(1); } }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === 'excused' && !isSummaryMode
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 ring-1 ring-blue-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
            }`}
          >
            <div className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">Sababli</div>
            <div className="text-xl font-black text-blue-700 dark:text-blue-300 mt-0.5">{schoolTotals.excused}</div>
          </button>

          <button
            onClick={() => { if (!isSummaryMode) { setStatusFilter('unexcused'); setPage(1); } }}
            className={`col-span-2 sm:col-span-1 p-3 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === 'unexcused' && !isSummaryMode
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 ring-1 ring-rose-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'
            }`}
          >
            <div className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400">Sababsiz</div>
            <div className="text-xl font-black text-rose-700 dark:text-rose-300 mt-0.5">{schoolTotals.unexcused}</div>
          </button>
        </div>

        {/* Asosiy Jadval Kartasi */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Sarlavha */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-800/40">
            <div>
              <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {sectionTitle}
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isSummaryMode
                  ? "Batafsil ro'yxatga o'tish uchun nomi ustiga bosing"
                  : `Jami ${totalEntries} ta yozuv ko'rsatilmoqda`}
              </p>
            </div>

            {/* Sana va Kechikish vaqti */}
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1">
                <button
                  onClick={() => shiftDate(-1)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="Oldingi kun"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ml-0.5" />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Sana:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => { setSelectedDate(e.target.value); setPage(1); }}
                  className="text-xs font-bold bg-transparent text-slate-900 dark:text-white outline-none cursor-pointer"
                />
                <button
                  onClick={() => shiftDate(1)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="Keyingi kun"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5" title="Kechikish chegarasi (shu vaqtdan keyin kirganlar kechikkan hisoblanadi)">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Kechikish:</span>
                <input
                  type="time"
                  value={lateThreshold}
                  onChange={(e) => setLateThreshold(e.target.value)}
                  className="text-xs font-bold bg-transparent text-slate-900 dark:text-white outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Kontekstli Filterlar (Sinf tanlash / Bo'lim tanlash / Holat filteri) */}
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 print:hidden">
            {activeSection === 'classes_summary' && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <button
                  onClick={() => { setGradeFilter('all'); setPage(1); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    gradeFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  Barcha sinflar
                </button>
                {availableGrades.map(g => (
                  <button
                    key={g}
                    onClick={() => { setGradeFilter(String(g)); setPage(1); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      String(gradeFilter) === String(g)
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {g}-sinf
                  </button>
                ))}
              </div>
            )}

            {activeSection === 'class_detail' && (
              <div className="flex flex-wrap items-center gap-2 w-full">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Sinfni tanlang:</span>
                  <select
                    value={activeClassId}
                    onChange={(e) => { setSelectedClassId(e.target.value); setPage(1); }}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sortedClasses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  {[
                    { id: 'all', label: 'Barchasi' },
                    { id: 'ontime', label: 'Vaqtida' },
                    { id: 'late', label: 'Kechikkan' },
                    { id: 'completed_all', label: 'Barcha darsga kirgan' },
                    { id: 'left_early', label: 'Ketib qolgan' },
                    { id: 'excused', label: 'Sababli' },
                    { id: 'unexcused', label: 'Sababsiz' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => { setStatusFilter(f.id); setPage(1); }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        statusFilter === f.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'department_detail' && (
              <div className="flex flex-wrap items-center gap-2 w-full">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Bo'limni tanlang:</span>
                  <select
                    value={activeDeptName}
                    onChange={(e) => { setSelectedDeptId(e.target.value); setPage(1); }}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {departmentNames.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  {[
                    { id: 'all', label: 'Barchasi' },
                    { id: 'ontime', label: 'Vaqtida' },
                    { id: 'late', label: 'Kechikkan' },
                    { id: 'completed_all', label: 'Barcha darsga kirgan' },
                    { id: 'left_early', label: 'Ketib qolgan' },
                    { id: 'excused', label: 'Sababli' },
                    { id: 'unexcused', label: 'Sababsiz' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => { setStatusFilter(f.id); setPage(1); }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        statusFilter === f.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'school' && (
              <div className="flex flex-wrap items-center gap-2 w-full">
                <select
                  value={selectedClassId || 'all'}
                  onChange={(e) => { setSelectedClassId(e.target.value === 'all' ? '' : e.target.value); setPage(1); }}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                >
                  <option value="all">Barcha sinflar ({sortedClasses.length})</option>
                  {sortedClasses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <div className="flex items-center gap-1 flex-wrap">
                  {[
                    { id: 'all', label: 'Barchasi' },
                    { id: 'ontime', label: 'Vaqtida' },
                    { id: 'late', label: 'Kechikkan' },
                    { id: 'completed_all', label: 'Barcha darsga kirgan' },
                    { id: 'left_early', label: 'Ketib qolgan' },
                    { id: 'excused', label: 'Sababli' },
                    { id: 'unexcused', label: 'Sababsiz' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => { setStatusFilter(f.id); setPage(1); }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        statusFilter === f.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Eksport tugmalari (Copy, CSV, Excel, PDF/Print, Column visibility) va Qidiruv */}
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 print:hidden">
            <div className="flex flex-wrap items-center gap-1 bg-slate-700 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 text-[11px] font-bold text-white hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
              <button
                onClick={handleCSV}
                className="px-2.5 py-1 text-[11px] font-bold text-white hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3 h-3" /> CSV
              </button>
              <button
                onClick={handleExcel}
                className="px-2.5 py-1 text-[11px] font-bold text-white hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <FileSpreadsheet className="w-3 h-3" /> Excel
              </button>
              <button
                onClick={handlePrint}
                className="px-2.5 py-1 text-[11px] font-bold text-white hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3 h-3" /> PDF / Print
              </button>

              {/* Column Visibility */}
              <div className="relative">
                <button
                  onClick={() => setShowColMenu(v => !v)}
                  className="px-2.5 py-1 text-[11px] font-bold text-white hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Columns className="w-3 h-3" /> Ustunlar
                </button>
                {showColMenu && (
                  <div className="absolute left-0 mt-1.5 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-30 space-y-1">
                    {colOptions.map(col => (
                      <button
                        key={col.key}
                        onClick={() => setVisibleCols(prev => ({ ...prev, [col.key]: !prev[col.key] }))}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        <span>{col.label}</span>
                        {visibleCols[col.key] && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Qidiruv va Sahifa hajmi */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => { setTableSearch(e.target.value); setPage(1); }}
                  placeholder="Qidirish..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(e.target.value === 'all' ? 'all' : Number(e.target.value));
                  setPage(1);
                }}
                className="text-xs font-bold px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
                title="Sahifadagi qatorlar soni"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="all">Barchasi</option>
              </select>
            </div>
          </div>

          {/* JADVAL */}
          <div className="overflow-x-auto">
            {isSummaryMode ? (
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                    {visibleCols.index && (
                      <th rowSpan={2} onClick={() => toggleSort('index')} className="px-3 py-2.5 text-left font-black border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none whitespace-nowrap">
                        N {renderSortIcon('index')}
                      </th>
                    )}
                    {visibleCols.name && (
                      <th rowSpan={2} onClick={() => toggleSort('name')} className="px-3 py-2.5 text-left font-black border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none whitespace-nowrap">
                        NOMI {renderSortIcon('name')}
                      </th>
                    )}
                    {visibleCols.total && (
                      <th rowSpan={2} onClick={() => toggleSort('total')} className="px-3 py-2.5 text-center font-black border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none whitespace-nowrap">
                        BARCHA {renderSortIcon('total')}
                      </th>
                    )}
                    {visibleCols.percent && (
                      <th rowSpan={2} onClick={() => toggleSort('percent')} className="px-3 py-2.5 text-center font-black border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none whitespace-nowrap">
                        DAVOMAT {renderSortIcon('percent')}
                      </th>
                    )}
                    {(visibleCols.ontime || visibleCols.late) && (
                      <th colSpan={(visibleCols.ontime ? 1 : 0) + (visibleCols.late ? 1 : 0)} className="px-3 py-1.5 text-center font-black border-b border-r border-slate-200 dark:border-slate-700 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300">
                        KELGANLAR
                      </th>
                    )}
                    {(visibleCols.excused || visibleCols.unexcused) && (
                      <th colSpan={(visibleCols.excused ? 1 : 0) + (visibleCols.unexcused ? 1 : 0)} className="px-3 py-1.5 text-center font-black border-b border-slate-200 dark:border-slate-700 bg-rose-50/70 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300">
                        KELMAGANLAR
                      </th>
                    )}
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    {visibleCols.ontime && (
                      <th onClick={() => toggleSort('ontime')} className="px-3 py-2 text-center font-bold border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none whitespace-nowrap">
                        VAQTIDA {renderSortIcon('ontime')}
                      </th>
                    )}
                    {visibleCols.late && (
                      <th onClick={() => toggleSort('late')} className="px-3 py-2 text-center font-bold border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none whitespace-nowrap">
                        KECHIKKAN {renderSortIcon('late')}
                      </th>
                    )}
                    {visibleCols.excused && (
                      <th onClick={() => toggleSort('excused')} className="px-3 py-2 text-center font-bold border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none whitespace-nowrap">
                        SABABLI {renderSortIcon('excused')}
                      </th>
                    )}
                    {visibleCols.unexcused && (
                      <th onClick={() => toggleSort('unexcused')} className="px-3 py-2 text-center font-bold cursor-pointer select-none whitespace-nowrap">
                        SABABSIZ {renderSortIcon('unexcused')}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                        Ma'lumot topilmadi
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        {visibleCols.index && (
                          <td className="px-3 py-2.5 text-slate-500 font-semibold border-r border-slate-100 dark:border-slate-800">
                            {startIdx + idx + 1}
                          </td>
                        )}
                        {visibleCols.name && (
                          <td className="px-3 py-2.5 border-r border-slate-100 dark:border-slate-800">
                            <button
                              onClick={() => {
                                if (activeSection === 'classes_summary') {
                                  setSelectedClassId(row.id);
                                  setActiveSection('class_detail');
                                } else {
                                  setSelectedDeptId(row.name);
                                  setActiveSection('department_detail');
                                }
                                setStatusFilter('all');
                                setTableSearch('');
                                setPage(1);
                              }}
                              className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer text-left"
                            >
                              {row.name}
                            </button>
                          </td>
                        )}
                        {visibleCols.total && (
                          <td className="px-3 py-2.5 text-center font-bold text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800">
                            {row.total}
                          </td>
                        )}
                        {visibleCols.percent && (
                          <td className={`px-3 py-2.5 text-center font-black border-r border-slate-100 dark:border-slate-800 ${getAttendanceBadgeClass(row.percent)}`}>
                            {row.percent}%
                          </td>
                        )}
                        {visibleCols.ontime && (
                          <td className="px-3 py-2.5 text-center font-semibold text-emerald-700 dark:text-emerald-400 border-r border-slate-100 dark:border-slate-800">
                            {row.ontime}
                          </td>
                        )}
                        {visibleCols.late && (
                          <td className="px-3 py-2.5 text-center font-semibold text-amber-700 dark:text-amber-400 border-r border-slate-100 dark:border-slate-800">
                            {row.late}
                          </td>
                        )}
                        {visibleCols.excused && (
                          <td className="px-3 py-2.5 text-center font-semibold text-blue-700 dark:text-blue-400 border-r border-slate-100 dark:border-slate-800">
                            {row.excused}
                          </td>
                        )}
                        {visibleCols.unexcused && (
                          <td className="px-3 py-2.5 text-center font-semibold text-rose-700 dark:text-rose-400">
                            {row.unexcused}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
                {summaryFooter && paginatedRows.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-100 dark:bg-slate-800 font-black text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                      {visibleCols.index && <td className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700" />}
                      {visibleCols.name && <td className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700">JAMI ({filteredAndSortedRows.length})</td>}
                      {visibleCols.total && <td className="px-3 py-2.5 text-center border-r border-slate-200 dark:border-slate-700">{summaryFooter.total}</td>}
                      {visibleCols.percent && (
                        <td className={`px-3 py-2.5 text-center border-r border-slate-200 dark:border-slate-700 ${getAttendanceBadgeClass(summaryFooter.percent)}`}>
                          {summaryFooter.percent}%
                        </td>
                      )}
                      {visibleCols.ontime && <td className="px-3 py-2.5 text-center border-r border-slate-200 dark:border-slate-700">{summaryFooter.ontime}</td>}
                      {visibleCols.late && <td className="px-3 py-2.5 text-center border-r border-slate-200 dark:border-slate-700">{summaryFooter.late}</td>}
                      {visibleCols.excused && <td className="px-3 py-2.5 text-center border-r border-slate-200 dark:border-slate-700">{summaryFooter.excused}</td>}
                      {visibleCols.unexcused && <td className="px-3 py-2.5 text-center">{summaryFooter.unexcused}</td>}
                    </tr>
                  </tfoot>
                )}
              </table>
            ) : (
              /* BATAFSIL RO'YXAT JADVALI (Maktab Miqyosida / Sinf Miqyosida / Bo'lim Miqyosida) */
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                    {visibleCols.index && (
                      <th onClick={() => toggleSort('index')} className="px-3 py-2.5 text-left font-black border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none whitespace-nowrap">
                        N {renderSortIcon('index')}
                      </th>
                    )}
                    {visibleCols.name && (
                      <th onClick={() => toggleSort('name')} className="px-3 py-2.5 text-left font-black border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none whitespace-nowrap">
                        F.I.O {renderSortIcon('name')}
                      </th>
                    )}
                    {visibleCols.classOrDept && (
                      <th onClick={() => toggleSort(activeSection === 'department_detail' ? 'roleLabel' : 'className')} className="px-3 py-2.5 text-left font-black border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none whitespace-nowrap">
                        {activeSection === 'department_detail' ? "BO'LIM / LAVOZIM" : 'SINF'} {renderSortIcon(activeSection === 'department_detail' ? 'roleLabel' : 'className')}
                      </th>
                    )}
                    {visibleCols.status && (
                      <th onClick={() => toggleSort('status')} className="px-3 py-2.5 text-center font-black border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none whitespace-nowrap">
                        HOLATI {renderSortIcon('status')}
                      </th>
                    )}
                    {visibleCols.entryTime && (
                      <th onClick={() => toggleSort('entryTime')} className="px-3 py-2.5 text-center font-black border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none whitespace-nowrap">
                        BIRINCHI KIRISH {renderSortIcon('entryTime')}
                      </th>
                    )}
                    {visibleCols.exitTime && (
                      <th onClick={() => toggleSort('exitTime')} className="px-3 py-2.5 text-center font-black border-r border-slate-200 dark:border-slate-700 cursor-pointer select-none whitespace-nowrap">
                        OXIRGI CHIQISH {renderSortIcon('exitTime')}
                      </th>
                    )}
                    {visibleCols.reason && (
                      <th className="px-3 py-2.5 text-left font-black whitespace-nowrap">
                        SABAB / IZOH
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                        Tanlangan filtr bo'yicha ma'lumot topilmadi
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row, idx) => (
                      <tr key={`${row.id}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        {visibleCols.index && (
                          <td className="px-3 py-2.5 text-slate-500 font-semibold border-r border-slate-100 dark:border-slate-800">
                            {startIdx + idx + 1}
                          </td>
                        )}
                        {visibleCols.name && (
                          <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white border-r border-slate-100 dark:border-slate-800">
                            {row.name}
                            {row.code && (
                              <span className="ml-1.5 text-[10px] font-mono text-slate-400">#{row.code}</span>
                            )}
                          </td>
                        )}
                        {visibleCols.classOrDept && (
                          <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                            {activeSection === 'department_detail' ? (
                              <span>{row.roleLabel || row.department}</span>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedClassId(row.classId);
                                  setActiveSection('class_detail');
                                  setPage(1);
                                }}
                                className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold hover:underline cursor-pointer"
                              >
                                {row.className}
                              </button>
                            )}
                          </td>
                        )}
                        {visibleCols.status && (
                          <td className="px-3 py-2.5 text-center border-r border-slate-100 dark:border-slate-800 space-y-1">
                            <div>{statusBadge(row.status)}</div>
                            {row.scheduleStatus && row.scheduleStatus !== 'absent' && row.scheduleStatus !== 'outdoor_lesson' && (
                              <div>
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  row.scheduleStatus === 'completed_all'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : row.scheduleStatus === 'left_early'
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                }`}>
                                  {row.scheduleStatus === 'completed_all' ? 'Barcha darsga kirgan' : row.scheduleLabel}
                                </span>
                              </div>
                            )}
                          </td>
                        )}
                        {visibleCols.entryTime && (
                          <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-700 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800">
                            {row.entryTime || '--:--'}
                          </td>
                        )}
                        {visibleCols.exitTime && (
                          <td className="px-3 py-2.5 text-center font-mono text-slate-500 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">
                            {row.exitTime || '--:--'}
                          </td>
                        )}
                        {visibleCols.reason && (
                          <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">
                            {row.reason || '—'}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pastki Pagination (Rasm 1 uslubida: Showing X to Y of Z entries | Previous 1 Next) */}
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 print:hidden">
            <div>
              {totalEntries === 0
                ? 'Showing 0 entries'
                : `Showing ${startIdx + 1} to ${Math.min(startIdx + effectivePageSize, totalEntries)} of ${totalEntries} entries`}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold">
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
