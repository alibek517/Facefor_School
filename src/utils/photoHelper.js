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

export const getStudentPhotoUrls = (studentOrEmp, effectiveBaseUrl) => {
  if (!studentOrEmp) {
    return { primaryUrl: null, fallbackUrl: null };
  }

  // Agar to'g'ridan-to'g'ri tashqi ochiq internet URL bo'lsa (192.168 yoki 10. kabi lokal bo'lmasa)
  if (typeof studentOrEmp === 'object' && studentOrEmp.faceURL) {
    const u = String(studentOrEmp.faceURL);
    const isInternal = u.includes('192.168.') || u.includes('10.') || u.includes('172.');
    if (!isInternal && (u.startsWith('http://') || u.startsWith('https://'))) {
      return { primaryUrl: u, fallbackUrl: null };
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
  const bridgeUrl = effectiveBaseUrl
    ? `${effectiveBaseUrl}/api/device/photo/${targetName}`
    : null;

  return {
    primaryUrl: staticUrl,
    fallbackUrl: bridgeUrl
  };
};
