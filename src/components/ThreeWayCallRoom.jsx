import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
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
  MonitorUp, 
  AlertCircle 
} from 'lucide-react';
import { QUICK_PHRASES, LANGUAGES } from '../data/mockData';
import { 
  speakText, 
  playConnectedChime, 
  playMessageTone, 
  playPauseFloorAlert 
} from '../services/audioService';
import { getSocket } from '../services/socket';

// WebRTC ICE STUN/TURN Configuration for Global 100% Mobile & Firewall Penetration
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:stun.relay.metered.ca:80' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ]
};

export default function ThreeWayCallRoom({ 
  sessionData = {}, 
  onEndCall, 
  onOpenGlossary 
}) {
  const hostName = sessionData.hostName || sessionData.mainClientName || 'Main Client (Payer)';
  
  // Official Numeric Badge ID for Interpreter Privacy
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

  // 1. Audio & Video Media States
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'video' ? false : true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(role);
  const [viewLayout, setViewLayout] = useState('grid'); // 'grid' or 'focus'
  const [focusParticipant, setFocusParticipant] = useState('interpreter');
  const [showAudioUnlockNotice, setShowAudioUnlockNotice] = useState(false);
  const [micPermissionState, setMicPermissionState] = useState('prompt'); // 'prompt', 'granted', 'denied'
  const [micAudioLevel, setMicAudioLevel] = useState(0);

  // 2. Active Remote Audio Streams Map (socketId -> MediaStream)
  const [remoteStreamsMap, setRemoteStreamsMap] = useState({});

  // 3. Room & Chat States
  const [activeDrawer, setActiveDrawer] = useState('none'); // 'none', 'chat', 'glossary'
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
  const [pauseBanner, setPauseBanner] = useState(null);
  const [glossaryQuery, setGlossaryQuery] = useState('');
  const [glossaryCategory, setGlossaryCategory] = useState('All');

  // 4. Debrief & Timer States
  const [seconds, setSeconds] = useState(0);
  const [showDebrief, setShowDebrief] = useState(false);
  const [callRating, setCallRating] = useState(5);
  const [sessionNotes, setSessionNotes] = useState('3-party interpretation session completed successfully.');

  // References
  const mediaStreamRef = useRef(null);
  const peersRef = useRef({}); // socketId -> RTCPeerConnection
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const scriptProcessorRef = useRef(null);
  const playbackCtxRef = useRef(null);
  const nextPlayTimesRef = useRef({});
  const audioElementsMapRef = useRef({}); // socketId -> HTMLAudioElement
  const webrtcConnectedMapRef = useRef({}); // socketId -> boolean
  const isMutedRef = useRef(isMuted);
  const screenStreamRef = useRef(null);
  const localScreenVideoRef = useRef(null);
  const localCameraVideoRef = useRef(null);
  const lastSpeakingEmitRef = useRef(0);
  const secondsRef = useRef(0);
  const sessionNotesRef = useRef(sessionNotes);
  const callRatingRef = useRef(callRating);
  const onEndCallRef = useRef(onEndCall);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    sessionNotesRef.current = sessionNotes;
  }, [sessionNotes]);

  useEffect(() => {
    callRatingRef.current = callRating;
  }, [callRating]);

  useEffect(() => {
    onEndCallRef.current = onEndCall;
  }, [onEndCall]);

  // Call Duration Timer
  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ==========================================
  // TOP-LEVEL METHOD: Unlock & Test Audio Engine
  // ==========================================
  const unlockAudioOutput = useCallback(() => {
    playConnectedChime();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {});
    }
    if (playbackCtxRef.current && playbackCtxRef.current.state === 'suspended') {
      playbackCtxRef.current.resume().catch(() => {});
    }
    // Attempt play on all remote audio tags
    Object.values(audioElementsMapRef.current).forEach(el => {
      if (el) {
        el.muted = false;
        el.volume = 1.0;
        el.play().catch(() => {});
      }
    });
    setShowAudioUnlockNotice(false);
  }, []);

  // ==========================================
  // TOP-LEVEL METHOD: Start / Request Microphone
  // ==========================================
  const startMicrophone = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicPermissionState('denied');
        return null;
      }

      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: { ideal: true },
            noiseSuppression: { ideal: true },
            autoGainControl: { ideal: true }
          },
          video: callType === 'video'
        });
      } catch (err) {
        console.warn('[Microphone Standard Stream Failed - Trying Raw Audio Fallback]:', err);
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      }

      if (stream) {
        mediaStreamRef.current = stream;
        setMicPermissionState('granted');

        if (localCameraVideoRef.current && stream.getVideoTracks().length > 0) {
          localCameraVideoRef.current.srcObject = stream;
        }

        const audioTrack = stream.getAudioTracks()[0];

        // Attach or seamlessly replace track on ALL active RTCPeerConnections
        Object.entries(peersRef.current).forEach(([peerId, pc]) => {
          if (!pc || pc.connectionState === 'closed') return;
          if (audioTrack) {
            const senders = pc.getSenders();
            const audioSender = senders.find(s => (s.track && s.track.kind === 'audio') || (!s.track));
            if (audioSender) {
              audioSender.replaceTrack(audioTrack).catch(e => {
                console.warn('[ReplaceTrack Error]:', e);
              });
            } else {
              try {
                pc.addTrack(audioTrack, stream);
              } catch (e) {
                console.warn('[AddTrack Error]:', e);
              }
            }
          }
        });

        // Initialize Web Audio API for visual meter & live PCM streaming fallback
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
              try { audioContextRef.current.close(); } catch (e) {}
            }
            const audioCtx = new AudioCtx();
            audioContextRef.current = audioCtx;
            if (audioCtx.state === 'suspended') {
              audioCtx.resume().catch(() => {});
            }

            const analyser = audioCtx.createAnalyser();
            analyserRef.current = analyser;
            analyser.fftSize = 64;

            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            const processor = audioCtx.createScriptProcessor(2048, 1, 1);
            scriptProcessorRef.current = processor;

            processor.onaudioprocess = (e) => {
              if (!isMutedRef.current) {
                const inputData = e.inputBuffer.getChannelData(0);
                const len = inputData.length;
                const pcm16 = new Int16Array(len);
                let maxAmp = 0;
                for (let i = 0; i < len; i++) {
                  const s = Math.max(-1, Math.min(1, inputData[i]));
                  const abs = Math.abs(s);
                  if (abs > maxAmp) maxAmp = abs;
                  pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                // Stream voice chunk fallback if sound detected
                if (maxAmp > 0.0003) {
                  const s = getSocket();
                  if (s && s.connected) {
                    s.emit('live-pcm-audio-chunk', {
                      roomId,
                      pcmData: Array.from(pcm16),
                      sampleRate: audioCtx.sampleRate,
                      senderRole: role,
                      senderName: role === 'host' ? hostName : role === 'interpreter' ? interpreterName : patientName
                    });
                  }
                }
              }
            };

            source.connect(processor);
            const silenceNode = audioCtx.createGain();
            silenceNode.gain.value = 0;
            processor.connect(silenceNode);
            silenceNode.connect(audioCtx.destination);

            // Real-time Visual Audio Level Meter Loop
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

                if (normalized > 8 && !isMutedRef.current) {
                  setActiveSpeaker(role);
                  const now = Date.now();
                  if (!lastSpeakingEmitRef.current || (now - lastSpeakingEmitRef.current > 1000)) {
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
        } catch (err) {
          console.warn('[Web Audio Initialisation Error]:', err);
        }

        return stream;
      }
    } catch (err) {
      console.warn('[Microphone Permission Denied]:', err);
      setMicPermissionState('denied');
      return null;
    }
  }, [callType, role, hostName, interpreterName, patientName, roomId]);

  // ==========================================
  // TOP-LEVEL METHOD: WebRTC Peer Connection
  // ==========================================
  const createPeerConnection = useCallback((targetSocketId, socket) => {
    if (peersRef.current[targetSocketId]) {
      try { peersRef.current[targetSocketId].close(); } catch (e) {}
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pc._iceCandidateQueue = [];
    pc._makingOffer = false;
    peersRef.current[targetSocketId] = pc;

    // 1. Add Audio Transceiver immediately so SDP always includes sendrecv audio
    try {
      pc.addTransceiver('audio', { direction: 'sendrecv' });
    } catch (e) {}

    // 2. Attach local audio track if microphone stream is already active
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        try {
          const senders = pc.getSenders();
          const audioSender = senders.find(s => (s.track && s.track.kind === 'audio') || (!s.track));
          if (audioSender) {
            audioSender.replaceTrack(track).catch(() => {});
          } else {
            pc.addTrack(track, mediaStreamRef.current);
          }
        } catch (e) {}
      });
    }

    // 3. ICE Candidate Emission
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc-ice-candidate', {
          targetSocketId,
          candidate: event.candidate
        });
      }
    };

    // 4. Inbound Remote Track Delivery
    pc.ontrack = (event) => {
      const stream = (event.streams && event.streams[0]) ? event.streams[0] : new MediaStream([event.track]);
      setRemoteStreamsMap(prev => ({ ...prev, [targetSocketId]: stream }));
      webrtcConnectedMapRef.current[targetSocketId] = true;

      // Direct element playback check
      const el = audioElementsMapRef.current[targetSocketId];
      if (el) {
        el.srcObject = stream;
        el.muted = false;
        el.volume = 1.0;
        el.play().catch(() => {
          setShowAudioUnlockNotice(true);
        });
      }
    };

    // 5. Connection State Monitoring
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === 'connected') {
        webrtcConnectedMapRef.current[targetSocketId] = true;
      } else if (state === 'failed' || state === 'disconnected' || state === 'closed') {
        webrtcConnectedMapRef.current[targetSocketId] = false;
      }
    };

    // 6. Perfect Negotiation: onnegotiationneeded
    pc.onnegotiationneeded = async () => {
      try {
        pc._makingOffer = true;
        await pc.setLocalDescription();
        if (socket) {
          socket.emit('webrtc-offer', {
            targetSocketId,
            offer: pc.localDescription,
            senderInfo: { role, name: role === 'host' ? hostName : role === 'interpreter' ? interpreterName : patientName }
          });
        }
      } catch (err) {
        console.warn('[WebRTC Negotiation Error]:', err);
      } finally {
        pc._makingOffer = false;
      }
    };

    return pc;
  }, [role, hostName, interpreterName, patientName]);

  // ==========================================
  // Socket.io Lifecycle & Signaling
  // ==========================================
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

      socket.on('room-joined-success', ({ participants, currentUserId, targetLanguage: sLang, specialty: sSpec }) => {
        if (sLang) setTargetLanguage(sLang);
        if (sSpec) setSpecialty(sSpec);
        if (Array.isArray(participants)) {
          participants.forEach(p => {
            if (p.socketId && p.socketId !== currentUserId && p.socketId !== socket.id) {
              createPeerConnection(p.socketId, socket);
            }
          });
        }
      });

      socket.on('participant-joined', (p) => {
        setChatMessages(prev => [
          ...prev, 
          {
            id: `sys-${Date.now()}`,
            sender: 'System',
            role: 'system',
            text: `${p.name} (${p.role}) has joined the 3-party session.`,
            timestamp: formatTimer(secondsRef.current)
          }
        ]);

        if (p.socketId && p.socketId !== socket.id) {
          createPeerConnection(p.socketId, socket);
        }
      });

      // Perfect Negotiation Offer Receiver (Handles Collisions & Polite Rollbacks)
      socket.on('webrtc-offer', async ({ senderSocketId, offer, senderInfo }) => {
        let pc = peersRef.current[senderSocketId];
        if (!pc) {
          pc = createPeerConnection(senderSocketId, socket);
        }

        try {
          const isPolite = (socket.id || '') < senderSocketId;
          const offerCollision = (pc.signalingState !== 'stable') || pc._makingOffer;

          if (!isPolite && offerCollision) {
            return;
          }

          if (offerCollision) {
            await Promise.all([
              pc.setLocalDescription({ type: 'rollback' }),
              pc.setRemoteDescription(new RTCSessionDescription(offer))
            ]);
          } else {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
          }

          // Attach local tracks if available
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getAudioTracks().forEach(track => {
              const senders = pc.getSenders();
              const audioSender = senders.find(s => (s.track && s.track.kind === 'audio') || (!s.track));
              if (audioSender) {
                audioSender.replaceTrack(track).catch(() => {});
              } else {
                try { pc.addTrack(track, mediaStreamRef.current); } catch (e) {}
              }
            });
          }

          // Process queued ICE candidates
          if (Array.isArray(pc._iceCandidateQueue) && pc._iceCandidateQueue.length > 0) {
            for (const cand of pc._iceCandidateQueue) {
              await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
            }
            pc._iceCandidateQueue = [];
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('webrtc-answer', { targetSocketId: senderSocketId, answer: pc.localDescription });
        } catch (err) {
          console.warn('[WebRTC Inbound Offer Processing]:', err);
        }
      });

      // Inbound Answer Receiver
      socket.on('webrtc-answer', async ({ senderSocketId, answer }) => {
        const pc = peersRef.current[senderSocketId];
        if (pc && pc.signalingState === 'have-local-offer') {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            if (Array.isArray(pc._iceCandidateQueue) && pc._iceCandidateQueue.length > 0) {
              for (const cand of pc._iceCandidateQueue) {
                await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
              }
              pc._iceCandidateQueue = [];
            }
          } catch (e) {
            console.warn('[WebRTC Inbound Answer Processing]:', e);
          }
        }
      });

      // Inbound ICE Candidate Receiver
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
          } catch (e) {}
        }
      });

      // Enterprise Live Web Audio PCM Stream Fallback Receiver (plays smoothly if WebRTC is blocked/connecting)
      socket.on('live-pcm-audio-chunk', ({ senderSocketId, pcmData, sampleRate, senderRole, senderName }) => {
        if (!pcmData || senderSocketId === socket.id) return;

        if (senderRole) {
          setActiveSpeaker(senderRole);
        }

        // If WebRTC is already connected for this peer, skip PCM fallback to avoid duplicate audio
        if (webrtcConnectedMapRef.current[senderSocketId]) {
          return;
        }

        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (!AudioCtx) return;

          if (!playbackCtxRef.current || playbackCtxRef.current.state === 'closed') {
            playbackCtxRef.current = new AudioCtx();
          }
          const playCtx = playbackCtxRef.current;
          if (playCtx.state === 'suspended') {
            playCtx.resume().catch(() => {});
          }

          let int16Array = null;
          if (pcmData instanceof ArrayBuffer) {
            int16Array = new Int16Array(pcmData);
          } else if (pcmData && pcmData.buffer instanceof ArrayBuffer && pcmData.byteLength !== undefined) {
            int16Array = new Int16Array(pcmData.buffer, pcmData.byteOffset || 0, pcmData.length || (pcmData.byteLength / 2));
          } else if (Array.isArray(pcmData)) {
            int16Array = new Int16Array(pcmData);
          } else if (pcmData && pcmData.type === 'Buffer' && Array.isArray(pcmData.data)) {
            int16Array = new Int16Array(new Uint8Array(pcmData.data).buffer);
          } else if (typeof pcmData === 'object' && pcmData !== null) {
            int16Array = new Int16Array(Object.values(pcmData));
          }

          if (!int16Array || int16Array.length === 0) return;

          const float32Array = new Float32Array(int16Array.length);
          for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768.0;
          }

          const audioBuffer = playCtx.createBuffer(1, float32Array.length, sampleRate || 44100);
          audioBuffer.getChannelData(0).set(float32Array);

          const sourceNode = playCtx.createBufferSource();
          sourceNode.buffer = audioBuffer;
          sourceNode.connect(playCtx.destination);

          const currentTime = playCtx.currentTime;
          let nextTime = nextPlayTimesRef.current[senderSocketId] || currentTime;
          if (nextTime < currentTime || nextTime > currentTime + 0.1) {
            nextTime = currentTime + 0.005;
          }
          sourceNode.start(nextTime);
          nextPlayTimesRef.current[senderSocketId] = nextTime + audioBuffer.duration;
        } catch (err) {
          console.warn('[PCM Playback Warning]:', err);
        }
      });

      socket.on('participant-left', ({ socketId }) => {
        if (peersRef.current[socketId]) {
          try { peersRef.current[socketId].close(); } catch (e) {}
          delete peersRef.current[socketId];
        }
        delete webrtcConnectedMapRef.current[socketId];
        delete audioElementsMapRef.current[socketId];
        setRemoteStreamsMap(prev => {
          const next = { ...prev };
          delete next[socketId];
          return next;
        });
      });

      socket.on('participant-media-changed', ({ socketId, isSpeaking: peerSpeaking, role: peerRole }) => {
        if (peerSpeaking && peerRole) {
          setActiveSpeaker(peerRole);
        }
      });

      socket.on('new-chat-message', (msg) => {
        if (!msg) return;
        setChatMessages(prev => [
          ...prev, 
          {
            id: msg.id || `msg-${Date.now()}`,
            sender: msg.sender || msg.senderName || 'Participant',
            role: msg.role || msg.senderRole || 'guest',
            text: msg.text,
            timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        playMessageTone();
      });

      socket.on('interpreter-pause-alert', (alert) => {
        setPauseBanner(alert);
        playPauseFloorAlert();
        setTimeout(() => setPauseBanner(null), 8000);
      });

      socket.on('call-session-ended', ({ roomId: endedRoomId }) => {
        if (endedRoomId === roomId) {
          if (onEndCallRef.current) {
            onEndCallRef.current({
              roomId,
              duration: formatTimer(secondsRef.current),
              seconds: secondsRef.current,
              notes: sessionNotesRef.current,
              rating: callRatingRef.current,
              targetLanguage,
              specialty,
              patientName,
              hostName,
              interpreterName
            });
          }
        }
      });
    }

    // Auto-init microphone on mount
    startMicrophone();

    return () => {
      if (socket) {
        socket.emit('leave-room', { roomId });
      }
      Object.values(peersRef.current).forEach(pc => {
        try { pc.close(); } catch (e) {}
      });
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try { audioContextRef.current.close(); } catch (e) {}
      }
    };
  }, [roomId, createPeerConnection, startMicrophone]);

  // Global Click / Tap listener to automatically unlock browser audio output
  useEffect(() => {
    const handleTouch = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
      if (playbackCtxRef.current && playbackCtxRef.current.state === 'suspended') {
        playbackCtxRef.current.resume().catch(() => {});
      }
      Object.values(audioElementsMapRef.current).forEach(el => {
        if (el) {
          el.muted = false;
          el.volume = 1.0;
          el.play().catch(() => {});
        }
      });
      setShowAudioUnlockNotice(false);
    };
    window.addEventListener('click', handleTouch, { passive: true });
    window.addEventListener('touchstart', handleTouch, { passive: true });
    return () => {
      window.removeEventListener('click', handleTouch);
      window.removeEventListener('touchstart', handleTouch);
    };
  }, []);

  // ==========================================
  // Control Bar Actions
  // ==========================================
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    isMutedRef.current = next;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !next;
      });
    } else if (!next) {
      startMicrophone();
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
  };

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        screenStreamRef.current = stream;
        setIsScreenSharing(true);
        if (localScreenVideoRef.current) {
          localScreenVideoRef.current.srcObject = stream;
        }
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
      } catch (e) {
        setIsScreenSharing(false);
      }
    }
  };

  const handleRequestPause = () => {
    playPauseFloorAlert();
    const socket = getSocket();
    if (socket) {
      socket.emit('interpreter-request-pause', {
        roomId,
        interpreterName: interpreterDisplayName,
        message: `${interpreterDisplayName} requested a 30-second pause for terminology verification.`
      });
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    const text = messageInput.trim();
    setMessageInput('');
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: role === 'host' ? hostName : role === 'interpreter' ? interpreterDisplayName : patientName,
      role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);
    const socket = getSocket();
    if (socket) {
      socket.emit('send-chat-message', {
        roomId,
        sender: newMsg.sender,
        role: newMsg.role,
        text: newMsg.text,
        timestamp: newMsg.timestamp
      });
    }
  };

  const handleConfirmEnd = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit('end-call-session', { roomId, role, participantName: role === 'host' ? hostName : interpreterDisplayName });
    }
    onEndCall({
      roomId,
      duration: formatTimer(seconds),
      seconds,
      notes: sessionNotes,
      rating: callRating,
      targetLanguage,
      specialty,
      patientName,
      hostName,
      interpreterName
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      
      {/* 1. TOP STATUS & NAVIGATION BAR */}
      <div className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-lg">
        
        {/* Left: Branding, Room ID & Timer */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/30 font-black text-sm">
            LB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-white">
                3-Party Conference
              </span>
              <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono text-[10px] font-bold border border-brand-500/30">
                {roomId}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                <Clock className="w-3 h-3" />
                {formatTimer(seconds)}
              </span>
              <span>•</span>
              <span className="text-slate-300 font-semibold">{targetLanguage}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline text-slate-400">{specialty}</span>
            </div>
          </div>
        </div>

        {/* Center: Security Encrypted Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Real-Time Encrypted Conference</span>
        </div>

        {/* Right: Drawer & Audio Test Buttons */}
        <div className="flex items-center gap-2">
          
          <button
            onClick={unlockAudioOutput}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30 shadow-sm cursor-pointer"
            title="Click to test & unblock speaker audio output"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Speaker: Live (Test)</span>
          </button>

          <button
            onClick={() => setViewLayout(viewLayout === 'grid' ? 'focus' : 'grid')}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
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

      {/* 2. AUDIO UNLOCK NOTICE / FLOATING BANNER */}
      {showAudioUnlockNotice && (
        <div 
          onClick={unlockAudioOutput}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 text-xs font-black flex flex-col sm:flex-row items-center justify-between gap-2 cursor-pointer transition shadow-2xl z-50 border-b border-emerald-400 animate-bounce"
        >
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-yellow-300 shrink-0 animate-pulse" />
            <span>🔊 <strong>Audio Ready:</strong> Tap here or click anywhere on screen to enable live voice playback.</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              unlockAudioOutput();
            }}
            className="px-3.5 py-1 rounded-lg bg-yellow-400 text-slate-950 text-xs font-black uppercase tracking-wider hover:bg-yellow-300 shadow transition shrink-0 cursor-pointer"
          >
            🔊 Tap To Unblock Audio
          </button>
        </div>
      )}

      {/* 3. MICROPHONE NOT CONNECTED / BLOCKED WARNING BANNER */}
      {micPermissionState === 'denied' && (
        <div 
          onClick={startMicrophone}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 text-xs font-extrabold flex flex-col sm:flex-row items-center justify-between gap-2 cursor-pointer transition shadow-2xl z-40 border-b border-red-400 animate-pulse"
        >
          <div className="flex items-center gap-2">
            <MicOff className="w-5 h-5 text-yellow-300 shrink-0" />
            <span>⚠️ <strong>Microphone Not Connected:</strong> Browser blocked mic access. Tap here to enable microphone.</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              startMicrophone();
            }}
            className="px-3.5 py-1 rounded-lg bg-yellow-400 text-slate-950 text-xs font-black uppercase tracking-wider hover:bg-yellow-300 shadow transition shrink-0"
          >
            Allow & Enable Mic
          </button>
        </div>
      )}

      {/* 4. MAIN CONFERENCE ARENA */}
      <div className="flex-1 flex overflow-hidden relative" onClick={unlockAudioOutput}>
        
        {/* Left / Center Video & Audio Stage */}
        <div className="flex-1 flex flex-col p-3 sm:p-4 gap-3 overflow-y-auto">
          
          {/* Interpreter Floor Pause Signal Banner */}
          {pauseBanner && (
            <div className="p-3.5 rounded-2xl bg-amber-500/20 border-2 border-amber-500/80 text-amber-200 flex items-center justify-between animate-bounce shadow-xl">
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

          {/* Screen / Document Presenter Box */}
          {isScreenSharing && (
            <div className="rounded-2xl bg-black border-2 border-brand-500 shadow-2xl p-2 relative overflow-hidden flex flex-col items-center justify-center min-h-[260px] sm:min-h-[340px]">
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

          {/* 3-PARTY PARTICIPANT TILES GRID */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 min-h-[360px]">
            
            {/* TILE 1: Main Client (Payer / Host) */}
            <div className={`relative rounded-2xl bg-slate-900 border overflow-hidden flex items-center justify-center shadow-lg transition-all ${
              activeSpeaker === 'host' ? 'border-brand-500 ring-2 ring-brand-500/50' : 'border-slate-800'
            }`}>
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
            }`}>
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
                className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/80 hover:bg-amber-500 text-slate-950 text-[10px] font-extrabold shadow transition cursor-pointer"
                title="Signal floor pause to participants"
              >
                <Hand className="w-3 h-3" />
                <span>Pause Floor</span>
              </button>

              {/* Bottom Audio Waveform Meter */}
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
            }`}>
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
                <span>Guest Client</span>
              </div>

              {/* Bottom Audio Waveform Meter */}
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

        </div>

        {/* RIGHT SIDE DRAWER: 3-Way Chat or Glossary */}
        {activeDrawer !== 'none' && (
          <div className="w-80 sm:w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full shadow-2xl z-20">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeDrawer === 'chat' ? (
                  <>
                    <MessageSquare className="w-4 h-4 text-brand-400" />
                    <h3 className="text-sm font-bold text-white">3-Way Session Chat</h3>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Terminology Glossary</h3>
                  </>
                )}
              </div>
              <button 
                onClick={() => setActiveDrawer('none')}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Drawer Content */}
            {activeDrawer === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`p-3 rounded-2xl text-xs space-y-1 ${
                        msg.role === 'system' 
                          ? 'bg-slate-800/60 border border-slate-700/50 text-slate-400'
                          : msg.role === role
                          ? 'bg-brand-600 text-white ml-6'
                          : 'bg-slate-800 text-slate-200 mr-6'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] opacity-75 font-semibold">
                        <span>{msg.sender}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  ))}
                </div>

                {/* Quick Phrases */}
                <div className="p-2 bg-slate-950/60 border-t border-slate-800 flex gap-1.5 overflow-x-auto">
                  {QUICK_PHRASES.slice(0, 3).map((qp, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setMessageInput(qp.en);
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-[10px] font-semibold whitespace-nowrap border border-slate-700 shrink-0"
                    >
                      {qp.en}
                    </button>
                  ))}
                </div>

                {/* Message Input Form */}
                <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type in-call message..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-md transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Glossary Drawer Content */}
            {activeDrawer === 'glossary' && (
              <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={glossaryQuery}
                    onChange={(e) => setGlossaryQuery(e.target.value)}
                    placeholder={`Search medical/legal terms in ${targetLanguage}...`}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                    <p className="font-bold text-emerald-400">Consent Form (اقرار نامہ)</p>
                    <p className="text-slate-300 text-[11px]">Formal written document affirming informed agreement.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                    <p className="font-bold text-emerald-400">Hypertension (ہائی بلڈ پریشر)</p>
                    <p className="text-slate-300 text-[11px]">Condition of abnormally elevated blood pressure.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                    <p className="font-bold text-emerald-400">Affidavit (حلف نامہ)</p>
                    <p className="text-slate-300 text-[11px]">Sworn statement in writing made under oath.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* 4. BOTTOM CONTROL BAR */}
      <div className="h-20 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-2xl z-30">
        
        {/* Left Side Audio Meter Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
            <div className={`w-2 h-2 rounded-full ${micPermissionState === 'granted' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-slate-300 font-semibold hidden sm:inline">
              {micPermissionState === 'granted' ? (isMuted ? 'Mic Muted' : 'Mic Live & Capturing') : 'Mic Disconnected'}
            </span>
          </div>
        </div>

        {/* Center Control Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Mute / Unmute Button */}
          <button
            onClick={handleToggleMute}
            className={`p-3.5 rounded-2xl font-bold text-xs transition flex items-center gap-2 shadow-lg ${
              isMuted 
                ? 'bg-red-600 hover:bg-red-500 text-white ring-2 ring-red-400' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
            }`}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-emerald-400" />}
            <span className="hidden md:inline">{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          {/* Camera On / Off Button */}
          <button
            onClick={handleToggleVideo}
            className={`p-3.5 rounded-2xl font-bold text-xs transition flex items-center gap-2 shadow-lg ${
              isVideoOff 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700' 
                : 'bg-brand-600 hover:bg-brand-500 text-white'
            }`}
            title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5 text-slate-400" /> : <Video className="w-5 h-5 text-white" />}
            <span className="hidden md:inline">{isVideoOff ? 'Camera Off' : 'Camera On'}</span>
          </button>

          {/* Screen Share Button */}
          <button
            onClick={handleToggleScreenShare}
            className={`p-3.5 rounded-2xl font-bold text-xs transition flex items-center gap-2 shadow-lg ${
              isScreenSharing 
                ? 'bg-amber-600 text-white ring-2 ring-amber-400' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
            title="Present Screen or Document"
          >
            <MonitorUp className="w-5 h-5 text-amber-400" />
            <span className="hidden md:inline">Share Screen</span>
          </button>

          {/* Interpreter Floor Pause Button */}
          <button
            onClick={handleRequestPause}
            className="p-3.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs transition flex items-center gap-2"
            title="Signal floor pause"
          >
            <Hand className="w-5 h-5" />
            <span className="hidden md:inline">Pause Floor</span>
          </button>

          {/* End Call Button */}
          <button
            onClick={() => setShowDebrief(true)}
            className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-xl shadow-red-600/30 flex items-center gap-2 transition transform hover:scale-105"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Call</span>
          </button>
        </div>

        {/* Right Info */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-400">3-Party Live</span>
        </div>

      </div>

      {/* 5. DEBRIEF & SESSION LOGGING MODAL */}
      {showDebrief && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 shadow-2xl bg-slate-900 text-white">
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
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
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

      {/* 6. MOUNTED REMOTE AUDIO STREAMS IN REACT DOM */}
      {Object.entries(remoteStreamsMap).map(([peerId, st]) => (
        <audio
          key={peerId}
          autoPlay
          playsInline
          ref={(el) => {
            if (el) {
              audioElementsMapRef.current[peerId] = el;
              if (st && el.srcObject !== st) {
                el.srcObject = st;
              }
              el.muted = false;
              el.volume = 1.0;
              el.play().catch(() => {
                setShowAudioUnlockNotice(true);
              });
            } else {
              delete audioElementsMapRef.current[peerId];
            }
          }}
          style={{ position: 'fixed', top: -9999, left: -9999, width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
        />
      ))}

    </div>
  );
}
