import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';
import { 
  sendEmail, 
  sendInterpreterApplicationReceivedEmail, 
  sendInterpreterApprovedEmail, 
  sendClientWelcomeEmail,
  sendInquiryReplyEmail,
  sendPasswordResetEmail
} from './services/emailService.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
  email: 'iksale9817@gmail.com',
  password: 'admin123',
  role: 'admin',
  isOwner: true,
  org: 'IK Enterprises',
  createdAt: new Date().toISOString()
};

// Permanent Seed Accounts (Always available across every deployment)
const SEED_USERS = [];

// Helper to generate unique pure numeric ID for interpreters (e.g. 5 digits)
function generateNumericBadgeId() {
  let candidate;
  let exists = true;
  let attempts = 0;
  while (exists && attempts < 1000) {
    attempts++;
    candidate = Math.floor(10000 + Math.random() * 90000).toString();
    exists = (store?.users || []).some(u => u.badgeNumber === candidate || u.interpreterBadgeId === candidate) ||
             (store?.interpreters || []).some(i => i.badgeNumber === candidate || i.interpreterBadgeId === candidate);
  }
  return candidate || Math.floor(10000 + Math.random() * 90000).toString();
}

function ensureInterpreterBadge(item) {
  if (!item) return;
  if (!item.badgeNumber && !item.interpreterBadgeId) {
    const newId = generateNumericBadgeId();
    item.badgeNumber = newId;
    item.interpreterBadgeId = newId;
  } else if (!item.badgeNumber && item.interpreterBadgeId) {
    item.badgeNumber = item.interpreterBadgeId.toString().replace(/\D/g, '') || generateNumericBadgeId();
  } else if (!item.interpreterBadgeId && item.badgeNumber) {
    item.interpreterBadgeId = item.badgeNumber.toString().replace(/\D/g, '') || generateNumericBadgeId();
  }
  return item.badgeNumber;
}

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

// Permanent Seed Applications (Preserved across all deployments & container restarts)
let SEED_APPLICATIONS = [];
try {
  const seedAppsPath = path.join(process.cwd(), 'server', 'seed_applications.json');
  const fallbackPath = path.join(process.cwd(), 'seed_applications.json');
  const targetPath = fs.existsSync(seedAppsPath) ? seedAppsPath : (fs.existsSync(fallbackPath) ? fallbackPath : null);
  if (targetPath) {
    SEED_APPLICATIONS = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  }
} catch (e) {
  console.warn('Could not read seed_applications.json:', e.message);
}


// Permanent Seed Inquiries (Preserved across all deployments & container restarts)
let SEED_INQUIRIES = [];
try {
  const seedInqsPath = path.join(process.cwd(), 'server', 'seed_inquiries.json');
  const fallbackInqsPath = path.join(process.cwd(), 'seed_inquiries.json');
  const targetInqsPath = fs.existsSync(seedInqsPath) ? seedInqsPath : (fs.existsSync(fallbackInqsPath) ? fallbackInqsPath : null);
  if (targetInqsPath) {
    SEED_INQUIRIES = JSON.parse(fs.readFileSync(targetInqsPath, 'utf8'));
  }
} catch (e) {
  console.warn('Could not read seed_inquiries.json:', e.message);
}

// Initial State Structure
let store = {
  users: [...SEED_USERS],
  interpreters: SEED_USERS.filter(u => u.role === 'interpreter'),
  interpreterApplications: [...SEED_APPLICATIONS],
  appointments: [],
  callLogs: [],
  wallets: { ...SEED_WALLETS },
  visitorLogs: [],
  inquiries: [...SEED_INQUIRIES],
  paymentReceipts: []
};

let db = null;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ik5928271_db_user:Tbe7ruMiqAmYmljz@cluster0.bumsmbw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Utility: Strict single-applicant deduplication by normalized email / id / phone / badge
function deduplicateApplications(appsList) {
  if (!Array.isArray(appsList)) return [];
  const result = [];
  
  for (const app of appsList) {
    if (!app) continue;
    const cleanEmail = (app.email || '').toLowerCase().trim();
    const cleanPhone = (app.phone || '').replace(/[^0-9]/g, '');
    const cleanBadge = (app.badgeNumber || app.interpreterBadgeId || '').toString().trim();

    const existingIdx = result.findIndex(item => {
      const itemEmail = (item.email || '').toLowerCase().trim();
      const itemPhone = (item.phone || '').replace(/[^0-9]/g, '');
      const itemBadge = (item.badgeNumber || item.interpreterBadgeId || '').toString().trim();

      if (app.id && item.id && app.id === item.id) return true;
      if (cleanEmail && itemEmail && cleanEmail.includes('@') && cleanEmail === itemEmail) return true;
      if (cleanBadge && itemBadge && cleanBadge === itemBadge) return true;
      if (cleanPhone.length >= 10 && itemPhone.length >= 10 && cleanPhone === itemPhone) return true;
      return false;
    });

    if (existingIdx === -1) {
      result.push({ ...app, email: cleanEmail || app.email });
    } else {
      const existing = result[existingIdx];
      // Keep the most recent or active status
      const isApproved = existing.status === 'approved' || app.status === 'approved';
      const isRejected = (existing.status === 'rejected' || app.status === 'rejected') && !isApproved;
      const status = isApproved ? 'approved' : (isRejected ? 'rejected' : 'pending');
      const badgeNumber = existing.badgeNumber || app.badgeNumber || existing.interpreterBadgeId || app.interpreterBadgeId || null;

      result[existingIdx] = {
        ...existing,
        ...app,
        id: isApproved ? (existing.status === 'approved' ? existing.id : app.id) : (app.id || existing.id),
        status,
        badgeNumber,
        interpreterBadgeId: badgeNumber,
        displayName: badgeNumber ? `Interpreter #${badgeNumber}` : (app.displayName || existing.displayName || app.name),
        email: cleanEmail || existing.email,
        cvFileName: app.cvFileName || existing.cvFileName,
        cvFileData: app.cvFileData || existing.cvFileData,
        docFileName: app.docFileName || existing.docFileName,
        docFileData: app.docFileData || existing.docFileData,
        bio: app.bio || existing.bio,
        submittedAt: app.submittedAt || existing.submittedAt
      };
    }
  }

  return result;
}

// Load existing store if available
function loadStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf8');
      store = JSON.parse(data);

      if (!Array.isArray(store.interpreterApplications)) {
        store.interpreterApplications = [];
      } else {
        store.interpreterApplications = deduplicateApplications(store.interpreterApplications);
      }

      if (!Array.isArray(store.visitorLogs)) {
        store.visitorLogs = [];
      }

      if (!Array.isArray(store.inquiries)) {
        store.inquiries = [];
      }

      if (!Array.isArray(store.paymentReceipts)) {
        store.paymentReceipts = [];
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

      // Ensure all SEED_APPLICATIONS are merged and preserved
      const currentApps = Array.isArray(store.interpreterApplications) ? store.interpreterApplications : [];
      const mergedSeedApps = [...SEED_APPLICATIONS];
      currentApps.forEach(app => {
        const idx = mergedSeedApps.findIndex(s => 
          (s.id && s.id === app.id) || 
          (s.email && app.email && s.email.toLowerCase().trim() === app.email.toLowerCase().trim())
        );
        if (idx >= 0) {
          mergedSeedApps[idx] = { ...mergedSeedApps[idx], ...app };
        } else {
          mergedSeedApps.unshift(app);
        }
      });
      store.interpreterApplications = deduplicateApplications(mergedSeedApps);

      // Initialize Seed Inquiries only if empty on first setup
      if (store.inquiries.length === 0) {
        store.inquiries = [...SEED_INQUIRIES];
      }

      // Ensure Interpreters collection is synchronized and all have permanent numeric badge numbers
      store.users.forEach(u => {
        if (u.role === 'interpreter') {
          ensureInterpreterBadge(u);
        }
      });
      store.interpreters = store.users.filter(u => u.role === 'interpreter').map(u => ({
        ...u,
        badgeNumber: u.badgeNumber,
        interpreterBadgeId: u.badgeNumber,
        displayName: `Interpreter #${u.badgeNumber}`
      }));

      console.log(`[Database Loaded] Users: ${store.users.length}, Interpreters: ${store.interpreters.length}, Applications: ${store.interpreterApplications.length}, Inquiries: ${store.inquiries.length}, Receipts: ${store.paymentReceipts.length}, Appointments: ${store.appointments.length}`);
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

    // Ensure all interpreters have a unique numeric badge number and persist to MongoDB
    store.users.forEach(async (u) => {
      if (u.role === 'interpreter') {
        const badge = ensureInterpreterBadge(u);
        if (db && badge) {
          await db.collection('users').updateOne({ id: u.id }, { $set: { badgeNumber: badge, interpreterBadgeId: badge } }).catch(() => {});
        }
      }
    });

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

    // Sync Applications from MongoDB (MongoDB live data is the strict ground truth, seed apps only inserted if missing)
    const mongoApps = await db.collection('interpreter_applications').find({}).toArray();
    let mergedApps = [];
    if (mongoApps.length > 0) {
      const cleanMongoApps = mongoApps.map(({ _id, ...a }) => a);
      mergedApps = [...cleanMongoApps];
      // Only append seed apps if not present in MongoDB
      SEED_APPLICATIONS.forEach(sApp => {
        const exists = mergedApps.some(m => 
          (m.id && m.id === sApp.id) || 
          (m.email && sApp.email && m.email.toLowerCase().trim() === sApp.email.toLowerCase().trim())
        );
        if (!exists) {
          mergedApps.push(sApp);
        }
      });
    } else {
      mergedApps = [...SEED_APPLICATIONS];
    }
    store.interpreterApplications = deduplicateApplications(mergedApps);

    // Clean up duplicate application records in MongoDB collection
    try {
      const distinctEmails = [...new Set(store.interpreterApplications.map(a => a.email && a.email.toLowerCase().trim()).filter(Boolean))];
      for (const email of distinctEmails) {
        const matching = store.interpreterApplications.find(a => a.email && a.email.toLowerCase().trim() === email);
        if (matching) {
          await db.collection('interpreter_applications').deleteMany({
            email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
            id: { $ne: matching.id }
          }).catch(() => {});
        }
      }
      for (const app of store.interpreterApplications) {
        await db.collection('interpreter_applications').updateOne({ id: app.id }, { $set: app }, { upsert: true }).catch(() => {});
      }
    } catch (e) {
      console.warn('MongoDB applications deduplication cleanup warning:', e.message);
    }

    // Sync Inquiries & Support Tickets from MongoDB
    const mongoInquiries = await db.collection('inquiries').find({}).toArray();
    let mergedInquiries = [];
    if (mongoInquiries.length > 0) {
      mergedInquiries = mongoInquiries.map(({ _id, ...mInq }) => mInq);
      SEED_INQUIRIES.forEach(sInq => {
        if (!mergedInquiries.some(i => i.id === sInq.id)) {
          mergedInquiries.push(sInq);
        }
      });
    } else {
      mergedInquiries = [...SEED_INQUIRIES];
    }
    store.inquiries = mergedInquiries;
    for (const inq of store.inquiries) {
      await db.collection('inquiries').updateOne({ id: inq.id }, { $set: inq }, { upsert: true }).catch(() => {});
    }

    // Sync Payment Receipts from MongoDB
    const mongoReceipts = await db.collection('payment_receipts').find({}).toArray();
    if (mongoReceipts.length > 0) {
      store.paymentReceipts = mongoReceipts.map(({ _id, ...r }) => r);
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

    const mongoVisitorLogs = await db.collection('visitor_logs').find({}).toArray();
    if (mongoVisitorLogs.length > 0) {
      store.visitorLogs = mongoVisitorLogs.map(({ _id, ...v }) => v);
    }

    store.interpreters = store.users.filter(u => u.role === 'interpreter').map(u => ({
      ...u,
      badgeNumber: u.badgeNumber,
      interpreterBadgeId: u.badgeNumber,
      displayName: `Interpreter #${u.badgeNumber}`
    }));
    console.log(`[MongoDB Sync Complete] Users: ${store.users.length}, Interpreters: ${store.interpreters.length}, Apps: ${store.interpreterApplications.length}, Inquiries: ${store.inquiries.length}, Receipts: ${store.paymentReceipts.length}, Wallets: ${Object.keys(store.wallets).length}`);
  } catch (err) {
    console.error('❌ [MongoDB Connection Warning]:', err.message);
  }
}

