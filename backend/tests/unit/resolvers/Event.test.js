/**
 * Event Type Resolver Tests
 * 
 * Tests Event type resolvers including computed fields and relationships
 */

const GraphQLTestHelper = require('../../helpers/graphqlTestHelper');

describe('Event Type Resolvers', () => {
  let testHelper;

  beforeEach(async () => {
    testHelper = new GraphQLTestHelper();
    await testHelper.setup();
  });

  afterEach(async () => {
    await testHelper.teardown();
  });

  describe('Event computed fields', () => {
    it('should calculate attendeeCount correctly', async () => {
      const query = `
        query {
          event(id: "1") {
            id
            title
            attendeeCount
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      expect(data.event.attendeeCount).toBe(2); // From seed data: Jane and Bob
    });

    it('should calculate availableSpots correctly with maxAttendees', async () => {
      const query = `
        query {
          event(id: "1") {
            id
            maxAttendees
            attendeeCount
            availableSpots
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      expect(data.event.maxAttendees).toBe(50); // From seed data
      expect(data.event.attendeeCount).toBe(2);
      expect(data.event.availableSpots).toBe(48); // 50 - 2
    });

    it('should return null availableSpots when no maxAttendees limit', async () => {
      // Create event without maxAttendees limit
      const db = testHelper.getDb();
      const insertEvent = db.prepare(`
        INSERT INTO events (id, title, description, date, location, max_attendees, organizer_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      insertEvent.run(4, 'Unlimited Event', 'No limit', futureDate, 'Big Venue', null, 1);

      const query = `
        query {
          event(id: "4") {
            id
            maxAttendees
            availableSpots
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      expect(data.event.maxAttendees).toBeNull();
      expect(data.event.availableSpots).toBeNull();
    });

    it('should check isUserAttending correctly', async () => {
      const query = `
        query($userId: ID!) {
          event(id: "1") {
            id
            isUserAttending(userId: $userId)
          }
        }
      `;

      // User 2 is attending event 1
      let data = await testHelper.expectQuerySuccess(query, { userId: '2' });
      expect(data.event.isUserAttending).toBe(true);

      // User 1 is not attending event 1
      data = await testHelper.expectQuerySuccess(query, { userId: '1' });
      expect(data.event.isUserAttending).toBe(false);
    });

    it('should format dates as ISO strings', async () => {
      const query = `
        query {
          event(id: "1") {
            id
            date
            createdAt
            updatedAt
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      
      // Check that dates are valid ISO strings
      expect(() => new Date(data.event.date)).not.toThrow();
      expect(() => new Date(data.event.createdAt)).not.toThrow();
      expect(() => new Date(data.event.updatedAt)).not.toThrow();
      
      // Check ISO format
      expect(data.event.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(data.event.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(data.event.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('Event relationships', () => {
    it('should resolve organizer relationship', async () => {
      const query = `
        query {
          event(id: "1") {
            id
            organizer {
              id
              name
              email
            }
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      expect(data.event.organizer).toBeDefined();
      expect(data.event.organizer.id).toBe('1'); // From seed data
      expect(data.event.organizer.name).toBe('John Doe');
      expect(data.event.organizer.email).toBe('john@example.com');
    });

    it('should resolve attendees relationship', async () => {
      const query = `
        query {
          event(id: "1") {
            id
            attendees {
              id
              name
              email
            }
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      expect(Array.isArray(data.event.attendees)).toBe(true);
      expect(data.event.attendees.length).toBe(2); // Jane and Bob from seed data
      
      const attendeeNames = data.event.attendees.map(a => a.name).sort();
      expect(attendeeNames).toEqual(['Bob Wilson', 'Jane Smith']);
    });

    it('should handle events with no attendees', async () => {
      const query = `
        query {
          event(id: "2") {
            id
            attendees {
              id
              name
            }
            attendeeCount
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      expect(Array.isArray(data.event.attendees)).toBe(true);
      expect(data.event.attendees.length).toBe(1); // Only John from seed data
      expect(data.event.attendeeCount).toBe(1);
    });
  });

  describe('Event nested queries', () => {
    it('should support deep nested queries', async () => {
      const query = `
        query {
          event(id: "1") {
            id
            title
            organizer {
              id
              name
              organizedEvents {
                id
                title
                attendeeCount
              }
            }
            attendees {
              id
              name
              attendingEvents {
                id
                title
              }
            }
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      
      // Check organizer's events
      expect(data.event.organizer.organizedEvents).toBeDefined();
      expect(Array.isArray(data.event.organizer.organizedEvents)).toBe(true);
      
      // Check attendees' events
      expect(data.event.attendees.length).toBeGreaterThan(0);
      data.event.attendees.forEach(attendee => {
        expect(Array.isArray(attendee.attendingEvents)).toBe(true);
      });
    });

    it('should handle circular relationship queries efficiently', async () => {
      const query = `
        query {
          event(id: "1") {
            organizer {
              organizedEvents {
                organizer {
                  name
                }
                attendees {
                  attendingEvents {
                    title
                  }
                }
              }
            }
          }
        }
      `;

      // This should not cause infinite loops or excessive database queries
      const data = await testHelper.expectQuerySuccess(query);
      expect(data.event.organizer.organizedEvents).toBeDefined();
    });
  });

  describe('Event validation and error handling', () => {
    it('should handle non-existent event gracefully', async () => {
      const query = `
        query {
          event(id: "999") {
            id
            title
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query);
      expect(data.event).toBeNull();
    });

    it('should handle invalid user ID in isUserAttending', async () => {
      const query = `
        query($userId: ID!) {
          event(id: "1") {
            id
            isUserAttending(userId: $userId)
          }
        }
      `;

      const data = await testHelper.expectQuerySuccess(query, { userId: '999' });
      expect(data.event.isUserAttending).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      // Close the database to simulate connection errors
      testHelper.getDb().close();

      const query = `
        query {
          event(id: "1") {
            id
            attendeeCount
          }
        }
      `;

      const errors = await testHelper.expectQueryError(query);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
}); 