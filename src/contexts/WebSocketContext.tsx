'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (message: any) => void;
  subscribe: (eventType: string, callback: (data: WebSocketMessage) => void) => () => void;
  unsubscribe: (eventType: string, callback: (data: WebSocketMessage) => void) => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastConnectAttemptRef = useRef(0);
  const subscribersRef = useRef<Map<string, Set<(data: WebSocketMessage) => void>>>(new Map());
  const isMountedRef = useRef(true);
  const hasConnectedRef = useRef(false);

  // Function to get session ID from backend
  const getSessionId = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/session`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.session_id) {
          setSessionId(data.session_id);
          return data.session_id;
        }
      }
    } catch (error) {
      console.error('Error fetching session ID:', error);
    }
    return null;
  }, []);

  // Function to establish WebSocket connection
  const connect = useCallback(async () => {
    try {
      // Check if component is still mounted
      if (!isMountedRef.current) {
        console.log('Component unmounted, skipping WebSocket connection');
        return;
      }

      // Rate limiting: prevent connection attempts more frequently than every 2 seconds
      const now = Date.now();
      if (now - lastConnectAttemptRef.current < 2000) {
        console.log('Connection attempt rate limited, skipping...');
        return;
      }
      lastConnectAttemptRef.current = now;

      console.log('Attempting to connect to WebSocket...');
      console.log('Current session ID:', sessionId);
      
      // Check if WebSocket is supported
      if (typeof WebSocket === 'undefined') {
        console.log('WebSocket not supported in this environment');
        return;
      }

      // Prevent multiple connection attempts
      if (wsConnection && wsConnection.readyState === WebSocket.CONNECTING) {
        console.log('WebSocket connection already in progress, skipping...');
        return;
      }

      if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected, skipping...');
        return;
      }

      // Get session ID if not already available
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        currentSessionId = await getSessionId();
      }

      if (!currentSessionId) {
        console.error('Failed to get session ID, cannot connect to WebSocket');
        return;
      }

      // Use the standard WebSocket endpoint - the backend handles club-specific routing via session
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/ws?session_id=${currentSessionId}`;
      console.log('Attempting to connect to WebSocket:', wsUrl);
      
      let ws: WebSocket;

      try {
        ws = new WebSocket(wsUrl);
    
        // Set connection timeout
        connectionTimeoutRef.current = setTimeout(() => {
          if (ws.readyState === WebSocket.CONNECTING) {
            console.error('WebSocket connection timeout');
            ws.close();
          }
        }, 5000); // 5 second timeout

        ws.onopen = () => {
          console.log('WebSocket connected successfully to:', wsUrl);
          if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
          setWsConnection(ws);
          setIsConnected(true);
          hasConnectedRef.current = true;
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
            
            // Notify all subscribers for this event type
            const eventType = data.type;
            const subscribers = subscribersRef.current.get(eventType);
            if (subscribers) {
              subscribers.forEach(callback => {
                try {
                  callback(data);
                } catch (error) {
                  console.error('Error in WebSocket subscriber callback:', error);
                }
              });
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (event) => {
          console.error('WebSocket connection error. URL:', wsUrl);
          console.error('WebSocket readyState:', ws.readyState);
          console.error('Error event:', event);
          console.error('Session ID:', currentSessionId);
        };

        ws.onclose = (event) => {
          console.log('WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
          if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
          setWsConnection(null);
          setIsConnected(false);

          // Only attempt to reconnect if this wasn't a manual disconnect and component is still mounted
          if (event.code !== 1000 && !reconnectTimeoutRef.current && isMountedRef.current) {
            console.log('Scheduling reconnection in 5 seconds...');
            reconnectTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current) {
                console.log('Attempting to reconnect...');
                reconnectTimeoutRef.current = null;
                connect();
              }
            }, 5000);
          }
        };

      } catch (error) {
        console.error('Error creating WebSocket:', error);
        if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
        return;
      }
    } catch (error) {
      console.error('Error in connectWebSocket:', error);
    }
  }, [sessionId, getSessionId, wsConnection]);

  // Function to disconnect WebSocket
  const disconnect = useCallback(() => {
    console.log('Disconnecting WebSocket...');
    
    // Clear any pending reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }

    // Close the WebSocket connection
    if (wsConnection) {
      if (wsConnection.readyState === WebSocket.OPEN || wsConnection.readyState === WebSocket.CONNECTING) {
        wsConnection.close(1000, 'Manual disconnect');
      }
    }
    
    setWsConnection(null);
    setIsConnected(false);
  }, [wsConnection]);

  // Function to send message
  const sendMessage = useCallback((message: any) => {
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected, cannot send message');
    }
  }, [wsConnection]);

  // Function to subscribe to specific event types
  const subscribe = useCallback((eventType: string, callback: (data: WebSocketMessage) => void) => {
    if (!subscribersRef.current.has(eventType)) {
      subscribersRef.current.set(eventType, new Set());
    }
    subscribersRef.current.get(eventType)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const subscribers = subscribersRef.current.get(eventType);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          subscribersRef.current.delete(eventType);
        }
      }
    };
  }, []);

  // Function to unsubscribe from specific event types
  const unsubscribe = useCallback((eventType: string, callback: (data: WebSocketMessage) => void) => {
    const subscribers = subscribersRef.current.get(eventType);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        subscribersRef.current.delete(eventType);
      }
    }
  }, []);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    console.log('WebSocketProvider mounting, connecting...');
    connect();
    
    // Cleanup on unmount
    return () => {
      console.log('WebSocketProvider unmounting, disconnecting...');
      isMountedRef.current = false;
      // Only disconnect if we actually have a connection and this is a real unmount
      if (wsConnection && hasConnectedRef.current) {
        disconnect();
      }
    };
  }, []); // Empty dependency array to run only once

  const value: WebSocketContextType = {
    isConnected,
    sendMessage,
    subscribe,
    unsubscribe,
    disconnect
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
