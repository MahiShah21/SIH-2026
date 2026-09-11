import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      console.log('⚡ [Frontend Socket] Connected to real-time server:', socketInstance.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('⚡ [Frontend Socket] Disconnected:', reason);
    });
  }

  return socketInstance;
}

export default getSocket;
