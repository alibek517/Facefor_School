// Maktab ma'lumotlari bazasi (10-A sinfining to'liq 25 nafar o'quvchisi bilan)

export const DAYS_OF_WEEK = [
  'Dushanba',
  'Seshanba',
  'Chorshanba',
  'Payshanba',
  'Juma',
  'Shanba'
];

export const AVAILABLE_PERMISSIONS = [
  { key: 'dashboard', label: 'Direktor Monitoring Paneli', desc: 'Davomat tahlili, sinflar matritsasi va grafiklar' },
  { key: 'cameras', label: 'Turniket Kameralari (Jonli)', desc: '6 ta turniket kamerasini jonli kuzatish' },
  { key: 'playback', label: 'Kameralar Arxivi (Playback)', desc: 'Kameralarni ortga qaytarib tomosha qilish' },
  { key: 'students', label: "O'quvchilar Ro'yxati", desc: "O'quvchilar ma'lumotlarini ko'rish va tahrirlash" },
  { key: 'teachers', label: "O'qituvchilar va Xodimlar", desc: "O'qituvchilar tarkibini ko'rish va tahrirlash" },
  { key: 'leadership', label: 'Rahbariyat va Adminlar', desc: 'Xodimlarni boshqarish va ruxsatlar berish' },
  { key: 'classes', label: 'Sinflar va Xonalar', desc: 'Sinflar ro\'yxati va xonalar' },
  { key: 'schedules', label: 'Dars Jadvali', desc: 'Haftalik dars jadvallarini ko\'rish va tuzish' },
  { key: 'attendance_control', label: 'Davomat Nazorati (Navbatchi)', desc: 'Navbatchi sifatida davomatni belgilash' },
  { key: 'class_attendance', label: 'Sinf Rahbari Kabineti', desc: 'Sinf davomatini rasmiy topshirish' },
  { key: 'notifications', label: 'Xabarnomalar', desc: 'Tizim bildirishnomalarini qabul qilish' },
  { key: 'settings', label: 'Maktab Sozlamalari', desc: 'Qo\'ng\'iroqlar va maktab parametrlari' }
];

export const SCHOOL_LEADERSHIP = [
  {
    id: 'lead-1',
    name: 'Yaxshimuratov Otabek Yuldashevich',
    role: 'Direktor',
    category: 'leadership',
    phone: '+998-90-123-45-67',
    login: 'direktor',
    password: '123',
    isDirector: true,
    permissions: ['dashboard', 'cameras', 'playback', 'students', 'teachers', 'leadership', 'classes', 'schedules', 'attendance_control', 'class_attendance', 'notifications', 'settings']
  },
  {
    id: 'lead-2',
    name: 'Davlatova Muyassar Baltabayevna',
    role: "Direktor o'rinbosari , O'qituvchi",
    category: 'leadership',
    phone: '+998-91-234-56-78',
    login: 'davlatova',
    password: '123',
    permissions: ['dashboard', 'cameras', 'playback', 'students', 'teachers', 'schedules', 'notifications']
  },
  {
    id: 'lead-3',
    name: "Matkarimov To'Rabek Ne'matjonovich",
    role: "Direktor o'rinbosari , O'qituvchi",
    category: 'leadership',
    phone: '+998-93-345-67-89',
    login: 'matkarimov',
    password: '123',
    permissions: ['dashboard', 'cameras', 'students', 'teachers', 'schedules']
  },
  {
    id: 'lead-4',
    name: 'Sabirova Sharifajon Alisherovna',
    role: "Direktor o'rinbosari",
    category: 'leadership',
    phone: '+998-97-456-78-90',
    login: 'sabirova',
    password: '123',
    permissions: ['dashboard', 'students', 'notifications']
  },
  {
    id: 'lead-5',
    name: 'Salayeva Manzura Nurmatovna',
    role: "Direktor o'rinbosari",
    category: 'leadership',
    phone: '+998-99-567-89-01',
    login: 'salayeva',
    password: '123',
    permissions: ['dashboard', 'students', 'attendance_control']
  },
  {
    id: 'admin-1',
    name: 'Yaxshimuratov Otabek Yuldashevich',
    role: "Administrator (ma'muriyat)",
    category: 'administrator',
    phone: '+998-90-123-45-67',
    login: 'admin_otabek',
    password: '123',
    isDirector: true,
    permissions: ['dashboard', 'cameras', 'playback', 'students', 'teachers', 'leadership', 'classes', 'schedules', 'settings', 'notifications']
  },
  {
    id: 'admin-2',
    name: 'Davlatova Muyassar Baltabayevna',
    role: "Administrator (ma'muriyat)",
    category: 'administrator',
    phone: '+998-91-234-56-78',
    login: 'admin_muyassar',
    password: '123',
    permissions: ['dashboard', 'cameras', 'students', 'teachers', 'schedules']
  },
  {
    id: 'admin-3',
    name: "O'razmetov Izzat Artikbayevich",
    role: "Administrator (ma'muriyat)",
    category: 'administrator',
    phone: '+998-94-678-90-12',
    login: 'admin_izzat',
    password: '123',
    permissions: ['dashboard', 'cameras', 'students', 'attendance_control']
  },
  {
    id: 'admin-4',
    name: "Matkarimov To'Rabek Ne'matjonovich",
    role: "Administrator (ma'muriyat)",
    category: 'administrator',
    phone: '+998-93-345-67-89',
    login: 'admin_turabek',
    password: '123',
    permissions: ['dashboard', 'students', 'teachers', 'schedules']
  }
];