let saveTimeout = null;

function saveStore() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      // Keep in-memory logs bounded to prevent memory leaks
      if (Array.isArray(store.visitorLogs) && store.visitorLogs.length > 200) {
        store.visitorLogs = store.visitorLogs.slice(0, 200);
      }
      
      fs.writeFile(STORE_FILE, JSON.stringify(store), 'utf8', () => {});
      
      if (db) {
        const batchPromises = [
          ...store.users.map(u => db.collection('users').updateOne({ id: u.id }, { $set: u }, { upsert: true }).catch(() => {})),
          ...store.interpreterApplications.map(app => db.collection('interpreter_applications').updateOne({ id: app.id }, { $set: app }, { upsert: true }).catch(() => {})),
          ...(store.inquiries || []).map(inq => db.collection('inquiries').updateOne({ id: inq.id }, { $set: inq }, { upsert: true }).catch(() => {})),
          ...(store.paymentReceipts || []).map(rcpt => db.collection('payment_receipts').updateOne({ id: rcpt.id }, { $set: rcpt }, { upsert: true }).catch(() => {})),
          ...Object.keys(store.wallets).map(uId => db.collection('wallets').updateOne({ userId: uId }, { $set: store.wallets[uId] }, { upsert: true }).catch(() => {})),
          ...store.appointments.map(a => db.collection('appointments').updateOne({ id: a.id }, { $set: a }, { upsert: true }).catch(() => {})),
          ...store.callLogs.map(c => db.collection('call_logs').updateOne({ id: c.id }, { $set: c }, { upsert: true }).catch(() => {}))
        ];
        await Promise.allSettled(batchPromises);
      }
    } catch (err) {
      console.error('Error in debounced saveStore:', err.message);
    }
  }, 1000);
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

  const cleanEmail = email.toLowerCase().trim();
  const existingUser = store.users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
  const existingApp = (store.interpreterApplications || []).find(a => a.email && a.email.toLowerCase() === cleanEmail);

  if (existingUser || existingApp) {
    const roleLabel = existingUser 
      ? (existingUser.role === 'admin' ? 'Administrator' : existingUser.role === 'interpreter' ? 'Certified Interpreter' : 'Client') 
      : 'Interpreter Applicant';
    return res.status(400).json({ 
      error: `An account already exists for this email address (${roleLabel}). Creating duplicate accounts with the same email is not permitted. Please sign in instead.` 
    });
  }

  const userId = `usr-${Date.now().toString(36)}`;
  const assignedBadgeNumber = role === 'interpreter' ? generateNumericBadgeId() : null;

  const newUser = {
    id: userId,
    name,
    email: email.toLowerCase(),
    password: password || 'password123',
    role: role || 'host', // 'host' (Client/Payer), 'interpreter'
    badgeNumber: assignedBadgeNumber,
    interpreterBadgeId: assignedBadgeNumber,
    displayName: role === 'interpreter' ? `Interpreter #${assignedBadgeNumber}` : name,
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
      badgeNumber: assignedBadgeNumber,
      interpreterBadgeId: assignedBadgeNumber,
      displayName: `Interpreter #${assignedBadgeNumber}`,
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

  // Send automated email notification asynchronously
  if (role === 'host') {
    sendClientWelcomeEmail(newUser).catch(err => console.error('[Email Dispatch Error]', err.message));
  } else if (role === 'interpreter') {
    sendInterpreterApplicationReceivedEmail(newUser).catch(err => console.error('[Email Dispatch Error]', err.message));
  }

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

  // 1. Check default Owner / Admin Account (Ikram-ul-haq Mian)
  if (cleanEmail === DEFAULT_OWNER.email.toLowerCase() || cleanEmail === 'iksale9817@gmail.com' || cleanEmail === 'admin@linguabridge.com' || cleanEmail.includes('admin')) {
    const ownerUser = store.users.find(u => u.email.toLowerCase() === DEFAULT_OWNER.email.toLowerCase() || u.email.toLowerCase() === 'iksale9817@gmail.com') || DEFAULT_OWNER;
    return res.json({ 
      success: true, 
      user: { ...ownerUser, role: 'admin' },
      wallet: store.wallets[ownerUser.id] || { totalPaid: 1000, totalMinutesPurchased: 9999, minutesUsed: 0, minutesRemaining: 9999, billingType: 'unlimited_owner' }
    });
  }

  // 2. Check existing users in store
  const user = store.users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
  if (user) {
    if (user.role === 'interpreter') {
      ensureInterpreterBadge(user);
      user.displayName = `Interpreter #${user.badgeNumber}`;
    }
    const userWallet = store.wallets[user.id] || { totalPaid: 0, totalMinutesPurchased: 0, minutesUsed: 0, minutesRemaining: 0, billingType: 'prepaid' };
    return res.json({ success: true, user, wallet: userWallet });
  }

  // 3. Check if this email submitted an interpreter application
  const appItem = (store.interpreterApplications || []).find(a => a.email && a.email.toLowerCase() === cleanEmail);
  if (appItem) {
    const assignedBadge = appItem.badgeNumber || generateNumericBadgeId();
    appItem.badgeNumber = assignedBadge;
    appItem.interpreterBadgeId = assignedBadge;

    const newInterpUser = {
      id: appItem.id || `usr-${Date.now().toString(36)}`,
      name: appItem.name || 'Certified Interpreter',
      email: cleanEmail,
      role: 'interpreter',
      badgeNumber: assignedBadge,
      interpreterBadgeId: assignedBadge,
      displayName: `Interpreter #${assignedBadge}`,
      org: 'Certified Linguist Pool',
      primaryLang: appItem.primaryLang || (Array.isArray(appItem.languages) ? appItem.languages[0] : 'Spanish'),
      languages: appItem.languages || ['Spanish', 'English'],
      specialty: appItem.specialty || 'Medical / Healthcare',
      status: 'online',
      hourlyRate: appItem.hourlyRate || 8,
      minuteRate: appItem.minuteRate || 0.30,
      monthlySalary: appItem.monthlySalary || 1200,
      employmentType: appItem.employmentType || 'hourly',
      rateLabel: appItem.rateLabel || '$8/hr (Scheduled Shift)',
      createdAt: appItem.createdAt || new Date().toISOString()
    };
    store.users.push(newInterpUser);

    let existingInterp = store.interpreters.find(i => i.email.toLowerCase() === cleanEmail || i.userId === newInterpUser.id);
    if (!existingInterp) {
      store.interpreters.push({
        ...newInterpUser,
        badgeNumber: assignedBadge,
        interpreterBadgeId: assignedBadge,
        displayName: `Interpreter #${assignedBadge}`
      });
    }

    saveStore();
    return res.json({ success: true, user: newInterpUser, wallet: null });
  }

  // 4. Otherwise create clean Client / Hospital user
  const isInterpHint = cleanEmail.includes('interp') || cleanEmail.includes('linguist');
  const assignedBadge = isInterpHint ? generateNumericBadgeId() : null;
  const autoUser = {
    id: `usr-${Date.now().toString(36)}`,
    name: cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail,
    email: cleanEmail,
    role: isInterpHint ? 'interpreter' : 'host',
    badgeNumber: assignedBadge,
    interpreterBadgeId: assignedBadge,
    displayName: isInterpHint ? `Interpreter #${assignedBadge}` : (cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail),
    org: isInterpHint ? 'Certified Linguist Pool' : 'Client / Hospital Account',
    createdAt: new Date().toISOString()
  };
  store.users.push(autoUser);
  if (!isInterpHint) {
    store.wallets[autoUser.id] = { totalPaid: 0, totalMinutesPurchased: 0, minutesUsed: 0, minutesRemaining: 0, billingType: 'prepaid' };
  } else {
    store.interpreters.push({
      id: `int-${Date.now().toString(36)}`,
      userId: autoUser.id,
      name: autoUser.name,
      email: autoUser.email,
      badgeNumber: assignedBadge,
      interpreterBadgeId: assignedBadge,
      displayName: `Interpreter #${assignedBadge}`,
      primaryLang: 'Spanish',
      languages: ['Spanish', 'English'],
      status: 'online',
      rating: 5.0
    });
  }
  saveStore();
  return res.json({ 
    success: true, 
    user: autoUser, 
    wallet: store.wallets[autoUser.id] || null 
  });
});

// 3b. Switch user role (Self-service role fix: Client <-> Interpreter)
app.post('/api/auth/switch-role', (req, res) => {
  const { userId, targetRole } = req.body;
  if (!userId || !targetRole) {
    return res.status(400).json({ error: 'User ID and target role are required.' });
  }

  const user = store.users.find(u => u.id === userId || u.email?.toLowerCase() === userId?.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  user.role = targetRole === 'interpreter' ? 'interpreter' : 'host';
  user.org = user.role === 'interpreter' ? 'Certified Linguist Pool' : (user.org && user.org !== 'Certified Linguist Pool' ? user.org : 'Client / Organization Account');

  if (user.role === 'interpreter') {
    const badge = ensureInterpreterBadge(user);
    user.displayName = `Interpreter #${badge}`;

    let interp = store.interpreters.find(i => i.userId === user.id || i.email === user.email);
    if (!interp) {
      interp = {
        id: `int-${Date.now().toString(36)}`,
        userId: user.id,
        name: user.name,
        email: user.email,
        badgeNumber: badge,
        interpreterBadgeId: badge,
        displayName: `Interpreter #${badge}`,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000000)}?w=150&auto=format&fit=crop&q=80`,
        languages: [user.primaryLang || 'Spanish', 'English'],
        primaryLang: user.primaryLang || 'Spanish',
        specialties: [user.specialty || 'General / Customer Support'],
        status: 'online',
        rating: 5.0,
        totalCalls: 0,
        employmentType: 'hourly',
        hourlyRate: user.hourlyRate || 8,
        minuteRate: user.minuteRate || 0.30,
        monthlySalary: user.monthlySalary || 1200,
        rateLabel: user.rateLabel || '$8/hr (Scheduled Shift)',
        certifications: ['Certified Professional Linguist'],
        bio: `Certified ${user.primaryLang || 'Spanish'} professional linguist.`
      };
      store.interpreters.push(interp);
      io.emit('interpreter-registered', interp);
    } else {
      interp.badgeNumber = badge;
      interp.interpreterBadgeId = badge;
      interp.displayName = `Interpreter #${badge}`;
    }
  }

  if (user.role === 'host' && !store.wallets[user.id]) {
    store.wallets[user.id] = {
      userId: user.id,
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
    message: `Account role switched to ${user.role === 'interpreter' ? 'Certified Interpreter' : 'Client / Payer'}.`,
    user,
    wallet: store.wallets[user.id] || null
  });
});

