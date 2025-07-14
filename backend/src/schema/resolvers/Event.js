/**
 * Event Type Resolvers
 * 
 * Implements GraphQL resolvers for the Event type
 * Handles relationships and computed fields for events
 */

const dbManager = require('../../database');

const Event = {
  // Organizer relationship
  organizer: (parent) => {
    try {
      const query = `
        SELECT id, name, email, created_at, updated_at
        FROM users
        WHERE id = ?
      `;
      
      const users = dbManager.query(query, [parent.organizerId]);
      
      if (users.length === 0) {
        throw new Error(`Organizer with ID ${parent.organizerId} not found`);
      }
      
      const user = users[0];
      return {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
    } catch (error) {
      console.error('Error fetching event organizer:', error);
      throw new Error('Failed to fetch event organizer');
    }
  },

  // Attendees relationship
  attendees: (parent) => {
    try {
      const query = `
        SELECT u.id, u.name, u.email, u.created_at, u.updated_at
        FROM users u
        INNER JOIN rsvps r ON u.id = r.user_id
        WHERE r.event_id = ?
        ORDER BY r.rsvp_date ASC
      `;
      
      const users = dbManager.query(query, [parent.id]);
      
      return users.map(user => ({
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }));
    } catch (error) {
      console.error('Error fetching event attendees:', error);
      throw new Error('Failed to fetch event attendees');
    }
  },

  // Computed field: attendee count
  attendeeCount: (parent) => {
    try {
      // If already computed in the parent query, return it
      if (parent.attendeeCount !== undefined) {
        return parent.attendeeCount;
      }
      
      const query = `
        SELECT COUNT(*) as count
        FROM rsvps
        WHERE event_id = ?
      `;
      
      const result = dbManager.query(query, [parent.id]);
      return result[0].count;
    } catch (error) {
      console.error('Error fetching attendee count:', error);
      return 0;
    }
  },

  // Computed field: check if user is attending
  isUserAttending: (parent, args) => {
    try {
      const { userId } = args;
      const query = `
        SELECT COUNT(*) as count
        FROM rsvps
        WHERE event_id = ? AND user_id = ?
      `;
      
      const result = dbManager.query(query, [parent.id, userId]);
      return result[0].count > 0;
    } catch (error) {
      console.error('Error checking user attendance:', error);
      return false;
    }
  },

  // Computed field: available spots
  availableSpots: (parent) => {
    try {
      // If no max attendees limit, return null
      if (!parent.maxAttendees) {
        return null;
      }
      
      const attendeeCount = parent.attendeeCount !== undefined 
        ? parent.attendeeCount 
        : Event.attendeeCount(parent);
      
      const available = parent.maxAttendees - attendeeCount;
      return Math.max(0, available);
    } catch (error) {
      console.error('Error calculating available spots:', error);
      return null;
    }
  }
};

module.exports = Event; 