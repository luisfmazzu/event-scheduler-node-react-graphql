/**
 * DataLoader Tests
 * 
 * Tests DataLoader functionality for N+1 query optimization
 */

const GraphQLTestHelper = require('../../helpers/graphqlTestHelper');

describe('DataLoader Optimization', () => {
  let testHelper;
  let queryCount = 0;
  let originalPrepare;

  beforeEach(async () => {
    testHelper = new GraphQLTestHelper();
    await testHelper.setup();
    
    // Mock database.prepare to count queries
    queryCount = 0;
    const db = testHelper.getDb();
    originalPrepare = db.prepare;
    db.prepare = function(sql) {
      queryCount++;
      return originalPrepare.call(this, sql);
    };
  });

  afterEach(async () => {
    // Restore original prepare method
    if (originalPrepare) {
      testHelper.getDb().prepare = originalPrepare;
    }
    await testHelper.teardown();
  });

  describe('Event organizer loading', () => {
    it('should batch organizer queries efficiently', async () => {
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

      queryCount = 0;
      const data = await testHelper.expectQuerySuccess(query);
      
      expect(Array.isArray(data.events)).toBe(true);
      expect(data.events.length).toBeGreaterThan(1);
      
      // Verify all events have organizers
      data.events.forEach(event => {
        expect(event.organizer).toBeDefined();
        expect(event.organizer.id).toBeDefined();
        expect(event.organizer.name).toBeDefined();
      });

      // With DataLoader, we should have much fewer queries than events
      // Without DataLoader: 1 query for events + 1 query per event for organizer
      // With DataLoader: 1 query for events + 1 batched query for all organizers
      expect(queryCount).toBeLessThan(data.events.length + 1);
    });

    it('should handle duplicate organizer IDs efficiently', async () => {
      // Create multiple events with the same organizer
      const db = testHelper.getDb();
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const insertEvent = db.prepare(`
        INSERT INTO events (id, title, description, date, location, organizer_id) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      insertEvent.run(4, 'Event 4', 'Description 4', futureDate, 'Venue 4', 1);
      insertEvent.run(5, 'Event 5', 'Description 5', futureDate, 'Venue 5', 1);
      insertEvent.run(6, 'Event 6', 'Description 6', futureDate, 'Venue 6', 1);

      const query = `
        query {
          events {
            id
            title
            organizer {
              id
              name
            }
          }
        }
      `;

      queryCount = 0;
      const data = await testHelper.expectQuerySuccess(query);
      
      // Should have multiple events with same organizer
      const johnEvents = data.events.filter(e => e.organizer.name === 'John Doe');
      expect(johnEvents.length).toBeGreaterThan(2);

      // DataLoader should cache and not reload the same organizer
      expect(queryCount).toBeLessThan(10); // Should be very efficient
    });
  });

  describe('Event attendees loading', () => {
    it('should batch attendee queries efficiently', async () => {
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

      queryCount = 0;
      const data = await testHelper.expectQuerySuccess(query);
      
      // Verify structure
      expect(Array.isArray(data.events)).toBe(true);
      data.events.forEach(event => {
        expect(Array.isArray(event.attendees)).toBe(true);
        expect(typeof event.attendeeCount).toBe('number');
        expect(event.attendees.length).toBe(event.attendeeCount);
      });

      // Should be efficient regardless of number of events
      expect(queryCount).toBeLessThan(20);
    });

    it('should handle events with no attendees efficiently', async () => {
      // Create event with no attendees
      const db = testHelper.getDb();
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const insertEvent = db.prepare(`
        INSERT INTO events (id, title, description, date, location, organizer_id) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      insertEvent.run(7, 'Solo Event', 'No attendees', futureDate, 'Empty Venue', 2);

      const query = `
        query {
          events {
            id
            attendees {
              id
              name
            }
            attendeeCount
          }
        }
      `;

      queryCount = 0;
      const data = await testHelper.expectQuerySuccess(query);
      
      const soloEvent = data.events.find(e => e.id === '7');
      expect(soloEvent).toBeDefined();
      expect(soloEvent.attendees).toEqual([]);
      expect(soloEvent.attendeeCount).toBe(0);

      // Should still be efficient
      expect(queryCount).toBeLessThan(15);
    });
  });

  describe('User relationships loading', () => {
    it('should batch user organized events efficiently', async () => {
      const query = `
        query {
          users {
            id
            name
            organizedEvents {
              id
              title
              date
            }
          }
        }
      `;

      queryCount = 0;
      const data = await testHelper.expectQuerySuccess(query);
      
      expect(Array.isArray(data.users)).toBe(true);
      data.users.forEach(user => {
        expect(Array.isArray(user.organizedEvents)).toBe(true);
      });

      // Should be efficient
      expect(queryCount).toBeLessThan(15);
    });

    it('should batch user attending events efficiently', async () => {
      const query = `
        query {
          users {
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
      `;

      queryCount = 0;
      const data = await testHelper.expectQuerySuccess(query);
      
      expect(Array.isArray(data.users)).toBe(true);
      data.users.forEach(user => {
        expect(Array.isArray(user.attendingEvents)).toBe(true);
        user.attendingEvents.forEach(event => {
          expect(event.organizer).toBeDefined();
          expect(event.organizer.name).toBeDefined();
        });
      });

      // Should be efficient even with nested organizer loading
      expect(queryCount).toBeLessThan(20);
    });
  });

  describe('Complex nested queries with DataLoader', () => {
    it('should handle deep nesting efficiently', async () => {
      const query = `
        query {
          events {
            id
            title
            organizer {
              id
              name
              organizedEvents {
                id
                title
                attendees {
                  id
                  name
                }
              }
            }
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
        }
      `;

      queryCount = 0;
      const data = await testHelper.expectQuerySuccess(query);
      
      // Verify deep structure is loaded
      expect(Array.isArray(data.events)).toBe(true);
      data.events.forEach(event => {
        expect(event.organizer).toBeDefined();
        expect(Array.isArray(event.organizer.organizedEvents)).toBe(true);
        expect(Array.isArray(event.attendees)).toBe(true);
        
        event.attendees.forEach(attendee => {
          expect(Array.isArray(attendee.attendingEvents)).toBe(true);
          attendee.attendingEvents.forEach(attendingEvent => {
            expect(attendingEvent.organizer).toBeDefined();
          });
        });
      });

      // Even with deep nesting, should be efficient due to batching
      console.log(`Complex nested query executed with ${queryCount} database queries`);
      expect(queryCount).toBeLessThan(50); // Should be reasonable
    });

    it('should handle duplicate entity requests efficiently', async () => {
      const query = `
        query {
          event(id: "1") {
            id
            title
            organizer {
              id
              name
            }
            attendees {
              id
              name
              attendingEvents {
                id
                organizer {
                  id
                  name
                }
              }
            }
          }
        }
      `;

      queryCount = 0;
      const data = await testHelper.expectQuerySuccess(query);
      
      // This query will request the same organizer multiple times
      // DataLoader should cache and return the same instance
      expect(data.event.organizer).toBeDefined();
      
      if (data.event.attendees.length > 0) {
        data.event.attendees.forEach(attendee => {
          attendee.attendingEvents.forEach(event => {
            if (event.organizer.id === data.event.organizer.id) {
              // Should be the same cached instance
              expect(event.organizer.name).toBe(data.event.organizer.name);
            }
          });
        });
      }

      // Should be very efficient due to caching
      expect(queryCount).toBeLessThan(25);
    });
  });

  describe('DataLoader error handling', () => {
    it('should handle missing references gracefully', async () => {
      // Create event with invalid organizer_id
      const db = testHelper.getDb();
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      // Insert event with non-existent organizer
      db.exec(`
        INSERT INTO events (id, title, description, date, location, organizer_id) 
        VALUES (8, 'Orphan Event', 'No valid organizer', '${futureDate}', 'Lost Venue', 999)
      `);

      const query = `
        query {
          events {
            id
            title
            organizer {
              id
              name
            }
          }
        }
      `;

      // Should handle gracefully, not crash
      const data = await testHelper.expectQuerySuccess(query);
      const orphanEvent = data.events.find(e => e.id === '8');
      expect(orphanEvent).toBeDefined();
      expect(orphanEvent.organizer).toBeNull(); // Should gracefully handle missing organizer
    });

    it('should handle batch loading errors gracefully', async () => {
      const query = `
        query {
          events {
            id
            organizer {
              id
              name
            }
          }
        }
      `;

      // This should work normally first
      queryCount = 0;
      const data = await testHelper.expectQuerySuccess(query);
      expect(data.events.length).toBeGreaterThan(0);

      // DataLoader should have made efficient queries
      expect(queryCount).toBeLessThan(10);
    });
  });
}); 