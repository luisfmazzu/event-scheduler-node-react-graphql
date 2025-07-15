/**
 * EventCard Component Tests
 * 
 * Tests the EventCard component functionality, data display, and interactions
 */

import React from 'react';
import { renderWithProviders, mockEvent, userEvent } from '@/test-utils/test-helpers';
import { screen } from '@testing-library/react';
import { EventCard } from '@/components/events/EventCard';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('EventCard Component', () => {
  const defaultEvent = {
    ...mockEvent,
    date: '2024-12-25T10:00:00Z',
    maxAttendees: 50,
    attendeeCount: 10,
  };

  describe('Basic Rendering', () => {
    it('renders event information correctly', () => {
      renderWithProviders(<EventCard event={defaultEvent} />);
      
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('A test event for unit testing')).toBeInTheDocument();
      expect(screen.getByText('Test Venue')).toBeInTheDocument();
      expect(screen.getByText('Test Organizer')).toBeInTheDocument();
    });

    it('renders event date in readable format', () => {
      renderWithProviders(<EventCard event={defaultEvent} />);
      
      // Should format date nicely (exact format depends on implementation)
      const dateElement = screen.getByText(/Dec.*25.*2024/i);
      expect(dateElement).toBeInTheDocument();
    });

    it('renders attendee information', () => {
      renderWithProviders(<EventCard event={defaultEvent} />);
      
      expect(screen.getByText('10 / 50')).toBeInTheDocument();
      expect(screen.getByText(/40 spots available/i)).toBeInTheDocument();
    });

    it('links to event details page', () => {
      renderWithProviders(<EventCard event={defaultEvent} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/events/1');
    });
  });

  describe('Event States', () => {
    it('shows "Full" when event is at capacity', () => {
      const fullEvent = {
        ...defaultEvent,
        attendeeCount: 50,
        maxAttendees: 50,
      };
      
      renderWithProviders(<EventCard event={fullEvent} />);
      
      expect(screen.getByText(/full/i)).toBeInTheDocument();
      expect(screen.getByText(/0 spots available/i)).toBeInTheDocument();
    });

    it('shows unlimited capacity when maxAttendees is null', () => {
      const unlimitedEvent = {
        ...defaultEvent,
        maxAttendees: null,
        attendeeCount: 25,
      };
      
      renderWithProviders(<EventCard event={unlimitedEvent} />);
      
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText(/unlimited/i)).toBeInTheDocument();
    });

    it('highlights past events differently', () => {
      const pastEvent = {
        ...defaultEvent,
        date: '2020-01-01T10:00:00Z', // Past date
      };
      
      renderWithProviders(<EventCard event={pastEvent} />);
      
      const card = screen.getByTestId('event-card');
      expect(card).toHaveClass('opacity-75'); // Assuming past events are dimmed
    });

    it('shows upcoming event indicator', () => {
      const futureEvent = {
        ...defaultEvent,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      };
      
      renderWithProviders(<EventCard event={futureEvent} />);
      
      expect(screen.getByText(/upcoming/i)).toBeInTheDocument();
    });
  });

  describe('RSVP Integration', () => {
    it('shows RSVP button when user can attend', () => {
      renderWithProviders(<EventCard event={defaultEvent} showRsvp />);
      
      const rsvpButton = screen.getByRole('button', { name: /rsvp/i });
      expect(rsvpButton).toBeInTheDocument();
    });

    it('hides RSVP button when not requested', () => {
      renderWithProviders(<EventCard event={defaultEvent} />);
      
      const rsvpButton = screen.queryByRole('button', { name: /rsvp/i });
      expect(rsvpButton).not.toBeInTheDocument();
    });

    it('shows "Already Attending" when user is attending', () => {
      renderWithProviders(
        <EventCard event={defaultEvent} showRsvp isAttending={true} />
      );
      
      expect(screen.getByText(/attending/i)).toBeInTheDocument();
      
      const rsvpButton = screen.queryByRole('button', { name: /rsvp/i });
      expect(rsvpButton).not.toBeInTheDocument();
    });

    it('disables RSVP when event is full', () => {
      const fullEvent = {
        ...defaultEvent,
        attendeeCount: 50,
        maxAttendees: 50,
      };
      
      renderWithProviders(<EventCard event={fullEvent} showRsvp />);
      
      const rsvpButton = screen.getByRole('button', { name: /full/i });
      expect(rsvpButton).toBeDisabled();
    });
  });

  describe('User Interactions', () => {
    it('calls onRsvp when RSVP button is clicked', async () => {
      const handleRsvp = jest.fn();
      const user = userEvent.setup();
      
      renderWithProviders(
        <EventCard event={defaultEvent} showRsvp onRsvp={handleRsvp} />
      );
      
      const rsvpButton = screen.getByRole('button', { name: /rsvp/i });
      await user.click(rsvpButton);
      
      expect(handleRsvp).toHaveBeenCalledWith(defaultEvent.id);
    });

    it('calls onCancelRsvp when cancel button is clicked', async () => {
      const handleCancelRsvp = jest.fn();
      const user = userEvent.setup();
      
      renderWithProviders(
        <EventCard 
          event={defaultEvent} 
          showRsvp 
          isAttending={true}
          onCancelRsvp={handleCancelRsvp}
        />
      );
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(handleCancelRsvp).toHaveBeenCalledWith(defaultEvent.id);
    });

    it('shows loading state during RSVP action', () => {
      renderWithProviders(
        <EventCard event={defaultEvent} showRsvp isLoading={true} />
      );
      
      const rsvpButton = screen.getByRole('button');
      expect(rsvpButton).toBeDisabled();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      renderWithProviders(<EventCard event={defaultEvent} />);
      
      const heading = screen.getByRole('heading', { name: 'Test Event' });
      expect(heading).toBeInTheDocument();
    });

    it('has descriptive link text', () => {
      renderWithProviders(<EventCard event={defaultEvent} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAccessibleName(/test event/i);
    });

    it('has proper button labels', () => {
      renderWithProviders(<EventCard event={defaultEvent} showRsvp />);
      
      const rsvpButton = screen.getByRole('button');
      expect(rsvpButton).toHaveAccessibleName(/rsvp.*test event/i);
    });

    it('provides event information to screen readers', () => {
      renderWithProviders(<EventCard event={defaultEvent} />);
      
      const eventInfo = screen.getByLabelText(/event details/i);
      expect(eventInfo).toHaveTextContent(/test event.*test venue.*10.*50/i);
    });
  });

  describe('Visual Variants', () => {
    it('renders compact variant', () => {
      renderWithProviders(<EventCard event={defaultEvent} variant="compact" />);
      
      const card = screen.getByTestId('event-card');
      expect(card).toHaveClass('compact');
      
      // Compact view might not show description
      expect(screen.queryByText(defaultEvent.description)).not.toBeInTheDocument();
    });

    it('renders featured variant', () => {
      renderWithProviders(<EventCard event={defaultEvent} variant="featured" />);
      
      const card = screen.getByTestId('event-card');
      expect(card).toHaveClass('featured', 'border-2');
    });

    it('applies custom className', () => {
      renderWithProviders(
        <EventCard event={defaultEvent} className="custom-event-card" />
      );
      
      const card = screen.getByTestId('event-card');
      expect(card).toHaveClass('custom-event-card');
    });
  });

  describe('Event Image', () => {
    it('renders event image when provided', () => {
      const eventWithImage = {
        ...defaultEvent,
        imageUrl: 'https://example.com/event-image.jpg',
      };
      
      renderWithProviders(<EventCard event={eventWithImage} />);
      
      const image = screen.getByRole('img', { name: /test event/i });
      expect(image).toHaveAttribute('src', eventWithImage.imageUrl);
    });

    it('renders placeholder when no image provided', () => {
      renderWithProviders(<EventCard event={defaultEvent} />);
      
      const placeholder = screen.getByTestId('event-image-placeholder');
      expect(placeholder).toBeInTheDocument();
    });

    it('handles image loading errors', () => {
      const eventWithImage = {
        ...defaultEvent,
        imageUrl: 'https://example.com/broken-image.jpg',
      };
      
      renderWithProviders(<EventCard event={eventWithImage} />);
      
      const image = screen.getByRole('img');
      
      // Simulate image error
      image.dispatchEvent(new Event('error'));
      
      expect(screen.getByTestId('event-image-placeholder')).toBeInTheDocument();
    });
  });
}); 