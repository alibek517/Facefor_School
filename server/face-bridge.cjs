const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Global xatoliklarni ushlab qolish (server to'xtab qolmasligi uchun)
process.on('uncaughtException', (err) => {
  console.warn('[SERVER uncaughtException]', err?.message || err);
});
process.on('unhandledRejection', (reason) => {
  console.warn('[SERVER unhandledRejection]', reason?.message || reason);
});

let cloudflareProcess = null;
let currentTunnelUrl = null;

function startCloudflareTunnel() {
  const exePath = path.join(__dirname, 'cloudflared.exe');
  if (!fs.existsSync(exePath)) {
    console.log('[TUNNEL] cloudflared.exe topilmadi, faqat lokal rejimda ishlaydi.');
    return;
  }

  try {
    if (cloudflareProcess) {
      try { cloudflareProcess.kill(); } catch (e) {}
    }

    cloudflareProcess = spawn(exePath, ['tunnel', '--url', `http://localhost:${CONFIG.BRIDGE_PORT}`], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const handleOutput = (chunk) => {
      const text = chunk.toString();
      const match = text.match(/https:\/\/([a-zA-Z0-9-]+)\.trycloudflare\.com/);
      if (match && match[1] && match[1] !== 'api' && match[0] !== currentTunnelUrl) {
        currentTunnelUrl = match[0];
        console.log(`=======================================================`);
        console.log(`🌍 [GLOBAL BEPUL EFIR]: Kameralar butun dunyo internetiga ulandi!`);
        console.log(`🔗 Global Havola: ${currentTunnelUrl}`);
        console.log(`=======================================================`);

        // Supabase ga saqlash (Vercel va telefonlar avtomatik ulanadi)
        syncModuleToSupabase('global_stream_url', currentTunnelUrl);

        // SSE mijozlariga uzatish
        broadcastSSE('global_stream_url', currentTunnelUrl);
      }
    };

    cloudflareProcess.stdout.on('data', handleOutput);
    cloudflareProcess.stderr.on('data', handleOutput);

    cloudflareProcess.on('exit', (code) => {
      console.log(`[TUNNEL] cloudflared to'xtadi (kod: ${code}), 8 soniyada qayta uriniladi...`);
      setTimeout(startCloudflareTunnel, 8000);
    });

    cloudflareProcess.on('error', (err) => {
      console.warn('[TUNNEL ERROR]', err?.message || err);
    });
  } catch (e) {
    console.warn('[TUNNEL START ERROR]', e);
  }
}

process.on('exit', () => {
  if (cloudflareProcess) {
    try { cloudflareProcess.kill(); } catch (e) {}
  }
});

// Asosiy sozlamalar
const CONFIG = {
  BRIDGE_PORT: 5001,
  DEVICE_USER: 'admin',
  DEVICE_PASS: 'Islam4343',
  POLL_INTERVAL_MS: 3000
};

// 6 ta Turniket Kamera qurilmalari (Foydalanuvchi tanlagan tartib: Chiqish 6, Chiqish 2, Chiqish 1, Kirish 3, Kirish 4, Kirish 5)
let CAMERAS = [
  { id: 'cam-6', ip: '192.168.1.13', type: 'out', name: 'Turniket 6 (Chiqish)', location: 'Chiqish yo\'lagi (3)', online: true, lastEvent: null },
  { id: 'cam-2', ip: '192.168.1.32', type: 'out', name: 'Turniket 2 (Chiqish)', location: 'Bosh kirish eshigi (2)', online: true, lastEvent: null },
  { id: 'cam-1', ip: '192.168.1.35', type: 'out', name: 'Turniket 1 (Chiqish)', location: 'Bosh kirish eshigi (1)', online: true, lastEvent: null },
  { id: 'cam-3', ip: '192.168.1.36', type: 'in', name: 'Turniket 3 (Kirish)', location: 'Bosh kirish eshigi (3)', online: true, lastEvent: null },
  { id: 'cam-4', ip: '192.168.1.86', type: 'in', name: 'Turniket 4 (Kirish)', location: 'Chiqish yo\'lagi (1)', online: true, lastEvent: null },
  { id: 'cam-5', ip: '192.168.1.33', type: 'in', name: 'Turniket 5 (Kirish)', location: 'Chiqish yo\'lagi (2)', online: true, lastEvent: null },
];

// Suratlar keshi papkasi
const PHOTO_CACHE_DIR = path.join(__dirname, 'photo_cache');
if (!fs.existsSync(PHOTO_CACHE_DIR)) {
  try { fs.mkdirSync(PHOTO_CACHE_DIR, { recursive: true }); } catch (e) {}
}

// 737 ta o'quvchi ma'lumotlarini yuklash
let cachedUsers = [];
let usersMap = new Map();
try {
  const usersPath = path.join(__dirname, '../src/faceUsers.json');
  if (fs.existsSync(usersPath)) {
    cachedUsers = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    cachedUsers.forEach(u => {
      usersMap.set(u.employeeNo, u);
    });
    console.log(`[INFO] src/faceUsers.json dan ${cachedUsers.length} ta foydalanuvchi yuklandi.`);
  }
} catch (e) {
  console.warn('[WARN] faceUsers.json o\'qishda xatolik:', e.message);
}

// ==================== BAZA VA SERVER SINXRONIZATSIYASI ====================
const DB_FILE = path.join(__dirname, 'school_db.json');

function loadSchoolDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('[DB] Yuklashda xatolik:', e.message);
  }
  return null;
}

function saveSchoolDB(data) {
  try {
    data.lastUpdated = Date.now();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('[DB] Saqlashda xatolik:', e.message);
    return false;
  }
}

let schoolDB = loadSchoolDB() || {
  students: null,
  classes: null,
  teachers: null,
  schedules: null,
  attendanceList: null,
  teacherAttendance: null,
  hourlyAttendance: null,
  cameras: null,
  lastUpdated: Date.now()
};

// ==================== SUPABASE BULUTLI INTEGRATSIYA ====================
const SUPABASE_CONFIG = {
  URL: 'https://ffwbxpqfzlkevxhijvtd.supabase.co',
  KEY: 'sb_publishable_IN4OpUU6gNpnZINpifQSAg_DZuksmMD'
};

