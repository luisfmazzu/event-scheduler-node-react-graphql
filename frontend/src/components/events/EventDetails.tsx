import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AttendeeList } from '@/components/attendees/AttendeeList';
import { RsvpButton } from '@/components/attendees/RsvpButton';
import { LoginModal } from '@/components/auth/LoginModal';
import { useAuth } from '@/contexts/AuthContext';

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
    isUserAttending?: boolean;
  };
}

export function EventDetails({ event }: EventDetailsProps) {
  const { user, isAuthenticated } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAttending, setIsAttending] = useState(event.isUserAttending || false);
  const [attendeeCount, setAttendeeCount] = useState(event.attendeeCount);
  const [attendees, setAttendees] = useState(event.attendees);
  const [optimisticUpdate, setOptimisticUpdate] = useState(false);
  
  // Update state when event prop changes
  useEffect(() => {
    setIsAttending(event.isUserAttending || false);
    setAttendeeCount(event.attendeeCount);
    setAttendees(event.attendees);
  }, [event]);
  
  const eventDate = new Date(event.date);
  const createdDate = new Date(event.createdAt);
  const availableSpots = event.maxAttendees ? event.maxAttendees - attendeeCount : null;
  const isEventFull = availableSpots !== null && availableSpots <= 0;
  const isPastEvent = eventDate < new Date();

  const handleRsvpChange = (newIsAttending: boolean, eventId: string) => {
    setOptimisticUpdate(true);
    setIsAttending(newIsAttending);
    setAttendeeCount(prev => newIsAttending ? prev + 1 : prev - 1);

    // Optimistically update attendees list
    if (newIsAttending && user) {
      setAttendees(prev => [...prev, user]);
    } else if (!newIsAttending && user) {
      setAttendees(prev => prev.filter(attendee => attendee.id !== user.id));
    }

    // Clear optimistic update flag after a short delay
    setTimeout(() => setOptimisticUpdate(false), 3000);
  };

  const handleRsvpClick = () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Optimistic update indicator */}
      {optimisticUpdate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <p className="text-blue-800 text-sm">Updating your registration...</p>
          </div>
        </div>
      )}

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
              <span className={optimisticUpdate ? "text-blue-600 font-medium" : ""}>
                {attendeeCount} attending
              </span>
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
                {isAttending && !isPastEvent && isAuthenticated && (
                  <p className={`font-medium ${optimisticUpdate ? 'text-blue-600' : 'text-green-600'}`}>
                    {optimisticUpdate ? 'Updating registration...' : 'You are registered for this event'}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {!isPastEvent && (
                  <>
                    {isAuthenticated && user ? (
                      <RsvpButton
                        eventId={event.id}
                        userId={user.id}
                        isAttending={isAttending}
                        isEventFull={isEventFull}
                        onRsvpChange={handleRsvpChange}
                      />
                    ) : (
                      <Button 
                        variant="default"
                        onClick={handleRsvpClick}
                        disabled={isEventFull}
                        className={isEventFull ? "cursor-not-allowed" : ""}
                      >
                        {isEventFull ? 'Event Full' : 'Sign In to RSVP'}
                      </Button>
                    )}
                  </>
                )}
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
            <span className={optimisticUpdate ? "text-blue-600" : ""}>
              Attendees ({attendeeCount})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AttendeeList 
            attendees={attendees} 
            pageSize={8}
            showPagination={attendees.length > 8}
          />
        </CardContent>
      </Card>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
} 