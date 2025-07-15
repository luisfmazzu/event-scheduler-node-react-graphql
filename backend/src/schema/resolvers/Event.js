/**
 * Event Type Resolvers
 * 
 * Implements GraphQL resolvers for the Event type
 * Handles relationships and computed fields for events
 */

const dbManager = require('../../database');

const Event = {
  // Organizer relationship
  organizer: async (parent, args, context) => {
    return context.loaders.user.load(parent.organizer_id || parent.organizer?.id);
  },

  // Attendees relationship
  attendees: async (parent, args, context) => {
    return context.loaders.eventAttendees.load(parent.id);
  },

  // Computed field: attendee count
  attendeeCount: async (parent, args, context) => {
    return context.loaders.eventAttendeeCount.load(parent.id);
  },

  // Computed field: check if user is attending
  isUserAttending: async (parent, args, context) => {
    const { userId } = args;
    const key = `${parent.id}:${userId}`;
    return context.loaders.userEventAttendance.load(key);
  },

  // Computed field: available spots
  availableSpots: async (parent, args, context) => {
    if (!parent.maxAttendees) return null;
    
    const attendeeCount = await context.loaders.eventAttendeeCount.load(parent.id);
    return Math.max(0, parent.maxAttendees - attendeeCount);
  }
};

module.exports = Event; 