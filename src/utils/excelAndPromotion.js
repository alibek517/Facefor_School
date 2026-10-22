import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { formatPhoneNumber } from './phoneFormatter';

/**
 * Rasmni optimal o'lchamda (480px) va yengil JPEG (Base64) formatiga siqish
 * Bu Face-ID apparatlari tez qabul qilishi va Supabase xotirasini tejash uchun zarur
 */
export async function compressImageBase64(dataUrlOrFile, maxWidth = 480, quality = 0.85) {
  if (!dataUrlOrFile) return null;
  return new Promise((resolve) => {
    let src = '';
    if (typeof dataUrlOrFile === 'string') {
      src = dataUrlOrFile;
    } else if (typeof window !== 'undefined' && (dataUrlOrFile instanceof Blob || dataUrlOrFile instanceof File)) {
      src = URL.createObjectURL(dataUrlOrFile);
    } else {
      return resolve(null);
    }

    if (typeof Image === 'undefined') {
      return resolve(typeof dataUrlOrFile === 'string' ? dataUrlOrFile : null);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        if (src.startsWith('blob:')) URL.revokeObjectURL(src);
        resolve(compressed);
      } catch (e) {
        if (src.startsWith('blob:')) URL.revokeObjectURL(src);
        resolve(typeof dataUrlOrFile === 'string' ? dataUrlOrFile : null);
      }
    };
    img.onerror = () => {
      if (src.startsWith('blob:')) URL.revokeObjectURL(src);
      resolve(typeof dataUrlOrFile === 'string' ? dataUrlOrFile : null);
    };
    img.src = src;
  });
}

/**
 * .xlsx fayli ichiga joylashtirilgan haqiqiy fotosuratlarni JSZip orqali ajratib olish
 */
