import React from 'react';
import { AttendeeCard } from './AttendeeCard';

interface AttendeeListProps {
  attendees: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

export function AttendeeList({ attendees }: AttendeeListProps) {
  if (attendees.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No attendees yet. Be the first to RSVP!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {attendees.map((attendee) => (
        <AttendeeCard key={attendee.id} attendee={attendee} />
      ))}
    </div>
  );
} 