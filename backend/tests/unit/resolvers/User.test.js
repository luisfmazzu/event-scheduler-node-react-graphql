/**
 * User Type Resolver Tests
 * 
 * Tests User type resolvers including relationships and computed fields
 */

const GraphQLTestHelper = require('../../helpers/graphqlTestHelper');

describe('User Type Resolvers', () => {
  let testHelper;

  beforeEach(async () => {
    testHelper = new GraphQLTestHelper();
    await testHelper.setup();
  });

  afterEach(async () => {
    await testHelper.teardown();
  });

  describe('User relationships', () => {
    it('should resolve organizedEvents relationship', async () => {
      const query = `
        query {
          user(id: "1") {
            id
            name
            organizedEvents {
              id
              title
              date
              location
            }
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      expect(data.user.organizedEvents).toBeDefined();
      expect(Array.isArray(data.user.organizedEvents)).toBe(true);
      expect(data.user.organizedEvents.length).toBe(2); // From seed data: React Meetup and Past Event
      
      const eventTitles = data.user.organizedEvents.map(e => e.title).sort();
      expect(eventTitles).toContain('React Meetup');
      expect(eventTitles).toContain('Past Event');
    });

    it('should resolve attendingEvents relationship', async () => {
      const query = `
        query {
          user(id: "2") {
            id
            name
            attendingEvents {
              id
              title
              date
            }
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      expect(data.user.attendingEvents).toBeDefined();
      expect(Array.isArray(data.user.attendingEvents)).toBe(true);
      expect(data.user.attendingEvents.length).toBe(1); // Jane attends React Meetup
      expect(data.user.attendingEvents[0].title).toBe('React Meetup');
    });

    it('should handle user with no organized events', async () => {
      const query = `
        query {
          user(id: "3") {
            id
            name
            organizedEvents {
              id
              title
            }
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      expect(data.user.organizedEvents).toBeDefined();
      expect(Array.isArray(data.user.organizedEvents)).toBe(true);
      expect(data.user.organizedEvents.length).toBe(0); // Bob organizes no events
    });

    it('should handle user with no attending events', async () => {
      // Create a user with no RSVPs
      const db = testHelper.getDb();
      const insertUser = db.prepare('INSERT INTO users (id, name, email) VALUES (?, ?, ?)');
      insertUser.run(4, 'Alice Cooper', 'alice@example.com');

      const query = `
        query {
          user(id: "4") {
            id
            name
            attendingEvents {
              id
              title
            }
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      expect(data.user.attendingEvents).toBeDefined();
      expect(Array.isArray(data.user.attendingEvents)).toBe(true);
      expect(data.user.attendingEvents.length).toBe(0);
    });
  });

  describe('User date formatting', () => {
    it('should format createdAt and updatedAt as ISO strings', async () => {
      const query = `
        query {
          user(id: "1") {
            id
            createdAt
            updatedAt
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      
      // Check that dates are valid ISO strings
      expect(() => new Date(data.user.createdAt)).not.toThrow();
      expect(() => new Date(data.user.updatedAt)).not.toThrow();
      
      // Check ISO format
      expect(data.user.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(data.user.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('User nested queries', () => {
    it('should support deep nested queries with events', async () => {
      const query = `
        query {
          user(id: "1") {
            id
            name
            organizedEvents {
              id
              title
              attendees {
                id
                name
                attendingEvents {
                  id
                  title
                  organizer {
                    name
                  }
                }
              }
            }
            attendingEvents {
              id
              title
              organizer {
                id
                name
                organizedEvents {
                  id
                  title
                }
              }
            }
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      
      // Check organized events with attendees
      expect(data.user.organizedEvents).toBeDefined();
      if (data.user.organizedEvents.length > 0) {
        const eventWithAttendees = data.user.organizedEvents.find(e => e.attendees.length > 0);
        if (eventWithAttendees) {
          expect(Array.isArray(eventWithAttendees.attendees)).toBe(true);
          eventWithAttendees.attendees.forEach(attendee => {
            expect(Array.isArray(attendee.attendingEvents)).toBe(true);
          });
        }
      }

      // Check attending events with organizers
      expect(data.user.attendingEvents).toBeDefined();
      data.user.attendingEvents.forEach(event => {
        expect(event.organizer).toBeDefined();
        expect(Array.isArray(event.organizer.organizedEvents)).toBe(true);
      });
    });

    it('should handle circular relationships efficiently', async () => {
      const query = `
        query {
          user(id: "1") {
            organizedEvents {
              attendees {
                organizedEvents {
                  attendees {
                    name
                  }
                }
              }
            }
          }
        }
      `;

      // This should not cause infinite loops
      const data = await testHelper.expectQuerySuccess(query);
      expect(data.user.organizedEvents).toBeDefined();
    });
  });

  describe('User validation and error handling', () => {
    it('should handle non-existent user gracefully', async () => {
      const query = `
        query {
          user(id: "999") {
            id
            name
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      expect(data.user).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      // Close the database to simulate connection errors
      testHelper.getDb().close();

      const query = `
        query {
          user(id: "1") {
            id
            organizedEvents {
              id
            }
          }
        }
      `;

      const errors = await testHelper.expectQueryError(query);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate email format in computed fields', async () => {
      const query = `
        query {
          user(id: "1") {
            id
            email
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      expect(data.user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/); // Basic email regex
    });
  });

  describe('User filtering and search capabilities', () => {
    it('should handle users with various relationship patterns', async () => {
      const query = `
        query {
          users {
            id
            name
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

      const data = await testHelper.expectQuerySuccess(query);
      expect(Array.isArray(data.users)).toBe(true);
      expect(data.users.length).toBeGreaterThan(0);

      // Check that each user has proper structure
      data.users.forEach(user => {
        expect(user.id).toBeDefined();
        expect(user.name).toBeDefined();
        expect(Array.isArray(user.organizedEvents)).toBe(true);
        expect(Array.isArray(user.attendingEvents)).toBe(true);
      });

      // Find user with organized events
      const organizer = data.users.find(u => u.organizedEvents.length > 0);
      expect(organizer).toBeDefined();

      // Find user with attending events
      const attendee = data.users.find(u => u.attendingEvents.length > 0);
      expect(attendee).toBeDefined();
    });
  });
}); 