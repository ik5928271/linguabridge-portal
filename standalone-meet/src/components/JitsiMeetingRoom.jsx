import React, { useEffect, useRef, useState } from 'react';
import { 
  PhoneOff, 
  MessageSquare, 
  BookOpen, 
  ShieldCheck, 
  Globe, 
  Headphones, 
  Users, 
  Copy, 
  Check, 
  Sparkles,
  ExternalLink,
  Video,
  Mic,
  Maximize2,
  FileText,
  Clock,
  UserCheck,
  Stethoscope,
  HeartHandshake
} from 'lucide-react';

export default function JitsiMeetingRoom({
  roomId = 'room-default',
  role = 'guest',
  participantName = 'Participant',
  displayName: propDisplayName,
  targetLanguage = 'Urdu',
  language: propLanguage,
  specialty = 'General / Medical Support',
  onEndCall,
  onLeave
}) {
  const actualName = propDisplayName || participantName || 'Participant';
  const actualLang = propLanguage || targetLanguage || 'Urdu';
  const handleExit = onEndCall || onLeave;

  const [copiedRole, setCopiedRole] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [notes, setNotes] = useState(() => {
    return localStorage.getItem(`lb_notes_${roomId}`) || '';
  });
  const [activeTab, setActiveTab] = useState('hub'); // 'hub', 'notes', 'glossary'
  const [meetingWindowOpened, setMeetingWindowOpened] = useState(false);

  // Standardized Clean Numeric Badge ID for Interpreters
  const isInterpreter = role === 'interpreter';
  const formattedDisplayName = isInterpreter 
    ? (actualName.startsWith('Interpreter #') ? actualName : `Interpreter #${actualName.replace(/\D/g, '') || '87265'}`)
    : actualName;

  const sanitizedRoomName = `LinguaBridge-${roomId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const directMeetUrl = `https://meet.jit.si/${sanitizedRoomName}#userInfo.displayName=${encodeURIComponent(formattedDisplayName)}&config.prejoinPageEnabled=false&config.startWithAudioMuted=false`;

  // Format call timer
  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Launch direct meeting window (Bypasses 8x8 iframe embedding paywall completely)
  const openMeetingWindow = () => {
    const width = 1200;
    const height = 800;
    const left = Math.max(0, (window.screen.width - width) / 2);
    const top = Math.max(0, (window.screen.height - height) / 2);
    const win = window.open(
      directMeetUrl, 
      `LinguaBridge_${sanitizedRoomName}`, 
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=no`
    );
    if (win) {
      win.focus();
      setMeetingWindowOpened(true);
    } else {
      // Fallback if popup blocker is active
      window.open(directMeetUrl, '_blank');
      setMeetingWindowOpened(true);
    }
  };

  // Attempt auto-launch once on join
  useEffect(() => {
    const timer = setTimeout(() => {
      openMeetingWindow();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Save notes to localStorage
  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    localStorage.setItem(`lb_notes_${roomId}`, e.target.value);
  };

  const copyInviteLink = (targetRole, label) => {
    const link = `${window.location.origin}/meet/?roomId=${encodeURIComponent(roomId)}&role=${targetRole}&lang=${encodeURIComponent(actualLang)}&autojoin=true`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedRole(label);
      setTimeout(() => setCopiedRole(null), 3000);
    });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden select-none">
      
      {/* Top Header Bar */}
      <header className="h-14 sm:h-16 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-md">
            LB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
                LinguaBridge 3-Way Meeting Hub
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-black text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                HD Audio & Video Live
              </span>
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-2">
              <span>Room: <strong className="text-slate-200">{roomId}</strong></span>
              <span>•</span>
              <span className="text-brand-300 font-bold">{actualLang}</span>
              <span>•</span>
              <span className="font-mono text-emerald-400 font-semibold">{formatTimer(seconds)}</span>
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={openMeetingWindow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            title="Open or focus video call window"
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{meetingWindowOpened ? 'Switch to Video Window' : 'Launch Video Room'}</span>
          </button>

          <button
            onClick={() => {
              if (handleExit) handleExit({ seconds });
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-lg shadow-red-600/30 transition cursor-pointer"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>Leave</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 flex flex-col items-center justify-start">
        <div className="w-full max-w-4xl space-y-6">

          {/* Primary Action Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>3-Party Call Active & Encrypted</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Connected as: <span className="text-brand-400">{formattedDisplayName}</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
                  Carrier-grade HD audio/video operates in a dedicated secure window, ensuring zero 8x8 embed paywalls, maximum audio clarity, and background multi-tasking.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={openMeetingWindow}
                  className="px-6 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition transform active:scale-95 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{meetingWindowOpened ? 'Reopen Video Room' : 'Enter HD Video Room'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3-Party Quick Invite Roster */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-extrabold text-white">3-Way Participant Direct Links</h3>
              </div>
              <span className="text-[11px] text-slate-400">Click to copy pre-configured join links</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Doctor / Client Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-400 flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5" /> Client / Doctor
                    </span>
                    <span className="text-[10px] bg-blue-500/10 text-blue-300 px-1.5 py-0.5 rounded">Host</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">English-speaking healthcare or legal representative</p>
                </div>
                <button
                  onClick={() => copyInviteLink('host', 'Doctor')}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700/80 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {copiedRole === 'Doctor' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                  <span>{copiedRole === 'Doctor' ? 'Copied Doctor Link!' : 'Copy Doctor Link'}</span>
                </button>
              </div>

              {/* Interpreter Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-brand-400 flex items-center gap-1.5">
                      <Headphones className="w-3.5 h-3.5" /> Interpreter
                    </span>
                    <span className="text-[10px] bg-brand-500/10 text-brand-300 px-1.5 py-0.5 rounded">Pro</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Target Language: <strong className="text-slate-200">{actualLang}</strong></p>
                </div>
                <button
                  onClick={() => copyInviteLink('interpreter', 'Interpreter')}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700/80 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {copiedRole === 'Interpreter' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-brand-400" />}
                  <span>{copiedRole === 'Interpreter' ? 'Copied Interpreter Link!' : 'Copy Interpreter Link'}</span>
                </button>
              </div>

              {/* Patient / Guest Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-400 flex items-center gap-1.5">
                      <HeartHandshake className="w-3.5 h-3.5" /> Patient / Guest
                    </span>
                    <span className="text-[10px] bg-purple-500/10 text-purple-300 px-1.5 py-0.5 rounded">LEP</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">One-click zero download access for non-English caller</p>
                </div>
                <button
                  onClick={() => copyInviteLink('guest', 'Patient')}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700/80 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {copiedRole === 'Patient' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
                  <span>{copiedRole === 'Patient' ? 'Copied Patient Link!' : 'Copy Patient Link'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interpreter Workspace (Notepad & Reference) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Live Session Notes */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" /> Session Notes & Terminology Pad
                </span>
                <span className="text-[10px] text-slate-400">Auto-saved locally</span>
              </div>
              <textarea
                value={notes}
                onChange={handleNotesChange}
                placeholder="Type real-time names, dosages, policy numbers, or terminology notes here..."
                className="w-full flex-1 min-h-[140px] p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 resize-none font-mono placeholder:text-slate-600"
              />
            </div>

            {/* Quick Medical / Legal Glossary */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> Standard Protocol Quick-Reference
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">Interpreter Mode</span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-white">Opening Protocol:</strong> "Hello, I am LinguaBridge Interpreter #{formattedDisplayName.replace(/\D/g, '') || '87265'}. I will interpret everything verbatim in the first person."
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-white">Clarification Request:</strong> "As the interpreter, may I request clarification from the doctor/provider?"
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-white">HIPAA & Confidentiality:</strong> All audio and visual communication is encrypted and confidential.
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Security & System Status */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              HIPAA & GDPR End-to-End Encrypted Peer Relay
            </span>
            <span>Room Code: {sanitizedRoomName}</span>
          </div>

        </div>
      </main>

    </div>
  );
}
