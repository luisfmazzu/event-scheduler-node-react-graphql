/**
 * AttendeeCard Component
 * 
 * Displays attendee information in a card format using Relay fragments.
 * Will be enhanced with GraphQL integration in later tasks.
 */

import React from 'react';
import { formatDate } from '@/lib/utils';

// TODO: Replace with actual Relay fragment in future tasks
interface AttendeeData {
  id: string;
  name: string;
  email: string;
  rsvpDate?: string;
}

interface AttendeeCardProps {
  attendee: AttendeeData;
  showRsvpDate?: boolean;
  compact?: boolean;
}

/**
 * AttendeeCard component - will use Relay fragments for data fetching
 * Fragment will be: AttendeeCard_user
 */
export const AttendeeCard: React.FC<AttendeeCardProps> = ({
  attendee,
  showRsvpDate = false,
  compact = false
}) => {
  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {attendee.name.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {attendee.name}
          </p>
          {showRsvpDate && attendee.rsvpDate && (
            <p className="text-xs text-gray-500">
              RSVP&apos;d {formatDate(attendee.rsvpDate)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-medium">
            {attendee.name.charAt(0).toUpperCase()}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-medium text-gray-900 truncate">
            {attendee.name}
          </h4>
          <p className="text-sm text-gray-500 truncate">
            {attendee.email}
          </p>
          {showRsvpDate && attendee.rsvpDate && (
            <p className="text-xs text-gray-400 mt-1">
              RSVP&apos;d on {formatDate(attendee.rsvpDate)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// TODO: Add Relay fragment
// const AttendeeCard_user = graphql`
//   fragment AttendeeCard_user on User {
//     id
//     name
//     email
//   }
// `; 