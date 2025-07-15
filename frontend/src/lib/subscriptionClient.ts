/**
 * GraphQL Subscription Client
 * 
 * WebSocket client for handling real-time GraphQL subscriptions
 */

import { createClient, Client, SubscribePayload } from 'graphql-ws';

// WebSocket endpoint for subscriptions
const WS_ENDPOINT = process.env.NEXT_PUBLIC_WS_ENDPOINT || 'ws://localhost:4000/graphql-ws';

// Global subscription client instance
let client: Client | null = null;

// Create and configure the subscription client
export function createSubscriptionClient(): Client {
  if (client) {
    return client;
  }

  client = createClient({
    url: WS_ENDPOINT,
    connectionParams: () => {
      // Get authentication token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      return {
        Authorization: token ? `Bearer ${token}` : undefined,
        connectionId: Math.random().toString(36)
      };
    },
    retryAttempts: 5,
    shouldRetry: () => true,
    on: {
      connected: () => {
        console.log('🔗 Connected to GraphQL subscription server');
      },
      closed: () => {
        console.log('🔌 Disconnected from GraphQL subscription server');
      },
      error: (error) => {
        console.error('❌ Subscription client error:', error);
      }
    }
  });

  return client;
}

// Get the current subscription client
export function getSubscriptionClient(): Client {
  if (!client) {
    return createSubscriptionClient();
  }
  return client;
}

// Subscribe to GraphQL subscription
export function subscribe<T = any>(
  payload: SubscribePayload,
  onNext: (value: T) => void,
  onError?: (error: any) => void,
  onComplete?: () => void
) {
  const client = getSubscriptionClient();
  
  return client.subscribe(payload, {
    next: onNext,
    error: onError || ((error) => console.error('Subscription error:', error)),
    complete: onComplete || (() => console.log('Subscription completed'))
  });
}

// Close the subscription client
export function closeSubscriptionClient() {
  if (client) {
    client.dispose();
    client = null;
  }
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

// Utility function to handle subscription lifecycle
export function useSubscription<T>(
  query: string,
  variables: Record<string, any> = {},
  enabled: boolean = true
) {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(enabled);
  const unsubscribeRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    if (!enabled) {
      setLoading(false);
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
  }, [query, JSON.stringify(variables), enabled]);

  return { data, error, loading };
}

// Need to import React for the hook
import React from 'react'; 