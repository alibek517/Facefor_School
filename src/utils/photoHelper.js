/**
 * O'quvchi yoki xodim rasmining birlamchi (Primary) va zaxira (Fallback) URL'larini aniqlash.
 * Ushbu yordamchi funksiya rasmlarni global internetda (Vercel, mobil telefonlar) ham,
 * maktab lokal tarmog'ida ham 100% kafolatli ko'rsatishni ta'minlaydi.
 */

export const getCleanIdAndPadded = (studentOrEmp) => {
  if (!studentOrEmp) return { cleanId: '', paddedId: '', rawId: '' };

  let rawId = '';
  if (typeof studentOrEmp === 'string' || typeof studentOrEmp === 'number') {
    rawId = String(studentOrEmp);
  } else if (typeof studentOrEmp === 'object') {
    rawId = String(
      studentOrEmp.rawEmployeeNo ||
      studentOrEmp.employeeNo ||
      studentOrEmp.studentId ||
      studentOrEmp.faceId ||
      studentOrEmp.id ||
      ''
    );
  }

  const cleanId = rawId.replace(/^s-/, '').replace(/^0+/, '');
  const paddedId = cleanId ? cleanId.padStart(8, '0') : '';
  return { cleanId, paddedId, rawId };
};

export const getStudentPhotoUrls = (studentOrEmp, effectiveBaseUrl, allStudents = [], allTeachers = []) => {
  if (!studentOrEmp) {
    return { primaryUrl: null, fallbackUrl: null };
  }

  // Agar yuklangan maxsus rasm bo'lsa (Base64 yoki Cloud URL)
  if (typeof studentOrEmp === 'object') {
    const customPhoto = studentOrEmp.photo || studentOrEmp.photoUrl;
    if (customPhoto && typeof customPhoto === 'string' && (customPhoto.startsWith('data:image/') || customPhoto.startsWith('http://') || customPhoto.startsWith('https://') || customPhoto.startsWith('blob:'))) {
      return { primaryUrl: customPhoto, fallbackUrl: null };
    }
  }

  // Agar to'g'ridan-to'g'ri tashqi ochiq internet URL bo'lsa (192.168 yoki 10. kabi lokal bo'lmasa)
  if (typeof studentOrEmp === 'object' && studentOrEmp.faceURL) {
    const u = String(studentOrEmp.faceURL);
    const isInternal = u.includes('192.168.') || u.includes('10.') || u.includes('172.');
    if (!isInternal && (u.startsWith('http://') || u.startsWith('https://'))) {
      return { primaryUrl: u, fallbackUrl: null };
    }
  }

  // Agar scan hodisasi bo'lsa (o'zida rasm bo'lmasa), bazadagi o'quvchi yoki o'qituvchi profilidan rasmni qidiramiz
  if (typeof studentOrEmp === 'object' && !studentOrEmp.photo && !studentOrEmp.photoUrl) {
    const { cleanId } = getCleanIdAndPadded(studentOrEmp);
    const scanName = (studentOrEmp.name || '').toLowerCase().trim();

    const matched = (allStudents || []).find(s => {
      const sId = String(s.studentId || s.employeeNo || s.id || '').replace(/^s-/, '').replace(/^0+/, '');
      if (cleanId && sId && cleanId === sId) return true;
      const sName = (s.fullName || s.name || '').toLowerCase().trim();
      return scanName && sName && (scanName === sName);
    }) || (allTeachers || []).find(t => {
      const tId = String(t.employeeNo || t.id || '').replace(/^t-/, '').replace(/^0+/, '');
      if (cleanId && tId && cleanId === tId) return true;
      const tName = (t.fullName || t.name || '').toLowerCase().trim();
      return scanName && tName && (scanName === tName);
    });

    if (matched && (matched.photo || matched.photoUrl)) {
      const dbPhoto = matched.photo || matched.photoUrl;
      if (typeof dbPhoto === 'string' && (dbPhoto.startsWith('data:image/') || dbPhoto.startsWith('http://') || dbPhoto.startsWith('https://') || dbPhoto.startsWith('blob:'))) {
        return { primaryUrl: dbPhoto, fallbackUrl: null };
      }
    }
  }

  const { cleanId, paddedId } = getCleanIdAndPadded(studentOrEmp);
  if (!cleanId && !paddedId) {
    return { primaryUrl: null, fallbackUrl: null };
  }

  const targetName = paddedId || cleanId;

  // 1. Static yuklangan rasm (Vercel, Netlify va barcha Global CDN larda 24/7 ishlaydi)
  const staticUrl = `/photos/${targetName}.jpg`;

  // 2. Lokal server yoki Cloudflare tuneli orqali jonli bridge URL
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isValidBase = effectiveBaseUrl && effectiveBaseUrl.startsWith('http') && (!isHttps || effectiveBaseUrl.startsWith('https:'));
  const bridgeUrl = isValidBase
    ? `${effectiveBaseUrl.replace(/\/+$/, '')}/api/device/photo/${targetName}`
    : null;

  return {
    primaryUrl: staticUrl,
    fallbackUrl: bridgeUrl
  };
};
