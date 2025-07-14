/**
 * Events List Page
 * 
 * Main page for browsing and discovering events in the Event Scheduler.
 * Will be enhanced with Relay data fetching in future tasks.
 */

import React from 'react';

export default function EventsPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Upcoming Events
        </h1>
        <p className="text-gray-600">
          Discover and RSVP to events in your community
        </p>
      </div>

      {/* TODO: Add EventList component with Relay data fetching */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">
          Events List Coming Soon
        </h2>
        <p className="text-blue-700">
          This page will display a list of events using GraphQL and Relay.
          EventList component will be implemented in Phase 2.
        </p>
      </div>
    </div>
  );
} 