// 3c. Interpreter Self Profile Update
app.post('/api/interpreter/profile', async (req, res) => {
  const { 
    userId, 
    email, 
    name, 
    phone, 
    bio, 
    primaryLang, 
    languages, 
    specialties, 
    shiftWindows,
    emergencyOnCall,
    hardwareAudit,
    avatar, 
    hourlyRate, 
    minuteRate, 
    employmentType 
  } = req.body;
  const targetEmail = (email || '').toLowerCase().trim();
  
  let user = store.users.find(u => (userId && u.id === userId) || (targetEmail && u.email && u.email.toLowerCase() === targetEmail));
  if (!user) {
    return res.status(404).json({ error: 'Interpreter profile not found.' });
  }

  if (name) user.name = name.trim();
  if (phone) user.phone = phone.trim();
  if (bio) user.bio = bio.trim();
  if (primaryLang) user.primaryLang = primaryLang;
  if (languages && Array.isArray(languages)) user.languages = languages;
  if (specialties && Array.isArray(specialties)) user.specialties = specialties;
  if (shiftWindows && Array.isArray(shiftWindows)) user.shiftWindows = shiftWindows;
  if (emergencyOnCall !== undefined) user.emergencyOnCall = Boolean(emergencyOnCall);
  if (hardwareAudit) user.hardwareAudit = hardwareAudit;
  if (avatar) user.avatar = avatar;
  if (hourlyRate !== undefined) user.hourlyRate = parseInt(hourlyRate) || user.hourlyRate;
  if (minuteRate !== undefined) user.minuteRate = parseFloat(minuteRate) || user.minuteRate;
  if (employmentType) user.employmentType = employmentType;

  // Also update store.interpreters
  let interp = store.interpreters.find(i => i.userId === user.id || (i.email && i.email.toLowerCase() === user.email.toLowerCase()));
  if (interp) {
    if (name) interp.name = user.name;
    if (avatar) interp.avatar = user.avatar;
    if (primaryLang) interp.primaryLang = user.primaryLang;
    if (languages) interp.languages = user.languages;
    if (specialties) interp.specialties = user.specialties;
    if (shiftWindows) interp.shiftWindows = user.shiftWindows;
    if (emergencyOnCall !== undefined) interp.emergencyOnCall = user.emergencyOnCall;
    if (hardwareAudit) interp.hardwareAudit = user.hardwareAudit;
    if (bio) interp.bio = user.bio;
  }

  if (db) {
    try {
      await db.collection('users').updateOne(
        { email: user.email.toLowerCase() },
        { $set: user },
        { upsert: true }
      );
    } catch (e) {
      console.error('Error updating profile in MongoDB:', e.message);
    }
  }

  saveStore();
  res.json({ success: true, user, message: 'Profile updated successfully!' });
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
  const assignedBadgeNumber = role === 'interpreter' ? generateNumericBadgeId() : null;

  const newUser = {
    id: userId,
    name,
    email: email.toLowerCase().trim(),
    password: password || 'admin123',
    role: role || 'host', // 'admin', 'interpreter', 'host', 'guest'
    badgeNumber: assignedBadgeNumber,
    interpreterBadgeId: assignedBadgeNumber,
    displayName: role === 'interpreter' ? `Interpreter #${assignedBadgeNumber}` : name,
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
      badgeNumber: assignedBadgeNumber,
      interpreterBadgeId: assignedBadgeNumber,
      displayName: `Interpreter #${assignedBadgeNumber}`,
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
      bio: `Professional ${primaryLang} interpreter verified for live assignments.`
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

  // Send automated email notification asynchronously
  if (role === 'interpreter') {
    sendInterpreterApprovedEmail({ ...newUser, ...newInterpreter }).catch(err => console.error('[Email Dispatch Error]', err.message));
  } else if (role === 'host') {
    sendClientWelcomeEmail(newUser).catch(err => console.error('[Email Dispatch Error]', err.message));
  }

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
    billingType,
    shiftSchedule,
    badgeNumber
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
  if (shiftSchedule) user.shiftSchedule = shiftSchedule;
  if (badgeNumber) {
    user.badgeNumber = badgeNumber.toString().replace(/\D/g, '');
    user.interpreterBadgeId = user.badgeNumber;
  }
  
  const resolvedType = user.employmentType || 'hourly';
  user.rateLabel = resolvedType === 'salary_base'
    ? `$${user.monthlySalary || 1200}/mo (Salary Base)`
    : resolvedType === 'per_minute'
      ? `$${(user.minuteRate || 0.30).toFixed(2)}/min (Live Talk)`
      : `$${user.hourlyRate || 8}/hr (Scheduled Shift)`;

  if (billingType) user.billingType = billingType;

  // Update or create corresponding interpreter profile if role is interpreter
  let interp = store.interpreters.find(i => i.userId === id || i.id === id || i.email === user.email);
  if (user.role === 'interpreter') {
    const assignedBadge = ensureInterpreterBadge(user);
    user.displayName = `Interpreter #${assignedBadge}`;

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
      if (shiftSchedule) interp.shiftSchedule = shiftSchedule;
      interp.badgeNumber = assignedBadge;
      interp.interpreterBadgeId = assignedBadge;
      interp.displayName = `Interpreter #${assignedBadge}`;
      interp.rateLabel = user.rateLabel;
    } else {
      interp = {
        id: `int-${Date.now().toString(36)}`,
        userId: user.id,
        name: user.name,
        email: user.email,
        badgeNumber: assignedBadge,
        interpreterBadgeId: assignedBadge,
        displayName: `Interpreter #${assignedBadge}`,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000000)}?w=150&auto=format&fit=crop&q=80`,
        languages: [user.primaryLang || 'Spanish', 'English'],
        primaryLang: user.primaryLang || 'Spanish',
        specialties: [user.specialty || 'General / Customer Support'],
        status: 'online',
        rating: 5.0,
        totalCalls: 0,
        employmentType: resolvedType,
        hourlyRate: user.hourlyRate || 8,
        minuteRate: user.minuteRate || 0.30,
        monthlySalary: user.monthlySalary || 1200,
        rateLabel: user.rateLabel,
        certifications: ['Certified Professional Linguist'],
        bio: `Certified ${user.primaryLang || 'Spanish'} professional linguist.`
      };
      store.interpreters.push(interp);
      io.emit('interpreter-registered', interp);
    }
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

// Admin: Dispatch Password Reset / Account Credentials Email
app.post('/api/admin/users/:id/send-credentials', async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  const user = store.users.find(u => u.id === id || (u.email && req.body.email && u.email.toLowerCase() === req.body.email.toLowerCase()));
  if (!user) {
    return res.status(404).json({ error: 'User account not found' });
  }

  if (newPassword && newPassword.trim()) {
    user.password = newPassword.trim();
    saveStore();
  }

  const passToSend = user.password || 'interp2026!';
  const badgeNumber = user.badgeNumber || user.interpreterBadgeId || null;

  try {
    const emailResult = await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      role: user.role,
      password: passToSend,
      badgeNumber
    });

    res.json({
      success: true,
      message: `Credentials and password recovery email successfully sent to ${user.email}`,
      email: user.email,
      password: passToSend,
      emailResult
    });
  } catch (err) {
    console.error('Error dispatching password recovery email:', err.message);
    res.status(500).json({ error: 'Failed to send credentials email' });
  }
});

// Public: Forgot Password Self-Service Recovery Request
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  const query = email.toLowerCase().trim();
  const user = store.users.find(u => u.email && u.email.toLowerCase() === query);

  if (!user) {
    // Return friendly generic message for security
    return res.json({ 
      success: true, 
      message: 'If an active account exists for this email, your login credentials have been dispatched.' 
    });
  }

  const passToSend = user.password || 'interp2026!';
  const badgeNumber = user.badgeNumber || user.interpreterBadgeId || null;

  try {
    await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      role: user.role,
      password: passToSend,
      badgeNumber
    });

    res.json({
      success: true,
      message: `Account credentials and password recovery instructions have been emailed to ${user.email}.`
    });
  } catch (err) {
    console.error('Error in auth forgot password dispatch:', err.message);
    res.json({
      success: true,
      message: 'If an active account exists for this email, your login credentials have been dispatched.'
    });
  }
});

// Admin: Get all users with full synchronized metadata
app.get('/api/admin/users', (req, res) => {
  const usersWithWallets = (store.users || []).map(u => ({
    ...u,
    wallet: store.wallets[u.id] || u.wallet || { totalPaid: 0, totalMinutesPurchased: 0, minutesUsed: 0, minutesRemaining: 0, billingType: u.billingType || 'prepaid' }
  }));
  res.json(usersWithWallets);
});

// Admin: Create new user account
app.post('/api/admin/users', async (req, res) => {
  const {
    name,
    email,
    password = 'pass123',
    role = 'host',
    org = '',
    primaryLang = 'Spanish',
    languages = ['Spanish', 'English'],
    specialty = 'General',
    employmentType = 'hourly',
    hourlyRate = 8,
    minuteRate = 0.30,
    monthlySalary = 1200,
    rateLabel = '$8/hr',
    initialMinutes = 120,
    billingType = 'prepaid',
    shiftSchedule
  } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const userId = `usr-${Date.now().toString(36)}`;
  const assignedBadge = role === 'interpreter' ? generateNumericBadgeId() : null;

  const newUser = {
    id: userId,
    name: name.trim(),
    email: cleanEmail,
    password,
    role,
    org: org || (role === 'admin' ? 'IK Enterprises Operations' : role === 'interpreter' ? 'Certified Linguist Pool' : 'IK Enterprises Client'),
    primaryLang,
    languages: Array.isArray(languages) ? languages : [primaryLang, 'English'],
    specialty,
    employmentType,
    hourlyRate: parseInt(hourlyRate) || 8,
    minuteRate: parseFloat(minuteRate) || 0.30,
    monthlySalary: parseInt(monthlySalary) || 1200,
    rateLabel,
    badgeNumber: assignedBadge,
    interpreterBadgeId: assignedBadge,
    displayName: assignedBadge ? `Interpreter #${assignedBadge}` : name.trim(),
    shiftSchedule: shiftSchedule || {
      shiftType: employmentType === 'per_minute' ? 'open_unlimited' : 'fixed_9h',
      dailyHours: employmentType === 'per_minute' ? 'Unlimited' : 9,
      timeZone: 'PKT (UTC+5:00 - Pakistan / South Asia)',
      startTime: '09:00',
      endTime: '18:00',
      scheduleLabel: '9 Hours Daily (09:00 - 18:00 PKT)'
    },
    wallet: {
      userId,
      totalPaid: role === 'host' ? (initialMinutes * 0.90) : 0,
      totalMinutesPurchased: role === 'host' ? initialMinutes : 0,
      minutesUsed: 0,
      minutesRemaining: role === 'host' ? initialMinutes : 0,
      billingType
    },
    createdAt: new Date().toISOString()
  };

  store.users.unshift(newUser);
  store.wallets[userId] = newUser.wallet;

  if (role === 'interpreter') {
    store.interpreters.push({
      ...newUser,
      isVerified: true
    });
  }

  if (db) {
    try {
      await db.collection('users').updateOne({ id: userId }, { $set: newUser }, { upsert: true });
      await db.collection('wallets').updateOne({ userId }, { $set: newUser.wallet }, { upsert: true });
      if (role === 'interpreter') {
        await db.collection('interpreters').updateOne({ id: userId }, { $set: newUser }, { upsert: true });
      }
    } catch (e) {
      console.error('Error saving user in Mongo:', e.message);
    }
  }

  saveStore();
  io.emit('user-account-created', newUser);
  res.json({ success: true, user: newUser });
});

