/**
 * Query Resolvers
 * 
 * Implements GraphQL query resolvers for the Event Scheduler application
 * Uses DataLoader for efficient data fetching
 */

const dbManager = require('../../database');

const Query = {
  // Get all events
  events: async (parent, args, context) => {
    try {
      const query = `
        SELECT 
          e.id,
          e.title,
          e.description,
          e.date,
          e.location,
          e.max_attendees,
          e.created_at,
          e.updated_at,
          e.organizer_id,
          u.name as organizer_name,
          u.email as organizer_email
        FROM events e
        JOIN users u ON e.organizer_id = u.id
        ORDER BY e.date ASC
      `;
      
      const events = dbManager.query(query);
      
      return events.map(event => ({
        id: event.id.toString(),
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        maxAttendees: event.max_attendees,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        organizer_id: event.organizer_id,
        organizer: {
          id: event.organizer_id.toString(),
          name: event.organizer_name,
          email: event.organizer_email
        }
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('Failed to fetch events');
    }
  },

  // Get single event by ID
  event: async (parent, args, context) => {
    try {
      const { id } = args;
      const query = `
        SELECT 
          e.id,
          e.title,
          e.description,
          e.date,
          e.location,
          e.max_attendees,
          e.created_at,
          e.updated_at,
          e.organizer_id,
          u.name as organizer_name,
          u.email as organizer_email
        FROM events e
        JOIN users u ON e.organizer_id = u.id
        WHERE e.id = ?
      `;
      
      const events = dbManager.query(query, [id]);
      
      if (events.length === 0) {
        return null;
      }
      
      const event = events[0];
      
      return {
        id: event.id.toString(),
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        maxAttendees: event.max_attendees,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        organizer_id: event.organizer_id,
        organizer: {
          id: event.organizer_id.toString(),
          name: event.organizer_name,
          email: event.organizer_email
        }
      };
    } catch (error) {
      console.error('Error fetching event:', error);
      throw new Error('Failed to fetch event');
    }
  },

  // Get current user (placeholder - would use authentication context)
  me: async (parent, args, context) => {
    // This would typically use authentication context
    // For now, return null or a mock user
    return null;
  },

  // Get user by ID
  user: async (parent, args, context) => {
    try {
      const { id } = args;
      return context.loaders.user.load(id);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  },

  // Get upcoming events
  upcomingEvents: async (parent, args, context) => {
    try {
      const { limit = 10 } = args;
      const query = `
        SELECT 
          e.id,
          e.title,
          e.description,
          e.date,
          e.location,
          e.max_attendees,
          e.created_at,
          e.updated_at,
          e.organizer_id,
          u.name as organizer_name,
          u.email as organizer_email
        FROM events e
        JOIN users u ON e.organizer_id = u.id
        WHERE e.date > datetime('now')
        ORDER BY e.date ASC
        LIMIT ?
      `;
      
      const events = dbManager.query(query, [limit]);
      
      return events.map(event => ({
        id: event.id.toString(),
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        maxAttendees: event.max_attendees,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        organizer_id: event.organizer_id,
        organizer: {
          id: event.organizer_id.toString(),
          name: event.organizer_name,
          email: event.organizer_email
        }
      }));
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw new Error('Failed to fetch upcoming events');
    }
  },

  // Get events by organizer
  eventsByOrganizer: async (parent, args, context) => {
    try {
      const { organizerId } = args;
      return context.loaders.userOrganizedEvents.load(organizerId);
    } catch (error) {
      console.error('Error fetching events by organizer:', error);
      throw new Error('Failed to fetch events by organizer');
    }
  }
};

module.exports = Query; 