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

  // Navigation & Role states
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('linguabridge_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const savedUser = localStorage.getItem('linguabridge_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
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

  // Fetch real data from backend on mount
  useEffect(() => {
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
        }
      });
    }
  }, []);

  // Sync user presence with socket server
  useEffect(() => {
    const socket = getSocket();
    if (socket && currentUser) {
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
    setCurrentUser(user);
    try {
      localStorage.setItem('linguabridge_user', JSON.stringify(user));
    } catch {}

    const normalizedRole = (user.role === 'client' || user.role === 'host') ? 'host' : user.role;
    setCurrentRole(normalizedRole);
    setCurrentView(user.role === 'admin' ? 'admin' : user.role === 'interpreter' ? 'interpreter' : 'host');
    
    if (walletData) {
      setClientWallet(walletData);
      try {
        localStorage.setItem('linguabridge_wallet', JSON.stringify(walletData));
      } catch {}
    } else if (user.id) {
      fetch(`/api/wallet/${user.id}`)
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
    setCurrentView(normalizedRole === 'admin' ? 'admin' : normalizedRole === 'interpreter' ? 'interpreter' : 'host');
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

    </div>
  );
}
