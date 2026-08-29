import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Volume2,
  Lock,
  Headphones,
  UserCheck
} from 'lucide-react';
import { LANGUAGES, GUEST_TRANSLATIONS } from '../data/mockData';

export default function GuestJoinView({ 
  onJoinRoom, 
  initialRoomId = 'room-default', 
  initialLang = 'es', 
  initialName = '' 
}) {
  const [selectedLangCode, setSelectedLangCode] = useState(initialLang || 'es');
  const [guestName, setGuestName] = useState(initialName || 'Carlos Hernandez');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(45);
  const [cameraReady, setCameraReady] = useState(true);
  const videoRef = useRef(null);

  // Get active translation dictionary
  const t = GUEST_TRANSLATIONS[selectedLangCode] || GUEST_TRANSLATIONS.en;

  // Simulate audio level meter fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isMicMuted) {
        setAudioLevel(Math.floor(20 + Math.random() * 60));
      } else {
        setAudioLevel(0);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [isMicMuted]);

  // Attempt real camera stream if available, fallback gracefully
  useEffect(() => {
    let stream = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && !isVideoMuted) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          // Fallback to avatar mode
          setCameraReady(false);
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isVideoMuted]);

  const handleJoin = () => {
    onJoinRoom({
      roomId: initialRoomId || 'room-guest-session',
      role: 'guest',
      participantName: `${guestName} (${LANGUAGES.find(l => l.code === selectedLangCode)?.name || 'Client'})`,
      language: LANGUAGES.find(l => l.code === selectedLangCode)?.name || 'Spanish',
      isMuted: isMicMuted,
      isVideoOff: isVideoMuted
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        
        {/* Background ambient accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left Col: Device Preview & Test (5 cols) */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-4">
          <div>
            {/* Language Switcher Dropdown */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>{t.languageSelect}</span>
              </label>
              <select
                value={selectedLangCode}
                onChange={(e) => setSelectedLangCode(e.target.value)}
                className="glass-input px-2.5 py-1 rounded-lg text-xs font-bold text-amber-300 focus:outline-none bg-slate-900 cursor-pointer"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200">
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Video Camera Preview Box */}
            <div className="relative aspect-[4/3] rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
              {!isVideoMuted ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover mirror"
                  />
                  {/* Fallback visual avatar if camera blocked or denied */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-xs">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-amber-500/20">
                      {guestName ? guestName.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <span className="mt-3 text-xs font-semibold text-slate-200">{guestName || 'Client'}</span>
                    <span className="text-[10px] text-amber-400 font-medium">
                      {LANGUAGES.find(l => l.code === selectedLangCode)?.nativeName}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <VideoOff className="w-10 h-10 text-slate-600" />
                  <span className="text-xs font-medium">Camera Disabled</span>
                </div>
              )}

              {/* Status Pills inside Preview */}
              <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t.cameraOk}</span>
              </div>

              {/* Floating Media Toggle Controls */}
              <div className="absolute bottom-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  className={`p-2.5 rounded-full backdrop-blur-md transition ${
                    isMicMuted ? 'bg-red-500/90 text-white' : 'bg-slate-800/80 hover:bg-slate-700/80 text-white'
                  }`}
                  title={isMicMuted ? 'Unmute' : 'Mute'}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsVideoMuted(!isVideoMuted)}
                  className={`p-2.5 rounded-full backdrop-blur-md transition ${
                    isVideoMuted ? 'bg-red-500/90 text-white' : 'bg-slate-800/80 hover:bg-slate-700/80 text-white'
                  }`}
                  title={isVideoMuted ? 'Turn on video' : 'Turn off video'}
                >
                  {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Mic Meter Bar */}
            <div className="mt-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] text-slate-400 font-medium shrink-0">{t.audioTest}:</span>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden flex items-center">
                <div 
                  className={`h-full transition-all duration-200 ${isMicMuted ? 'bg-slate-600' : 'bg-gradient-to-r from-emerald-500 to-amber-400'}`}
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-emerald-400">
                {isMicMuted ? 'Muted' : t.audioOk}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{t.privacyNotice}</span>
          </div>
        </div>

        {/* Right Col: Welcome & Join Action (7 cols) */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Session Paid by Main Client • Free Guest Access</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                <Headphones className="w-3.5 h-3.5" />
                <span>{LANGUAGES.find(l => l.code === selectedLangCode)?.nativeName}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
              {t.welcome}
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              {t.subWelcome}
            </p>
          </div>

          {/* Name input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-brand-400" />
              <span>{t.enterName}</span>
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Carlos Hernandez"
              className="w-full glass-input px-4 py-3 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>

          {/* Helpful Tips in Native Language */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span>{t.tipsHeader}</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{t.tip1}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{t.tip2}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{t.tip3}</span>
              </li>
            </ul>
          </div>

          {/* Join Call Action Button */}
          <div>
            <button
              onClick={handleJoin}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-base shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5"
            >
              <span>{t.readyToJoin}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-2">
              {t.waitingRoom}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
