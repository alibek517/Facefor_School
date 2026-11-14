/**
 * Telefon raqamini O'zbekiston yagona formatiga o'tkazish: +998-XX-XXX-XX-XX
 */
export const formatPhoneNumber = (value) => {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';

  let rest = digits;
  if (digits.startsWith('998')) {
    rest = digits.slice(3);
  } else if (digits.startsWith('8') && digits.length === 10) {
    rest = digits.slice(1);
  }

  // Maksimal 9 ta raqam (XX-XXX-XX-XX)
  rest = rest.slice(0, 9);

  if (rest.length === 0) return '+998-';
  if (rest.length <= 2) return `+998-${rest}`;
  if (rest.length <= 5) return `+998-${rest.slice(0, 2)}-${rest.slice(2)}`;
  if (rest.length <= 7) return `+998-${rest.slice(0, 2)}-${rest.slice(2, 5)}-${rest.slice(5)}`;
  return `+998-${rest.slice(0, 2)}-${rest.slice(2, 5)}-${rest.slice(5, 7)}-${rest.slice(7, 9)}`;
};

/**
 * Input maydonida yozilayotganda jonli avto-formatlash
 */
export const handlePhoneInputChange = (rawVal, setter) => {
  if (!rawVal || rawVal === '+' || rawVal === '+998' || rawVal === '+998-') {
    setter('');
    return;
  }
  setter(formatPhoneNumber(rawVal));
};

/**
 * O'qituvchi F.I.Sh asosida avtomatik ixcham login yaratish (masalan: xudoyberganova_d)
 */
export const generateTeacherLogin = (fullName) => {
  if (!fullName) return 'oqituvchi';
  const clean = fullName
    .toLowerCase()
    .replace(/[ʻʼ'`]/g, '')
    .replace(/oʻ|o'|o‘|o`/g, 'o')
    .replace(/gʻ|g'|g‘|g`/g, 'g')
    .replace(/sh/g, 'sh')
    .replace(/ch/g, 'ch')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/);
  if (clean.length >= 2) {
    return `${clean[0]}_${clean[1].charAt(0)}`;
  }
  return clean[0] || 'oqituvchi';
};

