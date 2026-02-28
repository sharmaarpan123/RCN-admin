"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { getCookie } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/staffQueryKeys";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL;

type SocketContextValue = {
  socket: Socket | null;
  connected: boolean;
  onlineUserIds: string[];
  sendMessage: (referralId: string, message: string, departmentId?: string, callBack?: (data: unknown) => void) => void;
};

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
  onlineUserIds: [],
  sendMessage: () => { },
});

export function useSocket() {
  const ctx = useContext(SocketContext);
  return ctx;
}

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = getCookie("authorization");
    if (!token) return;

    const s = io(SOCKET_URL, {
      auth: { token },
    });
    socketRef.current = s;
    queueMicrotask(() => setSocket(s));

    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));
    s.on("connect_error", () => setConnected(false));

    s.on("user_online", (data: { userId?: string }) => {
      if (data?.userId) setOnlineUserIds((prev) => (prev.includes(data.userId!) ? prev : [...prev, data.userId!]));
    });
    s.on("user_offline", (data: { userId?: string }) => {
      if (data?.userId) setOnlineUserIds((prev) => prev.filter((id) => id !== data.userId));
    });

    s.on("new_message", () => {
      queryClient.invalidateQueries({ queryKey: defaultQueryKeys.referralChatList });
      queryClient.invalidateQueries({ queryKey: defaultQueryKeys.referralChatMessages });
    });

    return () => {
      s.removeAllListeners();
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
      setOnlineUserIds([]);
    };
  }, [queryClient]);

  const sendMessage = useCallback((referralId: string, message: string, departmentId?: string, callBack?: (data: unknown) => void) => {
    const s = socketRef.current;
    console.log(departmentId, "departmentId")
    if (s?.connected) {
      s.emit("send_message", { referralId, message, departmentId: departmentId ?? "" }, (data: unknown) => {
        callBack?.(data)


      });
    }
  }, []);

  const value: SocketContextValue = {
    socket,
    connected,
    onlineUserIds,
    sendMessage,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
