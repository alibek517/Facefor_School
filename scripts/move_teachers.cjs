const fs = require('fs');
const path = require('path');

const SUPABASE_CONFIG = {
  URL: 'https://ffwbxpqfzlkevxhijvtd.supabase.co',
  KEY: 'sb_publishable_IN4OpUU6gNpnZINpifQSAg_DZuksmMD'
};

const formatPhoneNumber = (value) => {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  let rest = digits;
  if (digits.startsWith('998')) {
    rest = digits.slice(3);
  } else if (digits.startsWith('8') && digits.length === 10) {
    rest = digits.slice(1);
  }
  rest = rest.slice(0, 9);
  if (rest.length === 0) return '+998-';
  if (rest.length <= 2) return `+998-${rest}`;
  if (rest.length <= 5) return `+998-${rest.slice(0, 2)}-${rest.slice(2)}`;
  if (rest.length <= 7) return `+998-${rest.slice(0, 2)}-${rest.slice(2, 5)}-${rest.slice(5)}`;
  return `+998-${rest.slice(0, 2)}-${rest.slice(2, 5)}-${rest.slice(5, 7)}-${rest.slice(7, 9)}`;
};

const TEACHER_IDS = [
  '00000545', '00000546', '00000547', '00000551', '00000558',
  '00000603', '00000604', '00000605', '00000606', '00000607',
  '00000609', '00000610', '00000611', '00000612', '00000613',
  '00000616', '00000617', '00000706'
];

async function postRow(table, row) {
  const res = await fetch(`${SUPABASE_CONFIG.URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_CONFIG.KEY,
      'Authorization': `Bearer ${SUPABASE_CONFIG.KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(row)
  });
  return res;
}

async function run() {
  console.log('=== O\'QITUVCHILARNI O\'QUVCHILAR RO\'YXATIDAN AJRATISH BOSHLANDI ===');

  const dbPath = path.join(__dirname, '../server/school_db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  let currentStudents = db.students || [];
  let currentTeachers = db.teachers || [];

  const teachersToMove = [];
  const remainingStudents = [];

  for (const st of currentStudents) {
    if (TEACHER_IDS.includes(st.studentId)) {
      teachersToMove.push(st);
    } else {
      remainingStudents.push(st);
    }
  }

  console.log(`Topildi: ${teachersToMove.length} nafar o'qituvchi o'quvchilar ichidan.`);

  for (const st of teachersToMove) {
    const teacherId = `t-${st.studentId}`;
    const exists = currentTeachers.find(t => t.id === teacherId || t.faceId === st.studentId || t.name === st.name);
    
    // Default subject & role
    let subject = "Boshlang'ich ta'lim";
    if (st.name.includes('Viktor')) subject = 'Jismoniy tarbiya';
    if (st.name.includes('Elbek')) subject = 'Informatika';
    if (st.name.includes('Indira')) subject = 'Ingliz tili';
    if (st.name.includes('Dilfuza')) subject = 'Musiqa';

    const teacherObj = {
      id: teacherId,
      name: st.fullName || st.name,
      role: st.classId ? 'Sinf rahbari' : 'O\'qituvchi',
      subject: exists?.subject || subject,
      classId: exists?.classId || st.classId || null,
      phone: formatPhoneNumber(st.phone || st.parentPhone || ''),
      faceId: st.studentId,
      faceURL: st.faceURL || null
    };

    if (exists) {
      Object.assign(exists, teacherObj);
    } else {
      currentTeachers.push(teacherObj);
    }
  }

  db.students = remainingStudents;
  db.teachers = currentTeachers;
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log(`✓ server/school_db.json yangilandi: O'quvchilar soni: ${remainingStudents.length}, O'qituvchilar soni: ${currentTeachers.length}`);

  // Supabase bulutini yangilash
  try {
    const resS = await postRow('school_data', {
      key: 'students',
      data: remainingStudents,
      updated_at: new Date().toISOString()
    });
    console.log('✓ Supabase [students] saqlandi:', resS.status);

    const resT = await postRow('school_data', {
      key: 'teachers',
      data: currentTeachers,
      updated_at: new Date().toISOString()
    });
    console.log('✓ Supabase [teachers] saqlandi:', resT.status);
  } catch (err) {
    console.error('Supabase xatosi:', err.message);
  }

  console.log('=== MIGRATSIYA MUVAFFAQIYATLI YAKUNLANDI ===');
}

run().catch(console.error);
