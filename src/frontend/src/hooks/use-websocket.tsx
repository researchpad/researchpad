import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { WSMessage } from "@/lib/types";

interface WebSocketContextValue {
  isConnected: boolean;
  lastMessage: WSMessage | null;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  isConnected: false,
  lastMessage: null,
});

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const queryClient = useQueryClient();

  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);

    ws.onclose = () => {
      setIsConnected(false);
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => ws.close();

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        setLastMessage(msg);

        if (msg.type === "experiment:new" || msg.type === "experiments:refresh") {
          queryClient.invalidateQueries({ queryKey: ["experiments"] });
          queryClient.invalidateQueries({ queryKey: ["summary"] });
          queryClient.invalidateQueries({ queryKey: ["progress"] });
        }

        if (msg.type === "research:new" || msg.type === "research:updated") {
          queryClient.invalidateQueries({ queryKey: ["research"] });
        }

        if (msg.type === "debug:new" || msg.type === "debug:updated") {
          queryClient.invalidateQueries({ queryKey: ["debug"] });
        }
      } catch {
        // ignore non-JSON messages
      }
    };
  }, [queryClient]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return (
    <WebSocketContext.Provider value={{ isConnected, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
