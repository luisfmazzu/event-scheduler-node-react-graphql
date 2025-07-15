import React from 'react';
import { Calendar, MapPin, Users, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AttendeeList } from '@/components/attendees/AttendeeList';

interface EventDetailsProps {
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    maxAttendees: number | null;
    attendeeCount: number;
    createdAt: string;
    organizer: {
      id: string;
      name: string;
      email: string;
    };
    attendees: Array<{
      id: string;
      name: string;
      email: string;
    }>;
  };
}

export function EventDetails({ event }: EventDetailsProps) {
  const eventDate = new Date(event.date);
  const createdDate = new Date(event.createdAt);
  const availableSpots = event.maxAttendees ? event.maxAttendees - event.attendeeCount : null;
  const isEventFull = availableSpots !== null && availableSpots <= 0;
  const isPastEvent = eventDate < new Date();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Main Event Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900">{event.title}</CardTitle>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{event.attendeeCount} attending</span>
              {event.maxAttendees && (
                <span className="text-gray-500">/ {event.maxAttendees} max</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Created {createdDate.toLocaleDateString()}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{event.description}</p>
          </div>
          
          {/* Availability Status */}
          <div className="mt-6 p-4 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                {availableSpots !== null && (
                  <p className={`font-medium ${isEventFull ? 'text-red-600' : 'text-green-600'}`}>
                    {isEventFull ? 'Event Full' : `${availableSpots} spots available`}
                  </p>
                )}
                {isPastEvent && (
                  <p className="text-gray-500 font-medium">This event has ended</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={isEventFull || isPastEvent ? "secondary" : "default"}
                  disabled={isEventFull || isPastEvent}
                >
                  {isPastEvent ? "Event Ended" : isEventFull ? "Full" : "RSVP"}
                </Button>
                <Button variant="outline">
                  Share Event
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <User className="w-5 h-5" />
            Event Organizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{event.organizer.name}</h3>
              <p className="text-gray-600">{event.organizer.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendees Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Attendees ({event.attendeeCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AttendeeList attendees={event.attendees} />
        </CardContent>
      </Card>
    </div>
  );
} 