// Admin: Update user profile, rates, schedule, and languages
app.put('/api/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  const userIdx = store.users.findIndex(u => u.id === id);
  if (userIdx === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const existing = store.users[userIdx];
  const {
    name,
    email,
    password,
    org,
    role,
    primaryLang,
    languages,
    specialty,
    employmentType,
    hourlyRate,
    minuteRate,
    monthlySalary,
    rateLabel,
    shiftSchedule,
    minutesRemaining,
    totalPaid,
    billingType
  } = req.body;

  const cleanEmail = (email || existing.email).toLowerCase().trim();
  const resolvedLanguages = Array.isArray(languages) && languages.length > 0 
    ? languages 
    : (primaryLang ? [primaryLang] : (existing.languages || [existing.primaryLang || 'Spanish']));
  const resolvedPrimaryLang = primaryLang || resolvedLanguages[0] || existing.primaryLang || 'Spanish';

  const updatedUser = {
    ...existing,
    name: name !== undefined ? name.trim() : existing.name,
    email: cleanEmail,
    password: password !== undefined ? password : existing.password,
    org: org !== undefined ? org : existing.org,
    role: role !== undefined ? role : existing.role,
    primaryLang: resolvedPrimaryLang,
    languages: resolvedLanguages,
    specialty: specialty !== undefined ? specialty : existing.specialty,
    employmentType: employmentType !== undefined ? employmentType : existing.employmentType,
    hourlyRate: hourlyRate !== undefined ? parseInt(hourlyRate) : existing.hourlyRate,
    minuteRate: minuteRate !== undefined ? parseFloat(minuteRate) : existing.minuteRate,
    monthlySalary: monthlySalary !== undefined ? parseInt(monthlySalary) : existing.monthlySalary,
    rateLabel: rateLabel !== undefined ? rateLabel : existing.rateLabel,
    shiftSchedule: shiftSchedule !== undefined ? shiftSchedule : existing.shiftSchedule,
    updatedAt: new Date().toISOString()
  };

  store.users[userIdx] = updatedUser;

  // Update wallet if provided
  if (!store.wallets[id]) {
    store.wallets[id] = { userId: id, totalPaid: 0, totalMinutesPurchased: 0, minutesUsed: 0, minutesRemaining: 0, billingType: billingType || 'prepaid' };
  }
  if (minutesRemaining !== undefined) store.wallets[id].minutesRemaining = parseInt(minutesRemaining);
  if (totalPaid !== undefined) store.wallets[id].totalPaid = parseFloat(totalPaid);
  if (billingType !== undefined) store.wallets[id].billingType = billingType;
  updatedUser.wallet = store.wallets[id];

  // Update interpreter collection
  const interpIdx = store.interpreters.findIndex(i => i.id === id || (i.email && i.email.toLowerCase() === cleanEmail));
  if (interpIdx >= 0) {
    store.interpreters[interpIdx] = {
      ...store.interpreters[interpIdx],
      ...updatedUser,
      isVerified: true
    };
  }

  // Update matching application
  store.interpreterApplications.forEach(a => {
    if (a.id === id || (a.email && a.email.toLowerCase().trim() === cleanEmail)) {
      a.name = updatedUser.name;
      a.email = updatedUser.email;
      a.primaryLang = resolvedPrimaryLang;
      a.languages = resolvedLanguages;
      a.specialty = updatedUser.specialty;
      a.employmentType = updatedUser.employmentType;
      a.hourlyRate = updatedUser.hourlyRate;
      a.minuteRate = updatedUser.minuteRate;
      a.monthlySalary = updatedUser.monthlySalary;
      a.rateLabel = updatedUser.rateLabel;
      a.shiftSchedule = updatedUser.shiftSchedule;
    }
  });

  if (db) {
    try {
      await db.collection('users').updateOne({ id }, { $set: updatedUser }, { upsert: true });
      await db.collection('wallets').updateOne({ userId: id }, { $set: store.wallets[id] }, { upsert: true });
      if (existing.role === 'interpreter' || updatedUser.role === 'interpreter') {
        await db.collection('interpreters').updateOne({ $or: [{ id }, { email: cleanEmail }] }, { $set: updatedUser }, { upsert: true });
      }
      await db.collection('interpreter_applications').updateMany(
        { $or: [{ id }, { email: cleanEmail }] },
        { 
          $set: { 
            name: updatedUser.name, 
            email: updatedUser.email, 
            primaryLang: resolvedPrimaryLang, 
            languages: resolvedLanguages,
            hourlyRate: updatedUser.hourlyRate,
            minuteRate: updatedUser.minuteRate,
            monthlySalary: updatedUser.monthlySalary,
            rateLabel: updatedUser.rateLabel,
            shiftSchedule: updatedUser.shiftSchedule
          } 
        }
      );
    } catch (e) {
      console.error('Error updating user in Mongo:', e.message);
    }
  }

  saveStore();
  io.emit('user-account-updated', updatedUser);
  res.json({ success: true, user: updatedUser, wallet: store.wallets[id] });
});

// Admin: Update languages on an interpreter application directly
app.put('/api/admin/interpreter-applications/:id/languages', async (req, res) => {
  const { id } = req.params;
  const { languages, primaryLang } = req.body;

  if (!Array.isArray(languages)) {
    return res.status(400).json({ error: 'Languages must be an array' });
  }

  const app = store.interpreterApplications.find(a => a.id === id);
  if (!app) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const cleanEmail = (app.email || '').toLowerCase().trim();
  const resolvedPrimary = primaryLang || languages[0] || app.primaryLang;

  app.languages = languages;
  app.primaryLang = resolvedPrimary;

  // Also update user if already provisioned
  store.users.forEach(u => {
    if (u.id === id || (cleanEmail && u.email && u.email.toLowerCase().trim() === cleanEmail)) {
      u.languages = languages;
      u.primaryLang = resolvedPrimary;
    }
  });
  store.interpreters.forEach(i => {
    if (i.id === id || (cleanEmail && i.email && i.email.toLowerCase().trim() === cleanEmail)) {
      i.languages = languages;
      i.primaryLang = resolvedPrimary;
    }
  });

  if (db) {
    try {
      await db.collection('interpreter_applications').updateMany(
        { $or: [{ id }, { email: cleanEmail }] },
        { $set: { languages, primaryLang: resolvedPrimary } }
      );
      await db.collection('users').updateMany(
        { $or: [{ id }, { email: cleanEmail }] },
        { $set: { languages, primaryLang: resolvedPrimary } }
      );
      await db.collection('interpreters').updateMany(
        { $or: [{ id }, { email: cleanEmail }] },
        { $set: { languages, primaryLang: resolvedPrimary } }
      );
    } catch (e) {
      console.error('Error updating languages in Mongo:', e.message);
    }
  }

  saveStore();
  res.json({ success: true, application: app });
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
app.delete('/api/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  const user = store.users.find(u => u.id === id);
  if (user && user.isOwner) {
    return res.status(403).json({ error: 'Master Platform Owner account cannot be deleted.' });
  }

  store.users = store.users.filter(u => u.id !== id);
  store.interpreters = store.interpreters.filter(i => i.userId !== id && i.id !== id);
  delete store.wallets[id];

  if (db) {
    try {
      await db.collection('users').deleteOne({ id });
      await db.collection('wallets').deleteOne({ userId: id });
    } catch (e) {
      console.error('Error deleting user from MongoDB:', e.message);
    }
  }

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
    timeZone = 'PKT (UTC+5:00 - Pakistan / South Asia)',
    preferredShiftType = 'fixed_9h',
    preferredDailyHours = 9,
    primaryLang = 'Spanish',
    languages = ['Spanish', 'English'],
    specialties = ['General / Customer Support'],
    certifications = ['Certified Professional Linguist'],
    experienceYears = 3,
    employmentType = 'hourly', // 'salary_base', 'hourly', 'per_minute'
    hourlyRate = 0,
    minuteRate = 0,
    monthlySalary = 0,
    rateLabel = '',
    bio = '',
    cvFileName = '',
    cvFileData = '',
    docFileName = '',
    docFileData = '',
    supportingDocs = [],
    shiftSchedule = null,
    shiftWindows = ['shift_a', 'shift_b'],
    emergencyOnCall = true,
    hardwareAudit = { headsetVerified: true, internetVerified: true, privateOfficeSetting: true }
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Full name and email are required.' });
  }

  // Strict duplicate check across users & applications
  const cleanEmail = email.toLowerCase().trim();
  const existingUser = store.users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
  const existingApp = (store.interpreterApplications || []).find(a => a.email && a.email.toLowerCase() === cleanEmail);

  if (existingUser) {
    const roleLabel = existingUser.role === 'admin' ? 'Administrator' : existingUser.role === 'interpreter' ? 'Active Interpreter' : 'Client';
    return res.status(400).json({ 
      error: `An active account with this email address already exists as an ${roleLabel}. Duplicate accounts with the same email are not permitted. Please sign in instead.` 
    });
  }

  if (existingApp) {
    return res.status(400).json({ 
      error: 'An interpreter application for this email is already on file with IK Enterprises and is currently in the review queue. Please sign in or contact administration.' 
    });
  }

  const parsedHourly = parseInt(hourlyRate) !== undefined && !isNaN(parseInt(hourlyRate)) ? parseInt(hourlyRate) : 0;
  const parsedMinute = parseFloat(minuteRate) !== undefined && !isNaN(parseFloat(minuteRate)) ? parseFloat(minuteRate) : 0;
  const parsedMonthly = parseInt(monthlySalary) !== undefined && !isNaN(parseInt(monthlySalary)) ? parseInt(monthlySalary) : 0;

  const resolvedRateLabel = rateLabel || (
    employmentType === 'salary_base' 
      ? `$${parsedMonthly}/mo (Salary Base)`
      : employmentType === 'per_minute' 
        ? `$${parsedMinute.toFixed(2)}/min (Live Talk)`
        : `$${parsedHourly}/hr (Scheduled Shift)`
  );

  const resolvedSchedule = shiftSchedule || {
    shiftType: preferredShiftType || (employmentType === 'per_minute' ? 'open_unlimited' : 'fixed_9h'),
    dailyHours: preferredDailyHours || (preferredShiftType === 'open_unlimited' ? 'Unlimited' : 9),
    timeZone: timeZone || 'PKT (UTC+5:00 - Pakistan / South Asia)',
    startTime: '09:00',
    endTime: '18:00',
    scheduleLabel: (preferredShiftType === 'open_unlimited' || employmentType === 'per_minute')
      ? 'Open & Flexible (Unlimited On-Demand 24/7)'
      : `${preferredDailyHours || 9} Hours Daily (09:00 - 18:00 ${timeZone?.split(' ')?.[0] || 'PKT'})`
  };

  const assignedBadgeNumber = generateNumericBadgeId();

  const newApp = {
    id: `app-${Date.now().toString(36)}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    country: country.trim(),
    timeZone: timeZone,
    badgeNumber: assignedBadgeNumber,
    interpreterBadgeId: assignedBadgeNumber,
    displayName: `Interpreter #${assignedBadgeNumber}`,
    preferredShiftType: preferredShiftType,
    preferredDailyHours: preferredDailyHours,
    shiftWindows: Array.isArray(shiftWindows) && shiftWindows.length > 0 ? shiftWindows : ['shift_a', 'shift_b'],
    emergencyOnCall: Boolean(emergencyOnCall),
    hardwareAudit: hardwareAudit || { headsetVerified: true, internetVerified: true, privateOfficeSetting: true },
    shiftSchedule: resolvedSchedule,
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
    bio: bio.trim() || `Certified ${primaryLang} professional linguist ready for live assignments.`,
    cvFileName: cvFileName || 'Resume_CV.pdf',
    cvFileData: cvFileData || null,
    docFileName: docFileName || 'Credentials_Certificate.pdf',
    docFileData: docFileData || null,
    supportingDocs: Array.isArray(supportingDocs) ? supportingDocs : (docFileName ? [{ name: docFileName, data: docFileData }] : []),
    status: 'pending', // 'pending', 'approved', 'rejected'
    adminNotes: '',
    submittedAt: new Date().toISOString()
  };

  store.interpreterApplications.unshift(newApp);

  saveStore();
  io.emit('new-interpreter-application', newApp);

  // Send confirmation email to applicant asynchronously
  sendInterpreterApplicationReceivedEmail(newApp).catch(err => console.error('[Email Dispatch Error]', err.message));

  res.json({
    success: true,
    message: 'Interpreter application submitted successfully. Our verification team will review your CV and credentials.',
    application: newApp
  });
});

