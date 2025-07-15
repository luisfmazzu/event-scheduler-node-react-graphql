/**
 * Query Resolver Tests
 * 
 * Tests all Query type resolvers including events, users, and system status
 */

const GraphQLTestHelper = require('../../helpers/graphqlTestHelper');

describe('Query Resolvers', () => {
  let testHelper;

  beforeEach(async () => {
    testHelper = new GraphQLTestHelper();
    await testHelper.setup();
  });

  afterEach(async () => {
    await testHelper.teardown();
  });

  describe('hello query', () => {
    it('should return greeting message', async () => {
      const query = `
        query {
          hello
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      expect(data.hello).toBe('Hello from Event Scheduler GraphQL API!');
    });
  });

  describe('status query', () => {
    it('should return system status', async () => {
      const query = `
        query {
          status {
            message
            version
            timestamp
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      expect(data.status.message).toBe('Event Scheduler GraphQL API is running');
      expect(data.status.version).toBe('1.0.0');
      expect(data.status.timestamp).toBeDefined();
    });
  });

  describe('dbStatus query', () => {
    it('should return database status', async () => {
      const query = `
        query {
          dbStatus {
            connected
            healthy
            path
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      expect(data.dbStatus.connected).toBe(true);
      expect(data.dbStatus.healthy).toBe(true);
      expect(data.dbStatus.path).toBeDefined();
    });
  });

  describe('events query', () => {
    it('should return all events', async () => {
      const query = `
        query {
          events {
            id
            title
            description
            date
            location
            maxAttendees
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      expect(Array.isArray(data.events)).toBe(true);
      expect(data.events.length).toBeGreaterThan(0);
      
      const event = data.events[0];
      expect(event.id).toBeDefined();
      expect(event.title).toBeDefined();
      expect(event.description).toBeDefined();
      expect(event.date).toBeDefined();
      expect(event.location).toBeDefined();
    });

    it('should return events with organizer information', async () => {
      const query = `
        query {
          events {
            id
            title
            organizer {
              id
              name
              email
            }
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      const event = data.events[0];
      expect(event.organizer).toBeDefined();
      expect(event.organizer.id).toBeDefined();
      expect(event.organizer.name).toBeDefined();
      expect(event.organizer.email).toBeDefined();
    });

    it('should return events with attendee information', async () => {
      const query = `
        query {
          events {
            id
            title
            attendees {
              id
              name
              email
            }
            attendeeCount
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      const eventWithAttendees = data.events.find(e => e.attendeeCount > 0);
      expect(eventWithAttendees).toBeDefined();
      expect(Array.isArray(eventWithAttendees.attendees)).toBe(true);
      expect(eventWithAttendees.attendees.length).toBe(eventWithAttendees.attendeeCount);
    });
  });

  describe('event query', () => {
    it('should return specific event by ID', async () => {
      const query = `
        query($id: ID!) {
          event(id: $id) {
            id
            title
            description
            organizer {
              name
            }
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query, { id: '1' });
      expect(data.event).toBeDefined();
      expect(data.event.id).toBe('1');
      expect(data.event.title).toBeDefined();
      expect(data.event.organizer.name).toBeDefined();
    });

    it('should return null for non-existent event', async () => {
      const query = `
        query($id: ID!) {
          event(id: $id) {
            id
            title
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query, { id: '999' });
      expect(data.event).toBeNull();
    });
  });

  describe('upcomingEvents query', () => {
    it('should return only future events', async () => {
      const query = `
        query {
          upcomingEvents {
            id
            title
            date
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      expect(Array.isArray(data.upcomingEvents)).toBe(true);
      
      // All events should be in the future
      const now = new Date();
      data.upcomingEvents.forEach(event => {
        const eventDate = new Date(event.date);
        expect(eventDate.getTime()).toBeGreaterThan(now.getTime());
      });
    });
  });

  describe('users query', () => {
    it('should return all users', async () => {
      const query = `
        query {
          users {
            id
            name
            email
            createdAt
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      expect(Array.isArray(data.users)).toBe(true);
      expect(data.users.length).toBeGreaterThan(0);
      
      const user = data.users[0];
      expect(user.id).toBeDefined();
      expect(user.name).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.createdAt).toBeDefined();
    });
  });

  describe('user query', () => {
    it('should return specific user by ID', async () => {
      const query = `
        query($id: ID!) {
          user(id: $id) {
            id
            name
            email
            organizedEvents {
              id
              title
            }
            attendingEvents {
              id
              title
            }
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query, { id: '1' });
      expect(data.user).toBeDefined();
      expect(data.user.id).toBe('1');
      expect(Array.isArray(data.user.organizedEvents)).toBe(true);
      expect(Array.isArray(data.user.attendingEvents)).toBe(true);
    });

    it('should return null for non-existent user', async () => {
      const query = `
        query($id: ID!) {
          user(id: $id) {
            id
            name
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query, { id: '999' });
      expect(data.user).toBeNull();
    });
  });

  describe('me query', () => {
    it('should return authenticated user', async () => {
      const query = `
        query {
          me {
            id
            name
            email
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      expect(data.me).toBeDefined();
      expect(data.me.id).toBe('1'); // From test context
      expect(data.me.name).toBe('John Doe');
      expect(data.me.email).toBe('john@example.com');
    });

    it('should return null when not authenticated', async () => {
      testHelper.setUnauthenticated();

      const query = `
        query {
          me {
            id
            name
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      expect(data.me).toBeNull();
    });
  });
}); 