async function syncCamerasToSupabase(camerasList) {
  try {
    const payload = camerasList.map(c => ({
      id: c.id,
      name: c.name,
      ip: c.ip,
      type: c.type,
      location: c.location || '',
      updated_at: new Date().toISOString()
    }));

    const res = await fetch(`${SUPABASE_CONFIG.URL}/rest/v1/camera_settings`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.KEY,
        'Authorization': `Bearer ${SUPABASE_CONFIG.KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      console.log('[SUPABASE] 6 ta kamera yo\'nalishlari Supabase bulutiga saqlandi.');
    }
  } catch (err) {}
}

async function loadCamerasFromSupabase() {
  try {
    const res = await fetch(`${SUPABASE_CONFIG.URL}/rest/v1/camera_settings?select=*`, {
      headers: {
        'apikey': SUPABASE_CONFIG.KEY,
        'Authorization': `Bearer ${SUPABASE_CONFIG.KEY}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        let changed = false;
        data.forEach(saved => {
          const cam = CAMERAS.find(c => c.id === saved.id || c.ip === saved.ip);
          if (cam && saved.type && cam.type !== saved.type) {
            cam.type = saved.type;
            changed = true;
          }
        });
        if (changed) {
          if (typeof broadcastSSE === 'function') {
            broadcastSSE('cameras_updated', CAMERAS);
          }
          console.log(`[SUPABASE] Supabase bulutidan kamera sozlamalari tiklandi va yangilandi.`);
        }
      }
    }
  } catch (err) {}
}

async function syncModuleToSupabase(key, data) {
  try {
    await fetch(`${SUPABASE_CONFIG.URL}/rest/v1/school_data`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.KEY,
        'Authorization': `Bearer ${SUPABASE_CONFIG.KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({ key, data, updated_at: new Date().toISOString() })
    });
  } catch (err) {}
}

async function loadSchoolDataFromSupabase() {
  try {
    const res = await fetch(`${SUPABASE_CONFIG.URL}/rest/v1/school_data?select=*`, {
      headers: {
        'apikey': SUPABASE_CONFIG.KEY,
        'Authorization': `Bearer ${SUPABASE_CONFIG.KEY}`
      }
    });
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        let hasChanges = false;
        rows.forEach(r => {
          if (r.key && r.data) {
            if (r.key === 'local_status') return; // Heartbeat keshini chetlab o'tish

            if (r.key === 'cameras' && Array.isArray(r.data) && r.data.length >= 6) {
              const reordered = [];
              r.data.forEach(saved => {
                const found = CAMERAS.find(c => c.id === saved.id || c.ip === saved.ip);
                if (found) {
                  found.type = saved.type;
                  if (saved.name) found.name = saved.name;
                  if (!reordered.includes(found)) reordered.push(found);
                }
              });
              CAMERAS.forEach(c => { if (!reordered.includes(c)) reordered.push(c); });
              CAMERAS = reordered;
            }

            if (JSON.stringify(schoolDB[r.key]) !== JSON.stringify(r.data)) {
              schoolDB[r.key] = r.data;
              hasChanges = true;
            }
          }
        });
        if (hasChanges) {
          saveSchoolDB(schoolDB);
          if (typeof broadcastSSE === 'function') {
            broadcastSSE('school_data_sync', schoolDB);
          }
          console.log(`[SUPABASE SYNC] Direktor/admin bulutda kiritgan yangi o'zgarishlar lokal kompyuterga ko'chirildi va ekranlarga uzatildi.`);
        }
      }
    }
  } catch (err) {}
}

async function logScanToSupabase(scan) {
  try {
    await fetch(`${SUPABASE_CONFIG.URL}/rest/v1/face_scans`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.KEY,
        'Authorization': `Bearer ${SUPABASE_CONFIG.KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        employee_no: scan.employeeNo || '',
        name: scan.name || '',
        camera_name: scan.cameraName || '',
        camera_ip: scan.cameraIp || '',
        direction: scan.direction || 'in',
        time_formatted: scan.timeFormatted || '',
        created_at: new Date().toISOString()
      })
    });
  } catch (err) {}
}

// 1. Saqlangan kamera yo'nalishlarini va tartibini school_db.json dan tiklash
if (schoolDB.cameras && Array.isArray(schoolDB.cameras) && schoolDB.cameras.length > 0) {
  const reordered = [];
  schoolDB.cameras.forEach(saved => {
    const cam = CAMERAS.find(c => c.id === saved.id || c.ip === saved.ip);
    if (cam) {
      if (saved.type) cam.type = saved.type;
      reordered.push(cam);
    }
  });
  CAMERAS.forEach(c => {
    if (!reordered.find(r => r.id === c.id)) reordered.push(c);
  });
  CAMERAS = reordered;
  console.log('[DB] school_db.json dan kamera yo\'nalishlari va tartibi tiklandi.');
}

// 2. Supabase bulutidan ham tekshirib olish va har 10 soniyada sinxronizatsiya qilib turish
async function sendHeartbeatToSupabase() {
  try {
    const onlineCameras = CAMERAS.filter(c => c.online).length;
    await syncModuleToSupabase('local_status', {
      last_heartbeat: new Date().toISOString(),
      timestamp: Date.now(),
      online: true,
      cameras_online: onlineCameras,
      total_cameras: CAMERAS.length,
      clients_count: sseClients.length,
      message: "Maktab lokal serveri va Wi-Fi tarmog'i faol"
    });
  } catch (err) {}
}

loadCamerasFromSupabase();
loadSchoolDataFromSupabase();
setTimeout(sendHeartbeatToSupabase, 1500);

setInterval(() => {
  loadCamerasFromSupabase();
  loadSchoolDataFromSupabase();
  sendHeartbeatToSupabase();
}, 10000);

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function parseDigestHeader(header) {
  const params = {};
  const regex = /(\w+)=["']?([^"',]+)["']?/g;
  let match;
  while ((match = regex.exec(header)) !== null) {
    params[match[1]] = match[2];
  }
  return params;
}

