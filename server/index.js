import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// Persistent JSON Storage File
const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default Master Owner & Platform Administrator
const DEFAULT_OWNER = {
  id: 'usr-owner-ikram',
  name: 'Ikram-ul-haq Mian',
  email: 'ik5928271@gmail.com',
  password: 'admin123',
  role: 'admin',
  isOwner: true,
  org: 'IK Enterprises',
  createdAt: new Date().toISOString()
};

// Permanent Seed Accounts (Always available across every deployment)
const SEED_USERS = [
  DEFAULT_OWNER,
  {
    id: 'usr-interp-kamila',
    name: 'Kamila',
    email: 'kamila@linguabridge.com',
    password: 'interpreter123',
    role: 'interpreter',
    primaryLang: 'Russian',
    languages: ['Russian', 'English', 'Ukrainian'],
    specialty: 'General / Customer Support',
    hourlyRate: 5,
    rating: 4.98,
    status: 'online',
    certifications: ['Certified Professional Russian Linguist', 'State Judiciary Certified'],
    bio: 'Professional Russian and Ukrainian consecutive & simultaneous interpreter with over 8 years of live interpretation experience.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-interp-wali',
    name: 'Wali',
    email: 'wali@linguabridge.com',
    password: 'interpreter123',
    role: 'interpreter',
    primaryLang: 'Arabic',
    languages: ['Arabic', 'English'],
    specialty: 'Medical / Healthcare',
    hourlyRate: 5,
    rating: 4.97,
    status: 'online',
    certifications: ['Certified Arabic Healthcare Linguist', 'Court Certified'],
    bio: 'Certified Arabic interpreter specializing in healthcare encounters, customer care, and legal proceedings.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-interp-tariq',
    name: 'Tariq Khan',
    email: 'tariq@linguabridge.com',
    password: 'interpreter123',
    role: 'interpreter',
    primaryLang: 'Urdu',
    languages: ['Urdu', 'Punjabi', 'English'],
    specialty: 'General / Customer Support',
    hourlyRate: 5,
    rating: 4.99,
    status: 'online',
    certifications: ['Certified Urdu & Punjabi Court Interpreter', 'Healthcare Certified'],
    bio: 'Native Urdu and Punjabi professional linguist providing high-accuracy remote translation services.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-interp-sofia',
    name: 'Sofia Martinez',
    email: 'sofia@linguabridge.com',
    password: 'interpreter123',
    role: 'interpreter',
    primaryLang: 'Spanish',
    languages: ['Spanish', 'English'],
    specialty: 'Medical / Healthcare',
    hourlyRate: 5,
    rating: 4.98,
    status: 'online',
    certifications: ['Certified Spanish Healthcare Interpreter (CCHI)', 'State Certified'],
    bio: 'Experienced Spanish medical and judicial interpreter bridging communication in clinics and corporate meetings.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-client-demo',
    name: 'IK Client (Prepaid 120 Mins)',
    email: 'client@linguabridge.com',
    password: 'client123',
    role: 'host',
    org: 'IK Enterprises Client Corp',
    billingType: 'prepaid',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-client-hospital',
    name: 'Mercy Hospital Client (Net 30)',
    email: 'hospital@linguabridge.com',
    password: 'client123',
    role: 'host',
    org: 'Mercy Healthcare Network',
    billingType: 'postpaid_hospital',
    createdAt: new Date().toISOString()
  }
];

const SEED_WALLETS = {
  'usr-owner-ikram': {
    userId: 'usr-owner-ikram',
    totalPaid: 1000.00,
    totalMinutesPurchased: 9999,
    minutesUsed: 0,
    minutesRemaining: 9999,
    billingType: 'unlimited_owner'
  },
  'usr-client-demo': {
    userId: 'usr-client-demo',
    totalPaid: 100.00,
    totalMinutesPurchased: 120,
    minutesUsed: 0,
    minutesRemaining: 120,
    billingType: 'prepaid'
  },
  'usr-client-hospital': {
    userId: 'usr-client-hospital',
    totalPaid: 0.00,
    totalMinutesPurchased: 0,
    minutesUsed: 0,
    minutesRemaining: 0,
    billingType: 'postpaid_hospital'
  }
};

// Initial State Structure
let store = {
  users: [...SEED_USERS],
  interpreters: SEED_USERS.filter(u => u.role === 'interpreter'),
  interpreterApplications: [
    {
      id: 'app-seed-1',
      name: 'Ahmed Farooq',
      email: 'ahmed.farooq@linguabridge-applicant.com',
      phone: '+1 (555) 234-8901',
      country: 'United States',
      primaryLang: 'Urdu',
      languages: ['Urdu', 'Punjabi', 'English', 'Hindi'],
      specialties: ['Medical / Healthcare', 'Legal / Court Certified', 'Immigration & Refugee'],
      certifications: ['Certified Healthcare Interpreter (CCHI)', 'State Court Interpreter'],
      experienceYears: 7,
      hourlyRate: 5,
      bio: 'Certified Urdu and Punjabi medical interpreter with 7+ years translating in emergency departments, trauma surgeries, and immigration court hearings.',
      cvFileName: 'Ahmed_Farooq_Certified_Linguist_CV.pdf',
      cvFileData: 'data:application/pdf;base64,JVBERi0xLjQKJ...',
      docFileName: 'CCHI_Healthcare_Certification_Farooq.pdf',
      docFileData: 'data:application/pdf;base64,JVBERi0xLjQKJ...',
      status: 'pending', // 'pending', 'approved', 'rejected'
      adminNotes: '',
      submittedAt: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ],
  appointments: [],
  callLogs: [],
  wallets: { ...SEED_WALLETS },
  visitorLogs: []
};

import { MongoClient } from 'mongodb';

let db = null;
const MONGODB_URI = process.env.MONGODB_URI;

// Load existing store if available
function loadStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf8');
      store = JSON.parse(data);

      if (!Array.isArray(store.interpreterApplications)) {
        store.interpreterApplications = [];
      }

      if (!Array.isArray(store.visitorLogs)) {
        store.visitorLogs = [];
      }

      // Ensure Owner Account always exists with latest credentials
      const ownerIndex = store.users.findIndex(u => u.email.toLowerCase() === DEFAULT_OWNER.email.toLowerCase() || u.isOwner);
      if (ownerIndex >= 0) {
        store.users[ownerIndex] = { ...store.users[ownerIndex], ...DEFAULT_OWNER };
      } else {
        store.users.unshift(DEFAULT_OWNER);
      }

      // Ensure Seed Users exist
      SEED_USERS.forEach(seedUser => {
        const existingIdx = store.users.findIndex(u => u.id === seedUser.id || u.email.toLowerCase() === seedUser.email.toLowerCase());
        if (existingIdx >= 0) {
          store.users[existingIdx] = { ...seedUser, ...store.users[existingIdx] };
        } else {
          store.users.push(seedUser);
        }
      });

      // Ensure Seed Wallets exist
      Object.keys(SEED_WALLETS).forEach(uId => {
        if (!store.wallets[uId]) {
          store.wallets[uId] = { ...SEED_WALLETS[uId] };
        }
      });

      // Ensure Interpreters collection is synchronized
      store.interpreters = store.users.filter(u => u.role === 'interpreter');

      console.log(`[Database Loaded] Users: ${store.users.length}, Interpreters: ${store.interpreters.length}, Applications: ${store.interpreterApplications.length}, Appointments: ${store.appointments.length}`);
    } else {
      saveStore();
    }
  } catch (err) {
    console.error('Error loading store.json:', err);
  }
}

