import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Users, Check, X, Loader2 } from 'lucide-react';

interface RsvpButtonProps {
  eventId: string;
  userId: string;
  isAttending: boolean;
  isEventFull: boolean;
  disabled?: boolean;
  onRsvpChange?: (isAttending: boolean, eventId: string) => void;
}

export function RsvpButton({
  eventId,
  userId,
  isAttending,
  isEventFull,
  disabled = false,
  onRsvpChange
}: RsvpButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRsvp = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const mutation = isAttending
        ? `
          mutation CancelRsvp($eventId: ID!, $userId: ID!) {
            cancelRsvp(eventId: $eventId, userId: $userId) {
              success
              message
              errors
            }
          }
        `
        : `
          mutation RsvpToEvent($eventId: ID!, $userId: ID!) {
            rsvpToEvent(eventId: $eventId, userId: $userId) {
              success
              message
              errors
            }
          }
        `;

      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables: { eventId, userId },
        }),
      });

      if (!response.ok) {
        throw new Error('Network error');
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      const result = data.data.rsvpToEvent || data.data.cancelRsvp;

      if (result.success) {
        setSuccess(result.message);
        onRsvpChange?.(!isAttending, eventId);
        
        // Clear success message after 2 seconds
        setTimeout(() => setSuccess(null), 2000);
      } else {
        setError(result.errors.join(', ') || result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Show success state
  if (success) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="text-green-600 border-green-300 bg-green-50"
        disabled
      >
        <Check className="w-4 h-4 mr-2" />
        {success}
      </Button>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col gap-1">
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 border-red-300 bg-red-50"
          onClick={() => setError(null)}
        >
          <X className="w-4 h-4 mr-2" />
          {error}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRsvp}
          disabled={isLoading}
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Main button states
  if (isAttending) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleRsvp}
        disabled={isLoading || disabled}
        className="text-red-600 border-red-300 hover:bg-red-50"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <X className="w-4 h-4 mr-2" />
        )}
        {isLoading ? 'Cancelling...' : 'Cancel RSVP'}
      </Button>
    );
  }

  return (
    <Button
      variant={isEventFull ? "secondary" : "default"}
      size="sm"
      onClick={handleRsvp}
      disabled={isLoading || disabled || isEventFull}
      className={isEventFull ? "cursor-not-allowed" : ""}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Users className="w-4 h-4 mr-2" />
      )}
      {isLoading ? 'Registering...' : isEventFull ? 'Event Full' : 'RSVP'}
    </Button>
  );
} 