// Digest avtorizatsiya so'rovi (Promise va timeout bilan)
function digestRequest({ host, port = 80, path, method = 'GET', body = null, username, password, timeout = 3500, isBinary = false, contentType = 'application/json' }) {
  return new Promise((resolve, reject) => {
    let resolved = false;
    let activeReq = null;

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        if (activeReq) {
          try { activeReq.destroy(); } catch (e) {}
        }
        reject(new Error('Request timeout (' + timeout + 'ms)'));
      }
    }, timeout);

    const done = (err, result) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      if (err) return reject(err);
      resolve(result);
    };

    const probeReq = http.request({
      host,
      port: port || 80,
      path,
      method,
      agent: false,
      timeout: timeout,
      headers: { 'Content-Length': 0, 'Connection': 'close' }
    }, (res1) => {
      const dummyChunks = [];
      res1.on('data', c => dummyChunks.push(c));
      res1.on('end', () => {
        const authHeader = res1.headers['www-authenticate'];
        if (!authHeader) {
          if (res1.statusCode === 200) {
            const buf = Buffer.concat(dummyChunks);
            return done(null, { status: 200, headers: res1.headers, body: isBinary ? buf : buf.toString('utf8') });
          }
          return done(new Error('Auth header yo\'q: ' + res1.statusCode));
        }

        const params = parseDigestHeader(authHeader);
        const realm = params.realm;
        const nonce = params.nonce;
        const qop = params.qop;
        const uri = path;

        const ha1 = md5(`${username}:${realm}:${password}`);
        const ha2 = md5(`${method}:${uri}`);
        const nc = '00000001';
        const cnonce = crypto.randomBytes(8).toString('hex');

        let response;
        if (qop) {
          response = md5(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`);
        } else {
          response = md5(`${ha1}:${nonce}:${ha2}`);
        }

        let authStr = `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", response="${response}"`;
        if (qop) authStr += `, qop=${qop}, nc=${nc}, cnonce="${cnonce}"`;
        if (params.opaque) authStr += `, opaque="${params.opaque}"`;

        const headers2 = {
          'Authorization': authStr,
          'Connection': 'close'
        };
        if (body) {
          headers2['Content-Type'] = contentType;
          headers2['Content-Length'] = Buffer.byteLength(body);
        } else {
          headers2['Content-Length'] = 0;
        }

        const req2 = http.request({
          host,
          port: port || 80,
          path,
          method,
          agent: false,
          timeout: timeout,
          headers: headers2
        }, (res2) => {
          const bodyChunks = [];
          res2.on('data', c => bodyChunks.push(c));
          res2.on('end', () => {
            const buf = Buffer.concat(bodyChunks);
            done(null, { status: res2.statusCode, headers: res2.headers, body: isBinary ? buf : buf.toString('utf8') });
          });
        });

        activeReq = req2;
        req2.on('timeout', () => {
          try { req2.destroy(); } catch (e) {}
          done(new Error('Req2 timeout'));
        });
        req2.on('error', err => done(err));
        if (body) req2.write(body);
        req2.end();
      });
    });

    activeReq = probeReq;
    probeReq.on('timeout', () => {
      try { probeReq.destroy(); } catch (e) {}
      done(new Error('Probe timeout'));
    });
    probeReq.on('error', err => done(err));
    probeReq.end();
  });
}

// Holat xotirasi
let deviceStatus = {
  online: true,
  ip: '192.168.1.35',
  model: 'DS-K1T343MFWX',
  serial: 'DS-K1T343MFWX20250827V043980ENGG8074900',
  totalUsers: cachedUsers.length || 737,
  totalEventsCount: 0,
  lastSync: new Date().toISOString(),
  error: null,
  activeCameras: 6
};

let recentScans = [];
let lastKnownTotals = new Map();
let sseClients = [];
let isPolling = false;

// 6 ta kamera jonli kadrlarini RAM xotirada saqlash (0ms tezkor javob uchun)
const cameraFrames = new Map();

// ==================== KAMERALAR ARXIVI VA PLAYBACK (ORTGA QAYTARISH) ====================
const PLAYBACK_DIR = path.join(__dirname, 'playback_archive');
if (!fs.existsSync(PLAYBACK_DIR)) {
  try { fs.mkdirSync(PLAYBACK_DIR, { recursive: true }); } catch (e) {}
}

const lastSavedPlaybackTime = new Map();

function savePlaybackArchiveFrame(camIp, buf, customTimeStr = null) {
  if (!isValidJpeg(buf)) return;
  const now = new Date();
  
  if (!customTimeStr) {
    const last = lastSavedPlaybackTime.get(camIp) || 0;
    // Har ~1.8 soniyada bitta arxiv kadr saqlanadi (diskni to'ldirmaydi va silliq orqaga qaytarishni ta'minlaydi)
    if (now.getTime() - last < 1800) return;
    lastSavedPlaybackTime.set(camIp, now.getTime());
  }

  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const dateStr = `${y}-${m}-${d}`;

  let timeParts;
  if (customTimeStr && typeof customTimeStr === 'string' && customTimeStr.includes(':')) {
    timeParts = customTimeStr.split(':').map(x => x.padStart(2, '0'));
  } else {
    timeParts = [
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0')
    ];
  }

  const hourStr = timeParts[0];
  const fileTimeStr = `${timeParts[0]}-${timeParts[1]}-${timeParts[2]}.jpg`;
  const dirPath = path.join(PLAYBACK_DIR, camIp, dateStr, hourStr);

  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const targetFile = path.join(dirPath, fileTimeStr);
    if (!fs.existsSync(targetFile)) {
      fs.writeFileSync(targetFile, buf);
    }
  } catch (err) {}
}

function cleanupOldPlaybackArchives() {
  try {
    if (!fs.existsSync(PLAYBACK_DIR)) return;
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // Oxirgi 7 kunlik yozuvlar saqlanadi
    const now = Date.now();
    const camDirs = fs.readdirSync(PLAYBACK_DIR);
    for (const camDir of camDirs) {
      const camPath = path.join(PLAYBACK_DIR, camDir);
      if (!fs.statSync(camPath).isDirectory()) continue;
      const dateDirs = fs.readdirSync(camPath);
      for (const dDir of dateDirs) {
        const dPath = path.join(camPath, dDir);
        const parts = dDir.split('-').map(Number);
        if (parts.length === 3) {
          const dirTime = new Date(parts[0], parts[1] - 1, parts[2]).getTime();
          if (now - dirTime > maxAgeMs) {
            fs.rmSync(dPath, { recursive: true, force: true });
            console.log(`[PLAYBACK] 7 kundan oshgan arxiv tozalandi: ${dPath}`);
          }
        }
      }
    }
  } catch (e) {}
}
setInterval(cleanupOldPlaybackArchives, 4 * 60 * 60 * 1000);

function getCameraPlaybackDates() {
  const datesSet = new Set();
  const today = new Date().toISOString().split('T')[0];
  datesSet.add(today);

  try {
    if (fs.existsSync(PLAYBACK_DIR)) {
      const camDirs = fs.readdirSync(PLAYBACK_DIR);
      for (const cDir of camDirs) {
        const cPath = path.join(PLAYBACK_DIR, cDir);
        if (!fs.statSync(cPath).isDirectory()) continue;
        const dDirs = fs.readdirSync(cPath);
        dDirs.forEach(d => {
          if (d.match(/^\d{4}-\d{2}-\d{2}$/)) datesSet.add(d);
        });
      }
    }
  } catch (e) {}

  (recentScans || []).forEach(s => {
    if (s.timestamp) {
      const d = s.timestamp.split('T')[0];
      if (d) datesSet.add(d);
    }
  });

  return Array.from(datesSet).sort().reverse();
}