async function initMongo() {
  if (!MONGODB_URI) {
    console.log('[Database] Running in Local Persistent Mode (store.json). To activate 24/7 Cloud DB, add MONGODB_URI in Render environment.');
    return;
  }
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('linguabridge');
    console.log('✅ [MongoDB Atlas Connected Successfully] Permanent 24/7 Cloud Database Active!');

    // Sync Users from MongoDB
    const mongoUsers = await db.collection('users').find({}).toArray();
    if (mongoUsers.length > 0) {
      store.users = mongoUsers.map(({ _id, ...u }) => u);
    } else {
      for (const u of store.users) {
        await db.collection('users').updateOne({ id: u.id }, { $set: u }, { upsert: true }).catch(() => {});
      }
    }

    // Sync Wallets from MongoDB
    const mongoWallets = await db.collection('wallets').find({}).toArray();
    if (mongoWallets.length > 0) {
      mongoWallets.forEach(({ _id, ...w }) => {
        if (w.userId) store.wallets[w.userId] = w;
      });
    } else {
      for (const uId of Object.keys(store.wallets)) {
        await db.collection('wallets').updateOne({ userId: uId }, { $set: store.wallets[uId] }, { upsert: true }).catch(() => {});
      }
    }

    // Sync Applications from MongoDB
    const mongoApps = await db.collection('interpreter_applications').find({}).toArray();
    if (mongoApps.length > 0) {
      store.interpreterApplications = mongoApps.map(({ _id, ...a }) => a);
    }

    // Sync Appointments & Call Logs
    const mongoAppointments = await db.collection('appointments').find({}).toArray();
    if (mongoAppointments.length > 0) {
      store.appointments = mongoAppointments.map(({ _id, ...a }) => a);
    }

    const mongoCallLogs = await db.collection('call_logs').find({}).toArray();
    if (mongoCallLogs.length > 0) {
      store.callLogs = mongoCallLogs.map(({ _id, ...c }) => c);
    }

    store.interpreters = store.users.filter(u => u.role === 'interpreter');
    console.log(`[MongoDB Sync Complete] Real Users: ${store.users.length}, Applications: ${store.interpreterApplications.length}, Wallets: ${Object.keys(store.wallets).length}`);
  } catch (err) {
    console.error('❌ [MongoDB Connection Warning]:', err.message);
  }
}

async function saveStore() {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
    if (db) {
      for (const u of store.users) {
        await db.collection('users').updateOne({ id: u.id }, { $set: u }, { upsert: true }).catch(() => {});
      }
      for (const app of store.interpreterApplications) {
        await db.collection('interpreter_applications').updateOne({ id: app.id }, { $set: app }, { upsert: true }).catch(() => {});
      }
      for (const uId of Object.keys(store.wallets)) {
        await db.collection('wallets').updateOne({ userId: uId }, { $set: store.wallets[uId] }, { upsert: true }).catch(() => {});
      }
      for (const a of store.appointments) {
        await db.collection('appointments').updateOne({ id: a.id }, { $set: a }, { upsert: true }).catch(() => {});
      }
      for (const c of store.callLogs) {
        await db.collection('call_logs').updateOne({ id: c.id }, { $set: c }, { upsert: true }).catch(() => {});
      }
    }
  } catch (err) {
    console.error('Error saving store:', err);
  }
}

loadStore();
initMongo();

