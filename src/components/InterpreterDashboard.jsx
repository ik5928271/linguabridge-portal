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
  User
} from 'lucide-react';
import { playTelephoneRing, playConnectedChime } from '../services/audioService';

export default function InterpreterDashboard({ 
  onAcceptIncomingCall, 
  onOpenGlossary,
  onOpenSchedule,
  interpreter = {
    id: 'int-1',
    name: 'Elena Rodriguez, CCHI',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    primaryLang: 'Spanish',
    languages: ['Spanish (Español)', 'English'],
    specialties: ['Medical / Healthcare', 'Legal / Court', 'General'],
    status: 'online',
    rating: 4.98,
    totalCalls: 1420,
    hourlyRate: 55,
    certifications: ['Certified Healthcare Interpreter (CCHI)', 'State Court Certified']
  }
}) {
  const [isOnline, setIsOnline] = useState(true);
  const [incomingCall, setIncomingCall] = useState(null);
  const [countdown, setCountdown] = useState(30);

  // Countdown timer when incoming call arrives
  useEffect(() => {
    let timer = null;
    if (incomingCall && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (incomingCall && countdown === 0) {
      // Auto-decline if expired
      setIncomingCall(null);
    }
    return () => clearInterval(timer);
  }, [incomingCall, countdown]);

  const triggerMockCall = () => {
    playTelephoneRing();
    setCountdown(30);
    setIncomingCall({
      dispatchId: `disp-${Date.now()}`,
      roomId: `room-${Date.now().toString(36).slice(-6)}`,
      hostName: 'Dr. Sarah Jenkins, MD',
      hostOrg: 'Mercy General Hospital - Emergency Dept',
      patientName: 'Carlos Hernandez',
      targetLanguage: 'Spanish (Español)',
      specialty: 'Medical / Healthcare (Emergency Triage)',
      callType: 'audio',
      urgency: 'Immediate / Urgent'
    });
  };

  const handleAccept = () => {
    playConnectedChime();
    const callData = incomingCall;
    setIncomingCall(null);
    onAcceptIncomingCall({
      roomId: callData.roomId,
      role: 'interpreter',
      participantName: interpreter.name,
      language: interpreter.primaryLang,
      specialty: callData.specialty,
      patientName: callData.patientName,
      hostName: callData.hostName
    });
  };

  const handleDecline = () => {
    setIncomingCall(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Top Banner & Status Controls */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Interpreter Info */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={interpreter.avatar} 
              alt={interpreter.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/40 shadow-lg" 
            />
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950 ${
              isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
            }`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">{interpreter.name}</h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active Tier 1
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              {interpreter.languages.join(' ⟷ ')} • {interpreter.certifications[0]}
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{interpreter.rating} / 5.0</span>
              </span>
              <span>•</span>
              <span>{interpreter.totalCalls} Lifetime Sessions</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">\${interpreter.hourlyRate}/hr billing</span>
            </div>
          </div>
        </div>

        {/* Status Toggle & Manual Demo Trigger */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
          
          {/* Online Toggle */}
          <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-300">
              {isOnline ? 'Queue Status: Online' : 'Queue Status: Paused'}
            </span>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
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

          {/* Test Incoming Call button */}
          <button
            onClick={triggerMockCall}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition transform hover:-translate-y-0.5"
          >
            <Bell className="w-3.5 h-3.5 animate-bounce" />
            <span>Simulate Incoming Call Ring</span>
          </button>

        </div>

      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Calls Completed Today</p>
            <p className="text-2xl font-black text-white mt-1">6 Calls</p>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18% vs yesterday</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
            <PhoneCall className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Interpreting Time</p>
            <p className="text-2xl font-black text-white mt-1">142 mins</p>
            <p className="text-[11px] text-slate-400 mt-1">Target: 240 mins/shift</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Today's Estimated Earnings</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">\$130.16</p>
            <p className="text-[11px] text-slate-400 mt-1">Direct deposit ready</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Tools & Scheduled Sessions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Assigned Specialities & Today's Schedule */}
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

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-brand-400">11:00 AM - 11:45 AM</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                      Medical / Cardiology
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white">Dr. Sarah Jenkins ⟷ Carlos Hernandez</p>
                  <p className="text-xs text-slate-400">Mercy General Hospital • Room #room-apt-101</p>
                </div>
                <button
                  onClick={() => onAcceptIncomingCall({
                    roomId: 'room-apt-101',
                    role: 'interpreter',
                    participantName: interpreter.name,
                    language: 'Spanish',
                    specialty: 'Medical / Healthcare',
                    patientName: 'Carlos Hernandez',
                    hostName: 'Dr. Sarah Jenkins'
                  })}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shrink-0"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Enter Room</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 opacity-75">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-300">03:00 PM - 04:00 PM</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400">
                      Legal / Deposition
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white">Attorney Robert Sterling ⟷ Maria Vasquez</p>
                  <p className="text-xs text-slate-400">Civil Court Arbitration • Room #room-apt-204</p>
                </div>
                <span className="text-xs font-semibold text-slate-500">Upcoming in 4h</span>
              </div>
            </div>
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
              Instant medical and legal terminology lookup is available both here and directly inside your live call HUD.
            </p>

            <button
              onClick={onOpenGlossary}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              <BookOpen className="w-4 h-4 text-brand-400" />
              <span>Search Medical & Legal Glossary</span>
            </button>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <p className="font-bold text-slate-300">Interpreter Tip:</p>
              <p>You can use the <span className="text-amber-400 font-semibold">"Request Pause"</span> button inside the room to politely pause the English speaker when translating dense medical consent clauses.</p>
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
              <h3 className="text-2xl font-black text-white">{incomingCall.targetLanguage}</h3>
              <p className="text-sm font-semibold text-emerald-400">{incomingCall.specialty}</p>
            </div>

            {/* Requester Details Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Host / Requester:</span>
                <span className="font-bold text-white">{incomingCall.hostName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Organization:</span>
                <span className="font-semibold text-slate-300">{incomingCall.hostOrg}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Patient / Client:</span>
                <span className="font-semibold text-amber-300">{incomingCall.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Call Modality:</span>
                <span className="font-semibold text-brand-400 capitalize">{incomingCall.callType} Call</span>
              </div>
            </div>

            {/* Accept / Decline Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={handleDecline}
                className="py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
              >
                <PhoneOff className="w-4 h-4 text-red-400" />
                <span>Decline</span>
              </button>

              <button
                onClick={handleAccept}
                className="py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5"
              >
                <PhoneCall className="w-4 h-4 animate-pulse" />
                <span>Accept Call</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
