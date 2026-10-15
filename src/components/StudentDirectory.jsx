import React, { useState, useEffect, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { 
  Users, 
  Search, 
  MapPin, 
  Phone, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Save, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  GraduationCap, 
  FileText, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { 
  downloadStudentTemplate, 
  exportStudentsToExcel, 
  parseStudentsExcelFile 
} from '../utils/excelAndPromotion';
import { formatPhoneNumber, handlePhoneInputChange } from '../utils/phoneFormatter';
import { StudentAvatar } from './StudentAvatar';

export const StudentDirectory = () => {
  const { 
    students, 
    classes, 
    addStudent, 
    updateStudent, 
    deleteStudent, 
    resetToAllFaceStudents, 
    bridgeUrl, 
    changeStudentClass,
    promoteClasses,
    importStudentsFromExcel,
    isLocalConnected,
    globalStreamUrl
  } = useSchool();

  const effectiveBaseUrl = isLocalConnected ? (bridgeUrl || 'http://localhost:5001') : (globalStreamUrl || bridgeUrl || 'http://localhost:5001');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [visibleCount, setVisibleCount] = useState(60);

  // Qo'shish / Tahrirlash Modali
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Forma maydonlari
  const [fullName, setFullName] = useState('');
  const [classId, setClassId] = useState(classes[0]?.id || 'c-1a');
  const [gender, setGender] = useState("O'g'il");
  const [address, setAddress] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState('');

  // Excel Import Modali
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importParsedData, setImportParsedData] = useState([]);
  const [importTargetClass, setImportTargetClass] = useState(classes[0]?.id || 'c-1a');
  const [importLoading, setImportLoading] = useState(false);

  // Sinf Ko'tarish Modali
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [promoting, setPromoting] = useState(false);

  // Filtrlangan o'quvchilar
  const filtered = students.filter(st => {
    const matchesClass = selectedClass === 'all' || st.classId === selectedClass;
    const name = (st.fullName || st.name || '').toLowerCase();
    const addr = (st.address || '').toLowerCase();
    const ph = st.phone || '';
    const fid = st.studentId || st.faceId || '';
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q || name.includes(q) || addr.includes(q) || ph.includes(q) || fid.includes(q);

    return matchesClass && matchesSearch;
  });

  const selectedClassName = selectedClass === 'all' 
    ? 'Barcha_oquvchilar' 
    : (classes.find(c => c.id === selectedClass)?.name || 'Sinf');

  // Excel fayl yuklanganda tahlil qilish
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    try {
      const parsed = await parseStudentsExcelFile(file);
      setImportParsedData(parsed);
    } catch (err) {
      alert('Excel faylni o\'qishda xatolik yuz berdi: ' + err.message);
    }
  };

  const handleConfirmImport = async () => {
    if (importParsedData.length === 0) return;
    setImportLoading(true);
    try {
      await importStudentsFromExcel(importParsedData, importTargetClass);
      setImportModalOpen(false);
      setImportFile(null);
      setImportParsedData([]);
    } finally {
      setImportLoading(false);
    }
  };

  const handleConfirmPromote = async () => {
    setPromoting(true);
    try {
      await promoteClasses();
      setPromoteModalOpen(false);
    } finally {
      setPromoting(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Rasm hajmi juda katta (maksimal 10MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Standart Face-ID portret ruxsatiga siqish (max 480x480)
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 480;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setPhoto(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setCurrentId(null);
    setFullName('');
    setClassId(selectedClass !== 'all' ? selectedClass : (classes[0]?.id || 'c-1a'));
    setGender("O'g'il");
    setAddress('');
    setParentName('');
    setParentPhone('');
    setPhone('');
    setPhoto('');
    setModalOpen(true);
  };

  const openEditModal = (student) => {
    setIsEditMode(true);
    setCurrentId(student.id);
    setFullName(student.fullName || student.name);
    setClassId(student.classId);
    setGender(student.gender || "O'g'il");
    setAddress(student.address || '');
    setParentName(student.parentName || '');
    setParentPhone(formatPhoneNumber(student.parentPhone || student.phone || ''));
    setPhone(formatPhoneNumber(student.phone || student.parentPhone || ''));
    setPhoto(student.photo || student.photoUrl || '');
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const targetClass = classes.find(c => c.id === classId);
    const formattedPhone = formatPhoneNumber(parentPhone);

    const data = {
      fullName,
      name: fullName,
      classId,
      className: targetClass?.name || '1-A',
      grade: targetClass?.grade || 1,
      address,
      parentName,
      parentPhone: formattedPhone,
      phone: formattedPhone,
      gender: gender || "O'g'il",
      photo: photo || undefined
    };

    if (isEditMode) {
      updateStudent(currentId, data);
    } else {
      addStudent(data);
    }
    setModalOpen(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`${name} bazadan o'chirilsinmi?`)) {
      deleteStudent(id);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 space-y-3 transition-colors">
      
      {/* Yuqori qism: Sarlavha va Asosiy Boshqaruv Tugmalari */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              O'quvchilar Bazasi
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold">
              {students.length} nafar o'quvchi
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Excel orqali ommaviy yuklash, sinf ko'tarish va Face-ID o'quvchilar nazorati
          </p>
        </div>

        {/* Funksional tugmalar paneli */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* 1. Sinf Ko'tarish (Academic promotion) */}
          <button
            onClick={() => setPromoteModalOpen(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-all"
            title="11-sinf bitiradi, barcha sinflar 1 pog'onaga ko'tariladi, 1-sinflar bo'shaydi"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Sinf Ko'tarish</span>
          </button>

          {/* 2. Excel Import */}
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-all"
            title="Excel orqali yangi o'quvchilarni yuklash"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Excel Import</span>
          </button>

          {/* 3. Excel Eksport */}
          <button
            onClick={() => exportStudentsToExcel(filtered, selectedClassName)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
            title="Tanlangan ro'yxatni Excel fayl qilib yuklab olish"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel Eksport ({filtered.length})</span>
          </button>

          {/* 4. Excel Shablon */}
          <button
            onClick={downloadStudentTemplate}
            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1 transition-all"
            title="To'ldirish uchun namunaviy bo'sh Excel fayl"
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>Shablon</span>
          </button>

          {/* 5. Yangi O'quvchi Qo'shish */}
          <button
            onClick={openAddModal}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yangi O'quvchi</span>
          </button>
        </div>
      </div>

      {/* Qidiruv va Filtr */}
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="relative flex-1 min-w-[140px]">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="O'quvchi ismi, ID yoki manzili bo'yicha qidirish..."
            className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 transition-colors focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <select
          value={selectedClass}
          onChange={(e) => { setSelectedClass(e.target.value); setVisibleCount(60); }}
          className="text-xs p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 outline-none transition-colors font-bold"
        >
          <option value="all">Barcha sinflar ({students.length})</option>
          {classes.map(c => {
            const count = students.filter(s => s.classId === c.id).length;
            return <option key={c.id} value={c.id}>{c.name} ({count} ta)</option>;
          })}
        </select>
      </div>

      {/* Tezkor Sinf Tanlash Tugmalari (Chips) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
        <button
          onClick={() => { setSelectedClass('all'); setVisibleCount(60); }}
          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shrink-0 transition-all ${
            selectedClass === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Barchasi ({students.length})
        </button>
        {classes.map(c => {
          const count = students.filter(s => s.classId === c.id).length;
          const isSelected = selectedClass === c.id;
          return (
            <button
              key={c.id}
              onClick={() => { setSelectedClass(c.id); setVisibleCount(60); }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shrink-0 transition-all flex items-center gap-1 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{c.name}</span>
              <span className={`text-[9px] px-1 py-0.2 rounded-full font-mono ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* O'quvchilar Ro'yxati */}
      <div className="space-y-1.5">
        {filtered.length === 0 ? (
          <div className="py-12 text-center rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800">
            <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-600 dark:text-slate-400">Bu sinfda o'quvchi topilmadi</div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              "Excel Import" tugmasini bosib o'quvchilarni fayldan yuklashingiz mumkin
            </p>
          </div>
        ) : (
          <>
            {filtered.slice(0, visibleCount).map(st => {
              const cl = classes.find(c => c.id === st.classId);

              return (
                <div
                  key={st.id}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Face-ID Yuz Surati */}
                    <StudentAvatar student={st} effectiveBaseUrl={effectiveBaseUrl} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{st.fullName || st.name}</span>
                        
                        {/* 1-Klik Sinfni o'zgartirish tanlagichi */}
                        <div className="flex items-center gap-1">
                          <select
                            value={st.classId || ''}
                            onChange={(e) => changeStudentClass(st.id, e.target.value)}
                            className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded outline-none hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer"
                            title="Sinfni to'g'ridan-to'g'ri almashtirish (Serverda saqlanadi)"
                          >
                            <option value="">Sinf tanlang</option>
                            {classes.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <span className="text-[10px] text-slate-400 font-mono">#{st.studentId || st.faceId || st.id}</span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 truncate max-w-[200px]" title={st.address}>
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          <span className="truncate">{st.address || 'Manzil yo\'q'}</span>
                        </span>
                        <span>•</span>
                        <span>Ota-onasi: <b className="text-slate-700 dark:text-slate-300">{st.parentName || 'Kiritilmagan'}</b></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    {st.parentPhone ? (
                      <a
                        href={`tel:${st.parentPhone}`}
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40"
                      >
                        <Phone className="w-3 h-3" />
                        {formatPhoneNumber(st.parentPhone)}
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400">Tel yo'q</span>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(st)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(st.id, st.fullName || st.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length > visibleCount && (
              <div className="pt-2 text-center">
                <button
                  onClick={() => setVisibleCount(prev => prev + 60)}
                  className="px-4 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                >
                  Ko'proq yuklash ({visibleCount} / {filtered.length})
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ============================================================== */}
      {/* 📥 1. EXCEL IMPORT MODALI */}
      {/* ============================================================== */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg text-emerald-600">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Excel Orqali O'quvchilarni Yuklash</h3>
                  <p className="text-[11px] text-slate-500">1-sinflar yoki istalgan boshqa sinfga ommaviy yuklash</p>
                </div>
              </div>
              <button onClick={() => setImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Fayl yuklash maydoni */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  1. Excel Faylni Tanlang (.xlsx, .xls, .csv):
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-emerald-500 transition-colors bg-slate-50 dark:bg-slate-800/40">
                  <Upload className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="excel-file-upload"
                  />
                  <label
                    htmlFor="excel-file-upload"
                    className="cursor-pointer px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg inline-block shadow-xs"
                  >
                    Faylni Tanlash
                  </label>
                  {importFile ? (
                    <div className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Tanlandi: {importFile.name} ({importParsedData.length} ta o'quvchi aniqlandi)
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-2">
                      yoki tayyor shablonni to'ldirib yuklang
                    </p>
                  )}
                </div>
              </div>

              {/* Biriktiriladigan sinf */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  2. Asosiy Sinfni Tanlang (Excelda sinf ko'rsatilmagan bo'lsa):
                </label>
                <select
                  value={importTargetClass}
                  onChange={(e) => setImportTargetClass(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold outline-none"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} sinfi</option>
                  ))}
                </select>
              </div>

              {/* Dastlabki ko'rinish (Preview) */}
              {importParsedData.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700 max-h-36 overflow-y-auto space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Yuklanadigan o'quvchilardan namunalar:
                  </div>
                  {importParsedData.slice(0, 4).map((row, idx) => (
                    <div key={idx} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-1">
                      <span className="font-semibold">{idx + 1}. {row.fullName}</span>
                      <span className="text-[10px] text-slate-400">{formatPhoneNumber(row.parentPhone || row.phone) || 'Tel yo\'q'}</span>
                    </div>
                  ))}
                  {importParsedData.length > 4 && (
                    <div className="text-[10px] text-slate-400 italic text-center">
                      ...va yana {importParsedData.length - 4} ta o'quvchi
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pastki tugmalar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={downloadStudentTemplate}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <FileText className="w-3.5 h-3.5" />
                Namuna Shablonini Ko'chirib Olish
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  disabled={importParsedData.length === 0 || importLoading}
                  onClick={handleConfirmImport}
                  className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{importLoading ? 'Yuklanmoqda...' : `Tizimga Qo'shish (${importParsedData.length})`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 🎓 2. SINF KO'TARISH MODALI (AKADEMIK YIL BOSHI) */}
      {/* ============================================================== */}
      {promoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-purple-50 dark:bg-purple-950/60 rounded-xl text-purple-600">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Sinf Ko'tarishni tasdiqlaysizmi?
                </h3>
                <p className="text-[11px] text-slate-500">Yangi akademik o'quv yiliga o'tish va sinflarni yangilash</p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Ushbu amal quyidagi qat'iy o'zgarishlarni kiritadi:</span>
              </div>
              <ul className="text-xs text-amber-900 dark:text-amber-200/90 space-y-2 pl-5 list-disc">
                <li>
                  <b>11-sinf o'quvchilari ({students.filter(s => (s.className || '').startsWith('11-') || s.grade === 11).length} nafar):</b>{' '}
                  Maktabni tugatganlar (Bitiruvchilar) toifasiga o'tkaziladi.
                </li>
                <li>
                  <b>Barcha 1-10 sinflar ({students.filter(s => (s.grade || 1) < 11 && !(s.className || '').includes('Bitiruvchi')).length} nafar):</b>{' '}
                  Harflari mutlaqo o'zgarmasdan, faqat oldidagi soni 1 taga oshadi (<i>masalan: 1-A ➔ 2-A, 2-B ➔ 3-B, 3-D ➔ 4-D, 10-A ➔ 11-A</i>).
                </li>
                <li>
                  <b>Yangi 1-sinflar (2 ta):</b> Yangi 1-A va 1-B sinflari ochiladi va bo'sh holatda yangi o'quvchilarni qabul qilish uchun tayyor bo'ladi.
                </li>
                <li>
                  <b>Lokal va Global sinxronlash:</b> Yangilangan barcha o'quvchilar va sinflar ro'yxati bir zumda kompyuterda hamda Supabase bulut bazasida saqlanadi.
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPromoteModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={promoting}
                onClick={handleConfirmPromote}
                className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{promoting ? 'Ko\'tarilmoqda...' : 'Ha, tasdiqlayman (Sinflarni ko\'tarish)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ✏️ 3. O'QUVCHI QO'SHISH / TAHRIRLASH MODALI */}
      {/* ============================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-4 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                {isEditMode ? "O'quvchini Tahrirlash" : "Yangi O'quvchi Qo'shish"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5">
              {/* Face-ID Yuz Surati Yuklash */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                  {photo ? (
                    <img src={photo} alt="Yuz surati" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Camera className="w-5 h-5 mb-0.5" />
                      <span className="text-[9px] font-bold">Rasm</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1">
                    <span>Face-ID Yuz Surati</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-normal">(Kamera uchun)</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <label className="cursor-pointer px-2.5 py-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-xs">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{photo ? "O'zgartirish" : "Rasm tanlash"}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="user"
                        className="hidden" 
                        onChange={handlePhotoSelect} 
                      />
                    </label>
                    {photo && (
                      <button
                        type="button"
                        onClick={() => setPhoto('')}
                        className="px-2 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      >
                        O'chirish
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 leading-tight">
                    O'quvchining yuzi to'g'ri ko'ringan selfi yoki hujjat rasmi
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">F.I.Sh:</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masalan: Aliyev Vali Olimovich"
                  className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded outline-none focus:ring-1 focus:ring-blue-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">Sinfi:</label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none font-bold"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name} sinfi</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">Jinsi:</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none font-bold"
                  >
                    <option value="O'g'il">O'g'il bola</option>
                    <option value="Qiz">Qiz bola</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">Yashash Manzili:</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Mahalla, ko'cha, uy raqami"
                  className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded outline-none focus:ring-1 focus:ring-blue-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">Ota-onasi F.I.Sh:</label>
                <input
                  type="text"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Masalan: Olim Aliyev (Otasi)"
                  className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded outline-none focus:ring-1 focus:ring-blue-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">Telefon raqami:</label>
                <input
                  type="text"
                  required
                  value={parentPhone}
                  onChange={(e) => handlePhoneInputChange(e.target.value, setParentPhone)}
                  placeholder="+998-90-123-45-67"
                  maxLength={17}
                  className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-700 rounded outline-none focus:ring-1 focus:ring-blue-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-1.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded flex items-center gap-1 shadow-sm transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