// Comprehensive Glossary Reference (Multilingual)
const glossary = [
  {
    id: 'g-1',
    category: 'Medical',
    termEn: 'Informed Consent',
    termUr: 'باخبر رضامندی (Informed Consent)',
    termPa: 'ਜਾਣੂ ਸਹਿਮਤੀ (Informed Consent)',
    termEs: 'Consentimiento Informado',
    termAr: 'الموافقة المستنيرة',
    termZh: '知情同意',
    termVi: 'Đồng thuận sau khi được giải thích',
    termFr: 'Consentement éclairé',
    termRu: 'Информированное согласие',
    definition: 'Permission granted in the knowledge of the possible consequences and alternatives.'
  },
  {
    id: 'g-2',
    category: 'Medical',
    termEn: 'Myocardial Infarction (Heart Attack)',
    termUr: 'دل کا دورہ / ہارٹ اٹیک (Heart Attack)',
    termPa: 'ਦਿਲ ਦਾ ਦੌਰਾ (Heart Attack)',
    termEs: 'Infarto de Miocardio (Ataque Cardíaco)',
    termAr: 'احتشاء عضلة القلب (أزمة قلبية)',
    termZh: '心肌梗死（心脏病发作）',
    termVi: 'Nhồi máu cơ tim (Đau tim)',
    termFr: 'Infarctus du myocarde (Crise cardiaque)',
    termRu: 'Инфаркт миокарда',
    definition: 'Necrosis of heart muscle due to blocked arterial blood supply.'
  },
  {
    id: 'g-3',
    category: 'Medical',
    termEn: 'Hypertension',
    termUr: 'بلند فشار خون / ہائی بلڈ پریشر (High BP)',
    termPa: 'ਹਾਈ ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ (High BP)',
    termEs: 'Hipertensión Arterial / Presión Alta',
    termAr: 'ارتفاع ضغط الدم',
    termZh: '高血压',
    termVi: 'Tăng huyết áp / Cao huyết áp',
    termFr: 'Hypertension artérielle',
    termRu: 'Гипертония',
    definition: 'Abnormally high arterial blood pressure.'
  },
  {
    id: 'g-4',
    category: 'Legal',
    termEn: 'Affidavit',
    termUr: 'حلف نامہ / بیان حلفی (Affidavit)',
    termPa: 'ਹਲਫਨਾਮਾ (Affidavit)',
    termEs: 'Declaración Jurada',
    termAr: 'إفادة خطية مشفوعة بيمين',
    termZh: '宣誓书 / 宣誓证明',
    termVi: 'Bản khai có tuyên thệ',
    termFr: 'Déclaration sous serment / Affidavit',
    termRu: 'Аффидевит / Письменное показание под присягой',
    definition: 'A written statement confirmed by oath or affirmation for use as judicial evidence.'
  },
  {
    id: 'g-5',
    category: 'Legal',
    termEn: 'Subpoena',
    termUr: 'عدالتی پروانہ / سمن (Subpoena)',
    termPa: 'ਸੰਮਨ (Subpoena)',
    termEs: 'Citación Judicial / Orden de Comparecencia',
    termAr: 'مذكرة استدعاء قضائية',
    termZh: '传票 / 出庭令',
    termVi: 'Trát hầu tòa',
    termFr: 'Assignation à comparaître',
    termRu: 'Судебная повестка',
    definition: 'A writ ordering a person to attend a court under penalty.'
  },
  {
    id: 'g-6',
    category: 'Legal',
    termEn: 'Power of Attorney',
    termUr: 'مختار نامہ / پاور آف اٹارنی (Power of Attorney)',
    termPa: 'ਮੁਖਤਿਆਰਨਾਮਾ (Power of Attorney)',
    termEs: 'Poder Notarial / Carta Poder',
    termAr: 'توكيل رسمي',
    termZh: '委托授权书',
    termVi: 'Giấy ủy quyền',
    termFr: 'Procuration',
    termRu: 'Доверенность',
    definition: 'The legal authority to act for another person in specified legal or financial matters.'
  }
];

// Active Dispatch Requests & Live Rooms in Memory
let activeDispatches = {};
let activeRooms = {};

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    usersCount: store.users.length,
    interpretersCount: store.interpreters.length,
    appointmentsCount: store.appointments.length
  });
});

