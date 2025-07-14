/**
 * Query Resolvers
 * 
 * Implements GraphQL query resolvers for the Event Scheduler application
 * Handles data fetching from the SQLite database
 */

const dbManager = require('../../database');
const migrationRunner = require('../../migrations/migrator');

const Query = {
  // System status queries
  hello: () => {
    return 'Hello from Event Scheduler GraphQL API!';
  },

  status: () => {
    return {
      message: 'Event Scheduler GraphQL API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  },

  dbStatus: () => {
    try {
      const stats = dbManager.getStats();
      return {
        connected: dbManager.isConnected,
        healthy: dbManager.isConnectionHealthy(),
        path: stats.path,
        tableCount: stats.tableCount || 0,
        size: stats.size || 0,
        readonly: stats.readonly || false,
        inTransaction: stats.inTransaction || false,
        error: stats.error || null
      };
    } catch (error) {
      return {
        connected: false,
        healthy: false,
        path: '',
        tableCount: 0,
        size: 0,
        readonly: false,
        inTransaction: false,
        error: error.message
      };
    }
  },

  migrationStatus: () => {
    try {
      return migrationRunner.getMigrationStatus();
    } catch (error) {
      return {
        applied: [],
        available: [],
        pending: [],
        total: 0,
        appliedCount: 0,
        pendingCount: 0,
        error: error.message
      };
    }
  },

  // Event queries
  events: () => {
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
        GROUP BY e.id, e.title, e.description, e.date, e.location, e.max_attendees, e.organizer_id, e.created_at, e.updated_at
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
        organizerId: event.organizer_id,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        attendeeCount: event.attendee_count
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('Failed to fetch events');
    }
  },

  event: (parent, args) => {
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
          e.organizer_id,
          e.created_at,
          e.updated_at,
          COUNT(r.id) as attendee_count
        FROM events e
        LEFT JOIN rsvps r ON e.id = r.event_id
        WHERE e.id = ?
        GROUP BY e.id, e.title, e.description, e.date, e.location, e.max_attendees, e.organizer_id, e.created_at, e.updated_at
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
        organizerId: event.organizer_id,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        attendeeCount: event.attendee_count
      };
    } catch (error) {
      console.error('Error fetching event:', error);
      throw new Error('Failed to fetch event');
    }
  },

  upcomingEvents: () => {
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
        WHERE e.date > datetime('now')
        GROUP BY e.id, e.title, e.description, e.date, e.location, e.max_attendees, e.organizer_id, e.created_at, e.updated_at
        ORDER BY e.date ASC
        LIMIT 10
      `;
      
      const events = dbManager.query(query);
      
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
      console.error('Error fetching upcoming events:', error);
      throw new Error('Failed to fetch upcoming events');
    }
  },

  // User queries
  users: () => {
    try {
      const query = `
        SELECT id, name, email, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
      `;
      
      const users = dbManager.query(query);
      
      return users.map(user => ({
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  },

  user: (parent, args) => {
    try {
      const { id } = args;
      const query = `
        SELECT id, name, email, created_at, updated_at
        FROM users
        WHERE id = ?
      `;
      
      const users = dbManager.query(query, [id]);
      
      if (users.length === 0) {
        return null;
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
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  }
};

module.exports = Query; 