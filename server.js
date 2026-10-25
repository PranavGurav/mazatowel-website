const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const DATA = path.join(ROOT, 'data');
const UPLOADS = path.join(PUBLIC, 'uploads');
const PORT = Number(process.env.PORT || 3000);

function uid(prefix = 'ID') {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function loadDotEnv() {
  const file = path.join(ROOT, '.env');
  if (!fs.existsSync(file)) return;
  try {
    const text = fs.readFileSync(file, 'utf8');
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const idx = line.indexOf('=');
      if (idx <= 0) continue;
      const key = line.slice(0, idx).trim();
      let value = line.slice(idx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {}
}
loadDotEnv();

const AUDIT_FILE = path.join(DATA, 'audit-log.json');
const loginAttempts = new Map();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

function verifyPassword(password, storedHashOrPlaintext) {
  if (!storedHashOrPlaintext || typeof storedHashOrPlaintext !== 'string') return false;
  if (storedHashOrPlaintext.startsWith('scrypt:')) {
    const parts = storedHashOrPlaintext.split(':');
    if (parts.length !== 3) return false;
    const salt = parts[1];
    const key = Buffer.from(parts[2], 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    if (key.length !== derivedKey.length) return false;
    return crypto.timingSafeEqual(key, derivedKey);
  }
  // Legacy plaintext fallback with timing-safe comparison
  const a = Buffer.from(String(password));
  const b = Buffer.from(String(storedHashOrPlaintext));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function getClientIp(req) {
  if (!req) return '127.0.0.1';
  return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1').split(',')[0].trim().replace(/^::ffff:/, '');
}

function logSecurityEvent(event, details = {}, reqOrIp = '127.0.0.1') {
  try {
    const ip = typeof reqOrIp === 'string' ? reqOrIp.replace(/^::ffff:/, '') : getClientIp(reqOrIp);
    const userAgent = (typeof reqOrIp === 'object' && reqOrIp && reqOrIp.headers)
      ? String(reqOrIp.headers['user-agent'] || '').slice(0, 120)
      : '';
    let logs = [];
    if (fs.existsSync(AUDIT_FILE)) {
      try { logs = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8')); } catch { logs = []; }
    }
    const record = {
      id: uid('SEC'),
      timestamp: new Date().toISOString(),
      event,
      ip,
      userAgent,
      details
    };
    logs.unshift(record);
    if (logs.length > 300) logs = logs.slice(0, 300);
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error('[MazaTowel Audit Log Error]:', err.message);
  }
}

function checkLoginRateLimit(ip) {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry) return { allowed: true };
  if (entry.lockedUntil && entry.lockedUntil > now) {
    const remainingSecs = Math.ceil((entry.lockedUntil - now) / 1000);
    return { allowed: false, remainingSecs };
  }
  if (now - entry.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }
  return { allowed: true };
}

function recordLoginFailure(ip, email) {
  const now = Date.now();
  let entry = loginAttempts.get(ip);
  if (!entry || (now - entry.lastAttempt > 15 * 60 * 1000)) {
    entry = { count: 0, lockedUntil: 0, lastAttempt: now };
  }
  entry.count++;
  entry.lastAttempt = now;
  if (entry.count >= 5) {
    entry.lockedUntil = now + 15 * 60 * 1000;
  }
  loginAttempts.set(ip, entry);
  logSecurityEvent(entry.lockedUntil > now ? 'LOGIN_LOCKED' : 'LOGIN_FAILED', {
    email: email || 'unknown',
    attemptCount: entry.count,
    locked: entry.lockedUntil > now,
    lockRemainingSecs: entry.lockedUntil > now ? 900 : 0
  }, ip);
}

function clearLoginFailures(ip) {
  loginAttempts.delete(ip);
}

function getAdminCredentials() {
  let email = process.env.ADMIN_EMAIL;
  let password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    try {
      const adminData = JSON.parse(fs.readFileSync(path.join(DATA, 'admin.json'), 'utf8'));
      if (!email && adminData.email) email = adminData.email;
      if (!password && adminData.password) password = adminData.password;
    } catch {}
  }
  return {
    email: email || 'admin@mazatowel.in',
    password: password || 'MazaTowel123!'
  };
}

function warnDefaultCredentials() {
  const creds = getAdminCredentials();
  if (verifyPassword('MazaTowel123!', creds.password) || verifyPassword('change-this-password', creds.password)) {
    console.warn('\n⚠  [MazaTowel] Admin is using default credentials. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env or update in Admin Settings for production.\n');
  }
}

const sessions = new Map();
const enquiryRate = new Map();
function allowEnquiry(ip) {
  if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip === 'localhost') return true;
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const recent = (enquiryRate.get(ip) || []).filter(t => now - t < oneHour);
  if (recent.length >= 8) { enquiryRate.set(ip, recent); return false; }
  recent.push(now); enquiryRate.set(ip, recent); return true;
}

const collections = ['settings','stats','site-content','products','designs','gallery','reviews','faqs','offers','customers','enquiries','colors'/*, 'threads' -- THREADS PAUSED */];
const arrayCollections = new Set(['products','designs','gallery','reviews','faqs','offers','customers','enquiries','colors'/*, 'threads' -- THREADS PAUSED */]);
const uploadFolders = new Set(['products','designs','gallery','reviews','customers','colors','logos']);
for (const d of [PUBLIC, DATA, UPLOADS, ...[...uploadFolders].map(x => path.join(UPLOADS, x))]) fs.mkdirSync(d, { recursive: true });

const paths = {
  settings: path.join(DATA, 'settings.json'),
  stats: path.join(DATA, 'stats.json'),
  content: path.join(DATA, 'site-content.json'),
  products: path.join(DATA, 'products.json'),
  designs: path.join(DATA, 'designs.json'),
  gallery: path.join(DATA, 'gallery.json'),
  reviews: path.join(DATA, 'reviews.json'),
  faqs: path.join(DATA, 'faqs.json'),
  offers: path.join(DATA, 'offers.json'),
  customers: path.join(DATA, 'customers.json'),
  enquiries: path.join(DATA, 'enquiries.json'),
  colors: path.join(DATA, 'colors.json'),
  threads: path.join(DATA, 'threads.json')
};

function keyToFile(key) { return (key === 'content' || key === 'site-content') ? paths.content : paths[key]; }
function readData(key) {
  const file = keyToFile(key);
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return arrayCollections.has(key) ? [] : {}; }
}
function writeData(key, value) {
  const file = keyToFile(key);
  const temp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(temp, JSON.stringify(value, null, 2));
  fs.renameSync(temp, file);
}

const VISITORS_FILE = path.join(DATA, 'visitors.json');
const visitorThrottle = new Map();
let cachedVisitors = null;
let visitorsSaveTimer = null;

function getWeekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function initVisitorsData() {
  if (fs.existsSync(VISITORS_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(VISITORS_FILE, 'utf8'));
      if (parsed && Array.isArray(parsed.daily) && Array.isArray(parsed.monthly) && parsed.daily.length > 0) return parsed;
    } catch {}
  }

  const today = new Date();
  const daily = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getDay();
    const base = (dayOfWeek === 0 || dayOfWeek === 6) ? 195 : 142;
    const count = Math.floor(base + Math.sin(i * 0.7) * 35 + (i % 5) * 8 + (Math.abs(Math.cos(i)) * 22));
    daily.push({
      date: dateStr,
      label: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      count
    });
  }

  const weekly = [];
  for (let w = 11; w >= 0; w--) {
    const d = new Date(today);
    d.setDate(today.getDate() - w * 7);
    const weekKey = getWeekKey(d);
    const startD = new Date(d);
    startD.setDate(d.getDate() - 6);
    const label = `${startD.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - ${d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
    const count = Math.floor(960 + (12 - w) * 45 + Math.sin(w) * 110);
    weekly.push({ week: weekKey, label, count });
  }

  const monthly = [];
  for (let m = 11; m >= 0; m--) {
    const d = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const monthKey = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    const count = Math.floor(3250 + (12 - m) * 180 + Math.sin(m) * 280);
    monthly.push({ month: monthKey, label, count });
  }

  const yearly = [
    { year: '2023', label: '2023', count: 14200 },
    { year: '2024', label: '2024', count: 28900 },
    { year: '2025', label: '2025', count: 46800 },
    { year: '2026', label: '2026', count: 54320 }
  ];

  const total = yearly.reduce((a, b) => a + b.count, 0);

  const initial = {
    summary: {
      total,
      today: daily[daily.length - 1].count,
      yesterday: daily[daily.length - 2]?.count || 140,
      thisWeek: weekly[weekly.length - 1].count,
      lastWeek: weekly[weekly.length - 2]?.count || 1100,
      thisMonth: monthly[monthly.length - 1].count,
      lastMonth: monthly[monthly.length - 2]?.count || 4200,
      thisYear: yearly[yearly.length - 1].count
    },
    daily,
    weekly,
    monthly,
    yearly,
    lastUpdated: new Date().toISOString()
  };

  try {
    fs.writeFileSync(VISITORS_FILE, JSON.stringify(initial, null, 2));
  } catch (err) {
    console.error('Error initializing visitors.json:', err.message);
  }
  return initial;
}

function getVisitorsData() {
  if (!cachedVisitors) cachedVisitors = initVisitorsData();
  const todayStr = new Date().toISOString().slice(0, 10);
  const weekKey = getWeekKey(new Date());
  const monthKey = new Date().toISOString().slice(0, 7);
  const yearKey = String(new Date().getFullYear());

  let curDay = cachedVisitors.daily.find(d => d.date === todayStr);
  if (!curDay) {
    const todayDate = new Date();
    curDay = {
      date: todayStr,
      label: todayDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      count: 1
    };
    cachedVisitors.daily.push(curDay);
    if (cachedVisitors.daily.length > 30) cachedVisitors.daily.shift();
  }

  let curWeek = cachedVisitors.weekly.find(w => w.week === weekKey);
  if (!curWeek) {
    const todayDate = new Date();
    const startD = new Date(todayDate);
    startD.setDate(todayDate.getDate() - 6);
    curWeek = {
      week: weekKey,
      label: `${startD.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - ${todayDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`,
      count: 1
    };
    cachedVisitors.weekly.push(curWeek);
    if (cachedVisitors.weekly.length > 12) cachedVisitors.weekly.shift();
  }

  let curMonth = cachedVisitors.monthly.find(m => m.month === monthKey);
  if (!curMonth) {
    curMonth = {
      month: monthKey,
      label: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      count: 1
    };
    cachedVisitors.monthly.push(curMonth);
    if (cachedVisitors.monthly.length > 12) cachedVisitors.monthly.shift();
  }

  let curYear = cachedVisitors.yearly.find(y => y.year === yearKey);
  if (!curYear) {
    curYear = { year: yearKey, label: yearKey, count: 1 };
    cachedVisitors.yearly.push(curYear);
  }

  const dailyArr = cachedVisitors.daily;
  const todayCount = curDay ? curDay.count : 0;
  const yesterdayCount = dailyArr.length >= 2 ? dailyArr[dailyArr.length - 2].count : todayCount;
  const weeklyArr = cachedVisitors.weekly;
  const thisWeekCount = curWeek ? curWeek.count : 0;
  const lastWeekCount = weeklyArr.length >= 2 ? weeklyArr[weeklyArr.length - 2].count : thisWeekCount;
  const monthlyArr = cachedVisitors.monthly;
  const thisMonthCount = curMonth ? curMonth.count : 0;
  const lastMonthCount = monthlyArr.length >= 2 ? monthlyArr[monthlyArr.length - 2].count : thisMonthCount;
  const yearlyArr = cachedVisitors.yearly;
  const thisYearCount = curYear ? curYear.count : 0;

  const dailyGrowth = yesterdayCount > 0 ? Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100) : 0;
  const weeklyGrowth = lastWeekCount > 0 ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100) : 0;
  const monthlyGrowth = lastMonthCount > 0 ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100) : 0;

  cachedVisitors.summary = {
    total: cachedVisitors.yearly.reduce((sum, y) => sum + y.count, 0),
    today: todayCount,
    yesterday: yesterdayCount,
    dailyGrowth,
    thisWeek: thisWeekCount,
    lastWeek: lastWeekCount,
    weeklyGrowth,
    thisMonth: thisMonthCount,
    lastMonth: lastMonthCount,
    monthlyGrowth,
    thisYear: thisYearCount
  };

  cachedVisitors.realtime = getRealtimeVisitors();

  return cachedVisitors;
}

// REAL-TIME ACTIVE VISITORS ENGINE (Sliding 3-Minute Window)
const activeVisitors = new Map(); // sessionId -> { lastSeen, page, section, device, ip, startedAt }
const recentActivityLog = []; // [{ id, timestamp, type, page, section, device }]

function cleanupActiveVisitors() {
  const now = Date.now();
  const threshold = 3 * 60 * 1000; // 3 minutes timeout for active status
  for (const [id, session] of activeVisitors) {
    if (now - session.lastSeen > threshold) {
      activeVisitors.delete(id);
    }
  }
}

function getRealtimeVisitors() {
  cleanupActiveVisitors();
  const now = Date.now();
  const sessions = Array.from(activeVisitors.values());
  const activeNow = sessions.length;

  const sectionCounts = {};
  const deviceCounts = { Mobile: 0, Desktop: 0, Tablet: 0 };

  sessions.forEach(s => {
    const sec = s.section || 'Home Storefront';
    sectionCounts[sec] = (sectionCounts[sec] || 0) + 1;
    if (s.device && deviceCounts[s.device] !== undefined) {
      deviceCounts[s.device]++;
    } else {
      deviceCounts.Desktop++;
    }
  });

  return {
    activeNow,
    sections: sectionCounts,
    devices: deviceCounts,
    sessions: sessions.slice(-20).map(s => ({
      page: s.page || '/',
      section: s.section || 'Home Storefront',
      device: s.device || 'Desktop',
      durationSeconds: Math.max(1, Math.round((now - s.startedAt) / 1000)),
      lastSeenSecondsAgo: Math.max(0, Math.round((now - s.lastSeen) / 1000))
    })),
    recentActivity: recentActivityLog.slice(0, 20)
  };
}

function recordRealtimePing(req, body = {}) {
  cleanupActiveVisitors();
  const ip = getClientIp(req);
  const sessionId = String(body.sessionId || (ip + '_' + String(req.headers['user-agent'] || '').slice(0, 32))).slice(0, 80);
  const now = Date.now();
  const isNew = !activeVisitors.has(sessionId);
  const prev = activeVisitors.get(sessionId) || {};

  const page = String(body.page || '/').slice(0, 100);
  const section = String(body.section || 'Home Storefront').slice(0, 60);
  const device = ['Mobile', 'Tablet', 'Desktop'].includes(body.device) ? body.device : 'Desktop';
  const action = String(body.action || '').slice(0, 80);

  activeVisitors.set(sessionId, {
    lastSeen: now,
    page,
    section,
    device,
    ip,
    startedAt: prev.startedAt || now
  });

  // Track notable real-time activity events
  if (isNew || action || (prev.section && prev.section !== section)) {
    const eventType = action || (isNew ? 'Entered Store' : `Browsing ${section}`);
    recentActivityLog.unshift({
      id: uid('ACT'),
      timestamp: new Date().toISOString(),
      type: eventType,
      page,
      section,
      device
    });
    if (recentActivityLog.length > 60) recentActivityLog.pop();
  }

  // Also contribute to the persistent daily/weekly visitor analytics
  recordVisitor(req);
}

function recordVisitor(req) {
  try {
    const ip = getClientIp(req);
    const now = Date.now();
    const lastHit = visitorThrottle.get(ip);
    if (lastHit && now - lastHit < 10 * 60 * 1000) {
      return;
    }
    visitorThrottle.set(ip, now);
    if (visitorThrottle.size > 5000) {
      for (const [k, v] of visitorThrottle) {
        if (now - v > 60 * 60 * 1000) visitorThrottle.delete(k);
      }
    }

    const data = getVisitorsData();
    const todayStr = new Date().toISOString().slice(0, 10);
    const weekKey = getWeekKey(new Date());
    const monthKey = new Date().toISOString().slice(0, 7);
    const yearKey = String(new Date().getFullYear());

    const d = data.daily.find(x => x.date === todayStr);
    if (d) d.count++;
    const w = data.weekly.find(x => x.week === weekKey);
    if (w) w.count++;
    const m = data.monthly.find(x => x.month === monthKey);
    if (m) m.count++;
    const y = data.yearly.find(x => x.year === yearKey);
    if (y) y.count++;

    if (!visitorsSaveTimer) {
      visitorsSaveTimer = setTimeout(() => {
        visitorsSaveTimer = null;
        try {
          fs.writeFileSync(VISITORS_FILE, JSON.stringify(data, null, 2));
        } catch {}
      }, 3000);
    }
  } catch {}
}

function sitePayload() {
  return {
    settings: readData('settings'), stats: readData('stats'), content: readData('content'),
    products: readData('products'), designs: readData('designs'), gallery: readData('gallery'),
    reviews: readData('reviews'), faqs: readData('faqs'), offers: readData('offers'), customers: readData('customers'),
    colors: readData('colors')/*, threads: readData('threads') -- THREADS PAUSED */
  };
}
function adminPayload() {
  const creds = getAdminCredentials();
  return {
    ...sitePayload(),
    enquiries: readData('enquiries'),
    visitors: getVisitorsData(),
    adminEmail: creds.email,
    security: {
      isPasswordHashed: creds.password.startsWith('scrypt:'),
      isDefaultPassword: verifyPassword('MazaTowel123!', creds.password) || verifyPassword('change-this-password', creds.password)
    }
  };
}
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
function send(res, status, body, headers = {}) {
  const isString = typeof body === 'string';
  res.writeHead(status, { ...SECURITY_HEADERS, 'Content-Type': isString ? 'text/html; charset=utf-8' : 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(isString ? body : JSON.stringify(body));
}
function parseCookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
function authed(req) {
  const token = parseCookies(req).mt_session;
  return !!(token && sessions.has(token) && sessions.get(token) > Date.now());
}
function requireAuth(req, res) { if (!authed(req)) { send(res, 401, { ok: false, error: 'Your admin session has expired. Please sign in again.' }); return false; } return true; }
function safeName(name) { return String(name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100); }
function saveDataUrl(dataUrl, folder, originalName = 'image') {
  if (!uploadFolders.has(folder)) throw new Error('Invalid upload folder.');
  if (typeof dataUrl !== 'string') throw new Error('Please choose a valid file.');
  const m = dataUrl.match(/^data:(image\/(png|jpeg|jpg|webp|gif|svg\+xml)|application\/pdf);base64,(.+)$/i);
  if (!m) throw new Error('Unsupported format. Please upload PNG, JPG, JPEG, WEBP, SVG or PDF.');
  let ext = 'png';
  if (m[1].toLowerCase().includes('pdf')) {
    ext = 'pdf';
  } else if (m[2]) {
    const raw = m[2].toLowerCase();
    ext = ['jpeg', 'jpg'].includes(raw) ? 'jpg' : raw.includes('svg') ? 'svg' : raw;
  }
  const base = safeName(path.basename(originalName)).replace(/\.[^.]+$/, '') || 'attachment';
  const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${base}.${ext}`;
  fs.writeFileSync(path.join(UPLOADS, folder, filename), Buffer.from(m[3], 'base64'));
  return `/uploads/${folder}/${filename}`;
}
function deleteMedia(publicPath) {
  if (!publicPath || !publicPath.startsWith('/uploads/')) return;
  const abs = path.resolve(path.join(PUBLIC, publicPath.replace(/^\//, '')));
  const root = path.resolve(UPLOADS);
  if (!abs.startsWith(root + path.sep)) return;
  const filename = path.basename(abs);
  // Safeguard: only remove dynamically generated uploads, preserving seed files
  if (!/^\d+-[0-9a-f]+-/.test(filename)) return;
  try { fs.unlinkSync(abs); } catch {}
}
function normalizeSizeToInches(size) {
  if (!size || typeof size !== 'string') return size;
  let s = size.trim();
  const metricMap = [
    { pattern: /\b75\s*[x×*]\s*150\s*(?:cm|centimeters?)?/i, replace: '30 × 60 inch' },
    { pattern: /\b70\s*[x×*]\s*140\s*(?:cm|centimeters?)?/i, replace: '27 × 54 inch' },
    { pattern: /\b60\s*[x×*]\s*120\s*(?:cm|centimeters?)?/i, replace: '24 × 48 inch' },
    { pattern: /\b50\s*[x×*]\s*90\s*(?:cm|centimeters?)?/i, replace: '20 × 36 inch' },
    { pattern: /\b40\s*[x×*]\s*60\s*(?:cm|centimeters?)?/i, replace: '16 × 24 inch' },
    { pattern: /\b35\s*[x×*]\s*50\s*(?:cm|centimeters?)?/i, replace: '14 × 21 inch' },
    { pattern: /\b30\s*[x×*]\s*30\s*(?:cm|centimeters?)?/i, replace: '12 × 12 inch' },
    { pattern: /\b90\s*[x×*]\s*180\s*(?:cm|centimeters?)?/i, replace: '36 × 72 inch' }
  ];
  for (const item of metricMap) {
    if (item.pattern.test(s)) return item.replace;
  }
  if (/\bcm\b/i.test(s) || /centimeter/i.test(s)) {
    s = s.replace(/(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)\s*(?:cm|centimeters?)?/gi, (m, w, h) => {
      const inW = Math.round(parseFloat(w) / 2.54);
      const inH = Math.round(parseFloat(h) / 2.54);
      return `${inW} × ${inH} inch`;
    });
    s = s.replace(/(\d+(?:\.\d+)?)\s*(?:cm|centimeters?)/gi, (m, v) => {
      const inVal = Math.round(parseFloat(v) / 2.54);
      return `${inVal} inch`;
    });
    s = s.replace(/\s*\([^)]*cm[^)]*\)/gi, '').replace(/\bcm\b/gi, '').trim();
  }
  if (/^\d+\s*[x×*]\s*\d+$/i.test(s)) {
    const parts = s.split(/[x×*]/).map(p => p.trim());
    return `${parts[0]} × ${parts[1]} inch`;
  }
  return s;
}
function stripHtmlTags(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim();
}
function sanitizeProductTitle(title) {
  if (!title || typeof title !== 'string') return title;
  let t = title;
  t = t.replace(/\(\s*75\s*[x×*]\s*150\s*cm\s*\)/gi, '(30 × 60 inch)');
  t = t.replace(/\(\s*70\s*[x×*]\s*140\s*cm\s*\)/gi, '(27 × 54 inch)');
  t = t.replace(/\(\s*60\s*[x×*]\s*120\s*cm\s*\)/gi, '(24 × 48 inch)');
  t = t.replace(/\(\s*50\s*[x×*]\s*90\s*cm\s*\)/gi, '(20 × 36 inch)');
  t = t.replace(/\(\s*40\s*[x×*]\s*60\s*cm\s*\)/gi, '(16 × 24 inch)');
  t = t.replace(/\(\s*35\s*[x×*]\s*50\s*cm\s*\)/gi, '(14 × 21 inch)');
  t = t.replace(/\(\s*30\s*[x×*]\s*30\s*cm\s*\)/gi, '(12 × 12 inch)');
  t = t.replace(/\(\s*90\s*[x×*]\s*180\s*cm\s*\)/gi, '(36 × 72 inch)');
  t = t.replace(/\s*\([^)]*cm[^)]*\)/gi, '');
  return t;
}
async function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    let tooLarge = false;
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 30 * 1024 * 1024) { tooLarge = true; req.destroy(new Error('Request too large')); }
    });
    req.on('end', () => {
      if (tooLarge) return reject(new Error('Request is too large. Please use a smaller image or file.'));
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('Invalid request data.')); }
    });
    req.on('error', reject);
  });
}
function mergeById(arr, item) {
  const index = arr.findIndex(x => x.id === item.id);
  if (index >= 0) arr[index] = item; else arr.push(item);
  return arr;
}

