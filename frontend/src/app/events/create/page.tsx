'use client';

import React from 'react';
import { CreateEventForm } from '@/components/events/CreateEventForm';
import { Header } from '@/components/layout/Header';
import { useRouter } from 'next/navigation';

export default function CreateEventPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect to events list after successful creation
    router.push('/');
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showCreateButton={false} />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <p className="mt-2 text-gray-600">
            Fill in the details below to create your event. All fields marked with * are required.
          </p>
        </div>

        <CreateEventForm 
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </main>
    </div>
  );
} 