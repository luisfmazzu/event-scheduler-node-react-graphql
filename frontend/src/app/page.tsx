/**
 * Home Page
 * 
 * Main page of the Event Scheduler application.
 * Displays a list of events using the EventList component.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { EventList } from '@/components/events/EventList';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Search, Plus, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  attendeeCount: number;
  maxAttendees?: number;
  availableSpots?: number;
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

  // Fetch events from GraphQL API
  useEffect(() => {
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

    fetchEvents();
  }, []);

  // Filter events based on search term
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRsvp = (eventId: string) => {
    // TODO: Implement RSVP functionality
    console.log('RSVP to event:', eventId);
  };

  const handleViewDetails = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Event Scheduler</h1>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Discover Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search events..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    All Events
                  </Button>
                  <Button variant="outline" size="sm">
                    Upcoming
                  </Button>
                  <Button variant="outline" size="sm">
                    Today
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="text-red-600 text-center">
                <p className="font-semibold">Error loading events</p>
                <p className="text-sm">{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Event List */}
        <EventList
          events={filteredEvents}
          loading={loading}
          onRsvp={handleRsvp}
          onViewDetails={handleViewDetails}
          emptyMessage={
            searchTerm
              ? `No events found matching "${searchTerm}"`
              : 'No events available. Create your first event!'
          }
        />
      </main>
    </div>
  );
} 