export const USERS_AUTH = [
  { id: 'u-dir', login: 'direktor', password: '123', role: 'director', name: 'Maktab Direktori', detail: 'Maktab Rahbariyati', isDirector: true, permissions: ['dashboard', 'cameras', 'playback', 'students', 'teachers', 'leadership', 'classes', 'schedules', 'attendance_control', 'class_attendance', 'notifications', 'settings'] },
  { id: 'u-zam1', login: 'zamdirektor', password: '123', role: 'director', name: 'Direktor o\'rinbosari', detail: 'O\'quv ishlari', permissions: ['dashboard', 'cameras', 'playback', 'students', 'teachers', 'schedules', 'notifications'] },
  { id: 'u-nav', login: 'navbatchi', password: '123', role: 'inspector', name: 'Navbatchi xodim', detail: 'Davomat nazorati', permissions: ['dashboard', 'attendance_control'] },
  { id: 'u-cl-10a', login: 'sinfraxbari', password: '123', role: 'class_teacher', name: 'Davletova Gulasal', detail: '10-A sinf rahbari', teacherId: 't-1791520951199', classId: 'c-10a', permissions: ['class_attendance', 'notifications'] },
  { id: 'u-sub-t1', login: 'oqituvchi', password: '123', role: 'subject_teacher', name: 'Davletova Gulasal', detail: 'Tarix fani o\'qituvchisi', teacherId: 't-1791520951199', permissions: ['grades_journal'] },
  { id: 'u-mon', login: 'monitor', password: '123', role: 'monitor', name: 'Foye Ekrani (Monitor)', detail: 'Eshik oldidagi katta tablo', permissions: ['cameras'] },
];

export const INITIAL_TEACHER_ATTENDANCE = [];

export const INITIAL_HOURLY_ATTENDANCE = {};

