import React from 'react';
import { RelayExample } from '../components/examples/RelayExample';

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Event Scheduler
      </h1>
      <p className="text-gray-600 mb-8">
        Welcome to the Event Scheduler - A GraphQL and Relay demo application
      </p>
      
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-900 mb-2">
            ✅ Relay Integration Complete
          </h2>
          <p className="text-green-700">
            Relay has been successfully configured and integrated into the application. 
            The foundation is ready for GraphQL data fetching and fragment composition.
          </p>
        </div>

        <RelayExample />
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">
            Next Steps
          </h2>
          <p className="text-blue-700 mb-3">
            The following components are ready for implementation:
          </p>
          <ul className="list-disc list-inside text-blue-700 space-y-1">
            <li>GraphQL backend with Express.js</li>
            <li>Event listing with Relay pagination</li>
            <li>RSVP mutations with optimistic updates</li>
            <li>Real-time subscriptions</li>
          </ul>
        </div>
      </div>
    </main>
  );
} 