const fs = require('fs');
const path = require('path');

// 1. Load 737 students from src/studentsFromFace.js
const faceContent = fs.readFileSync(path.join(__dirname, '../src/studentsFromFace.js'), 'utf8');
const start = faceContent.indexOf('[');
const end = faceContent.lastIndexOf(']');
const students = JSON.parse(faceContent.substring(start, end + 1));

console.log(`Loaded ${students.length} students from src/studentsFromFace.js`);

// 2. Load classes, teachers, schedules from src/mockData.js
// We can parse or define them cleanly
const dbData = {
  students: students,
  lastUpdated: Date.now()
};

const dbPath = path.join(__dirname, 'school_db.json');
fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
console.log(`Saved initial school_db.json with ${students.length} students!`);
