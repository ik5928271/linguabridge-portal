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
  Radio,
  MonitorUp
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
  
  // Official Numeric Badge ID for Interpreter Privacy ("The Gap")
  const interpreterBadgeNumber = sessionData.interpreter?.badgeNumber || 
    sessionData.interpreter?.interpreterBadgeId || 
    sessionData.interpreterBadgeNumber || 
    sessionData.interpreterBadgeId || 
    (sessionData.interpreterName?.replace(/\D/g, '') || '84920');

  const interpreterDisplayName = `Interpreter #${interpreterBadgeNumber}`;
  const interpreterName = interpreterDisplayName;

  const interpreterCert = Array.isArray(sessionData.interpreter?.certifications) 
    ? sessionData.interpreter.certifications[0] 
    : (sessionData.interpreter?.certifications || 'Certified Professional Linguist');
  const interpreterAvatar = sessionData.interpreter?.avatar || null;
  const patientName = sessionData.patientName || sessionData.guestName || 'Non-English Client';
  const [targetLanguage, setTargetLanguage] = useState(sessionData.targetLanguage || sessionData.language || 'Urdu');
  const [specialty, setSpecialty] = useState(sessionData.specialty || 'General / Customer Support');
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
  const [showAudioUnlockNotice, setShowAudioUnlockNotice] = useState(false);
  const [remoteAudioCount, setRemoteAudioCount] = useState(0);

  // Real microphone audio level detection & WebRTC Multi-Peer Mesh
  const [micAudioLevel, setMicAudioLevel] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const peersRef = useRef({}); // remoteSocketId -> RTCPeerConnection
  const remoteAudiosRef = useRef({}); // remoteSocketId -> HTMLAudioElement
  const remoteStreamsRef = useRef({}); // remoteSocketId -> MediaStream
  const screenStreamRef = useRef(null);
  const localScreenVideoRef = useRef(null);
  const lastSpeakingEmitRef = useRef(0);
  const isMutedRef = useRef(isMuted);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // WebRTC ICE Servers Configuration (Multi-STUN + Cloudflare + Twilio + Metered)
  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      { urls: 'stun:stun.cloudflare.com:3478' },
      { urls: 'stun:global.stun.twilio.com:3478' },
      { urls: 'stun:stun.services.mozilla.com' },
      { urls: 'stun:stun.relay.metered.ca:80' }
    ]
  };

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

  // Helper to attach and play incoming live remote audio stream
  const attachAndPlayRemoteAudio = (remoteSocketId, stream) => {
    try {
      let audioEl = remoteAudiosRef.current[remoteSocketId];
      if (!audioEl) {
        audioEl = document.createElement('audio');
        audioEl.id = `remote-audio-${remoteSocketId}`;
        audioEl.autoplay = true;
        audioEl.playsInline = true;
        audioEl.setAttribute('autoplay', 'true');
        audioEl.setAttribute('playsinline', 'true');
        audioEl.style.display = 'none';
        document.body.appendChild(audioEl);
        remoteAudiosRef.current[remoteSocketId] = audioEl;
      }
      audioEl.srcObject = stream;
      audioEl.volume = 1.0;
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setRemoteAudioCount(Object.keys(remoteAudiosRef.current).length);
            setShowAudioUnlockNotice(false);
          })
          .catch((err) => {
            console.log('[WebRTC Audio Autoplay Blocked] Needs user tap to unlock output:', err);
            setShowAudioUnlockNotice(true);
          });
      }
    } catch (err) {
      console.warn('[Remote Audio Playback Notice]:', err);
    }
  };

  // Asynchronously get or ensure active local microphone stream
  const getLocalAudioStream = async () => {
    if (mediaStreamRef.current && mediaStreamRef.current.active && mediaStreamRef.current.getAudioTracks().length > 0) {
      return mediaStreamRef.current;
    }
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true 
        }, 
        video: false 
      });
      mediaStreamRef.current = stream;
      return stream;
    }
    return null;
  };

  // Helper to create a WebRTC PeerConnection for a specific peer
  const createPeerConnection = (targetSocketId, isInitiator, socket) => {
    if (peersRef.current[targetSocketId]) {
      try { peersRef.current[targetSocketId].close(); } catch(e){}
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pc._iceCandidateQueue = [];
    pc._isInitiator = isInitiator;
    peersRef.current[targetSocketId] = pc;

    // Attach local microphone tracks to the peer connection if already available
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        try {
          pc.addTrack(track, mediaStreamRef.current);
        } catch (e) {}
      });
    }

    // Send ICE candidates to the target participant
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc-ice-candidate', {
          targetSocketId,
          candidate: event.candidate
        });
      }
    };

    // Monitor connection states
    pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC ICE State with ${targetSocketId}]:`, pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        try { pc.restartIce(); } catch(e){}
      }
    };

    // When remote live audio stream arrives, play it immediately!
    pc.ontrack = (event) => {
      console.log('[WebRTC Live Audio Stream Received]:', targetSocketId, event.streams);
      const stream = (event.streams && event.streams[0]) ? event.streams[0] : new MediaStream([event.track]);
      remoteStreamsRef.current[targetSocketId] = stream;
      attachAndPlayRemoteAudio(targetSocketId, stream);
    };

    const sendOffer = async () => {
      try {
        const stream = await getLocalAudioStream().catch(() => null);
        if (stream) {
          stream.getAudioTracks().forEach(track => {
            const senders = pc.getSenders();
            const hasSender = senders.some(s => s.track && s.track.id === track.id);
            if (!hasSender) {
              try { pc.addTrack(track, stream); } catch(e){}
            }
          });
        }

        if (pc.signalingState !== 'stable') return;
        const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false });
        if (pc.signalingState !== 'stable') return;
        await pc.setLocalDescription(offer);
        if (socket) {
          socket.emit('webrtc-offer', {
            targetSocketId,
            offer,
            senderInfo: { role, name: role === 'host' ? hostName : role === 'interpreter' ? interpreterName : patientName }
          });
        }
      } catch (err) {
        console.warn('[WebRTC Offer Warning]:', err.message);
      }
    };

    if (isInitiator) {
      setTimeout(() => {
        if (pc.signalingState === 'stable') {
          sendOffer();
        }
      }, 150);
    }

    return pc;
  };

  // Global touch/click unblocker for mobile browsers
  useEffect(() => {
    const handleGlobalInteraction = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
      Object.values(remoteAudiosRef.current).forEach(audio => {
        if (audio && audio.paused && audio.srcObject) {
          audio.play().then(() => setShowAudioUnlockNotice(false)).catch(() => {});
        }
      });
    };

    window.addEventListener('click', handleGlobalInteraction, { passive: true });
    window.addEventListener('touchstart', handleGlobalInteraction, { passive: true });
    return () => {
      window.removeEventListener('click', handleGlobalInteraction);
      window.removeEventListener('touchstart', handleGlobalInteraction);
    };
  }, []);

  // Connected Participants in this Room via Socket
  const [roomParticipants, setRoomParticipants] = useState([
    { role: 'host', name: hostName, status: 'connected' },
    { role: 'interpreter', name: interpreterDisplayName, status: 'connected' },
    { role: 'guest', name: patientName, status: 'connected' }
  ]);

  // Chat drawer & Interpreter Drawer States (Default to 'none' so call floor is front and center)
  const [activeDrawer, setActiveDrawer] = useState('none'); // 'chat', 'glossary', 'none'
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'm1',
      sender: 'System',
      role: 'system',
      text: `Secure 3-Party Room (${roomId}) established between ${hostName}, ${interpreterDisplayName} (${targetLanguage}), and ${patientName}.`,
      timestamp: '00:01'
    }
  ]);
  const [messageInput, setMessageInput] = useState('');

  // Live Captions / Spoken Transcripts
  const [liveCaption, setLiveCaption] = useState({
    speaker: interpreterDisplayName,
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

  // Initialize Socket.io Connection & WebRTC Signaling for this room
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

      // Handle room join confirmation: deterministic initiator based on socket ID
      socket.on('room-joined-success', ({ participants, currentUserId, targetLanguage: serverLang, specialty: serverSpec }) => {
        if (serverLang) setTargetLanguage(serverLang);
        if (serverSpec) setSpecialty(serverSpec);
        if (Array.isArray(participants)) {
          participants.forEach(p => {
            if (p.socketId && p.socketId !== currentUserId && p.socketId !== socket.id) {
              const isInitiator = socket.id < p.socketId;
              createPeerConnection(p.socketId, isInitiator, socket);
            }
          });
        }
      });

      // Handle new participant joining room: deterministic initiator based on socket ID
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

        if (p.socketId && p.socketId !== socket.id) {
          const isInitiator = socket.id < p.socketId;
          createPeerConnection(p.socketId, isInitiator, socket);
        }
      });

      // WebRTC Signaling: Inbound Offer
      socket.on('webrtc-offer', async ({ senderSocketId, offer, senderInfo }) => {
        let pc = peersRef.current[senderSocketId];
        if (!pc) {
          pc = createPeerConnection(senderSocketId, false, socket);
        }
        try {
          const stream = await getLocalAudioStream().catch(() => null);
          if (stream) {
            stream.getAudioTracks().forEach(track => {
              const senders = pc.getSenders();
              const hasSender = senders.some(s => s.track && s.track.id === track.id);
              if (!hasSender) {
                try { pc.addTrack(track, stream); } catch(e){}
              }
            });
          }

          if (pc.signalingState !== 'stable') {
            try { await pc.setLocalDescription({ type: 'rollback' }); } catch(e){}
          }

          await pc.setRemoteDescription(new RTCSessionDescription(offer));

          // Drain queued ICE candidates
          if (Array.isArray(pc._iceCandidateQueue) && pc._iceCandidateQueue.length > 0) {
            for (const cand of pc._iceCandidateQueue) {
              await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
            }
            pc._iceCandidateQueue = [];
          }

          const answer = await pc.createAnswer({ offerToReceiveAudio: true, offerToReceiveVideo: false });
          await pc.setLocalDescription(answer);
          socket.emit('webrtc-answer', { targetSocketId: senderSocketId, answer });
        } catch (err) {
          console.error('[WebRTC Inbound Offer Processing Error]', err);
        }
      });

      // WebRTC Signaling: Inbound Answer
      socket.on('webrtc-answer', async ({ senderSocketId, answer }) => {
        const pc = peersRef.current[senderSocketId];
        if (pc && pc.signalingState === 'have-local-offer') {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));

            // Drain queued ICE candidates
            if (Array.isArray(pc._iceCandidateQueue) && pc._iceCandidateQueue.length > 0) {
              for (const cand of pc._iceCandidateQueue) {
                await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
              }
              pc._iceCandidateQueue = [];
            }
          } catch (err) {
            console.error('[WebRTC Inbound Answer Error]', err);
          }
        }
      });

      // WebRTC Signaling: ICE Candidate
      socket.on('webrtc-ice-candidate', async ({ senderSocketId, candidate }) => {
        const pc = peersRef.current[senderSocketId];
        if (pc && candidate) {
          try {
            if (pc.remoteDescription && pc.remoteDescription.type) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
              pc._iceCandidateQueue = pc._iceCandidateQueue || [];
              pc._iceCandidateQueue.push(candidate);
            }
          } catch (err) {
            console.warn('[WebRTC ICE Candidate Add Notice]:', err);
          }
        }
      });

      // Live Audio Chunk Relay (Plays audio backup when WebRTC P2P is blocked by NAT/Firewalls)
      socket.on('relay-audio-chunk', ({ senderSocketId, audioData, mimeType, senderRole, senderName }) => {
        if (!audioData || senderSocketId === socket.id) return;

        // If WebRTC is already connected and delivering live audio, skip relay to avoid duplicate sound
        const pc = peersRef.current[senderSocketId];
        if (pc && pc.iceConnectionState === 'connected' && remoteAudiosRef.current[senderSocketId]?.srcObject) {
          return;
        }

        try {
          const audio = new Audio(audioData);
          audio.volume = 1.0;
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              console.log('[Relay Audio Autoplay Blocked]:', err);
            });
          }
        } catch (err) {
          console.warn('[Relay Audio Play Error]:', err);
        }
      });

      // Handle participant disconnect / cleanup
      socket.on('participant-left', ({ socketId }) => {
        if (peersRef.current[socketId]) {
          try { peersRef.current[socketId].close(); } catch(e){}
          delete peersRef.current[socketId];
        }
        if (remoteAudiosRef.current[socketId]) {
          try {
            remoteAudiosRef.current[socketId].pause();
            remoteAudiosRef.current[socketId].srcObject = null;
            remoteAudiosRef.current[socketId].remove();
          } catch(e){}
          delete remoteAudiosRef.current[socketId];
        }
        if (remoteStreamsRef.current[socketId]) {
          delete remoteStreamsRef.current[socketId];
        }
        setRemoteAudioCount(Object.keys(remoteAudiosRef.current).length);
      });

      // Handle media state / speaking changes from other participants
      socket.on('participant-media-changed', ({ socketId, isMuted: peerMuted, isSpeaking: peerSpeaking, role: peerRole }) => {
        if (peerSpeaking) {
          const resolvedRole = peerRole || (socketId === socket.id ? role : (role === 'host' ? 'interpreter' : 'host'));
          setActiveSpeaker(resolvedRole);
        }
      });

      socket.on('new-chat-message', (msg) => {
        if (!msg) return;
        const normalizedMsg = {
          id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          sender: msg.sender || msg.senderName || 'Participant',
          senderName: msg.sender || msg.senderName || 'Participant',
          role: msg.role || msg.senderRole || 'guest',
          senderRole: msg.role || msg.senderRole || 'guest',
          text: msg.text,
          timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderSocketId: msg.senderSocketId
        };

        setChatMessages(prev => {
          if (prev.some(m => m.id === normalizedMsg.id)) return prev;
          return [...prev, normalizedMsg];
        });
        playMessageTone();
      });

      socket.on('interpreter-pause-alert', (alert) => {
        setPauseBanner(alert);
        playPauseFloorAlert();
        setTimeout(() => setPauseBanner(null), 8000);
      });

      socket.on('call-session-ended', ({ roomId: endedRoomId }) => {
        if (endedRoomId === roomId) {
          onEndCall({
            roomId,
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
        }
      });
    }

    // Initialize real microphone audio stream & volume level meter
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true 
        }, 
        video: false 
      })
        .then((stream) => {
          mediaStreamRef.current = stream;

          // Attach newly acquired local stream to any established peer connections
          Object.values(peersRef.current).forEach(pc => {
            stream.getAudioTracks().forEach(track => {
              const senders = pc.getSenders();
              const audioSender = senders.find(s => (s.track && s.track.kind === 'audio') || (!s.track));
              if (audioSender) {
                audioSender.replaceTrack(track).catch(() => {});
              } else {
                try { pc.addTrack(track, stream); } catch(e){}
              }
            });
          });

          // Start Live Audio Relay Recorder for guaranteed voice transport
          try {
            let selectedMime = 'audio/webm;codecs=opus';
            if (typeof MediaRecorder !== 'undefined') {
              if (!MediaRecorder.isTypeSupported(selectedMime)) {
                if (MediaRecorder.isTypeSupported('audio/webm')) selectedMime = 'audio/webm';
                else if (MediaRecorder.isTypeSupported('audio/mp4')) selectedMime = 'audio/mp4';
                else if (MediaRecorder.isTypeSupported('audio/ogg')) selectedMime = 'audio/ogg';
                else selectedMime = '';
              }

              const recOptions = selectedMime ? { mimeType: selectedMime } : undefined;
              const recorder = new MediaRecorder(stream, recOptions);
              recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0 && !isMutedRef.current) {
                  const s = getSocket();
                  if (s) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      s.emit('relay-audio-chunk', {
                        roomId,
                        audioData: reader.result,
                        mimeType: recorder.mimeType || selectedMime || 'audio/webm',
                        senderRole: role,
                        senderName: role === 'host' ? hostName : role === 'interpreter' ? interpreterName : patientName
                      });
                    };
                    reader.readAsDataURL(e.data);
                  }
                }
              };
              recorder.start(400); // 400ms slices for smooth low-latency delivery
              recorderRef.current = recorder;
            }
          } catch (recErr) {
            console.warn('[Live Audio Relay Init Notice]:', recErr);
          }

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
                if (!analyserRef.current || isMutedRef.current) {
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

                  if (normalized > 15 && !isMutedRef.current) {
                    setActiveSpeaker(role);
                    const now = Date.now();
                    if (!lastSpeakingEmitRef.current || (now - lastSpeakingEmitRef.current > 1200)) {
                      lastSpeakingEmitRef.current = now;
                      const s = getSocket();
                      if (s) {
                        s.emit('update-media-state', { roomId, isSpeaking: true, role });
                      }
                    }
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
        .catch((err) => {
          console.log('Microphone permission not granted or running in simulation mode:', err);
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
      const socket = getSocket();
      if (socket) {
        socket.emit('leave-room', { roomId });
        socket.off('new-chat-message');
        socket.off('interpreter-pause-alert');
        socket.off('call-session-ended');
        socket.off('participant-joined');
        socket.off('room-joined-success');
        socket.off('webrtc-offer');
        socket.off('webrtc-answer');
        socket.off('webrtc-ice-candidate');
        socket.off('relay-audio-chunk');
        socket.off('participant-left');
        socket.off('participant-media-changed');
      }
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        try { recorderRef.current.stop(); } catch(e){}
        recorderRef.current = null;
      }
      Object.values(peersRef.current).forEach(pc => {
        try { pc.close(); } catch(e){}
      });
      peersRef.current = {};
      Object.values(remoteAudiosRef.current).forEach(el => {
        try {
          el.pause();
          el.srcObject = null;
          el.remove();
        } catch(e){}
      });
      remoteAudiosRef.current = {};
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
      }
    };
  }, []);

  // Unlock speaker audio on user interaction (Ensures mobile browser audio autoplay policy is cleared)
  const unlockAudioOutput = () => {
    playConnectedChime();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {});
    }
    Object.values(remoteAudiosRef.current).forEach(audio => {
      if (audio) {
        audio.play().catch(() => {});
      }
    });
    setShowAudioUnlockNotice(false);
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !next;
      });
    }
    const socket = getSocket();
    if (socket) {
      socket.emit('update-media-state', { roomId, isMuted: next, isSpeaking: false });
    }
  };

  const handleToggleVideo = () => {
    const next = !isVideoOff;
    setIsVideoOff(next);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !next;
      });
    }
    const socket = getSocket();
    if (socket) {
      socket.emit('update-media-state', { roomId, isVideoOff: next });
    }
  };

  // Real Screen Share Presenter Handler
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop current screen share
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
      const socket = getSocket();
      if (socket) {
        socket.emit('update-media-state', { roomId, isScreenSharing: false });
      }
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert('Live screen sharing is supported on desktop browsers (Chrome, Edge, Firefox, Safari).');
        return;
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });

      screenStreamRef.current = screenStream;
      setIsScreenSharing(true);

      // Attach stream to local presenter video element
      setTimeout(() => {
        if (localScreenVideoRef.current) {
          localScreenVideoRef.current.srcObject = screenStream;
        }
      }, 100);

      // Listen for when the user clicks browser's native "Stop Sharing" floating button
      const screenTrack = screenStream.getVideoTracks()[0];
      if (screenTrack) {
        screenTrack.onended = () => {
          if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(t => t.stop());
            screenStreamRef.current = null;
          }
          setIsScreenSharing(false);
          const socket = getSocket();
          if (socket) {
            socket.emit('update-media-state', { roomId, isScreenSharing: false });
          }
        };
      }

      const socket = getSocket();
      if (socket) {
        socket.emit('update-media-state', { roomId, isScreenSharing: true });
      }
    } catch (err) {
      console.warn('Screen sharing cancelled or unavailable:', err);
      setIsScreenSharing(false);
    }
  };

  // Send message in 3-Way Chat
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const senderDisplayName = role === 'host' ? hostName : role === 'interpreter' ? interpreterName : patientName;
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg = {
      id: msgId,
      sender: senderDisplayName,
      senderName: senderDisplayName,
      role: role,
      senderRole: role,
      text: messageInput.trim(),
      timestamp: formattedTime
    };

    setChatMessages(prev => {
      if (prev.some(m => m.id === msgId)) return prev;
      return [...prev, newMsg];
    });

    const socket = getSocket();
    if (socket) {
      socket.emit('send-chat-message', {
        id: msgId,
        roomId,
        sender: senderDisplayName,
        senderName: senderDisplayName,
        role: role,
        senderRole: role,
        text: messageInput.trim(),
        timestamp: formattedTime
      });
    }

    // Update live dialogue box with latest message
    setLiveCaption({
      speaker: senderDisplayName,
      speakerRole: role,
      enText: messageInput.trim(),
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
    const socket = getSocket();
    if (socket) {
      socket.emit('end-call-session', {
        roomId,
        role,
        participantName: role === 'host' ? hostName : role === 'interpreter' ? interpreterName : patientName
      });
    }

    onEndCall({
      roomId,
      duration: formatTimer(seconds),
      seconds: seconds,
      notes: sessionNotes,
      rating: callRating,
      targetLanguage,
      specialty,
      patientName,
      hostName,
      interpreter: sessionData.interpreter,
      interpreterId: sessionData.interpreter?.id || sessionData.interpreterId,
      interpreterEmail: sessionData.interpreter?.email || sessionData.interpreterEmail,
      interpreterBadgeNumber: interpreterBadgeNumber,
      interpreterName: sessionData.interpreter?.name || interpreterDisplayName
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
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Real-Time Encrypted 3-Party Conference</span>
        </div>

        {/* Right: Layout & Drawer Toggles */}
        <div className="flex items-center gap-2">
          
          {/* Audio Output Playback & Sound Test Button */}
          <button
            onClick={unlockAudioOutput}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30 shadow-sm"
            title="Click to test & unblock speaker audio output"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Speaker: Live (Test)</span>
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

      {/* Autoplay Audio Output Unlock Banner for Mobile Browsers */}
      {showAudioUnlockNotice && (
        <div 
          onClick={unlockAudioOutput}
          className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 py-2 text-xs font-extrabold flex items-center justify-between cursor-pointer transition shadow-xl z-30 animate-pulse border-b border-emerald-400/30"
        >
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-amber-300 animate-bounce shrink-0" />
            <span>🔊 Tap here to enable live speaker sound (Browser Security Unmute)</span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-black/30 text-[10px] uppercase font-black tracking-wider text-white border border-white/20 shrink-0">
            Unmute Audio
          </span>
        </div>
      )}

      {/* Main Conference Arena */}
      <div className="flex-1 flex overflow-hidden relative" onClick={unlockAudioOutput}>
        
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

          {/* Live Screen / Document Share Presenter Stage */}
          {isScreenSharing && (
            <div className="rounded-2xl bg-black border-2 border-brand-500 shadow-2xl p-2 relative overflow-hidden flex flex-col items-center justify-center min-h-[260px] sm:min-h-[340px] animate-fade-in">
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-brand-500/50 text-white text-xs font-bold shadow-lg">
                <MonitorUp className="w-4 h-4 text-brand-400 animate-pulse" />
                <span>Presenting Live Document / Screen</span>
              </div>
              <button
                onClick={handleToggleScreenShare}
                className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Stop Presenting</span>
              </button>
              <video
                ref={localScreenVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full max-h-[420px] object-contain rounded-xl bg-slate-950"
              />
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
                <h4 className="text-sm font-extrabold text-white mt-3 truncate max-w-[200px]">{interpreterDisplayName}</h4>
                <span className="text-[11px] font-semibold text-emerald-400">
                  ID: #{interpreterBadgeNumber} • English ⟷ {targetLanguage}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                  {interpreterCert}
                </span>
              </div>

              {/* Top Left Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                <span>ID: #{interpreterBadgeNumber}</span>
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
          <div className="w-full sm:w-80 md:w-96 border-l border-slate-800 bg-slate-900/98 flex flex-col z-30 shrink-0 absolute sm:relative inset-y-0 right-0 shadow-2xl sm:shadow-none animate-fade-in">
            
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
                  {chatMessages.map((msg) => {
                    const msgRole = msg.role || msg.senderRole;
                    const msgSender = msg.sender || msg.senderName || 'Participant';
                    const isOwnMessage = msgRole === role;
                    return (
                      <div 
                        key={msg.id} 
                        className={`p-3 rounded-xl text-xs space-y-1 ${
                          msgRole === 'system' 
                            ? 'bg-slate-950/80 border border-slate-800/80 text-slate-400 text-center text-[10px]' 
                            : isOwnMessage 
                              ? 'bg-brand-600/25 border border-brand-500/50 ml-6 text-white' 
                              : 'bg-slate-800/80 border border-slate-700/70 mr-6 text-slate-200'
                        }`}
                      >
                        {msgRole !== 'system' && (
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className={
                              isOwnMessage
                                ? 'text-brand-300'
                                : (msgRole === 'interpreter' ? 'text-emerald-400' : msgRole === 'host' ? 'text-brand-400' : 'text-amber-400')
                            }>
                              {isOwnMessage ? `${msgSender} (You)` : msgSender}
                            </span>
                            <span className="text-slate-400 text-[9px]">{msg.timestamp}</span>
                          </div>
                        )}
                        <p className="font-medium leading-relaxed">{msg.text}</p>
                      </div>
                    );
                  })}
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
            onClick={handleToggleMute}
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
            onClick={handleToggleVideo}
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
            onClick={handleToggleScreenShare}
            className={`p-3.5 rounded-2xl backdrop-blur-md font-semibold text-xs flex items-center gap-2 transition ${
              isScreenSharing 
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/40 ring-2 ring-brand-300' 
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            title={isScreenSharing ? 'Stop Sharing Screen' : 'Share Screen / Document'}
          >
            <MonitorUp className={`w-5 h-5 ${isScreenSharing ? 'animate-pulse text-white' : 'text-slate-300'}`} />
            <span className="hidden lg:inline">{isScreenSharing ? 'Sharing' : 'Share Screen'}</span>
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
