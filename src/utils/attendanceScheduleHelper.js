/**
 * O'quvchining birinchi kirish va oxirgi chiqish vaqtini sinf dars jadvali
 * (shu jumladan tashqarida o'tiladigan Jismoniy tarbiya va CHQBT darslari)
 * asosida tahlil qiluvchi yordamchi modul.
 */

const UZ_DAYS = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

export const getUzDayName = (dateStr) => {
  if (!dateStr) return UZ_DAYS[new Date().getDay()];
  const parts = String(dateStr).split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return UZ_DAYS[new Date().getDay()];
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  return UZ_DAYS[dt.getDay()] || 'Dushanba';
};

export const formatTime24 = (timeStr) => {
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

export const extractScanTime24 = (scan) => {
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

export const timeToMinutes = (hhmm) => {
  if (!hhmm) return null;
  const m = String(hhmm).match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
};

/**
 * Tashqarida o'tilishi mumkin bo'lgan fanlarni aniqlash:
 * Jismoniy tarbiya, CHQBT (Chaqiriqqa qadar boshlang'ich tayyorgarlik), Sport/Harbiy
 */
export const isOutdoorSubject = (subjectName) => {
  const s = String(subjectName || '').toLowerCase().trim();
  if (!s) return false;
  return (
    s.includes('jismoniy') ||
    s.includes('fizkultura') ||
    s.includes('sport') ||
    s.includes('chqbt') ||
    s.includes('чқбт') ||
    s.includes('chaqiriq') ||
    s.includes('harbiy')
  );
};

export const parseLessonTimeRange = (timeStr) => {
  if (!timeStr) return null;
  const parts = String(timeStr).split(/[-–—]/).map(p => p.trim());
  if (parts.length < 2) return null;
  const startStr = formatTime24(parts[0]);
  const endStr = formatTime24(parts[1]);
  const startMins = timeToMinutes(startStr);
  const endMins = timeToMinutes(endStr);
  if (startMins === null || endMins === null) return null;
  return { startStr, endStr, startMins, endMins };
};

export const getClassDaySchedule = (classId, schedules = [], dateStr) => {
  if (!classId || !Array.isArray(schedules) || schedules.length === 0) {
    return {
      dayName: getUzDayName(dateStr),
      lessons: [],
      lastLessonEndStr: '13:00',
      lastLessonEndMins: 13 * 60,
      outdoorLessons: []
    };
  }

  const dayName = getUzDayName(dateStr);
  const dayLessons = schedules
    .filter(s => s && s.classId === classId && String(s.day || '').toLowerCase() === dayName.toLowerCase())
    .map(s => {
      const range = parseLessonTimeRange(s.time);
      return {
        ...s,
        startStr: range?.startStr || '',
        endStr: range?.endStr || '',
        startMins: range?.startMins ?? null,
        endMins: range?.endMins ?? null,
        isOutdoor: isOutdoorSubject(s.subject)
      };
    })
    .filter(l => l.startMins !== null && l.endMins !== null)
    .sort((a, b) => a.startMins - b.startMins);

  if (dayLessons.length === 0) {
    return {
      dayName,
      lessons: [],
      lastLessonEndStr: '13:00',
      lastLessonEndMins: 13 * 60,
      outdoorLessons: []
    };
  }

  const lastLesson = dayLessons[dayLessons.length - 1];
  const outdoorLessons = dayLessons.filter(l => l.isOutdoor);

  return {
    dayName,
    lessons: dayLessons,
    lastLessonEndStr: lastLesson.endStr,
    lastLessonEndMins: lastLesson.endMins,
    outdoorLessons
  };
};

/**
 * Bir o'quvchining tanlangan kundagi skanlari va dars jadvali bo'yicha to'liq holatini hisoblash:
 * - firstEntryTime: Birinchi kirgan vaqti
 * - lastExitTime: Oxirgi chiqib ketgan vaqti
 * - scheduleStatus:
 *     'absent'         -> Kelmagan
 *     'inside'         -> Maktab ichida (yoki chiqib qaytib kirgan)
 *     'outdoor_lesson' -> Tashqi darsda (Jismoniy tarbiya / CHQBT)
 *     'completed_all'  -> Barcha darsga kirgan (darslar tugagach chiqqan)
 *     'left_early'     -> Ketib qolgan (dars tugamasidan chiqib qaytib kirmagan)
 */
export const evaluateStudentDayAttendance = ({
  scans = [],
  attRecord = null,
  classId = null,
  schedules = [],
  dateStr = ''
}) => {
  const sorted = [...(scans || [])].sort(
    (a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
  );

  const inScans = sorted.filter(s => s.direction !== 'out' && s.type !== 'out');
  const outScans = sorted.filter(s => s.direction === 'out' || s.type === 'out');

  const firstEntryScan = inScans[0] || sorted[0] || null;
  const lastScan = sorted[sorted.length - 1] || null;

  // Oxirgi chiqib ketish (birinchi kirishdan keyin yoki oxirgi out skan)
  const firstEntryTs = firstEntryScan ? new Date(firstEntryScan.timestamp || 0).getTime() : 0;
  const exitsAfterEntry = outScans.filter(s => new Date(s.timestamp || 0).getTime() >= firstEntryTs);
  const lastExitScan = exitsAfterEntry.length > 0
    ? exitsAfterEntry[exitsAfterEntry.length - 1]
    : (outScans.length > 0 ? outScans[outScans.length - 1] : null);

  const firstEntryTime = extractScanTime24(firstEntryScan) || (attRecord?.time ? formatTime24(attRecord.time) : '');
  const lastExitTime = extractScanTime24(lastExitScan);

  const hasEntered = Boolean(firstEntryScan) || attRecord?.status === 'present' || attRecord?.status === 'late';
  const lastScanIsEntry = Boolean(lastScan && lastScan.direction !== 'out' && lastScan.type !== 'out');
  const returnedAfterExit = Boolean(lastExitScan && lastScanIsEntry && lastScan !== lastExitScan);
  const hasExitedWithoutReturn = Boolean(lastExitScan && !returnedAfterExit);

  const daySchedule = getClassDaySchedule(classId, schedules, dateStr);
  const lastExitMins = timeToMinutes(lastExitTime);

  if (!hasEntered) {
    return {
      firstEntryScan: null,
      lastExitScan: null,
      firstEntryTime: '',
      lastExitTime: '',
      hasEntered: false,
      hasExited: false,
      returnedAfterExit: false,
      scheduleStatus: 'absent',
      scheduleLabel: 'Kelmagan',
      scheduleDetail: 'Bugun turniketdan kirmagan',
      outdoorLessonName: null,
      lastLessonEndStr: daySchedule.lastLessonEndStr
    };
  }

  // Agar hali maktab ichida bo'lsa (chiqmagan yoki chiqib qaytib kirgan)
  if (!hasExitedWithoutReturn) {
    return {
      firstEntryScan,
      lastExitScan,
      firstEntryTime,
      lastExitTime,
      hasEntered: true,
      hasExited: Boolean(lastExitScan),
      returnedAfterExit,
      scheduleStatus: 'inside',
      scheduleLabel: returnedAfterExit ? 'Maktab ichida (Qaytib kirgan)' : 'Maktab ichida',
      scheduleDetail: returnedAfterExit
        ? `Birinchi kirish: ${firstEntryTime || '--:--'} • Qaytib kirgan`
        : `Birinchi kirish: ${firstEntryTime || '--:--'} • Darslar tugashi: ${daySchedule.lastLessonEndStr}`,
      outdoorLessonName: null,
      lastLessonEndStr: daySchedule.lastLessonEndStr
    };
  }

  // Chiqib ketgan va qaytib kirmagan — dars jadvali bilan solishtiramiz!
  const graceMins = 5;
  const exitedAfterClasses = lastExitMins !== null && lastExitMins >= (daySchedule.lastLessonEndMins - graceMins);

  if (exitedAfterClasses) {
    return {
      firstEntryScan,
      lastExitScan,
      firstEntryTime,
      lastExitTime,
      hasEntered: true,
      hasExited: true,
      returnedAfterExit: false,
      scheduleStatus: 'completed_all',
      scheduleLabel: 'Barcha darsga kirgan',
      scheduleDetail: `Darslar (${daySchedule.lastLessonEndStr}) tugagach chiqdi (${lastExitTime})`,
      outdoorLessonName: null,
      lastLessonEndStr: daySchedule.lastLessonEndStr
    };
  }

  // Tashqarida o'tiladigan dars (Jismoniy tarbiya / CHQBT) vaqtiga to'g'ri keladimi?
  const matchedOutdoor = daySchedule.outdoorLessons.find(
    l => lastExitMins !== null && lastExitMins >= (l.startMins - 10) && lastExitMins <= (l.endMins + 10)
  );

  // Yoki chiqqan vaqtdan keyin faqat tashqi darslar (Jismoniy tarbiya / CHQBT) qolganmi?
  const remainingLessons = daySchedule.lessons.filter(
    l => lastExitMins !== null && l.endMins > (lastExitMins + graceMins)
  );
  const onlyOutdoorRemaining = remainingLessons.length > 0 && remainingLessons.every(l => l.isOutdoor);

  if (matchedOutdoor || onlyOutdoorRemaining) {
    const outdoorName = matchedOutdoor?.subject || remainingLessons[0]?.subject || 'Jismoniy tarbiya / CHQBT';
    // Agar oxirgi darsning o'zi tashqi dars bo'lsa (Jismoniy tarbiya / CHQBT), barcha xona darslariga kirgan hisoblanadi
    if (onlyOutdoorRemaining) {
      return {
        firstEntryScan,
        lastExitScan,
        firstEntryTime,
        lastExitTime,
        hasEntered: true,
        hasExited: true,
        returnedAfterExit: false,
        scheduleStatus: 'completed_all',
        scheduleLabel: `Barcha darsga kirgan (${outdoorName})`,
        scheduleDetail: `Oxirgi dars (${outdoorName}) tashqarida — chiqish: ${lastExitTime}`,
        outdoorLessonName: outdoorName,
        lastLessonEndStr: daySchedule.lastLessonEndStr
      };
    }

    // Hozir o'sha tashqi dars vaqtida bo'lsa — "Tashqi darsda", agar dars o'tib ketgan va keyingi darslarga qaytib kirmagan bo'lsa — "Ketib qolgan"
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const isCurrentlyInOutdoorWindow =
      dateStr === todayStr &&
      matchedOutdoor &&
      nowMins >= (matchedOutdoor.startMins - 10) &&
      nowMins <= (matchedOutdoor.endMins + 15);

    if (isCurrentlyInOutdoorWindow) {
      return {
        firstEntryScan,
        lastExitScan,
        firstEntryTime,
        lastExitTime,
        hasEntered: true,
        hasExited: true,
        returnedAfterExit: false,
        scheduleStatus: 'outdoor_lesson',
        scheduleLabel: `Tashqi darsda (${outdoorName})`,
        scheduleDetail: `${outdoorName} (${matchedOutdoor.startStr}-${matchedOutdoor.endStr}) darsiga chiqqan`,
        outdoorLessonName: outdoorName,
        lastLessonEndStr: daySchedule.lastLessonEndStr
      };
    }
  }

  // Darslar tugamasidan chiqib ketgan va qaytib kirmagan!
  const missedSubjects = remainingLessons.map(l => l.subject).filter(Boolean);
  return {
    firstEntryScan,
    lastExitScan,
    firstEntryTime,
    lastExitTime,
    hasEntered: true,
    hasExited: true,
    returnedAfterExit: false,
    scheduleStatus: 'left_early',
    scheduleLabel: 'Ketib qolgan',
    scheduleDetail: missedSubjects.length > 0
      ? `Dars tugamasidan (${lastExitTime}) ketib qolgan • Qolgan: ${missedSubjects.slice(0, 2).join(', ')}`
      : `Darslar (${daySchedule.lastLessonEndStr}) tugamasidan (${lastExitTime}) ketib qolgan`,
    outdoorLessonName: null,
    lastLessonEndStr: daySchedule.lastLessonEndStr
  };
};
