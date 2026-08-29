import React, { useState } from 'react';
import { 
  Users, 
  PhoneCall, 
  Video, 
  Globe, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  Check, 
  QrCode, 
  Share2, 
  Clock, 
  Calendar, 
  FileText, 
  Search, 
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { LANGUAGES, SPECIALTIES } from '../data/mockData';

export default function HostDashboard({ 
  onStartCall, 
  onOpenSchedule, 
  appointments = [], 
  callLogs = [] 
}) {
  const [selectedLanguage, setSelectedLanguage] = useState('Spanish');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Medical / Healthcare');
  const [callType, setCallType] = useState('audio');
  const [patientName, setPatientName] = useState('Carlos Hernandez');
  const [referenceId, setReferenceId] = useState('MRN-78942');
  const [isSearching, setIsSearching] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Default active demo room ID
  const activeRoomId = `room-${Date.now().toString(36).slice(-6)}`;
  const guestLink = `${window.location.origin}/?view=guest&roomId=${activeRoomId}&lang=${LANGUAGES.find(l => l.name.includes(selectedLanguage))?.code || 'es'}&name=${encodeURIComponent(patientName)}`;

  const handleInstantDispatch = () => {
    setIsSearching(true);
    // Simulate real-time dispatch matching
    setTimeout(() => {
      setIsSearching(false);
      onStartCall({
        roomId: activeRoomId,
        role: 'host',
        participantName: 'Dr. Sarah Jenkins, MD (Host)',
        targetLanguage: selectedLanguage,
        specialty: selectedSpecialty,
        patientName: patientName,
        callType: callType
      });
    }, 2200);
  };

  const copyGuestLink = () => {
    navigator.clipboard.writeText(guestLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>English Host & Provider Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Dispatch Instant Interpreter
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Mercy General Hospital • Cardiology & Internal Medicine Dept.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSchedule}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Schedule Future Session</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: On-Demand Dispatch Builder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-400" />
                <span>On-Demand Call Setup</span>
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Interpreters Available
              </span>
            </div>

            {/* 1. Target Language Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>1. Select Client Language</span>
                <span className="text-slate-500 font-normal">Choose target language</span>
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {LANGUAGES.slice(0, 6).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.name)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      selectedLanguage === lang.name
                        ? 'bg-brand-600/20 border-brand-500 text-white ring-1 ring-brand-500'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate">{lang.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{lang.nativeName}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Other languages dropdown */}
              <div className="pt-1">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-slate-200 focus:outline-none"
                >
                  <option value="" disabled>Or choose from 100+ other languages...</option>
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.name} className="bg-slate-900 text-slate-200">
                      {lang.flag} {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Specialty & Domain */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                2. Select Domain / Specialty
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SPECIALTIES.slice(0, 3).map((spec) => (
                  <button
                    key={spec.id}
                    onClick={() => setSelectedSpecialty(spec.name)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedSpecialty === spec.name
                        ? 'bg-brand-600/20 border-brand-500 text-white ring-1 ring-brand-500'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold">{spec.name}</p>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{spec.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Client / Patient Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Client / Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Carlos Hernandez"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Reference / Record # (Optional)</label>
                <input
                  type="text"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="e.g. MRN-78942"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* 4. Call Modality (Audio vs Video) */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-semibold text-slate-300">Call Type:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCallType('audio')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    callType === 'audio' ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 ring-1 ring-brand-400' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Audio Only (Default)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCallType('video')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    callType === 'video' ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 ring-1 ring-brand-400' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>HD Video</span>
                </button>
              </div>
            </div>

            {/* Dispatch Action Button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                disabled={isSearching}
                onClick={handleInstantDispatch}
                className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
                  isSearching
                    ? 'bg-brand-600/50 text-white cursor-wait'
                    : 'bg-gradient-to-r from-brand-500 via-brand-600 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white shadow-brand-600/30 transform hover:-translate-y-0.5'
                }`}
              >
                {isSearching ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Matching Certified {selectedLanguage} Interpreter (Avg 12s)...</span>
                  </>
                ) : (
                  <>
                    <PhoneCall className="w-4 h-4" />
                    <span>Connect Live {selectedLanguage} Interpreter Now</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Right 1 Col: Non-English Guest Invite Hub & Quick Info */}
        <div className="space-y-6">
          
          {/* Guest Link Generator Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>Invite Non-English Client</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                1-Click Join
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Send this instant link to your patient or non-English speaking client. The page will load directly in their native language with zero app install.
            </p>

            <div className="space-y-2">
              <div className="glass-input p-2.5 rounded-xl text-[11px] text-slate-300 font-mono break-all flex items-center justify-between gap-2">
                <span className="truncate">{guestLink}</span>
                <button
                  onClick={copyGuestLink}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 shrink-0 transition"
                  title="Copy Link"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={copyGuestLink}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Guest Link'}</span>
                </button>

                <button
                  onClick={() => setShowQrModal(true)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  title="Show QR Code for Tablet / Phone"
                >
                  <QrCode className="w-4 h-4 text-brand-400" />
                  <span>QR Code</span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Guest will enter straight into the secure 3-way conference when you launch the call.</span>
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-brand-400" />
              <span>Organization Usage Summary</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-[10px] text-slate-400">Minutes This Month</p>
                <p className="text-lg font-extrabold text-white mt-0.5">842 min</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-[10px] text-slate-400">Avg Connect Speed</p>
                <p className="text-lg font-extrabold text-emerald-400 mt-0.5">11 sec</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Scheduled Appointments Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Upcoming Scheduled Sessions</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Pre-arranged 3-way appointments for today</p>
          </div>
          <button
            onClick={onOpenSchedule}
            className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            <span>+ Book New Session</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Time & Date</th>
                <th className="pb-3 font-semibold">Patient / Client</th>
                <th className="pb-3 font-semibold">Language</th>
                <th className="pb-3 font-semibold">Specialty</th>
                <th className="pb-3 font-semibold">Assigned Interpreter</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 font-medium text-white">
                    <span className="text-brand-400 font-bold">{apt.time}</span> • {apt.date}
                  </td>
                  <td className="py-3 text-slate-300 font-medium">{apt.patientName}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                      {apt.language}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{apt.specialty}</td>
                  <td className="py-3 text-emerald-400 font-medium">{apt.interpreterName || 'Auto-assigning'}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => onStartCall({
                        roomId: apt.roomId || 'room-apt-101',
                        role: 'host',
                        participantName: apt.hostName,
                        targetLanguage: apt.language,
                        specialty: apt.specialty,
                        patientName: apt.patientName
                      })}
                      className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold transition flex items-center gap-1.5 ml-auto"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Room</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Modal for In-Person / Tablet Display */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-sm w-full border border-slate-700 text-center space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Scan to Join on Mobile</h4>
              <button 
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-4 bg-white rounded-xl inline-block shadow-lg">
              {/* Simulated QR Code rendering */}
              <div className="w-48 h-48 bg-slate-900 rounded flex flex-col items-center justify-center text-center p-4 space-y-2">
                <QrCode className="w-24 h-24 text-white" />
                <span className="text-[10px] text-slate-400 font-mono">Scan with Phone Camera</span>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              The non-English client will be taken directly to the localized <strong>{selectedLanguage}</strong> room.
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