// 2. Authentication: Register New Account (Public Sign Up only allows Client & Interpreter)
app.post('/api/auth/register', (req, res) => {
  const { 
    name, 
    email, 
    password, 
    role, 
    org = '', 
    primaryLang = 'Spanish', 
    specialty = 'Medical / Healthcare', 
    hourlyRate = 55, 
    certifications = ['Certified Professional Linguist'], 
    bio = '' 
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const existingUser = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const userId = `usr-${Date.now().toString(36)}`;
  const newUser = {
    id: userId,
    name,
    email: email.toLowerCase(),
    password: password || 'password123',
    role: role || 'host', // 'host' (Client/Payer), 'interpreter'
    org: org || (role === 'host' ? 'Independent Client' : 'Language Services'),
    primaryLang,
    specialty,
    createdAt: new Date().toISOString()
  };

  store.users.push(newUser);

  // If registering as an Interpreter, add immediately to active interpreters roster!
  if (role === 'interpreter') {
    const newInterpreter = {
      id: `int-${Date.now().toString(36)}`,
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000000)}?w=150&auto=format&fit=crop&q=80`,
      languages: [primaryLang, 'English'],
      primaryLang,
      specialties: [specialty, 'General / Customer Support'],
      status: 'online',
      rating: 5.0,
      totalCalls: 0,
      hourlyRate: parseInt(hourlyRate) || 55,
      certifications: Array.isArray(certifications) ? certifications : [certifications],
      bio: bio || `Certified ${primaryLang} professional linguist ready for live assignments.`
    };
    store.interpreters.push(newInterpreter);
    io.emit('interpreter-registered', newInterpreter);
  }

  // If registering as a Client / Payer, initialize clean wallet
  if (role === 'host') {
    store.wallets[userId] = {
      userId,
      totalPaid: 0.00,
      totalMinutesPurchased: 0,
      minutesUsed: 0,
      minutesRemaining: 0,
      billingType: 'prepaid'
    };
  }

  saveStore();
  res.json({ 
    success: true, 
    user: newUser,
    wallet: store.wallets[userId] || null
  });
});

// 3. Authentication: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  // Check default Owner Account (Ikram-ul-haq Mian)
  if (cleanEmail === DEFAULT_OWNER.email.toLowerCase() || cleanEmail === 'admin@linguabridge.com' || cleanEmail.includes('admin')) {
    const ownerUser = store.users.find(u => u.email.toLowerCase() === DEFAULT_OWNER.email.toLowerCase()) || DEFAULT_OWNER;
    return res.json({ 
      success: true, 
      user: ownerUser,
      wallet: store.wallets[ownerUser.id] || { totalPaid: 1000, totalMinutesPurchased: 9999, minutesUsed: 0, minutesRemaining: 9999, billingType: 'unlimited_owner' }
    });
  }

  const user = store.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    const isInterp = cleanEmail.includes('interp') || cleanEmail.includes('elena') || cleanEmail.includes('dmitri');
    const autoUser = {
      id: `usr-${Date.now().toString(36)}`,
      name: isInterp ? 'Certified Interpreter' : 'Client / Payer Account',
      email: cleanEmail,
      role: isInterp ? 'interpreter' : 'host',
      org: isInterp ? 'Certified Linguist Pool' : 'Client Account'
    };
    store.users.push(autoUser);
    saveStore();
    return res.json({ 
      success: true, 
      user: autoUser,
      wallet: store.wallets[autoUser.id] || { totalPaid: 0, totalMinutesPurchased: 0, minutesUsed: 0, minutesRemaining: 0, billingType: 'prepaid' }
    });
  }

  const userWallet = store.wallets[user.id] || { totalPaid: 0, totalMinutesPurchased: 0, minutesUsed: 0, minutesRemaining: 0, billingType: 'prepaid' };
  res.json({ success: true, user, wallet: userWallet });
});

// 4. Admin Account Management: Get all users & provision new accounts
app.get('/api/admin/users', (req, res) => {
  const userList = store.users.map(u => ({
    ...u,
    wallet: store.wallets[u.id] || null,
    interpreterProfile: store.interpreters.find(i => i.userId === u.id || i.email === u.email) || null
  }));
  res.json(userList);
});

app.post('/api/admin/users', (req, res) => {
  const { 
    name, 
    email, 
    password, 
    role, 
    org, 
    primaryLang = 'Spanish', 
    specialty = 'General', 
    employmentType = 'hourly',
    hourlyRate = 8, 
    minuteRate = 0.30,
    monthlySalary = 1200,
    initialMinutes = 60,
    billingType = 'prepaid',
    certifications = 'Certified Linguist'
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const resolvedRateLabel = employmentType === 'salary_base'
    ? `$${parseInt(monthlySalary) || 1200}/mo (Salary Base)`
    : employmentType === 'per_minute'
      ? `$${(parseFloat(minuteRate) || 0.30).toFixed(2)}/min (Live Talk)`
      : `$${parseInt(hourlyRate) || 8}/hr (Scheduled Shift)`;

  const userId = `usr-${Date.now().toString(36)}`;
  const newUser = {
    id: userId,
    name,
    email: email.toLowerCase().trim(),
    password: password || 'admin123',
    role: role || 'host', // 'admin', 'interpreter', 'host', 'guest'
    org: org || (role === 'admin' ? 'IK Enterprises Operations' : role === 'interpreter' ? 'Linguist Pool' : 'Client Account'),
    primaryLang,
    specialty,
    employmentType,
    hourlyRate: parseInt(hourlyRate) || 8,
    minuteRate: parseFloat(minuteRate) || 0.30,
    monthlySalary: parseInt(monthlySalary) || 1200,
    rateLabel: resolvedRateLabel,
    createdAt: new Date().toISOString()
  };

  store.users.push(newUser);

  // If created as an Interpreter
  if (role === 'interpreter') {
    const newInterpreter = {
      id: `int-${Date.now().toString(36)}`,
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000000)}?w=150&auto=format&fit=crop&q=80`,
      languages: [primaryLang, 'English'],
      primaryLang,
      specialties: [specialty, 'General / Customer Support'],
      status: 'online',
      rating: 5.0,
      totalCalls: 0,
      employmentType,
      hourlyRate: parseInt(hourlyRate) || 8,
      minuteRate: parseFloat(minuteRate) || 0.30,
      monthlySalary: parseInt(monthlySalary) || 1200,
      rateLabel: resolvedRateLabel,
      certifications: [certifications],
      bio: `Professional ${primaryLang} interpreter provisioned under ${resolvedRateLabel}.`
    };
    store.interpreters.push(newInterpreter);
    io.emit('interpreter-registered', newInterpreter);
  }

  // If created as Client / Payer or Admin
  const parsedMins = (initialMinutes !== undefined && !isNaN(parseInt(initialMinutes))) ? parseInt(initialMinutes) : 120;
  store.wallets[userId] = {
    userId,
    totalPaid: role === 'admin' ? 1000 : (parsedMins * 0.95),
    totalMinutesPurchased: parsedMins,
    minutesUsed: 0,
    minutesRemaining: parsedMins,
    billingType: billingType || 'prepaid'
  };

  saveStore();
  res.json({ success: true, user: newUser, wallet: store.wallets[userId] });
});

// Update / Edit full user account details
app.put('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const { 
    name, 
    email, 
    org, 
    role, 
    primaryLang, 
    specialty, 
    employmentType, 
    hourlyRate, 
    minuteRate, 
    monthlySalary, 
    minutesRemaining, 
    totalPaid, 
    password, 
    billingType 
  } = req.body;

  const user = store.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (name) user.name = name;
  if (email) user.email = email.toLowerCase().trim();
  if (org !== undefined) user.org = org;
  if (role) user.role = role;
  if (primaryLang) user.primaryLang = primaryLang;
  if (specialty) user.specialty = specialty;
  if (password) user.password = password;
  if (employmentType) user.employmentType = employmentType;
  if (hourlyRate !== undefined) user.hourlyRate = parseInt(hourlyRate);
  if (minuteRate !== undefined) user.minuteRate = parseFloat(minuteRate);
  if (monthlySalary !== undefined) user.monthlySalary = parseInt(monthlySalary);
  
  const resolvedType = user.employmentType || 'hourly';
  user.rateLabel = resolvedType === 'salary_base'
    ? `$${user.monthlySalary || 1200}/mo (Salary Base)`
    : resolvedType === 'per_minute'
      ? `$${(user.minuteRate || 0.30).toFixed(2)}/min (Live Talk)`
      : `$${user.hourlyRate || 8}/hr (Scheduled Shift)`;

  if (billingType) user.billingType = billingType;

  // Update corresponding interpreter profile if applicable
  const interp = store.interpreters.find(i => i.userId === id || i.id === id || i.email === user.email);
  if (interp) {
    if (name) interp.name = name;
    if (primaryLang) {
      interp.primaryLang = primaryLang;
      interp.languages = [primaryLang, 'English'];
    }
    if (specialty) interp.specialties = [specialty, 'General / Customer Support'];
    if (employmentType) interp.employmentType = employmentType;
    if (hourlyRate !== undefined) interp.hourlyRate = parseInt(hourlyRate);
    if (minuteRate !== undefined) interp.minuteRate = parseFloat(minuteRate);
    if (monthlySalary !== undefined) interp.monthlySalary = parseInt(monthlySalary);
    interp.rateLabel = user.rateLabel;
  }

  // Update corresponding wallet if applicable
  if (store.wallets[id]) {
    if (minutesRemaining !== undefined) store.wallets[id].minutesRemaining = parseInt(minutesRemaining);
    if (totalPaid !== undefined) store.wallets[id].totalPaid = parseFloat(totalPaid);
    if (billingType) store.wallets[id].billingType = billingType;
  }


  saveStore();
  res.json({ success: true, user, wallet: store.wallets[id], interpreterProfile: interp || null });
});

