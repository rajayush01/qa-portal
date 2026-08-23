import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '@/services/socket';
import { useAuth } from './AuthContext';

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, connected: false });

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user) {
      setSocket(null);
      setConnected(false);
      return;
    }

    const s = getSocket();
    setSocket(s);
    if (!s) return;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    setConnected(s.connected);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
    };
  }, [user]);

  return <SocketContext.Provider value={{ socket, connected }}>{children}</SocketContext.Provider>;
};

export const useSocket = (): SocketContextValue => useContext(SocketContext);
