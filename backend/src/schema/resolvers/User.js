/**
 * User Type Resolvers
 * 
 * Implements GraphQL resolvers for the User type
 * Handles relationships for organized events and attending events
 */

const dbManager = require('../../database');

const User = {
  // Organized events relationship
  organizedEvents: (parent) => {
    try {
      const query = `
        SELECT 
          e.id,
          e.title,
          e.description,
          e.date,
          e.location,
          e.max_attendees,
          e.organizer_id,
          e.created_at,
          e.updated_at,
          COUNT(r.id) as attendee_count
        FROM events e
        LEFT JOIN rsvps r ON e.id = r.event_id
        WHERE e.organizer_id = ?
        GROUP BY e.id, e.title, e.description, e.date, e.location, e.max_attendees, e.organizer_id, e.created_at, e.updated_at
        ORDER BY e.date DESC
      `;
      
      const events = dbManager.query(query, [parent.id]);
      
      return events.map(event => ({
        id: event.id.toString(),
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        maxAttendees: event.max_attendees,
        organizerId: event.organizer_id,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        attendeeCount: event.attendee_count
      }));
    } catch (error) {
      console.error('Error fetching organized events:', error);
      throw new Error('Failed to fetch organized events');
    }
  },

  // Attending events relationship
  attendingEvents: (parent) => {
    try {
      const query = `
        SELECT 
          e.id,
          e.title,
          e.description,
          e.date,
          e.location,
          e.max_attendees,
          e.organizer_id,
          e.created_at,
          e.updated_at,
          COUNT(r2.id) as attendee_count
        FROM events e
        INNER JOIN rsvps r ON e.id = r.event_id
        LEFT JOIN rsvps r2 ON e.id = r2.event_id
        WHERE r.user_id = ?
        GROUP BY e.id, e.title, e.description, e.date, e.location, e.max_attendees, e.organizer_id, e.created_at, e.updated_at
        ORDER BY e.date DESC
      `;
      
      const events = dbManager.query(query, [parent.id]);
      
      return events.map(event => ({
        id: event.id.toString(),
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        maxAttendees: event.max_attendees,
        organizerId: event.organizer_id,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        attendeeCount: event.attendee_count
      }));
    } catch (error) {
      console.error('Error fetching attending events:', error);
      throw new Error('Failed to fetch attending events');
    }
  }
};

module.exports = User; 