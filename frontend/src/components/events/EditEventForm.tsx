import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, FileText, Loader2, AlertCircle } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  maxAttendees: number | null;
  organizer: {
    id: string;
    name: string;
    email: string;
  };
}

interface EditEventFormProps {
  event: Event;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditEventForm({ event, onSuccess, onCancel }: EditEventFormProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    maxAttendees: '',
  });

  // Initialize form data when event prop changes
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        maxAttendees: event.maxAttendees ? event.maxAttendees.toString() : '',
      });
    }
  }, [event]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated || !user) {
      setError('You must be logged in to edit an event');
      return;
    }

    // Check if user is the organizer
    if (user.id !== event.organizer.id) {
      setError('You can only edit events that you created');
      return;
    }

    if (!formData.title || !formData.description || !formData.date || !formData.location) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate date is in the future
    const eventDate = new Date(formData.date);
    const now = new Date();
    if (eventDate <= now) {
      setError('Event date must be in the future');
      return;
    }

    // Validate max attendees
    const maxAttendees = formData.maxAttendees ? parseInt(formData.maxAttendees) : null;
    if (maxAttendees && maxAttendees < 1) {
      setError('Maximum attendees must be at least 1');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation UpdateEvent($id: ID!, $input: UpdateEventInput!) {
              updateEvent(id: $id, input: $input) {
                event {
                  id
                  title
                  description
                  date
                  location
                  maxAttendees
                  organizer {
                    id
                    name
                  }
                }
                errors {
                  message
                  field
                }
              }
            }
          `,
          variables: {
            id: event.id,
            input: {
              title: formData.title,
              description: formData.description,
              date: formData.date,
              location: formData.location,
              maxAttendees: maxAttendees,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      const result = data.data.updateEvent;

      if (result.errors && result.errors.length > 0) {
        setError(result.errors[0].message);
        return;
      }

      if (result.event) {
        // Success - call success callback or redirect
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/events/${result.event.id}`);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign In Required</h3>
            <p className="text-gray-600 mb-4">You must be signed in to edit an event.</p>
            <Button onClick={() => router.push('/')}>
              Back to Events
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (user.id !== event.organizer.id) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Not Authorized</h3>
            <p className="text-gray-600 mb-4">You can only edit events that you created.</p>
            <Button onClick={() => router.push(`/events/${event.id}`)}>
              View Event
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Edit Event
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <Input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter event title"
              disabled={isSubmitting}
            />
          </div>

          {/* Event Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your event..."
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {/* Event Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date & Time *
            </label>
            <Input
              id="date"
              name="date"
              type="datetime-local"
              required
              value={formData.date}
              onChange={handleInputChange}
              disabled={isSubmitting}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* Event Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location *
            </label>
            <Input
              id="location"
              name="location"
              type="text"
              required
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter event location"
              disabled={isSubmitting}
            />
          </div>

          {/* Max Attendees */}
          <div>
            <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Maximum Attendees (Optional)
            </label>
            <Input
              id="maxAttendees"
              name="maxAttendees"
              type="number"
              min="1"
              value={formData.maxAttendees}
              onChange={handleInputChange}
              placeholder="Leave empty for unlimited"
              disabled={isSubmitting}
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave empty for unlimited attendees
            </p>
          </div>

          {/* Warning about existing attendees */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Important</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Changing the event details will affect all attendees. They will see the updated information immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel || (() => router.push(`/events/${event.id}`))}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating Event...
                </>
              ) : (
                'Update Event'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 