// 2. Admin: Get all applications (Ultra-fast lightweight payload synced with active users)
app.get('/api/admin/interpreter-applications', (req, res) => {
  store.interpreterApplications = deduplicateApplications(store.interpreterApplications);

  const cleanList = store.interpreterApplications.map(app => {
    const { cvFileData, docFileData, supportingDocs, ...rest } = app;
    const cleanEmail = (app.email || '').toLowerCase().trim();
    const existingUser = (store.users || []).find(u => 
      u.role === 'interpreter' && 
      ((u.email && u.email.toLowerCase().trim() === cleanEmail) || 
       (u.id && app.id && u.id === app.id) ||
       (u.badgeNumber && app.badgeNumber && u.badgeNumber.toString() === app.badgeNumber.toString()))
    );

    const isApproved = Boolean(existingUser || app.status === 'approved');
    const badgeNumber = (existingUser && (existingUser.badgeNumber || existingUser.interpreterBadgeId)) || app.badgeNumber || app.interpreterBadgeId || null;

    return {
      ...rest,
      status: isApproved ? 'approved' : (app.status || 'pending'),
      badgeNumber,
      interpreterBadgeId: badgeNumber,
      displayName: badgeNumber ? `Interpreter #${badgeNumber}` : (app.displayName || (app.name ? app.name : 'Interpreter')),
      hasCv: Boolean(cvFileData || app.cvFileName),
      hasDoc: Boolean(docFileData || app.docFileName)
    };
  });
  res.json(cleanList);
});

// Admin: Download/Preview specific applicant document on demand
app.get('/api/admin/interpreter-applications/:id/file/:fileType', (req, res) => {
  const { id, fileType } = req.params;
  const app = (store.interpreterApplications || []).find(a => a.id === id);
  if (!app) return res.status(404).json({ error: 'Application not found' });

  if (fileType === 'cv') {
    res.json({ fileName: app.cvFileName || 'Resume.pdf', fileData: app.cvFileData || null });
  } else {
    res.json({ fileName: app.docFileName || 'Certificate.pdf', fileData: app.docFileData || null });
  }
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
    adminNotes,
    shiftSchedule
  } = req.body;

  let appItem = store.interpreterApplications.find(a => a.id === id);
  if (!appItem) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  const cleanEmail = (appItem.email || '').toLowerCase().trim();
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

  const resolvedShiftSchedule = shiftSchedule || appItem.shiftSchedule || {
    shiftType: finalType === 'per_minute' ? 'open_unlimited' : 'fixed_9h',
    dailyHours: finalType === 'per_minute' ? 'Unlimited' : 9,
    timeZone: 'PKT (UTC+5:00 - Pakistan / South Asia)',
    startTime: '09:00',
    endTime: '18:00',
    scheduleLabel: finalType === 'per_minute' 
      ? 'Open & Flexible (Unlimited On-Demand 24/7)' 
      : '9 Hours Daily (09:00 - 18:00 PKT / UTC+5)'
  };

  // Generate or preserve assigned pure numeric ID
  let existingUser = store.users.find(u => u.email.toLowerCase().trim() === cleanEmail);
  const assignedBadgeNumber = appItem.badgeNumber || (existingUser && existingUser.badgeNumber) || generateNumericBadgeId();

  // Mark all matching application entries as approved
  store.interpreterApplications.forEach(a => {
    if (a.id === id || (a.email && a.email.toLowerCase().trim() === cleanEmail)) {
      a.status = 'approved';
      a.badgeNumber = assignedBadgeNumber;
      a.interpreterBadgeId = assignedBadgeNumber;
      a.displayName = `Interpreter #${assignedBadgeNumber}`;
      a.employmentType = finalType;
      a.hourlyRate = finalHourlyRate;
      a.minuteRate = finalMinuteRate;
      a.monthlySalary = finalMonthlySalary;
      a.rateLabel = finalRateLabel;
      a.shiftSchedule = resolvedShiftSchedule;
      a.adminNotes = adminNotes || 'Approved by IK Enterprises Administration';
      a.approvedAt = new Date().toISOString();
    }
  });

  // Consolidate in-memory store
  store.interpreterApplications = deduplicateApplications(store.interpreterApplications);
  appItem = store.interpreterApplications.find(a => a.email && a.email.toLowerCase().trim() === cleanEmail) || appItem;

  // Create or Update Active User Account
  const userId = existingUser ? existingUser.id : `usr-${Date.now().toString(36)}`;

  const userAccount = {
    id: userId,
    name: appItem.name,
    email: cleanEmail,
    password: passwordToSet,
    role: 'interpreter',
    badgeNumber: assignedBadgeNumber,
    interpreterBadgeId: assignedBadgeNumber,
    displayName: `Interpreter #${assignedBadgeNumber}`,
    org: finalType === 'salary_base' ? 'In-House Linguist Team (Salaried)' : 'Certified Linguist Pool (Verified)',
    primaryLang: appItem.primaryLang,
    languages: appItem.languages,
    specialty: appItem.specialties?.[0] || 'General / Customer Support',
    employmentType: finalType,
    hourlyRate: finalHourlyRate,
    minuteRate: finalMinuteRate,
    monthlySalary: finalMonthlySalary,
    rateLabel: finalRateLabel,
    shiftSchedule: resolvedShiftSchedule,
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
  let existingInterp = store.interpreters.find(i => i.email.toLowerCase().trim() === cleanEmail || i.userId === userId);
  const interpProfile = {
    id: existingInterp ? existingInterp.id : `int-${Date.now().toString(36)}`,
    userId: userId,
    name: appItem.name,
    email: cleanEmail,
    badgeNumber: assignedBadgeNumber,
    interpreterBadgeId: assignedBadgeNumber,
    displayName: `Interpreter #${assignedBadgeNumber}`,
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
    shiftSchedule: resolvedShiftSchedule,
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
    to: cleanEmail,
    subject: `Welcome to LinguaBridge - Your Certified Interpreter ID is #${assignedBadgeNumber} (Approved & Active)`,
    sentAt: new Date().toISOString(),
    recipientName: appItem.name,
    officialInterpreterId: assignedBadgeNumber,
    interpreterBadgeId: assignedBadgeNumber,
    badgeNumber: assignedBadgeNumber,
    loginEmail: cleanEmail,
    temporaryPassword: passwordToSet,
    employmentType: finalType === 'salary_base' ? 'Salary Base (Fixed Full-Time)' : finalType === 'per_minute' ? 'Per-Minute Talk Rate (On-Demand Flex)' : 'Hourly Rate (Scheduled Shifts)',
    compensationTerms: finalRateLabel,
    shiftSchedule: resolvedShiftSchedule.scheduleLabel || (resolvedShiftSchedule.shiftType === 'open_unlimited' ? 'Open & Flexible (Unlimited On-Demand 24/7)' : `${resolvedShiftSchedule.dailyHours} Hours Daily (${resolvedShiftSchedule.startTime} - ${resolvedShiftSchedule.endTime} ${resolvedShiftSchedule.timeZone})`),
    timeZone: resolvedShiftSchedule.timeZone || 'UTC',
    portalUrl: 'https://linguabridge-portal.onrender.com'
  };

  appItem.emailDispatch = emailDispatch;

  // Clean up duplicate application records in MongoDB collection
  if (db && cleanEmail) {
    db.collection('interpreter_applications').deleteMany({
      email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      id: { $ne: appItem.id }
    }).catch(() => {});
  }

  saveStore();
  io.emit('interpreter-registered', interpProfile);

  // Send official approval and activation email to interpreter asynchronously
  sendInterpreterApprovedEmail({
    ...interpProfile,
    email: cleanEmail,
    name: appItem.name,
    badgeNumber: assignedBadgeNumber,
    primaryLang: appItem.primaryLang,
    languages: appItem.languages,
    specialty: appItem.specialties?.[0],
    hourlyRate: finalHourlyRate,
    minuteRate: finalMinuteRate,
    monthlySalary: finalMonthlySalary,
    employmentType: finalType,
    password: passwordToSet
  }).catch(err => console.error('[Email Dispatch Error]', err.message));

  res.json({
    success: true,
    message: `Account approved and provisioned for ${appItem.name}. Assigned Numeric ID: #${assignedBadgeNumber}. Login credentials generated.`,
    user: userAccount,
    interpreter: interpProfile,
    application: appItem,
    emailDispatch
  });
});

