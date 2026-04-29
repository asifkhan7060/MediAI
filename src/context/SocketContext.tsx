import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: Set<string>;
  isOnline: (userId: string) => boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: new Set(),
  isOnline: () => false,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);
  const joinedRef = useRef<string | null>(null);

  // Get the user's ID — handle both _id and id formats
  const userId = user?._id || (user as any)?.id || null;

  useEffect(() => {
    // Only connect if user is logged in
    if (!userId || !token) {
      // Disconnect if logged out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setOnlineUsers(new Set());
        joinedRef.current = null;
      }
      return;
    }

    // Already connected for this user
    if (socketRef.current?.connected && joinedRef.current === userId) return;

    // Clean up any stale socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const s = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    s.on('connect', () => {
      console.log('🔌 Socket connected, joining as:', userId);
      s.emit('join', userId);
      joinedRef.current = userId;
    });

    // Listen for online users broadcast
    s.on('online_users', (userIds: string[]) => {
      setOnlineUsers(new Set(userIds));
    });

    // Re-join on reconnect
    s.on('reconnect', () => {
      console.log('🔌 Socket reconnected, re-joining as:', userId);
      s.emit('join', userId);
    });

    s.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    socketRef.current = s;
    setSocket(s);

    return () => {
      s.disconnect();
      socketRef.current = null;
      joinedRef.current = null;
      setSocket(null);
    };
  }, [userId, token]);

  const isOnline = useCallback((checkId: string) => onlineUsers.has(checkId), [onlineUsers]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isOnline }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