function getCameraPlaybackTimeline(camIp, dateStr) {
  const dStr = dateStr || new Date().toISOString().split('T')[0];
  const camDir = path.join(PLAYBACK_DIR, camIp, dStr);
  const recordedHours = new Set();
  const framesList = [];

  if (fs.existsSync(camDir)) {
    try {
      const hourFolders = fs.readdirSync(camDir).sort();
      for (const h of hourFolders) {
        const hPath = path.join(camDir, h);
        if (!fs.statSync(hPath).isDirectory()) continue;
        const files = fs.readdirSync(hPath).filter(f => f.endsWith('.jpg')).sort();
        if (files.length > 0) {
          recordedHours.add(parseInt(h, 10));
          for (const f of files) {
            const timePart = f.replace('.jpg', '').replace(/-/g, ':');
            const [hh, mm, ss] = timePart.split(':').map(Number);
            framesList.push({
              time: timePart,
              seconds: (hh || 0) * 3600 + (mm || 0) * 60 + (ss || 0)
            });
          }
        }
      }
    } catch (e) {}
  }

  // Turniket skanerlash voqealari (shu kamera va shu sana uchun)
  const camEvents = (recentScans || [])
    .filter(s => (s.cameraIp === camIp || s.cameraId === camIp) && (s.timestamp || '').startsWith(dStr))
    .map(s => {
      const [hh, mm, ss] = (s.timeFormatted || '00:00:00').split(':').map(Number);
      return {
        id: s.id,
        serialNo: s.serialNo,
        name: s.name,
        employeeNo: s.employeeNo,
        direction: s.direction,
        timeFormatted: s.timeFormatted,
        seconds: (hh || 0) * 3600 + (mm || 0) * 60 + (ss || 0),
        photoUrl: `/api/device/photo/${s.employeeNo}`
      };
    })
    .sort((a, b) => a.seconds - b.seconds);

  const camObj = CAMERAS.find(c => c.ip === camIp || c.id === camIp) || { ip: camIp, name: `Kamera ${camIp}` };

  return {
    success: true,
    camera: camObj,
    date: dStr,
    recordedHours: Array.from(recordedHours).sort((a, b) => a - b),
    totalFrames: framesList.length,
    hasRecordings: framesList.length > 0,
    earliestTime: framesList.length > 0 ? framesList[0].time : '07:30:00',
    latestTime: framesList.length > 0 ? framesList[framesList.length - 1].time : '18:00:00',
    events: camEvents
  };
}

function getCameraPlaybackFrame(camIp, dateStr, targetTimeStr) {
  const dStr = dateStr || new Date().toISOString().split('T')[0];
  const tStr = (targetTimeStr || '08:00:00').trim();
  const [th, tm, ts] = tStr.split(':').map(Number);
  const targetSeconds = (th || 0) * 3600 + (tm || 0) * 60 + (ts || 0);

  const camDir = path.join(PLAYBACK_DIR, camIp, dStr);
  let bestFilePath = null;
  let minDiff = Infinity;
  let bestTimeStr = tStr;

  if (fs.existsSync(camDir)) {
    try {
      const targetHour = Math.max(0, Math.min(23, th || 0));
      const candidateHours = [
        String(targetHour).padStart(2, '0'),
        targetHour > 0 ? String(targetHour - 1).padStart(2, '0') : null,
        targetHour < 23 ? String(targetHour + 1).padStart(2, '0') : null
      ].filter(Boolean);

      for (const h of candidateHours) {
        const hPath = path.join(camDir, h);
        if (!fs.existsSync(hPath)) continue;
        const files = fs.readdirSync(hPath).filter(f => f.endsWith('.jpg'));
        for (const f of files) {
          const parts = f.replace('.jpg', '').split('-').map(Number);
          if (parts.length === 3) {
            const fSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
            const diff = Math.abs(fSeconds - targetSeconds);
            if (diff < minDiff) {
              minDiff = diff;
              bestFilePath = path.join(hPath, f);
              bestTimeStr = `${String(parts[0]).padStart(2, '0')}:${String(parts[1]).padStart(2, '0')}:${String(parts[2]).padStart(2, '0')}`;
            }
          }
        }
      }
    } catch (e) {}
  }

  if (bestFilePath && fs.existsSync(bestFilePath)) {
    try {
      const buf = fs.readFileSync(bestFilePath);
      return { buffer: buf, actualTime: bestTimeStr, diffSeconds: minDiff, found: true };
    } catch (e) {}
  }

  // Agar arxiv kadr topilmasa, RAM keshdagi joriy kadrni uzatamiz
  const cached = cameraFrames.get(camIp);
  if (cached && isValidJpeg(cached.buffer)) {
    return { buffer: cached.buffer, actualTime: tStr, diffSeconds: 0, found: false };
  }

  return null;
}

// Haqiqiy va buzilmagan JPEG ekanligini qat'iy tekshirish (0xFF 0xD8 baytlari)
function isValidJpeg(buf) {
  return Buffer.isBuffer(buf) && buf.length > 2000 && buf[0] === 0xff && buf[1] === 0xd8;
}

async function updateCameraFrame(cam) {
  try {
    // 1-ustuvorlik: Asosiy tiniq video kanali (101 - Main Stream)
    let snapRes = await digestRequest({
      host: cam.ip,
      port: 80,
      path: '/ISAPI/Streaming/channels/101/picture',
      method: 'GET',
      username: CONFIG.DEVICE_USER,
      password: CONFIG.DEVICE_PASS,
      timeout: 2500,
      isBinary: true
    });

    if (snapRes.status === 200 && isValidJpeg(snapRes.body)) {
      cameraFrames.set(cam.ip, { buffer: snapRes.body, timestamp: Date.now() });
      cam.online = true;
      savePlaybackArchiveFrame(cam.ip, snapRes.body);
      return;
    }

    // 2-ustuvorlik: Agar 101 bo'lmasa, 102-kanalni tekshirib ko'ramiz
    snapRes = await digestRequest({
      host: cam.ip,
      port: 80,
      path: '/ISAPI/Streaming/channels/102/picture',
      method: 'GET',
      username: CONFIG.DEVICE_USER,
      password: CONFIG.DEVICE_PASS,
      timeout: 2000,
      isBinary: true
    });

    if (snapRes.status === 200 && isValidJpeg(snapRes.body)) {
      cameraFrames.set(cam.ip, { buffer: snapRes.body, timestamp: Date.now() });
      cam.online = true;
      savePlaybackArchiveFrame(cam.ip, snapRes.body);
      return;
    }
  } catch (err) {
    // Mikro-kechikish bo'lsa xotiradagi oldingi kadr o'chmaydi
  }
}

