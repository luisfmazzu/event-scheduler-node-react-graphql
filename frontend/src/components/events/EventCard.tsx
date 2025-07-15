/**
 * EventCard Component
 * 
 * A beautiful event card component that displays event information
 * using Shadcn/ui components and GraphQL fragments.
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from '../ui';
import { formatDate, formatDateTime } from '@/lib/utils';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

interface EventCardProps {
  event: {
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
  };
  onRsvp?: (eventId: string) => void;
  onViewDetails?: (eventId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onRsvp,
  onViewDetails,
}) => {
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();
  const isFull = event.maxAttendees ? event.attendeeCount >= event.maxAttendees : false;

  return (
    <Card className="w-full max-w-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
            <CardDescription className="text-sm text-slate-600 mb-2">
              by {event.organizer.name}
            </CardDescription>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isUpcoming ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {isUpcoming ? 'Upcoming' : 'Past'}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-slate-700 mb-4 line-clamp-3">
          {event.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-slate-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formatDateTime(event.date)}</span>
          </div>

          <div className="flex items-center text-sm text-slate-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{event.location}</span>
          </div>

          <div className="flex items-center text-sm text-slate-600">
            <Users className="w-4 h-4 mr-2" />
            <span>
              {event.attendeeCount} attending
              {event.maxAttendees && ` • ${event.availableSpots} spots left`}
            </span>
          </div>

          {isUpcoming && (
            <div className="flex items-center text-sm text-slate-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>
                {eventDate.toLocaleDateString() === new Date().toLocaleDateString()
                  ? 'Today'
                  : formatDate(event.date, 'short')}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails?.(event.id)}
          className="flex-1"
        >
          View Details
        </Button>
        
        {isUpcoming && (
          <Button
            size="sm"
            onClick={() => onRsvp?.(event.id)}
            disabled={isFull}
            className="flex-1"
          >
            {isFull ? 'Full' : 'RSVP'}
          </Button>
        )}
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