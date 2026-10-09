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
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export default function JitsiMeetingRoom({
  roomId = 'room-default',
  role = 'guest',
  participantName = 'Participant',
  targetLanguage = 'Urdu',
  specialty = 'General / Medical Support',
  onEndCall
}) {
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [activeTab, setActiveTab] = useState('call'); // 'call', 'glossary'

  // Standardized Clean Numeric Badge ID for Interpreters
  const isInterpreter = role === 'interpreter';
  const displayName = isInterpreter 
    ? (participantName.startsWith('Interpreter #') ? participantName : `Interpreter #${participantName.replace(/\D/g, '') || '87265'}`)
    : participantName;

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

  // Initialize Jitsi Meet Embedded Engine (Carrier-grade HD audio/video with global SFU)
  useEffect(() => {
    const initJitsi = () => {
      if (!window.JitsiMeetExternalAPI || !jitsiContainerRef.current) {
        setTimeout(initJitsi, 300);
        return;
      }

      if (jitsiApiRef.current) {
        try { jitsiApiRef.current.dispose(); } catch (e) {}
      }

      // Unique sanitized room domain for LinguaBridge
      const sanitizedRoomName = `LinguaBridge-${roomId.replace(/[^a-zA-Z0-9]/g, '')}`;
      const domain = 'meet.jit.si';

      const options = {
        roomName: sanitizedRoomName,
        parentNode: jitsiContainerRef.current,
        width: '100%',
        height: '100%',
        userInfo: {
          displayName: `${displayName} (${role.toUpperCase()})`
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableNoiseSuppression: true,
          enableClosePage: false,
          disableDeepLinking: true,
          prejoinPageEnabled: false,
          hideConferenceSubject: true,
          hideConferenceTimer: false,
          toolbarButtons: [
            'microphone',
            'camera',
            'closedcaptions',
            'desktop',
            'fullscreen',
            'chat',
            'raisehand',
            'tileview',
            'hangup'
          ]
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          TOOLBAR_ALWAYS_VISIBLE: true,
          DEFAULT_BACKGROUND: '#020617',
          DEFAULT_LOCAL_DISPLAY_NAME: displayName
        }
      };

      try {
        const api = new window.JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;

        api.addEventListener('videoConferenceLeft', () => {
          if (onEndCall) onEndCall({ seconds });
        });

        api.addEventListener('readyToClose', () => {
          if (onEndCall) onEndCall({ seconds });
        });
      } catch (err) {
        console.warn('[Jitsi Embed Notice]:', err);
      }
    };

    initJitsi();

    return () => {
      if (jitsiApiRef.current) {
        try { jitsiApiRef.current.dispose(); } catch (e) {}
      }
    };
  }, [roomId, displayName, role]);

  const copyGuestInviteLink = () => {
    const link = `${window.location.origin}/?roomId=${roomId}&role=guest&lang=${encodeURIComponent(targetLanguage)}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
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
                LinguaBridge Live 3-Way Room
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-black text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                HD Audio Live
              </span>
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-2">
              <span>Room: <strong className="text-slate-200">{roomId}</strong></span>
              <span>•</span>
              <span className="text-brand-300 font-bold">{targetLanguage}</span>
              <span>•</span>
              <span>{formatTimer(seconds)}</span>
            </p>
          </div>
        </div>

        {/* Actions & Invite Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyGuestInviteLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition cursor-pointer"
            title="Copy patient join link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-brand-400" />}
            <span className="hidden sm:inline">{copiedLink ? 'Link Copied!' : 'Invite Patient'}</span>
          </button>

          <button
            onClick={() => {
              if (onEndCall) onEndCall({ seconds });
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-lg shadow-red-600/30 transition cursor-pointer"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>Leave</span>
          </button>
        </div>
      </header>

      {/* Main Calling Container */}
      <main className="flex-1 relative overflow-hidden bg-slate-950">
        <div ref={jitsiContainerRef} className="w-full h-full" />
      </main>

    </div>
  );
}