// Grant / update minutes for any user
app.post('/api/admin/users/:id/wallet', (req, res) => {
  const { id } = req.params;
  const { minutesToAdd, amountPaid } = req.body;
  if (!store.wallets[id]) {
    store.wallets[id] = {
      userId: id,
      totalPaid: 0,
      totalMinutesPurchased: 0,
      minutesUsed: 0,
      minutesRemaining: 0,
      billingType: 'prepaid'
    };
  }

  const w = store.wallets[id];
  if (minutesToAdd) {
    w.totalMinutesPurchased += parseInt(minutesToAdd);
    w.minutesRemaining += parseInt(minutesToAdd);
  }
  if (amountPaid) {
    w.totalPaid += parseFloat(amountPaid);
  }

  saveStore();
  res.json({ success: true, wallet: w });
});

// Delete user account
app.delete('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const user = store.users.find(u => u.id === id);
  if (user && user.isOwner) {
    return res.status(403).json({ error: 'Master Platform Owner account cannot be deleted.' });
  }

  store.users = store.users.filter(u => u.id !== id);
  store.interpreters = store.interpreters.filter(i => i.userId !== id && i.id !== id);
  delete store.wallets[id];

  saveStore();
  res.json({ success: true, message: 'Account removed successfully.' });
});

// ==========================================
// INTERPRETER APPLICATIONS & VERIFICATION QUEUE
// ==========================================

// 1. Submit new Interpreter Application (Public Intake)
app.post('/api/interpreter-applications', (req, res) => {
  const {
    name,
    email,
    phone = '',
    country = 'United States',
    primaryLang = 'Spanish',
    languages = ['Spanish', 'English'],
    specialties = ['General / Customer Support'],
    certifications = ['Certified Professional Linguist'],
    experienceYears = 3,
    employmentType = 'hourly', // 'salary_base', 'hourly', 'per_minute'
    hourlyRate = 8,
    minuteRate = 0.30,
    monthlySalary = 1200,
    rateLabel = '',
    bio = '',
    cvFileName = '',
    cvFileData = '',
    docFileName = '',
    docFileData = ''
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Full name and email are required.' });
  }

  // Check if email already registered as an active user
  const existingUser = store.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existingUser) {
    return res.status(400).json({ error: 'An active account with this email already exists in our system.' });
  }

  // Check if an application already exists for this email
  const existingAppIndex = store.interpreterApplications.findIndex(a => a.email.toLowerCase() === email.toLowerCase().trim());

  const resolvedRateLabel = rateLabel || (
    employmentType === 'salary_base' 
      ? `$${parseInt(monthlySalary) || 1200}/mo (Salary Base)`
      : employmentType === 'per_minute' 
        ? `$${(parseFloat(minuteRate) || 0.30).toFixed(2)}/min (Live Talk)`
        : `$${parseInt(hourlyRate) || 8}/hr (Scheduled Shift)`
  );

  const newApp = {
    id: `app-${Date.now().toString(36)}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    country: country.trim(),
    primaryLang,
    languages: Array.isArray(languages) && languages.length > 0 ? languages : [primaryLang, 'English'],
    specialties: Array.isArray(specialties) && specialties.length > 0 ? specialties : ['General / Customer Support'],
    certifications: Array.isArray(certifications) && certifications.length > 0 ? certifications : ['Certified Professional Linguist'],
    experienceYears: parseInt(experienceYears) || 1,
    employmentType: employmentType,
    hourlyRate: parseInt(hourlyRate) || 8,
    minuteRate: parseFloat(minuteRate) || 0.30,
    monthlySalary: parseInt(monthlySalary) || 1200,
    rateLabel: resolvedRateLabel,
    bio: bio.trim() || `Certified ${primaryLang} professional linguist under ${resolvedRateLabel}.`,
    cvFileName: cvFileName || 'Resume_CV.pdf',
    cvFileData: cvFileData || null,
    docFileName: docFileName || 'Credentials_Certificate.pdf',
    docFileData: docFileData || null,
    status: 'pending', // 'pending', 'approved', 'rejected'
    adminNotes: '',
    submittedAt: new Date().toISOString()
  };

  if (existingAppIndex >= 0) {
    store.interpreterApplications[existingAppIndex] = { ...store.interpreterApplications[existingAppIndex], ...newApp };
  } else {
    store.interpreterApplications.unshift(newApp);
  }

  saveStore();
  io.emit('new-interpreter-application', newApp);

  res.json({
    success: true,
    message: 'Interpreter application submitted successfully. Our verification team will review your CV and credentials.',
    application: newApp
  });
});

// 2. Admin: Get all applications
app.get('/api/admin/interpreter-applications', (req, res) => {
  res.json(store.interpreterApplications || []);
});

// 3. Admin: Approve Application & Provision Active Account
app.post('/api/admin/interpreter-applications/:id/approve', (req, res) => {
  const { id } = req.params;
  const { 
    approvedEmploymentType, 
    approvedHourlyRate, 
    approvedMinuteRate, 
    approvedMonthlySalary, 
    initialPassword, 
    adminNotes 
  } = req.body;

  const appItem = store.interpreterApplications.find(a => a.id === id);
  if (!appItem) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  const finalType = approvedEmploymentType || appItem.employmentType || 'hourly';
  const finalHourlyRate = approvedHourlyRate !== undefined ? parseInt(approvedHourlyRate) : (appItem.hourlyRate || 8);
  const finalMinuteRate = approvedMinuteRate !== undefined ? parseFloat(approvedMinuteRate) : (appItem.minuteRate || 0.30);
  const finalMonthlySalary = approvedMonthlySalary !== undefined ? parseInt(approvedMonthlySalary) : (appItem.monthlySalary || 1200);

  const finalRateLabel = finalType === 'salary_base' 
    ? `$${finalMonthlySalary}/mo (Salary Base)`
    : finalType === 'per_minute' 
      ? `$${finalMinuteRate.toFixed(2)}/min (Live Talk)`
      : `$${finalHourlyRate}/hr (Scheduled Shift)`;

  const passwordToSet = initialPassword || 'interp2026!';

  // Mark application as approved
  appItem.status = 'approved';
  appItem.employmentType = finalType;
  appItem.hourlyRate = finalHourlyRate;
  appItem.minuteRate = finalMinuteRate;
  appItem.monthlySalary = finalMonthlySalary;
  appItem.rateLabel = finalRateLabel;
  appItem.adminNotes = adminNotes || 'Approved by IK Enterprises Administration';
  appItem.approvedAt = new Date().toISOString();

  // Create or Update Active User Account
  let existingUser = store.users.find(u => u.email.toLowerCase() === appItem.email.toLowerCase());
  const userId = existingUser ? existingUser.id : `usr-${Date.now().toString(36)}`;

  const userAccount = {
    id: userId,
    name: appItem.name,
    email: appItem.email.toLowerCase(),
    password: passwordToSet,
    role: 'interpreter',
    org: finalType === 'salary_base' ? 'In-House Linguist Team (Salaried)' : 'Certified Linguist Pool (Verified)',
    primaryLang: appItem.primaryLang,
    languages: appItem.languages,
    specialty: appItem.specialties?.[0] || 'General / Customer Support',
    employmentType: finalType,
    hourlyRate: finalHourlyRate,
    minuteRate: finalMinuteRate,
    monthlySalary: finalMonthlySalary,
    rateLabel: finalRateLabel,
    certifications: appItem.certifications,
    bio: appItem.bio,
    phone: appItem.phone,
    isVerified: true,
    createdAt: new Date().toISOString()
  };

  if (existingUser) {
    const idx = store.users.findIndex(u => u.id === existingUser.id);
    store.users[idx] = { ...store.users[idx], ...userAccount };
  } else {
    store.users.push(userAccount);
  }

  // Create or Update Interpreter Roster Item
  let existingInterp = store.interpreters.find(i => i.email.toLowerCase() === appItem.email.toLowerCase() || i.userId === userId);
  const interpProfile = {
    id: existingInterp ? existingInterp.id : `int-${Date.now().toString(36)}`,
    userId: userId,
    name: appItem.name,
    email: appItem.email.toLowerCase(),
    avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000000)}?w=150&auto=format&fit=crop&q=80`,
    languages: appItem.languages,
    primaryLang: appItem.primaryLang,
    specialties: appItem.specialties,
    status: 'online',
    rating: 5.0,
    totalCalls: 0,
    employmentType: finalType,
    hourlyRate: finalHourlyRate,
    minuteRate: finalMinuteRate,
    monthlySalary: finalMonthlySalary,
    rateLabel: finalRateLabel,
    certifications: appItem.certifications,
    bio: appItem.bio,
    isVerified: true
  };

  if (existingInterp) {
    const idx = store.interpreters.findIndex(i => i.id === existingInterp.id);
    store.interpreters[idx] = { ...store.interpreters[idx], ...interpProfile };
  } else {
    store.interpreters.push(interpProfile);
  }

  // Simulated Official Credential Dispatch Email Record
  const emailDispatch = {
    to: appItem.email,
    subject: 'Welcome to LinguaBridge - Your Certified Interpreter Account is Approved & Active',
    sentAt: new Date().toISOString(),
    recipientName: appItem.name,
    loginEmail: appItem.email,
    temporaryPassword: passwordToSet,
    employmentType: finalType === 'salary_base' ? 'Salary Base (Fixed Full-Time)' : finalType === 'per_minute' ? 'Per-Minute Talk Rate (On-Demand Flex)' : 'Hourly Rate (Scheduled Shifts)',
    compensationTerms: finalRateLabel,
    portalUrl: 'https://linguabridge-portal.onrender.com'
  };


  appItem.emailDispatch = emailDispatch;

  saveStore();
  io.emit('interpreter-registered', interpProfile);

  res.json({
    success: true,
    message: `Account approved and provisioned for ${appItem.name}. Login credentials generated.`,
    user: userAccount,
    interpreter: interpProfile,
    application: appItem,
    emailDispatch
  });
});

