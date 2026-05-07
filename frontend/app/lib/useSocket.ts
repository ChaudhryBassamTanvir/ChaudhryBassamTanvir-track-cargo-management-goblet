import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost';

export function useSocket(event: string, handler: (data: any) => void, room?: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    if (room) socket.emit('subscribe', room);
    socket.on(event, handler);

    return () => {
      if (room) socket.emit('unsubscribe', room);
      socket.off(event, handler);
      socket.disconnect();
    };
  }, [event, room]);

  return socketRef;
}