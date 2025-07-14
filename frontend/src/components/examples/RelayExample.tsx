'use client';

import React from 'react';
// TODO: Uncomment when we have actual GraphQL queries
// import { graphql, useFragment } from 'react-relay';

interface RelayExampleProps {
  // TODO: Add proper fragment reference when backend is ready
  // event: RelayExample_event$key;
  className?: string;
}

// TODO: Uncomment when we have the actual GraphQL schema
// const RelayExample_event = graphql`
//   fragment RelayExample_event on Event {
//     id
//     title
//     date
//     organizer {
//       name
//     }
//     attendeeCount
//   }
// `;

export function RelayExample({ }: RelayExampleProps) {
  // TODO: Uncomment when we have the actual fragment
  // const event = useFragment(RelayExample_event, eventRef);

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Relay Example Component
      </h3>
      <p className="text-gray-600 text-sm">
        This component demonstrates Relay fragment patterns. 
        It will be fully implemented once the GraphQL backend is ready.
      </p>
      
      <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
        <p className="text-blue-800 text-xs">
          <strong>Coming Soon:</strong> This will showcase:
        </p>
        <ul className="list-disc list-inside text-blue-700 text-xs mt-1 space-y-1">
          <li>Fragment composition with useFragment</li>
          <li>Type-safe GraphQL data fetching</li>
          <li>Optimistic updates with mutations</li>
          <li>Connection-based pagination</li>
        </ul>
      </div>
    </div>
  );
} 