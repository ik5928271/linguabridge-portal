import React, { useState, useEffect } from 'react';
import { 
  Headphones, 
  PhoneCall, 
  PhoneOff, 
  CheckCircle2, 
  Award, 
  Clock, 
  Star, 
  BookOpen, 
  Calendar, 
  ShieldCheck, 
  Zap, 
  Volume2, 
  Bell, 
  ArrowRight,
  TrendingUp,
  User,
  Edit,
  X,
  Plus,
  Trash2,
  Save,
  Phone,
  Mail,
  Globe,
  Sparkles,
  Check,
  Wifi,
  Lock,
  Sun,
  Sunrise,
  Sunset,
  Moon
} from 'lucide-react';
import { playTelephoneRing, playConnectedChime } from '../services/audioService';
import { getSocket } from '../services/socket';
import { SHIFT_WINDOWS, SPECIALTY_DOMAINS, HARDWARE_STANDARDS } from '../data/mockData';

export default function InterpreterDashboard({ 
  onAcceptIncomingCall, 
  onOpenGlossary,
  onOpenSchedule,
  currentUser,
  interpreter: propInterpreter,
  callLogs = [],
  appointments = []
}) {
  const [profile, setProfile] = useState({
    id: currentUser?.id || propInterpreter?.id || '',
    name: currentUser?.name || propInterpreter?.name || 'Interpreter',
    email: currentUser?.email || propInterpreter?.email || '',
    phone: currentUser?.phone || propInterpreter?.phone || '',
    avatar: currentUser?.avatar || propInterpreter?.avatar || '',
    primaryLang: currentUser?.primaryLang || propInterpreter?.primaryLang || 'English',
    languages: Array.isArray(currentUser?.languages) && currentUser.languages.length > 0 
      ? currentUser.languages 
      : (propInterpreter?.languages || ['English']),
    specialties: Array.isArray(currentUser?.specialties) && currentUser.specialties.length > 0 
      ? currentUser.specialties 
      : (propInterpreter?.specialties || ['General Healthcare & Patient Intake']),
    bio: currentUser?.bio || propInterpreter?.bio || 'Certified professional interpreter bridging languages for live encounters.',
    status: currentUser?.status || propInterpreter?.status || 'online',
    rating: currentUser?.rating !== undefined ? currentUser.rating : (propInterpreter?.rating || 5.0),
    totalCalls: currentUser?.totalCalls !== undefined ? currentUser.totalCalls : (propInterpreter?.totalCalls || 0),
    employmentType: currentUser?.employmentType || propInterpreter?.employmentType || 'per_minute',
    hourlyRate: currentUser?.hourlyRate !== undefined ? currentUser.hourlyRate : (propInterpreter?.hourlyRate || 8),
    minuteRate: currentUser?.minuteRate !== undefined ? currentUser.minuteRate : (propInterpreter?.minuteRate !== undefined ? propInterpreter.minuteRate : 0.30),
    monthlySalary: currentUser?.monthlySalary !== undefined ? currentUser.monthlySalary : (propInterpreter?.monthlySalary || 1200),
    badgeNumber: currentUser?.badgeNumber || propInterpreter?.badgeNumber || currentUser?.interpreterBadgeId || '',
    shiftWindows: Array.isArray(currentUser?.shiftWindows) && currentUser.shiftWindows.length > 0
      ? currentUser.shiftWindows
      : (Array.isArray(propInterpreter?.shiftWindows) && propInterpreter.shiftWindows.length > 0 ? propInterpreter.shiftWindows : ['shift_a', 'shift_b']),
    emergencyOnCall: currentUser?.emergencyOnCall !== undefined 
      ? currentUser.emergencyOnCall 
      : (propInterpreter?.emergencyOnCall !== undefined ? propInterpreter.emergencyOnCall : true),
    hardwareAudit: currentUser?.hardwareAudit || propInterpreter?.hardwareAudit || {
      headsetVerified: true,
      internetVerified: true,
      privateOfficeSetting: true
    },
    certifications: Array.isArray(currentUser?.certifications) && currentUser.certifications.length > 0
      ? currentUser.certifications 
      : (currentUser?.certifications ? [currentUser.certifications] : (propInterpreter?.certifications || ['Certified Professional Linguist']))
  });

  // Sync if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfile(prev => ({
        ...prev,
        ...currentUser,
        avatar: currentUser.avatar || prev.avatar,
        languages: Array.isArray(currentUser.languages) && currentUser.languages.length > 0 ? currentUser.languages : prev.languages,
        specialties: Array.isArray(currentUser.specialties) && currentUser.specialties.length > 0 ? currentUser.specialties : prev.specialties,
        shiftWindows: Array.isArray(currentUser.shiftWindows) && currentUser.shiftWindows.length > 0 ? currentUser.shiftWindows : prev.shiftWindows,
        emergencyOnCall: currentUser.emergencyOnCall !== undefined ? currentUser.emergencyOnCall : prev.emergencyOnCall,
        hardwareAudit: currentUser.hardwareAudit || prev.hardwareAudit
      }));
    }
  }, [currentUser]);

  const [isOnline, setIsOnline] = useState(true);
  const [incomingCall, setIncomingCall] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [testAudioActive, setTestAudioActive] = useState(false);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPrimaryLang, setEditPrimaryLang] = useState('');
  const [editLanguages, setEditLanguages] = useState([]);
  const [editSpecialties, setEditSpecialties] = useState([]);
  const [editShiftWindows, setEditShiftWindows] = useState([]);
  const [editEmergencyOnCall, setEditEmergencyOnCall] = useState(true);
  const [editHardwareAudit, setEditHardwareAudit] = useState({ headsetVerified: true, internetVerified: true, privateOfficeSetting: true });
  const [newLangInput, setNewLangInput] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Connect to Socket for Real-Time Incoming Call Dispatches
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !isOnline) return;

    // Register active interpreter on socket server
    socket.emit('register-user', {
      role: 'interpreter',
      userId: profile.id,
      name: profile.name,
      language: profile.primaryLang,
      badgeNumber: profile.badgeNumber || profile.interpreterBadgeId
    });

    const handleIncomingDispatch = (dispatchData) => {
      if (!dispatchData) return;
      const currentLanguages = profile.languages || [profile.primaryLang];
      const targetLang = (dispatchData.targetLanguage || '').toLowerCase();
      
      const isMatch = !targetLang || 
        currentLanguages.some(l => l.toLowerCase() === targetLang || targetLang.includes(l.toLowerCase())) ||
        (profile.primaryLang && profile.primaryLang.toLowerCase() === targetLang);

      if (isMatch) {
        playTelephoneRing();
        setCountdown(30);
        setIncomingCall(dispatchData);
      }
    };

    socket.on('incoming-dispatch-call', handleIncomingDispatch);

    return () => {
      socket.off('incoming-dispatch-call', handleIncomingDispatch);
    };
  }, [isOnline, profile.id, profile.name, profile.primaryLang, profile.languages, profile.badgeNumber, profile.interpreterBadgeId]);

  // Dynamic calculations from real call logs
  const userCallLogs = (callLogs || []).filter(log => {
    if (!log) return false;
    const matchId = profile.id && (log.interpreterId === profile.id || log.interpreterUserId === profile.id);
    const matchEmail = profile.email && log.interpreterEmail && log.interpreterEmail.toLowerCase() === profile.email.toLowerCase();
    const matchName = profile.name && log.interpreterName && log.interpreterName.toLowerCase().includes(profile.name.toLowerCase());
    return matchId || matchEmail || matchName;
  });

  const todayDateStr = new Date().toDateString();
  const todayLogs = userCallLogs.filter(log => {
    if (!log.date) return false;
    try {
      return new Date(log.date).toDateString() === todayDateStr;
    } catch {
      return false;
    }
  });

  const completedCallsToday = todayLogs.length;
  const activeMinutesToday = todayLogs.reduce((sum, log) => {
    const durSec = typeof log.durationSeconds === 'number' ? log.durationSeconds : (parseInt(log.duration) || 0);
    return sum + Math.max(1, Math.ceil(durSec / 60));
  }, 0);

  const ratePerMinute = profile.employmentType === 'per_minute' 
    ? (profile.minuteRate || 0.30)
    : ((profile.hourlyRate || 8) / 60);

  const todayEarnings = profile.employmentType === 'salary_base'
    ? ((profile.monthlySalary || 1200) / 30).toFixed(2)
    : (activeMinutesToday * ratePerMinute).toFixed(2);

  const totalLifetimeSessions = profile.totalCalls !== undefined && profile.totalCalls > 0 
    ? profile.totalCalls 
    : userCallLogs.length;

  // Real user appointments
  const myAppointments = (appointments || []).filter(apt => {
    if (!apt) return false;
    const matchId = profile.id && (apt.interpreterId === profile.id || apt.assignedInterpreterId === profile.id);
    const matchEmail = profile.email && apt.interpreterEmail && apt.interpreterEmail.toLowerCase() === profile.email.toLowerCase();
    const matchName = profile.name && apt.interpreterName && apt.interpreterName.toLowerCase().includes(profile.name.toLowerCase());
    return matchId || matchEmail || matchName;
  });

  const openEditModal = () => {
    setEditName(profile.name);
    setEditPhone(profile.phone || '');
    setEditPrimaryLang(profile.primaryLang);
    setEditLanguages([...profile.languages]);
    setEditSpecialties(Array.isArray(profile.specialties) ? [...profile.specialties] : ['General Healthcare & Patient Intake']);
    setEditShiftWindows(Array.isArray(profile.shiftWindows) && profile.shiftWindows.length > 0 ? [...profile.shiftWindows] : ['shift_a', 'shift_b']);
    setEditEmergencyOnCall(profile.emergencyOnCall !== undefined ? profile.emergencyOnCall : true);
    setEditHardwareAudit(profile.hardwareAudit || { headsetVerified: true, internetVerified: true, privateOfficeSetting: true });
    setEditBio(profile.bio || '');
    setEditAvatar(profile.avatar || '');
    setSaveSuccessMsg('');
    setIsEditModalOpen(true);
  };

  const handleToggleEmergencyOnCall = async () => {
    const newVal = !profile.emergencyOnCall;
    const updated = { ...profile, emergencyOnCall: newVal };
    setProfile(updated);
    try {
      localStorage.setItem('linguabridge_user', JSON.stringify(updated));
      await fetch('/api/interpreter/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.id,
          email: profile.email,
          emergencyOnCall: newVal
        })
      });
    } catch {}
  };

  const handleAddLanguage = (e) => {
    if (e) e.preventDefault();
    const trimmed = newLangInput.trim();
    if (trimmed && !editLanguages.some(l => l.toLowerCase() === trimmed.toLowerCase())) {
      setEditLanguages(prev => [...prev, trimmed]);
      setNewLangInput('');
    }
  };

  const handleRemoveLanguage = (langToRemove) => {
    if (editLanguages.length > 1) {
      setEditLanguages(prev => prev.filter(l => l !== langToRemove));
    }
  };

  const handleToggleEditShift = (shiftId) => {
    if (editShiftWindows.includes(shiftId)) {
      if (editShiftWindows.length > 1) {
        setEditShiftWindows(prev => prev.filter(s => s !== shiftId));
      }
    } else {
      setEditShiftWindows(prev => [...prev, shiftId]);
    }
  };

  const handleToggleEditSpecialty = (specName) => {
    if (editSpecialties.includes(specName)) {
      if (editSpecialties.length > 1) {
        setEditSpecialties(prev => prev.filter(s => s !== specName));
      }
    } else {
      setEditSpecialties(prev => [...prev, specName]);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg('');

    const updatedProfile = {
      ...profile,
      name: editName.trim() || profile.name,
      phone: editPhone.trim() || profile.phone,
      primaryLang: editPrimaryLang.trim() || profile.primaryLang,
      languages: editLanguages.length > 0 ? editLanguages : profile.languages,
      specialties: editSpecialties.length > 0 ? editSpecialties : profile.specialties,
      shiftWindows: editShiftWindows.length > 0 ? editShiftWindows : profile.shiftWindows,
      emergencyOnCall: Boolean(editEmergencyOnCall),
      hardwareAudit: editHardwareAudit,
      bio: editBio.trim() || profile.bio,
      avatar: editAvatar.trim() || profile.avatar
    };

    setProfile(updatedProfile);

    // Save locally
    try {
      localStorage.setItem('linguabridge_user', JSON.stringify(updatedProfile));
    } catch {}

    // Send to backend
    try {
      await fetch('/api/interpreter/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.id,
          email: profile.email,
          name: updatedProfile.name,
          phone: updatedProfile.phone,
          primaryLang: updatedProfile.primaryLang,
          languages: updatedProfile.languages,
          specialties: updatedProfile.specialties,
          shiftWindows: updatedProfile.shiftWindows,
          emergencyOnCall: updatedProfile.emergencyOnCall,
          hardwareAudit: updatedProfile.hardwareAudit,
          bio: updatedProfile.bio,
          avatar: updatedProfile.avatar
        })
      });
      setSaveSuccessMsg('Profile & shift availability updated successfully!');
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSaveSuccessMsg('');
      }, 1200);
    } catch (err) {
      setSaveSuccessMsg('Profile saved locally!');
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSaveSuccessMsg('');
      }, 1200);
    } finally {
      setIsSaving(false);
    }
  };

  // Countdown timer when incoming call arrives
  useEffect(() => {
    let timer = null;
    if (incomingCall && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (incomingCall && countdown === 0) {
      setIncomingCall(null);
    }
    return () => clearInterval(timer);
  }, [incomingCall, countdown]);

  const testAudioRinger = () => {
    setTestAudioActive(true);
    playTelephoneRing();
    setTimeout(() => {
      setTestAudioActive(false);
    }, 3000);
  };

  const handleAccept = () => {
    playConnectedChime();
    const callData = incomingCall;
    setIncomingCall(null);
    
    const socket = getSocket();
    if (socket && callData?.dispatchId) {
      socket.emit('accept-dispatch', {
        dispatchId: callData.dispatchId,
        interpreterInfo: {
          id: profile.id,
          name: profile.name,
          badgeNumber: profile.badgeNumber || profile.interpreterBadgeId
        }
      });
    }

    onAcceptIncomingCall({
      roomId: callData.roomId || `room-${Date.now().toString(36)}`,
      role: 'interpreter',
      participantName: profile.name,
      language: callData.targetLanguage || profile.primaryLang,
      specialty: callData.specialty || 'General / Healthcare',
      patientName: callData.patientName || 'Client / Patient',
      hostName: callData.hostName || 'Host'
    });
  };

  const handleDecline = () => {
    const socket = getSocket();
    if (socket && incomingCall?.dispatchId) {
      socket.emit('decline-dispatch', { dispatchId: incomingCall.dispatchId });
    }
    setIncomingCall(null);
  };

  const badgeId = profile.badgeNumber || profile.interpreterBadgeId || currentUser?.badgeNumber || currentUser?.interpreterBadgeId || (profile.id ? profile.id.replace(/\D/g, '').slice(-5) : '84921');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Top Banner & Status Controls */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Interpreter Info */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {profile.avatar ? (
              <img 
                src={profile.avatar} 
                alt={profile.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/40 shadow-lg" 
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-700 text-white font-black text-2xl flex items-center justify-center ring-2 ring-emerald-500/40 shadow-lg select-none">
                {profile.name?.charAt(0)?.toUpperCase() || 'L'}
              </div>
            )}
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950 ${
              isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
            }`} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">{profile.name}</h1>
              <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm">
                ID: #{badgeId}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                profile.employmentType === 'salary_base' 
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  : profile.employmentType === 'per_minute'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-brand-500/10 text-brand-300 border-brand-500/20'
              }`}>
                {profile.employmentType === 'salary_base' ? '🏢 Full-Time Salaried' : profile.employmentType === 'per_minute' ? '⏱️ On-Demand Live Talk' : '💼 Scheduled Shift Linguist'}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              {(profile.languages || ['English']).join(' ⟷ ')} • {Array.isArray(profile.certifications) ? profile.certifications[0] : (profile.certifications || 'Certified Professional Linguist')}
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{totalLifetimeSessions > 0 ? `${Number(profile.rating || 5.0).toFixed(1)} / 5.0` : 'Verified Linguist'}</span>
              </span>
              <span>•</span>
              <span>{totalLifetimeSessions} Lifetime Sessions</span>
              <span>•</span>
              <span className="font-semibold text-emerald-400">
                {profile.employmentType === 'salary_base' 
                  ? `$${profile.monthlySalary || 1200}/mo Salary` 
                  : profile.employmentType === 'per_minute' 
                    ? `$${(profile.minuteRate || 0.30).toFixed(2)}/min Live Talk`
                    : `$${profile.hourlyRate || 8}/hr Shift Billing`}
              </span>
            </div>
          </div>
        </div>

        {/* Status Toggle & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
          
          {/* Edit Profile Button */}
          <button
            onClick={openEditModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer shadow-sm"
          >
            <Edit className="w-3.5 h-3.5 text-brand-400" />
            <span>Edit Profile</span>
          </button>

          {/* Online Toggle */}
          <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-300">
              {isOnline ? 'Queue Status: Online' : 'Queue Status: Paused'}
            </span>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
                isOnline ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  isOnline ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Hardware & Audio Check Button */}
          <button
            onClick={testAudioRinger}
            title="Test speaker output and incoming ringer sound"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              testAudioActive 
                ? 'bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-400' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Volume2 className={`w-3.5 h-3.5 ${testAudioActive ? 'animate-bounce text-white' : 'text-emerald-400'}`} />
            <span>{testAudioActive ? 'Testing Audio...' : 'Test Audio Ringer'}</span>
          </button>

        </div>

      </div>

      {/* 3 Real Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Calls Completed Today</p>
            <p className="text-2xl font-black text-white mt-1">{completedCallsToday} {completedCallsToday === 1 ? 'Call' : 'Calls'}</p>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>{isOnline ? 'Online & Ready for Calls' : 'Queue Paused'}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
            <PhoneCall className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">
              {profile.employmentType === 'salary_base' ? 'Shift Hours Accrued' : 'Active Interpreting Time'}
            </p>
            <p className="text-2xl font-black text-white mt-1">
              {profile.employmentType === 'salary_base' ? `${((activeMinutesToday / 60)).toFixed(1)} / 40 hrs` : `${activeMinutesToday} mins`}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {profile.employmentType === 'salary_base' ? 'Dedicated Full-Time Roster' : 'Live billable encounters'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">
              {profile.employmentType === 'salary_base' ? 'Monthly Fixed Salary' : "Today's Estimated Earnings"}
            </p>
            <p className="text-2xl font-black text-emerald-400 mt-1">
              ${todayEarnings}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {profile.employmentType === 'salary_base' ? 'Fixed Monthly Disbursal' : 'Calculated from live talk'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>


      {/* Weekly Shift Availability & Technical Readiness Overview Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Weekly Shift Availability & HIPAA Compliance Matrix</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              US EST Shift Coverage, Surge On-Call Status & Hardware Verification
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Surge On-Call Quick Toggle */}
            <button
              onClick={handleToggleEmergencyOnCall}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                profile.emergencyOnCall
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${profile.emergencyOnCall ? 'text-emerald-400 fill-emerald-400' : 'text-slate-500'}`} />
              <span>Surge On-Call: {profile.emergencyOnCall ? 'Active (Open for urgent alerts)' : 'Disabled'}</span>
            </button>

            <button
              onClick={openEditModal}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
            >
              Adjust Shifts
            </button>
          </div>
        </div>

        {/* Shift Badges & Technical Indicators Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {SHIFT_WINDOWS.map(shift => {
            const isCovered = (profile.shiftWindows || []).includes(shift.id);
            return (
              <div
                key={shift.id}
                className={`p-3.5 rounded-2xl border transition flex flex-col justify-between ${
                  isCovered
                    ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-500 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <span>{shift.icon}</span>
                      <span>{shift.name}</span>
                    </span>
                    {isCovered && (
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] font-mono font-bold ${isCovered ? 'text-amber-300' : 'text-slate-500'}`}>
                    {shift.timeEST}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                    {shift.description}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-800/60">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isCovered ? 'text-emerald-400' : 'text-slate-600'}`}>
                    {isCovered ? '● Scheduled Shift' : '○ Off-Duty'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hardware & Compliance Footer */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">HIPAA Compliance & Environment Status:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-medium">
              <span>🎧</span>
              <span>USB Headset Verified</span>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-medium">
              <span>🌐</span>
              <span>High-Speed Internet Verified</span>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-medium">
              <span>🔒</span>
              <span>Private Room HIPAA Verified</span>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Tools & Scheduled Sessions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Confirmed Appointments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-400" />
                <span>Today's Confirmed Appointments</span>
              </h3>
              <button onClick={onOpenSchedule} className="text-xs font-bold text-brand-400 hover:text-brand-300">
                + View Full Calendar
              </button>
            </div>

            {myAppointments.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                  <Headphones className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-white">No Pre-Scheduled Appointments Today</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Your queue status is <span className="text-emerald-400 font-bold">Online</span>. You will receive immediate ringing alerts whenever a client initiates on-demand interpretation in your working languages.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myAppointments.map((apt, idx) => (
                  <div key={apt.id || idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-brand-400">{apt.time || 'Scheduled Session'}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                          {apt.specialty || 'General Interpretation'}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-white">{apt.hostName || 'Client Host'} ⟷ {apt.patientName || 'Guest'}</p>
                      <p className="text-xs text-slate-400">{apt.notes || `Room #${apt.roomId || 'room-live'}`}</p>
                    </div>
                    <button
                      onClick={() => onAcceptIncomingCall({
                        roomId: apt.roomId || `room-${Date.now().toString(36)}`,
                        role: 'interpreter',
                        participantName: profile.name,
                        language: apt.language || profile.primaryLang,
                        specialty: apt.specialty || 'General Interpretation',
                        patientName: apt.patientName || 'Patient / Guest',
                        hostName: apt.hostName || 'Host'
                      })}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Enter Room</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Reference & Glossary Widget */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Linguist Tool Drawer</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Instant medical and legal terminology lookup is available both here and directly inside your live call room HUD.
            </p>

            <button
              onClick={onOpenGlossary}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-brand-400" />
              <span>Search Medical & Legal Glossary</span>
            </button>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <p className="font-bold text-slate-300">Interpreter Tip:</p>
              <p>You can use the <span className="text-amber-400 font-semibold">"Request Pause"</span> button inside the room to politely pause the English speaker when translating complex terminology.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Incoming Call Ringing Modal Alert */}
      {incomingCall && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel p-8 rounded-3xl border-2 border-emerald-500/80 shadow-2xl space-y-6 relative overflow-hidden animate-call-ring">
            
            {/* Pulsing indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  Incoming On-Demand Call
                </span>
              </div>
              <div className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-extrabold border border-red-500/30">
                0:{countdown < 10 ? `0${countdown}` : countdown}
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-xl ring-8 ring-emerald-500/20">
                <PhoneCall className="w-10 h-10 animate-bounce" />
              </div>
              <h3 className="text-2xl font-black text-white">{incomingCall.targetLanguage || profile.primaryLang}</h3>
              <p className="text-sm font-semibold text-emerald-400">{incomingCall.specialty || 'General Interpretation'}</p>
            </div>

            {/* Requester Details Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Host / Requester:</span>
                <span className="font-bold text-white">{incomingCall.hostName || 'Client Host'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Organization:</span>
                <span className="font-semibold text-slate-300">{incomingCall.hostOrg || 'Enterprise Client'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Patient / Client:</span>
                <span className="font-semibold text-amber-300">{incomingCall.patientName || 'Guest'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Call Modality:</span>
                <span className="font-semibold text-brand-400 capitalize">{incomingCall.callType || 'audio'} Call</span>
              </div>
            </div>

            {/* Accept / Decline Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={handleDecline}
                className="py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
              >
                <PhoneOff className="w-4 h-4 text-red-400" />
                <span>Decline</span>
              </button>

              <button
                onClick={handleAccept}
                className="py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 animate-pulse" />
                <span>Accept Call</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Edit Profile & Credentials Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-2xl space-y-6 my-8 animate-fade-in relative bg-slate-900/95 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Edit Profile, Shifts & Credentials</h3>
                  <p className="text-xs text-slate-400">Update your shift windows, specialties, and equipment audit</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Success Message Alert */}
            {saveSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Permanent Official Numeric ID Banner */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-300 font-bold">Official Numeric ID:</span>
                    <span className="text-[11px] text-slate-400 block">Assigned permanent identifier for live client calls</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono font-black text-xs border border-emerald-500/40">
                  #{badgeId}
                </span>
              </div>

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-brand-400" /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition"
                    placeholder="e.g. Rohim Ullah"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp / Phone
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition"
                    placeholder="+95 9..."
                  />
                </div>
              </div>

              {/* Primary Native Language */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-400" /> Primary / Native Language
                </label>
                <input
                  type="text"
                  required
                  value={editPrimaryLang}
                  onChange={(e) => setEditPrimaryLang(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition"
                  placeholder="e.g. Rohingya, Burmese, Spanish"
                />
              </div>

              {/* All Working Languages Tag Chips */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Working Languages
                </label>
                <div className="flex flex-wrap gap-2 mb-2 p-3 bg-slate-950 rounded-xl border border-slate-800 min-h-[46px] items-center">
                  {editLanguages.map((lang, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 rounded-lg bg-brand-500/20 text-brand-300 border border-brand-500/40 text-xs font-medium flex items-center gap-1.5"
                    >
                      {lang}
                      {editLanguages.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveLanguage(lang)}
                          className="hover:text-red-400 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLangInput}
                    onChange={(e) => setNewLangInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLanguage(); } }}
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    placeholder="Add language (e.g. Burmese, Hindi, English)"
                  />
                  <button
                    type="button"
                    onClick={handleAddLanguage}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>

              {/* Weekly Shift Availability Windows (US EST) */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Weekly Shift Availability Windows (EST)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">{editShiftWindows.length} Active Shifts</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SHIFT_WINDOWS.map(shift => {
                    const isSel = editShiftWindows.includes(shift.id);
                    return (
                      <button
                        key={shift.id}
                        type="button"
                        onClick={() => handleToggleEditShift(shift.id)}
                        className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 ${
                          isSel 
                            ? 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-400' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate flex items-center gap-1">
                            <span>{shift.icon}</span>
                            <span>{shift.name}</span>
                          </p>
                          <p className="text-[10px] font-mono text-amber-300">{shift.timeEST}</p>
                        </div>
                        {isSel && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Emergency On-Call Toggle */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Emergency / Surge On-Call</p>
                      <p className="text-[10px] text-slate-400">Receive priority alert notifications outside shifts</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editEmergencyOnCall}
                      onChange={(e) => setEditEmergencyOnCall(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

              {/* Primary Specialty Domains */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">Primary Specialty Domains</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SPECIALTY_DOMAINS.map(domain => {
                    const isSel = editSpecialties.includes(domain.name);
                    return (
                      <button
                        key={domain.id}
                        type="button"
                        onClick={() => handleToggleEditSpecialty(domain.name)}
                        className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 ${
                          isSel
                            ? 'bg-brand-500/20 border-brand-500 text-white ring-1 ring-brand-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span>{domain.icon}</span>
                          <span className="text-xs font-semibold truncate">{domain.name}</span>
                        </div>
                        {isSel && <Check className="w-3.5 h-3.5 text-brand-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Profile Photo / Avatar URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Profile Photo URL (Avatar)
                </label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition font-mono text-[11px]"
                  placeholder="https://..."
                />
              </div>

              {/* Bio & Experience Summary */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Professional Bio & Experience
                </label>
                <textarea
                  rows="3"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition resize-none"
                  placeholder="Briefly describe your interpretation experience and domains..."
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-600 hover:from-brand-600 hover:to-emerald-700 text-white text-xs font-bold shadow-lg shadow-brand-500/20 flex items-center gap-2 transition disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