// Har bir kamera uchun alohida, mustaqil va uzluksiz video oqim aylanishi (~2.5 FPS)
function startCameraWorker(cam) {
  let isRunning = false;
  const workerLoop = async () => {
    if (isRunning) return;
    isRunning = true;
    while (true) {
      try {
        await updateCameraFrame(cam);
      } catch (e) {}
      // Kadrlar oralig'ida 400ms pauza (kameralar protsessori va tarmoq yengil ishlashi uchun)
      await new Promise(r => setTimeout(r, 400));
    }
  };
  setTimeout(workerLoop, (CAMERAS.indexOf(cam) % 6) * 150 + 100);
}

// Barcha 6 ta kamerani parallel ravishda uzluksiz video oqim rejimida ishga tushirish
CAMERAS.forEach(cam => startCameraWorker(cam));

// 6 ta qurilmani tekshirish va voqealarni olish
async function pollAllCameras() {
  if (isPolling) return;
  isPolling = true;

  const d = new Date();
  const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  for (const cam of CAMERAS) {
    try {
      // 1. Bugungi kungi jami o'tishlar sonini aniqlash (Probe count)
      const probeBody = JSON.stringify({
        AcsEventCond: {
          searchID: `p_${cam.id}`,
          searchResultPosition: 0,
          maxResults: 1,
          major: 5,
          minor: 75,
          startTime: `${todayStr}T00:00:00`,
          endTime: `${todayStr}T23:59:59`
        }
      });

      const res = await digestRequest({
        host: cam.ip,
        port: 80,
        path: '/ISAPI/AccessControl/AcsEvent?format=json',
        method: 'POST',
        body: probeBody,
        username: CONFIG.DEVICE_USER,
        password: CONFIG.DEVICE_PASS,
        timeout: 3000
      });

      if (res.status === 200) {
        cam.online = true;
        deviceStatus.online = true;
        deviceStatus.lastSync = new Date().toISOString();

        const data = JSON.parse(res.body);
        const total = data.AcsEvent?.totalMatches || 0;
        const lastTotal = lastKnownTotals.get(cam.ip) || 0;

        if (total > 0) {
          if (lastTotal === 0) {
            // Tizim yoqilganda: Bugungi BARCHA o'tishlarni 0-dan boshlab to'liq yuklab olish
            lastKnownTotals.set(cam.ip, total);
            const BATCH_SIZE = 50;
            for (let pos = 0; pos < total; pos += BATCH_SIZE) {
              const countToFetch = Math.min(BATCH_SIZE, total - pos);
              const fetchBody = JSON.stringify({
                AcsEventCond: {
                  searchID: `f_${cam.id}_init_${pos}`,
                  searchResultPosition: pos,
                  maxResults: countToFetch,
                  major: 5,
                  minor: 75,
                  startTime: `${todayStr}T00:00:00`,
                  endTime: `${todayStr}T23:59:59`
                }
              });

              try {
                const fetchRes = await digestRequest({
                  host: cam.ip,
                  port: 80,
                  path: '/ISAPI/AccessControl/AcsEvent?format=json',
                  method: 'POST',
                  body: fetchBody,
                  username: CONFIG.DEVICE_USER,
                  password: CONFIG.DEVICE_PASS,
                  timeout: 3000
                });

                if (fetchRes.status === 200) {
                  const fetchData = JSON.parse(fetchRes.body);
                  const infoList = fetchData.AcsEvent?.InfoList || [];
                  infoList.forEach(ev => addScanEvent(ev, cam, false));
                }
              } catch (err) {}
            }
          } else if (total > lastTotal) {
            // Yangi o'tishlar sodir bo'ldi: barchasini to'liq yuklab olish
            const startPos = lastTotal;
            lastKnownTotals.set(cam.ip, total);
            const BATCH_SIZE = 50;

            for (let pos = startPos; pos < total; pos += BATCH_SIZE) {
              const countToFetch = Math.min(BATCH_SIZE, total - pos);
              const fetchBody = JSON.stringify({
                AcsEventCond: {
                  searchID: `f_${cam.id}_new_${pos}`,
                  searchResultPosition: pos,
                  maxResults: countToFetch,
                  major: 5,
                  minor: 75,
                  startTime: `${todayStr}T00:00:00`,
                  endTime: `${todayStr}T23:59:59`
                }
              });

              try {
                const fetchRes = await digestRequest({
                  host: cam.ip,
                  port: 80,
                  path: '/ISAPI/AccessControl/AcsEvent?format=json',
                  method: 'POST',
                  body: fetchBody,
                  username: CONFIG.DEVICE_USER,
                  password: CONFIG.DEVICE_PASS,
                  timeout: 3000
                });

                if (fetchRes.status === 200) {
                  const fetchData = JSON.parse(fetchRes.body);
                  const infoList = fetchData.AcsEvent?.InfoList || [];
                  infoList.forEach(ev => addScanEvent(ev, cam, true));
                }
              } catch (err) {}
            }
          }
        }
      }
    } catch (err) {
      // Tarmoqda vaqtincha uzilish bo'lsa
    }

    // Qurilmalar oralig'ida mikro-pauza (tarmoqni yuklamaslik uchun)
    await new Promise(r => setTimeout(r, 60));
  }

  isPolling = false;
}

