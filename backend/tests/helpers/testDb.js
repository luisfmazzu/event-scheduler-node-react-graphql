/**
 * Test Database Helper
 * 
 * Sets up an in-memory SQLite database for testing to ensure
 * tests are isolated and don't affect the main database.
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

class TestDatabase {
  constructor() {
    this.db = null;
  }

  /**
   * Creates a new in-memory database with the schema
   */
  async setup() {
    // Create in-memory database
    this.db = new Database(':memory:');
    
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');
    
    // Read and execute schema - execute the entire file at once
    const schemaPath = path.join(__dirname, '../../src/migrations/001_initial_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the entire schema at once
    this.db.exec(schema);

    return this.db;
  }

  /**
   * Seeds the database with test data
   */
  async seedData() {
    if (!this.db) {
      throw new Error('Database not initialized. Call setup() first.');
    }

    // Insert test users
    const insertUser = this.db.prepare(`
      INSERT INTO users (id, name, email) 
      VALUES (?, ?, ?)
    `);
    
    insertUser.run(1, 'John Doe', 'john@example.com');
    insertUser.run(2, 'Jane Smith', 'jane@example.com');
    insertUser.run(3, 'Bob Wilson', 'bob@example.com');

    // Insert test events
    const insertEvent = this.db.prepare(`
      INSERT INTO events (id, title, description, date, location, max_attendees, organizer_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    insertEvent.run(1, 'React Meetup', 'Learn React best practices', futureDate, 'Tech Hub', 50, 1);
    insertEvent.run(2, 'GraphQL Workshop', 'Deep dive into GraphQL', futureDate, 'Coworking Space', 30, 2);
    insertEvent.run(3, 'Past Event', 'This event has passed', pastDate, 'Old Venue', 20, 1);

    // Insert test RSVPs
    const insertRsvp = this.db.prepare(`
      INSERT INTO rsvps (user_id, event_id) 
      VALUES (?, ?)
    `);
    
    insertRsvp.run(2, 1); // Jane attends React Meetup
    insertRsvp.run(3, 1); // Bob attends React Meetup
    insertRsvp.run(1, 2); // John attends GraphQL Workshop
  }

  /**
   * Clears all data from the database
   */
  async clearData() {
    if (!this.db) {
      return;
    }

    this.db.exec('DELETE FROM rsvps');
    this.db.exec('DELETE FROM events');
    this.db.exec('DELETE FROM users');
  }

  /**
   * Closes the database connection
   */
  async teardown() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Gets the database instance
   */
  getDb() {
    return this.db;
  }
}

module.exports = TestDatabase; 