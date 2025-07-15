/**
 * GraphQL Subscription Resolvers
 * 
 * Implements real-time subscription functionality for events and RSVPs
 */

const { PubSub, withFilter } = require('graphql-subscriptions');

// Create a PubSub instance for managing subscriptions
const pubsub = new PubSub();

// Subscription event types
const SUBSCRIPTION_EVENTS = {
  RSVP_UPDATED: 'RSVP_UPDATED',
  EVENT_UPDATED: 'EVENT_UPDATED'
};

const Subscription = {
  // Subscribe to RSVP updates for a specific event
  rsvpUpdated: {
    subscribe: withFilter(
      () => pubsub.asyncIterator([SUBSCRIPTION_EVENTS.RSVP_UPDATED]),
      (payload, variables) => {
        // Only send updates for the specific event
        return payload.rsvpUpdated.event.id === variables.eventId;
      }
    )
  },

  // Subscribe to all RSVP updates
  allRsvpUpdates: {
    subscribe: () => pubsub.asyncIterator([SUBSCRIPTION_EVENTS.RSVP_UPDATED])
  },

  // Subscribe to event updates for a specific event
  eventUpdated: {
    subscribe: withFilter(
      () => pubsub.asyncIterator([SUBSCRIPTION_EVENTS.EVENT_UPDATED]),
      (payload, variables) => {
        // Only send updates for the specific event
        return payload.eventUpdated.event.id === variables.eventId;
      }
    )
  },

  // Subscribe to all event updates
  allEventUpdates: {
    subscribe: () => pubsub.asyncIterator([SUBSCRIPTION_EVENTS.EVENT_UPDATED])
  },

  // Subscribe to events a user is attending
  userEventUpdates: {
    subscribe: withFilter(
      () => pubsub.asyncIterator([SUBSCRIPTION_EVENTS.EVENT_UPDATED]),
      async (payload, variables, context) => {
        // Check if the user is attending this event
        const { db } = context;
        const eventId = payload.eventUpdated.event.id;
        const userId = variables.userId;

        try {
          const rsvp = db.prepare(`
            SELECT id FROM rsvps 
            WHERE user_id = ? AND event_id = ?
          `).get(userId, eventId);

          return !!rsvp; // Return true if user is attending
        } catch (error) {
          console.error('Error checking user RSVP status:', error);
          return false;
        }
      }
    )
  }
};

// Publisher functions to emit subscription events
const publishRsvpUpdate = (event, user, action) => {
  const rsvpUpdate = {
    event,
    user,
    action,
    timestamp: new Date().toISOString()
  };

  pubsub.publish(SUBSCRIPTION_EVENTS.RSVP_UPDATED, {
    rsvpUpdated: rsvpUpdate,
    allRsvpUpdates: rsvpUpdate
  });
};

const publishEventUpdate = (event, action) => {
  const eventUpdate = {
    event,
    action,
    timestamp: new Date().toISOString()
  };

  pubsub.publish(SUBSCRIPTION_EVENTS.EVENT_UPDATED, {
    eventUpdated: eventUpdate,
    allEventUpdates: eventUpdate,
    userEventUpdates: eventUpdate
  });
};

module.exports = {
  Subscription,
  publishRsvpUpdate,
  publishEventUpdate,
  SUBSCRIPTION_EVENTS
}; 