function addScanEvent(rawEvent, camera, isNew = true) {
  if (!rawEvent) return;

  const empNo = (rawEvent.employeeNoString || rawEvent.cardNo || '').trim();
  const cleanEmpNo = empNo ? empNo.replace(/^0+/, '') : '';
  const cachedUser = usersMap.get(empNo) || usersMap.get(cleanEmpNo) || usersMap.get(empNo.padStart(8, '0'));

  let name = rawEvent.name ? rawEvent.name.replace(/''/g, "'").trim() : '';
  if (!name && cachedUser) {
    name = cachedUser.name;
  }
  if (!name && empNo) {
    name = `Foydalanuvchi #${empNo}`;
  }
  if (!name) return;

  let timeFormatted = '';
  let eventIsoTime = '';
  if (rawEvent.time) {
    const m = String(rawEvent.time).match(/(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2})/);
    if (m) {
      const datePart = m[1];
      const timePart = m[2];
      timeFormatted = timePart; // Kameraning asl o'z vaqti (masalan, 09:04:38)
      eventIsoTime = `${datePart}T${timePart}+05:00`;
    } else {
      const d = new Date(rawEvent.time);
      timeFormatted = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      eventIsoTime = d.toISOString();
    }
  } else {
    const now = new Date();
    timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    eventIsoTime = now.toISOString();
  }

  const scan = {
    id: `scan-${rawEvent.serialNo || Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    serialNo: rawEvent.serialNo,
    employeeNo: empNo,
    name: name,
    userType: rawEvent.userType || (cachedUser ? (cachedUser.role === 'teacher' ? 'teacher' : 'student') : 'normal'),
    timestamp: eventIsoTime,
    timeFormatted: timeFormatted,
    cameraId: camera.id,
    cameraName: camera.name,
    cameraIp: camera.ip,
    direction: camera.type, // 'in' yoki 'out'
    pictureURL: rawEvent.pictureURL || null,
    isNew: isNew
  };

  camera.lastEvent = scan;

  const exists = recentScans.some(s => s.serialNo === scan.serialNo && s.cameraIp === scan.cameraIp);
  if (!exists) {
    recentScans.unshift(scan);
    if (recentScans.length > 5000) recentScans.pop();

    if (isNew) {
      console.log(`[SCAN ${camera.type.toUpperCase()}] [${camera.name}] ${scan.timeFormatted} -> ${scan.name} (${scan.employeeNo})`);
      broadcastSSE('scan', scan);
      logScanToSupabase(scan);

      // Skanerlash kadrini arxivga ham aniq vaqti bilan saqlaymiz
      const curSnap = cameraFrames.get(camera.ip);
      if (curSnap && isValidJpeg(curSnap.buffer)) {
        savePlaybackArchiveFrame(camera.ip, curSnap.buffer, scan.timeFormatted);
      }
    }
  }
}

function broadcastSSE(type, data) {
  const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    try { client.write(payload); } catch (e) {}
  });
}

// Barcha kameralar soatini va timezone (GMT+5) ni lokal kompyuter vaqtiga sinxronlash
async function syncAllCamerasTime() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const localIso = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+05:00`;

  const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<Time version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
<timeMode>manual</timeMode>
<localTime>${localIso}</localTime>
<timeZone>CST-5:00:00</timeZone>
</Time>`;

  for (const cam of CAMERAS) {
    try {
      await digestRequest({
        host: cam.ip,
        port: 80,
        path: '/ISAPI/System/time',
        method: 'PUT',
        body: xmlBody,
        username: CONFIG.DEVICE_USER,
        password: CONFIG.DEVICE_PASS,
        timeout: 2500,
        contentType: 'application/xml'
      });
    } catch (e) {}
    await new Promise(r => setTimeout(r, 600));
  }
}

// Boshlang'ich tekshiruv va davriy sinxronizatsiya
setTimeout(pollAllCameras, 1000);
setInterval(pollAllCameras, CONFIG.POLL_INTERVAL_MS);
setTimeout(syncAllCamerasTime, 4000);
setInterval(syncAllCamerasTime, 30 * 60 * 1000);

// HTTP Server
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // 1. Holat (Status)
  if (pathname === '/api/device/status') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      success: true,
      data: deviceStatus,
      cameras: CAMERAS,
      recentScansCount: recentScans.length,
      globalStreamUrl: currentTunnelUrl
    }));
    return;
  }

  // 2. 6 ta Kameralar ro'yxati
  if (pathname === '/api/device/cameras') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      success: true,
      cameras: CAMERAS
    }));
    return;
  }

  // 3. Kameralarni sozlash (Kirish / Chiqish biriktirish va doimiy saqlash)
  if (pathname === '/api/device/cameras/configure' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const update = JSON.parse(body);
        if (Array.isArray(update)) {
          CAMERAS = update;
        } else if (update.id && update.type) {
          const cam = CAMERAS.find(c => c.id === update.id || c.ip === update.ip);
          if (cam) cam.type = update.type;
        }

        // 1. Mahalliy Server bazasiga (school_db.json) doimiy saqlash
        schoolDB.cameras = CAMERAS.map(c => ({ id: c.id, ip: c.ip, type: c.type, name: c.name, location: c.location }));
        saveSchoolDB(schoolDB);

        // 2. Supabase bulutiga zaxiralash
        syncCamerasToSupabase(CAMERAS);

        // 3. Tarmoqdagi barcha kompyuterlarga tarqatish
        broadcastSSE('cameras_updated', CAMERAS);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Kamera yo\'nalishlari saqlandi', cameras: CAMERAS }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 4. Jonli kamera surati (RAM keshdan 0ms tezlikda Snapshot: /api/camera/snapshot/:ip)
  if (pathname.startsWith('/api/camera/snapshot/')) {
    const targetIp = pathname.replace('/api/camera/snapshot/', '').trim();
    const cached = cameraFrames.get(targetIp);

    if (cached && isValidJpeg(cached.buffer)) {
      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': cached.buffer.length,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Connection': 'keep-alive'
      });
      res.end(cached.buffer);
      return;
    }

    // Agar RAM keshda hali bo'lmasa, kameradan to'g'ridan-to'g'ri olib beramiz
    try {
      const cam = CAMERAS.find(c => c.ip === targetIp);
      if (cam) {
        await updateCameraFrame(cam);
        const freshlyCached = cameraFrames.get(targetIp);
        if (freshlyCached && isValidJpeg(freshlyCached.buffer)) {
          res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': freshlyCached.buffer.length,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Connection': 'keep-alive'
          });
          res.end(freshlyCached.buffer);
          return;
        }
      }
    } catch (err) {}

    // Agar kamera hali ulanmagan bo'lsa, brauzerda singan rasm chiqmasligi uchun valid qora JPEG qaytaramiz
    const emptyJpg = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
      0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
      0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
      0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20,
      0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27,
      0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
      0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
      0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
      0x00, 0xbf, 0x80, 0xff, 0xd9
    ]);
    res.writeHead(200, {
      'Content-Type': 'image/jpeg',
      'Content-Length': emptyJpg.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive'
    });
    res.end(emptyJpg);
    return;
  }

  // 4.1 Haqiqiy silliq jonli video oqimi (RAM kesh asosida MJPEG: /api/camera/stream/:ip)
  if (pathname.startsWith('/api/camera/stream/')) {
    const targetIp = pathname.replace('/api/camera/stream/', '').trim();

    res.writeHead(200, {
      'Content-Type': 'multipart/x-mixed-replace; boundary=--frame',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'close',
      'Pragma': 'no-cache'
    });

    let isClosed = false;
    req.on('close', () => { isClosed = true; });

    let lastSent = 0;
    const streamLoop = async () => {
      while (!isClosed) {
        const cached = cameraFrames.get(targetIp);
        if (cached && cached.timestamp > lastSent) {
          lastSent = cached.timestamp;
          try {
            res.write(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${cached.buffer.length}\r\n\r\n`);
            res.write(cached.buffer);
            res.write('\r\n');
          } catch (e) {
            break;
          }
        }
        await new Promise(r => setTimeout(r, 180));
      }
    };

    streamLoop();
    return;
  }

  // 4.2 Playback: Mavjud sanalar ro'yxati (/api/camera/playback/dates)
  if (pathname === '/api/camera/playback/dates') {
    const dates = getCameraPlaybackDates();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: true, dates }));
    return;
  }

  // 4.3 Playback: Vaqt chizig'i va voqealar (/api/camera/playback/timeline?ip=...&date=...)
  if (pathname === '/api/camera/playback/timeline') {
    const ip = parsedUrl.searchParams.get('ip') || CAMERAS[0]?.ip;
    const date = parsedUrl.searchParams.get('date') || new Date().toISOString().split('T')[0];
    const timelineData = getCameraPlaybackTimeline(ip, date);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(timelineData));
    return;
  }

  // 4.4 Playback: Aniq vaqtdagi arxiv kadr surati (/api/camera/playback/frame?ip=...&date=...&time=...)
  if (pathname === '/api/camera/playback/frame') {
    const ip = parsedUrl.searchParams.get('ip') || CAMERAS[0]?.ip;
    const date = parsedUrl.searchParams.get('date') || new Date().toISOString().split('T')[0];
    const time = parsedUrl.searchParams.get('time') || '08:00:00';

    const frameData = getCameraPlaybackFrame(ip, date, time);
    if (frameData && frameData.buffer) {
      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': frameData.buffer.length,
        'Cache-Control': 'public, max-age=60',
        'X-Actual-Time': frameData.actualTime,
        'X-Target-Time': time,
        'X-Is-Archive': frameData.found ? '1' : '0'
      });
      res.end(frameData.buffer);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Kadr topilmadi' }));
    return;
  }

  // 4.5 Playback: Uzluksiz arxiv video oqimi (/api/camera/playback/stream?ip=...&date=...&start=...&speed=...)
  if (pathname === '/api/camera/playback/stream') {
    const ip = parsedUrl.searchParams.get('ip') || CAMERAS[0]?.ip;
    const date = parsedUrl.searchParams.get('date') || new Date().toISOString().split('T')[0];
    const start = parsedUrl.searchParams.get('start') || '08:00:00';
    const speed = Math.max(0.5, Math.min(8, parseFloat(parsedUrl.searchParams.get('speed') || '1')));

    res.writeHead(200, {
      'Content-Type': 'multipart/x-mixed-replace; boundary=--frame',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'close',
      'Pragma': 'no-cache'
    });

    let isClosed = false;
    req.on('close', () => { isClosed = true; });

    const [sh, sm, ss] = start.split(':').map(Number);
    let currentSec = (sh || 0) * 3600 + (sm || 0) * 60 + (ss || 0);

    const streamLoop = async () => {
      while (!isClosed) {
        const curH = String(Math.floor(currentSec / 3600)).padStart(2, '0');
        const curM = String(Math.floor((currentSec % 3600) / 60)).padStart(2, '0');
        const curS = String(currentSec % 60).padStart(2, '0');
        const timeStr = `${curH}:${curM}:${curS}`;

        const frameData = getCameraPlaybackFrame(ip, date, timeStr);
        if (frameData && frameData.buffer) {
          try {
            res.write(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${frameData.buffer.length}\r\nX-Playback-Time: ${timeStr}\r\n\r\n`);
            res.write(frameData.buffer);
            res.write('\r\n');
          } catch (e) {
            break;
          }
        }

        currentSec += 1;
        if (currentSec > 86399) currentSec = 0;
        const delay = Math.max(50, Math.round(1000 / speed));
        await new Promise(r => setTimeout(r, delay));
      }
    };

    streamLoop();
    return;
  }

  // 5. O'quvchining haqiqiy yuz surati (/api/device/photo/:employeeNo, /photos/:name, /api/photo/:name)
  if (pathname.startsWith('/api/device/photo/') || pathname.startsWith('/api/photo/') || pathname.startsWith('/photos/')) {
    const rawEmp = pathname
      .replace('/api/device/photo/', '')
      .replace('/api/photo/', '')
      .replace('/photos/', '')
      .replace(/\.jpg$/i, '')
      .trim();
    const cleanNo = rawEmp.replace(/^s-/, '').replace(/^0+/, '');
    const paddedNo = cleanNo ? cleanNo.padStart(8, '0') : rawEmp;

    // Turli formatdagi fayl nomlarini tekshirish
    const candidates = [
      rawEmp,
      rawEmp.replace(/^s-/, ''),
      paddedNo,
      cleanNo,
      cleanNo ? cleanNo.padStart(6, '0') : null
    ].filter(Boolean);

    let foundFile = null;
    for (const c of candidates) {
      const p = path.join(PHOTO_CACHE_DIR, `${c}.jpg`);
      if (fs.existsSync(p)) {
        foundFile = p;
        break;
      }
    }

    // 1-bosqich: Disk keshidan berish (Tezkor va xatosiz)
    if (foundFile) {
      try {
        const fileData = fs.readFileSync(foundFile);
        res.writeHead(200, {
          'Content-Type': 'image/jpeg',
          'Content-Length': fileData.length,
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(fileData);
        return;
      } catch (err) {}
    }

    // 2-bosqich: Hikvision terminalidan yuklab olish
    const user = usersMap.get(rawEmp) || 
                 usersMap.get(paddedNo) || 
                 usersMap.get(cleanNo) || 
                 usersMap.get(rawEmp.replace(/^s-/, ''));
    if (user && user.faceURL) {
      try {
        const u = new URL(user.faceURL);
        const photoPath = u.pathname + u.search;
        const hostIp = (CAMERAS.find(c => c.online)?.ip) || '192.168.1.35';
        const photoRes = await digestRequest({
          host: hostIp,
          port: 80,
          path: photoPath,
          method: 'GET',
          username: CONFIG.DEVICE_USER,
          password: CONFIG.DEVICE_PASS,
          timeout: 4000,
          isBinary: true
        });

        if (photoRes.status === 200 && Buffer.isBuffer(photoRes.body) && photoRes.body.length > 500) {
          // Diskka keshlaymiz
          const saveTarget = path.join(PHOTO_CACHE_DIR, `${paddedNo || rawEmp}.jpg`);
          try { fs.writeFileSync(saveTarget, photoRes.body); } catch (e) {}

          res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': photoRes.body.length,
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(photoRes.body);
          return;
        }
      } catch (err) {}
    }

    // Topilmasa 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Rasm topilmadi' }));
    return;
  }

  // 6. So'nggi skanerlashlar
  if (pathname === '/api/device/events') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      success: true,
      data: recentScans
    }));
    return;
  }

  // 7. SSE Jonli oqim
  if (pathname === '/api/device/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', device: deviceStatus, cameras: CAMERAS, globalStreamUrl: currentTunnelUrl })}\n\n`);
    if (currentTunnelUrl) {
      res.write(`event: global_stream_url\ndata: ${JSON.stringify({ url: currentTunnelUrl })}\n\n`);
    }

    sseClients.push(res);
    req.on('close', () => {
      sseClients = sseClients.filter(c => c !== res);
    });
    return;
  }

  // 8. Barcha 737 ta foydalanuvchilar
  if (pathname === '/api/device/all-users') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      success: true,
      total: cachedUsers.length,
      users: cachedUsers
    }));
    return;
  }

  // 9. Paginatsiya bilan foydalanuvchilar
  if (pathname === '/api/device/users') {
    const page = parseInt(parsedUrl.searchParams.get('page') || '0', 10);
    const limit = parseInt(parsedUrl.searchParams.get('limit') || '50', 10);
    const search = (parsedUrl.searchParams.get('search') || '').toLowerCase().trim();

    let list = cachedUsers;
    if (search) {
      list = list.filter(u => 
        (u.name && u.name.toLowerCase().includes(search)) ||
        (u.employeeNo && u.employeeNo.includes(search))
      );
    }

    const start = page * limit;
    const paginated = list.slice(start, start + limit);

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      success: true,
      total: list.length,
      users: paginated
    }));
    return;
  }

  // 10. Maktab Ma'lumotlarini olish (Server DB)
  if (pathname === '/api/school/data' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      success: true,
      data: schoolDB
    }));
    return;
  }

  // 11. Maktab Ma'lumotlarini Serverga Saqlash (Barcha kompyuterlar uchun yagona)
  if (pathname === '/api/school/save' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (payload.key && payload.data) {
          schoolDB[payload.key] = payload.data;
          syncModuleToSupabase(payload.key, payload.data);
        } else {
          Object.assign(schoolDB, payload);
          Object.keys(payload).forEach(k => syncModuleToSupabase(k, payload[k]));
        }
        saveSchoolDB(schoolDB);
        broadcastSSE('school_data_sync', schoolDB);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, message: 'Server bazasiga saqlandi', lastUpdated: schoolDB.lastUpdated }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 12. Bitta o'quvchini serverda to'g'ridan-to'g'ri yangilash (Sinfi, ismi, tel)
  if (pathname === '/api/school/update-student' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { studentId, updatedData } = JSON.parse(body);
        if (schoolDB.students && Array.isArray(schoolDB.students)) {
          schoolDB.students = schoolDB.students.map(s => 
            (s.id === studentId || s.studentId === studentId) ? { ...s, ...updatedData } : s
          );
          saveSchoolDB(schoolDB);
          syncModuleToSupabase('students', schoolDB.students);
          broadcastSSE('student_updated', { studentId, updatedData });
          broadcastSSE('school_data_sync', schoolDB);
        }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, message: 'O\'quvchi yangilandi' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 13. Face-ID O'quvchilarini XAVFSIZ SINXRONLASH (Smart Merge - Sinflar yoki o'zgarishlar o'chmaydi!)
  if (pathname === '/api/school/sync-face-students' && req.method === 'POST') {
    let baseList = schoolDB.students || [];
    const existingMap = new Map();
    baseList.forEach(s => {
      const key = String(s.studentId || s.employeeNo || s.id || '').replace(/^s-/, '').replace(/^0+/, '');
      if (key) existingMap.set(key, s);
    });

    let mergedCount = 0;
    let addedCount = 0;

    cachedUsers.forEach(cu => {
      const empKey = String(cu.employeeNo || '').replace(/^0+/, '');
      // Agar bu shaxs o'qituvchilar bazasida mavjud bo'lsa, o'quvchilarga qo'shilmaydi!
      const isTeacher = (schoolDB.teachers || []).some(t => {
        const tKey = String(t.faceId || t.id || '').replace(/^t-/, '').replace(/^0+/, '');
        return (tKey && tKey === empKey) || (t.name && cu.name && t.name.trim().toLowerCase() === cu.name.trim().toLowerCase());
      });
      if (isTeacher) return;

      const existing = existingMap.get(empKey);
      if (existing) {
        // FOYDALANUVCHINING QILGAN O'ZGARISHLARI VA SINFLARI TO'LIQ SAQLANADI!
        existing.isFaceEnrolled = cu.numOfFace > 0;
        if (!existing.fullName && cu.name) existing.fullName = cu.name;
        mergedCount++;
      } else {
        // Yangi qo'shilgan o'quvchi
        const newStudent = {
          id: `s-${cu.employeeNo}`,
          studentId: cu.employeeNo,
          fullName: cu.name,
          name: cu.name,
          gender: cu.gender === 'female' ? 'Qiz' : 'O\'g\'il',
          classId: 'c-1a',
          phone: '',
          address: '',
          parentName: '',
          parentPhone: '',
          faceId: cu.employeeNo,
          isFaceEnrolled: cu.numOfFace > 0
        };
        baseList.push(newStudent);
        existingMap.set(empKey, newStudent);
        addedCount++;
      }
    });

    schoolDB.students = baseList;
    saveSchoolDB(schoolDB);

    // Barcha kompyuterlarga yangilangan bazani tarqatish
    broadcastSSE('school_data_sync', schoolDB);

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      success: true,
      message: 'Face-ID o\'quvchilari sinxronlandi. Barcha sinflar va o\'zgarishlar saqlab qolindi!',
      total: baseList.length,
      mergedCount,
      addedCount,
      data: baseList
    }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint topilmadi' }));
});

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// Barcha interfeyslarda (0.0.0.0) tinglaymiz
server.listen(CONFIG.BRIDGE_PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 HIKVISION 6-KAMERA TURNIKET & FACE-ID SERVERI ISHGA TUSHDI!`);
  console.log(`📡 Kameralar (6 ta):`);
  CAMERAS.forEach(c => console.log(`   - [${c.type.toUpperCase()}] ${c.name}: http://${c.ip}:80`));
  console.log(`👥 Jami keshdagi foydalanuvchilar: ${cachedUsers.length} nafar`);
  console.log(`📸 Suratlar keshi: ${PHOTO_CACHE_DIR}`);
  console.log(`🌐 API manzili: http://0.0.0.0:${CONFIG.BRIDGE_PORT}`);
  console.log(`=======================================================`);

  // Bepul global Cloudflare tunnelni avtomatik yoqish
  setTimeout(startCloudflareTunnel, 1500);
});
