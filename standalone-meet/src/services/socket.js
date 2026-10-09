import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    // Connect to the main LinguaBridge backend for signaling or standalone server
    const serverUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : 'https://linguabridge-portal.onrender.com';

    socket = io(serverUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('⚡ [Meet Portal] Connected to Signaling Server:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ [Meet Portal] Signaling notice:', err.message);
    });
  }
  return socket;
}
