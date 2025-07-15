/**
 * Mutation Resolvers
 * 
 * Implements GraphQL mutation resolvers for the Event Scheduler application
 * Handles RSVP operations and authentication
 */

const dbManager = require('../../database');
const jwt = require('jsonwebtoken');

// Simple JWT secret for demo purposes (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

const Mutation = {
  // Authentication mutations
  login: async (parent, args) => {
    const { email, name } = args;
    
    try {
      // Check if user already exists
      const existingUserQuery = `SELECT id, name, email FROM users WHERE email = ?`;
      const existingUsers = dbManager.query(existingUserQuery, [email]);
      
      let user;
      
      if (existingUsers.length > 0) {
        // User exists, return existing user
        user = existingUsers[0];
      } else {
        // Create new user
        const insertUserQuery = `
          INSERT INTO users (name, email, created_at, updated_at)
          VALUES (?, ?, datetime('now'), datetime('now'))
        `;
        
        const result = dbManager.run(insertUserQuery, [name, email]);
        
        // Get the created user
        const newUserQuery = `SELECT id, name, email FROM users WHERE id = ?`;
        const newUsers = dbManager.query(newUserQuery, [result.lastInsertRowid]);
        user = newUsers[0];
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' } // Token expires in 7 days
      );
      
      return {
        success: true,
        message: 'Login successful',
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email
        },
        token,
        errors: []
      };
      
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed',
        user: null,
        token: null,
        errors: ['An error occurred during login']
      };
    }
  },

  logout: async () => {
    // For JWT-based auth, logout is handled client-side by removing the token
    // In a real app, you might want to maintain a blacklist of tokens
    return {
      success: true,
      message: 'Logout successful',
      user: null,
      token: null,
      errors: []
    };
  },

  // Event management mutations
  createEvent: async (parent, args, context) => {
    const { input } = args;
    
    try {
      // Extract user info from context (assuming authentication middleware sets this)
      // For now, we'll assume the organizer is user with ID 1
      const organizerId = 1; // This should come from authenticated user context
      
      // Validate input
      const errors = [];
      
      if (!input.title || input.title.trim().length === 0) {
        errors.push({ message: 'Title is required', field: 'title' });
      }
      
      if (!input.description || input.description.trim().length === 0) {
        errors.push({ message: 'Description is required', field: 'description' });
      }
      
      if (!input.date) {
        errors.push({ message: 'Date is required', field: 'date' });
      } else {
        const eventDate = new Date(input.date);
        const now = new Date();
        if (eventDate <= now) {
          errors.push({ message: 'Event date must be in the future', field: 'date' });
        }
      }
      
      if (!input.location || input.location.trim().length === 0) {
        errors.push({ message: 'Location is required', field: 'location' });
      }
      
      if (input.maxAttendees && input.maxAttendees < 1) {
        errors.push({ message: 'Maximum attendees must be at least 1', field: 'maxAttendees' });
      }
      
      if (errors.length > 0) {
        return {
          event: null,
          errors
        };
      }
      
      // Insert the event
      const insertEventQuery = `
        INSERT INTO events (title, description, date, location, max_attendees, organizer_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `;
      
      const result = dbManager.run(insertEventQuery, [
        input.title.trim(),
        input.description.trim(),
        input.date,
        input.location.trim(),
        input.maxAttendees || null,
        organizerId
      ]);
      
      // Get the created event with organizer info
      const createdEventQuery = `
        SELECT 
          e.id,
          e.title,
          e.description,
          e.date,
          e.location,
          e.max_attendees,
          e.created_at,
          e.updated_at,
          u.id as organizer_id,
          u.name as organizer_name,
          u.email as organizer_email
        FROM events e
        JOIN users u ON e.organizer_id = u.id
        WHERE e.id = ?
      `;
      
      const eventResults = dbManager.query(createdEventQuery, [result.lastInsertRowid]);
      
      if (eventResults.length === 0) {
        return {
          event: null,
          errors: [{ message: 'Failed to create event', field: null }]
        };
      }
      
      const event = eventResults[0];
      
      // Count attendees (should be 0 for new event)
      const attendeeCountQuery = `SELECT COUNT(*) as count FROM rsvps WHERE event_id = ?`;
      const attendeeCount = dbManager.query(attendeeCountQuery, [event.id])[0].count;
      
      return {
        event: {
          id: event.id.toString(),
          title: event.title,
          description: event.description,
          date: event.date,
          location: event.location,
          maxAttendees: event.max_attendees,
          attendeeCount,
          createdAt: event.created_at,
          updatedAt: event.updated_at,
          organizer: {
            id: event.organizer_id.toString(),
            name: event.organizer_name,
            email: event.organizer_email
          }
        },
        errors: []
      };
      
    } catch (error) {
      console.error('Create event error:', error);
      return {
        event: null,
        errors: [{ message: 'Failed to create event', field: null }]
      };
    }
  },

  updateEvent: async (parent, args, context) => {
    const { id, input } = args;
    
    try {
      // Check if event exists and get current data
      const eventQuery = `
        SELECT e.*, u.name as organizer_name, u.email as organizer_email
        FROM events e
        JOIN users u ON e.organizer_id = u.id
        WHERE e.id = ?
      `;
      
      const events = dbManager.query(eventQuery, [id]);
      
      if (events.length === 0) {
        return {
          event: null,
          errors: [{ message: 'Event not found', field: null }]
        };
      }
      
      const existingEvent = events[0];
      
      // For now, we'll assume the user is authorized to update
      // In a real app, you'd check if the authenticated user is the organizer
      const organizerId = existingEvent.organizer_id;
      
      // Validate input
      const errors = [];
      
      if (input.title !== undefined && (!input.title || input.title.trim().length === 0)) {
        errors.push({ message: 'Title is required', field: 'title' });
      }
      
      if (input.description !== undefined && (!input.description || input.description.trim().length === 0)) {
        errors.push({ message: 'Description is required', field: 'description' });
      }
      
      if (input.date !== undefined) {
        if (!input.date) {
          errors.push({ message: 'Date is required', field: 'date' });
        } else {
          const eventDate = new Date(input.date);
          const now = new Date();
          if (eventDate <= now) {
            errors.push({ message: 'Event date must be in the future', field: 'date' });
          }
        }
      }
      
      if (input.location !== undefined && (!input.location || input.location.trim().length === 0)) {
        errors.push({ message: 'Location is required', field: 'location' });
      }
      
      if (input.maxAttendees !== undefined && input.maxAttendees !== null && input.maxAttendees < 1) {
        errors.push({ message: 'Maximum attendees must be at least 1', field: 'maxAttendees' });
      }
      
      if (errors.length > 0) {
        return {
          event: null,
          errors
        };
      }
      
      // Build update query dynamically based on provided fields
      const updateFields = [];
      const updateValues = [];
      
      if (input.title !== undefined) {
        updateFields.push('title = ?');
        updateValues.push(input.title.trim());
      }
      
      if (input.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(input.description.trim());
      }
      
      if (input.date !== undefined) {
        updateFields.push('date = ?');
        updateValues.push(input.date);
      }
      
      if (input.location !== undefined) {
        updateFields.push('location = ?');
        updateValues.push(input.location.trim());
      }
      
      if (input.maxAttendees !== undefined) {
        updateFields.push('max_attendees = ?');
        updateValues.push(input.maxAttendees);
      }
      
      // Always update the updated_at timestamp
      updateFields.push('updated_at = datetime(\'now\')');
      
      // Add event ID to the end of values array
      updateValues.push(id);
      
      const updateEventQuery = `
        UPDATE events 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;
      
      dbManager.run(updateEventQuery, updateValues);
      
      // Get the updated event with organizer info
      const updatedEventQuery = `
        SELECT 
          e.id,
          e.title,
          e.description,
          e.date,
          e.location,
          e.max_attendees,
          e.created_at,
          e.updated_at,
          u.id as organizer_id,
          u.name as organizer_name,
          u.email as organizer_email
        FROM events e
        JOIN users u ON e.organizer_id = u.id
        WHERE e.id = ?
      `;
      
      const updatedEventResults = dbManager.query(updatedEventQuery, [id]);
      
      if (updatedEventResults.length === 0) {
        return {
          event: null,
          errors: [{ message: 'Failed to update event', field: null }]
        };
      }
      
      const updatedEvent = updatedEventResults[0];
      
      // Count attendees
      const attendeeCountQuery = `SELECT COUNT(*) as count FROM rsvps WHERE event_id = ?`;
      const attendeeCount = dbManager.query(attendeeCountQuery, [id])[0].count;
      
      return {
        event: {
          id: updatedEvent.id.toString(),
          title: updatedEvent.title,
          description: updatedEvent.description,
          date: updatedEvent.date,
          location: updatedEvent.location,
          maxAttendees: updatedEvent.max_attendees,
          attendeeCount,
          createdAt: updatedEvent.created_at,
          updatedAt: updatedEvent.updated_at,
          organizer: {
            id: updatedEvent.organizer_id.toString(),
            name: updatedEvent.organizer_name,
            email: updatedEvent.organizer_email
          }
        },
        errors: []
      };
      
    } catch (error) {
      console.error('Update event error:', error);
      return {
        event: null,
        errors: [{ message: 'Failed to update event', field: null }]
      };
    }
  },

  deleteEvent: async (parent, args, context) => {
    const { id } = args;
    
    try {
      // Check if event exists
      const eventQuery = `SELECT id, title, organizer_id FROM events WHERE id = ?`;
      const events = dbManager.query(eventQuery, [id]);
      
      if (events.length === 0) {
        return {
          deletedEventId: null,
          errors: [{ message: 'Event not found', field: null }]
        };
      }
      
      const event = events[0];
      
      // For now, we'll assume the user is authorized to delete
      // In a real app, you'd check if the authenticated user is the organizer
      
      // Delete all RSVPs for this event first (foreign key constraint)
      const deleteRsvpsQuery = `DELETE FROM rsvps WHERE event_id = ?`;
      dbManager.run(deleteRsvpsQuery, [id]);
      
      // Delete the event
      const deleteEventQuery = `DELETE FROM events WHERE id = ?`;
      const result = dbManager.run(deleteEventQuery, [id]);
      
      if (result.changes === 0) {
        return {
          deletedEventId: null,
          errors: [{ message: 'Failed to delete event', field: null }]
        };
      }
      
      return {
        deletedEventId: id,
        errors: []
      };
      
    } catch (error) {
      console.error('Delete event error:', error);
      return {
        deletedEventId: null,
        errors: [{ message: 'Failed to delete event', field: null }]
      };
    }
  },

  // RSVP mutations
  rsvpToEvent: async (parent, args) => {
    const { eventId, userId } = args;
    
    try {
      // Check if user is already registered for this event
      const existingRsvpQuery = `
        SELECT id FROM rsvps 
        WHERE user_id = ? AND event_id = ?
      `;
      const existingRsvps = dbManager.query(existingRsvpQuery, [userId, eventId]);
      
      if (existingRsvps.length > 0) {
        return {
          success: false,
          message: 'You are already registered for this event',
          event: null,
          user: null,
          errors: ['Already registered']
        };
      }
      
      // Check if event exists and get event details
      const eventQuery = `
        SELECT e.*, u.name as organizer_name, u.email as organizer_email
        FROM events e
        JOIN users u ON e.organizer_id = u.id
        WHERE e.id = ?
      `;
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
      
      const event = events[0];
      
      // Check if event is full
      const attendeeCountQuery = `SELECT COUNT(*) as count FROM rsvps WHERE event_id = ?`;
      const attendeeCount = dbManager.query(attendeeCountQuery, [eventId])[0].count;
      
      if (event.max_attendees && attendeeCount >= event.max_attendees) {
        return {
          success: false,
          message: 'Event is full',
          event: null,
          user: null,
          errors: ['Event is full']
        };
      }
      
      // Get user details
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
      
      // Create RSVP
      const insertRsvpQuery = `
        INSERT INTO rsvps (user_id, event_id, rsvp_date)
        VALUES (?, ?, datetime('now'))
      `;
      
      dbManager.run(insertRsvpQuery, [userId, eventId]);
      
      // Get updated attendee count
      const updatedAttendeeCount = dbManager.query(attendeeCountQuery, [eventId])[0].count;
      
      return {
        success: true,
        message: 'Successfully registered for event',
        event: {
          id: event.id.toString(),
          title: event.title,
          description: event.description,
          date: event.date,
          location: event.location,
          maxAttendees: event.max_attendees,
          attendeeCount: updatedAttendeeCount,
          createdAt: event.created_at,
          updatedAt: event.updated_at,
          organizer: {
            id: event.organizer_id.toString(),
            name: event.organizer_name,
            email: event.organizer_email
          }
        },
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email
        },
        errors: []
      };
      
    } catch (error) {
      console.error('RSVP error:', error);
      return {
        success: false,
        message: 'Failed to register for event',
        event: null,
        user: null,
        errors: ['Registration failed']
      };
    }
  },

  cancelRsvp: async (parent, args) => {
    const { eventId, userId } = args;
    
    try {
      // Check if user is registered for this event
      const existingRsvpQuery = `
        SELECT id FROM rsvps 
        WHERE user_id = ? AND event_id = ?
      `;
      const existingRsvps = dbManager.query(existingRsvpQuery, [userId, eventId]);
      
      if (existingRsvps.length === 0) {
        return {
          success: false,
          message: 'You are not registered for this event',
          event: null,
          user: null,
          errors: ['Not registered']
        };
      }
      
      // Get event and user details
      const eventQuery = `
        SELECT e.*, u.name as organizer_name, u.email as organizer_email
        FROM events e
        JOIN users u ON e.organizer_id = u.id
        WHERE e.id = ?
      `;
      const events = dbManager.query(eventQuery, [eventId]);
      
      const userQuery = `SELECT id, name, email FROM users WHERE id = ?`;
      const users = dbManager.query(userQuery, [userId]);
      
      if (events.length === 0 || users.length === 0) {
        return {
          success: false,
          message: 'Event or user not found',
          event: null,
          user: null,
          errors: ['Event or user not found']
        };
      }
      
      const event = events[0];
      const user = users[0];
      
      // Remove RSVP
      const deleteRsvpQuery = `
        DELETE FROM rsvps 
        WHERE user_id = ? AND event_id = ?
      `;
      
      dbManager.run(deleteRsvpQuery, [userId, eventId]);
      
      // Get updated attendee count
      const attendeeCountQuery = `SELECT COUNT(*) as count FROM rsvps WHERE event_id = ?`;
      const updatedAttendeeCount = dbManager.query(attendeeCountQuery, [eventId])[0].count;
      
      return {
        success: true,
        message: 'Successfully cancelled registration',
        event: {
          id: event.id.toString(),
          title: event.title,
          description: event.description,
          date: event.date,
          location: event.location,
          maxAttendees: event.max_attendees,
          attendeeCount: updatedAttendeeCount,
          createdAt: event.created_at,
          updatedAt: event.updated_at,
          organizer: {
            id: event.organizer_id.toString(),
            name: event.organizer_name,
            email: event.organizer_email
          }
        },
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email
        },
        errors: []
      };
      
    } catch (error) {
      console.error('Cancel RSVP error:', error);
      return {
        success: false,
        message: 'Failed to cancel registration',
        event: null,
        user: null,
        errors: ['Cancellation failed']
      };
    }
  }
};

module.exports = Mutation; 