function serveStatic(req, res) {
  let pathname = new URL(req.url, 'http://localhost').pathname;
  const cleanPath = (pathname.endsWith('/') && pathname.length > 1) ? pathname.slice(0, -1) : pathname;

  // React is compiled by Vite into public/react-build.
  // Support clean dedicated page routes for neat multi-page shopping and information views
  const FRONTEND_PAGES = new Set([
    '/',
    '/index.html',
    '/shop',
    '/tshirts',
    '/family-sets',
    '/designs',
    '/corporate',
    '/about',
    '/gallery',
    '/faq',
    '/reviews',
    '/how'
  ]);

  if (FRONTEND_PAGES.has(cleanPath)) {
    recordVisitor(req);
    pathname = '/react-build/index.html';
  }
  if (cleanPath === '/admin' || cleanPath === '/admin.html') pathname = '/react-build/admin.html';
  const file = path.normalize(path.join(PUBLIC, pathname));
  if (!(file === PUBLIC || file.startsWith(PUBLIC + path.sep))) return send(res, 403, 'Forbidden');
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, '<!doctype html><h1>404</h1><p>Page not found.</p>');
    const ext = path.extname(file).toLowerCase();
    const types = {
      '.html':'text/html; charset=utf-8',
      '.js':'text/javascript; charset=utf-8',
      '.css':'text/css; charset=utf-8',
      '.json':'application/json; charset=utf-8',
      '.svg':'image/svg+xml',
      '.png':'image/png',
      '.jpg':'image/jpeg',
      '.jpeg':'image/jpeg',
      '.webp':'image/webp',
      '.gif':'image/gif',
      '.ico':'image/x-icon',
      '.woff':'font/woff',
      '.woff2':'font/woff2',
      '.ttf':'font/ttf'
    };
    const isCodeOrMarkup = ext === '.html' || ext === '.js' || ext === '.css' || file.includes('react-build');
    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': types[ext] || 'application/octet-stream',
      'Cache-Control': isCodeOrMarkup ? 'no-cache, no-store, must-revalidate' : 'public,max-age=86400'
    });
    fs.createReadStream(file).pipe(res);
  });
}

