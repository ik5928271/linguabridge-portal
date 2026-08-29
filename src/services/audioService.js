// Audio and Speech Synthesis Engine for Real Voice Output in LinguaBridge

let speechEnabled = true;

export function setSpeechEnabled(enabled) {
  speechEnabled = enabled;
  if (!enabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function getSpeechEnabled() {
  return speechEnabled;
}

// Speak aloud text using Web Speech API with language and voice configuration
export function speakText(text, langCode = 'en-US', options = {}) {
  if (!speechEnabled) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel(); // Stop any overlapping speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    // Map language code to ISO code
    let iso = 'en-US';
    if (langCode === 'es' || langCode.toLowerCase().includes('spanish')) iso = 'es-ES';
    else if (langCode === 'ar' || langCode.toLowerCase().includes('arabic')) iso = 'ar-SA';
    else if (langCode === 'zh' || langCode.toLowerCase().includes('chinese') || langCode.toLowerCase().includes('mandarin')) iso = 'zh-CN';
    else if (langCode === 'fr' || langCode.toLowerCase().includes('french')) iso = 'fr-FR';
    else if (langCode === 'vi' || langCode.toLowerCase().includes('vietnamese')) iso = 'vi-VN';
    else if (langCode === 'ru' || langCode.toLowerCase().includes('russian')) iso = 'ru-RU';
    else if (langCode === 'pt' || langCode.toLowerCase().includes('portuguese')) iso = 'pt-BR';
    else if (langCode === 'hi' || langCode.toLowerCase().includes('hindi')) iso = 'hi-IN';

    utterance.lang = iso;

    // Pick best available voice
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const match = voices.find(v => v.lang.startsWith(iso.slice(0, 2)));
      if (match) {
        utterance.voice = match;
      }
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis playback error:', err);
  }
}

// Synthesize Telephone Ring Chime using Web Audio API
export function playTelephoneRing() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(440, ctx.currentTime);
    osc2.frequency.setValueAtTime(480, ctx.currentTime);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 1.4);
    osc2.stop(ctx.currentTime + 1.4);
  } catch (e) {
    console.warn('Web Audio error:', e);
  }
}

// Synthesize Call Connected Success Chime
export function playConnectedChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chord
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.09);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.09);
      osc.stop(ctx.currentTime + i * 0.09 + 0.35);
    });
  } catch (e) {
    console.warn('Web Audio error:', e);
  }
}

// Synthesize Gentle Message Received Pop Tone
export function playMessageTone() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.08); // A6
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {
    console.warn('Web Audio error:', e);
  }
}

// Synthesize Interpreter Pause Floor Gong Alert
export function playPauseFloorAlert() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(329.63, ctx.currentTime); // E4
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch (e) {
    console.warn('Web Audio error:', e);
  }
}
