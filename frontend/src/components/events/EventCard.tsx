/**
 * EventCard Component
 * 
 * Displays event information in a card format using Relay fragments
 * for efficient data fetching. This component will be enhanced with
 * GraphQL integration in later tasks.
 */

import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/lib/utils';

// TODO: Replace with actual Relay fragment in future tasks
interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  attendeeCount: number;
  maxAttendees?: number;
  organizer: {
    name: string;
  };
}

interface EventCardProps {
  event: EventData;
  onRSVP?: (eventId: string) => void;
  onViewDetails?: (eventId: string) => void;
}

/**
 * EventCard component - will use Relay fragments for data fetching
 * Fragment will be: EventCard_event
 */
export const EventCard: React.FC<EventCardProps> = ({
  event,
  onRSVP,
  onViewDetails
}) => {
  const availableSpots = event.maxAttendees 
    ? event.maxAttendees - event.attendeeCount 
    : null;

  const isUpcoming = new Date(event.date) > new Date();

  return (
    <Card hover className="h-full">
      <CardHeader>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {event.title}
        </h3>
        <div className="text-sm text-gray-500">
          Organized by {event.organizer.name}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {event.description}
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-700">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDateTime(event.date)}
          </div>

          <div className="flex items-center text-gray-700">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.location}
          </div>

          <div className="flex items-center text-gray-700">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            {event.attendeeCount} attending
            {availableSpots !== null && (
              <span className="text-gray-500">
                {availableSpots > 0 
                  ? ` • ${availableSpots} spots left` 
                  : ' • Full'
                }
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex space-x-3 w-full">
          <Button
            variant="outline"
            onClick={() => onViewDetails?.(event.id)}
            className="flex-1"
          >
            View Details
          </Button>
          
          {isUpcoming && availableSpots !== 0 && (
            <Button
              variant="primary"
              onClick={() => onRSVP?.(event.id)}
              className="flex-1"
            >
              RSVP
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

// TODO: Add Relay fragment
// const EventCard_event = graphql`
//   fragment EventCard_event on Event {
//     id
//     title
//     description
//     date
//     location
//     attendeeCount
//     maxAttendees
//     organizer {
//       name
//     }
//   }
// `; 