/**
 * Mutation Resolvers
 * 
 * Implements GraphQL mutation resolvers for the Event Scheduler application
 * Handles RSVP operations and event management
 */

const dbManager = require('../../database');

const Mutation = {
  // RSVP to an event
  rsvpToEvent: async (parent, args) => {
    const { eventId, userId } = args;
    
    try {
      // Check if event exists
      const eventQuery = `
        SELECT id, title, max_attendees, 
               (SELECT COUNT(*) FROM rsvps WHERE event_id = ?) as current_attendees
        FROM events 
        WHERE id = ?
      `;
      
      const events = dbManager.query(eventQuery, [eventId, eventId]);
      
      if (events.length === 0) {
        return {
          success: false,
          message: 'Event not found',
          event: null,
          user: null,
          errors: ['Event not found']
        };
      }
      
      const event = events[0];
      
      // Check if user exists
      const userQuery = `SELECT id, name, email FROM users WHERE id = ?`;
      const users = dbManager.query(userQuery, [userId]);
      
      if (users.length === 0) {
        return {
          success: false,
          message: 'User not found',
          event: null,
          user: null,
          errors: ['User not found']
        };
      }
      
      const user = users[0];
      
      // Check if user is already registered
      const existingRsvpQuery = `
        SELECT id FROM rsvps 
        WHERE event_id = ? AND user_id = ?
      `;
      
      const existingRsvps = dbManager.query(existingRsvpQuery, [eventId, userId]);
      
      if (existingRsvps.length > 0) {
        return {
          success: false,
          message: 'You are already registered for this event',
          event: null,
          user: null,
          errors: ['Already registered']
        };
      }
      
      // Check if event is full
      if (event.max_attendees && event.current_attendees >= event.max_attendees) {
        return {
          success: false,
          message: 'Event is full',
          event: null,
          user: null,
          errors: ['Event is full']
        };
      }
      
      // Create RSVP
      const insertRsvpQuery = `
        INSERT INTO rsvps (event_id, user_id, rsvp_date)
        VALUES (?, ?, datetime('now'))
      `;
      
      dbManager.run(insertRsvpQuery, [eventId, userId]);
      
      // Get updated event data
      const updatedEventQuery = `
        SELECT e.*, u.name as organizer_name, u.email as organizer_email,
               (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id) as attendee_count
        FROM events e
        JOIN users u ON e.organizer_id = u.id
        WHERE e.id = ?
      `;
      
      const updatedEvents = dbManager.query(updatedEventQuery, [eventId]);
      const updatedEvent = updatedEvents[0];
      
      return {
        success: true,
        message: 'Successfully registered for event',
        event: {
          id: updatedEvent.id.toString(),
          title: updatedEvent.title,
          description: updatedEvent.description,
          date: updatedEvent.date,
          location: updatedEvent.location,
          maxAttendees: updatedEvent.max_attendees,
          attendeeCount: updatedEvent.attendee_count,
          createdAt: updatedEvent.created_at,
          updatedAt: updatedEvent.updated_at,
          organizerId: updatedEvent.organizer_id
        },
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email
        },
        errors: []
      };
      
    } catch (error) {
      console.error('Error in rsvpToEvent mutation:', error);
      return {
        success: false,
        message: 'Failed to register for event',
        event: null,
        user: null,
        errors: ['Internal server error']
      };
    }
  },

  // Cancel RSVP to an event
  cancelRsvp: async (parent, args) => {
    const { eventId, userId } = args;
    
    try {
      // Check if event exists
      const eventQuery = `SELECT id, title FROM events WHERE id = ?`;
      const events = dbManager.query(eventQuery, [eventId]);
      
      if (events.length === 0) {
        return {
          success: false,
          message: 'Event not found',
          event: null,
          user: null,
          errors: ['Event not found']
        };
      }
      
      // Check if user exists
      const userQuery = `SELECT id, name, email FROM users WHERE id = ?`;
      const users = dbManager.query(userQuery, [userId]);
      
      if (users.length === 0) {
        return {
          success: false,
          message: 'User not found',
          event: null,
          user: null,
          errors: ['User not found']
        };
      }
      
      const user = users[0];
      
      // Check if RSVP exists
      const existingRsvpQuery = `
        SELECT id FROM rsvps 
        WHERE event_id = ? AND user_id = ?
      `;
      
      const existingRsvps = dbManager.query(existingRsvpQuery, [eventId, userId]);
      
      if (existingRsvps.length === 0) {
        return {
          success: false,
          message: 'You are not registered for this event',
          event: null,
          user: null,
          errors: ['Not registered']
        };
      }
      
      // Delete RSVP
      const deleteRsvpQuery = `
        DELETE FROM rsvps 
        WHERE event_id = ? AND user_id = ?
      `;
      
      dbManager.run(deleteRsvpQuery, [eventId, userId]);
      
      // Get updated event data
      const updatedEventQuery = `
        SELECT e.*, u.name as organizer_name, u.email as organizer_email,
               (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id) as attendee_count
        FROM events e
        JOIN users u ON e.organizer_id = u.id
        WHERE e.id = ?
      `;
      
      const updatedEvents = dbManager.query(updatedEventQuery, [eventId]);
      const updatedEvent = updatedEvents[0];
      
      return {
        success: true,
        message: 'Successfully cancelled registration',
        event: {
          id: updatedEvent.id.toString(),
          title: updatedEvent.title,
          description: updatedEvent.description,
          date: updatedEvent.date,
          location: updatedEvent.location,
          maxAttendees: updatedEvent.max_attendees,
          attendeeCount: updatedEvent.attendee_count,
          createdAt: updatedEvent.created_at,
          updatedAt: updatedEvent.updated_at,
          organizerId: updatedEvent.organizer_id
        },
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email
        },
        errors: []
      };
      
    } catch (error) {
      console.error('Error in cancelRsvp mutation:', error);
      return {
        success: false,
        message: 'Failed to cancel registration',
        event: null,
        user: null,
        errors: ['Internal server error']
      };
    }
  }
};

module.exports = Mutation; 