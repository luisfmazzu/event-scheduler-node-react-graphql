/**
 * Sample Data Seeding Script
 * 
 * Seeds the database with sample users, events, and RSVPs
 * for development and testing purposes
 */

const dbManager = require('./database');

const seedData = {
  users: [
    {
      name: 'John Doe',
      email: 'john.doe@example.com'
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com'
    },
    {
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com'
    },
    {
      name: 'Bob Wilson',
      email: 'bob.wilson@example.com'
    },
    {
      name: 'Carol Brown',
      email: 'carol.brown@example.com'
    },
    {
      name: 'David Lee',
      email: 'david.lee@example.com'
    },
    {
      name: 'Emma Davis',
      email: 'emma.davis@example.com'
    },
    {
      name: 'Frank Miller',
      email: 'frank.miller@example.com'
    }
  ],

  events: [
    {
      title: 'Tech Conference 2024',
      description: 'Annual technology conference featuring the latest trends in software development, AI, and cloud computing.',
      date: '2024-06-15 09:00:00',
      location: 'San Francisco Convention Center',
      maxAttendees: 500,
      organizerId: 1
    },
    {
      title: 'React Workshop',
      description: 'Hands-on workshop covering React hooks, state management, and best practices.',
      date: '2024-05-20 14:00:00',
      location: 'Downtown Tech Hub',
      maxAttendees: 30,
      organizerId: 2
    },
    {
      title: 'Startup Pitch Night',
      description: 'Monthly event where entrepreneurs pitch their ideas to investors and fellow founders.',
      date: '2024-04-25 18:00:00',
      location: 'Innovation District',
      maxAttendees: 100,
      organizerId: 3
    },
    {
      title: 'GraphQL Deep Dive',
      description: 'Advanced GraphQL concepts including schema design, optimization, and real-time subscriptions.',
      date: '2024-07-10 13:00:00',
      location: 'Tech University',
      maxAttendees: 50,
      organizerId: 4
    },
    {
      title: 'Design Systems Meetup',
      description: 'Discussion on building scalable design systems for modern web applications.',
      date: '2024-05-30 17:00:00',
      location: 'Design Studio',
      maxAttendees: 40,
      organizerId: 5
    },
    {
      title: 'Open Source Contribution Day',
      description: 'Community event focused on contributing to open source projects and helping newcomers.',
      date: '2024-06-08 10:00:00',
      location: 'Community Center',
      maxAttendees: 75,
      organizerId: 6
    },
    {
      title: 'AI & Machine Learning Summit',
      description: 'Comprehensive summit covering the latest developments in AI, ML, and data science.',
      date: '2024-08-22 09:00:00',
      location: 'Science Museum',
      maxAttendees: 200,
      organizerId: 7
    },
    {
      title: 'Women in Tech Panel',
      description: 'Panel discussion featuring successful women in technology sharing their experiences.',
      date: '2024-05-15 16:00:00',
      location: 'Corporate Auditorium',
      maxAttendees: 80,
      organizerId: 8
    },
    {
      title: 'Cybersecurity Workshop',
      description: 'Interactive workshop on cybersecurity best practices for developers and businesses.',
      date: '2024-06-30 11:00:00',
      location: 'Security Institute',
      maxAttendees: 60,
      organizerId: 1
    },
    {
      title: 'Mobile Development Bootcamp',
      description: 'Intensive bootcamp covering React Native and Flutter development.',
      date: '2024-07-25 09:00:00',
      location: 'Mobile Development Center',
      maxAttendees: 25,
      organizerId: 2
    }
  ],

  rsvps: [
    // Tech Conference 2024 (Event 1)
    { userId: 2, eventId: 1 },
    { userId: 3, eventId: 1 },
    { userId: 4, eventId: 1 },
    { userId: 5, eventId: 1 },
    { userId: 6, eventId: 1 },
    { userId: 7, eventId: 1 },
    { userId: 8, eventId: 1 },
    
    // React Workshop (Event 2)
    { userId: 1, eventId: 2 },
    { userId: 3, eventId: 2 },
    { userId: 4, eventId: 2 },
    { userId: 5, eventId: 2 },
    { userId: 6, eventId: 2 },
    
    // Startup Pitch Night (Event 3)
    { userId: 1, eventId: 3 },
    { userId: 2, eventId: 3 },
    { userId: 4, eventId: 3 },
    { userId: 7, eventId: 3 },
    { userId: 8, eventId: 3 },
    
    // GraphQL Deep Dive (Event 4)
    { userId: 1, eventId: 4 },
    { userId: 2, eventId: 4 },
    { userId: 3, eventId: 4 },
    { userId: 5, eventId: 4 },
    
    // Design Systems Meetup (Event 5)
    { userId: 1, eventId: 5 },
    { userId: 2, eventId: 5 },
    { userId: 6, eventId: 5 },
    { userId: 7, eventId: 5 },
    { userId: 8, eventId: 5 },
    
    // Open Source Contribution Day (Event 6)
    { userId: 1, eventId: 6 },
    { userId: 2, eventId: 6 },
    { userId: 3, eventId: 6 },
    { userId: 4, eventId: 6 },
    { userId: 5, eventId: 6 },
    { userId: 7, eventId: 6 },
    
    // AI & Machine Learning Summit (Event 7)
    { userId: 1, eventId: 7 },
    { userId: 2, eventId: 7 },
    { userId: 3, eventId: 7 },
    { userId: 4, eventId: 7 },
    { userId: 5, eventId: 7 },
    { userId: 6, eventId: 7 },
    { userId: 8, eventId: 7 },
    
    // Women in Tech Panel (Event 8)
    { userId: 1, eventId: 8 },
    { userId: 2, eventId: 8 },
    { userId: 3, eventId: 8 },
    { userId: 4, eventId: 8 },
    { userId: 5, eventId: 8 },
    { userId: 6, eventId: 8 },
    { userId: 7, eventId: 8 },
    
    // Cybersecurity Workshop (Event 9)
    { userId: 2, eventId: 9 },
    { userId: 3, eventId: 9 },
    { userId: 4, eventId: 9 },
    { userId: 5, eventId: 9 },
    
    // Mobile Development Bootcamp (Event 10)
    { userId: 1, eventId: 10 },
    { userId: 3, eventId: 10 },
    { userId: 4, eventId: 10 },
    { userId: 5, eventId: 10 },
    { userId: 6, eventId: 10 }
  ]
};

