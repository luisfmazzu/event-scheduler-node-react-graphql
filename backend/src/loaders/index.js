/**
 * DataLoader Implementation
 * 
 * Implements DataLoader for N+1 query optimization
 * Provides efficient batch loading for related data
 */

const DataLoader = require('dataloader');
const dbManager = require('../database');

/**
 * User DataLoader
 * Batches user lookups to avoid N+1 queries
 */
const userLoader = new DataLoader(async (userIds) => {
  const placeholders = userIds.map(() => '?').join(',');
  const query = `
    SELECT id, name, email, created_at, updated_at
    FROM users 
    WHERE id IN (${placeholders})
  `;
  
  const users = dbManager.query(query, userIds);
  
  // Create a map for efficient lookup
  const userMap = new Map();
  users.forEach(user => {
    userMap.set(user.id, {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });
  });
  
  // Return users in the same order as requested IDs
  return userIds.map(id => userMap.get(id) || null);
});

/**
 * Event DataLoader
 * Batches event lookups to avoid N+1 queries
 */
const eventLoader = new DataLoader(async (eventIds) => {
  const placeholders = eventIds.map(() => '?').join(',');
  const query = `
    SELECT e.*, u.name as organizer_name, u.email as organizer_email
    FROM events e
    JOIN users u ON e.organizer_id = u.id
    WHERE e.id IN (${placeholders})
  `;
  
  const events = dbManager.query(query, eventIds);
  
  // Create a map for efficient lookup
  const eventMap = new Map();
  events.forEach(event => {
    eventMap.set(event.id, {
      id: event.id.toString(),
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      maxAttendees: event.max_attendees,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
      organizer: {
        id: event.organizer_id.toString(),
        name: event.organizer_name,
        email: event.organizer_email
      }
    });
  });
  
  // Return events in the same order as requested IDs
  return eventIds.map(id => eventMap.get(id) || null);
});

/**
 * Event Attendees DataLoader
 * Batches attendee lookups for events
 */
const eventAttendeesLoader = new DataLoader(async (eventIds) => {
  const placeholders = eventIds.map(() => '?').join(',');
  const query = `
    SELECT r.event_id, u.id, u.name, u.email, r.rsvp_date
    FROM rsvps r
    JOIN users u ON r.user_id = u.id
    WHERE r.event_id IN (${placeholders})
    ORDER BY r.rsvp_date ASC
  `;
  
  const attendees = dbManager.query(query, eventIds);
  
  // Group attendees by event ID
  const attendeeMap = new Map();
  eventIds.forEach(eventId => {
    attendeeMap.set(eventId, []);
  });
  
  attendees.forEach(attendee => {
    const eventAttendees = attendeeMap.get(attendee.event_id) || [];
    eventAttendees.push({
      id: attendee.id.toString(),
      name: attendee.name,
      email: attendee.email,
      rsvpDate: attendee.rsvp_date
    });
    attendeeMap.set(attendee.event_id, eventAttendees);
  });
  
  // Return attendees in the same order as requested event IDs
  return eventIds.map(id => attendeeMap.get(id) || []);
});

/**
 * Event Attendee Count DataLoader
 * Batches attendee count lookups for events
 */
const eventAttendeeCountLoader = new DataLoader(async (eventIds) => {
  const placeholders = eventIds.map(() => '?').join(',');
  const query = `
    SELECT event_id, COUNT(*) as count
    FROM rsvps
    WHERE event_id IN (${placeholders})
    GROUP BY event_id
  `;
  
  const counts = dbManager.query(query, eventIds);
  
  // Create a map for efficient lookup
  const countMap = new Map();
  counts.forEach(count => {
    countMap.set(count.event_id, count.count);
  });
  
  // Return counts in the same order as requested event IDs
  return eventIds.map(id => countMap.get(id) || 0);
});

/**
 * User Organized Events DataLoader
 * Batches organized events lookups for users
 */