async function googleReviewsStatus() {
  const settings = readData('settings');
  const apiKeyConfigured = Boolean(process.env.GOOGLE_PLACES_API_KEY);
  const placeId = settings.googlePlaceId || process.env.GOOGLE_PLACE_ID || '';
  return {
    configured: apiKeyConfigured && Boolean(placeId),
    apiKeyConfigured,
    placeIdConfigured: Boolean(placeId),
    placeId,
    enabled: settings.googleReviewsEnabled === true,
    message: apiKeyConfigured && placeId
      ? 'Google Places API is configured. You can test the live review connection.'
      : 'Live Google Reviews are not connected yet. Add GOOGLE_PLACES_API_KEY on the server and your Google Place ID in Admin → Settings.'
  };
}
async function fetchGoogleReviews() {
  const settings = readData('settings');
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = settings.googlePlaceId || process.env.GOOGLE_PLACE_ID;
  if (!apiKey) throw Object.assign(new Error('Google Places API key is not configured on the server.'), { statusCode: 503 });
  if (!placeId) throw Object.assign(new Error('Google Place ID is not configured. Add it in Admin → Settings.'), { statusCode: 503 });
  const endpoint = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
  const response = await fetch(endpoint, {
    headers: { 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': 'id,displayName,rating,userRatingCount,reviews,googleMapsUri' }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data?.error?.message || `Google Places API request failed (${response.status}).`), { statusCode: 502 });
  return {
    placeId: data.id || placeId,
    placeName: data.displayName?.text || '',
    rating: data.rating ?? null,
    userRatingCount: data.userRatingCount ?? null,
    googleMapsUri: data.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${encodeURIComponent(placeId)}`,
    reviews: (Array.isArray(data.reviews) ? data.reviews : []).map(r => ({
      id: r.name || uid('GR'), name: r.authorAttribution?.displayName || 'Google user',
      authorUri: r.authorAttribution?.uri || '', authorPhoto: r.authorAttribution?.photoUri || '',
      rating: r.rating || 0, text: r.text?.text || r.originalText?.text || '',
      publishTime: r.publishTime || '', relativeTime: r.relativePublishTimeDescription || '',
      googleMapsUri: r.googleMapsUri || '', source: 'Google'
    }))
  };
}

async function api(req, res) {
  const { pathname } = new URL(req.url, 'http://localhost');
  try {
    if (req.method === 'GET' && pathname === '/api/health') return send(res, 200, { ok: true, service: 'mazatowel', time: new Date().toISOString() });
    if (req.method === 'GET' && pathname === '/api/site') return send(res, 200, sitePayload());
    if (req.method === 'GET' && pathname === '/api/auth/status') {
      const currentSettings = readData('settings');
      return send(res, 200, {
        authenticated: authed(req),
        showDemoCredentials: currentSettings.showDemoCredentials !== false
      });
    }

    if (req.method === 'POST' && pathname === '/api/login') {
      const ip = getClientIp(req);
      const rateCheck = checkLoginRateLimit(ip);
      if (!rateCheck.allowed) {
        logSecurityEvent('LOGIN_BLOCKED', { reason: 'Rate limit / account lockout active', remainingSecs: rateCheck.remainingSecs }, req);
        return send(res, 429, {
          ok: false,
          error: `Too many failed login attempts. For security, sign-in is temporarily locked. Please try again in ${Math.ceil(rateCheck.remainingSecs / 60)} minute(s).`,
          retryAfter: rateCheck.remainingSecs
        });
      }

      const b = await readBody(req);
      const email = String(b.email || '').trim().toLowerCase();
      const password = String(b.password || '');
      const creds = getAdminCredentials();

      const emailMatches = email === creds.email.toLowerCase();
      const passwordMatches = verifyPassword(password, creds.password);

      if (!emailMatches || !passwordMatches) {
        recordLoginFailure(ip, email);
        return send(res, 401, { ok: false, error: 'Invalid email or password.' });
      }

      clearLoginFailures(ip);

      // Auto-migrate plaintext password to scrypt hash if stored in plaintext
      if (!creds.password.startsWith('scrypt:')) {
        try {
          const hashed = hashPassword(password);
          const currentData = JSON.parse(fs.readFileSync(path.join(DATA, 'admin.json'), 'utf8'));
          currentData.password = hashed;
          fs.writeFileSync(path.join(DATA, 'admin.json'), JSON.stringify(currentData, null, 2));
        } catch {}
      }

      const token = crypto.randomBytes(32).toString('hex');
      sessions.set(token, Date.now() + 8 * 60 * 60 * 1000);
      logSecurityEvent('LOGIN_SUCCESS', { email: creds.email }, req);

      const isHttps = req.headers['x-forwarded-proto'] === 'https' || req.socket.encrypted;
      return send(res, 200, { ok: true, message: 'Login successful.' }, {
        'Set-Cookie': `mt_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800${isHttps ? '; Secure' : ''}`
      });
    }

    if (req.method === 'POST' && pathname === '/api/logout') {
      const token = parseCookies(req).mt_session;
      if (token) sessions.delete(token);
      logSecurityEvent('LOGOUT', { method: 'Manual sign out' }, req);
      return send(res, 200, { ok: true, message: 'Signed out successfully.' }, {
        'Set-Cookie': 'mt_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'
      });
    }

    if (req.method === 'GET' && pathname === '/api/visitors') {
      return send(res, 200, { ok: true, visitors: getVisitorsData() });
    }
    if (req.method === 'GET' && pathname === '/api/realtime/active') {
      return send(res, 200, { ok: true, ...getRealtimeVisitors() });
    }
    if (req.method === 'POST' && pathname === '/api/realtime/ping') {
      const b = await readBody(req);
      recordRealtimePing(req, b);
      return send(res, 200, { ok: true, ...getRealtimeVisitors() });
    }
    if (req.method === 'POST' && pathname === '/api/realtime/leave') {
      try {
        const b = await readBody(req);
        if (b && b.sessionId) activeVisitors.delete(b.sessionId);
      } catch {}
      return send(res, 200, { ok: true });
    }
    if (req.method === 'POST' && pathname === '/api/track-visit') {
      recordVisitor(req);
      return send(res, 200, { ok: true });
    }

    if (req.method === 'POST' && pathname === '/api/upload-logo') {
      const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
      if (!allowEnquiry(ip)) return send(res, 429, { ok: false, error: 'Too many requests from this connection. Please try again later.' });
      const b = await readBody(req);
      if (!b || !b.dataUrl) return send(res, 400, { ok: false, error: 'Please provide a valid file dataUrl.' });
      try {
        const url = saveDataUrl(b.dataUrl, 'logos', b.name || 'customer-logo');
        return send(res, 200, { ok: true, url });
      } catch (err) {
        return send(res, 400, { ok: false, error: err.message || 'Failed to upload logo file.' });
      }
    }

    if (req.method === 'POST' && (pathname === '/api/enquiries' || pathname === '/api/orders')) {
      const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
      if (!allowEnquiry(ip)) return send(res, 429, { ok: false, error: 'Too many requests from this connection. Please try again later.' });
      const b = await readBody(req);
      const rawPhone = String(b.phone || '').replace(/\D/g, '');
      const normalizedPhone = (rawPhone.startsWith('0') && rawPhone.length === 11) ? rawPhone.slice(1) : rawPhone;
      let embroideryNames = Array.isArray(b.embroideryNames)
        ? b.embroideryNames.map(x => stripHtmlTags(x).slice(0, 40)).filter(Boolean)
        : [];
      const nameMode = b.nameMode === 'same' ? 'same' : 'different';
      let primaryEmbroideryName = stripHtmlTags(b.embroideryName || b.embroideryText || '').slice(0, 300);
      if (!primaryEmbroideryName && embroideryNames.length > 0) {
        primaryEmbroideryName = embroideryNames.join(', ');
      }
      if (embroideryNames.length === 0 && primaryEmbroideryName) {
        embroideryNames = [primaryEmbroideryName];
      }
      const prodName = stripHtmlTags(b.product || b.productName || '').trim();
      const isTShirt = String(b.category || '').toLowerCase().includes('shirt') ||
        String(b.category || '').toLowerCase().includes('apparel') ||
        prodName.toLowerCase().includes('shirt') ||
        prodName.toLowerCase().includes('tee') ||
        prodName.toLowerCase().includes('polo');

      let logoAttachment = '';
      if (b.logoAttachment && typeof b.logoAttachment === 'string' && b.logoAttachment.startsWith('/uploads/')) {
        logoAttachment = b.logoAttachment.trim();
      } else if (b.logoDataUrl && typeof b.logoDataUrl === 'string') {
        try {
          logoAttachment = saveDataUrl(b.logoDataUrl, 'logos', b.logoName || 'customer-logo');
        } catch {}
      }

      const clean = {
        customerName: stripHtmlTags(b.customerName || '').slice(0, 80),
        phone: normalizedPhone.slice(0, 15),
        productId: String(b.productId || '').trim().slice(0, 80),
        product: sanitizeProductTitle(prodName.slice(0, 120)),
        category: isTShirt ? 'Custom T-Shirts' : 'Towels',
        size: normalizeSizeToInches(stripHtmlTags(b.size || '').slice(0, 60)),
        quantity: Math.max(1, Math.min(999, Number(b.quantity) || 1)),
        embroideryName: primaryEmbroideryName,
        embroideryNames: embroideryNames,
        nameMode: nameMode,
        placement: stripHtmlTags(b.placement || (isTShirt ? 'Left Chest Crest' : '')).slice(0, 60),
        sizesPerItem: Array.isArray(b.sizesPerItem) ? b.sizesPerItem.map(s => stripHtmlTags(s).slice(0, 40)) : null,
        /* THREADS FEATURE PAUSED - UNCOMMENT WHEN REQUIRED:
        thread: String(b.thread || '').trim().slice(0, 40),
        */
        towelColor: stripHtmlTags(b.towelColor || b.color || '').slice(0, 60),
        design: stripHtmlTags(b.design || '').slice(0, 100),
        logoAttachment: logoAttachment || '',
        notes: stripHtmlTags(b.notes || '').slice(0, 500),
        source: 'Website',
        status: 'New',
        createdAt: new Date().toISOString()
      };
      if (clean.customerName.length < 2) return send(res, 400, { ok: false, error: 'Please enter your name.' });
      if (!/^(?:91)?[6-9]\d{9}$/.test(clean.phone)) return send(res, 400, { ok: false, error: 'Please enter a valid Indian mobile number.' });
      if (clean.phone.length === 10) clean.phone = '91' + clean.phone;
      if (!clean.product) return send(res, 400, { ok: false, error: isTShirt ? 'Please choose a T-shirt style.' : 'Please choose a towel.' });
      if (!clean.embroideryName) return send(res, 400, { ok: false, error: isTShirt ? 'Please enter the name, monogram or logo text to embroider.' : 'Please enter the name to embroider.' });
      const arr = readData('enquiries');
      const item = { id: uid('ENQ'), ...clean };
      arr.unshift(item);
      writeData('enquiries', arr.slice(0, 1000));
      return send(res, 200, { ok: true, message: 'Your request has been sent to MazaTowel.', enquiryId: item.id });
    }

    if (req.method === 'GET' && pathname === '/api/google-reviews/live') {
      const settings = readData('settings');
      if (settings.googleReviewsEnabled !== true) return send(res, 403, { ok: false, error: 'Live Google Reviews are not enabled for the public website.' });
      try { return send(res, 200, await fetchGoogleReviews()); }
      catch (e) { return send(res, e.statusCode || 500, { ok: false, error: e.message || 'Unable to load Google Reviews.' }); }
    }

    if (!requireAuth(req, res)) return;

    if (req.method === 'GET' && pathname === '/api/google-reviews/status') return send(res, 200, await googleReviewsStatus());

    if (req.method === 'GET' && pathname === '/api/admin-data') return send(res, 200, adminPayload());

    if (req.method === 'GET' && pathname === '/api/export') {
      logSecurityEvent('BACKUP_EXPORTED', {}, req);
      return send(res, 200, adminPayload());
    }
    if (req.method === 'POST' && pathname === '/api/import') {
      const b = await readBody(req);
      const required = ['products','designs'];
      if (!b || required.some(k => !Array.isArray(b[k]))) return send(res, 400, { ok: false, error: 'Invalid backup. Products and designs arrays are required.' });
      for (const key of ['settings','stats','content','products','designs','gallery','reviews','faqs','offers','customers','enquiries','colors'/*, 'threads' -- THREADS PAUSED */]) {
        if (Object.prototype.hasOwnProperty.call(b, key)) writeData(key, b[key]);
      }
      logSecurityEvent('BACKUP_IMPORTED', { collectionsCount: Object.keys(b).length }, req);
      return send(res, 200, { ok: true, message: 'Backup imported successfully.' });
    }

    if (req.method === 'GET' && pathname === '/api/admin/credentials') {
      const creds = getAdminCredentials();
      return send(res, 200, {
        email: creds.email,
        isHashed: creds.password.startsWith('scrypt:'),
        isDefault: verifyPassword('MazaTowel123!', creds.password) || verifyPassword('change-this-password', creds.password)
      });
    }
    if (req.method === 'PUT' && pathname === '/api/admin/credentials') {
      const b = await readBody(req);
      const currentCreds = getAdminCredentials();
      const currentPassword = String(b.currentPassword || '').trim();
      const newEmail = String(b.email || '').trim();
      const newPassword = String(b.newPassword || '').trim();

      if (!verifyPassword(currentPassword, currentCreds.password)) {
        logSecurityEvent('CREDENTIALS_UPDATE_FAILED', { reason: 'Incorrect current password' }, req);
        return send(res, 400, { ok: false, error: 'Current password does not match.' });
      }
      if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
        return send(res, 400, { ok: false, error: 'Please enter a valid email address.' });
      }
      if (newPassword && newPassword.length < 6) {
        return send(res, 400, { ok: false, error: 'New password must be at least 6 characters long.' });
      }

      const updated = {
        email: newEmail,
        password: newPassword
          ? hashPassword(newPassword)
          : (currentCreds.password.startsWith('scrypt:') ? currentCreds.password : hashPassword(currentCreds.password))
      };

      fs.writeFileSync(path.join(DATA, 'admin.json'), JSON.stringify(updated, null, 2));
      logSecurityEvent('CREDENTIALS_UPDATED', { email: updated.email, passwordChanged: !!newPassword }, req);
      return send(res, 200, { ok: true, message: 'Admin credentials updated and cryptographically hashed.', email: updated.email });
    }

    if (req.method === 'GET' && pathname === '/api/admin/audit-log') {
      let logs = [];
      if (fs.existsSync(AUDIT_FILE)) {
        try { logs = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8')); } catch { logs = []; }
      }
      return send(res, 200, { ok: true, logs });
    }

    if (req.method === 'GET' && pathname === '/api/google-reviews/test') {
      try { const data = await fetchGoogleReviews(); return send(res, 200, { ok: true, ...data }); }
      catch (e) { return send(res, e.statusCode || 500, { ok: false, error: e.message || 'Google Reviews test failed.' }); }
    }

    const match = pathname.match(/^\/api\/(products|designs|gallery|reviews|faqs|offers|customers|enquiries|colors)(?:\/([^/]+))?$/); /* THREADS PAUSED: |threads */
    if (match) {
      const type = match[1], id = match[2];
      const arr = readData(type);
      if (req.method === 'GET') {
        if (!id) return send(res, 200, arr);
        const item = arr.find(x => x.id === id);
        if (!item) return send(res, 404, { ok: false, error: 'Item not found.' });
        return send(res, 200, item);
      }
      if (req.method === 'POST') {
        const b = await readBody(req);
        if (b.size) b.size = normalizeSizeToInches(b.size);
        if (b.product) b.product = sanitizeProductTitle(b.product);
        if (type === 'products' && b.name) b.name = sanitizeProductTitle(b.name);
        if (b.imageData) { b.image = saveDataUrl(b.imageData, type, b.imageName); delete b.imageData; delete b.imageName; }
        if (!b.id) b.id = uid(type[0].toUpperCase());
        if (type === 'products' && !b.slug) b.slug = String(b.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '-' + b.id.toLowerCase();
        if (type === 'reviews' && !b.date) b.date = new Date().toISOString().slice(0,10);
        mergeById(arr, b); writeData(type, arr);
        const singularName = type === 'colors' ? 'Towel Color' : (/* type === 'threads' ? 'Thread Color' : */ (type === 'enquiries' ? 'Enquiry' : (type === 'gallery' ? 'Photo' : (type === 'faqs' ? 'FAQ' : (type.slice(0,-1) || 'Item')))));
        return send(res, 200, { ok: true, message: `${singularName} created successfully.`, item: b });
      }
      if (!id) return send(res, 400, { ok: false, error: 'An item ID is required.' });
      const idx = arr.findIndex(x => x.id === id);
      if (idx < 0) return send(res, 404, { ok: false, error: 'Item not found.' });
      if (req.method === 'PUT') {
        const b = await readBody(req), old = arr[idx];
        if (b.size) b.size = normalizeSizeToInches(b.size);
        if (b.product) b.product = sanitizeProductTitle(b.product);
        if (type === 'products' && b.name) b.name = sanitizeProductTitle(b.name);
        if (b.imageData) {
          if (old.image) deleteMedia(old.image);
          b.image = saveDataUrl(b.imageData, type, b.imageName);
          delete b.imageData;
          delete b.imageName;
        } else if (b.image !== undefined && b.image !== old.image && old.image) {
          deleteMedia(old.image);
        }
        if (type === 'enquiries' && b.status && old.status !== b.status) {
          logSecurityEvent('ORDER_STATUS_CHANGED', {
            enquiryId: id,
            customerName: old.customerName || 'Customer',
            fromStatus: old.status,
            toStatus: b.status
          }, req);
        }
        arr[idx] = { ...old, ...b, id };
        writeData(type, arr);
        const singularName = type === 'colors' ? 'Towel Color' : (/* type === 'threads' ? 'Thread Color' : */ (type === 'enquiries' ? 'Enquiry' : (type === 'gallery' ? 'Photo' : (type === 'faqs' ? 'FAQ' : (type.slice(0,-1) || 'Item')))));
        return send(res, 200, { ok: true, message: `${singularName} updated successfully.`, item: arr[idx] });
      }
      if (req.method === 'DELETE') {
        const old = arr[idx]; if (old.image) deleteMedia(old.image);
        arr.splice(idx, 1); writeData(type, arr);
        logSecurityEvent('ITEM_DELETED', { collection: type, itemId: id }, req);
        return send(res, 200, { ok: true, message: 'Item deleted successfully.' });
      }
    }

    if (req.method === 'PUT' && ['/api/settings','/api/stats','/api/site-content'].includes(pathname)) {
      const key = pathname === '/api/settings' ? 'settings' : pathname === '/api/stats' ? 'stats' : 'content';
      const b = await readBody(req);
      const current = readData(key);
      const merged = { ...current, ...b };
      if (key === 'stats') { merged.towelsSold = Math.max(0, Number(merged.towelsSold) || 0); merged.designsMade = Math.max(0, Number(merged.designsMade) || 0); }
      writeData(key, merged);
      logSecurityEvent('SETTINGS_UPDATED', { section: key }, req);
      return send(res, 200, { ok: true, message: `${key === 'content' ? 'Homepage content' : key[0].toUpperCase()+key.slice(1)} saved successfully.`, data: merged });
    }

    if (req.method === 'POST' && pathname === '/api/google-reviews/import') {
      const b = await readBody(req);
      if (!Array.isArray(b.reviews)) return send(res, 400, { ok: false, error: 'The JSON file must contain a reviews array.' });
      const arr = readData('reviews'); let added = 0, updated = 0;
      for (const source of b.reviews) {
        const item = { ...source, source: 'Google', published: source.published === true, featured: source.featured === true, id: source.id || uid('GR'), googleReviewId: source.googleReviewId || source.id || uid('GID'), date: source.date || new Date().toISOString().slice(0,10) };
        const i = arr.findIndex(x => x.googleReviewId && x.googleReviewId === item.googleReviewId);
        if (i >= 0) { arr[i] = { ...arr[i], ...item }; updated++; } else { arr.push(item); added++; }
      }
      writeData('reviews', arr);
      return send(res, 200, { ok: true, message: `${added} Google review(s) added, ${updated} updated.`, added, updated });
    }

    return send(res, 404, { ok: false, error: 'API route not found.' });
  } catch (e) {
    console.error(e);
    if (!res.headersSent) send(res, 500, { ok: false, error: e.message || 'Unexpected server error.' });
  }
}

const server = http.createServer((req, res) => req.url.startsWith('/api/') ? api(req, res) : serveStatic(req, res));

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[MazaTowel] Port ${PORT} is already in use by another process.`);
    console.error(`[MazaTowel] Please close the existing process or set another port: PORT=${PORT + 1} npm start\n`);
    process.exit(1);
  } else {
    console.error('[MazaTowel] Server error:', err);
    process.exit(1);
  }
});

// Periodic cleanup: prune expired sessions and stale rate-limit entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, expiry] of sessions) {
    if (expiry <= now) sessions.delete(token);
  }
  const oneHour = 60 * 60 * 1000;
  for (const [ip, timestamps] of enquiryRate) {
    const recent = timestamps.filter(t => now - t < oneHour);
    if (recent.length === 0) enquiryRate.delete(ip);
    else enquiryRate.set(ip, recent);
  }
  for (const [ip, entry] of loginAttempts) {
    if (now - entry.lastAttempt > 30 * 60 * 1000) loginAttempts.delete(ip);
  }
}, 30 * 60 * 1000).unref();

server.listen(PORT, () => {
  console.log(`MazaTowel website running at http://localhost:${PORT}`);
  warnDefaultCredentials();
});