// Admin: Revert Approved Application back to Pending Review
app.post('/api/admin/interpreter-applications/:id/revert-to-pending', async (req, res) => {
  const { id } = req.params;
  const appItem = store.interpreterApplications.find(a => a.id === id);
  if (!appItem) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  const cleanEmail = (appItem.email || '').toLowerCase().trim();

  // Reset all matching applications to pending
  store.interpreterApplications.forEach(a => {
    if (a.id === id || (cleanEmail && a.email && a.email.toLowerCase().trim() === cleanEmail)) {
      a.status = 'pending';
      delete a.approvedAt;
      delete a.emailDispatch;
    }
  });

  // Remove provisioned active user account
  if (cleanEmail) {
    store.users = store.users.filter(u => !(u.email && u.email.toLowerCase().trim() === cleanEmail && u.role === 'interpreter'));
    store.interpreters = store.interpreters.filter(i => !(i.email && i.email.toLowerCase().trim() === cleanEmail));

    if (db) {
      try {
        await db.collection('users').deleteMany({ email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'), role: 'interpreter' } });
        await db.collection('interpreters').deleteMany({ email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
        await db.collection('interpreter_applications').updateMany(
          { email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
          { $set: { status: 'pending' }, $unset: { approvedAt: '', emailDispatch: '' } }
        );
      } catch (e) {
        console.error('Error reverting application in MongoDB:', e.message);
      }
    }
  }

  store.interpreterApplications = deduplicateApplications(store.interpreterApplications);
  saveStore();

  res.json({
    success: true,
    message: `Application for ${appItem.name} has been reverted back to Pending Review.`,
    application: appItem
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

  const cleanEmail = (appItem.email || '').toLowerCase().trim();
  store.interpreterApplications.forEach(a => {
    if (a.id === id || (cleanEmail && a.email && a.email.toLowerCase().trim() === cleanEmail)) {
      a.status = 'rejected';
      a.adminNotes = rejectReason || 'Application does not meet current credentialing requirements.';
      a.rejectedAt = new Date().toISOString();
    }
  });

  store.interpreterApplications = deduplicateApplications(store.interpreterApplications);
  saveStore();
  res.json({ success: true, message: 'Application status updated to rejected.', application: appItem });
});

// 5. Admin: Delete Application
app.delete('/api/admin/interpreter-applications/:id', async (req, res) => {
  const { id } = req.params;
  const targetApp = store.interpreterApplications.find(a => a.id === id);
  const cleanEmail = targetApp?.email ? targetApp.email.toLowerCase().trim() : null;

  store.interpreterApplications = store.interpreterApplications.filter(a => 
    a.id !== id && !(cleanEmail && a.email && a.email.toLowerCase().trim() === cleanEmail)
  );
  if (db) {
    try {
      if (cleanEmail) {
        await db.collection('interpreter_applications').deleteMany({
          email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });
      } else {
        await db.collection('interpreter_applications').deleteOne({ id });
      }
    } catch (e) {
      console.error('Error deleting application from MongoDB:', e.message);
    }
  }
  saveStore();
  res.json({ success: true, message: 'Application deleted.' });
});

// ==========================================
// 💬 CENTRAL INQUIRIES & AI MESSAGES BOX API
// ==========================================

// 1. Get all inquiries & support conversations
app.get('/api/inquiries', async (req, res) => {
  try {
    if (db) {
      const mongoInquiries = await db.collection('inquiries').find({}).toArray();
      if (mongoInquiries && mongoInquiries.length > 0) {
        const cleanInqs = mongoInquiries.map(({ _id, ...inq }) => inq);
        const merged = [...(store.inquiries || [])];
        cleanInqs.forEach(mInq => {
          const idx = merged.findIndex(i => i.id === mInq.id);
          if (idx >= 0) {
            merged[idx] = { ...merged[idx], ...mInq };
          } else {
            merged.unshift(mInq);
          }
        });
        store.inquiries = merged;
      }
    }
  } catch (err) {
    console.warn('MongoDB inquiry fetch warning:', err.message);
  }
  res.json(store.inquiries || []);
});

// 2. Submit new inquiry or save AI bot conversation
app.post('/api/inquiries', (req, res) => {
  const { 
    id,
    userName = 'Guest Visitor', 
    userEmail = '', 
    userPhone = '',
    phone = '',
    userRole = 'guest', 
    subject = 'General Platform Inquiry', 
    message = '', 
    category = 'General Support',
    messages = [] 
  } = req.body;

  const resolvedPhone = (userPhone || phone || '').trim();

  if (!message && (!messages || messages.length === 0)) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  if (!Array.isArray(store.inquiries)) {
    store.inquiries = [];
  }

  const targetId = id || `inq-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
  const existingIdx = store.inquiries.findIndex(i => i.id === targetId);

  const inqData = {
    id: targetId,
    userName: userName.trim() || (existingIdx >= 0 ? store.inquiries[existingIdx].userName : 'Guest Visitor'),
    userEmail: userEmail.trim() || (existingIdx >= 0 ? store.inquiries[existingIdx].userEmail : ''),
    userPhone: resolvedPhone || (existingIdx >= 0 ? store.inquiries[existingIdx].userPhone : ''),
    userRole: userRole.toLowerCase(),
    subject: subject.trim() || (existingIdx >= 0 ? store.inquiries[existingIdx].subject : 'General Platform Inquiry'),
    message: message.trim() || (messages[messages.length - 1]?.text || 'Inquiry conversation'),
    category: category,
    status: existingIdx >= 0 ? store.inquiries[existingIdx].status : 'new',
    adminReply: existingIdx >= 0 ? store.inquiries[existingIdx].adminReply : '',
    createdAt: existingIdx >= 0 ? store.inquiries[existingIdx].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: Array.isArray(messages) && messages.length > 0 ? messages : [
      { sender: 'user', text: message.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), createdAt: new Date().toISOString() }
    ]
  };

  if (existingIdx >= 0) {
    store.inquiries[existingIdx] = inqData;
  } else {
    store.inquiries.unshift(inqData);
  }

  saveStore();
  io.emit(existingIdx >= 0 ? 'inquiry-updated' : 'new-inquiry', inqData);

  res.json({
    success: true,
    message: 'Inquiry saved successfully.',
    inquiry: inqData
  });
});

// 3. Update inquiry status or send admin reply
app.put('/api/inquiries/:id', (req, res) => {
  const { id } = req.params;
  const { status, adminReply, messages } = req.body;

  const inq = (store.inquiries || []).find(i => i.id === id);
  if (!inq) {
    return res.status(404).json({ error: 'Inquiry record not found.' });
  }

  if (status) inq.status = status;
  if (adminReply !== undefined) inq.adminReply = adminReply;
  if (Array.isArray(messages)) inq.messages = messages;
  inq.updatedAt = new Date().toISOString();

  // If admin provided a reply, send an email to the user so they receive it offline
  if (adminReply && inq.userEmail) {
    sendInquiryReplyEmail(inq, adminReply).catch(err => {
      console.error('[Email Reply Dispatch Warning]:', err.message);
    });
  }

  saveStore();
  io.emit('inquiry-updated', inq);

  res.json({ success: true, inquiry: inq });
});

// 4. Delete inquiry permanently
app.delete('/api/inquiries/:id', async (req, res) => {
  const { id } = req.params;
  store.inquiries = (store.inquiries || []).filter(i => i.id !== id);
  if (db) {
    try {
      await db.collection('inquiries').deleteOne({ id });
    } catch (e) {
      console.error('Error deleting inquiry from MongoDB:', e.message);
    }
  }
  saveStore();
  io.emit('inquiry-deleted', { id });
  res.json({ success: true, message: 'Inquiry record deleted permanently.' });
});

// 5. Bulk Clear / Purge Inquiries
app.post('/api/inquiries/clear', async (req, res) => {
  const { type = 'all', ids = [] } = req.body;
  if (Array.isArray(ids) && ids.length > 0) {
    store.inquiries = (store.inquiries || []).filter(i => !ids.includes(i.id));
    if (db) {
      try {
        await db.collection('inquiries').deleteMany({ id: { $in: ids } });
      } catch (e) {}
    }
  } else if (type === 'ai_chats') {
    const idsToDelete = (store.inquiries || []).filter(i => i.category === 'AI Chat Assistant' || (i.subject && i.subject.startsWith('AI Chat:'))).map(i => i.id);
    store.inquiries = (store.inquiries || []).filter(i => !idsToDelete.includes(i.id));
    if (db) {
      try {
        await db.collection('inquiries').deleteMany({ id: { $in: idsToDelete } });
      } catch (e) {}
    }
  } else if (type === 'resolved') {
    const idsToDelete = (store.inquiries || []).filter(i => i.status === 'resolved').map(i => i.id);
    store.inquiries = (store.inquiries || []).filter(i => !idsToDelete.includes(i.id));
    if (db) {
      try {
        await db.collection('inquiries').deleteMany({ id: { $in: idsToDelete } });
      } catch (e) {}
    }
  } else if (type === 'all') {
    store.inquiries = [];
    if (db) {
      try {
        await db.collection('inquiries').deleteMany({});
      } catch (e) {}
    }
  }
  saveStore();
  io.emit('inquiries-cleared', { type });
  res.json({ success: true, message: 'Inquiries cleared successfully.' });
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

// Helper to sanitize interpreter bios for client/public consumption
const sanitizeClientSafeBioServer = (rawBio, badgeNum, lang) => {
  if (!rawBio || typeof rawBio !== 'string') {
    return `Certified professional ${lang || ''} linguist (Badge #${badgeNum || 'Verified'}) bridging live encounters with highest accuracy.`;
  }
  let clean = rawBio
    .replace(/\s*under\s+[\$£€]?[0-9.]+(?:-[0-9.]+)?(?:\s*\/\s*(?:min|minute|hr|hour|mo|month))?(?:\s*\([^)]*\))?/gi, '')
    .replace(/[\$£€]\s*[0-9.]+(?:-[0-9.]+)?(?:\s*\/\s*(?:min|minute|hr|hour|mo|month))(?:\s*\([^)]*\))?/gi, '')
    .replace(/\s*\((?:Live Talk|Salary Base|Scheduled Shift|On-Demand|Flex|Hourly|Per-Minute)[^)]*\)/gi, '')
    .replace(/\s+under\s*[.,]?/gi, '')
    .replace(/\s*,\s*,\s*/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  clean = clean.replace(/[,;:\-\s]+$/, '').trim();
  if (clean && !clean.endsWith('.')) {
    clean += '.';
  }

  if (!clean || clean.length < 5) {
    return `Certified professional ${lang || ''} linguist (Badge #${badgeNum || 'Verified'}) bridging live encounters with highest accuracy.`;
  }
  return clean;
};

// 5. Interpreters Roster (Public / Client view - strictly hides internal contractor rates)
app.get('/api/interpreters', (req, res) => {
  const publicList = (store.interpreters || []).map(interp => {
    const { hourlyRate, minuteRate, monthlySalary, rateLabel, password, emailDispatch, ...safeInterp } = interp;
    return {
      ...safeInterp,
      bio: sanitizeClientSafeBioServer(interp.bio, interp.badgeNumber || interp.interpreterBadgeId, interp.primaryLang)
    };
  });
  res.json(publicList);
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
    id: req.body?.id || `log-${Date.now()}`,
    date: req.body?.date || new Date().toISOString(),
    ...req.body
  };
  store.callLogs = [newLog, ...(store.callLogs || []).filter(l => l.id !== newLog.id)];
  saveStore();
  io.emit('call-log-added', newLog);
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

app.post('/api/wallet/deduct', (req, res) => {
  const { userId, minutesDeducted } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: 'User ID is required' });

  if (store.wallets[userId]) {
    const w = store.wallets[userId];
    const mins = parseInt(minutesDeducted) || 0;
    w.minutesUsed = (w.minutesUsed || 0) + mins;
    w.minutesRemaining = Math.max(0, (w.minutesRemaining || 0) - mins);
    saveStore();
    return res.json({ success: true, wallet: w });
  }
  res.json({ success: false, message: 'Wallet not found' });
});

// 8b. Client Payment Proof & Bank Receipt Verification System
app.get('/api/payment-receipts', (req, res) => {
  res.json(store.paymentReceipts || []);
});

app.post('/api/payment-receipts', (req, res) => {
  const {
    userId,
    clientName,
    clientEmail,
    clientOrg,
    clientPhone,
    packageMinutes,
    amountPaid,
    discountApplied = 0,
    paymentMethod,
    bankReference,
    receiptFileName,
    receiptFileData,
    clientNotes
  } = req.body;

  if (!clientName || !clientEmail || !packageMinutes) {
    return res.status(400).json({ error: 'Client name, email, and package minutes are required.' });
  }

  const receiptId = `rcpt-${Date.now().toString(36)}`;
  const cleanEmail = clientEmail.toLowerCase().trim();

  const newReceipt = {
    id: receiptId,
    userId: userId || `usr-${Date.now().toString(36)}`,
    clientName: clientName.trim(),
    clientEmail: cleanEmail,
    clientOrg: clientOrg || 'Client Account',
    clientPhone: clientPhone || '',
    packageMinutes: parseInt(packageMinutes) || 60,
    amountPaid: parseFloat(amountPaid) || 0,
    discountApplied: parseInt(discountApplied) || 0,
    paymentMethod: paymentMethod || 'Card / Remitly',
    bankReference: bankReference || `REF-${Date.now().toString(36).toUpperCase()}`,
    receiptFileName: receiptFileName || 'Bank_Deposit_Receipt.pdf',
    receiptFileData: receiptFileData || null,
    clientNotes: clientNotes || '',
    status: 'pending_verification', // 'pending_verification', 'approved', 'rejected'
    submittedAt: new Date().toISOString()
  };

  if (!Array.isArray(store.paymentReceipts)) {
    store.paymentReceipts = [];
  }

  store.paymentReceipts.unshift(newReceipt);

  // Set wallet state to pending_verification if exists or init
  if (newReceipt.userId) {
    if (!store.wallets[newReceipt.userId]) {
      store.wallets[newReceipt.userId] = {
        userId: newReceipt.userId,
        totalPaid: 0.00,
        totalMinutesPurchased: 0,
        minutesUsed: 0,
        minutesRemaining: 0,
        billingType: 'prepaid',
        paymentStatus: 'pending_verification',
        pendingMinutes: newReceipt.packageMinutes,
        pendingAmount: newReceipt.amountPaid
      };
    } else {
      store.wallets[newReceipt.userId].paymentStatus = 'pending_verification';
      store.wallets[newReceipt.userId].pendingMinutes = newReceipt.packageMinutes;
      store.wallets[newReceipt.userId].pendingAmount = newReceipt.amountPaid;
    }
  }

  // Also create a linked inquiry so it appears in Admin Messages Box
  const paymentInquiry = {
    id: `inq-rcpt-${Date.now().toString(36)}`,
    userName: newReceipt.clientName,
    userEmail: newReceipt.clientEmail,
    userRole: 'client',
    subject: `💳 Payment Receipt: ${newReceipt.packageMinutes} Mins Package ($${newReceipt.amountPaid.toFixed(2)}) via ${newReceipt.paymentMethod}`,
    message: `Payment of $${newReceipt.amountPaid.toFixed(2)} submitted for ${newReceipt.packageMinutes} Minutes package via ${newReceipt.paymentMethod}. Reference: ${newReceipt.bankReference}. Receipt file: ${newReceipt.receiptFileName}.${newReceipt.clientNotes ? ' Notes: ' + newReceipt.clientNotes : ''}`,
    category: 'Payment Verification',
    status: 'new',
    receiptId: newReceipt.id,
    adminReply: '',
    createdAt: new Date().toISOString(),
    messages: [
      {
        sender: 'user',
        text: `I have completed the transfer of $${newReceipt.amountPaid.toFixed(2)} for ${newReceipt.packageMinutes} Minutes via ${newReceipt.paymentMethod}. Transaction Reference: ${newReceipt.bankReference}. Please verify and credit my account.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  };

  store.inquiries.unshift(paymentInquiry);

  saveStore();
  io.emit('new-payment-receipt', newReceipt);
  io.emit('new-inquiry', paymentInquiry);

  res.json({
    success: true,
    message: 'Payment proof submitted successfully. LinguaBridge administration will verify your deposit and credit minutes promptly.',
    receipt: newReceipt
  });
});

// Admin: Approve Payment Receipt & Credit Wallet Minutes
app.post('/api/payment-receipts/:id/approve', (req, res) => {
  const { id } = req.params;
  const { adminNotes } = req.body;

  const receipt = (store.paymentReceipts || []).find(r => r.id === id);
  if (!receipt) {
    return res.status(404).json({ error: 'Payment receipt not found.' });
  }

  receipt.status = 'approved';
  receipt.verifiedAt = new Date().toISOString();
  receipt.adminNotes = adminNotes || 'Payment verified by IK Enterprises Admin';

  // Find user by userId or email
  let user = store.users.find(u => u.id === receipt.userId || (u.email && u.email.toLowerCase() === receipt.clientEmail.toLowerCase()));
  const targetUserId = user ? user.id : receipt.userId;

  if (!store.wallets[targetUserId]) {
    store.wallets[targetUserId] = {
      userId: targetUserId,
      totalPaid: 0.00,
      totalMinutesPurchased: 0,
      minutesUsed: 0,
      minutesRemaining: 0,
      billingType: 'prepaid'
    };
  }

  const w = store.wallets[targetUserId];
  w.totalPaid += parseFloat(receipt.amountPaid) || 0;
  w.totalMinutesPurchased += parseInt(receipt.packageMinutes) || 0;
  w.minutesRemaining += parseInt(receipt.packageMinutes) || 0;
  w.paymentStatus = 'verified';
  w.pendingMinutes = 0;
  w.pendingAmount = 0;

  // Resolve linked inquiry if exists
  const linkedInq = (store.inquiries || []).find(i => i.receiptId === receipt.id || i.userEmail.toLowerCase() === receipt.clientEmail.toLowerCase() && i.category === 'Payment Verification');
  if (linkedInq) {
    linkedInq.status = 'resolved';
    linkedInq.adminReply = `Payment of $${receipt.amountPaid.toFixed(2)} verified! +${receipt.packageMinutes} minutes have been credited to your account. Your dashboard is now fully unlocked for live interpreter calls.`;
    linkedInq.messages.push({
      sender: 'bot',
      text: `**Payment Confirmed:** Your payment of $${receipt.amountPaid.toFixed(2)} has been verified by administration. +${receipt.packageMinutes} minutes credited to your wallet. You can now use all interpreters!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }

  saveStore();
  io.emit('payment-receipt-approved', {
    receiptId: receipt.id,
    userId: targetUserId,
    minutesAdded: receipt.packageMinutes,
    amountPaid: receipt.amountPaid,
    wallet: w
  });

  res.json({
    success: true,
    message: `Payment verified. +${receipt.packageMinutes} minutes credited to ${receipt.clientName}.`,
    receipt,
    wallet: w
  });
});

// Admin: Reject Payment Receipt
app.post('/api/payment-receipts/:id/reject', (req, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;

  const receipt = (store.paymentReceipts || []).find(r => r.id === id);
  if (!receipt) {
    return res.status(404).json({ error: 'Payment receipt not found.' });
  }

  receipt.status = 'rejected';
  receipt.rejectionReason = rejectionReason || 'Deposit could not be verified with bank reference.';
  receipt.verifiedAt = new Date().toISOString();

  let targetUserId = receipt.userId;
  if (store.wallets[targetUserId]) {
    store.wallets[targetUserId].paymentStatus = 'rejected';
    store.wallets[targetUserId].pendingMinutes = 0;
  }

  // Update linked inquiry
  const linkedInq = (store.inquiries || []).find(i => i.receiptId === receipt.id);
  if (linkedInq) {
    linkedInq.status = 'resolved';
    linkedInq.adminReply = `Payment verification issue: ${receipt.rejectionReason}. Please contact support or provide updated proof.`;
    linkedInq.messages.push({
      sender: 'bot',
      text: `**Verification Notice:** ${receipt.rejectionReason}. Please reach out if you need assistance.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }

  saveStore();
  io.emit('payment-receipt-rejected', {
    receiptId: receipt.id,
    userId: targetUserId,
    reason: receipt.rejectionReason
  });

  res.json({
    success: true,
    message: 'Payment receipt marked as rejected.',
    receipt
  });
});

// Admin: Delete Payment Receipt Permanently
app.delete('/api/payment-receipts/:id', async (req, res) => {
  const { id } = req.params;
  store.paymentReceipts = (store.paymentReceipts || []).filter(r => r.id !== id);
  if (db) {
    try {
      await db.collection('payment_receipts').deleteOne({ id });
      await db.collection('inquiries').deleteMany({ receiptId: id });
    } catch (e) {
      console.error('Error deleting receipt from MongoDB:', e.message);
    }
  }
  saveStore();
  io.emit('payment-receipt-deleted', { id });
  res.json({ success: true, message: 'Payment receipt deleted permanently.' });
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
// Active Live Online Presence Tracking
const activePresence = new Map();

function broadcastPresence() {
  const onlineList = Array.from(activePresence.values());
  io.emit('online-presence-updated', {
    total: onlineList.length,
    users: onlineList,
    interpreters: onlineList.filter(u => u.role === 'interpreter'),
    clients: onlineList.filter(u => u.role === 'host' || u.role === 'client'),
    admins: onlineList.filter(u => u.role === 'admin')
  });
}

function broadcastActiveRooms() {
  const roomsList = Object.values(activeRooms).map(r => ({
    roomId: r.roomId,
    startedAt: r.startedAt,
    targetLanguage: r.targetLanguage || 'Spanish',
    specialty: r.specialty || 'General',
    clientName: r.clientName || (r.participants.find(p => p.role === 'host' || p.role === 'client')?.name) || 'Client',
    clientOrg: r.clientOrg || '',
    patientName: r.patientName || (r.participants.find(p => p.role === 'guest')?.name) || 'Guest',
    interpreterName: r.interpreterName || (r.participants.find(p => p.role === 'interpreter')?.name) || null,
    participantsCount: (r.participants || []).length,
    participants: r.participants || [],
    hasClient: (r.participants || []).some(p => p.role === 'host' || p.role === 'client'),
    hasInterpreter: (r.participants || []).some(p => p.role === 'interpreter'),
    hasGuest: (r.participants || []).some(p => p.role === 'guest'),
    status: (r.participants || []).some(p => p.role === 'interpreter') 
      ? 'active_encounter' 
      : ((r.participants || []).some(p => p.role === 'host' || p.role === 'client') ? 'waiting_interpreter' : 'open')
  }));
  io.emit('active-rooms-updated', roomsList);
}

// Online presence inspection endpoint for Admin
app.get('/api/admin/online-presence', (req, res) => {
  const onlineList = Array.from(activePresence.values());
  res.json({
    total: onlineList.length,
    users: onlineList,
    interpreters: onlineList.filter(u => u.role === 'interpreter'),
    clients: onlineList.filter(u => u.role === 'host' || u.role === 'client'),
    admins: onlineList.filter(u => u.role === 'admin')
  });
});

// Active live rooms endpoint for Admin & Dashboard
app.get('/api/admin/active-rooms', (req, res) => {
  const roomsList = Object.values(activeRooms).map(r => ({
    roomId: r.roomId,
    startedAt: r.startedAt,
    targetLanguage: r.targetLanguage || 'Spanish',
    specialty: r.specialty || 'General',
    clientName: r.clientName || (r.participants.find(p => p.role === 'host' || p.role === 'client')?.name) || 'Client',
    clientOrg: r.clientOrg || '',
    patientName: r.patientName || (r.participants.find(p => p.role === 'guest')?.name) || 'Guest',
    interpreterName: r.interpreterName || (r.participants.find(p => p.role === 'interpreter')?.name) || null,
    participantsCount: (r.participants || []).length,
    participants: r.participants || [],
    hasClient: (r.participants || []).some(p => p.role === 'host' || p.role === 'client'),
    hasInterpreter: (r.participants || []).some(p => p.role === 'interpreter'),
    hasGuest: (r.participants || []).some(p => p.role === 'guest'),
    status: (r.participants || []).some(p => p.role === 'interpreter') 
      ? 'active_encounter' 
      : ((r.participants || []).some(p => p.role === 'host' || p.role === 'client') ? 'waiting_interpreter' : 'open')
  }));
  res.json(roomsList);
});

// Active pending dispatches endpoint
app.get('/api/admin/active-dispatches', (req, res) => {
  res.json(Object.values(activeDispatches));
});

// Admin force terminate / end call room
app.post('/api/admin/end-room', (req, res) => {
  const { roomId } = req.body || {};
  if (roomId) {
    if (activeRooms[roomId]) {
      delete activeRooms[roomId];
    }
    Object.keys(activeDispatches).forEach(dId => {
      if (activeDispatches[dId].roomId === roomId) {
        delete activeDispatches[dId];
        io.emit('call-claimed', { dispatchId: dId, roomId });
      }
    });
    io.to(roomId).emit('call-session-ended', { roomId, endedBy: 'admin', endedByName: 'Platform Administrator' });
    io.emit('call-session-ended', { roomId });
    io.emit('call-claimed', { roomId });
    broadcastActiveRooms();
  }
  res.json({ success: true });
});

// ==========================================
// SOCKET.IO REAL-TIME SIGNALING & ROOMS
// ==========================================

io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // Register user info on socket & add to active presence
  socket.on('register-user', ({ role = 'guest', userId, name, email, language, org, specialty, badgeNumber, phone }) => {
    socket.userRole = role;
    socket.userId = userId;
    socket.userName = name;
    socket.userLang = language;
    
    activePresence.set(socket.id, {
      socketId: socket.id,
      userId: userId || `usr-${socket.id.substring(0, 6)}`,
      role: (role || 'guest').toLowerCase(),
      name: name || 'Online User',
      email: email || '',
      language: language || 'English',
      org: org || '',
      specialty: specialty || 'General',
      badgeNumber: badgeNumber || '',
      phone: phone || '',
      connectedAt: new Date().toISOString(),
      status: 'online'
    });
    broadcastPresence();
  });

  socket.on('disconnect', () => {
    activePresence.delete(socket.id);
    broadcastPresence();
    if (socket.currentRoom) {
      handleLeaveRoom(socket, socket.currentRoom);
    }
  });

  // Re-broadcast appointment creation event to all parties (Client, Interpreter, Admin)
  socket.on('new-appointment-created', (appointmentData) => {
    const dispatchId = `disp-${Date.now()}`;
    const dispatchRecord = {
      dispatchId,
      roomId: appointmentData.roomId,
      guestPin: appointmentData.guestPin,
      guestLink: appointmentData.guestLink,
      hostSocketId: socket.id,
      hostName: appointmentData.mainClientName || 'Main Client',
      hostOrg: appointmentData.mainClientOrg || 'Client Organization',
      targetLanguage: appointmentData.language || 'Spanish',
      specialty: appointmentData.specialty || 'General',
      callType: appointmentData.callType || 'audio',
      patientName: appointmentData.guestName || 'Non-English Client',
      interpreterId: appointmentData.interpreter?.id,
      interpreterName: appointmentData.interpreter?.name,
      interpreterBadgeNumber: appointmentData.interpreter?.badgeNumber || appointmentData.interpreter?.interpreterBadgeId,
      bookingType: appointmentData.bookingType || 'instant',
      date: appointmentData.date,
      time: appointmentData.time,
      totalCost: appointmentData.totalCost,
      createdAt: Date.now(),
      status: 'searching'
    };

    activeDispatches[dispatchId] = dispatchRecord;

    // Save to server store if not already saved
    if (appointmentData.id && !store.appointments.some(a => a.id === appointmentData.id)) {
      store.appointments.unshift(appointmentData);
      saveStore();
    }

    io.emit('new-appointment-created', appointmentData);
    io.emit('incoming-call-alert', dispatchRecord);
    io.emit('incoming-dispatch-call', dispatchRecord);
    io.emit('admin-booking-notification', {
      appointment: appointmentData,
      dispatch: dispatchRecord
    });
  });

  // Host initiates On-Demand Dispatch Request
  socket.on('request-interpreter-dispatch', (dispatchData) => {
    const dispatchId = `disp-${Date.now()}`;
    const roomId = dispatchData.roomId || `room-${Date.now().toString(36)}`;
    const guestPin = dispatchData.guestPin || Math.floor(1000 + Math.random() * 9000).toString();

    const dispatchRecord = {
      dispatchId,
      roomId,
      guestPin,
      hostSocketId: socket.id,
      hostName: dispatchData.hostName || dispatchData.mainClientName || 'English Host',
      hostOrg: dispatchData.hostOrg || dispatchData.mainClientOrg || 'General Organization',
      targetLanguage: dispatchData.targetLanguage || dispatchData.language || 'Spanish',
      specialty: dispatchData.specialty || 'General',
      callType: dispatchData.callType || 'audio',
      patientName: dispatchData.patientName || dispatchData.guestName || 'Non-English Client',
      interpreterId: dispatchData.interpreter?.id,
      interpreterName: dispatchData.interpreter?.name,
      interpreterBadgeNumber: dispatchData.interpreter?.badgeNumber || dispatchData.interpreter?.interpreterBadgeId,
      createdAt: Date.now(),
      status: 'searching'
    };

    activeDispatches[dispatchId] = dispatchRecord;

    // Acknowledge to host
    socket.emit('dispatch-created', dispatchRecord);

    // Broadcast incoming call notification to all online interpreters and admins
    io.emit('incoming-call-alert', dispatchRecord);
    io.emit('incoming-dispatch-call', dispatchRecord);
    io.emit('admin-booking-notification', { dispatch: dispatchRecord });
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

      const presence = activePresence.get(socket.id);
      if (presence) {
        presence.status = 'on_call';
        presence.inCall = true;
        presence.activeRoomId = dispatch.roomId;
        broadcastPresence();
      }
    }
  });

  // Interpreter Declines Call
  socket.on('decline-dispatch', ({ dispatchId }) => {
    socket.emit('dispatch-dismissed', { dispatchId });
  });

  // Set explicit call status
  socket.on('set-interpreter-call-status', ({ inCall, roomId }) => {
    const presence = activePresence.get(socket.id);
    if (presence) {
      presence.inCall = !!inCall;
      presence.status = inCall ? 'on_call' : 'online';
      presence.activeRoomId = inCall ? roomId : null;
      broadcastPresence();
    }
  });

  // Joining a 3-Party Room
  socket.on('join-room', ({ roomId, role, participantName, language, specialty, clientName, clientOrg, patientName, interpreterName }) => {
    socket.join(roomId);
    socket.currentRoom = roomId;

    // Update real-time presence to on_call
    const presence = activePresence.get(socket.id);
    if (presence) {
      presence.status = 'on_call';
      presence.inCall = true;
      presence.activeRoomId = roomId;
      broadcastPresence();
    }

    if (!activeRooms[roomId]) {
      activeRooms[roomId] = {
        roomId,
        startedAt: Date.now(),
        targetLanguage: language || 'Urdu',
        specialty: specialty || 'General',
        clientName: clientName || (role === 'host' ? participantName : 'Client'),
        clientOrg: clientOrg || '',
        patientName: patientName || (role === 'guest' ? participantName : 'Guest'),
        interpreterName: interpreterName || (role === 'interpreter' ? participantName : null),
        participants: []
      };
    } else {
      if (language && !activeRooms[roomId].targetLanguage) activeRooms[roomId].targetLanguage = language;
      if (specialty && !activeRooms[roomId].specialty) activeRooms[roomId].specialty = specialty;
      if (role === 'host' || role === 'client') activeRooms[roomId].clientName = participantName;
      if (role === 'interpreter') activeRooms[roomId].interpreterName = participantName;
      if (role === 'guest') activeRooms[roomId].patientName = participantName;
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
      currentUserId: socket.id,
      targetLanguage: activeRooms[roomId].targetLanguage,
      specialty: activeRooms[roomId].specialty
    });

    socket.to(roomId).emit('participant-joined', participant);

    // Broadcast updated live active rooms across the platform (Admin + Interpreters)
    broadcastActiveRooms();

    // If client joined and no interpreter is in the room yet, broadcast active call alert to matching interpreters!
    if ((role === 'host' || role === 'client') && !activeRooms[roomId].participants.some(p => p.role === 'interpreter')) {
      const liveAlert = {
        dispatchId: `live-${roomId}`,
        roomId,
        targetLanguage: language || activeRooms[roomId].targetLanguage,
        specialty: specialty || activeRooms[roomId].specialty,
        clientName: participantName,
        clientOrg: clientOrg || '',
        patientName: activeRooms[roomId].patientName,
        createdAt: Date.now(),
        status: 'waiting_interpreter',
        isLiveRoomWaiting: true
      };
      io.emit('client-waiting-in-room', liveAlert);
      io.emit('incoming-call-alert', liveAlert);
    }
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

  // Live Audio Chunk Relay (Guarantees zero-drop voice audio across mobile 4G/5G, symmetric NAT, and restrictive firewalls)
  socket.on('relay-audio-chunk', ({ roomId, audioData, mimeType, senderRole, senderName }) => {
    if (roomId && audioData) {
      socket.to(roomId).emit('relay-audio-chunk', {
        senderSocketId: socket.id,
        audioData,
        mimeType,
        senderRole,
        senderName
      });
    }
  });

  // In-Call Multi-Party Chat
  socket.on('send-chat-message', ({ id, roomId, sender, senderName, role, senderRole, text, translation, originalLang, targetLang, timestamp }) => {
    const messageId = id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const resolvedSender = sender || senderName || 'Participant';
    const resolvedRole = role || senderRole || 'guest';
    const resolvedTime = timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const message = {
      id: messageId,
      sender: resolvedSender,
      senderName: resolvedSender,
      role: resolvedRole,
      senderRole: resolvedRole,
      senderSocketId: socket.id,
      text,
      translation: translation || null,
      originalLang,
      targetLang,
      timestamp: resolvedTime
    };

    // Broadcast only to OTHER participants in the room (sender already has it locally!)
    socket.to(roomId).emit('new-chat-message', message);
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

  // End Call Session (triggered when Host, Interpreter, or Client ends the call)
  socket.on('end-call-session', ({ roomId, role, participantName }) => {
    if (!roomId) return;
    
    // Notify all participants in this room that the call session is finished
    io.to(roomId).emit('call-session-ended', {
      roomId,
      endedBy: role || socket.userRole || 'participant',
      endedByName: participantName || socket.userName || 'Participant'
    });

    // Remove from activeRooms
    if (activeRooms[roomId]) {
      delete activeRooms[roomId];
    }

    // Clear any matching active dispatches
    Object.keys(activeDispatches).forEach(dId => {
      if (activeDispatches[dId].roomId === roomId) {
        delete activeDispatches[dId];
        io.emit('call-claimed', { dispatchId: dId, roomId });
      }
    });

    // Broadcast globally that this room/dispatch is ended & no longer waiting
    io.emit('call-session-ended', { roomId });
    io.emit('call-claimed', { roomId });

    // Reset presence to online for the current socket
    const presence = activePresence.get(socket.id);
    if (presence) {
      presence.status = 'online';
      presence.inCall = false;
      presence.activeRoomId = null;
      broadcastPresence();
    }

    broadcastActiveRooms();
  });

  // Leave room or disconnect
  socket.on('leave-room', ({ roomId }) => {
    handleLeaveRoom(socket, roomId);
  });
});

function handleLeaveRoom(socket, roomId) {
  if (activeRooms[roomId]) {
    const leavingRole = socket.userRole;
    activeRooms[roomId].participants = activeRooms[roomId].participants.filter(p => p.socketId !== socket.id);
    socket.to(roomId).emit('participant-left', { socketId: socket.id, role: leavingRole, name: socket.userName });
    socket.leave(roomId);

    // If an interpreter finishes and leaves, or if no participants remain, close the room
    if (activeRooms[roomId].participants.length === 0 || leavingRole === 'interpreter') {
      delete activeRooms[roomId];
      // Clean up dispatches
      Object.keys(activeDispatches).forEach(dId => {
        if (activeDispatches[dId].roomId === roomId) {
          delete activeDispatches[dId];
          io.emit('call-claimed', { dispatchId: dId, roomId });
        }
      });
      io.to(roomId).emit('call-session-ended', { roomId, endedBy: leavingRole || 'interpreter' });
      io.emit('call-session-ended', { roomId });
    }
    broadcastActiveRooms();
  }

  // Restore presence to online (not on call)
  const presence = activePresence.get(socket.id);
  if (presence) {
    presence.status = 'online';
    presence.inCall = false;
    presence.activeRoomId = null;
    broadcastPresence();
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
