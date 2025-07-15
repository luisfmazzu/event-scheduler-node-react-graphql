/**
 * Home Page
 * 
 * Main page of the Event Scheduler application.
 * Displays a list of events using the EventList component with real-time updates.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { EventList } from '@/components/events/EventList';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Header } from '@/components/layout/Header';
import { Search, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  SUBSCRIPTION_QUERIES, 
  subscribe, 
  RsvpUpdate, 
  EventUpdate, 
  SubscriptionResponse,
  useConnectionStatus 
} from '@/lib/subscriptionClient';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  attendeeCount: number;
  maxAttendees: number | null;
  availableSpots: number | null;
  organizer: {
    name: string;
  };
}

export default function HomePage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [realtimeUpdate, setRealtimeUpdate] = useState<{
    message: string;
    type: 'event' | 'rsvp';
    eventId?: string;
  } | null>(null);
  const { isConnected } = useConnectionStatus();

  // Fetch events from GraphQL API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetEvents {
              events {
                id
                title
                description
                date
                location
                maxAttendees
                attendeeCount
                organizer {
                  name
                }
              }
            }
          `,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      // Calculate available spots for each event
      const eventsWithSpots = data.data.events.map((event: any) => ({
        ...event,
        availableSpots: event.maxAttendees ? event.maxAttendees - event.attendeeCount : null,
      }));

      setEvents(eventsWithSpots);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Subscribe to real-time event updates
  useEffect(() => {
    // Subscribe to all event updates (create, update, delete)
    const unsubscribeEvents = subscribe<SubscriptionResponse<{ allEventUpdates: EventUpdate }>>(
      {
        query: SUBSCRIPTION_QUERIES.ALL_EVENT_UPDATES,
        variables: {}
      },
      (response) => {
        const { allEventUpdates } = response.data;
        
        setRealtimeUpdate({
          message: `Event "${allEventUpdates.event.title}" was ${allEventUpdates.action.toLowerCase()}`,
          type: 'event',
          eventId: allEventUpdates.event.id
        });

        // Update events list based on action
        if (allEventUpdates.action === 'CREATED') {
          const newEvent = {
            ...allEventUpdates.event,
            availableSpots: allEventUpdates.event.maxAttendees 
              ? allEventUpdates.event.maxAttendees - allEventUpdates.event.attendeeCount 
              : null,
          };
          setEvents(prev => [newEvent, ...prev]);
        } else if (allEventUpdates.action === 'UPDATED') {
          setEvents(prev => prev.map(event => 
            event.id === allEventUpdates.event.id 
              ? {
                  ...allEventUpdates.event,
                  availableSpots: allEventUpdates.event.maxAttendees 
                    ? allEventUpdates.event.maxAttendees - allEventUpdates.event.attendeeCount 
                    : null,
                }
              : event
          ));
        } else if (allEventUpdates.action === 'DELETED') {
          setEvents(prev => prev.filter(event => event.id !== allEventUpdates.event.id));
        }

        // Clear notification after 5 seconds
        setTimeout(() => setRealtimeUpdate(null), 5000);
      },
      (error) => {
        console.error('Event updates subscription error:', error);
      }
    );

    // Subscribe to all RSVP updates  
    const unsubscribeRsvps = subscribe<SubscriptionResponse<{ allRsvpUpdates: RsvpUpdate }>>(
      {
        query: SUBSCRIPTION_QUERIES.ALL_RSVP_UPDATES,
        variables: {}
      },
      (response) => {
        const { allRsvpUpdates } = response.data;
        
        setRealtimeUpdate({
          message: `${allRsvpUpdates.user.name} ${allRsvpUpdates.action === 'JOINED' ? 'joined' : 'left'} "${allRsvpUpdates.event.title}"`,
          type: 'rsvp',
          eventId: allRsvpUpdates.event.id
        });

        // Update attendee count for the specific event
        setEvents(prev => prev.map(event => 
          event.id === allRsvpUpdates.event.id 
            ? {
                ...event,
                attendeeCount: allRsvpUpdates.event.attendeeCount,
                availableSpots: allRsvpUpdates.event.availableSpots
              }
            : event
        ));

        // Clear notification after 5 seconds
        setTimeout(() => setRealtimeUpdate(null), 5000);
      },
      (error) => {
        console.error('RSVP updates subscription error:', error);
      }
    );

    return () => {
      unsubscribeEvents();
      unsubscribeRsvps();
    };
  }, []);

  // Filter events based on search term
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRsvp = (eventId: string) => {
    // Navigate to event details for RSVP
    router.push(`/events/${eventId}`);
  };

  const handleViewDetails = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleRefresh = () => {
    fetchEvents();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Real-time update notifications */}
      {realtimeUpdate && (
        <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4`}>
          <div className={`border rounded-lg p-4 mb-4 ${
            realtimeUpdate.type === 'event' 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-3 animate-pulse ${
                  realtimeUpdate.type === 'event' ? 'bg-blue-500' : 'bg-green-500'
                }`}></div>
                <p className={`text-sm font-medium ${
                  realtimeUpdate.type === 'event' ? 'text-blue-800' : 'text-green-800'
                }`}>
                  🔴 LIVE: {realtimeUpdate.message}
                </p>
              </div>
              {realtimeUpdate.eventId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/events/${realtimeUpdate.eventId}`)}
                  className="text-xs"
                >
                  View Event
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            Upcoming Events
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Discover and join exciting events in your community. 
            {isConnected && (
              <span className="text-green-600 ml-2 block sm:inline">📡 Live updates enabled</span>
            )}
          </p>
        </div>

        {/* Search and Controls */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <span className="text-lg sm:text-xl">Browse Events</span>
              <div className="flex items-center justify-between sm:justify-end gap-2">
                <span className="text-sm text-gray-500">
                  {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Events</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={handleRefresh}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Events List */}
        <EventList
          events={filteredEvents}
          onRsvp={handleRsvp}
          onViewDetails={handleViewDetails}
          loading={loading}
          emptyMessage={
            searchTerm 
              ? `No events found matching "${searchTerm}"`
              : "No events found. Be the first to create one!"
          }
        />

        {/* Loading state for real-time updates */}
        {!isConnected && !loading && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-yellow-800">
                Connecting to real-time updates...
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 