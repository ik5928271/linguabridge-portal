import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  ShieldCheck, 
  Headphones, 
  Users, 
  PhoneCall, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'pa', name: 'Punjabi', flag: '🇵🇰' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'zh', name: 'Mandarin', flag: '🇨🇳' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ps', name: 'Pashto', flag: '🇦🇫' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

export default function JoinLobby({
  initialRoomId = 'room-default',
  initialRole = 'guest',
  initialName = '',
  initialLang = 'Urdu',
  onJoin
}) {
  const [roomId, setRoomId] = useState(initialRoomId);
  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState(initialName || (initialRole === 'host' ? 'Client / Payer' : initialRole === 'interpreter' ? 'Interpreter #87265' : 'Patient / Guest'));
  const [language, setLanguage] = useState(initialLang);
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [micVolume, setMicVolume] = useState(0);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Pre-test camera & mic in lobby
  useEffect(() => {
    let active = true;
    navigator.mediaDevices?.getUserMedia?.({ audio: true, video: cameraActive })
      .then(stream => {
        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current && cameraActive) {
          videoRef.current.srcObject = stream;
        }

        // Web Audio visual meter
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);
            const data = new Uint8Array(analyser.frequencyBinCount);

            const loop = () => {
              if (!active || !streamRef.current) return;
              analyser.getByteFrequencyData(data);
              let sum = 0;
              for (let i = 0; i < data.length; i++) sum += data[i];
              const avg = sum / data.length;
              setMicVolume(Math.min(100, Math.floor((avg / 128) * 100)));
              requestAnimationFrame(loop);
            };
            requestAnimationFrame(loop);
          }
        } catch (e) {}
      })
      .catch(() => {});

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [cameraActive]);

  const handleEnterCall = (e) => {
    e.preventDefault();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    onJoin({
      roomId: roomId.trim() || 'room-session',
      role,
      name: name.trim() || 'Participant',
      language
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 text-white relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dedicated 3-Way Meeting Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            LinguaBridge Live Room
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            High-definition, encrypted interpretation audio for Doctor, Interpreter, and Patient.
          </p>
        </div>

        {/* Device Preview Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
            {cameraActive ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover mirror"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <VideoOff className="w-8 h-8" />
                <span className="text-xs font-semibold">Camera Off</span>
              </div>
            )}

            {/* Floating Mic Volume Meter */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60">
              <Mic className={`w-3.5 h-3.5 ${micVolume > 5 ? 'text-emerald-400' : 'text-slate-400'}`} />
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 transition-all duration-75"
                  style={{ width: `${micVolume}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-300">
                {micVolume > 5 ? 'Mic Ready' : 'Speak to test'}
              </span>
            </div>
          </div>

          {/* Quick Role & Language Selector */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Your Role</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'host', label: '🏥 Client' },
                  { id: 'interpreter', label: '🎧 Interpreter' },
                  { id: 'guest', label: '👤 Patient' }
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setRole(r.id);
                      if (r.id === 'interpreter' && !name.includes('Interpreter')) {
                        setName('Interpreter #87265');
                      }
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                      role === r.id 
                        ? 'bg-brand-600 text-white border-brand-400 shadow-md' 
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Language Pair</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map(l => (
                  <option key={l.code} value={l.name} className="bg-slate-900">
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Join Form */}
        <form onSubmit={handleEnterCall} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Your Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Sarah / Interpreter #87265 / Patient"
                className="w-full py-3 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Meeting Room Code</label>
              <input
                type="text"
                required
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="room-84920"
                className="w-full py-3 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition transform active:scale-98 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Join 3-Way Interpretation Room</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Bottom Trust Badge */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            HIPAA & GDPR End-to-End Encrypted
          </span>
          <span>•</span>
          <span>Zero App Download Needed</span>
        </div>

      </div>

    </div>
  );
}
