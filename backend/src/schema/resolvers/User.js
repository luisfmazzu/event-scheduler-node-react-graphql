/**
 * User Type Resolvers
 * 
 * Implements GraphQL resolvers for the User type
 * Handles relationships for organized events and attending events
 */

const dbManager = require('../../database');

const User = {
  // Organized events relationship
  organizedEvents: async (parent, args, context) => {
    return context.loaders.userOrganizedEvents.load(parent.id);
  },

  // Attending events relationship
  attendingEvents: async (parent, args, context) => {
    return context.loaders.userAttendingEvents.load(parent.id);
  }
};

module.exports = User; 