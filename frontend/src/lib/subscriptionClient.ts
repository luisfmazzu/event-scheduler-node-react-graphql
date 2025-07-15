/**
 * GraphQL Subscription Client
 * 
 * WebSocket client for handling real-time GraphQL subscriptions
 * with advanced connection management and status monitoring
 */

import { createClient, Client, SubscribePayload } from 'graphql-ws';
import React from 'react';

// WebSocket endpoint for subscriptions
const WS_ENDPOINT = process.env.NEXT_PUBLIC_WS_ENDPOINT || 'ws://localhost:4000/graphql-ws';

// Connection status types
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

// Connection manager class
class SubscriptionConnectionManager {
  private client: Client | null = null;
  private connectionStatus: ConnectionStatus = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastHeartbeat: number = 0;

  // Get current connection status
  getStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  // Subscribe to connection status changes
  onStatusChange(listener: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    // Immediately call with current status
    listener(this.connectionStatus);
    
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  // Notify all status listeners
  private notifyStatusChange(status: ConnectionStatus) {
    this.connectionStatus = status;
    this.statusListeners.forEach(listener => listener(status));
  }

  // Create and configure the subscription client
  createClient(): Client {
    if (this.client) {
      return this.client;
    }

    this.notifyStatusChange('connecting');

    this.client = createClient({
      url: WS_ENDPOINT,
      connectionParams: () => {
        // Get authentication token from localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        
        return {
          Authorization: token ? `Bearer ${token}` : undefined,
          connectionId: Math.random().toString(36),
          timestamp: Date.now()
        };
      },
      retryAttempts: this.maxReconnectAttempts,
      shouldRetry: (errOrCloseEvent) => {
        // Always retry unless we've exceeded max attempts
        return this.reconnectAttempts < this.maxReconnectAttempts;
      },
      retryWait: async (retries) => {
        // Exponential backoff with jitter
        const baseDelay = Math.min(1000 * Math.pow(2, retries), 30000);
        const jitter = Math.random() * 1000;
        const delay = baseDelay + jitter;
        
        console.log(`🔄 Retrying connection in ${delay}ms (attempt ${retries + 1}/${this.maxReconnectAttempts})`);
        this.notifyStatusChange('reconnecting');
        
        await new Promise(resolve => setTimeout(resolve, delay));
      },
      lazy: false, // Connect immediately
      on: {
        connecting: () => {
          console.log('🔗 Connecting to GraphQL subscription server...');
          this.notifyStatusChange('connecting');
          this.reconnectAttempts = 0;
        },
        connected: (socket, payload) => {
          console.log('✅ Connected to GraphQL subscription server');
          this.notifyStatusChange('connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          
          // Clear any existing reconnect timeout
          if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
          }
        },
        closed: (event) => {
          console.log('🔌 Disconnected from GraphQL subscription server', event);
          this.notifyStatusChange('disconnected');
          this.stopHeartbeat();
          
          // Only attempt reconnection if it wasn't a normal closure
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        },
        error: (error) => {
          console.error('❌ Subscription client error:', error);
          this.notifyStatusChange('error');
          this.stopHeartbeat();
          
          this.reconnectAttempts++;
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        },
        message: (message) => {
          // Update heartbeat on any message
          this.lastHeartbeat = Date.now();
        }
      }
    });

    return this.client;
  }

  // Start heartbeat monitoring
  private startHeartbeat() {
    this.lastHeartbeat = Date.now();
    
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastHeartbeat = now - this.lastHeartbeat;
      
      // If no message received in 60 seconds, consider connection stale
      if (timeSinceLastHeartbeat > 60000) {
        console.warn('⚠️  No heartbeat received, connection may be stale');
        this.reconnect();
      }
    }, 30000); // Check every 30 seconds
  }

  // Stop heartbeat monitoring
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Schedule a reconnection attempt
  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`📅 Scheduling reconnection in ${delay}ms`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnect();
    }, delay);
  }

  // Force reconnection
  reconnect() {
    console.log('🔄 Forcing reconnection...');
    
    if (this.client) {
      this.client.dispose();
      this.client = null;
    }
    
    this.createClient();
  }

  // Get the current subscription client
  getClient(): Client {
    if (!this.client) {
      return this.createClient();
    }
    return this.client;
  }

  // Subscribe to GraphQL subscription with connection management
  subscribe<T = any>(
    payload: SubscribePayload,
    onNext: (value: T) => void,
    onError?: (error: any) => void,
    onComplete?: () => void
  ) {
    const client = this.getClient();
    
    return client.subscribe(payload, {
      next: (value) => {
        this.lastHeartbeat = Date.now();
        onNext(value);
      },
      error: (error) => {
        console.error('📺 Subscription error:', error);
        if (onError) {
          onError(error);
        }
        
        // If it's a connection error, try to reconnect
        if (error.message?.includes('connection') || error.message?.includes('network')) {
          this.reconnect();
        }
      },
      complete: () => {
        console.log('📺 Subscription completed');
        if (onComplete) {
          onComplete();
        }
      }
    });
  }

  // Close the subscription client
  dispose() {
    console.log('🧹 Disposing subscription client...');
    
    this.stopHeartbeat();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.client) {
      this.client.dispose();
      this.client = null;
    }
    
    this.notifyStatusChange('disconnected');
    this.statusListeners.clear();
  }

  // Get connection statistics
  getStats() {
    return {
      status: this.connectionStatus,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      lastHeartbeat: this.lastHeartbeat,
      timeSinceLastHeartbeat: Date.now() - this.lastHeartbeat
    };
  }
}

