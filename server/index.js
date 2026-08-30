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

// Initial State Structure
let store = {
  users: [DEFAULT_OWNER],
  interpreters: [],
  appointments: [],
  callLogs: [],
  wallets: {
    'usr-owner-ikram': {
      userId: 'usr-owner-ikram',
      totalPaid: 1000.00,
      totalMinutesPurchased: 9999,
      minutesUsed: 0,
      minutesRemaining: 9999,
      billingType: 'unlimited_owner'
    }
  }
};

// Load existing store if available
function loadStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf8');
      store = JSON.parse(data);

      // Ensure Owner Account always exists with latest credentials
      const ownerIndex = store.users.findIndex(u => u.email.toLowerCase() === DEFAULT_OWNER.email.toLowerCase() || u.isOwner);
      if (ownerIndex >= 0) {
        store.users[ownerIndex] = { ...store.users[ownerIndex], ...DEFAULT_OWNER };
      } else {
        store.users.unshift(DEFAULT_OWNER);
      }

      if (!store.wallets[DEFAULT_OWNER.id]) {
        store.wallets[DEFAULT_OWNER.id] = {
          userId: DEFAULT_OWNER.id,
          totalPaid: 1000.00,
          totalMinutesPurchased: 9999,
          minutesUsed: 0,
          minutesRemaining: 9999,
          billingType: 'unlimited_owner'
        };
      }

      console.log(`[Database Loaded] Users: ${store.users.length}, Interpreters: ${store.interpreters.length}, Appointments: ${store.appointments.length}`);
    } else {
      saveStore();
    }
  } catch (err) {
    console.error('Error loading store.json:', err);
  }
}

function saveStore() {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving store.json:', err);
  }
}

loadStore();

// Comprehensive Glossary Reference (Multilingual)
const glossary = [
  {
    id: 'g-1',
    category: 'Medical',
    termEn: 'Informed Consent',
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
    hourlyRate = 55, 
    initialMinutes = 60,
    billingType = 'prepaid',
    certifications = 'Certified Linguist'
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

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
    hourlyRate: parseInt(hourlyRate) || 55,
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
      hourlyRate: parseInt(hourlyRate) || 55,
      certifications: [certifications],
      bio: `Professional ${primaryLang} interpreter provisioned by administration.`
    };
    store.interpreters.push(newInterpreter);
    io.emit('interpreter-registered', newInterpreter);
  }

  // If created as Client / Payer or Admin
  store.wallets[userId] = {
    userId,
    totalPaid: role === 'admin' ? 1000 : (initialMinutes * 0.95),
    totalMinutesPurchased: parseInt(initialMinutes) || 60,
    minutesUsed: 0,
    minutesRemaining: parseInt(initialMinutes) || 60,
    billingType: billingType || 'prepaid'
  };

  saveStore();
  res.json({ success: true, user: newUser, wallet: store.wallets[userId] });
});

// Update / Edit full user account details
app.put('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, org, role, primaryLang, specialty, hourlyRate, minutesRemaining, totalPaid, password } = req.body;

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
  if (hourlyRate !== undefined) user.hourlyRate = parseInt(hourlyRate);

  // Update corresponding interpreter profile if applicable
  const interp = store.interpreters.find(i => i.userId === id || i.id === id || i.email === user.email);
  if (interp) {
    if (name) interp.name = name;
    if (primaryLang) {
      interp.primaryLang = primaryLang;
      interp.languages = [primaryLang, 'English'];
    }
    if (specialty) interp.specialties = [specialty, 'General / Customer Support'];
    if (hourlyRate !== undefined) interp.hourlyRate = parseInt(hourlyRate);
  }

  // Update corresponding wallet if applicable
  if (store.wallets[id]) {
    if (minutesRemaining !== undefined) store.wallets[id].minutesRemaining = parseInt(minutesRemaining);
    if (totalPaid !== undefined) store.wallets[id].totalPaid = parseFloat(totalPaid);
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