/**
 * Clear existing data from tables
 */
function clearData() {
  try {
    console.log('🧹 Clearing existing data...');
    
    // Clear in reverse order due to foreign key constraints
    dbManager.run('DELETE FROM rsvps');
    dbManager.run('DELETE FROM events');
    dbManager.run('DELETE FROM users');
    
    // Reset auto-increment counters
    dbManager.run("DELETE FROM sqlite_sequence WHERE name IN ('users', 'events', 'rsvps')");
    
    console.log('✅ Data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
}

/**
 * Seed users into the database
 */
function seedUsers() {
  try {
    console.log('👥 Seeding users...');
    
    const insertUserQuery = `
      INSERT INTO users (name, email, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `;
    
    seedData.users.forEach(user => {
      dbManager.run(insertUserQuery, [user.name, user.email]);
    });
    
    console.log(`✅ Seeded ${seedData.users.length} users`);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}

/**
 * Seed events into the database
 */
function seedEvents() {
  try {
    console.log('📅 Seeding events...');
    
    const insertEventQuery = `
      INSERT INTO events (title, description, date, location, max_attendees, organizer_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    
    seedData.events.forEach(event => {
      dbManager.run(insertEventQuery, [
        event.title,
        event.description,
        event.date,
        event.location,
        event.maxAttendees,
        event.organizerId
      ]);
    });
    
    console.log(`✅ Seeded ${seedData.events.length} events`);
  } catch (error) {
    console.error('❌ Error seeding events:', error);
    throw error;
  }
}

/**
 * Seed RSVPs into the database
 */
function seedRsvps() {
  try {
    console.log('📝 Seeding RSVPs...');
    
    const insertRsvpQuery = `
      INSERT INTO rsvps (user_id, event_id, rsvp_date)
      VALUES (?, ?, datetime('now'))
    `;
    
    seedData.rsvps.forEach(rsvp => {
      dbManager.run(insertRsvpQuery, [rsvp.userId, rsvp.eventId]);
    });
    
    console.log(`✅ Seeded ${seedData.rsvps.length} RSVPs`);
  } catch (error) {
    console.error('❌ Error seeding RSVPs:', error);
    throw error;
  }
}

/**
 * Display seeding statistics
 */
function displayStats() {
  try {
    console.log('\n📊 Seeding Statistics:');
    
    const userCount = dbManager.query('SELECT COUNT(*) as count FROM users')[0].count;
    const eventCount = dbManager.query('SELECT COUNT(*) as count FROM events')[0].count;
    const rsvpCount = dbManager.query('SELECT COUNT(*) as count FROM rsvps')[0].count;
    
    console.log(`👥 Users: ${userCount}`);
    console.log(`📅 Events: ${eventCount}`);
    console.log(`📝 RSVPs: ${rsvpCount}`);
    
    // Show sample data
    console.log('\n🔍 Sample Data:');
    const sampleEvents = dbManager.query(`
      SELECT e.title, u.name as organizer, COUNT(r.id) as attendees
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      LEFT JOIN rsvps r ON e.id = r.event_id
      GROUP BY e.id, e.title, u.name
      ORDER BY attendees DESC
      LIMIT 3
    `);
    
    sampleEvents.forEach(event => {
      console.log(`  📅 ${event.title} (by ${event.organizer}) - ${event.attendees} attendees`);
    });
    
  } catch (error) {
    console.error('❌ Error displaying stats:', error);
  }
}

/**
 * Main seeding function
 */
function seedDatabase(options = {}) {
  const { clearFirst = true } = options;
  
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Ensure database connection
    if (!dbManager.isConnected) {
      console.log('🔗 Connecting to database...');
      dbManager.connect();
    }
    
    // Clear existing data if requested
    if (clearFirst) {
      clearData();
    }
    
    // Seed data in order
    seedUsers();
    seedEvents();
    seedRsvps();
    
    // Display final statistics
    displayStats();
    
    console.log('\n🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error);
    throw error;
  }
}

/**
 * Run seeding if this file is executed directly
 */
if (require.main === module) {
  try {
    seedDatabase();
    console.log('\n✅ Seeding process completed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding process failed:', error);
    process.exit(1);
  }
}

module.exports = {
  seedDatabase,
  seedData,
  clearData,
  seedUsers,
  seedEvents,
  seedRsvps,
  displayStats
}; 