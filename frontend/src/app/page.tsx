import React from 'react';

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Event Scheduler
      </h1>
      <p className="text-gray-600 mb-8">
        Welcome to the Event Scheduler - A GraphQL and Relay demo application
      </p>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">
          Coming Soon
        </h2>
        <p className="text-blue-700">
          Event listing and management features will be available once the GraphQL backend and Relay integration are complete.
        </p>
      </div>
    </main>
  );
} 