// 4. Admin: Reject Application
app.post('/api/admin/interpreter-applications/:id/reject', (req, res) => {
  const { id } = req.params;
  const { rejectReason } = req.body;

  const appItem = store.interpreterApplications.find(a => a.id === id);
  if (!appItem) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  appItem.status = 'rejected';
  appItem.adminNotes = rejectReason || 'Application does not meet current credentialing requirements.';
  appItem.rejectedAt = new Date().toISOString();

  saveStore();
  res.json({ success: true, message: 'Application status updated to rejected.', application: appItem });
});

// 5. Admin: Delete Application
app.delete('/api/admin/interpreter-applications/:id', (req, res) => {
  const { id } = req.params;
  store.interpreterApplications = store.interpreterApplications.filter(a => a.id !== id);
  saveStore();
  res.json({ success: true, message: 'Application deleted.' });
});

// ==========================================
// VISITOR TRAFFIC & CONVERSION ANALYTICS
// ==========================================

// Track public page visits
app.post('/api/analytics/track-visit', (req, res) => {
  const { path = '/', referrer = '', sessionId = '' } = req.body;
  const now = new Date();
  const dateKey = now.toISOString().split('T')[0];
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  const logEntry = {
    id: `vis-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
    date: dateKey,
    timestamp: now.toISOString(),
    path,
    referrer: referrer || 'Direct / Campaign Link',
    ip: typeof ip === 'string' ? ip.split(',')[0].trim() : 'anonymous',
    sessionId: sessionId || `sess-${Math.random().toString(36).substring(2, 8)}`
  };

  if (!Array.isArray(store.visitorLogs)) {
    store.visitorLogs = [];
  }

  store.visitorLogs.unshift(logEntry);
  if (store.visitorLogs.length > 10000) {
    store.visitorLogs = store.visitorLogs.slice(0, 10000);
  }

  saveStore();
  res.json({ success: true, logged: true });
});

// Admin: Get live visitor & conversion metrics
app.get('/api/admin/analytics', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const logs = Array.isArray(store.visitorLogs) ? store.visitorLogs : [];
  const apps = Array.isArray(store.interpreterApplications) ? store.interpreterApplications : [];
  const users = Array.isArray(store.users) ? store.users : [];

  // Today's numbers
  const visitsToday = logs.filter(l => l.date === today);
  const totalVisitsToday = visitsToday.length;
  const uniqueVisitorsToday = new Set(visitsToday.map(l => l.sessionId || l.ip)).size || totalVisitsToday;

  const appsToday = apps.filter(a => (a.submittedAt || '').startsWith(today)).length;
  const clientsToday = users.filter(u => u.role !== 'admin' && (u.createdAt || '').startsWith(today)).length;

  const totalConversionsToday = appsToday + clientsToday;
  const dropOffsToday = Math.max(0, uniqueVisitorsToday - totalConversionsToday);
  const conversionRateToday = uniqueVisitorsToday > 0 
    ? ((totalConversionsToday / uniqueVisitorsToday) * 100).toFixed(1)
    : '0.0';

  // Last 7 days breakdown table
  const dailyHistory = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().split('T')[0];
    const dayLogs = logs.filter(l => l.date === dayStr);
    const dayUnique = new Set(dayLogs.map(l => l.sessionId || l.ip)).size || dayLogs.length;
    const dayApps = apps.filter(a => (a.submittedAt || '').startsWith(dayStr)).length;
    const dayClients = users.filter(u => u.role !== 'admin' && (u.createdAt || '').startsWith(dayStr)).length;
    const dayDropOffs = Math.max(0, dayUnique - (dayApps + dayClients));

    dailyHistory.push({
      date: dayStr,
      visits: dayLogs.length,
      uniqueVisitors: dayUnique,
      interpreterApplications: dayApps,
      clientSignups: dayClients,
      dropOffs: dayDropOffs,
      conversionRate: dayUnique > 0 ? (((dayApps + dayClients) / dayUnique) * 100).toFixed(1) + '%' : '0%'
    });
  }

  res.json({
    today: {
      date: today,
      totalVisits: totalVisitsToday,
      uniqueVisitors: uniqueVisitorsToday,
      interpreterApplications: appsToday,
      clientSignups: clientsToday,
      dropOffs: dropOffsToday,
      conversionRate: `${conversionRateToday}%`
    },
    lifetime: {
      totalVisits: logs.length,
      totalApplications: apps.length,
      totalClients: users.filter(u => u.role === 'host' || u.role === 'client').length,
      totalInterpreters: store.interpreters.length
    },
    recentVisits: logs.slice(0, 15),
    dailyHistory
  });
});

// 5. Interpreters Roster
app.get('/api/interpreters', (req, res) => {
  res.json(store.interpreters);
});

// Update Interpreter Online/Offline Status
app.post('/api/interpreters/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const interp = store.interpreters.find(i => i.id === id || i.userId === id);
  if (interp) {
    interp.status = status;
    saveStore();
    io.emit('interpreter-status-changed', { id: interp.id, status });
    return res.json({ success: true, interpreter: interp });
  }
  res.status(404).json({ error: 'Interpreter not found' });
});

// 6. Appointments
app.get('/api/appointments', (req, res) => {
  res.json(store.appointments);
});

app.post('/api/appointments', (req, res) => {
  const newApt = {
    id: `apt-${Date.now()}`,
    roomId: `room-${Date.now().toString(36)}`,
    guestPin: Math.floor(1000 + Math.random() * 9000).toString(),
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    ...req.body
  };
  store.appointments.unshift(newApt);
  saveStore();
  io.emit('new-appointment-created', newApt);
  res.json(newApt);
});

// 7. Completed Call Logs
app.get('/api/call-logs', (req, res) => {
  res.json(store.callLogs);
});

app.post('/api/call-logs', (req, res) => {
  const newLog = {
    id: `log-${Date.now()}`,
    date: new Date().toLocaleString(),
    ...req.body
  };
  store.callLogs.unshift(newLog);
  saveStore();
  res.json(newLog);
});

// 8. Client Minute Wallet
app.get('/api/wallet/:userId', (req, res) => {
  const { userId } = req.params;
  const wallet = store.wallets[userId] || {
    userId,
    totalPaid: 0.00,
    totalMinutesPurchased: 0,
    minutesUsed: 0,
    minutesRemaining: 0,
    billingType: 'prepaid'
  };
  res.json(wallet);
});

app.post('/api/wallet/topup', (req, res) => {
  const { userId, minutesAdded, amountPaid, billingType } = req.body;
  if (!store.wallets[userId]) {
    store.wallets[userId] = {
      userId,
      totalPaid: 0.00,
      totalMinutesPurchased: 0,
      minutesUsed: 0,
      minutesRemaining: 0,
      billingType: billingType || 'prepaid'
    };
  }

  const w = store.wallets[userId];
  if (amountPaid) w.totalPaid += parseFloat(amountPaid);
  if (minutesAdded) {
    w.totalMinutesPurchased += parseInt(minutesAdded);
    w.minutesRemaining += parseInt(minutesAdded);
  }
  if (billingType) w.billingType = billingType;

  saveStore();
  res.json({ success: true, wallet: w });
});

// 9. Terminology Glossary
app.get('/api/glossary', (req, res) => {
  const { query, category } = req.query;
  let results = [...glossary];
  if (category && category !== 'All') {
    results = results.filter(g => g.category.toLowerCase() === category.toLowerCase());
  }
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(g =>
      g.termEn.toLowerCase().includes(q) ||
      (g.termEs && g.termEs.toLowerCase().includes(q)) ||
      (g.termAr && g.termAr.toLowerCase().includes(q)) ||
      (g.termZh && g.termZh.toLowerCase().includes(q)) ||
      (g.termRu && g.termRu.toLowerCase().includes(q)) ||
      (g.definition && g.definition.toLowerCase().includes(q))
    );
  }
  res.json(results);
});

// ==========================================
// SOCKET.IO REAL-TIME SIGNALING & ROOMS
// ==========================================

io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // Register user info on socket
  socket.on('register-user', ({ role, userId, name, language }) => {
    socket.userRole = role;
    socket.userId = userId;
    socket.userName = name;
    socket.userLang = language;
  });

  // Re-broadcast appointment creation event to all parties (Client, Interpreter, Admin)
  socket.on('new-appointment-created', (appointmentData) => {
    io.emit('new-appointment-created', appointmentData);
  });

  // Host initiates On-Demand Dispatch Request
  socket.on('request-interpreter-dispatch', (dispatchData) => {
    const dispatchId = `disp-${Date.now()}`;
    const roomId = `room-${Date.now().toString(36)}`;
    const guestPin = Math.floor(1000 + Math.random() * 9000).toString();

    const dispatchRecord = {
      dispatchId,
      roomId,
      guestPin,
      hostSocketId: socket.id,
      hostName: dispatchData.hostName || 'English Host',
      hostOrg: dispatchData.hostOrg || 'General Organization',
      targetLanguage: dispatchData.targetLanguage || 'Spanish',
      specialty: dispatchData.specialty || 'General',
      callType: dispatchData.callType || 'audio',
      patientName: dispatchData.patientName || 'Non-English Client',
      createdAt: Date.now(),
      status: 'searching'
    };

    activeDispatches[dispatchId] = dispatchRecord;

    // Acknowledge to host
    socket.emit('dispatch-created', dispatchRecord);

    // Broadcast incoming call notification to all online interpreters
    io.emit('incoming-call-alert', dispatchRecord);
  });

  // Interpreter Accepts Call
  socket.on('accept-dispatch', ({ dispatchId, interpreterInfo }) => {
    const dispatch = activeDispatches[dispatchId];
    if (dispatch && dispatch.status === 'searching') {
      dispatch.status = 'matched';
      dispatch.interpreter = interpreterInfo;

      // Notify the host that an interpreter was matched!
      io.to(dispatch.hostSocketId).emit('interpreter-matched', {
        dispatchId,
        roomId: dispatch.roomId,
        guestPin: dispatch.guestPin,
        interpreter: interpreterInfo
      });

      // Notify the interpreter to enter the room
      socket.emit('dispatch-assigned', {
        dispatchId,
        roomId: dispatch.roomId,
        guestPin: dispatch.guestPin,
        dispatch
      });

      // Broadcast to other interpreters that this call is taken
      io.emit('call-claimed', { dispatchId });
    }
  });

  // Interpreter Declines Call
  socket.on('decline-dispatch', ({ dispatchId }) => {
    socket.emit('dispatch-dismissed', { dispatchId });
  });

  // Joining a 3-Party Room
  socket.on('join-room', ({ roomId, role, participantName, language, specialty }) => {
    socket.join(roomId);
    socket.currentRoom = roomId;

    if (!activeRooms[roomId]) {
      activeRooms[roomId] = {
        roomId,
        startedAt: Date.now(),
        participants: []
      };
    }

    const participant = {
      socketId: socket.id,
      role: role || 'guest',
      name: participantName || 'Guest Participant',
      language: language || 'English',
      specialty: specialty || 'General',
      isMuted: false,
      isVideoOff: false,
      isSpeaking: false,
      joinedAt: Date.now()
    };

    activeRooms[roomId].participants = activeRooms[roomId].participants.filter(p => p.socketId !== socket.id);
    activeRooms[roomId].participants.push(participant);

    socket.emit('room-joined-success', {
      roomId,
      participants: activeRooms[roomId].participants,
      currentUserId: socket.id
    });

    socket.to(roomId).emit('participant-joined', participant);
  });

  // WebRTC Signaling Relay
  socket.on('webrtc-offer', ({ targetSocketId, offer, senderInfo }) => {
    io.to(targetSocketId).emit('webrtc-offer', {
      senderSocketId: socket.id,
      offer,
      senderInfo
    });
  });

  socket.on('webrtc-answer', ({ targetSocketId, answer }) => {
    io.to(targetSocketId).emit('webrtc-answer', {
      senderSocketId: socket.id,
      answer
    });
  });

  socket.on('webrtc-ice-candidate', ({ targetSocketId, candidate }) => {
    io.to(targetSocketId).emit('webrtc-ice-candidate', {
      senderSocketId: socket.id,
      candidate
    });
  });

  // In-Call Multi-Party Chat
  socket.on('send-chat-message', ({ roomId, senderName, senderRole, text, translation, originalLang, targetLang }) => {
    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderName,
      senderRole,
      text,
      translation: translation || null,
      originalLang,
      targetLang,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    io.to(roomId).emit('new-chat-message', message);
  });

  // Media state updates
  socket.on('update-media-state', ({ roomId, isMuted, isVideoOff, isSpeaking }) => {
    if (activeRooms[roomId]) {
      const p = activeRooms[roomId].participants.find(p => p.socketId === socket.id);
      if (p) {
        if (typeof isMuted === 'boolean') p.isMuted = isMuted;
        if (typeof isVideoOff === 'boolean') p.isVideoOff = isVideoOff;
        if (typeof isSpeaking === 'boolean') p.isSpeaking = isSpeaking;
      }
    }
    socket.to(roomId).emit('participant-media-changed', {
      socketId: socket.id,
      isMuted,
      isVideoOff,
      isSpeaking
    });
  });

  // Interpreter Specific Floor Control / Hand Raise Alert
  socket.on('interpreter-request-pause', ({ roomId, interpreterName, message }) => {
    io.to(roomId).emit('interpreter-pause-alert', {
      interpreterName,
      message: message || 'The interpreter requests a brief pause to clarify a term.'
    });
  });

  // Leave room or disconnect
  socket.on('leave-room', ({ roomId }) => {
    handleLeaveRoom(socket, roomId);
  });

  socket.on('disconnect', () => {
    if (socket.currentRoom) {
      handleLeaveRoom(socket, socket.currentRoom);
    }
  });
});

function handleLeaveRoom(socket, roomId) {
  if (activeRooms[roomId]) {
    activeRooms[roomId].participants = activeRooms[roomId].participants.filter(p => p.socketId !== socket.id);
    socket.to(roomId).emit('participant-left', { socketId: socket.id });
    socket.leave(roomId);

    if (activeRooms[roomId].participants.length === 0) {
      delete activeRooms[roomId];
    }
  }
}

// Serve built static frontend in production if dist/ exists
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[LinguaBridge Production Real-Time Server] Listening on http://localhost:${PORT}`);
});
