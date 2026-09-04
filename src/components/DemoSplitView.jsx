import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Users, 
  Headphones, 
  Globe, 
  Sparkles, 
  PhoneCall, 
  Maximize2, 
  ArrowRight,
  RefreshCw,
  Video,
  Mic,
  ShieldCheck,
  Zap,
  CreditCard,
  Copy,
  Check,
  Star,
  Clock,
  Award,
  Calendar,
  CheckCircle2,
  Lock
} from 'lucide-react';
import MainClientBookingFlow from './MainClientBookingFlow';
import InterpreterDashboard from './InterpreterDashboard';
import GuestJoinView from './GuestJoinView';
import ThreeWayCallRoom from './ThreeWayCallRoom';
import { LANGUAGES } from '../data/mockData';

export default function DemoSplitView({ onOpenGlossary, onOpenSchedule }) {
  // State for simulated multi-party session
  const [sessionActive, setSessionActive] = useState(false);
  const [activeTab, setActiveTab] = useState('split'); // 'split', 'host', 'interpreter', 'guest'
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Spanish');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Medical / Healthcare');
  const [interpreterStatus, setInterpreterStatus] = useState('online'); // 'online', 'busy', 'offline'

  const [sessionParams, setSessionParams] = useState({
    roomId: 'room-demo-3way',
    targetLanguage: 'Spanish',
    specialty: 'Medical / Healthcare',
    patientName: 'Carlos Hernandez',
    hostName: 'Dr. Sarah Jenkins, MD',
    callType: 'audio'
  });

  const handleLaunchCall = (params = {}) => {
    setSessionParams(prev => ({ 
      ...prev, 
      targetLanguage: selectedLanguage,
      specialty: selectedSpecialty,
      ...params 
    }));
    setSessionActive(true);
  };

  const handleEndCall = () => {
    setSessionActive(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/?view=guest&roomId=room-demo-3way&lang=es&name=Carlos+Hernandez`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-4 px-2 sm:px-4 py-4 max-w-[1700px] mx-auto font-sans">
      
      {/* Top Controls Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shrink-0">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Live 3-Party Interpretation Simulator
              </h2>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20">
                Interactive Tri-View
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Experience the seamless interaction between English Host, Certified Linguist, and Non-English Client.
            </p>
          </div>
        </div>

        {/* View Mode Switcher & Room Trigger */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          {!sessionActive ? (
            <button
              onClick={() => handleLaunchCall({})}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/20 transition transform hover:scale-105"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
              <span>Connect All 3 into Live Conference</span>
            </button>
          ) : (
            <button
              onClick={handleEndCall}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-600/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Exit & Reset Demo Room</span>
            </button>
          )}

          {/* Perspective Navigation Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('split')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'split' ? 'bg-brand-600 text-white font-bold shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              3-Screen Simulator
            </button>
            <button
              onClick={() => setActiveTab('host')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'host' ? 'bg-brand-600 text-white font-bold shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Host Portal
            </button>
            <button
              onClick={() => setActiveTab('interpreter')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'interpreter' ? 'bg-emerald-600 text-white font-bold shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Interpreter View
            </button>
            <button
              onClick={() => setActiveTab('guest')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'guest' ? 'bg-amber-600 text-white font-bold shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Guest View
            </button>
          </div>
        </div>
      </div>

      {/* When live session is active */}
      {sessionActive ? (
        <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
          <ThreeWayCallRoom
            sessionData={sessionParams}
            onEndCall={handleEndCall}
            onOpenGlossary={onOpenGlossary}
          />
        </div>
      ) : activeTab === 'split' ? (
        /* PROPORTIONED 3-SCREEN INTERACTIVE SIMULATOR */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          
          {/* =========================================================================
              SCREEN 1: ENGLISH HOST / PROVIDER (Dr. Sarah Jenkins, MD)
              ========================================================================= */}
          <div className="glass-panel rounded-3xl border border-brand-500/30 flex flex-col overflow-hidden shadow-xl bg-white dark:bg-slate-900/90 transition">
            
            {/* Header */}
            <div className="bg-brand-500/10 dark:bg-brand-950/40 px-4 py-3 border-b border-brand-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
                <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>1. English Host / Provider</span>
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-600 dark:text-brand-300">
                Payer & Link Creator
              </span>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-5 space-y-4">
              
              {/* Doctor / Host Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500 text-white font-bold flex items-center justify-center text-sm shadow">
                    SJ
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Dr. Sarah Jenkins, MD</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Mercy General Cardiology Clinic</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Balance</span>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">85 Mins ($153)</span>
                </div>
              </div>

              {/* Language Selection & Modality */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Language Pair Required
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.code} value={l.name}>{l.flag} English ⟷ {l.name}</option>
                    ))}
                  </select>

                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  >
                    <option>Medical / Healthcare</option>
                    <option>Legal / Court Certified</option>
                    <option>Financial / Banking</option>
                    <option>Immigration & Refugee</option>
                    <option>General / Customer Support</option>
                  </select>
                </div>
              </div>

              {/* Patient Name input preview */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Non-English Patient:</span>
                  <span className="font-bold text-slate-900 dark:text-white">Carlos Hernandez</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Billing Rate:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">$5.00/hr (Prepaid)</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Generated Room:</span>
                  <span className="font-mono text-[11px] font-bold text-brand-600 dark:text-brand-300">#room-demo-3way</span>
                </div>
              </div>

              {/* Generated Guest Link Box */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Free Counter-Party Invitation Link
                </label>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 truncate flex-1">
                    .../join?room=room-demo-3way&lang=es
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[10px] font-bold flex items-center gap-1 transition shrink-0"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleLaunchCall({})}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Start Instant 3-Way Call as Host</span>
              </button>

            </div>
          </div>


          {/* =========================================================================
              SCREEN 2: CERTIFIED INTERPRETER WORKBENCH (Elena Rodriguez, CCHI)
              ========================================================================= */}
          <div className="glass-panel rounded-3xl border border-emerald-500/30 flex flex-col overflow-hidden shadow-xl bg-white dark:bg-slate-900/90 transition">
            
            {/* Header */}
            <div className="bg-emerald-500/10 dark:bg-emerald-950/40 px-4 py-3 border-b border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5" />
                  <span>2. Certified Linguist Portal</span>
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                Elena Rodriguez, CCHI
              </span>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-5 space-y-4">
              
              {/* Interpreter Profile Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow">
                    ER
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Elena Rodriguez, CCHI</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Spanish ⟷ English (Medical Certified)</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">$5.00/hr</span>
              </div>

              {/* Status Indicator & Live Dispatch Box */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-3 relative overflow-hidden">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Active In Queue • Ready for Calls</span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Incoming Request Available</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Dr. Sarah Jenkins is requesting a Spanish Medical encounter.
                  </p>
                </div>

                {/* Animated Ringing Wave */}
                <div className="flex items-center justify-center gap-1 py-1">
                  <span className="w-1 bg-emerald-500 rounded-full wave-bar-1" />
                  <span className="w-1 bg-emerald-400 rounded-full wave-bar-2" />
                  <span className="w-1 bg-emerald-500 rounded-full wave-bar-3" />
                  <span className="w-1 bg-emerald-400 rounded-full wave-bar-4" />
                </div>
              </div>

              {/* Interpreter Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Rating</span>
                  <span className="font-extrabold text-amber-500 flex items-center justify-center gap-0.5 mt-0.5">
                    <Star className="w-3 h-3 fill-amber-500" /> 4.98
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Sessions</span>
                  <span className="font-extrabold text-slate-900 dark:text-white mt-0.5">1,420</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Earned</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">$130.16</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleLaunchCall({})}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5"
              >
                <Headphones className="w-4 h-4" />
                <span>Accept & Join as Interpreter</span>
              </button>

            </div>
          </div>


          {/* =========================================================================
              SCREEN 3: NON-ENGLISH CLIENT / GUEST (Carlos Hernandez - Español)
              ========================================================================= */}
          <div className="glass-panel rounded-3xl border border-amber-500/30 flex flex-col overflow-hidden shadow-xl bg-white dark:bg-slate-900/90 transition">
            
            {/* Header */}
            <div className="bg-amber-500/10 dark:bg-amber-950/40 px-4 py-3 border-b border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>3. Non-English Client View</span>
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300">
                100% Free Guest Access
              </span>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-5 space-y-4">
              
              {/* Localized Welcome Card */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full">
                  🇪🇸 Español
                </span>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Bienvenido a su Consulta Médica
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Ha sido invitado por Dr. Sarah Jenkins. Un intérprete médico certificado traducirá todo de forma consecutiva.
                </p>
              </div>

              {/* Guest Profile & Device Checks */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Nombre del Paciente:</span>
                  <span className="font-bold text-slate-900 dark:text-white">Carlos Hernandez</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Micrófono & Audio:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Activo (Listo)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Costo para el Paciente:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">$0.00 (Cubierto por el Host)</span>
                </div>
              </div>

              {/* Security & Confidentiality */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
                <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Llamada privada protegida por acuerdos de confidencialidad HIPAA.</span>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleLaunchCall({})}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-xs shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5"
              >
                <Globe className="w-4 h-4" />
                <span>Unirse a la Llamada (Join as Patient)</span>
              </button>

            </div>
          </div>

        </div>
      ) : (
        /* FULL PORTAL EMBEDS FOR INDIVIDUAL PERSPECTIVES */
        <div className="glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl p-4 sm:p-6">
          {activeTab === 'host' && (
            <MainClientBookingFlow
              onStartCall={handleLaunchCall}
              onSaveAppointment={() => {}}
              appointments={[]}
              callLogs={[]}
              currentUser={{ name: 'Dr. Sarah Jenkins, MD', org: 'Mercy General Hospital' }}
            />
          )}

          {activeTab === 'interpreter' && (
            <InterpreterDashboard
              onAcceptIncomingCall={handleLaunchCall}
              onOpenGlossary={onOpenGlossary}
              onOpenSchedule={onOpenSchedule}
            />
          )}

          {activeTab === 'guest' && (
            <GuestJoinView
              initialRoomId="room-demo-3way"
              initialLang="es"
              initialName="Carlos Hernandez"
              onJoinRoom={handleLaunchCall}
            />
          )}
        </div>
      )}

    </div>
  );
}
