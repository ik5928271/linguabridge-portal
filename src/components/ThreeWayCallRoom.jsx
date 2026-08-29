import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Share2, 
  MessageSquare, 
  BookOpen, 
  Hand, 
  Volume2, 
  Maximize2, 
  ShieldCheck, 
  Sparkles, 
  Send, 
  Globe, 
  Users, 
  Headphones, 
  Clock, 
  Star, 
  FileText, 
  AlertTriangle, 
  Check, 
  X,
  Layers,
  Search,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { QUICK_PHRASES, LANGUAGES } from '../data/mockData';
import { 
  speakText, 
  playConnectedChime, 
  playMessageTone, 
  playPauseFloorAlert, 
  setSpeechEnabled 
} from '../services/audioService';

export default function ThreeWayCallRoom({ 
  sessionData = {}, 
  onEndCall, 
  onOpenGlossary 
}) {
  const {
    roomId = 'room-default',
    role = 'host', // 'host', 'interpreter', 'guest'
    participantName = 'Participant',
    targetLanguage = 'Spanish',
    specialty = 'Medical / Healthcare',
    patientName = 'Carlos Hernandez',
    hostName = 'Dr. Sarah Jenkins, MD',
    callType = 'audio'
  } = sessionData;

  // Real Audible Voice Output State (Default: True)
  const [isVoiceActive, setIsVoiceActive] = useState(true);

  // Media States for Current User (Default: Audio Call)
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'video' ? false : true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState('host'); // 'host', 'interpreter', 'guest'
  const [viewLayout, setViewLayout] = useState('grid'); // 'grid', 'focus'
  const [focusParticipant, setFocusParticipant] = useState('interpreter');

  // Play connection chime & initial greeting on room entry
  useEffect(() => {
    playConnectedChime();
    const timeout = setTimeout(() => {
      if (isVoiceActive) {
        speakText(`Connected. English host ${hostName} is in the room with certified interpreter Elena Rodriguez and client ${patientName}.`, 'en-US');
      }
    }, 800);
    return () => clearTimeout(timeout);
  }, []);

  // Call Duration Timer
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Chat drawer & Interpreter Drawer States
  const [activeDrawer, setActiveDrawer] = useState('chat'); // 'chat', 'glossary', 'none'
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'm1',
      sender: 'System',
      role: 'system',
      text: 'Encrypted 3-party interpretation session established. WebRTC peer connection active.',
      timestamp: '00:01'
    },
    {
      id: 'm2',
      sender: hostName,
      role: 'host',
      text: `Hello Elena, thank you for joining. We have Mr. ${patientName} with us today for a cardiology consultation.`,
      translation: `Hola Elena, gracias por unirte. Tenemos con nosotros hoy al Sr. ${patientName} para una consulta de cardiología.`,
      timestamp: '00:05'
    },
    {
      id: 'm3',
      sender: 'Elena Rodriguez, CCHI',
      role: 'interpreter',
      text: 'Good morning Dr. Jenkins. I am ready to interpret consecutively.',
      translation: 'Buenos días Dra. Jenkins. Estoy lista para interpretar de forma consecutiva.',
      timestamp: '00:08'
    }
  ]);
  const [messageInput, setMessageInput] = useState('');

  // Live Simulated Captions / Transcripts
  const [liveCaption, setLiveCaption] = useState({
    speaker: hostName,
    speakerRole: 'host',
    enText: 'Please ask Mr. Hernandez if he has been experiencing any shortness of breath during light exercise.',
    targetText: 'Por favor pregúntele al Sr. Hernández si ha estado sintiendo falta de aire durante el ejercicio ligero.'
  });

  // Interpreter Pause Banner Alert
  const [pauseBanner, setPauseBanner] = useState(null);

  // Terminology search in-drawer
  const [glossaryQuery, setGlossaryQuery] = useState('');
  const [glossaryCategory, setGlossaryCategory] = useState('All');

  // Debrief Modal on End
  const [showDebrief, setShowDebrief] = useState(false);
  const [callRating, setCallRating] = useState(5);
  const [sessionNotes, setSessionNotes] = useState(
    `Patient confirmed adherence to prescribed ACE inhibitors. Discussed echocardiogram scheduled for next Thursday.`
  );

  // Rotate simulated active speaker periodically & speak audio aloud through speakers
  useEffect(() => {
    const speakerSequence = ['host', 'interpreter', 'guest', 'interpreter'];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % speakerSequence.length;
      const current = speakerSequence[idx];
      setActiveSpeaker(current);

      if (current === 'host') {
        const enLine = 'We reviewed the recent blood lab results and electrolyte levels are completely normal.';
        setLiveCaption({
          speaker: hostName,
          speakerRole: 'host',
          enText: enLine,
          targetText: 'Revisamos los resultados recientes de laboratorio de sangre y los niveles de electrolitos son completamente normales.'
        });
        if (isVoiceActive) {
          speakText(enLine, 'en-US', { pitch: 1.0, rate: 0.95 });
        }
      } else if (current === 'interpreter') {
        const spanishLine = 'El doctor indica que sus análisis de sangre salieron normales.';
        setLiveCaption({
          speaker: 'Elena Rodriguez (Interpreter)',
          speakerRole: 'interpreter',
          enText: `[Interpreting into ${targetLanguage}] "${spanishLine}"`,
          targetText: `[Traduciendo al ${targetLanguage}] "${spanishLine}"`
        });
        if (isVoiceActive) {
          speakText(spanishLine, targetLanguage, { pitch: 1.05, rate: 0.95 });
        }
      } else if (current === 'guest') {
        const guestLine = 'Muchas gracias doctor, me he sentido mucho mejor esta semana.';
        setLiveCaption({
          speaker: `${patientName} (Client)`,
          speakerRole: 'guest',
          enText: '[Client speaking Spanish] "Muchas gracias doctor, me he sentido mucho mejor esta semana."',
          targetText: '[Traducción al inglés] "Thank you very much doctor, I have felt much better this week."'
        });
        if (isVoiceActive) {
          speakText(guestLine, targetLanguage, { pitch: 0.92, rate: 0.95 });
        }
      }
    }, 6500);

    return () => clearInterval(interval);
  }, [hostName, patientName, targetLanguage, isVoiceActive]);

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    // Simple automatic translation generator for interactive demo feel
    let autoTrans = `[${targetLanguage} Translation] ${messageInput}`;
    if (messageInput.toLowerCase().includes('hello') || messageInput.toLowerCase().includes('hi')) {
      autoTrans = 'Hola, ¿cómo está hoy?';
    } else if (messageInput.toLowerCase().includes('medicine') || messageInput.toLowerCase().includes('pill')) {
      autoTrans = 'Por favor tome este medicamento según las indicaciones médicas.';
    }

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: participantName,
      role: role,
      text: messageInput,
      translation: autoTrans,
      timestamp: formatTimer(seconds)
    };

    setChatMessages(prev => [...prev, newMsg]);
    setMessageInput('');
  };

  // Quick phrase trigger
  const handleInsertQuickPhrase = (phraseText) => {
    setMessageInput(phraseText);
  };

  // Interpreter Pause Floor Request
  const handleRequestPause = () => {
    setPauseBanner({
      sender: participantName,
      message: 'The Certified Interpreter requests a brief pause for term clarification and accuracy.'
    });
    setTimeout(() => setPauseBanner(null), 6000);
  };

  const handleEndCallClick = () => {
    setShowDebrief(true);
  };

  const handleConfirmEnd = () => {
    onEndCall({
      duration: formatTimer(seconds),
      seconds: seconds,
      notes: sessionNotes,
      rating: callRating,
      targetLanguage,
      specialty,
      patientName,
      hostName
    });
  };

  // In-drawer glossary search items
  const inDrawerGlossary = [
    { en: 'Myocardial Infarction', es: 'Infarto de Miocardio', ar: 'احتشاء عضلة القلب', zh: '心肌梗死', cat: 'Medical', def: 'Heart attack caused by blocked coronary blood flow.' },
    { en: 'Informed Consent', es: 'Consentimiento Informado', ar: 'الموافقة المستنيرة', zh: '知情同意', cat: 'Medical', def: 'Permission granted understanding all risks & benefits.' },
    { en: 'Hypertension', es: 'Hipertensión Arterial', ar: 'ارتفاع ضغط الدم', zh: '高血压', cat: 'Medical', def: 'Chronically elevated arterial blood pressure.' },
    { en: 'Affidavit', es: 'Declaración Jurada', ar: 'إفادة خطية مشفوعة بيمين', zh: '宣誓书', cat: 'Legal', def: 'Written statement confirmed by oath.' },
    { en: 'Subpoena', es: 'Citación Judicial', ar: 'مذكرة استدعاء', zh: '传票', cat: 'Legal', def: 'Official writ ordering a person to appear in court.' },
    { en: 'Power of Attorney', es: 'Poder Notarial', ar: 'توكيل رسمي', zh: '授权委托书', cat: 'Legal', def: 'Legal authority granted to act on behalf of another.' }
  ].filter(item => {
    const matchesCat = glossaryCategory === 'All' || item.cat === glossaryCategory;
    const matchesQuery = !glossaryQuery || 
      item.en.toLowerCase().includes(glossaryQuery.toLowerCase()) || 
      item.es.toLowerCase().includes(glossaryQuery.toLowerCase()) ||
      item.def.toLowerCase().includes(glossaryQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="h-[calc(100vh-68px)] flex flex-col bg-slate-950 overflow-hidden relative">
      
      {/* Top HUD Bar */}
      <div className="glass-panel border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between z-20 shrink-0">
        
        {/* Left: Call metadata */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-white tracking-wide">
              {formatTimer(seconds)}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800 text-xs">
            <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30">
              {targetLanguage}
            </span>
            <span className="text-slate-400 font-medium">{specialty}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Room: <span className="font-mono text-slate-300">{roomId}</span></span>
          </div>
        </div>

        {/* Center: Security Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>256-Bit Encrypted HIPAA Tunnel</span>
        </div>

        {/* Right: Voice Audio Toggle, Layout & Drawer Toggles */}
        <div className="flex items-center gap-2">
          
          {/* Voice Audio Speaker Output Button */}
          <button
            onClick={() => {
              const next = !isVoiceActive;
              setIsVoiceActive(next);
              setSpeechEnabled(next);
              if (next) {
                speakText('Voice output unmuted. Audio is playing through your computer speakers.', 'en-US');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              isVoiceActive 
                ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/30' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Toggle Real Voice Audio Playback through your speakers"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isVoiceActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span>Voice Speech: {isVoiceActive ? 'ON' : 'MUTED'}</span>
          </button>

          <button
            onClick={() => setViewLayout(viewLayout === 'grid' ? 'focus' : 'grid')}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            title="Toggle Grid / Speaker Spotlight"
          >
            <Layers className="w-4 h-4 text-brand-400" />
          </button>

          <button
            onClick={() => setActiveDrawer(activeDrawer === 'glossary' ? 'none' : 'glossary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              activeDrawer === 'glossary' 
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Open Terminology Glossary"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Glossary</span>
          </button>

          <button
            onClick={() => setActiveDrawer(activeDrawer === 'chat' ? 'none' : 'chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              activeDrawer === 'chat' 
                ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-600/30' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle Chat"
          >
            <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
            <span className="hidden md:inline">Live Chat</span>
            <span className="w-2 h-2 rounded-full bg-brand-400" />
          </button>
        </div>

      </div>

      {/* Main Conference Arena */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left / Center Video Stage */}
        <div className="flex-1 flex flex-col p-3 sm:p-4 gap-3 overflow-y-auto">
          
          {/* Interpreter Pause Alert Banner */}
          {pauseBanner && (
            <div className="glass-panel p-3.5 rounded-2xl bg-amber-500/20 border-2 border-amber-500/80 text-amber-200 flex items-center justify-between animate-bounce shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/30 flex items-center justify-center text-amber-300">
                  <Hand className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-amber-300">
                    Interpreter Floor Pause Request
                  </p>
                  <p className="text-xs text-amber-100">{pauseBanner.message}</p>
                </div>
              </div>
              <button 
                onClick={() => setPauseBanner(null)}
                className="text-amber-300 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 3-Party Video Feeds */}
          <div className={`flex-1 grid gap-3.5 ${
            viewLayout === 'grid' 
              ? 'grid-cols-1 md:grid-cols-3' 
              : 'grid-cols-1 md:grid-cols-4 md:grid-rows-2'
          }`}>
            
            {/* 1. English Host Tile */}
            <div className={`relative rounded-2xl bg-slate-900 border overflow-hidden flex items-center justify-center shadow-lg transition-all ${
              activeSpeaker === 'host' ? 'border-brand-500 ring-2 ring-brand-500/50' : 'border-slate-800'
            } ${viewLayout === 'focus' && focusParticipant === 'host' ? 'md:col-span-3 md:row-span-2' : ''}`}>
              
              {/* Simulated Video Feed Avatar */}
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80"
                    alt={hostName}
                    className="w-24 h-24 rounded-full object-cover shadow-2xl ring-4 ring-brand-500/30"
                  />
                  {activeSpeaker === 'host' && (
                    <div className="absolute -bottom-2 -right-2 flex items-center gap-0.5 bg-brand-600 px-2 py-0.5 rounded-full shadow text-[10px] font-bold text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>Speaking</span>
                    </div>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white mt-3">{hostName}</h4>
                <span className="text-[11px] font-semibold text-brand-400">English Host • Provider</span>
              </div>

              {/* Top Left Role Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-bold text-white">
                <Users className="w-3.5 h-3.5 text-brand-400" />
                <span>English Speaker</span>
              </div>

              {/* Bottom Audio Waveform Meter */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-black/50 backdrop-blur-md">
                <div className="flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] text-slate-300">Live Audio</span>
                </div>
                {activeSpeaker === 'host' ? (
                  <div className="flex items-end gap-1 h-3">
                    <span className="w-1 bg-brand-400 rounded-full wave-bar-1" />
                    <span className="w-1 bg-brand-400 rounded-full wave-bar-2" />
                    <span className="w-1 bg-brand-400 rounded-full wave-bar-3" />
                    <span className="w-1 bg-brand-400 rounded-full wave-bar-4" />
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-500">Listening</span>
                )}
              </div>
            </div>

            {/* 2. Certified Interpreter Tile (Center / Focal) */}
            <div className={`relative rounded-2xl bg-slate-900 border overflow-hidden flex items-center justify-center shadow-lg transition-all ${
              activeSpeaker === 'interpreter' ? 'border-emerald-500 ring-2 ring-emerald-500/50' : 'border-slate-800'
            } ${viewLayout === 'focus' && focusParticipant === 'interpreter' ? 'md:col-span-3 md:row-span-2' : ''}`}>
              
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
                    alt="Elena Rodriguez, CCHI"
                    className="w-24 h-24 rounded-full object-cover shadow-2xl ring-4 ring-emerald-500/30"
                  />
                  {activeSpeaker === 'interpreter' && (
                    <div className="absolute -bottom-2 -right-2 flex items-center gap-0.5 bg-emerald-600 px-2 py-0.5 rounded-full shadow text-[10px] font-bold text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>Translating</span>
                    </div>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white mt-3">Elena Rodriguez, CCHI</h4>
                <span className="text-[11px] font-semibold text-emerald-400">
                  Certified Interpreter (English ⟷ {targetLanguage})
                </span>
              </div>

              {/* Top Left Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-bold text-white">
                <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                <span>Interpreter Hub</span>
              </div>

              {/* Top Right Interpreter Controls */}
              {role === 'interpreter' && (
                <button
                  onClick={handleRequestPause}
                  className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/80 hover:bg-amber-500 text-slate-950 text-[10px] font-extrabold shadow transition"
                  title="Signal floor pause to participants"
                >
                  <Hand className="w-3 h-3" />
                  <span>Pause Floor</span>
                </button>
              )}

              {/* Bottom Audio Waveform */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-black/50 backdrop-blur-md">
                <div className="flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] text-slate-300">Live Audio</span>
                </div>
                {activeSpeaker === 'interpreter' ? (
                  <div className="flex items-end gap-1 h-3">
                    <span className="w-1 bg-emerald-400 rounded-full wave-bar-1" />
                    <span className="w-1 bg-emerald-400 rounded-full wave-bar-2" />
                    <span className="w-1 bg-emerald-400 rounded-full wave-bar-3" />
                    <span className="w-1 bg-emerald-400 rounded-full wave-bar-4" />
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-500">Listening</span>
                )}
              </div>
            </div>

            {/* 3. Non-English Client Tile */}
            <div className={`relative rounded-2xl bg-slate-900 border overflow-hidden flex items-center justify-center shadow-lg transition-all ${
              activeSpeaker === 'guest' ? 'border-amber-500 ring-2 ring-amber-500/50' : 'border-slate-800'
            } ${viewLayout === 'focus' && focusParticipant === 'guest' ? 'md:col-span-3 md:row-span-2' : ''}`}>
              
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-2xl font-bold shadow-2xl ring-4 ring-amber-500/30">
                    {patientName.charAt(0)}
                  </div>
                  {activeSpeaker === 'guest' && (
                    <div className="absolute -bottom-2 -right-2 flex items-center gap-0.5 bg-amber-600 px-2 py-0.5 rounded-full shadow text-[10px] font-bold text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>Speaking</span>
                    </div>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white mt-3">{patientName}</h4>
                <span className="text-[11px] font-semibold text-amber-400">
                  Client • {targetLanguage} Speaker
                </span>
              </div>

              {/* Top Left Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-bold text-white">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>Non-English Guest</span>
              </div>

              {/* Bottom Audio Waveform */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-black/50 backdrop-blur-md">
                <div className="flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] text-slate-300">Live Audio</span>
                </div>
                {activeSpeaker === 'guest' ? (
                  <div className="flex items-end gap-1 h-3">
                    <span className="w-1 bg-amber-400 rounded-full wave-bar-1" />
                    <span className="w-1 bg-amber-400 rounded-full wave-bar-2" />
                    <span className="w-1 bg-amber-400 rounded-full wave-bar-3" />
                    <span className="w-1 bg-amber-400 rounded-full wave-bar-4" />
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-500">Listening</span>
                )}
              </div>
            </div>

          </div>

          {/* Live AI Transcription & Captions Stream */}
          <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-400">
                    Live Spoken Dialogue
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">• {liveCaption.speaker}</span>
                </div>
                <p className="text-xs font-medium text-white truncate sm:whitespace-normal">
                  "{liveCaption.enText}"
                </p>
                <p className="text-[11px] font-medium text-slate-400 truncate sm:whitespace-normal italic">
                  ↳ "{liveCaption.targetText}"
                </p>
              </div>
            </div>

            {/* Listen Button for User */}
            <button
              onClick={() => {
                if (liveCaption.speakerRole === 'host') {
                  speakText(liveCaption.enText, 'en-US');
                } else if (liveCaption.speakerRole === 'interpreter') {
                  speakText('El doctor indica que sus análisis de sangre salieron normales.', targetLanguage);
                } else {
                  speakText('Muchas gracias doctor, me he sentido mucho mejor esta semana.', targetLanguage);
                }
              }}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition shrink-0 transform hover:scale-105"
              title="Click to play this voice line aloud through your computer speakers"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">Play Voice</span>
            </button>
          </div>

        </div>

        {/* Right Drawer: Live Chat or Terminology Glossary */}
        {activeDrawer !== 'none' && (
          <div className="w-80 md:w-96 border-l border-slate-800 bg-slate-900/95 flex flex-col z-10 shrink-0">
            
            {/* Drawer Header with tabs */}
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveDrawer('chat')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activeDrawer === 'chat' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  3-Way Chat
                </button>
                <button
                  onClick={() => setActiveDrawer('glossary')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activeDrawer === 'glossary' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Glossary HUD
                </button>
              </div>

              <button 
                onClick={() => setActiveDrawer('none')}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TAB 1: Chat View */}
            {activeDrawer === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* Quick Phrases bar for instant insertion */}
                <div className="p-2 border-b border-slate-800/80 bg-slate-950/60 overflow-x-auto flex gap-1.5">
                  {QUICK_PHRASES.map((qp) => (
                    <button
                      key={qp.id}
                      onClick={() => handleInsertQuickPhrase(qp.text)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold shrink-0 transition"
                      title={qp.text}
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {chatMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`p-3 rounded-xl text-xs space-y-1 ${
                        msg.role === 'system' 
                          ? 'bg-slate-950/80 border border-slate-800/80 text-slate-400 text-center text-[10px]' 
                          : msg.role === role 
                            ? 'bg-brand-600/20 border border-brand-500/40 ml-4' 
                            : 'bg-slate-800/60 border border-slate-700/60 mr-4'
                      }`}
                    >
                      {msg.role !== 'system' && (
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                          <span className={msg.role === 'interpreter' ? 'text-emerald-400' : msg.role === 'host' ? 'text-brand-400' : 'text-amber-400'}>
                            {msg.sender}
                          </span>
                          <span>{msg.timestamp}</span>
                        </div>
                      )}
                      <p className="text-slate-100 font-medium">{msg.text}</p>
                      {msg.translation && (
                        <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-700/40">
                          ↳ {msg.translation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Message input */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type message with auto-translation..."
                    className="flex-1 glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </div>
            )}

            {/* TAB 2: In-Call Glossary View */}
            {activeDrawer === 'glossary' && (
              <div className="flex-1 flex flex-col overflow-hidden p-3 space-y-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={glossaryQuery}
                    onChange={(e) => setGlossaryQuery(e.target.value)}
                    placeholder="Search medical / legal terms..."
                    className="w-full glass-input pl-8 pr-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex gap-1.5 text-[10px] font-bold">
                  {['All', 'Medical', 'Legal'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setGlossaryCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        glossaryCategory === cat ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {inDrawerGlossary.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{item.en}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400">
                          {item.cat}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-amber-300">
                        {targetLanguage === 'Arabic' ? item.ar : targetLanguage === 'Mandarin Chinese' ? item.zh : item.es}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight pt-1 border-t border-slate-800/60">
                        {item.def}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Bottom Conference Control Bar */}
      <div className="glass-panel border-t border-slate-800/80 px-4 py-3 flex items-center justify-between z-20 shrink-0">
        
        {/* Left info */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
          <span>Role: <strong className="text-white capitalize">{role}</strong></span>
          <span>•</span>
          <span>Modality: <strong className="text-emerald-400">{callType === 'video' && !isVideoOff ? 'HD Video + Audio' : 'Audio Mode (Active)'}</strong></span>
        </div>

        {/* Center Main Controls */}
        <div className="flex items-center gap-3 mx-auto">
          {/* Mute Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-2xl backdrop-blur-md font-semibold text-xs flex items-center gap-2 transition ${
              isMuted 
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Video Toggle */}
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-3.5 rounded-2xl backdrop-blur-md font-semibold text-xs flex items-center gap-2 transition ${
              isVideoOff 
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            title={isVideoOff ? 'Start Video' : 'Stop Video'}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Screen Share */}
          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`p-3.5 rounded-2xl backdrop-blur-md font-semibold text-xs flex items-center gap-2 transition hidden sm:flex ${
              isScreenSharing 
                ? 'bg-brand-500 text-white' 
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            title="Share Screen"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* Interpreter Pause Alert Button */}
          {role === 'interpreter' && (
            <button
              onClick={handleRequestPause}
              className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-2 transition"
              title="Request Pause Floor"
            >
              <Hand className="w-5 h-5 text-amber-400 animate-pulse" />
              <span className="hidden md:inline">Request Pause</span>
            </button>
          )}

          {/* End Call Button */}
          <button
            onClick={handleEndCallClick}
            className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-xl shadow-red-600/30 flex items-center gap-2 transition transform hover:scale-105"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Call</span>
          </button>
        </div>

        {/* Right empty spacer for center alignment */}
        <div className="hidden sm:block w-24" />

      </div>

      {/* Post-Call Debrief & Summary Modal */}
      {showDebrief && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full glass-panel p-8 rounded-3xl border border-slate-700 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-white">Interpretation Session Complete</h3>
                <p className="text-xs text-slate-400 mt-0.5">Session #{roomId} • {targetLanguage} ({specialty})</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Check className="w-5 h-5" />
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold">Total Duration</span>
                <p className="text-lg font-black text-white">{formatTimer(seconds)}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold">Calculated Cost</span>
                <p className="text-lg font-black text-emerald-400">
                  \${((seconds / 60) * 0.95 + 2.50).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Rate Interpreter Quality</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setCallRating(star)}
                    className="p-1 text-amber-400 hover:scale-125 transition"
                  >
                    <Star className={`w-6 h-6 ${star <= callRating ? 'fill-amber-400' : 'text-slate-600'}`} />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-400 ml-2">{callRating}.0 / 5.0</span>
              </div>
            </div>

            {/* Session Notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Clinical / Case Notes Summary</label>
              <textarea
                rows={3}
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="w-full glass-input p-3 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDebrief(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Return to Call
              </button>
              <button
                onClick={handleConfirmEnd}
                className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-lg shadow-brand-600/30"
              >
                Submit & Close Session
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
