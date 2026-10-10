const fs = require('fs');
const path = require('path');

const SUPABASE_CONFIG = {
  URL: 'https://ffwbxpqfzlkevxhijvtd.supabase.co',
  KEY: 'sb_publishable_IN4OpUU6gNpnZINpifQSAg_DZuksmMD'
};

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

async function runMigration() {
  console.log('=== MAKTAB MA\'LUMOTLARINI SUPABASE BULUTIGA YUKLASH BOSHLANDI ===\n');

  // 1. Kameralarni saqlash
  const cameras = [
    { id: 'cam-1', ip: '192.168.1.35', type: 'in', name: 'Turniket 1 (Kirish)', location: 'Bosh kirish (1)', online: true },
    { id: 'cam-2', ip: '192.168.1.32', type: 'in', name: 'Turniket 2 (Kirish)', location: 'Bosh kirish (2)', online: true },
    { id: 'cam-3', ip: '192.168.1.36', type: 'in', name: 'Turniket 3 (Kirish)', location: 'Bosh kirish (3)', online: true },
    { id: 'cam-4', ip: '192.168.1.86', type: 'out', name: 'Turniket 4 (Chiqish)', location: 'Chiqish yo\'lagi (1)', online: true },
    { id: 'cam-5', ip: '192.168.1.33', type: 'out', name: 'Turniket 5 (Chiqish)', location: 'Chiqish yo\'lagi (2)', online: true },
    { id: 'cam-6', ip: '192.168.1.13', type: 'out', name: 'Turniket 6 (Chiqish)', location: 'Chiqish yo\'lagi (3)', online: true },
  ];

  try {
    for (const c of cameras) {
      await postRow('camera_settings', {
        id: c.id,
        name: c.name,
        ip: c.ip,
        type: c.type,
        location: c.location,
        updated_at: new Date().toISOString()
      });
    }
    console.log('✓ 6 ta Turniket kamerasi Supabase ga saqlandi.');
  } catch (err) {
    console.error('Kameralar xatoligi:', err.message);
  }

  // 2. school_db.json yoki faceUsers.json dan 737 o'quvchilarni o'qish
  let students = [];
  try {
    const dbPath = path.join(__dirname, '../server/school_db.json');
    if (fs.existsSync(dbPath)) {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      if (db.students && db.students.length > 0) {
        students = db.students;
      }
    }
  } catch (e) {}

  if (students.length === 0) {
    try {
      const faceUsersPath = path.join(__dirname, '../src/faceUsers.json');
      if (fs.existsSync(faceUsersPath)) {
        const faceUsers = JSON.parse(fs.readFileSync(faceUsersPath, 'utf8'));
        students = faceUsers.map(u => ({
          id: u.employeeNo,
          studentId: u.employeeNo,
          name: u.name,
          fullName: u.name,
          classId: 'c-10a',
          grade: 10,
          gender: 'Erkak',
          address: 'Bog\'ot tumani',
          parentName: 'Ota-ona',
          parentPhone: '+998 90 123-45-67',
          faceURL: u.faceURL || null
        }));
      }
    } catch (e) {}
  }

  console.log(`Yuklash uchun ${students.length} ta o'quvchi tayyorlandi.`);

  // 3. Classes, Teachers, Schedules
  const classes = [
    { id: 'c-1a', grade: 1, name: '1-A', room: '101-xona' },
    { id: 'c-1b', grade: 1, name: '1-B', room: '102-xona' },
    { id: 'c-1d', grade: 1, name: '1-D', room: '103-xona' },
    { id: 'c-2a', grade: 2, name: '2-A', room: '104-xona' },
    { id: 'c-2b', grade: 2, name: '2-B', room: '105-xona' },
    { id: 'c-2d', grade: 2, name: '2-D', room: '106-xona' },
    { id: 'c-3a', grade: 3, name: '3-A', room: '201-xona' },
    { id: 'c-3b', grade: 3, name: '3-B', room: '202-xona' },
    { id: 'c-3d', grade: 3, name: '3-D', room: '203-xona' },
    { id: 'c-4a', grade: 4, name: '4-A', room: '204-xona' },
    { id: 'c-4b', grade: 4, name: '4-B', room: '205-xona' },
    { id: 'c-5a', grade: 5, name: '5-A', room: '206-xona' },
    { id: 'c-5b', grade: 5, name: '5-B', room: '207-xona' },
    { id: 'c-5d', grade: 5, name: '5-D', room: '208-xona' },
    { id: 'c-6a', grade: 6, name: '6-A', room: '301-xona' },
    { id: 'c-6b', grade: 6, name: '6-B', room: '302-xona' },
    { id: 'c-7a', grade: 7, name: '7-A', room: '303-xona' },
    { id: 'c-7b', grade: 7, name: '7-B', room: '304-xona' },
    { id: 'c-7d', grade: 7, name: '7-D UT/ДО', room: '305-xona' },
    { id: 'c-8a', grade: 8, name: '8-A', room: '306-xona' },
    { id: 'c-8b', grade: 8, name: '8-B', room: '307-xona' },
    { id: 'c-9a', grade: 9, name: '9-A', room: '401-xona' },
    { id: 'c-9b', grade: 9, name: '9-B', room: '402-xona' },
    { id: 'c-9d', grade: 9, name: '9-D', room: '403-xona' },
    { id: 'c-10a', grade: 10, name: '10-A', room: '404-xona' },
    { id: 'c-10b', grade: 10, name: '10-B', room: '405-xona' },
    { id: 'c-11a', grade: 11, name: '11-A', room: '406-xona' },
    { id: 'c-11b', grade: 11, name: '11-B', room: '407-xona' }
  ];

  // Noma'lum o'qituvchilar va xodimlar ro'yxati to'liq o'chirildi:
  const teachers = [];
  const teacherAttendance = [];
  const hourlyAttendance = {};

  // Dars jadvali (o'qituvchi ismlari tozalanib faqat fanlar qoldirildi)
  const schedules = [
    { id: 'sch-10a-m1', day: 'Dushanba', lessonOrder: 1, classId: 'c-10a', teacherId: null, subject: 'Kelajak soati', teacherName: '', time: '08:30 - 09:15' },
    { id: 'sch-10a-m2', day: 'Dushanba', lessonOrder: 2, classId: 'c-10a', teacherId: null, subject: 'Rus tili', teacherName: '', time: '09:20 - 10:05' },
    { id: 'sch-10a-m3', day: 'Dushanba', lessonOrder: 3, classId: 'c-10a', teacherId: null, subject: 'Ona tili', teacherName: '', time: '10:10 - 10:55' },
    { id: 'sch-10a-m4', day: 'Dushanba', lessonOrder: 4, classId: 'c-10a', teacherId: null, subject: 'Geografiya', teacherName: '', time: '11:00 - 11:45' },
    { id: 'sch-10a-m5', day: 'Dushanba', lessonOrder: 5, classId: 'c-10a', teacherId: null, subject: 'Geometriya', teacherName: '', time: '12:00 - 12:45' },
    { id: 'sch-10a-m6', day: 'Dushanba', lessonOrder: 6, classId: 'c-10a', teacherId: null, subject: 'Informatika', teacherName: '', time: '12:50 - 13:35' },
    { id: 'sch-10a-tu1', day: 'Seshanba', lessonOrder: 1, classId: 'c-10a', teacherId: null, subject: 'Algebra', teacherName: '', time: '08:30 - 09:15' },
    { id: 'sch-10a-tu2', day: 'Seshanba', lessonOrder: 2, classId: 'c-10a', teacherId: null, subject: 'Tarbiya', teacherName: '', time: '09:20 - 10:05' },
    { id: 'sch-10a-tu3', day: 'Seshanba', lessonOrder: 3, classId: 'c-10a', teacherId: null, subject: 'Fizika', teacherName: '', time: '10:10 - 10:55' },
    { id: 'sch-10a-tu4', day: 'Seshanba', lessonOrder: 4, classId: 'c-10a', teacherId: null, subject: 'Ingliz tili', teacherName: '', time: '11:00 - 11:45' },
    { id: 'sch-10a-tu5', day: 'Seshanba', lessonOrder: 5, classId: 'c-10a', teacherId: null, subject: 'Jahon tarixi', teacherName: '', time: '12:00 - 12:45' },
    { id: 'sch-10a-tu6', day: 'Seshanba', lessonOrder: 6, classId: 'c-10a', teacherId: null, subject: 'ChQBT', teacherName: '', time: '12:50 - 13:35' },
    { id: 'sch-10a-we1', day: 'Chorshanba', lessonOrder: 1, classId: 'c-10a', teacherId: null, subject: 'Algebra', teacherName: '', time: '08:30 - 09:15' },
    { id: 'sch-10a-we2', day: 'Chorshanba', lessonOrder: 2, classId: 'c-10a', teacherId: null, subject: 'Davlat va huquq', teacherName: '', time: '09:20 - 10:05' },
    { id: 'sch-10a-we3', day: 'Chorshanba', lessonOrder: 3, classId: 'c-10a', teacherId: null, subject: 'Informatika', teacherName: '', time: '10:10 - 10:55' },
    { id: 'sch-10a-we4', day: 'Chorshanba', lessonOrder: 4, classId: 'c-10a', teacherId: null, subject: 'Jismoniy tarbiya', teacherName: '', time: '11:00 - 11:45' },
    { id: 'sch-10a-we5', day: 'Chorshanba', lessonOrder: 5, classId: 'c-10a', teacherId: null, subject: 'ChQBT', teacherName: '', time: '12:00 - 12:45' },
    { id: 'sch-10a-th1', day: 'Payshanba', lessonOrder: 1, classId: 'c-10a', teacherId: null, subject: 'Kimyo', teacherName: '', time: '08:30 - 09:15' },
    { id: 'sch-10a-th2', day: 'Payshanba', lessonOrder: 2, classId: 'c-10a', teacherId: null, subject: 'Fizika', teacherName: '', time: '09:20 - 10:05' },
    { id: 'sch-10a-th3', day: 'Payshanba', lessonOrder: 3, classId: 'c-10a', teacherId: null, subject: 'Geografiya', teacherName: '', time: '10:10 - 10:55' },
    { id: 'sch-10a-th4', day: 'Payshanba', lessonOrder: 4, classId: 'c-10a', teacherId: null, subject: 'Biologiya', teacherName: '', time: '11:00 - 11:45' },
    { id: 'sch-10a-th5', day: 'Payshanba', lessonOrder: 5, classId: 'c-10a', teacherId: null, subject: 'Adabiyot', teacherName: '', time: '12:00 - 12:45' },
    { id: 'sch-10a-fr1', day: 'Juma', lessonOrder: 1, classId: 'c-10a', teacherId: null, subject: 'Algebra', teacherName: '', time: '08:30 - 09:15' },
    { id: 'sch-10a-fr2', day: 'Juma', lessonOrder: 2, classId: 'c-10a', teacherId: null, subject: 'Biologiya', teacherName: '', time: '09:20 - 10:05' },
    { id: 'sch-10a-fr3', day: 'Juma', lessonOrder: 3, classId: 'c-10a', teacherId: null, subject: 'O\'zbekiston tarixi', teacherName: '', time: '10:10 - 10:55' },
    { id: 'sch-10a-fr4', day: 'Juma', lessonOrder: 4, classId: 'c-10a', teacherId: null, subject: 'Ona tili', teacherName: '', time: '11:00 - 11:45' },
    { id: 'sch-10a-fr5', day: 'Juma', lessonOrder: 5, classId: 'c-10a', teacherId: null, subject: 'Jismoniy tarbiya', teacherName: '', time: '12:00 - 12:45' },
    { id: 'sch-10a-sa1', day: 'Shanba', lessonOrder: 1, classId: 'c-10a', teacherId: null, subject: 'Kimyo', teacherName: '', time: '08:30 - 09:15' },
    { id: 'sch-10a-sa2', day: 'Shanba', lessonOrder: 2, classId: 'c-10a', teacherId: null, subject: 'Geometriya', teacherName: '', time: '09:20 - 10:05' },
    { id: 'sch-10a-sa3', day: 'Shanba', lessonOrder: 3, classId: 'c-10a', teacherId: null, subject: 'Rus tili', teacherName: '', time: '10:10 - 10:55' },
    { id: 'sch-10a-sa4', day: 'Shanba', lessonOrder: 4, classId: 'c-10a', teacherId: null, subject: 'Adabiyot', teacherName: '', time: '11:00 - 11:45' },
    { id: 'sch-10a-sa5', day: 'Shanba', lessonOrder: 5, classId: 'c-10a', teacherId: null, subject: 'Ingliz tili', teacherName: '', time: '12:00 - 12:45' }
  ];

  // 4. school_data jadvaliga toza ma'lumotlarni saqlash
  const modulesToSave = [
    { key: 'students', data: students },
    { key: 'classes', data: classes },
    { key: 'teachers', data: teachers },
    { key: 'schedules', data: schedules },
    { key: 'teacherAttendance', data: teacherAttendance },
    { key: 'hourlyAttendance', data: hourlyAttendance }
  ];

  // 5. Mahalliy school_db.json ni ham yangilash
  try {
    const dbPath = path.join(__dirname, '../server/school_db.json');
    if (fs.existsSync(dbPath)) {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      db.teachers = teachers;
      db.teacherAttendance = teacherAttendance;
      db.hourlyAttendance = hourlyAttendance;
      db.classes = classes;
      db.schedules = schedules;
      db.students = students;
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
      console.log('✓ Mahalliy server/school_db.json dan soxta o\'qituvchilar o\'chirildi.');
    }
  } catch (e) {
    console.error('Lokal db yangilashda xato:', e.message);
  }

  for (const mod of modulesToSave) {
    try {
      const res = await postRow('school_data', {
        key: mod.key,
        data: mod.data,
        updated_at: new Date().toISOString()
      });
      if (res.ok) {
        console.log(`✓ [school_data] '${mod.key}' muvaffaqiyatli saqlandi.`);
      } else {
        const text = await res.text();
        console.error(`✗ [school_data] '${mod.key}' saqlashda xatolik (${res.status}):`, text);
      }
    } catch (e) {
      console.error(`✗ [school_data] '${mod.key}' tarmoq xatosi:`, e.message);
    }
  }

  console.log('\n=== MIGRATSIYA YAKUNLANDI: Barcha soxta xodimlar o\'chirildi va Supabase yangilandi ===');
}

runMigration().catch(console.error);
