/**
 * EventList Component
 * 
 * Displays a list of events using the EventCard component.
 * Provides a responsive grid layout for event cards.
 */

import React from 'react';
import { EventCard } from './EventCard';

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

interface EventListProps {
  events: Event[];
  onRsvp?: (eventId: string) => void;
  onViewDetails?: (eventId: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  onRsvp,
  onViewDetails,
  loading = false,
  emptyMessage = 'No events found.',
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 rounded-xl h-80 w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onRsvp={onRsvp}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}; 