// Global connection manager instance
const connectionManager = new SubscriptionConnectionManager();

// Exported convenience functions
export function createSubscriptionClient(): Client {
  return connectionManager.createClient();
}

export function getSubscriptionClient(): Client {
  return connectionManager.getClient();
}

export function subscribe<T = any>(
  payload: SubscribePayload,
  onNext: (value: T) => void,
  onError?: (error: any) => void,
  onComplete?: () => void
) {
  return connectionManager.subscribe(payload, onNext, onError, onComplete);
}

export function closeSubscriptionClient() {
  connectionManager.dispose();
}

export function getConnectionStatus(): ConnectionStatus {
  return connectionManager.getStatus();
}

export function onConnectionStatusChange(listener: (status: ConnectionStatus) => void): () => void {
  return connectionManager.onStatusChange(listener);
}

export function forceReconnect() {
  connectionManager.reconnect();
}

export function getConnectionStats() {
  return connectionManager.getStats();
}

// React hook for connection status
export function useConnectionStatus() {
  const [status, setStatus] = React.useState<ConnectionStatus>(connectionManager.getStatus());

  React.useEffect(() => {
    const unsubscribe = connectionManager.onStatusChange(setStatus);
    return unsubscribe;
  }, []);

  return {
    status,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    isReconnecting: status === 'reconnecting',
    isDisconnected: status === 'disconnected',
    hasError: status === 'error',
    reconnect: () => connectionManager.reconnect(),
    stats: connectionManager.getStats()
  };
}

// React hook for subscription with connection management
export function useSubscription<T>(
  query: string,
  variables: Record<string, any> = {},
  enabled: boolean = true
) {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(enabled);
  const { status } = useConnectionStatus();
  const unsubscribeRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Only start subscription when connected
    if (status !== 'connected') {
      setLoading(status === 'connecting' || status === 'reconnecting');
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribe<SubscriptionResponse<T>>(
      {
        query,
        variables
      },
      (response) => {
        setData(response.data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [query, JSON.stringify(variables), enabled, status]);

  return { 
    data, 
    error, 
    loading, 
    connectionStatus: status,
    retry: () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      // Re-trigger subscription by changing a dependency
      setError(null);
      setData(null);
    }
  };
}

// Subscription queries
export const SUBSCRIPTION_QUERIES = {
  // Subscribe to RSVP updates for a specific event
  RSVP_UPDATED: `
    subscription RsvpUpdated($eventId: ID!) {
      rsvpUpdated(eventId: $eventId) {
        event {
          id
          title
          attendeeCount
          availableSpots
          maxAttendees
        }
        user {
          id
          name
          email
        }
        action
        timestamp
      }
    }
  `,

  // Subscribe to all RSVP updates
  ALL_RSVP_UPDATES: `
    subscription AllRsvpUpdates {
      allRsvpUpdates {
        event {
          id
          title
          attendeeCount
          availableSpots
          maxAttendees
        }
        user {
          id
          name
          email
        }
        action
        timestamp
      }
    }
  `,

  // Subscribe to event updates for a specific event
  EVENT_UPDATED: `
    subscription EventUpdated($eventId: ID!) {
      eventUpdated(eventId: $eventId) {
        event {
          id
          title
          description
          date
          location
          maxAttendees
          attendeeCount
          organizer {
            id
            name
            email
          }
        }
        action
        timestamp
      }
    }
  `,

  // Subscribe to all event updates
  ALL_EVENT_UPDATES: `
    subscription AllEventUpdates {
      allEventUpdates {
        event {
          id
          title
          description
          date
          location
          maxAttendees
          attendeeCount
          organizer {
            id
            name
            email
          }
        }
        action
        timestamp
      }
    }
  `,

  // Subscribe to events a user is attending
  USER_EVENT_UPDATES: `
    subscription UserEventUpdates($userId: ID!) {
      userEventUpdates(userId: $userId) {
        event {
          id
          title
          description
          date
          location
          maxAttendees
          attendeeCount
          organizer {
            id
            name
            email
          }
        }
        action
        timestamp
      }
    }
  `
};

// Subscription response types
export interface RsvpUpdate {
  event: {
    id: string;
    title: string;
    attendeeCount: number;
    availableSpots: number | null;
    maxAttendees: number | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  action: 'JOINED' | 'LEFT';
  timestamp: string;
}

export interface EventUpdate {
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    maxAttendees: number | null;
    attendeeCount: number;
    organizer: {
      id: string;
      name: string;
      email: string;
    };
  };
  action: 'CREATED' | 'UPDATED' | 'DELETED';
  timestamp: string;
}

export interface SubscriptionResponse<T> {
  data: T;
} 