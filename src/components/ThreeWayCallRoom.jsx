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
  ShieldCheck, 
  Sparkles, 
  Send, 
  Globe, 
  Users, 
  Headphones, 
  Clock, 
  Star, 
  Check, 
  X,
  Layers,
  Search,
  CheckCircle2,
  Award,
  Radio
} from 'lucide-react';
import { QUICK_PHRASES, LANGUAGES } from '../data/mockData';
import { 
  speakText, 
  playConnectedChime, 
  playMessageTone, 
  playPauseFloorAlert, 
  setSpeechEnabled 
} from '../services/audioService';
import { getSocket } from '../services/socket';

export default function ThreeWayCallRoom({ 
  sessionData = {}, 
  onEndCall, 
  onOpenGlossary 
}) {
  const hostName = sessionData.hostName || sessionData.mainClientName || 'Main Client (Payer)';
  const interpreterName = sessionData.interpreter?.name || sessionData.interpreterName || 'Certified Interpreter';
  const interpreterCert = Array.isArray(sessionData.interpreter?.certifications) 
    ? sessionData.interpreter.certifications[0] 
    : (sessionData.interpreter?.certifications || 'Certified Professional Linguist');
  const interpreterAvatar = sessionData.interpreter?.avatar || null;
  const patientName = sessionData.patientName || sessionData.guestName || 'Non-English Client';
  const targetLanguage = sessionData.targetLanguage || sessionData.language || 'Urdu';
  const specialty = sessionData.specialty || 'General / Customer Support';
  const role = sessionData.role || 'host';
  const roomId = sessionData.roomId || `room-${Date.now().toString(36).slice(-6)}`;
  const callType = sessionData.callType || 'audio';

  // Real Audible Voice Output State
  const [isVoiceActive, setIsVoiceActive] = useState(true);

  // Media States for Current User
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'video' ? false : true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(role); // 'host', 'interpreter', 'guest'
  const [viewLayout, setViewLayout] = useState('grid'); // 'grid', 'focus'
  const [focusParticipant, setFocusParticipant] = useState('interpreter');

  // Real microphone audio level detection
  const [micAudioLevel, setMicAudioLevel] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Real Speech-to-Text Recognition
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const recognitionRef = useRef(null);

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

  // Connected Participants in this Room via Socket
  const [roomParticipants, setRoomParticipants] = useState([
    { role: 'host', name: hostName, status: 'connected' },
    { role: 'interpreter', name: interpreterName, status: 'connected' },
    { role: 'guest', name: patientName, status: 'connected' }
  ]);

  // Chat drawer & Interpreter Drawer States
  const [activeDrawer, setActiveDrawer] = useState('chat'); // 'chat', 'glossary', 'none'
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'm1',
      sender: 'System',
      role: 'system',
      text: `Secure 3-Party Room (${roomId}) established between ${hostName}, ${interpreterName} (${targetLanguage}), and ${patientName}.`,
      timestamp: '00:01'
    }
  ]);
  const [messageInput, setMessageInput] = useState('');

  // Live Captions / Spoken Transcripts
  const [liveCaption, setLiveCaption] = useState({
    speaker: interpreterName,
    speakerRole: 'interpreter',
    enText: `Live 3-party session active between ${hostName} and ${patientName}. Certified ${targetLanguage} interpretation in progress.`,
    targetText: `Audio connected. Speak clearly into your microphone.`
  });

  // Interpreter Pause Banner Alert
  const [pauseBanner, setPauseBanner] = useState(null);

  // Terminology search in-drawer
  const [glossaryQuery, setGlossaryQuery] = useState('');
  const [glossaryCategory, setGlossaryCategory] = useState('All');

  // Debrief Modal on End
  const [showDebrief, setShowDebrief] = useState(false);
  const [callRating, setCallRating] = useState(5);
  const [sessionNotes, setSessionNotes] = useState('3-party interpretation session completed successfully.');

  // Initialize Socket.io Connection for this room
  useEffect(() => {
    playConnectedChime();
    const socket = getSocket();

    if (socket) {
      socket.emit('join-room', {
        roomId,
        role,
        participantName: role === 'host' ? hostName : role === 'interpreter' ? interpreterName : patientName,
        language: targetLanguage,
        specialty
      });

      socket.on('new-chat-message', (msg) => {
        setChatMessages(prev => [...prev, msg]);
        playMessageTone();
      });

      socket.on('interpreter-pause-alert', (alert) => {
        setPauseBanner(alert);
        playPauseFloorAlert();
        setTimeout(() => setPauseBanner(null), 8000);
      });

      socket.on('participant-joined', (p) => {
        setChatMessages(prev => [
          ...prev, 
          {
            id: `sys-${Date.now()}`,
            sender: 'System',
            role: 'system',
            text: `${p.name} (${p.role}) has entered the 3-party room.`,
            timestamp: formatTimer(seconds)
          }
        ]);
      });
    }

    // Initialize real microphone audio stream & volume level meter
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then((stream) => {
          mediaStreamRef.current = stream;
          try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
              const audioCtx = new AudioCtx();
              audioContextRef.current = audioCtx;
              const analyser = audioCtx.createAnalyser();
              analyserRef.current = analyser;
              analyser.fftSize = 64;
              const source = audioCtx.createMediaStreamSource(stream);
              source.connect(analyser);

              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              const checkVolume = () => {
                if (!analyserRef.current || isMuted) {
                  setMicAudioLevel(0);
                } else {
                  analyserRef.current.getByteFrequencyData(dataArray);
                  let sum = 0;
                  for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                  }
                  const avg = sum / dataArray.length;
                  const normalized = Math.min(100, Math.floor((avg / 128) * 100));
                  setMicAudioLevel(normalized);

                  if (normalized > 15) {
                    setActiveSpeaker(role);
                  }
                }
                requestAnimationFrame(checkVolume);
              };
              requestAnimationFrame(checkVolume);
            }
          } catch (e) {
            console.warn('Web Audio meter not available in current environment:', e);
          }
        })
        .catch(() => {
          console.log('Microphone permission not granted or running in simulation.');
        });
    }

    // Initialize browser Web Speech Recognition if available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = role === 'guest' ? (targetLanguage === 'Urdu' ? 'ur-PK' : targetLanguage === 'Arabic' ? 'ar-SA' : 'es-ES') : 'en-US';

        recognition.onresult = (event) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          setSpeechTranscript(transcript);
          
          const speakerDisplayName = role === 'host' ? hostName : role === 'interpreter' ? interpreterName : patientName;
          setLiveCaption({
            speaker: speakerDisplayName,
            speakerRole: role,
            enText: transcript,
            targetText: `[Live transcription from ${speakerDisplayName}]`
          });
        };

        recognition.onerror = () => {};
        recognition.start();
        recognitionRef.current = recognition;
        setIsListeningSpeech(true);
      } catch (e) {
        console.warn('Speech recognition initialized:', e);
      }
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
      }
    };
  }, []);

  // Send message in 3-Way Chat
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const senderDisplayName = role === 'host' ? hostName : role === 'interpreter' ? interpreterName : patientName;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: senderDisplayName,
      role: role,
      text: messageInput,
      timestamp: formatTimer(seconds)
    };

    setChatMessages(prev => [...prev, newMsg]);

    const socket = getSocket();
    if (socket) {
      socket.emit('send-chat-message', {
        roomId,
        senderName: senderDisplayName,
        senderRole: role,
        text: messageInput
      });
    }

    // Update live dialogue box with latest message
    setLiveCaption({
      speaker: senderDisplayName,
      speakerRole: role,
      enText: messageInput,
      targetText: `Spoken / Sent by ${senderDisplayName}`
    });

    setMessageInput('');
  };

  const handleInsertQuickPhrase = (phraseText) => {
    setMessageInput(phraseText);
  };

  // Interpreter Pause Floor Request
  const handleRequestPause = () => {
    const senderDisplayName = role === 'interpreter' ? interpreterName : hostName;
    const banner = {
      sender: senderDisplayName,
      message: `${senderDisplayName} requests a brief pause for term clarification and accurate interpretation.`
    };
    setPauseBanner(banner);
    playPauseFloorAlert();

    const socket = getSocket();
    if (socket) {
      socket.emit('interpreter-request-pause', {
        roomId,
        interpreterName: senderDisplayName,
        message: banner.message
      });
    }

    setTimeout(() => setPauseBanner(null), 8000);
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
      hostName,
      interpreterName
    });
  };

  // In-drawer glossary search items
  const inDrawerGlossary = [
    { en: 'Informed Consent', ur: 'باخبر رضامندی (Informed Consent)', es: 'Consentimiento Informado', ar: 'الموافقة المستنيرة', cat: 'Medical', def: 'Permission granted understanding all medical risks & benefits.' },
    { en: 'Myocardial Infarction', ur: 'دل کا دورہ / ہارٹ اٹیک (Heart Attack)', es: 'Infarto de Miocardio', ar: 'احتشاء عضلة القلب', cat: 'Medical', def: 'Heart muscle necrosis caused by blocked coronary artery.' },
    { en: 'Hypertension', ur: 'ہائی بلڈ پریشر (High BP)', es: 'Hipertensión Arterial', ar: 'ارتفاع ضغط الدم', cat: 'Medical', def: 'Chronically elevated arterial blood pressure.' },
    { en: 'Affidavit', ur: 'بیان حلفی / حلف نامہ (Affidavit)', es: 'Declaración Jurada', ar: 'إفادة خطية مشفوعة بيمين', cat: 'Legal', def: 'Written statement confirmed by oath in legal proceedings.' },
    { en: 'Subpoena', ur: 'عدالتی سمن (Subpoena)', es: 'Citación Judicial', ar: 'مذكرة استدعاء', cat: 'Legal', def: 'Official writ ordering a person to appear in court.' },
    { en: 'Power of Attorney', ur: 'مختار نامہ / پاور آف اٹارنی', es: 'Poder Notarial', ar: 'توكيل رسمي', cat: 'Legal', def: 'Legal authority granted to act on behalf of another party.' }
  ].filter(item => {
    const matchesCat = glossaryCategory === 'All' || item.cat === glossaryCategory;
    const matchesQuery = !glossaryQuery || 
      item.en.toLowerCase().includes(glossaryQuery.toLowerCase()) || 
      (item.ur && item.ur.toLowerCase().includes(glossaryQuery.toLowerCase())) ||
      (item.es && item.es.toLowerCase().includes(glossaryQuery.toLowerCase())) ||
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
              English ⟷ {targetLanguage}
            </span>
            <span className="text-slate-400 font-medium">{specialty}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Room: <span className="font-mono text-slate-300">{roomId}</span></span>
          </div>
        </div>

        {/* Center: Security Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Real-Time Encrypted 3-Party Conference</span>
        </div>

        {/* Right: Layout & Drawer Toggles */}
        <div className="flex items-center gap-2">
          
          {/* Audio Output Playback Toggle */}
          <button
            onClick={() => {
              const next = !isVoiceActive;
              setIsVoiceActive(next);
              setSpeechEnabled(next);
              if (next) {
                speakText('Voice output active.', 'en-US');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              isVoiceActive 
                ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40 shadow-sm' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Toggle Voice Output"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isVoiceActive ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span className="hidden md:inline">Voice: {isVoiceActive ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setViewLayout(viewLayout === 'grid' ? 'focus' : 'grid')}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            title="Toggle Grid / Spotlight Layout"
          >
            <Layers className="w-4 h-4 text-brand-400" />
          </button>

          <button
            onClick={() => setActiveDrawer(activeDrawer === 'glossary' ? 'none' : 'glossary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              activeDrawer === 'glossary' 
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md' 
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
                ? 'bg-brand-600 text-white border-brand-500 shadow-md' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle Live Chat"
          >
            <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
            <span className="hidden md:inline">3-Way Chat</span>
          </button>
        </div>

      </div>

      {/* Main Conference Arena */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left / Center Video & Audio Stage */}
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
                    Interpreter Floor Pause Signal
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

          {/* 3-Party Video & Audio Feeds */}
          <div className={`flex-1 grid gap-3.5 ${
            viewLayout === 'grid' 
              ? 'grid-cols-1 md:grid-cols-3' 
              : 'grid-cols-1 md:grid-cols-4 md:grid-rows-2'
          }`}>
            
            {/* TILE 1: Main Client (Payer / Host) */}
            <div className={`relative rounded-2xl bg-slate-900 border overflow-hidden flex items-center justify-center shadow-lg transition-all ${
              activeSpeaker === 'host' ? 'border-brand-500 ring-2 ring-brand-500/50' : 'border-slate-800'
            } ${viewLayout === 'focus' && focusParticipant === 'host' ? 'md:col-span-3 md:row-span-2' : ''}`}>
              
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-2xl ring-4 ring-brand-500/30">
                    {hostName.charAt(0).toUpperCase()}
                  </div>
                  {activeSpeaker === 'host' && (
                    <div className="absolute -bottom-2 -right-2 flex items-center gap-0.5 bg-brand-600 px-2 py-0.5 rounded-full shadow text-[10px] font-bold text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>Speaking</span>
                    </div>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white mt-3 truncate max-w-[200px]">{hostName}</h4>
                <span className="text-[11px] font-semibold text-brand-400">Main Client • English Speaker</span>
              </div>

              {/* Top Left Role Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-bold text-white">
                <Users className="w-3.5 h-3.5 text-brand-400" />
                <span>Client / Host</span>
              </div>

              {/* Bottom Audio Waveform Meter */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-black/50 backdrop-blur-md">
                <div className="flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] text-slate-300">Live Audio</span>
                </div>
                {role === 'host' && micAudioLevel > 5 ? (
                  <div className="flex items-end gap-1 h-3">
                    <span className="w-1 bg-brand-400 rounded-full animate-pulse" style={{ height: `${Math.min(100, micAudioLevel * 1.2)}%` }} />
                    <span className="w-1 bg-brand-400 rounded-full animate-pulse" style={{ height: `${Math.min(100, micAudioLevel * 0.9)}%` }} />
                    <span className="w-1 bg-brand-400 rounded-full animate-pulse" style={{ height: `${Math.min(100, micAudioLevel * 1.4)}%` }} />
                    <span className="w-1 bg-brand-400 rounded-full animate-pulse" style={{ height: `${Math.min(100, micAudioLevel * 0.7)}%` }} />
                  </div>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Active</span>
                  </span>
                )}
              </div>
            </div>

            {/* TILE 2: Certified Interpreter (Center Focal) */}
            <div className={`relative rounded-2xl bg-slate-900 border overflow-hidden flex items-center justify-center shadow-lg transition-all ${
              activeSpeaker === 'interpreter' ? 'border-emerald-500 ring-2 ring-emerald-500/50' : 'border-slate-800'
            } ${viewLayout === 'focus' && focusParticipant === 'interpreter' ? 'md:col-span-3 md:row-span-2' : ''}`}>
              
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="relative">
                  {interpreterAvatar ? (
                    <img
                      src={interpreterAvatar}
                      alt={interpreterName}
                      className="w-24 h-24 rounded-full object-cover shadow-2xl ring-4 ring-emerald-500/30"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-3xl font-black shadow-2xl ring-4 ring-emerald-500/30">
                      {interpreterName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {activeSpeaker === 'interpreter' && (
                    <div className="absolute -bottom-2 -right-2 flex items-center gap-0.5 bg-emerald-600 px-2 py-0.5 rounded-full shadow text-[10px] font-bold text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>Interpreting</span>
                    </div>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white mt-3 truncate max-w-[200px]">{interpreterName}</h4>
                <span className="text-[11px] font-semibold text-emerald-400">
                  Certified Interpreter (English ⟷ {targetLanguage})
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                  {interpreterCert}
                </span>
              </div>

              {/* Top Left Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-bold text-white">
                <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                <span>Certified Linguist</span>
              </div>

              {/* Top Right Pause Action */}
              <button
                onClick={handleRequestPause}
                className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/80 hover:bg-amber-500 text-slate-950 text-[10px] font-extrabold shadow transition"
                title="Signal floor pause to participants"
              >
                <Hand className="w-3 h-3" />
                <span>Pause Floor</span>
              </button>

              {/* Bottom Audio Waveform */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-black/50 backdrop-blur-md">
                <div className="flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] text-slate-300">Live Channel</span>
                </div>
                {role === 'interpreter' && micAudioLevel > 5 ? (
                  <div className="flex items-end gap-1 h-3">
                    <span className="w-1 bg-emerald-400 rounded-full animate-pulse" style={{ height: `${Math.min(100, micAudioLevel * 1.2)}%` }} />
                    <span className="w-1 bg-emerald-400 rounded-full animate-pulse" style={{ height: `${Math.min(100, micAudioLevel * 0.9)}%` }} />
                    <span className="w-1 bg-emerald-400 rounded-full animate-pulse" style={{ height: `${Math.min(100, micAudioLevel * 1.4)}%` }} />
                    <span className="w-1 bg-emerald-400 rounded-full animate-pulse" style={{ height: `${Math.min(100, micAudioLevel * 0.7)}%` }} />
                  </div>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Active Feed</span>
                  </span>
                )}
              </div>
            </div>

            {/* TILE 3: Non-English Guest / Client */}
            <div className={`relative rounded-2xl bg-slate-900 border overflow-hidden flex items-center justify-center shadow-lg transition-all ${
              activeSpeaker === 'guest' ? 'border-amber-500 ring-2 ring-amber-500/50' : 'border-slate-800'
            } ${viewLayout === 'focus' && focusParticipant === 'guest' ? 'md:col-span-3 md:row-span-2' : ''}`}>
              
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-3xl font-black shadow-2xl ring-4 ring-amber-500/30">
                    {patientName.charAt(0).toUpperCase()}
                  </div>
                  {activeSpeaker === 'guest' && (
                    <div className="absolute -bottom-2 -right-2 flex items-center gap-0.5 bg-amber-600 px-2 py-0.5 rounded-full shadow text-[10px] font-bold text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>Speaking</span>
                    </div>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white mt-3 truncate max-w-[200px]">{patientName}</h4>
                <span className="text-[11px] font-semibold text-amber-400">
                  Guest Client • {targetLanguage} Speaker
                </span>
              </div>

              {/* Top Left Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-bold text-white">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>Guest Counter-Party</span>
              </div>

              {/* Bottom Audio Waveform */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-black/50 backdrop-blur-md">
                <div className="flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] text-slate-300">Live Channel</span>
                </div>
                {role === 'guest' && micAudioLevel > 5 ? (
                  <div className="flex items-end gap-1 h-3">
                    <span className="w-1 bg-amber-400 rounded-full animate-pulse" style={{ height: `${Math.min(100, micAudioLevel * 1.2)}%` }} />
                    <span className="w-1 bg-amber-400 rounded-full animate-pulse" style={{ height: `${Math.min(100, micAudioLevel * 0.9)}%` }} />
                    <span className="w-1 bg-amber-400 rounded-full animate-pulse" style={{ height: `${Math.min(100, micAudioLevel * 1.4)}%` }} />
                    <span className="w-1 bg-amber-400 rounded-full animate-pulse" style={{ height: `${Math.min(100, micAudioLevel * 0.7)}%` }} />
                  </div>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Connected</span>
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Live Spoken Dialogue & Captions Bar */}
          <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                    Live Session Dialogue
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">• {liveCaption.speaker}</span>
                </div>
                <p className="text-xs font-medium text-white truncate sm:whitespace-normal">
                  "{liveCaption.enText}"
                </p>
                <p className="text-[11px] font-medium text-slate-400 truncate sm:whitespace-normal italic">
                  ↳ {liveCaption.targetText}
                </p>
              </div>
            </div>

            {/* Listen Button */}
            <button
              onClick={() => {
                speakText(liveCaption.enText, 'en-US');
              }}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition shrink-0 transform hover:scale-105"
              title="Click to hear speech aloud"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">Play Voice</span>
            </button>
          </div>

        </div>

        {/* Right Drawer: Live 3-Way Chat or Terminology Glossary */}
        {activeDrawer !== 'none' && (
          <div className="w-80 md:w-96 border-l border-slate-800 bg-slate-900/95 flex flex-col z-10 shrink-0">
            
            {/* Drawer Header */}
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
                
                {/* Quick Phrases bar */}
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
                    </div>
                  ))}
                </div>

                {/* Message input */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type message to all 3 parties..."
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
                        {targetLanguage === 'Urdu' ? item.ur : targetLanguage === 'Arabic' ? item.ar : item.es}
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
          <span>Your Role: <strong className="text-white capitalize">{role === 'host' ? 'Main Client' : role}</strong></span>
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
          <button
            onClick={handleRequestPause}
            className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-2 transition"
            title="Request Pause Floor"
          >
            <Hand className="w-5 h-5 text-amber-400" />
            <span className="hidden md:inline">Pause Floor</span>
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCallClick}
            className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-xl shadow-red-600/30 flex items-center gap-2 transition transform hover:scale-105"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call</span>
          </button>
        </div>

        {/* Right Info */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-400">Room Active (3 Parties)</span>
        </div>

      </div>

      {/* Post-Call Debrief Modal */}
      {showDebrief && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 shadow-2xl text-white">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold">3-Party Session Completed</h3>
              <p className="text-xs text-slate-400">Duration: <strong>{formatTimer(seconds)}</strong> ({targetLanguage})</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-300">Rate Session Quality:</label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCallRating(star)}
                    className="p-1 transition transform hover:scale-110"
                  >
                    <Star className={`w-6 h-6 ${star <= callRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-300">Session Notes & Summary:</label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                rows={3}
                className="w-full glass-input p-3 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowDebrief(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Return to Call
              </button>
              <button
                type="button"
                onClick={handleConfirmEnd}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30"
              >
                Complete & Log Session
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