const userOrganizedEventsLoader = new DataLoader(async (userIds) => {
  const placeholders = userIds.map(() => '?').join(',');
  const query = `
    SELECT e.*, u.name as organizer_name, u.email as organizer_email
    FROM events e
    JOIN users u ON e.organizer_id = u.id
    WHERE e.organizer_id IN (${placeholders})
    ORDER BY e.date ASC
  `;
  
  const events = dbManager.query(query, userIds);
  
  // Group events by organizer ID
  const eventsMap = new Map();
  userIds.forEach(userId => {
    eventsMap.set(userId, []);
  });
  
  events.forEach(event => {
    const userEvents = eventsMap.get(event.organizer_id) || [];
    userEvents.push({
      id: event.id.toString(),
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      maxAttendees: event.max_attendees,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
      organizer: {
        id: event.organizer_id.toString(),
        name: event.organizer_name,
        email: event.organizer_email
      }
    });
    eventsMap.set(event.organizer_id, userEvents);
  });
  
  // Return events in the same order as requested user IDs
  return userIds.map(id => eventsMap.get(id) || []);
});

/**
 * User Attending Events DataLoader
 * Batches attending events lookups for users
 */
const userAttendingEventsLoader = new DataLoader(async (userIds) => {
  const placeholders = userIds.map(() => '?').join(',');
  const query = `
    SELECT r.user_id, e.*, u.name as organizer_name, u.email as organizer_email
    FROM rsvps r
    JOIN events e ON r.event_id = e.id
    JOIN users u ON e.organizer_id = u.id
    WHERE r.user_id IN (${placeholders})
    ORDER BY e.date ASC
  `;
  
  const events = dbManager.query(query, userIds);
  
  // Group events by user ID
  const eventsMap = new Map();
  userIds.forEach(userId => {
    eventsMap.set(userId, []);
  });
  
  events.forEach(event => {
    const userEvents = eventsMap.get(event.user_id) || [];
    userEvents.push({
      id: event.id.toString(),
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      maxAttendees: event.max_attendees,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
      organizer: {
        id: event.organizer_id.toString(),
        name: event.organizer_name,
        email: event.organizer_email
      }
    });
    eventsMap.set(event.user_id, userEvents);
  });
  
  // Return events in the same order as requested user IDs
  return userIds.map(id => eventsMap.get(id) || []);
});

/**
 * User Attendance Check DataLoader
 * Batches user attendance checks for events
 */
const userEventAttendanceLoader = new DataLoader(async (keys) => {
  // Keys are in format "eventId:userId"
  const conditions = keys.map(() => '(event_id = ? AND user_id = ?)').join(' OR ');
  const values = keys.flatMap(key => {
    const [eventId, userId] = key.split(':');
    return [eventId, userId];
  });
  
  const query = `
    SELECT event_id, user_id
    FROM rsvps
    WHERE ${conditions}
  `;
  
  const attendances = dbManager.query(query, values);
  
  // Create a set for efficient lookup
  const attendanceSet = new Set();
  attendances.forEach(attendance => {
    attendanceSet.add(`${attendance.event_id}:${attendance.user_id}`);
  });
  
  // Return attendance status in the same order as requested keys
  return keys.map(key => attendanceSet.has(key));
});

/**
 * Create DataLoader context
 * This function creates a new set of DataLoaders for each request
 */
function createLoaders() {
  return {
    user: userLoader,
    event: eventLoader,
    eventAttendees: eventAttendeesLoader,
    eventAttendeeCount: eventAttendeeCountLoader,
    userOrganizedEvents: userOrganizedEventsLoader,
    userAttendingEvents: userAttendingEventsLoader,
    userEventAttendance: userEventAttendanceLoader
  };
}

module.exports = {
  createLoaders,
  userLoader,
  eventLoader,
  eventAttendeesLoader,
  eventAttendeeCountLoader,
  userOrganizedEventsLoader,
  userAttendingEventsLoader,
  userEventAttendanceLoader
}; 