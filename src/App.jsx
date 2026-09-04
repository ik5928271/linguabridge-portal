import React, { useState, useEffect } from 'react';
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

export default function App() {
  // Navigation & Role states
  const [currentRole, setCurrentRole] = useState('host'); // 'host', 'interpreter', 'guest', 'admin'
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'host', 'interpreter', 'guest', 'admin', 'room', 'split-demo'
  const [onlineStatus, setOnlineStatus] = useState(true);

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [isInterpreterAppOpen, setIsInterpreterAppOpen] = useState(false);

  // Global Prepaid Minute Wallet State (Clean starting slate for live testing)
  const [clientWallet, setClientWallet] = useState({
    totalPaid: 0.00,
    totalMinutesPurchased: 0,
    minutesUsed: 0,
    minutesRemaining: 0,
    billingType: 'prepaid' // 'prepaid' or 'postpaid_hospital'
  });

  const handleUpdateWallet = (updates) => {
    setClientWallet(prev => ({ ...prev, ...updates }));
  };

  // Active Session state for live conference room
  const [activeSession, setActiveSession] = useState({
    roomId: 'room-demo-849',
    role: 'host',
    participantName: 'Dr. Sarah Jenkins, MD',
    targetLanguage: 'Spanish',
    specialty: 'Medical / Healthcare',
    patientName: 'Carlos Hernandez',
    hostName: 'Dr. Sarah Jenkins, MD',
    callType: 'audio'
  });

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
  }, []);

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
      setActiveSession(prev => ({
        ...prev,
        roomId: roomIdParam,
        targetLanguage: langParam === 'es' ? 'Spanish' : langParam === 'ar' ? 'Arabic' : langParam === 'zh' ? 'Mandarin Chinese' : 'Spanish',
        patientName: nameParam ? decodeURIComponent(nameParam) : prev.patientName
      }));
    }
  }, []);

  // Launch live conference room
  const handleStartCall = (sessionConfig) => {
    setActiveSession(prev => ({ ...prev, ...sessionConfig }));
    setCurrentView('room');
  };

  // End live conference room
  const handleEndCall = (completedData) => {
    const newLog = {
      id: `log-${Date.now()}`,
      date: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      hostName: completedData.hostName || activeSession.hostName,
      hostOrg: 'Mercy General Hospital',
      clientName: `${completedData.patientName || activeSession.patientName} (${completedData.targetLanguage})`,
      interpreterName: 'Elena Rodriguez, CCHI',
      language: completedData.targetLanguage,
      specialty: completedData.specialty,
      duration: completedData.duration,
      cost: `$${((completedData.seconds / 60) * 0.95 + 2.50).toFixed(2)}`,
      rating: completedData.rating || 5,
      notes: completedData.notes
    };

    setCallLogs(prev => [newLog, ...prev]);
    setCurrentView(currentRole === 'interpreter' ? 'interpreter' : 'host');
  };

  const handleSaveAppointment = (newApt) => {
    setAppointments(prev => [newApt, ...prev]);
  };

  const handleOpenAuth = (mode = 'signin') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleSuccessLogin = (user, walletData) => {
    setCurrentUser(user);
    const normalizedRole = (user.role === 'client' || user.role === 'host') ? 'host' : user.role;
    setCurrentRole(normalizedRole);
    if (walletData) {
      setClientWallet(walletData);
    } else if (user.id) {
      fetch(`/api/wallet/${user.id}`)
        .then(res => res.json())
        .then(w => { if (w) setClientWallet(w); })
        .catch(() => {});
    }
    setCurrentView(normalizedRole === 'admin' ? 'admin' : normalizedRole === 'interpreter' ? 'interpreter' : 'host');
  };

  const handleLogout = () => {
    setCurrentUser(null);
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
          onOpenAuth={handleOpenAuth}
          onOpenInterpreterApplication={() => setIsInterpreterAppOpen(true)}
          onLogout={handleLogout}
          onlineStatus={onlineStatus}
          setOnlineStatus={setOnlineStatus}
          onOpenGlossary={() => setIsGlossaryOpen(true)}
          onOpenSchedule={() => setIsScheduleOpen(true)}
        />
      )}

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
          />
        )}

        {currentView === 'interpreter' && (
          <InterpreterDashboard
            currentUser={currentUser}
            onAcceptIncomingCall={handleStartCall}
            onOpenGlossary={() => setIsGlossaryOpen(true)}
            onOpenSchedule={() => setIsScheduleOpen(true)}
          />
        )}

        {currentView === 'guest' && (
          <GuestJoinView
            initialRoomId={activeSession.roomId}
            initialLang="es"
            initialName={activeSession.patientName}
            onJoinRoom={handleStartCall}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            callLogs={callLogs}
            appointments={appointments}
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

    </div>
  );
}
