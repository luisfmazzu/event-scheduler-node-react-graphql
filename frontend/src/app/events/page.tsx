/**
 * Events Page
 * 
 * Dedicated page for browsing and filtering events.
 * Provides advanced filtering and sorting capabilities.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { EventList } from '@/components/events/EventList';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Header } from '@/components/layout/Header';
import { Search, Filter, Calendar, MapPin, Users } from 'lucide-react';
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

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'today'>('all');
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

  // Filter events based on search term and filter type
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizer.name.toLowerCase().includes(searchTerm.toLowerCase());

    const eventDate = new Date(event.date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filterType) {
      case 'upcoming':
        return matchesSearch && eventDate > now;
      case 'today':
        return matchesSearch && eventDate >= today && eventDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      default:
        return matchesSearch;
    }
  });

  const handleRsvp = (eventId: string) => {
    // TODO: Implement RSVP functionality
    console.log('RSVP to event:', eventId);
  };

  const handleViewDetails = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const upcomingCount = events.filter(event => new Date(event.date) > new Date()).length;
  const todayCount = events.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return eventDate >= startOfDay && eventDate < new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
  }).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Upcoming Events</p>
                  <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Today's Events</p>
                  <p className="text-2xl font-bold text-gray-900">{todayCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Search & Filter Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by title, description, location, or organizer..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('all')}
                  >
                    All Events ({events.length})
                  </Button>
                  <Button
                    variant={filterType === 'upcoming' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('upcoming')}
                  >
                    Upcoming ({upcomingCount})
                  </Button>
                  <Button
                    variant={filterType === 'today' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('today')}
                  >
                    Today ({todayCount})
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

        {/* Results Header */}
        {!loading && !error && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {searchTerm ? `Search results for "${searchTerm}"` : 'All Events'}
            </h2>
            <p className="text-sm text-gray-500">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
            </p>
          </div>
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
              : filterType === 'upcoming'
              ? 'No upcoming events found'
              : filterType === 'today'
              ? 'No events scheduled for today'
              : 'No events available. Create your first event!'
          }
        />
      </main>
    </div>
  );
} 