export const INITIAL_CLASSES = [
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

export const INITIAL_TEACHERS = [];

import { ALL_FACE_STUDENTS } from './studentsFromFace';

// Hikvision Face-ID apparatidagi (192.168.1.35) barcha 737 nafar o'quvchilar:
export const INITIAL_STUDENTS = ALL_FACE_STUDENTS;


export const INITIAL_SCHEDULE = [
  {
    "id": "sch-1a-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-1a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-1a-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-1a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-1a-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-1a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-1a-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-1a",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-1a-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-1a",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-1a-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-1a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-1a-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-1a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-1a-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-1a",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-1a-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-1a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-1a-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-1a",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-1a-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-1a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-1a-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-1a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-1a-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-1a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-1a-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-1a",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-1a-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-1a",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-1a-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-1a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-1a-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-1a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-1a-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-1a",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-1a-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-1a",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-1a-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-1a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-1a-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-1a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-1a-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-1a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-1a-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-1a",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-1a-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-1a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-1a-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-1a",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-1a-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-1a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-1a-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-1a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-1a-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-1a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-1a-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-1a",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-1a-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-1a",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-1b-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-1b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-1b-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-1b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-1b-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-1b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-1b-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-1b",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-1b-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-1b",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-1b-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-1b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-1b-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-1b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-1b-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-1b",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-1b-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-1b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-1b-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-1b",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-1b-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-1b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-1b-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-1b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-1b-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-1b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-1b-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-1b",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-1b-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-1b",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-1b-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-1b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-1b-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-1b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-1b-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-1b",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-1b-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-1b",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-1b-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-1b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-1b-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-1b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-1b-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-1b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-1b-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-1b",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-1b-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-1b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-1b-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-1b",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-1b-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-1b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-1b-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-1b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-1b-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-1b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-1b-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-1b",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-1b-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-1b",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-1d-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-1d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-1d-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-1d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-1d-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-1d",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-1d-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-1d",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-1d-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-1d",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-1d-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-1d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-1d-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-1d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-1d-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-1d",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-1d-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-1d",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-1d-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-1d",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-1d-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-1d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-1d-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-1d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-1d-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-1d",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-1d-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-1d",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-1d-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-1d",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-1d-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-1d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-1d-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-1d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-1d-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-1d",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-1d-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-1d",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-1d-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-1d",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-1d-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-1d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-1d-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-1d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-1d-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-1d",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-1d-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-1d",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-1d-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-1d",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-1d-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-1d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-1d-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-1d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-1d-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-1d",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-1d-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-1d",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-1d-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-1d",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-2a-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-2a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-2a-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-2a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-2a-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-2a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-2a-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-2a",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-2a-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-2a",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-2a-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-2a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-2a-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-2a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-2a-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-2a",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-2a-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-2a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-2a-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-2a",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-2a-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-2a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-2a-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-2a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-2a-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-2a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-2a-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-2a",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-2a-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-2a",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-2a-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-2a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-2a-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-2a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-2a-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-2a",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-2a-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-2a",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-2a-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-2a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-2a-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-2a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-2a-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-2a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-2a-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-2a",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-2a-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-2a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-2a-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-2a",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-2a-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-2a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-2a-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-2a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-2a-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-2a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-2a-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-2a",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-2a-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-2a",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-2b-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-2b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-2b-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-2b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-2b-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-2b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-2b-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-2b",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-2b-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-2b",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-2b-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-2b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-2b-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-2b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-2b-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-2b",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-2b-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-2b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-2b-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-2b",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-2b-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-2b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-2b-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-2b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-2b-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-2b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-2b-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-2b",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-2b-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-2b",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-2b-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-2b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-2b-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-2b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-2b-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-2b",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-2b-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-2b",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-2b-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-2b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-2b-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-2b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-2b-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-2b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-2b-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-2b",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-2b-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-2b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-2b-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-2b",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-2b-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-2b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-2b-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-2b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-2b-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-2b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-2b-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-2b",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-2b-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-2b",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-2d-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-2d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-2d-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-2d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-2d-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-2d",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-2d-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-2d",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-2d-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-2d",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-2d-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-2d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-2d-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-2d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-2d-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-2d",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-2d-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-2d",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-2d-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-2d",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-2d-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-2d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-2d-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-2d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-2d-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-2d",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-2d-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-2d",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-2d-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-2d",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-2d-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-2d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-2d-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-2d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-2d-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-2d",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-2d-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-2d",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-2d-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-2d",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-2d-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-2d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-2d-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-2d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-2d-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-2d",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-2d-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-2d",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-2d-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-2d",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-2d-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-2d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-2d-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-2d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-2d-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-2d",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-2d-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-2d",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-2d-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-2d",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-3a-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-3a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-3a-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-3a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-3a-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-3a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-3a-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-3a",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-3a-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-3a",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-3a-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-3a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-3a-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-3a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-3a-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-3a",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-3a-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-3a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-3a-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-3a",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-3a-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-3a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-3a-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-3a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-3a-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-3a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-3a-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-3a",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-3a-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-3a",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-3a-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-3a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-3a-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-3a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-3a-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-3a",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-3a-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-3a",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-3a-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-3a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-3a-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-3a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-3a-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-3a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-3a-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-3a",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-3a-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-3a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-3a-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-3a",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-3a-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-3a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-3a-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-3a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-3a-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-3a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-3a-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-3a",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-3a-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-3a",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-3b-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-3b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-3b-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-3b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-3b-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-3b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-3b-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-3b",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-3b-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-3b",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-3b-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-3b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-3b-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-3b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-3b-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-3b",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-3b-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-3b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-3b-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-3b",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-3b-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-3b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-3b-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-3b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-3b-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-3b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-3b-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-3b",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-3b-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-3b",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-3b-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-3b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-3b-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-3b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-3b-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-3b",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-3b-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-3b",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-3b-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-3b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-3b-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-3b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-3b-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-3b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-3b-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-3b",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-3b-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-3b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-3b-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-3b",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-3b-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-3b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-3b-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-3b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-3b-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-3b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-3b-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-3b",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-3b-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-3b",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-3d-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-3d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-3d-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-3d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-3d-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-3d",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-3d-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-3d",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-3d-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-3d",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-3d-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-3d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-3d-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-3d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-3d-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-3d",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-3d-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-3d",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-3d-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-3d",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-3d-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-3d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-3d-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-3d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-3d-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-3d",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-3d-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-3d",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-3d-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-3d",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-3d-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-3d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-3d-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-3d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-3d-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-3d",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-3d-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-3d",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-3d-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-3d",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-3d-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-3d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-3d-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-3d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-3d-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-3d",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-3d-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-3d",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-3d-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-3d",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-3d-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-3d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-3d-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-3d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-3d-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-3d",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-3d-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-3d",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-3d-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-3d",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-4a-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-4a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-4a-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-4a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-4a-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-4a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-4a-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-4a",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-4a-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-4a",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-4a-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-4a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-4a-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-4a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-4a-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-4a",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-4a-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-4a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-4a-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-4a",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-4a-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-4a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-4a-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-4a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-4a-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-4a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-4a-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-4a",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-4a-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-4a",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-4a-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-4a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-4a-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-4a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-4a-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-4a",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-4a-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-4a",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-4a-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-4a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-4a-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-4a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-4a-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-4a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-4a-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-4a",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-4a-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-4a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-4a-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-4a",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-4a-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-4a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-4a-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-4a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-4a-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-4a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-4a-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-4a",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-4a-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-4a",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-4b-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-4b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-4b-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-4b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-4b-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-4b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-4b-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-4b",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-4b-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-4b",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-4b-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-4b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-4b-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-4b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-4b-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-4b",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-4b-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-4b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-4b-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-4b",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-4b-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-4b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-4b-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-4b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-4b-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-4b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-4b-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-4b",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-4b-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-4b",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-4b-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-4b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-4b-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-4b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-4b-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-4b",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-4b-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-4b",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-4b-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-4b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-4b-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-4b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-4b-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-4b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-4b-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-4b",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-4b-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-4b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-4b-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-4b",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-4b-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-4b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-4b-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-4b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-4b-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-4b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-4b-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-4b",
    "subject": "Tabiiy fanlar",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-4b-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-4b",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-5a-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-5a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-5a-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-5a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-5a-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-5a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-5a-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-5a",
    "subject": "Tarix",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-5a-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-5a",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-5a-m6",
    "day": "Dushanba",
    "time": "12:50 - 13:35",
    "classId": "c-5a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-5a-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-5a",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-5a-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-5a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-5a-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-5a",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-5a-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-5a",
    "subject": "Botanika",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-5a-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-5a",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-5a-tu6",
    "day": "Seshanba",
    "time": "12:50 - 13:35",
    "classId": "c-5a",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-5a-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-5a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-5a-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-5a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-5a-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-5a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-5a-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-5a",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-5a-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-5a",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-5a-we6",
    "day": "Chorshanba",
    "time": "12:50 - 13:35",
    "classId": "c-5a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-5a-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-5a",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-5a-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-5a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-5a-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-5a",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-5a-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-5a",
    "subject": "Tarix",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-5a-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-5a",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-5a-th6",
    "day": "Payshanba",
    "time": "12:50 - 13:35",
    "classId": "c-5a",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-5a-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-5a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-5a-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-5a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-5a-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-5a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-5a-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-5a",
    "subject": "Botanika",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-5a-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-5a",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-5a-fr6",
    "day": "Juma",
    "time": "12:50 - 13:35",
    "classId": "c-5a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-5a-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-5a",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-5a-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-5a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-5a-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-5a",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-5a-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-5a",
    "subject": "Tarix",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-5a-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-5a",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-5b-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-5b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-5b-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-5b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-5b-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-5b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-5b-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-5b",
    "subject": "Tarix",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-5b-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-5b",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-5b-m6",
    "day": "Dushanba",
    "time": "12:50 - 13:35",
    "classId": "c-5b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-5b-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-5b",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-5b-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-5b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-5b-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-5b",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-5b-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-5b",
    "subject": "Botanika",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-5b-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-5b",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-5b-tu6",
    "day": "Seshanba",
    "time": "12:50 - 13:35",
    "classId": "c-5b",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-5b-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-5b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-5b-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-5b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-5b-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-5b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-5b-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-5b",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-5b-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-5b",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-5b-we6",
    "day": "Chorshanba",
    "time": "12:50 - 13:35",
    "classId": "c-5b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-5b-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-5b",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-5b-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-5b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-5b-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-5b",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-5b-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-5b",
    "subject": "Tarix",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-5b-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-5b",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-5b-th6",
    "day": "Payshanba",
    "time": "12:50 - 13:35",
    "classId": "c-5b",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-5b-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-5b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-5b-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-5b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-5b-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-5b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-5b-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-5b",
    "subject": "Botanika",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-5b-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-5b",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-5b-fr6",
    "day": "Juma",
    "time": "12:50 - 13:35",
    "classId": "c-5b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-5b-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-5b",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-5b-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-5b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-5b-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-5b",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-5b-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-5b",
    "subject": "Tarix",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-5b-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-5b",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-5d-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-5d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-5d-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-5d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-5d-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-5d",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-5d-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-5d",
    "subject": "Tarix",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-5d-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-5d",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-5d-m6",
    "day": "Dushanba",
    "time": "12:50 - 13:35",
    "classId": "c-5d",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-5d-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-5d",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-5d-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-5d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-5d-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-5d",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-5d-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-5d",
    "subject": "Botanika",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-5d-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-5d",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-5d-tu6",
    "day": "Seshanba",
    "time": "12:50 - 13:35",
    "classId": "c-5d",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-5d-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-5d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-5d-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-5d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-5d-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-5d",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-5d-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-5d",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-5d-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-5d",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-5d-we6",
    "day": "Chorshanba",
    "time": "12:50 - 13:35",
    "classId": "c-5d",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-5d-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-5d",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-5d-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-5d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-5d-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-5d",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-5d-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-5d",
    "subject": "Tarix",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-5d-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-5d",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-5d-th6",
    "day": "Payshanba",
    "time": "12:50 - 13:35",
    "classId": "c-5d",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-5d-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-5d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-5d-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-5d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-5d-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-5d",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-5d-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-5d",
    "subject": "Botanika",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-5d-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-5d",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-5d-fr6",
    "day": "Juma",
    "time": "12:50 - 13:35",
    "classId": "c-5d",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-5d-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-5d",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-5d-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-5d",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-5d-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-5d",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-5d-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-5d",
    "subject": "Tarix",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-5d-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-5d",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-6a-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-6a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-6a-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-6a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-6a-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-6a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-6a-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-6a",
    "subject": "Tarix",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-6a-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-6a",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-6a-m6",
    "day": "Dushanba",
    "time": "12:50 - 13:35",
    "classId": "c-6a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-6a-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-6a",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-6a-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-6a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-6a-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-6a",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-6a-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-6a",
    "subject": "Botanika",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-6a-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-6a",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-6a-tu6",
    "day": "Seshanba",
    "time": "12:50 - 13:35",
    "classId": "c-6a",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-6a-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-6a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-6a-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-6a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-6a-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-6a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-6a-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-6a",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-6a-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-6a",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-6a-we6",
    "day": "Chorshanba",
    "time": "12:50 - 13:35",
    "classId": "c-6a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-6a-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-6a",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-6a-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-6a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-6a-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-6a",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-6a-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-6a",
    "subject": "Tarix",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-6a-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-6a",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-6a-th6",
    "day": "Payshanba",
    "time": "12:50 - 13:35",
    "classId": "c-6a",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-6a-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-6a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-6a-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-6a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-6a-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-6a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-6a-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-6a",
    "subject": "Botanika",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-6a-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-6a",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-6a-fr6",
    "day": "Juma",
    "time": "12:50 - 13:35",
    "classId": "c-6a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-6a-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-6a",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-6a-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-6a",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-6a-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-6a",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-6a-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-6a",
    "subject": "Tarix",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-6a-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-6a",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-6b-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-6b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-6b-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-6b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-6b-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-6b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-6b-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-6b",
    "subject": "Tarix",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-6b-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-6b",
    "subject": "Tasviriy san'at",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-6b-m6",
    "day": "Dushanba",
    "time": "12:50 - 13:35",
    "classId": "c-6b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-6b-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-6b",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-6b-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-6b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-6b-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-6b",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-6b-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-6b",
    "subject": "Botanika",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-6b-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-6b",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-6b-tu6",
    "day": "Seshanba",
    "time": "12:50 - 13:35",
    "classId": "c-6b",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-6b-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-6b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-6b-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-6b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-6b-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-6b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-6b-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-6b",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-6b-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-6b",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-6b-we6",
    "day": "Chorshanba",
    "time": "12:50 - 13:35",
    "classId": "c-6b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-6b-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-6b",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-6b-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-6b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-6b-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-6b",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-6b-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-6b",
    "subject": "Tarix",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-6b-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-6b",
    "subject": "Musiqa",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-6b-th6",
    "day": "Payshanba",
    "time": "12:50 - 13:35",
    "classId": "c-6b",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-6b-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-6b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-6b-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-6b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-6b-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-6b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-6b-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-6b",
    "subject": "Botanika",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-6b-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-6b",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-6b-fr6",
    "day": "Juma",
    "time": "12:50 - 13:35",
    "classId": "c-6b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-6b-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-6b",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-6b-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-6b",
    "subject": "Matematika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-6b-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-6b",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-6b-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-6b",
    "subject": "Tarix",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-6b-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-6b",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-7a-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-7a",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-7a-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-7a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-7a-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-7a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-7a-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-7a",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-7a-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-7a",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-7a-m6",
    "day": "Dushanba",
    "time": "12:50 - 13:35",
    "classId": "c-7a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-7a-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-7a",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-7a-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-7a",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-7a-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-7a",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-7a-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-7a",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-7a-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-7a",
    "subject": "O'zbekiston tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-7a-tu6",
    "day": "Seshanba",
    "time": "12:50 - 13:35",
    "classId": "c-7a",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-7a-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-7a",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-7a-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-7a",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-7a-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-7a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-7a-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-7a",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-7a-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-7a",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-7a-we6",
    "day": "Chorshanba",
    "time": "12:50 - 13:35",
    "classId": "c-7a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-7a-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-7a",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-7a-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-7a",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-7a-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-7a",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-7a-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-7a",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-7a-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-7a",
    "subject": "Jahon tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-7a-th6",
    "day": "Payshanba",
    "time": "12:50 - 13:35",
    "classId": "c-7a",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-7a-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-7a",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-7a-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-7a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-7a-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-7a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-7a-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-7a",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-7a-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-7a",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-7a-fr6",
    "day": "Juma",
    "time": "12:50 - 13:35",
    "classId": "c-7a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-7a-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-7a",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-7a-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-7a",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-7a-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-7a",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-7a-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-7a",
    "subject": "Huquq",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-7a-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-7a",
    "subject": "O'zbekiston tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-7b-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-7b",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-7b-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-7b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-7b-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-7b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-7b-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-7b",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-7b-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-7b",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-7b-m6",
    "day": "Dushanba",
    "time": "12:50 - 13:35",
    "classId": "c-7b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-7b-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-7b",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-7b-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-7b",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-7b-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-7b",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-7b-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-7b",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-7b-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-7b",
    "subject": "O'zbekiston tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-7b-tu6",
    "day": "Seshanba",
    "time": "12:50 - 13:35",
    "classId": "c-7b",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-7b-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-7b",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-7b-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-7b",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-7b-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-7b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-7b-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-7b",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-7b-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-7b",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-7b-we6",
    "day": "Chorshanba",
    "time": "12:50 - 13:35",
    "classId": "c-7b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-7b-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-7b",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-7b-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-7b",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-7b-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-7b",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-7b-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-7b",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-7b-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-7b",
    "subject": "Jahon tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-7b-th6",
    "day": "Payshanba",
    "time": "12:50 - 13:35",
    "classId": "c-7b",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-7b-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-7b",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-7b-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-7b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-7b-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-7b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-7b-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-7b",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-7b-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-7b",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-7b-fr6",
    "day": "Juma",
    "time": "12:50 - 13:35",
    "classId": "c-7b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-7b-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-7b",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-7b-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-7b",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-7b-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-7b",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-7b-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-7b",
    "subject": "Huquq",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-7b-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-7b",
    "subject": "O'zbekiston tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-7d-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-7d",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-7d-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-7d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-7d-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-7d",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-7d-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-7d",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-7d-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-7d",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-7d-m6",
    "day": "Dushanba",
    "time": "12:50 - 13:35",
    "classId": "c-7d",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-7d-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-7d",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-7d-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-7d",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-7d-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-7d",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-7d-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-7d",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-7d-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-7d",
    "subject": "O'zbekiston tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-7d-tu6",
    "day": "Seshanba",
    "time": "12:50 - 13:35",
    "classId": "c-7d",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-7d-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-7d",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-7d-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-7d",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-7d-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-7d",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-7d-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-7d",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-7d-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-7d",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-7d-we6",
    "day": "Chorshanba",
    "time": "12:50 - 13:35",
    "classId": "c-7d",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-7d-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-7d",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-7d-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-7d",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-7d-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-7d",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-7d-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-7d",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-7d-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-7d",
    "subject": "Jahon tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-7d-th6",
    "day": "Payshanba",
    "time": "12:50 - 13:35",
    "classId": "c-7d",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-7d-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-7d",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-7d-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-7d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-7d-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-7d",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-7d-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-7d",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-7d-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-7d",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-7d-fr6",
    "day": "Juma",
    "time": "12:50 - 13:35",
    "classId": "c-7d",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-7d-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-7d",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-7d-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-7d",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-7d-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-7d",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-7d-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-7d",
    "subject": "Huquq",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-7d-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-7d",
    "subject": "O'zbekiston tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-8a-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-8a",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-8a-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-8a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-8a-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-8a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-8a-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-8a",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-8a-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-8a",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-8a-m6",
    "day": "Dushanba",
    "time": "12:50 - 13:35",
    "classId": "c-8a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-8a-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-8a",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-8a-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-8a",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-8a-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-8a",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-8a-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-8a",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-8a-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-8a",
    "subject": "O'zbekiston tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-8a-tu6",
    "day": "Seshanba",
    "time": "12:50 - 13:35",
    "classId": "c-8a",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-8a-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-8a",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-8a-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-8a",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-8a-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-8a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-8a-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-8a",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-8a-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-8a",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-8a-we6",
    "day": "Chorshanba",
    "time": "12:50 - 13:35",
    "classId": "c-8a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-8a-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-8a",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-8a-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-8a",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-8a-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-8a",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-8a-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-8a",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-8a-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-8a",
    "subject": "Jahon tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-8a-th6",
    "day": "Payshanba",
    "time": "12:50 - 13:35",
    "classId": "c-8a",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-8a-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-8a",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-8a-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-8a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-8a-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-8a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-8a-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-8a",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-8a-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-8a",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-8a-fr6",
    "day": "Juma",
    "time": "12:50 - 13:35",
    "classId": "c-8a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-8a-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-8a",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-8a-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-8a",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-8a-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-8a",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-8a-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-8a",
    "subject": "Huquq",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-8a-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-8a",
    "subject": "O'zbekiston tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-8b-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-8b",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-8b-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-8b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-8b-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-8b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-8b-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-8b",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-8b-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-8b",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-8b-m6",
    "day": "Dushanba",
    "time": "12:50 - 13:35",
    "classId": "c-8b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-8b-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-8b",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-8b-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-8b",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-8b-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-8b",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-8b-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-8b",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-8b-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-8b",
    "subject": "O'zbekiston tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-8b-tu6",
    "day": "Seshanba",
    "time": "12:50 - 13:35",
    "classId": "c-8b",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-8b-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-8b",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-8b-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-8b",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-8b-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-8b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-8b-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-8b",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-8b-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-8b",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-8b-we6",
    "day": "Chorshanba",
    "time": "12:50 - 13:35",
    "classId": "c-8b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-8b-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-8b",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-8b-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-8b",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-8b-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-8b",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-8b-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-8b",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-8b-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-8b",
    "subject": "Jahon tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-8b-th6",
    "day": "Payshanba",
    "time": "12:50 - 13:35",
    "classId": "c-8b",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-8b-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-8b",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-8b-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-8b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-8b-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-8b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-8b-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-8b",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-8b-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-8b",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-8b-fr6",
    "day": "Juma",
    "time": "12:50 - 13:35",
    "classId": "c-8b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-8b-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-8b",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-8b-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-8b",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-8b-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-8b",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-8b-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-8b",
    "subject": "Huquq",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-8b-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-8b",
    "subject": "O'zbekiston tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-9a-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-9a",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-9a-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-9a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-9a-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-9a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-9a-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-9a",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-9a-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-9a",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-9a-m6",
    "day": "Dushanba",
    "time": "12:50 - 13:35",
    "classId": "c-9a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-9a-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-9a",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-9a-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-9a",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-9a-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-9a",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-9a-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-9a",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-9a-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-9a",
    "subject": "O'zbekiston tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-9a-tu6",
    "day": "Seshanba",
    "time": "12:50 - 13:35",
    "classId": "c-9a",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-9a-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-9a",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-9a-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-9a",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-9a-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-9a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-9a-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-9a",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-9a-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-9a",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-9a-we6",
    "day": "Chorshanba",
    "time": "12:50 - 13:35",
    "classId": "c-9a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-9a-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-9a",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-9a-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-9a",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-9a-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-9a",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-9a-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-9a",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-9a-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-9a",
    "subject": "Jahon tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-9a-th6",
    "day": "Payshanba",
    "time": "12:50 - 13:35",
    "classId": "c-9a",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-9a-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-9a",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-9a-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-9a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-9a-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-9a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-9a-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-9a",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-9a-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-9a",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-9a-fr6",
    "day": "Juma",
    "time": "12:50 - 13:35",
    "classId": "c-9a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-9a-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-9a",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-9a-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-9a",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-9a-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-9a",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-9a-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-9a",
    "subject": "Huquq",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-9a-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-9a",
    "subject": "O'zbekiston tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-9b-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-9b",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-9b-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-9b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-9b-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-9b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-9b-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-9b",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-9b-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-9b",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-9b-m6",
    "day": "Dushanba",
    "time": "12:50 - 13:35",
    "classId": "c-9b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-9b-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-9b",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-9b-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-9b",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-9b-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-9b",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-9b-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-9b",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-9b-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-9b",
    "subject": "O'zbekiston tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-9b-tu6",
    "day": "Seshanba",
    "time": "12:50 - 13:35",
    "classId": "c-9b",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-9b-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-9b",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-9b-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-9b",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-9b-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-9b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-9b-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-9b",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-9b-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-9b",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-9b-we6",
    "day": "Chorshanba",
    "time": "12:50 - 13:35",
    "classId": "c-9b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-9b-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-9b",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-9b-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-9b",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-9b-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-9b",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-9b-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-9b",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-9b-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-9b",
    "subject": "Jahon tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-9b-th6",
    "day": "Payshanba",
    "time": "12:50 - 13:35",
    "classId": "c-9b",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-9b-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-9b",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-9b-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-9b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-9b-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-9b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-9b-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-9b",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-9b-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-9b",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-9b-fr6",
    "day": "Juma",
    "time": "12:50 - 13:35",
    "classId": "c-9b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-9b-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-9b",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-9b-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-9b",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-9b-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-9b",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-9b-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-9b",
    "subject": "Huquq",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-9b-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-9b",
    "subject": "O'zbekiston tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-9d-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-9d",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-9d-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-9d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-9d-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-9d",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-9d-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-9d",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-9d-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-9d",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-9d-m6",
    "day": "Dushanba",
    "time": "12:50 - 13:35",
    "classId": "c-9d",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-9d-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-9d",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-9d-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-9d",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-9d-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-9d",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-9d-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-9d",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-9d-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-9d",
    "subject": "O'zbekiston tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-9d-tu6",
    "day": "Seshanba",
    "time": "12:50 - 13:35",
    "classId": "c-9d",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-9d-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-9d",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-9d-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-9d",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-9d-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-9d",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-9d-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-9d",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-9d-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-9d",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-9d-we6",
    "day": "Chorshanba",
    "time": "12:50 - 13:35",
    "classId": "c-9d",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-9d-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-9d",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-9d-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-9d",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-9d-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-9d",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-9d-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-9d",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-9d-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-9d",
    "subject": "Jahon tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-9d-th6",
    "day": "Payshanba",
    "time": "12:50 - 13:35",
    "classId": "c-9d",
    "subject": "Texnologiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-9d-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-9d",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-9d-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-9d",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-9d-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-9d",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-9d-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-9d",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-9d-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-9d",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-9d-fr6",
    "day": "Juma",
    "time": "12:50 - 13:35",
    "classId": "c-9d",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-9d-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-9d",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-9d-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-9d",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-9d-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-9d",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-9d-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-9d",
    "subject": "Huquq",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-9d-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-9d",
    "subject": "O'zbekiston tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-10a-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-10a",
    "subject": "Kelajak soati",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-10a-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-10a",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-10a-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-10a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-10a-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-10a",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-10a-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-10a",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-10a-m6",
    "day": "Dushanba",
    "time": "12:50 - 13:35",
    "classId": "c-10a",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-10a-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-10a",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-10a-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-10a",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-10a-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-10a",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-10a-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-10a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-10a-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-10a",
    "subject": "Jahon tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-10a-tu6",
    "day": "Seshanba",
    "time": "12:50 - 13:35",
    "classId": "c-10a",
    "subject": "ChQBT",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-10a-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-10a",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-10a-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-10a",
    "subject": "Davlat va huquq",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-10a-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-10a",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-10a-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-10a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-10a-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-10a",
    "subject": "ChQBT",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-10a-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-10a",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-10a-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-10a",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-10a-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-10a",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-10a-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-10a",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-10a-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-10a",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-10a-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-10a",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-10a-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-10a",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-10a-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-10a",
    "subject": "O'zbekiston tarixi",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-10a-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-10a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-10a-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-10a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-10a-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-10a",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-10a-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-10a",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-10a-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-10a",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-10a-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-10a",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-10a-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-10a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-10b-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-10b",
    "subject": "Kelajak soati",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-10b-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-10b",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-10b-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-10b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-10b-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-10b",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-10b-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-10b",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-10b-m6",
    "day": "Dushanba",
    "time": "12:50 - 13:35",
    "classId": "c-10b",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-10b-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-10b",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-10b-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-10b",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-10b-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-10b",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-10b-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-10b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-10b-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-10b",
    "subject": "Jahon tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-10b-tu6",
    "day": "Seshanba",
    "time": "12:50 - 13:35",
    "classId": "c-10b",
    "subject": "ChQBT",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-10b-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-10b",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-10b-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-10b",
    "subject": "Davlat va huquq",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-10b-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-10b",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-10b-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-10b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-10b-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-10b",
    "subject": "ChQBT",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-10b-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-10b",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-10b-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-10b",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-10b-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-10b",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-10b-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-10b",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-10b-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-10b",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-10b-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-10b",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-10b-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-10b",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-10b-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-10b",
    "subject": "O'zbekiston tarixi",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-10b-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-10b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-10b-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-10b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-10b-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-10b",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-10b-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-10b",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-10b-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-10b",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-10b-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-10b",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-10b-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-10b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-11a-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-11a",
    "subject": "Kelajak soati",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-11a-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-11a",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-11a-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-11a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-11a-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-11a",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-11a-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-11a",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-11a-m6",
    "day": "Dushanba",
    "time": "12:50 - 13:35",
    "classId": "c-11a",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-11a-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-11a",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-11a-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-11a",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-11a-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-11a",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-11a-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-11a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-11a-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-11a",
    "subject": "Jahon tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-11a-tu6",
    "day": "Seshanba",
    "time": "12:50 - 13:35",
    "classId": "c-11a",
    "subject": "ChQBT",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-11a-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-11a",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-11a-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-11a",
    "subject": "Davlat va huquq",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-11a-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-11a",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-11a-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-11a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-11a-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-11a",
    "subject": "ChQBT",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-11a-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-11a",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-11a-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-11a",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-11a-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-11a",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-11a-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-11a",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-11a-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-11a",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-11a-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-11a",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-11a-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-11a",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-11a-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-11a",
    "subject": "O'zbekiston tarixi",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-11a-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-11a",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-11a-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-11a",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-11a-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-11a",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-11a-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-11a",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-11a-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-11a",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-11a-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-11a",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-11a-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-11a",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-11b-m1",
    "day": "Dushanba",
    "time": "08:30 - 09:15",
    "classId": "c-11b",
    "subject": "Kelajak soati",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-11b-m2",
    "day": "Dushanba",
    "time": "09:20 - 10:05",
    "classId": "c-11b",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-11b-m3",
    "day": "Dushanba",
    "time": "10:10 - 10:55",
    "classId": "c-11b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-11b-m4",
    "day": "Dushanba",
    "time": "11:00 - 11:45",
    "classId": "c-11b",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-11b-m5",
    "day": "Dushanba",
    "time": "12:00 - 12:45",
    "classId": "c-11b",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-11b-m6",
    "day": "Dushanba",
    "time": "12:50 - 13:35",
    "classId": "c-11b",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-11b-tu1",
    "day": "Seshanba",
    "time": "08:30 - 09:15",
    "classId": "c-11b",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-11b-tu2",
    "day": "Seshanba",
    "time": "09:20 - 10:05",
    "classId": "c-11b",
    "subject": "Tarbiya",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-11b-tu3",
    "day": "Seshanba",
    "time": "10:10 - 10:55",
    "classId": "c-11b",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-11b-tu4",
    "day": "Seshanba",
    "time": "11:00 - 11:45",
    "classId": "c-11b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-11b-tu5",
    "day": "Seshanba",
    "time": "12:00 - 12:45",
    "classId": "c-11b",
    "subject": "Jahon tarixi",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-11b-tu6",
    "day": "Seshanba",
    "time": "12:50 - 13:35",
    "classId": "c-11b",
    "subject": "ChQBT",
    "teacherId": null,
    "lessonOrder": 6,
    "teacherName": ""
  },
  {
    "id": "sch-11b-we1",
    "day": "Chorshanba",
    "time": "08:30 - 09:15",
    "classId": "c-11b",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-11b-we2",
    "day": "Chorshanba",
    "time": "09:20 - 10:05",
    "classId": "c-11b",
    "subject": "Davlat va huquq",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-11b-we3",
    "day": "Chorshanba",
    "time": "10:10 - 10:55",
    "classId": "c-11b",
    "subject": "Informatika",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-11b-we4",
    "day": "Chorshanba",
    "time": "11:00 - 11:45",
    "classId": "c-11b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-11b-we5",
    "day": "Chorshanba",
    "time": "12:00 - 12:45",
    "classId": "c-11b",
    "subject": "ChQBT",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-11b-th1",
    "day": "Payshanba",
    "time": "08:30 - 09:15",
    "classId": "c-11b",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-11b-th2",
    "day": "Payshanba",
    "time": "09:20 - 10:05",
    "classId": "c-11b",
    "subject": "Fizika",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-11b-th3",
    "day": "Payshanba",
    "time": "10:10 - 10:55",
    "classId": "c-11b",
    "subject": "Geografiya",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-11b-th4",
    "day": "Payshanba",
    "time": "11:00 - 11:45",
    "classId": "c-11b",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-11b-th5",
    "day": "Payshanba",
    "time": "12:00 - 12:45",
    "classId": "c-11b",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-11b-fr1",
    "day": "Juma",
    "time": "08:30 - 09:15",
    "classId": "c-11b",
    "subject": "Algebra",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-11b-fr2",
    "day": "Juma",
    "time": "09:20 - 10:05",
    "classId": "c-11b",
    "subject": "Biologiya",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-11b-fr3",
    "day": "Juma",
    "time": "10:10 - 10:55",
    "classId": "c-11b",
    "subject": "O'zbekiston tarixi",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-11b-fr4",
    "day": "Juma",
    "time": "11:00 - 11:45",
    "classId": "c-11b",
    "subject": "Ona tili",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-11b-fr5",
    "day": "Juma",
    "time": "12:00 - 12:45",
    "classId": "c-11b",
    "subject": "Jismoniy tarbiya",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  },
  {
    "id": "sch-11b-sa1",
    "day": "Shanba",
    "time": "08:30 - 09:15",
    "classId": "c-11b",
    "subject": "Kimyo",
    "teacherId": null,
    "lessonOrder": 1,
    "teacherName": ""
  },
  {
    "id": "sch-11b-sa2",
    "day": "Shanba",
    "time": "09:20 - 10:05",
    "classId": "c-11b",
    "subject": "Geometriya",
    "teacherId": null,
    "lessonOrder": 2,
    "teacherName": ""
  },
  {
    "id": "sch-11b-sa3",
    "day": "Shanba",
    "time": "10:10 - 10:55",
    "classId": "c-11b",
    "subject": "Rus tili",
    "teacherId": null,
    "lessonOrder": 3,
    "teacherName": ""
  },
  {
    "id": "sch-11b-sa4",
    "day": "Shanba",
    "time": "11:00 - 11:45",
    "classId": "c-11b",
    "subject": "Adabiyot",
    "teacherId": null,
    "lessonOrder": 4,
    "teacherName": ""
  },
  {
    "id": "sch-11b-sa5",
    "day": "Shanba",
    "time": "12:00 - 12:45",
    "classId": "c-11b",
    "subject": "Ingliz tili",
    "teacherId": null,
    "lessonOrder": 5,
    "teacherName": ""
  }
];

export const TODAY_DATE = new Date().toISOString().split('T')[0];

export const INITIAL_ATTENDANCE = [
  // 7-oktabr (Bugungi kun)
  {
    id: 'att-2026-10-07-10a',
    date: '2026-10-07',
    classId: 'c-10a',
    inspectorName: 'Navbatchi xodim',
    timestamp: '08:45',
    records: [
      { studentId: 's-10a-1', status: 'present', inTime: '08:14', outTime: null, reason: '', customAddress: '' },
      { studentId: 's-10a-2', status: 'present', inTime: '08:20', outTime: null, reason: '', customAddress: '' },
      { id: 's-10a-3', studentId: 's-10a-3', status: 'absent', reason: 'Sababli (Kasal)', customAddress: 'Istiqlol MFY, Farg\'ona 22-uy' },
      { studentId: 's-10a-4', status: 'present', inTime: '08:05', outTime: null, reason: '', customAddress: '' },
      { studentId: 's-10a-5', status: 'absent', reason: 'Sababsiz', customAddress: 'Yangiobod MFY, Yangi hayot 19-uy' },
      { studentId: 's-10a-6', status: 'present', inTime: '08:12', outTime: null, reason: '', customAddress: '' },
      { studentId: 's-10a-7', status: 'present', inTime: '08:10', outTime: null, reason: '', customAddress: '' },
      { studentId: 's-10a-8', status: 'late', inTime: '08:40', outTime: null, reason: 'Kechikkan', customAddress: 'Yuksalish MFY, Amir Temur 51-uy' },
      { studentId: 's-10a-9', status: 'present', inTime: '08:15', outTime: null, reason: '', customAddress: '' },
      { studentId: 's-10a-10', status: 'present', inTime: '08:18', outTime: null, reason: '', customAddress: '' },
    ]
  },
  {
    id: 'att-2026-10-07-9a',
    date: '2026-10-07',
    classId: 'c-9a',
    inspectorName: 'Turniket 1 (Kirish)',
    timestamp: '08:30',
    records: [
      { studentId: 's-9a-1', status: 'present', inTime: '08:08', reason: '' },
      { studentId: 's-9a-2', status: 'present', inTime: '08:11', reason: '' },
      { studentId: 's-9a-3', status: 'absent', reason: 'Sababsiz', customAddress: 'Bog\'ot tumani, Guliston MFY 44' }
    ]
  },
  // 6-oktabr (Kecha)
  {
    id: 'att-2026-10-06-10a',
    date: '2026-10-06',
    classId: 'c-10a',
    inspectorName: 'Navbatchi xodim',
    timestamp: '08:40',
    records: [
      { studentId: 's-10a-1', status: 'present', inTime: '08:10', outTime: '13:10', reason: '' },
      { studentId: 's-10a-2', status: 'present', inTime: '08:15', outTime: '13:10', reason: '' },
      { studentId: 's-10a-3', status: 'present', inTime: '08:22', outTime: '13:10', reason: '' },
      { studentId: 's-10a-4', status: 'present', inTime: '08:04', outTime: '13:10', reason: '' },
      { studentId: 's-10a-5', status: 'absent', reason: 'Sababsiz kelmadi', customAddress: 'Yangiobod MFY 19-uy' },
      { studentId: 's-10a-6', status: 'present', inTime: '08:18', outTime: '13:10', reason: '' }
    ]
  },
  // 5-oktabr (Dushanba)
  {
    id: 'att-2026-10-05-10a',
    date: '2026-10-05',
    classId: 'c-10a',
    inspectorName: 'Navbatchi xodim',
    timestamp: '08:35',
    records: [
      { studentId: 's-10a-1', status: 'present', inTime: '08:12', outTime: '13:05', reason: '' },
      { studentId: 's-10a-2', status: 'present', inTime: '08:14', outTime: '13:05', reason: '' },
      { studentId: 's-10a-3', status: 'absent', reason: 'Olimpiadada', customAddress: 'Istiqlol MFY 22-uy' },
      { studentId: 's-10a-4', status: 'present', inTime: '08:08', outTime: '13:05', reason: '' },
      { studentId: 's-10a-5', status: 'present', inTime: '08:25', outTime: '13:05', reason: '' },
      { studentId: 's-10a-6', status: 'present', inTime: '08:19', outTime: '13:05', reason: '' }
    ]
  },
  // 8-oktabr
  {
    id: 'att-2026-10-08-10a',
    date: '2026-10-08',
    classId: 'c-10a',
    inspectorName: 'Turniket 2 (Kirish)',
    timestamp: '08:20',
    records: [
      { studentId: 's-10a-1', status: 'present', inTime: '08:09', reason: '' },
      { studentId: 's-10a-2', status: 'present', inTime: '08:13', reason: '' },
      { studentId: 's-10a-4', status: 'present', inTime: '08:07', reason: '' },
      { studentId: 's-10a-6', status: 'present', inTime: '08:11', reason: '' }
    ]
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    target: 'all',
    type: 'attendance_alert',
    title: '10-A sinf davomati topshirildi',
    message: 'Navbatchi 10-A sinf davomatini yubordi (2 nafar kelmagan).',
    classId: 'c-10a',
    time: '08:46',
    isRead: false
  }
];
