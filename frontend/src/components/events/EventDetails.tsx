import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, User, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AttendeeList } from '@/components/attendees/AttendeeList';
import { RsvpButton } from '@/components/attendees/RsvpButton';
import { LoginModal } from '@/components/auth/LoginModal';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  SUBSCRIPTION_QUERIES, 
  subscribe, 
  RsvpUpdate, 
  EventUpdate, 
  SubscriptionResponse 
} from '@/lib/subscriptionClient';

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
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAttending, setIsAttending] = useState(event.isUserAttending || false);
  const [attendeeCount, setAttendeeCount] = useState(event.attendeeCount);
  const [attendees, setAttendees] = useState(event.attendees);
  const [optimisticUpdate, setOptimisticUpdate] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [realtimeUpdate, setRealtimeUpdate] = useState<{
    message: string;
    type: 'rsvp' | 'event';
    action: string;
    user?: string;
  } | null>(null);
  
  // Update state when event prop changes
  useEffect(() => {
    setIsAttending(event.isUserAttending || false);
    setAttendeeCount(event.attendeeCount);
    setAttendees(event.attendees);
  }, [event]);

  // Subscribe to real-time RSVP updates for this event
  useEffect(() => {
    const unsubscribeRsvp = subscribe<SubscriptionResponse<{ rsvpUpdated: RsvpUpdate }>>(
      {
        query: SUBSCRIPTION_QUERIES.RSVP_UPDATED,
        variables: { eventId: event.id }
      },
      (response) => {
        const { rsvpUpdated } = response.data;
        
        // Update attendee count
        setAttendeeCount(rsvpUpdated.event.attendeeCount);
        
        // Show real-time update notification
        setRealtimeUpdate({
          message: `${rsvpUpdated.user.name} ${rsvpUpdated.action === 'JOINED' ? 'joined' : 'left'} the event`,
          type: 'rsvp',
          action: rsvpUpdated.action,
          user: rsvpUpdated.user.name
        });

        // Update attendees list
        if (rsvpUpdated.action === 'JOINED') {
          setAttendees(prev => {
            // Avoid duplicates
            if (prev.some(attendee => attendee.id === rsvpUpdated.user.id)) {
              return prev;
            }
            return [...prev, rsvpUpdated.user];
          });
        } else {
          setAttendees(prev => prev.filter(attendee => attendee.id !== rsvpUpdated.user.id));
        }

        // Update user's attendance status if it's their own action
        if (user && rsvpUpdated.user.id === user.id) {
          setIsAttending(rsvpUpdated.action === 'JOINED');
        }

        // Clear notification after 5 seconds
        setTimeout(() => setRealtimeUpdate(null), 5000);
      },
      (error) => {
        console.error('RSVP subscription error:', error);
      }
    );

    // Subscribe to event updates for this specific event
    const unsubscribeEvent = subscribe<SubscriptionResponse<{ eventUpdated: EventUpdate }>>(
      {
        query: SUBSCRIPTION_QUERIES.EVENT_UPDATED,
        variables: { eventId: event.id }
      },
      (response) => {
        const { eventUpdated } = response.data;
        
        if (eventUpdated.action === 'DELETED') {
          // Show deletion notification and redirect
          setRealtimeUpdate({
            message: 'This event has been deleted by the organizer',
            type: 'event',
            action: 'DELETED'
          });
          
          setTimeout(() => {
            router.push('/');
          }, 3000);
        } else if (eventUpdated.action === 'UPDATED') {
          // Show update notification
          setRealtimeUpdate({
            message: 'Event details have been updated',
            type: 'event',
            action: 'UPDATED'
          });
          
          // Refresh the page to get updated event data
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      },
      (error) => {
        console.error('Event subscription error:', error);
      }
    );

    // Cleanup subscriptions
    return () => {
      unsubscribeRsvp();
      unsubscribeEvent();
    };
  }, [event.id, user?.id, router]);
  
  const eventDate = new Date(event.date);
  const createdDate = new Date(event.createdAt);
  const availableSpots = event.maxAttendees ? event.maxAttendees - attendeeCount : null;
  const isEventFull = availableSpots !== null && availableSpots <= 0;
  const isPastEvent = eventDate < new Date();
  const isOrganizer = isAuthenticated && user && user.id === event.organizer.id;

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

  const handleEdit = () => {
    router.push(`/events/edit/${event.id}`);
  };

  const handleDelete = async () => {
    if (!isOrganizer) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.title}"? This action cannot be undone and will affect all attendees.`
    );
    
    if (!confirmed) return;
    
    try {
      setIsDeleting(true);
      
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation DeleteEvent($id: ID!) {
              deleteEvent(id: $id) {
                deletedEventId
                errors {
                  message
                }
              }
            }
          `,
          variables: { id: event.id },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      const result = data.data.deleteEvent;
      
      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
      }

      // The subscription will handle the redirect, no need to do it manually
      
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete event. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Real-time update notifications */}
      {realtimeUpdate && (
        <div className={`border rounded-lg p-4 mb-4 ${
          realtimeUpdate.type === 'rsvp' 
            ? realtimeUpdate.action === 'JOINED' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-blue-50 border-blue-200'
            : realtimeUpdate.action === 'DELETED'
              ? 'bg-red-50 border-red-200'
              : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-3 ${
              realtimeUpdate.type === 'rsvp'
                ? realtimeUpdate.action === 'JOINED'
                  ? 'bg-green-500 animate-pulse'
                  : 'bg-blue-500 animate-pulse'
                : realtimeUpdate.action === 'DELETED'
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-yellow-500 animate-pulse'
            }`}></div>
            <p className={`text-sm font-medium ${
              realtimeUpdate.type === 'rsvp'
                ? realtimeUpdate.action === 'JOINED'
                  ? 'text-green-800'
                  : 'text-blue-800'
                : realtimeUpdate.action === 'DELETED'
                  ? 'text-red-800'
                  : 'text-yellow-800'
            }`}>
              🔴 LIVE: {realtimeUpdate.message}
            </p>
          </div>
        </div>
      )}

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
          <div className="flex justify-between items-start">
            <div className="flex-1">
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
                  <span className={optimisticUpdate || realtimeUpdate?.type === 'rsvp' ? "text-blue-600 font-medium transition-colors duration-300" : ""}>
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
            </div>
            
            {/* Organizer Actions */}
            {isOrganizer && (
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            )}
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
              
              <div className="flex gap-3">
                {!isPastEvent && !isOrganizer && (
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
            <span className={optimisticUpdate || realtimeUpdate?.type === 'rsvp' ? "text-blue-600 transition-colors duration-300" : ""}>
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