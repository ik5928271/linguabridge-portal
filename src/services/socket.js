import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    // Try to connect to backend server
    const serverUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin;
    socket = io(serverUrl, {
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 5000
    });

    socket.on('connect', () => {
      console.log('⚡ Socket connected to server:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ Socket server unreachable (running in client-mode simulation):', err.message);
    });
  }
  return socket;
}
