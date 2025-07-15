/**
 * React Testing Library Helpers
 * 
 * Provides custom render functions and testing utilities
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock AuthContext for testing
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const mockAuthValue = {
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    isLoading: false,
  };

  return (
    <AuthProvider value={mockAuthValue}>
      {children}
    </AuthProvider>
  );
};

// Custom render function that includes providers
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <MockAuthProvider>
      {children}
    </MockAuthProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Mock user for testing
export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
};

// Mock authenticated user context
export const renderWithAuthenticatedUser = (
  ui: ReactElement,
  user = mockUser,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const MockAuthProviderWithUser = ({ children }: { children: React.ReactNode }) => {
    const mockAuthValue = {
      user,
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
    };

    return (
      <AuthProvider value={mockAuthValue}>
        {children}
      </AuthProvider>
    );
  };

  return render(ui, { wrapper: MockAuthProviderWithUser, ...options });
};

// Mock event data for testing
export const mockEvent = {
  id: '1',
  title: 'Test Event',
  description: 'A test event for unit testing',
  date: '2024-12-25T10:00:00Z',
  location: 'Test Venue',
  maxAttendees: 50,
  attendeeCount: 10,
  availableSpots: 40,
  organizer: {
    id: '1',
    name: 'Test Organizer',
    email: 'organizer@example.com',
  },
  attendees: [
    { id: '2', name: 'Attendee 1', email: 'attendee1@example.com' },
    { id: '3', name: 'Attendee 2', email: 'attendee2@example.com' },
  ],
};

// Mock events list
export const mockEvents = [
  mockEvent,
  {
    ...mockEvent,
    id: '2',
    title: 'Another Test Event',
    description: 'Another test event',
    attendeeCount: 25,
    availableSpots: 25,
  },
];

// Utility to create mock fetch responses
export const createMockResponse = (data: any, ok = true) => ({
  ok,
  status: ok ? 200 : 400,
  json: async () => data,
  text: async () => JSON.stringify(data),
});

// GraphQL mock response helper
export const createGraphQLMockResponse = (data: any, errors: any[] = []) => ({
  data,
  errors: errors.length > 0 ? errors : undefined,
});

// User event helpers
export { userEvent } from '@testing-library/user-event';

// Re-export everything from React Testing Library
export * from '@testing-library/react'; 