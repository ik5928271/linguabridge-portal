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
  RefreshCw
} from 'lucide-react';
import HostDashboard from './HostDashboard';
import MainClientBookingFlow from './MainClientBookingFlow';
import InterpreterDashboard from './InterpreterDashboard';
import GuestJoinView from './GuestJoinView';
import ThreeWayCallRoom from './ThreeWayCallRoom';

export default function DemoSplitView({ onOpenGlossary, onOpenSchedule }) {
  // State for simulated multi-party session
  const [sessionActive, setSessionActive] = useState(false);
  const [activeTab, setActiveTab] = useState('split'); // 'split', 'host', 'interpreter', 'guest'
  const [sessionParams, setSessionParams] = useState({
    roomId: 'room-demo-3way',
    targetLanguage: 'Spanish',
    specialty: 'Medical / Healthcare',
    patientName: 'Carlos Hernandez',
    hostName: 'Dr. Sarah Jenkins, MD',
    callType: 'audio'
  });

  const handleLaunchCall = (params) => {
    setSessionParams(prev => ({ ...prev, ...params }));
    setSessionActive(true);
  };

  const handleEndCall = () => {
    setSessionActive(false);
  };

  return (
    <div className="space-y-4 px-2 sm:px-4 py-4 max-w-[1700px] mx-auto">
      
      {/* Top Controls Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Live 3-Party Simulator View</h2>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Interactive Multi-Screen
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Test how English Host, Certified Interpreter, and Non-English Client interact simultaneously in real time.
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          {!sessionActive ? (
            <button
              onClick={() => handleLaunchCall({})}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Connect All 3 into Live Room</span>
            </button>
          ) : (
            <button
              onClick={handleEndCall}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition"
            >
              <span>Reset Demo Room</span>
            </button>
          )}

          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('split')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeTab === 'split' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              3-Screen Split
            </button>
            <button
              onClick={() => setActiveTab('host')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeTab === 'host' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Host Only
            </button>
            <button
              onClick={() => setActiveTab('interpreter')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeTab === 'interpreter' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Interpreter Only
            </button>
            <button
              onClick={() => setActiveTab('guest')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeTab === 'guest' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Guest Only
            </button>
          </div>
        </div>
      </div>

      {/* When live session is active */}
      {sessionActive ? (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <ThreeWayCallRoom
            sessionData={sessionParams}
            onEndCall={handleEndCall}
            onOpenGlossary={onOpenGlossary}
          />
        </div>
      ) : (
        /* Pre-call 3-Screen Split View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Pane 1: Main Client (Paying Party) */}
          {(activeTab === 'split' || activeTab === 'host') && (
            <div className="glass-panel rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-xl">
              <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-brand-400">
                  <Users className="w-4 h-4" />
                  <span>1. Main Client (Paying Account)</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400">Payer & Link Creator</span>
              </div>
              <div className="p-3 overflow-y-auto max-h-[750px]">
                <MainClientBookingFlow
                  onStartCall={handleLaunchCall}
                  onSaveAppointment={() => {}}
                  appointments={[]}
                  callLogs={[]}
                  currentUser={{ name: 'Dr. Sarah Jenkins, MD', org: 'Mercy General Hospital' }}
                />
              </div>
            </div>
          )}

          {/* Pane 2: Certified Interpreter */}
          {(activeTab === 'split' || activeTab === 'interpreter') && (
            <div className="glass-panel rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-xl">
              <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Headphones className="w-4 h-4" />
                  <span>2. Certified Interpreter View</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400">Elena Rodriguez, CCHI</span>
              </div>
              <div className="p-3 overflow-y-auto max-h-[750px]">
                <InterpreterDashboard
                  onAcceptIncomingCall={handleLaunchCall}
                  onOpenGlossary={onOpenGlossary}
                  onOpenSchedule={onOpenSchedule}
                />
              </div>
            </div>
          )}

          {/* Pane 3: Non-English Speaking Client */}
          {(activeTab === 'split' || activeTab === 'guest') && (
            <div className="glass-panel rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-xl">
              <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Globe className="w-4 h-4" />
                  <span>3. Non-English Client View</span>
                </div>
                <span className="text-[10px] font-semibold text-amber-400">Carlos Hernandez (Español)</span>
              </div>
              <div className="p-3 overflow-y-auto max-h-[750px]">
                <GuestJoinView
                  initialRoomId="room-demo-3way"
                  initialLang="es"
                  initialName="Carlos Hernandez"
                  onJoinRoom={handleLaunchCall}
                />
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