export async function extractEmbeddedImagesFromXlsx(arrayBuffer) {
  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    // 1. xl/media/ ichidagi barcha rasm fayllarini yig'ish
    const mediaMap = new Map();
    for (const [filename, file] of Object.entries(zip.files)) {
      if (filename.startsWith('xl/media/')) {
        const ext = filename.split('.').pop().toLowerCase();
        let mime = 'image/jpeg';
        if (ext === 'png') mime = 'image/png';
        else if (ext === 'webp') mime = 'image/webp';
        else if (ext === 'gif') mime = 'image/gif';

        const b64 = await file.async('base64');
        const basename = filename.replace('xl/media/', '');
        mediaMap.set(basename, `data:${mime};base64,${b64}`);
      }
    }

    if (mediaMap.size === 0) {
      return { rowImageMap: new Map(), sequentialImages: [] };
    }

    // 2. xl/drawings/_rels/drawing1.xml.rels orqali rId -> rasm fayli bog'lanishini topish
    const relsMap = new Map();
    for (const [filename, file] of Object.entries(zip.files)) {
      if (filename.includes('drawings/_rels/drawing') && filename.endsWith('.rels')) {
        const relsXml = await file.async('text');
        const relMatches = relsXml.matchAll(/<Relationship[^>]+Id="([^"]+)"[^>]+Target="([^"]+)"/g);
        for (const match of relMatches) {
          const rId = match[1];
          const target = match[2];
          const targetBasename = target.split('/').pop();
          relsMap.set(rId, targetBasename);
        }
      }
    }

    // 3. xl/drawings/drawing1.xml orqali qaysi qatorga (xdr:row) tegishli ekanini aniqlash
    const rowImageMap = new Map(); // 0-based row -> dataUrl
    for (const [filename, file] of Object.entries(zip.files)) {
      if (filename.includes('drawings/drawing') && !filename.includes('_rels') && filename.endsWith('.xml')) {
        const drawingXml = await file.async('text');

        const anchorRegex = /<xdr:(?:twoCellAnchor|oneCellAnchor)[^>]*>([\s\S]*?)<\/xdr:(?:twoCellAnchor|oneCellAnchor)>/g;
        let anchorMatch;
        while ((anchorMatch = anchorRegex.exec(drawingXml)) !== null) {
          const anchorContent = anchorMatch[1];
          const rowMatch = anchorContent.match(/<xdr:from>[\s\S]*?<xdr:row>(\d+)<\/xdr:row>/);
          const embedMatch = anchorContent.match(/<a:blip[^>]+(?:r:embed|embed)="([^"]+)"/);

          if (rowMatch && embedMatch) {
            const rowIndex = parseInt(rowMatch[1], 10);
            const rId = embedMatch[1];
            const mediaBasename = relsMap.get(rId);
            if (mediaBasename && mediaMap.has(mediaBasename)) {
              rowImageMap.set(rowIndex, mediaMap.get(mediaBasename));
            }
          }
        }
      }
    }

    // 4. Excel 365 / In-cell rasmlar (xl/cellImages.xml)
    for (const [filename, file] of Object.entries(zip.files)) {
      if (filename.includes('cellImages.xml') && !filename.includes('_rels')) {
        const cellImgXml = await file.async('text');
        const cellRelsFile = zip.files['xl/_rels/cellImages.xml.rels'];
        const cellRelsMap = new Map();
        if (cellRelsFile) {
          const cellRelsXml = await cellRelsFile.async('text');
          const relMatches = cellRelsXml.matchAll(/<Relationship[^>]+Id="([^"]+)"[^>]+Target="([^"]+)"/g);
          for (const match of relMatches) {
            cellRelsMap.set(match[1], match[2].split('/').pop());
          }
        }
        const embedMatches = cellImgXml.matchAll(/<a:blip[^>]+(?:r:embed|embed)="([^"]+)"/g);
        let cIdx = 1;
        for (const match of embedMatches) {
          const rId = match[1];
          const mediaBasename = cellRelsMap.get(rId);
          if (mediaBasename && mediaMap.has(mediaBasename) && !rowImageMap.has(cIdx)) {
            rowImageMap.set(cIdx, mediaMap.get(mediaBasename));
          }
          cIdx++;
        }
      }
    }

    const sequentialImages = Array.from(mediaMap.values());
    return { rowImageMap, sequentialImages };
  } catch (err) {
    console.warn('[EXCEL IMAGE EXTRACT] Rasm ajratishda xatolik:', err);
    return { rowImageMap: new Map(), sequentialImages: [] };
  }
}

/**
 * Bo'sh Excel Shablon yaratish va yuklab olish
 */
