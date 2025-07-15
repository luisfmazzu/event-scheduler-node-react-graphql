/**
 * Mutation Resolver Tests
 * 
 * Tests all Mutation type resolvers including authentication, event management, and RSVPs
 */

const GraphQLTestHelper = require('../../helpers/graphqlTestHelper');

describe('Mutation Resolvers', () => {
  let testHelper;

  beforeEach(async () => {
    testHelper = new GraphQLTestHelper();
    await testHelper.setup();
  });

  afterEach(async () => {
    await testHelper.teardown();
  });

  describe('login mutation', () => {
    it('should login existing user', async () => {
      const mutation = `
        mutation($email: String!, $name: String!) {
          login(email: $email, name: $name) {
            user {
              id
              name
              email
            }
            token
          }
        }
      `;

      const data = await testHelper.expectMutationSuccess(mutation, {
        email: 'john@example.com',
        name: 'John Doe'
      });

      expect(data.login.user).toBeDefined();
      expect(data.login.user.email).toBe('john@example.com');
      expect(data.login.user.name).toBe('John Doe');
      expect(data.login.token).toBeDefined();
      expect(typeof data.login.token).toBe('string');
    });

    it('should create and login new user', async () => {
      const mutation = `
        mutation($email: String!, $name: String!) {
          login(email: $email, name: $name) {
            user {
              id
              name
              email
            }
            token
          }
        }
      `;

      const data = await testHelper.expectMutationSuccess(mutation, {
        email: 'newuser@example.com',
        name: 'New User'
      });

      expect(data.login.user).toBeDefined();
      expect(data.login.user.email).toBe('newuser@example.com');
      expect(data.login.user.name).toBe('New User');
      expect(data.login.token).toBeDefined();

      // Verify user was created in database
      const db = testHelper.getDb();
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get('newuser@example.com');
      expect(user).toBeDefined();
      expect(user.name).toBe('New User');
    });

    it('should fail with invalid email', async () => {
      const mutation = `
        mutation($email: String!, $name: String!) {
          login(email: $email, name: $name) {
            user {
              id
            }
            token
          }
        }
      `;

      const errors = await testHelper.expectMutationError(mutation, {
        email: 'invalid-email',
        name: 'Test User'
      });

      expect(errors[0].message).toContain('Invalid email format');
    });
  });

  describe('createEvent mutation', () => {
    it('should create new event', async () => {
      const mutation = `
        mutation($input: CreateEventInput!) {
          createEvent(input: $input) {
            event {
              id
              title
              description
              date
              location
              maxAttendees
              organizer {
                id
                name
              }
            }
          }
        }
      `;

      const input = {
        title: 'New Test Event',
        description: 'A test event for unit testing',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Test Venue',
        maxAttendees: 100
      };

      const data = await testHelper.expectMutationSuccess(mutation, { input });

      expect(data.createEvent.event).toBeDefined();
      expect(data.createEvent.event.title).toBe(input.title);
      expect(data.createEvent.event.description).toBe(input.description);
      expect(data.createEvent.event.location).toBe(input.location);
      expect(data.createEvent.event.maxAttendees).toBe(input.maxAttendees);
      expect(data.createEvent.event.organizer.id).toBe('1'); // From test context

      // Verify event was created in database
      const db = testHelper.getDb();
      const event = db.prepare('SELECT * FROM events WHERE title = ?').get(input.title);
      expect(event).toBeDefined();
    });

    it('should fail when not authenticated', async () => {
      testHelper.setUnauthenticated();

      const mutation = `
        mutation($input: CreateEventInput!) {
          createEvent(input: $input) {
            event {
              id
            }
          }
        }
      `;

      const input = {
        title: 'Unauthorized Event',
        description: 'This should fail',
        date: new Date().toISOString(),
        location: 'Nowhere'
      };

      const errors = await testHelper.expectMutationError(mutation, { input });
      expect(errors[0].message).toContain('Authentication required');
    });

    it('should fail with past date', async () => {
      const mutation = `
        mutation($input: CreateEventInput!) {
          createEvent(input: $input) {
            event {
              id
            }
          }
        }
      `;

      const input = {
        title: 'Past Event',
        description: 'This should fail',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        location: 'Test Venue'
      };

      const errors = await testHelper.expectMutationError(mutation, { input });
      expect(errors[0].message).toContain('Event date must be in the future');
    });
  });

  describe('updateEvent mutation', () => {
    it('should update event by organizer', async () => {
      const mutation = `
        mutation($id: ID!, $input: UpdateEventInput!) {
          updateEvent(id: $id, input: $input) {
            event {
              id
              title
              description
              location
            }
          }
        }
      `;

      const input = {
        title: 'Updated React Meetup',
        description: 'Updated description',
        location: 'New Venue'
      };

      const data = await testHelper.expectMutationSuccess(mutation, { id: '1', input });

      expect(data.updateEvent.event.title).toBe(input.title);
      expect(data.updateEvent.event.description).toBe(input.description);
      expect(data.updateEvent.event.location).toBe(input.location);
    });

    it('should fail when not organizer', async () => {
      testHelper.setAuthenticatedUser({ id: 2, name: 'Jane Smith', email: 'jane@example.com' });

      const mutation = `
        mutation($id: ID!, $input: UpdateEventInput!) {
          updateEvent(id: $id, input: $input) {
            event {
              id
            }
          }
        }
      `;

      const input = { title: 'Unauthorized Update' };

      const errors = await testHelper.expectMutationError(mutation, { id: '1', input });
      expect(errors[0].message).toContain('Only the organizer can update this event');
    });
  });

  describe('deleteEvent mutation', () => {
    it('should delete event by organizer', async () => {
      const mutation = `
        mutation($id: ID!) {
          deleteEvent(id: $id) {
            deletedEventId
          }
        }
      `;

      const data = await testHelper.expectMutationSuccess(mutation, { id: '1' });
      expect(data.deleteEvent.deletedEventId).toBe('1');

      // Verify event was deleted from database
      const db = testHelper.getDb();
      const event = db.prepare('SELECT * FROM events WHERE id = ?').get(1);
      expect(event).toBeUndefined();
    });

    it('should fail when not organizer', async () => {
      testHelper.setAuthenticatedUser({ id: 2, name: 'Jane Smith', email: 'jane@example.com' });

      const mutation = `
        mutation($id: ID!) {
          deleteEvent(id: $id) {
            deletedEventId
          }
        }
      `;

      const errors = await testHelper.expectMutationError(mutation, { id: '1' });
      expect(errors[0].message).toContain('Only the organizer can delete this event');
    });
  });

  describe('rsvpToEvent mutation', () => {
    it('should RSVP to event', async () => {
      // Use user 1 to RSVP to event 2 (which they're not attending yet)
      const mutation = `
        mutation($eventId: ID!) {
          rsvpToEvent(eventId: $eventId) {
            event {
              id
              attendeeCount
            }
            user {
              id
              name
            }
          }
        }
      `;

      const data = await testHelper.expectMutationSuccess(mutation, { eventId: '2' });

      expect(data.rsvpToEvent.event.id).toBe('2');
      expect(data.rsvpToEvent.user.id).toBe('1');

      // Verify RSVP was created in database
      const db = testHelper.getDb();
      const rsvp = db.prepare('SELECT * FROM rsvps WHERE user_id = ? AND event_id = ?').get(1, 2);
      expect(rsvp).toBeDefined();
    });

    it('should fail for duplicate RSVP', async () => {
      // User 2 is already attending event 1
      testHelper.setAuthenticatedUser({ id: 2, name: 'Jane Smith', email: 'jane@example.com' });

      const mutation = `
        mutation($eventId: ID!) {
          rsvpToEvent(eventId: $eventId) {
            event {
              id
            }
          }
        }
      `;

      const errors = await testHelper.expectMutationError(mutation, { eventId: '1' });
      expect(errors[0].message).toContain('User is already attending this event');
    });

    it('should fail when event is full', async () => {
      // Create an event with max 1 attendee and fill it
      const db = testHelper.getDb();
      const insertEvent = db.prepare(`
        INSERT INTO events (id, title, description, date, location, max_attendees, organizer_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      insertEvent.run(4, 'Full Event', 'This will be full', futureDate, 'Small Venue', 1, 1);

      // Add one attendee
      const insertRsvp = db.prepare('INSERT INTO rsvps (user_id, event_id) VALUES (?, ?)');
      insertRsvp.run(2, 4);

      // Try to add another attendee (user 3)
      testHelper.setAuthenticatedUser({ id: 3, name: 'Bob Wilson', email: 'bob@example.com' });

      const mutation = `
        mutation($eventId: ID!) {
          rsvpToEvent(eventId: $eventId) {
            event {
              id
            }
          }
        }
      `;

      const errors = await testHelper.expectMutationError(mutation, { eventId: '4' });
      expect(errors[0].message).toContain('Event is full');
    });
  });

  describe('cancelRsvp mutation', () => {
    it('should cancel RSVP', async () => {
      // User 2 is attending event 1, let them cancel
      testHelper.setAuthenticatedUser({ id: 2, name: 'Jane Smith', email: 'jane@example.com' });

      const mutation = `
        mutation($eventId: ID!) {
          cancelRsvp(eventId: $eventId) {
            event {
              id
              attendeeCount
            }
            user {
              id
            }
          }
        }
      `;

      const data = await testHelper.expectMutationSuccess(mutation, { eventId: '1' });

      expect(data.cancelRsvp.event.id).toBe('1');
      expect(data.cancelRsvp.user.id).toBe('2');

      // Verify RSVP was removed from database
      const db = testHelper.getDb();
      const rsvp = db.prepare('SELECT * FROM rsvps WHERE user_id = ? AND event_id = ?').get(2, 1);
      expect(rsvp).toBeUndefined();
    });

    it('should fail for non-existent RSVP', async () => {
      // User 1 is not attending event 2
      const mutation = `
        mutation($eventId: ID!) {
          cancelRsvp(eventId: $eventId) {
            event {
              id
            }
          }
        }
      `;

      const errors = await testHelper.expectMutationError(mutation, { eventId: '2' });
      expect(errors[0].message).toContain('User is not attending this event');
    });
  });
}); 