import * as XLSX from 'xlsx';
import { formatPhoneNumber } from './phoneFormatter';

/**
 * Bo'sh Excel Shablon yaratish va yuklab olish
 */
export function downloadStudentTemplate() {
  const sampleData = [
    {
      'Ism-familiya': 'Abdullayev Jasur Rustamovich',
      'Telefon raqami': '+998-90-123-45-67',
      'Manzil': 'Bog\'ot tumani, Guliston MFY, 15-uy',
      'Rasm havolasi': '',
      'Ota-onasi': 'Abdullayev Rustam',
      'Sinf': '1-A'
    },
    {
      'Ism-familiya': 'Karimova Madina Sherzod qizi',
      'Telefon raqami': '+998-91-987-65-43',
      'Manzil': 'Bog\'ot tumani, Yangiobod MFY, 8-uy',
      'Rasm havolasi': '',
      'Ota-onasi': 'Karimov Sherzod',
      'Sinf': '1-A'
    },
    {
      'Ism-familiya': 'Yo\'ldoshev Bobur Alisher o\'g\'li',
      'Telefon raqami': '+998-93-555-11-22',
      'Manzil': 'Bog\'ot tumani, Istiqlol MFY, 24-uy',
      'Rasm havolasi': '',
      'Ota-onasi': 'Yo\'ldoshev Alisher',
      'Sinf': '1-B'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  
  // Ustunlar kengligini chiroyli moslashtirish
  worksheet['!cols'] = [
    { wch: 32 }, // Ism-familiya
    { wch: 18 }, // Telefon raqami
    { wch: 38 }, // Manzil
    { wch: 25 }, // Rasm havolasi
    { wch: 22 }, // Ota-onasi
    { wch: 10 }, // Sinf
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Oquvchilar_Shablon');
  XLSX.writeFile(workbook, 'oquvchilar_shablon.xlsx');
}

/**
 * O'quvchilar ro'yxatini Excelga eksport qilish (.xlsx)
 */
export function exportStudentsToExcel(studentsList, className = 'Barcha_oquvchilar') {
  const rows = studentsList.map((st, idx) => ({
    'T/r': idx + 1,
    'ID': st.studentId || st.id,
    'Ism-familiya': st.fullName || st.name,
    'Sinf': st.className || '',
    'Telefon raqami': formatPhoneNumber(st.parentPhone || st.phone || ''),
    'Ota-onasi': st.parentName || '',
    'Manzil': st.address || '',
    'Rasm havolasi': st.faceURL || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 32 },
    { wch: 10 },
    { wch: 18 },
    { wch: 22 },
    { wch: 35 },
    { wch: 25 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Oquvchilar');
  const safeName = className.replace(/[^a-zA-Z0-9_\u0400-\u04FF]/g, '_');
  XLSX.writeFile(workbook, `oquvchilar_${safeName}.xlsx`);
}

/**
 * Yuklangan Excel faylni o'qish va formatlash
 */
export async function parseStudentsExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const parsedStudents = rawJson.map((row, index) => {
          // Turli ustun nomlarini moslashtirish (F.I.Sh, Ism, Full Name...)
          const name = row['Ism-familiya'] || row['F.I.SH'] || row['F.I.Sh'] || row['Ism'] || row['Name'] || row['FIO'] || '';
          const rawPhone = String(row['Telefon raqami'] || row['Telefon'] || row['Phone'] || row['Tel'] || '').trim();
          const phone = formatPhoneNumber(rawPhone);
          const address = String(row['Manzil'] || row['Address'] || '').trim();
          const faceURL = String(row['Rasm havolasi'] || row['Rasm'] || row['Photo'] || row['Image'] || '').trim();
          const parentName = String(row['Ota-onasi'] || row['Ota-ona'] || row['Parent'] || '').trim();
          const className = String(row['Sinf'] || row['Class'] || '').trim();

          return {
            tempId: `imported-${Date.now()}-${index}`,
            name,
            fullName: name,
            phone,
            parentPhone: phone,
            parentName: parentName || 'Ota-ona',
            address: address || 'Bog\'ot tumani',
            faceURL: faceURL || null,
            className
          };
        }).filter(st => st.fullName && st.fullName.trim().length > 0);

        resolve(parsedStudents);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Sinf ko'tarish algoritmi (Yangi o'quv yiliga o'tish)
 * 1. 11-sinf: maktabni tugatadi (Bitiruvchi)
 * 2. 1-10 sinflar: harflari o'zgarmasdan faqat oldidagi soni 1 taga oshadi (masalan: 1-A -> 2-A, 3-D -> 4-D, 10-A -> 11-A)
 * 3. 1-sinflar 2 ta bo'lib yangi yaratiladi (1-A va 1-B) va bo'sh bo'ladi
 * 4. Barcha o'zgarishlar local va global (Supabase) da saqlanadi
 */
export function promoteAllClasses(students, classes) {
  let graduatedCount = 0;
  let promotedCount = 0;

  // Mavjud sinflar ro'yxati nusxasi
  const classesList = [...classes];
  const classMap = new Map();

  classesList.forEach(c => {
    classMap.set(c.name.toUpperCase().trim(), c);
  });

  // Yangi sinf kerak bo'lsa topish yoki yaratish
  const getOrCreateClass = (targetName, grade, letter) => {
    const key = targetName.toUpperCase().trim();
    if (classMap.has(key)) return classMap.get(key);

    const safeLetter = letter.toLowerCase();
    const newClass = {
      id: `c-${grade}${safeLetter}`,
      grade: grade,
      name: targetName,
      room: `${grade * 100 + 1}-xona`
    };
    classMap.set(key, newClass);
    classesList.push(newClass);
    return newClass;
  };

  const updatedStudents = students.map(student => {
    // Agar allaqachon bitiruvchi bo'lsa
    if (student.classId === 'graduated' || student.grade >= 12 || (student.className || '').includes('Bitiruvchi')) {
      return student;
    }

    const currentClass = classes.find(c => c.id === student.classId);
    const rawClassName = student.className || currentClass?.name || '';

    // Sinf raqami va harfini aniq ajratish (Masalan: "10-A", "3-B", "3-D", "7-D UT/ДО", "1-A")
    const match = rawClassName.match(/^(\d+)-([A-Za-z\u0400-\u04FF]+)/);
    const currentGrade = match ? parseInt(match[1], 10) : (currentClass?.grade || student.grade || 1);
    const sectionLetter = match ? match[2].toUpperCase() : (currentClass?.name?.split('-')[1] || 'A');

    // 11-sinf o'quvchilari maktabni bitiradi
    if (currentGrade >= 11) {
      graduatedCount++;
      return {
        ...student,
        grade: 12,
        classId: 'graduated',
        className: 'Maktabni tugatgan (Bitiruvchi)',
        status: 'graduated',
        graduatedYear: new Date().getFullYear()
      };
    }

    // 1-10 sinflar: Harfi o'zgarmasdan, faqat oldidagi soni 1 taga oshadi!
    const nextGrade = currentGrade + 1;
    const targetClassName = `${nextGrade}-${sectionLetter}`;
    const nextClass = getOrCreateClass(targetClassName, nextGrade, sectionLetter);

    promotedCount++;
    return {
      ...student,
      grade: nextGrade,
      classId: nextClass.id,
      className: nextClass.name
    };
  });

  // 1-sinflar 2 ta bo'lib yangi yaratiladi (1-A va 1-B)
  const finalClasses = classesList.filter(c => {
    if (c.grade === 1) {
      return c.name === '1-A' || c.name === '1-B';
    }
    return true;
  });

  if (!finalClasses.some(c => c.name === '1-A')) {
    finalClasses.push({ id: 'c-1a', grade: 1, name: '1-A', room: '101-xona' });
  }
  if (!finalClasses.some(c => c.name === '1-B')) {
    finalClasses.push({ id: 'c-1b', grade: 1, name: '1-B', room: '102-xona' });
  }

  // Sinflarni tartiblash (1-A, 1-B, 2-A, 2-B, ...)
  finalClasses.sort((a, b) => {
    if (a.grade !== b.grade) return a.grade - b.grade;
    return a.name.localeCompare(b.name, undefined, { numeric: true });
  });

  return {
    updatedStudents,
    updatedClasses: finalClasses,
    graduatedCount,
    promotedCount
  };
}
