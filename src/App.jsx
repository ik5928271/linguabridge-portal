import React, { useState, useEffect } from 'react';
import { PhoneCall, X, Radio, ArrowRight } from 'lucide-react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import HostDashboard from './components/HostDashboard';
import MainClientBookingFlow from './components/MainClientBookingFlow';
import InterpreterDashboard from './components/InterpreterDashboard';
import GuestJoinView from './components/GuestJoinView';
import ThreeWayCallRoom from './components/ThreeWayCallRoom';
import AdminDashboard from './components/AdminDashboard';
import DemoSplitView from './components/DemoSplitView';
import ScheduleModal from './components/ScheduleModal';
import GlossaryModal from './components/GlossaryModal';
import AuthModal from './components/AuthModal';
import InterpreterApplicationModal from './components/InterpreterApplicationModal';
import AppointmentNotificationManager from './components/AppointmentNotificationManager';
import AIAssistantWidget from './components/AIAssistantWidget';
import { getSocket } from './services/socket';
import { LANGUAGES, ALL_100_LANGUAGES } from './data/mockData';

export default function App() {
  // Theme state ('dark' or 'light')
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('linguabridge_theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('linguabridge_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Comprehensive Master Platform Administrator Validator (Exact matching)
  const isMasterAdminUser = (u) => {
    if (!u) return false;
    const cleanEmail = (u.email || '').toLowerCase().trim();
    const cleanId = (u.id || '').toLowerCase().trim();
    const cleanName = (u.name || '').toLowerCase().trim();

    // Explicitly prevent any other account like Jasmin or interpreters from matching
    if (cleanEmail.includes('jasmin') || cleanName.includes('jasmin') || cleanEmail.includes('kamila') || cleanName.includes('kamila') || cleanEmail.includes('kuzmina') || cleanName.includes('kuzmina')) {
      return false;
    }

    return (
      cleanEmail === 'iksale9817@gmail.com' ||
      cleanEmail === 'iksale9817' ||
      cleanEmail === 'ik5928271@gmail.com' ||
      cleanEmail === 'ik5928271' ||
      cleanEmail === 'admin@linguabridge.com' ||
      cleanEmail === 'admin' ||
      cleanId === 'usr-owner-ikram' ||
      cleanName === 'ik5928271' ||
      cleanName === 'iksale9817' ||
      u.isOwner === true
    );
  };

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('linguabridge_user');
      if (saved) {
        let u = JSON.parse(saved);
        const cleanEmail = (u.email || '').toLowerCase().trim();
        const cleanName = (u.name || '').toLowerCase().trim();

        if (cleanEmail.includes('jasmin') || cleanName.includes('jasmin')) {
          u.role = 'host';
          u.isOwner = false;
          localStorage.setItem('linguabridge_user', JSON.stringify(u));
        } else if (cleanEmail.includes('kamila') || cleanName.includes('kamila') || cleanEmail.includes('kuzmina') || cleanName.includes('kuzmina')) {
          u.role = 'interpreter';
          u.badgeNumber = cleanEmail.includes('kamila') || cleanName.includes('kamila') ? (u.badgeNumber || '35360') : (u.badgeNumber || '48680');
          u.interpreterBadgeId = u.badgeNumber;
          localStorage.setItem('linguabridge_user', JSON.stringify(u));
        } else if (isMasterAdminUser(u)) {
          u = {
            ...u,
            name: u.name && u.name !== 'Client User' && !u.name.includes('usr-') ? u.name : 'Ikram-ul-haq Mian',
            role: 'admin',
            isOwner: true,
            org: 'IK Enterprises'
          };
          localStorage.setItem('linguabridge_user', JSON.stringify(u));
        }
        return u;
      }
    } catch {
      return null;
    }
    return null;
  });

  // Mobile App PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPwaBanner, setShowPwaBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPwaBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPwaBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      setShowAndroidGuide(true);
    }
  };

  // Global Screen Wake Lock (Keeps screen awake while app is open in foreground; releases when in background so screen can sleep)
  useEffect(() => {
    let wakeLockSentinel = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && document.visibilityState === 'visible') {
          wakeLockSentinel = await navigator.wakeLock.request('screen');
          console.log('[Screen WakeLock] Active - screen will stay on while app is open');
        }
      } catch (err) {
        console.log('[Screen WakeLock Notice]:', err.message);
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      } else {
        if (wakeLockSentinel) {
          wakeLockSentinel.release().catch(() => {});
          wakeLockSentinel = null;
          console.log('[Screen WakeLock] Released - screen can sleep while app is in background');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', requestWakeLock);
    window.addEventListener('pageshow', requestWakeLock);

    // Request Native Notifications permission on user touch/load
    if ('Notification' in window && Notification.permission === 'default') {
      const askPermission = () => {
        Notification.requestPermission().catch(() => {});
        window.removeEventListener('click', askPermission);
        window.removeEventListener('touchstart', askPermission);
      };
      window.addEventListener('click', askPermission, { once: true });
      window.addEventListener('touchstart', askPermission, { once: true });
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', requestWakeLock);
      window.removeEventListener('pageshow', requestWakeLock);
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, []);

  // Helper to send native push/browser notifications when app is running in backend/background
  const triggerBackgroundNotification = (title, body, url = '/') => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          body,
          icon: '/icon-192.svg',
          badge: '/icon-192.svg',
          vibrate: [300, 100, 300, 100, 300],
          requireInteraction: true,
          data: { url }
        });
      }).catch(() => {
        new Notification(title, { body, icon: '/icon-192.svg' });
      });
    } else {
      new Notification(title, { body, icon: '/icon-192.svg' });
    }
  };

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const savedUser = localStorage.getItem('linguabridge_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (isMasterAdminUser(u)) return 'admin';
        return (u.role === 'client' || u.role === 'host') ? 'host' : u.role || 'host';
      }
    } catch {}
    return 'host';
  });

  // Persistent Active Session state for live conference room (survives mobile sleep / page reload)
  const [activeSession, setActiveSession] = useState(() => {
    try {
      const saved = sessionStorage.getItem('linguabridge_active_call_session') || localStorage.getItem('linguabridge_active_call_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.roomId && (!parsed.startedAt || Date.now() - parsed.startedAt < 4 * 3600 * 1000)) {
          return parsed;
        }
      }
    } catch {}
    return {
      roomId: 'room-demo-849',
      role: 'host',
      participantName: 'Dr. Sarah Jenkins, MD',
      targetLanguage: 'Spanish',
      specialty: 'Medical / Healthcare',
      patientName: 'Carlos Hernandez',
      hostName: 'Dr. Sarah Jenkins, MD',
      callType: 'audio'
    };
  });

  const [currentView, setCurrentView] = useState(() => {
    try {
      // If there is an active ongoing call that was interrupted by screen sleep / reload, resume directly to room!
      const savedCall = sessionStorage.getItem('linguabridge_active_call_session') || localStorage.getItem('linguabridge_active_call_session');
      if (savedCall) {
        const parsed = JSON.parse(savedCall);
        if (parsed && parsed.roomId && (!parsed.startedAt || Date.now() - parsed.startedAt < 4 * 3600 * 1000)) {
          return 'room';
        }
      }

      const savedUser = localStorage.getItem('linguabridge_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (isMasterAdminUser(u)) return 'admin';
        return u.role === 'admin' ? 'admin' : u.role === 'interpreter' ? 'interpreter' : 'host';
      }
    } catch {}
    return 'landing';
  });

  const [onlineStatus, setOnlineStatus] = useState(true);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [authTargetRole, setAuthTargetRole] = useState('host'); // 'host' or 'interpreter'
  const [isInterpreterAppOpen, setIsInterpreterAppOpen] = useState(false);

  // Global Prepaid Minute Wallet State (Persisted in localStorage & synced with backend)
  const [clientWallet, setClientWallet] = useState(() => {
    try {
      const savedUser = localStorage.getItem('linguabridge_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (isMasterAdminUser(u)) {
          return {
            totalPaid: 1000.00,
            totalMinutesPurchased: 9999,
            minutesUsed: 0,
            minutesRemaining: 9999,
            billingType: 'unlimited_owner'
          };
        }
      }
      const savedWallet = localStorage.getItem('linguabridge_wallet');
      if (savedWallet) return JSON.parse(savedWallet);
    } catch {}
    return {
      totalPaid: 0.00,
      totalMinutesPurchased: 0,
      minutesUsed: 0,
      minutesRemaining: 0,
      billingType: 'prepaid'
    };
  });

  const handleUpdateWallet = (updates) => {
    setClientWallet(prev => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem('linguabridge_wallet', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Modals state
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Store for real-time scheduled appointments and completed call logs
  const [appointments, setAppointments] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [registeredInterpreters, setRegisteredInterpreters] = useState([]);

  // Fetch real data from backend on mount & sanitize local storage accounts
  useEffect(() => {
    try {
      // Auto-migrate and sanitize stored local accounts
      const savedAccounts = localStorage.getItem('linguabridge_accounts');
      if (savedAccounts) {
        const accounts = JSON.parse(savedAccounts);
        let modified = false;
        accounts.forEach(a => {
          if (!a?.user) return;
          const uEmail = (a.user.email || '').toLowerCase().trim();
          const uName = (a.user.name || '').toLowerCase().trim();

          if (isMasterAdminUser(a.user)) {
            a.user.role = 'admin';
            a.user.isOwner = true;
            a.user.name = a.user.name && a.user.name !== 'Client User' && !a.user.name.includes('usr-') ? a.user.name : 'Ikram-ul-haq Mian';
            a.user.org = 'IK Enterprises';
            a.wallet = { totalPaid: 1000, totalMinutesPurchased: 9999, minutesRemaining: 9999, billingType: 'unlimited_owner' };
            modified = true;
          } else if (uEmail.includes('jasmin') || uName.includes('jasmin')) {
            a.user.role = 'host';
            a.user.isOwner = false;
            a.user.org = a.user.org || 'Client / Hospital Account';
            modified = true;
          } else if (uEmail.includes('kamila') || uName.includes('kamila')) {
            a.user.role = 'interpreter';
            a.user.badgeNumber = a.user.badgeNumber || '35360';
            a.user.interpreterBadgeId = a.user.badgeNumber || '35360';
            a.user.displayName = 'Interpreter #35360';
            modified = true;
          } else if (uEmail.includes('kuzmina') || uName.includes('kuzmina') || uEmail === 'kuzminay@yahoo.com') {
            a.user.role = 'interpreter';
            a.user.badgeNumber = a.user.badgeNumber || '48680';
            a.user.interpreterBadgeId = a.user.badgeNumber || '48680';
            a.user.displayName = 'Interpreter #48680';
            modified = true;
          }
        });
        if (modified) {
          localStorage.setItem('linguabridge_accounts', JSON.stringify(accounts));
        }
      }

      const savedUser = localStorage.getItem('linguabridge_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        const uEmail = (u.email || '').toLowerCase().trim();
        const uName = (u.name || '').toLowerCase().trim();

        if (isMasterAdminUser(u) && u.role !== 'admin') {
          u.role = 'admin';
          u.isOwner = true;
          u.name = u.name && u.name !== 'Client User' && !u.name.includes('usr-') ? u.name : 'Ikram-ul-haq Mian';
          u.org = 'IK Enterprises';
          localStorage.setItem('linguabridge_user', JSON.stringify(u));
          setCurrentUser(u);
          setCurrentRole('admin');
          setCurrentView('admin');
        } else if ((uEmail.includes('jasmin') || uName.includes('jasmin')) && u.role !== 'host') {
          u.role = 'host';
          u.isOwner = false;
          localStorage.setItem('linguabridge_user', JSON.stringify(u));
          setCurrentUser(u);
          setCurrentRole('host');
          setCurrentView('landing');
        } else if ((uEmail.includes('kamila') || uName.includes('kamila') || uEmail.includes('kuzmina') || uName.includes('kuzmina')) && u.role !== 'interpreter') {
          u.role = 'interpreter';
          u.badgeNumber = (uEmail.includes('kamila') || uName.includes('kamila')) ? '35360' : '48680';
          u.interpreterBadgeId = u.badgeNumber;
          localStorage.setItem('linguabridge_user', JSON.stringify(u));
          setCurrentUser(u);
          setCurrentRole('interpreter');
          setCurrentView('interpreter');
        }
      }
    } catch {}

    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setAppointments(data); })
      .catch(() => {});

    fetch('/api/call-logs')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setCallLogs(data); })
      .catch(() => {});

    fetch('/api/interpreters')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setRegisteredInterpreters(data); })
      .catch(() => {});

    // Track real-time visitor traffic & campaign sources
    let sId = sessionStorage.getItem('lb_session_id');
    if (!sId) {
      sId = `sess-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      sessionStorage.setItem('lb_session_id', sId);
    }

    fetch('/api/analytics/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: window.location.pathname + window.location.search,
        referrer: document.referrer || 'Direct / Campaign Link',
        sessionId: sId
      })
    }).catch(() => {});

    // Listen for real-time socket events
    const socket = getSocket();
    if (socket) {
      socket.on('payment-receipt-approved', (data) => {
        if (data && data.minutesAdded) {
          setClientWallet(prev => {
            const updated = {
              ...prev,
              totalMinutesPurchased: (prev.totalMinutesPurchased || 0) + data.minutesAdded,
              minutesRemaining: (prev.minutesRemaining || 0) + data.minutesAdded,
              totalPaid: (prev.totalPaid || 0) + (data.amountPaid || 0),
              paymentStatus: 'verified',
              pendingMinutes: 0
            };
            try {
              localStorage.setItem('linguabridge_wallet', JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }
      });

      socket.on('new-appointment-created', (newApt) => {
        if (newApt && newApt.id) {
          setAppointments(prev => [newApt, ...prev.filter(a => a.id !== newApt.id)]);
          if (document.visibilityState === 'hidden') {
            triggerBackgroundNotification(
              '📅 New 3-Way Appointment Scheduled',
              `Appointment booked for ${newApt.language || 'Interpretation'} on ${newApt.date || 'today'} at ${newApt.time || 'now'}.`,
              '/'
            );
          }
        }
      });

      // Background Alert for Incoming Live Calls & Dispatches (triggers phone notification when screen is off)
      socket.on('incoming-call-alert', (dispatch) => {
        if (document.visibilityState === 'hidden') {
          triggerBackgroundNotification(
            '📞 Incoming 3-Way Interpretation Call',
            `Live request from ${dispatch.hostName || 'Client'} for ${dispatch.targetLanguage || 'Language'} interpretation. Tap to accept.`,
            `/?roomId=${dispatch.roomId}&role=interpreter`
          );
        }
      });

      socket.on('incoming-dispatch-call', (dispatch) => {
        if (document.visibilityState === 'hidden') {
          triggerBackgroundNotification(
            '📞 Incoming 3-Way Interpretation Call',
            `Live request from ${dispatch.hostName || 'Client'} for ${dispatch.targetLanguage || 'Language'} interpretation. Tap to accept.`,
            `/?roomId=${dispatch.roomId}&role=interpreter`
          );
        }
      });

      socket.on('client-waiting-in-room', (alertData) => {
        if (document.visibilityState === 'hidden') {
          triggerBackgroundNotification(
            '🌐 Client Waiting in Room',
            `Client is waiting for a ${alertData.targetLanguage || 'Language'} interpreter in room ${alertData.roomId}. Tap to connect!`,
            `/?roomId=${alertData.roomId}&role=interpreter`
          );
        }
      });
    }
  }, []);

  // Sync user presence with socket server (with continuous heartbeat & mobile screen wake listeners)
  useEffect(() => {
    const syncPresence = () => {
      const socket = getSocket();
      if (socket && currentUser) {
        if (!socket.connected) {
          socket.connect();
        }
        socket.emit('register-user', {
          userId: currentUser.id,
          role: currentUser.role || (currentRole === 'host' ? 'host' : currentRole),
          name: currentUser.name,
          email: currentUser.email,
          language: currentUser.primaryLang || currentUser.language || 'English',
          org: currentUser.org || '',
          specialty: currentUser.specialty || '',
          badgeNumber: currentUser.badgeNumber || '',
          phone: currentUser.phone || ''
        });
      }
    };

    syncPresence();
    const interval = setInterval(syncPresence, 20000); // 20s persistent heartbeat
    const handleVis = () => {
      if (document.visibilityState === 'visible') {
        syncPresence();
      }
    };

    window.addEventListener('focus', syncPresence);
    window.addEventListener('pageshow', syncPresence);
    document.addEventListener('visibilitychange', handleVis);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', syncPresence);
      window.removeEventListener('pageshow', syncPresence);
      document.removeEventListener('visibilitychange', handleVis);
    };
  }, [currentUser, currentRole]);

  // Read URL query parameters for direct guest join links (e.g. ?view=guest&roomId=xyz&lang=es)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const roleParam = params.get('role');
    const roomIdParam = params.get('roomId');
    const langParam = params.get('lang');
    const nameParam = params.get('name');

    if (viewParam) {
      setCurrentView(viewParam);
    }
    if (roleParam) {
      setCurrentRole(roleParam);
    }
    if (roomIdParam) {
      let resolvedLang = 'Urdu';
      if (langParam) {
        const found = LANGUAGES.find(l => l.code.toLowerCase() === langParam.toLowerCase() || l.name.toLowerCase() === langParam.toLowerCase()) ||
                      (ALL_100_LANGUAGES && ALL_100_LANGUAGES.find(l => l.code.toLowerCase() === langParam.toLowerCase() || l.name.toLowerCase() === langParam.toLowerCase()));
        if (found) {
          resolvedLang = found.name;
        } else if (langParam.length > 2) {
          resolvedLang = langParam.charAt(0).toUpperCase() + langParam.slice(1);
        }
      }

      setActiveSession(prev => ({
        ...prev,
        roomId: roomIdParam,
        targetLanguage: resolvedLang || prev.targetLanguage || 'Urdu',
        patientName: nameParam ? decodeURIComponent(nameParam) : prev.patientName
      }));
    }
  }, []);

  // Launch live conference room
  const handleStartCall = (sessionConfig) => {
    const chosenLang = sessionConfig?.targetLanguage || sessionConfig?.language || activeSession.targetLanguage || 'Urdu';
    const completeConfig = {
      ...activeSession,
      ...sessionConfig,
      targetLanguage: chosenLang,
      language: chosenLang,
      startedAt: Date.now()
    };
    setActiveSession(completeConfig);
    try {
      sessionStorage.setItem('linguabridge_active_call_session', JSON.stringify(completeConfig));
      localStorage.setItem('linguabridge_active_call_session', JSON.stringify(completeConfig));
    } catch {}
    setCurrentView('room');
  };

  // End live conference room
  const handleEndCall = (completedData) => {
    try {
      sessionStorage.removeItem('linguabridge_active_call_session');
      localStorage.removeItem('linguabridge_active_call_session');
    } catch {}

    const seconds = completedData?.seconds || 0;
    // 30-second grace period: If user enters and quits within 30 seconds, 0 minutes deducted (Test Check-in)
    const actualMinutesUsed = seconds < 30 ? 0 : Math.ceil(seconds / 60);

    if (actualMinutesUsed > 0) {
      setClientWallet(prev => {
        const updated = {
          ...prev,
          minutesUsed: (prev?.minutesUsed || 0) + actualMinutesUsed,
          minutesRemaining: Math.max(0, (prev?.minutesRemaining || 0) - actualMinutesUsed)
        };
        try {
          localStorage.setItem('linguabridge_wallet', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      if (currentUser?.id) {
        fetch('/api/wallet/deduct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, minutesDeducted: actualMinutesUsed })
        }).catch(() => {});
      }
    }

    const logInterpreterName = currentUser?.role === 'interpreter' 
      ? currentUser.name 
      : (completedData.interpreterName || activeSession.interpreterName || activeSession.interpreter?.name || 'Elena Rodriguez, CCHI');
    const logInterpreterId = currentUser?.role === 'interpreter' 
      ? currentUser.id 
      : (completedData.interpreterId || activeSession.interpreterId || activeSession.interpreter?.id || 'usr-interp-1');
    const logInterpreterEmail = currentUser?.role === 'interpreter' 
      ? currentUser.email 
      : (completedData.interpreterEmail || activeSession.interpreterEmail || activeSession.interpreter?.email || 'interpreter@linguabridge.com');
    const logInterpreterBadge = currentUser?.badgeNumber || currentUser?.interpreterBadgeId || completedData.interpreterBadgeNumber || activeSession.interpreterBadgeNumber || '84920';

    const calculatedMinutes = Math.max(1, Math.ceil(seconds / 60));

    const newLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString(),
      hostName: completedData.hostName || activeSession.hostName || 'Main Client',
      hostOrg: completedData.hostOrg || activeSession.hostOrg || 'Mercy General Hospital',
      clientName: `${completedData.patientName || activeSession.patientName || 'Guest'} (${completedData.targetLanguage || activeSession.targetLanguage || 'Spanish'})`,
      interpreterId: logInterpreterId,
      interpreterEmail: logInterpreterEmail,
      interpreterName: logInterpreterName,
      interpreterBadgeNumber: logInterpreterBadge,
      language: completedData.targetLanguage || activeSession.targetLanguage || 'Spanish',
      specialty: completedData.specialty || activeSession.specialty || 'General',
      duration: `${calculatedMinutes} min${calculatedMinutes > 1 ? 's' : ''}`,
      durationSeconds: Math.max(seconds, calculatedMinutes * 60),
      cost: `$${(calculatedMinutes * 0.30).toFixed(2)}`,
      rating: completedData.rating || 5,
      notes: completedData.notes || '3-party interpretation session completed successfully.'
    };

    setCallLogs(prev => [newLog, ...(prev || []).filter(l => l.id !== newLog.id)]);

    fetch('/api/call-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog)
    }).catch(() => {});

    if (completedData?.roomId) {
      setAppointments(prev => prev.map(a => a.roomId === completedData.roomId ? { ...a, status: 'completed' } : a));
    }
    setCurrentView(currentRole === 'interpreter' ? 'interpreter' : 'host');
  };

  const handleSaveAppointment = (newApt) => {
    setAppointments(prev => [newApt, ...prev]);
  };

  const handleOpenAuth = (mode = 'signin', role = 'host') => {
    setAuthMode(mode);
    setAuthTargetRole(role || 'host');
    setIsAuthOpen(true);
  };

  const handleSuccessLogin = (user, walletData) => {
    let finalUser = user;
    let finalWallet = walletData;

    if (isMasterAdminUser(user)) {
      finalUser = {
        ...user,
        name: user.name && user.name !== 'Client User' && !user.name.includes('usr-') ? user.name : 'Ikram-ul-haq Mian',
        role: 'admin',
        isOwner: true,
        org: 'IK Enterprises'
      };
      finalWallet = {
        userId: finalUser.id || 'usr-owner-ikram',
        totalPaid: 1000.00,
        totalMinutesPurchased: 9999,
        minutesUsed: 0,
        minutesRemaining: 9999,
        billingType: 'unlimited_owner'
      };
    }

    setCurrentUser(finalUser);
    try {
      localStorage.setItem('linguabridge_user', JSON.stringify(finalUser));
    } catch {}

    const normalizedRole = finalUser.role === 'admin' ? 'admin' : ((finalUser.role === 'client' || finalUser.role === 'host') ? 'host' : finalUser.role);
    setCurrentRole(normalizedRole);
    setCurrentView(normalizedRole);
    
    if (finalWallet) {
      setClientWallet(finalWallet);
      try {
        localStorage.setItem('linguabridge_wallet', JSON.stringify(finalWallet));
      } catch {}
    } else if (finalUser.id) {
      fetch(`/api/wallet/${finalUser.id}`)
        .then(res => res.json())
        .then(w => { 
          if (w) {
            setClientWallet(w); 
            try {
              localStorage.setItem('linguabridge_wallet', JSON.stringify(w));
            } catch {}
          }
        })
        .catch(() => {});
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('linguabridge_user');
      localStorage.removeItem('linguabridge_wallet');
    } catch {}
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-brand-500 selection:text-white">
      
      {/* Top Navigation */}
      {currentView !== 'room' && (
        <Navbar
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          currentView={currentView}
          setCurrentView={setCurrentView}
          currentUser={currentUser}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenAuth={handleOpenAuth}
          onOpenInterpreterApplication={() => setIsInterpreterAppOpen(true)}
          onLogout={handleLogout}
          onlineStatus={onlineStatus}
          setOnlineStatus={setOnlineStatus}
          onOpenGlossary={() => setIsGlossaryOpen(true)}
          onOpenSchedule={() => setIsScheduleOpen(true)}
          onInstallPwa={handleInstallPwa}
        />
      )}

      {/* Persistent Live Call Rejoin Banner if user is on dashboard/search while call is active */}
      {currentView !== 'room' && activeSession?.roomId && (() => {
        try {
          const saved = sessionStorage.getItem('linguabridge_active_call_session') || localStorage.getItem('linguabridge_active_call_session');
          if (!saved) return null;
          const parsed = JSON.parse(saved);
          if (!parsed || !parsed.roomId || (parsed.startedAt && Date.now() - parsed.startedAt > 4 * 3600 * 1000)) return null;
          return (
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 py-2.5 shadow-2xl flex items-center justify-between z-50 sticky top-0 border-b border-red-400/40">
              <div className="flex items-center gap-2.5 text-xs font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0" />
                <span>🔴 3-Party Interpretation Call in Progress (Room: {parsed.roomId})</span>
                <span className="hidden sm:inline opacity-80">• {parsed.targetLanguage || 'Live Language'}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('room')}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-red-700 font-extrabold text-xs shadow hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-red-600" />
                  <span>Rejoin Call Room</span>
                </button>
                <button
                  onClick={() => handleEndCall({ roomId: parsed.roomId, seconds: 0 })}
                  className="px-2.5 py-1.5 rounded-xl bg-black/30 hover:bg-black/50 text-white font-bold text-xs transition cursor-pointer"
                >
                  End Call
                </button>
              </div>
            </div>
          );
        } catch {
          return null;
        }
      })()}

      {/* Main Content Body */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onSelectRole={(roleKey) => {
              if (roleKey === 'split-demo') {
                setCurrentView('split-demo');
              } else {
                setCurrentRole(roleKey);
                setCurrentView(roleKey);
              }
            }}
            onOpenSchedule={() => setIsScheduleOpen(true)}
            onOpenGlossary={() => setIsGlossaryOpen(true)}
            onOpenAuth={handleOpenAuth}
            onOpenInterpreterApplication={() => setIsInterpreterAppOpen(true)}
          />
        )}

        {(currentView === 'host' || currentView === 'client') && (
          <MainClientBookingFlow
            onStartCall={handleStartCall}
            onSaveAppointment={handleSaveAppointment}
            appointments={appointments}
            callLogs={callLogs}
            currentUser={currentUser}
            wallet={clientWallet}
            onUpdateWallet={handleUpdateWallet}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === 'interpreter' && (
          <InterpreterDashboard
            currentUser={currentUser}
            callLogs={callLogs}
            appointments={appointments}
            onAcceptIncomingCall={handleStartCall}
            onOpenGlossary={() => setIsGlossaryOpen(true)}
            onOpenSchedule={() => setIsScheduleOpen(true)}
          />
        )}

        {currentView === 'guest' && (
          <GuestJoinView
            initialRoomId={activeSession.roomId}
            initialLang={new URLSearchParams(window.location.search).get('lang') || (activeSession.targetLanguage ? (LANGUAGES.find(l => l.name.toLowerCase() === activeSession.targetLanguage.toLowerCase())?.code || 'en') : 'en')}
            initialName={activeSession.patientName}
            onJoinRoom={handleStartCall}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            callLogs={callLogs}
            appointments={appointments}
            onStartCall={handleStartCall}
            currentUser={currentUser}
          />
        )}

        {currentView === 'split-demo' && (
          <DemoSplitView
            onOpenGlossary={() => setIsGlossaryOpen(true)}
            onOpenSchedule={() => setIsScheduleOpen(true)}
          />
        )}

        {currentView === 'room' && (
          <ThreeWayCallRoom
            sessionData={activeSession}
            onEndCall={handleEndCall}
            onOpenGlossary={() => setIsGlossaryOpen(true)}
          />
        )}
      </main>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        initialRole={authTargetRole}
        onSuccessLogin={handleSuccessLogin}
        onOpenInterpreterApplication={() => {
          setIsAuthOpen(false);
          setIsInterpreterAppOpen(true);
        }}
      />

      <InterpreterApplicationModal
        isOpen={isInterpreterAppOpen}
        onClose={() => setIsInterpreterAppOpen(false)}
      />

      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSaveAppointment={handleSaveAppointment}
      />

      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      {/* Global 10-Minute Reminders & Multi-Party Appointment Notifications */}
      <AppointmentNotificationManager
        currentUser={currentUser}
        appointments={appointments}
        onStartCall={handleStartCall}
      />

      {/* Global AI Concierge Bot & Client/Interpreter Message Box (hidden during active call room) */}
      {currentView !== 'room' && (
        <AIAssistantWidget
          currentUser={currentUser}
          currentRole={currentRole}
        />
      )}

      {/* PWA Mobile App Install Prompt Bar / Floating Trigger */}
      {showPwaBanner && currentView !== 'room' && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-slate-900/95 border border-sky-500/40 backdrop-blur-xl p-4 rounded-2xl shadow-2xl shadow-sky-500/10 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0">
              🌐
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">Install LinguaBridge App</p>
              <p className="text-[11px] text-slate-400 truncate">1-Tap instant access & screen keep-alive</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallPwa}
              className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition"
            >
              Install App
            </button>
            <button
              onClick={() => setShowPwaBanner(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* iOS Add-to-Home-Screen Step-by-Step Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-sm w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto text-2xl font-bold">
              📲
            </div>
            <h3 className="text-base font-bold text-white">Install on iPhone / iPad</h3>
            <div className="text-xs text-slate-300 text-left space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-[10px]">1</span>
                <span>Tap the <strong>Share</strong> button (box with arrow) in Safari.</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-[10px]">2</span>
                <span>Scroll down and select <strong>"Add to Home Screen"</strong>.</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-[10px]">3</span>
                <span>Tap <strong>"Add"</strong> in the top-right corner to finish.</span>
              </p>
            </div>
            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition shadow-lg"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Android / Huawei Add-to-Home-Screen Step-by-Step Guide Modal */}
      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-sm w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto text-2xl font-bold">
              📱
            </div>
            <h3 className="text-base font-bold text-white">Add to Home Screen</h3>
            <div className="text-xs text-slate-300 text-left space-y-2.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-[10px]">1</span>
                <span>Tap the <strong>3 dots ⋮</strong> menu in the top-right of your browser.</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-[10px]">2</span>
                <span>Select <strong>"Add to Home screen"</strong> (or <strong>"Install app"</strong>).</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-[10px]">3</span>
                <span>Tap <strong>"Add"</strong> to create the direct shortcut icon.</span>
              </p>
            </div>
            <button
              onClick={() => setShowAndroidGuide(false)}
              className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition shadow-lg"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