export function downloadStudentTemplate() {
  const sampleData = [
    {
      'Ism-familiya': 'Abdullayev Jasur Rustamovich',
      'Telefon raqami': '+998-90-123-45-67',
      'Manzil': 'Bog\'ot tumani, Guliston MFY, 15-uy',
      'Ota-onasi': 'Abdullayev Rustam',
      'Sinf': '1-A',
      'Rasm': 'Excelga rasm qo\'yishingiz yoki saytda biriktirishingiz mumkin'
    },
    {
      'Ism-familiya': 'Karimova Madina Sherzod qizi',
      'Telefon raqami': '+998-91-987-65-43',
      'Manzil': 'Bog\'ot tumani, Yangiobod MFY, 8-uy',
      'Ota-onasi': 'Karimov Sherzod',
      'Sinf': '1-A',
      'Rasm': ''
    },
    {
      'Ism-familiya': 'Yo\'ldoshev Bobur Alisher o\'g\'li',
      'Telefon raqami': '+998-93-555-11-22',
      'Manzil': 'Bog\'ot tumani, Istiqlol MFY, 24-uy',
      'Ota-onasi': 'Yo\'ldoshev Alisher',
      'Sinf': '1-B',
      'Rasm': ''
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  
  // Ustunlar kengligini chiroyli moslashtirish
  worksheet['!cols'] = [
    { wch: 34 }, // Ism-familiya
    { wch: 18 }, // Telefon raqami
    { wch: 38 }, // Manzil
    { wch: 24 }, // Ota-onasi
    { wch: 10 }, // Sinf
    { wch: 28 }, // Rasm
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
    'Rasm': st.photo ? 'Mavjud (Surat bor)' : (st.faceURL || '')
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
 * Yuklangan Excel faylni o'qish, formatlash va ichidagi fotosuratlarni avtomatik ajratib olish
 */
export async function parseStudentsExcelFile(file) {
  const arrayBuffer = await file.arrayBuffer();

  // 1. Excel ichidagi rasmlarni JSZip orqali ajratib olish
  const { rowImageMap, sequentialImages } = await extractEmbeddedImagesFromXlsx(arrayBuffer);

  // 2. Jadval matn ma'lumotlarini SheetJS orqali o'qish
  const data = new Uint8Array(arrayBuffer);
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  // 3. Har bir o'quvchi ma'lumotlarini rasmlari bilan jamlash
  const parsedPromises = rawJson.map(async (row, index) => {
    const name = row['Ism-familiya'] || row['F.I.SH'] || row['F.I.Sh'] || row['Ism'] || row['Name'] || row['FIO'] || '';
    const rawPhone = String(row['Telefon raqami'] || row['Telefon'] || row['Phone'] || row['Tel'] || '').trim();
    const phone = formatPhoneNumber(rawPhone);
    const address = String(row['Manzil'] || row['Address'] || '').trim();
    const parentName = String(row['Ota-onasi'] || row['Ota-ona'] || row['Parent'] || '').trim();
    const className = String(row['Sinf'] || row['Class'] || '').trim();

    // Rasm ustunidagi qiymat (agar to'g'ridan-to'g'ri Base64 yoki URL yozilgan bo'lsa)
    const rawPhotoCell = String(row['Rasm'] || row['Photo'] || row['Image'] || row['Rasm havolasi'] || '').trim();

    // Excel chizmasidan (ichidagi haqiqiy rasmdan) olingan surat:
    // Header qatori odatda 0-indeks, 1-o'quvchi esa row=1
    let extractedImage = rowImageMap.get(index + 1) || null;
    if (!extractedImage && rowImageMap.has(index)) {
      extractedImage = rowImageMap.get(index);
    }
    // Agar chizma koordinatasi mos kelmasa, lekin rasm mavjud bo'lsa navbat bo'yicha olish
    if (!extractedImage && sequentialImages.length > 0 && index < sequentialImages.length) {
      extractedImage = sequentialImages[index];
    }

    let finalPhoto = null;
    let hasExtractedPhoto = false;

    if (extractedImage) {
      finalPhoto = await compressImageBase64(extractedImage, 480, 0.85);
      hasExtractedPhoto = true;
    } else if (rawPhotoCell && (rawPhotoCell.startsWith('data:image/') || rawPhotoCell.startsWith('http://') || rawPhotoCell.startsWith('https://'))) {
      finalPhoto = rawPhotoCell.startsWith('data:image/') ? await compressImageBase64(rawPhotoCell, 480, 0.85) : rawPhotoCell;
      hasExtractedPhoto = true;
    }

    return {
      tempId: `imported-${Date.now()}-${index}`,
      name,
      fullName: name,
      phone,
      parentPhone: phone,
      parentName: parentName || 'Ota-ona',
      address: address || 'Bog\'ot tumani',
      faceURL: finalPhoto && finalPhoto.startsWith('http') ? finalPhoto : null,
      photo: finalPhoto,
      photoUrl: finalPhoto,
      hasExtractedPhoto,
      className,
      gender: "O'g'il"
    };
  });

  const parsedStudents = await Promise.all(parsedPromises);
  return parsedStudents.filter(st => st.fullName && st.fullName.trim().length > 0);
}

/**
 * Foydalanuvchi kompyuteridan ommaviy yuklagan rasmlarni o'quvchilarga avtomatik biriktirish
 * Ismlar, raqamlar yoki navbat asosida moslashtiradi
 */
export async function matchPhotosToStudents(studentsList, photoFiles) {
  if (!studentsList || studentsList.length === 0 || !photoFiles || photoFiles.length === 0) {
    return { updatedList: studentsList, matchedCount: 0 };
  }

  const filesArray = Array.from(photoFiles);
  const fileDataPromises = filesArray.map(async (file) => {
    const base64 = await compressImageBase64(file, 480, 0.85);
    const cleanFileName = file.name
      .replace(/\.[^/.]+$/, '') // kengaytmani olib tashlash
      .toLowerCase()
      .trim();
    return {
      name: cleanFileName,
      originalName: file.name,
      base64
    };
  });

  const processedFiles = await Promise.all(fileDataPromises);
  const usedFiles = new Set();
  let matchedCount = 0;

  const updatedList = studentsList.map((st, idx) => {
    // Agar o'quvchida allaqachon rasm bo'lsa
    if (st.photo) return st;

    const stFullName = (st.fullName || st.name || '').toLowerCase().trim();
    const stParts = stFullName.split(/\s+/).filter(Boolean);

    // 1. Ism bo'yicha to'liq yoki qisman moslikni qidirish
    let found = processedFiles.find((pf, fIdx) => {
      if (usedFiles.has(fIdx)) return false;
      if (pf.name === stFullName) return true;
      // Agar fayl nomi o'quvchining 2 ta so'zini o'z ichiga olsa (masalan: "abdullayev jasur")
      const matchesAllParts = stParts.length >= 2 && stParts.slice(0, 2).every(p => pf.name.includes(p));
      return matchesAllParts;
    });

    // 2. Tartib raqami bo'yicha moslik (1.jpg, 01.png, 2.jpeg...)
    if (!found) {
      const rowNumStr = String(idx + 1);
      const rowPadded = rowNumStr.padStart(2, '0');
      found = processedFiles.find((pf, fIdx) => {
        if (usedFiles.has(fIdx)) return false;
        return pf.name === rowNumStr || pf.name === rowPadded || pf.name.startsWith(rowNumStr + '_') || pf.name.startsWith(rowPadded + '_');
      });
    }

    if (found) {
      const foundIdx = processedFiles.indexOf(found);
      usedFiles.add(foundIdx);
      matchedCount++;
      return {
        ...st,
        photo: found.base64,
        photoUrl: found.base64,
        hasExtractedPhoto: true
      };
    }

    return st;
  });

  // 3. Agar hali ham rasm tegmagan o'quvchilar va ishlatilmagan rasmlar qolgan bo'lsa, navbat bo'yicha qo'yish
  const remainingFiles = processedFiles.filter((_, fIdx) => !usedFiles.has(fIdx));
  let remIdx = 0;

  const finalList = updatedList.map(st => {
    if (!st.photo && remIdx < remainingFiles.length) {
      const nextPhoto = remainingFiles[remIdx++];
      matchedCount++;
      return {
        ...st,
        photo: nextPhoto.base64,
        photoUrl: nextPhoto.base64,
        hasExtractedPhoto: true
      };
    }
    return st;
  });

  return { updatedList: finalList, matchedCount };
}

/**
 * Sinf ko'tarish algoritmi (Yangi o'quv yiliga o'tish)
 */
export function promoteAllClasses(students, classes) {
  let graduatedCount = 0;
  let promotedCount = 0;

  const classesList = [...classes];
  const classMap = new Map();

  classesList.forEach(c => {
    classMap.set(c.name.toUpperCase().trim(), c);
  });

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
    if (student.classId === 'graduated' || student.grade >= 12 || (student.className || '').includes('Bitiruvchi')) {
      return student;
    }

    const currentClass = classes.find(c => c.id === student.classId);
    const rawClassName = student.className || currentClass?.name || '';

    const match = rawClassName.match(/^(\d+)-([A-Za-z\u0400-\u04FF]+)/);
    const currentGrade = match ? parseInt(match[1], 10) : (currentClass?.grade || student.grade || 1);
    const sectionLetter = match ? match[2].toUpperCase() : (currentClass?.name?.split('-')[1] || 'A');

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
