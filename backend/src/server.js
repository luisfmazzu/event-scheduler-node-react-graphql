/**
 * Event Scheduler GraphQL Server
 * 
 * Express.js server with GraphQL endpoint and WebSocket subscriptions
 * for the Event Scheduler application.
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const { createHandler } = require('graphql-http/lib/use/express');
const dbManager = require('./database');
const migrationRunner = require('./migrations/migrator');
const schema = require('./schema');
const { createLoaders } = require('./loaders');
const { createSubscriptionServer } = require('./subscriptionServer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT;
if (!PORT) {
  throw new Error('Missing PORT environment variable.');
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// GraphQL HTTP endpoint
app.use('/graphql', createHandler({
  schema,
  graphiql: process.env.NODE_ENV !== 'production',
  context: (req) => {
    // Extract JWT token from Authorization header
    let token = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    return {
      req: req,
      db: dbManager,
      token: token,
      loaders: createLoaders()
    };
  }
}));

// Enhanced health check endpoint with database and migration status
app.get('/health', (req, res) => {
  const dbHealthy = dbManager.isConnectionHealthy();
  const dbStats = dbManager.getStats();
  const migrationStatus = migrationRunner.getMigrationStatus();
  
  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    service: 'event-scheduler-graphql-api',
    database: {
      connected: dbManager.isConnected,
      healthy: dbHealthy,
      path: dbStats.path,
      tableCount: dbStats.tableCount || 0,
      size: dbStats.size || 0
    },
    migrations: {
      applied: migrationStatus.appliedCount,
      pending: migrationStatus.pendingCount,
      total: migrationStatus.total
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  const migrationStatus = migrationRunner.getMigrationStatus();
  
  res.json({
    message: 'Event Scheduler GraphQL API',
    version: '1.0.0',
    endpoints: {
      graphql: '/graphql',
      health: '/health',
      subscriptions: '/graphql-ws'
    },
    features: {
      graphiql: process.env.NODE_ENV !== 'production' ? '/graphql' : null,
      queries: ['events', 'event', 'upcomingEvents', 'users', 'user'],
      mutations: ['login', 'createEvent', 'updateEvent', 'deleteEvent', 'rsvpToEvent', 'cancelRsvp'],
      subscriptions: ['rsvpUpdated', 'eventUpdated', 'allRsvpUpdates', 'allEventUpdates']
    },
    database: {
      connected: dbManager.isConnected,
      healthy: dbManager.isConnectionHealthy()
    },
    migrations: {
      applied: migrationStatus.appliedCount,
      pending: migrationStatus.pendingCount,
      total: migrationStatus.total
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Initialize database, run migrations, and start server
async function startServer() {
  try {
    // Connect to database
    await dbManager.connect();
    
    // Run database migrations
    await migrationRunner.runMigrations();
    
    // Create subscription server
    const { wsServer, serverCleanup } = createSubscriptionServer(server);
    
    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`🚀 Event Scheduler GraphQL API running on port ${PORT}`);
      console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
      console.log(`🔗 WebSocket subscriptions: ws://localhost:${PORT}/graphql-ws`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      
      // Show migration status
      const migrationStatus = migrationRunner.getMigrationStatus();
      console.log(`📋 Database migrations: ${migrationStatus.appliedCount}/${migrationStatus.total} applied`);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔍 GraphiQL interface: http://localhost:${PORT}/graphql`);
      }
      
      // Show available operations
      console.log(`📝 Available queries: events, event, upcomingEvents, users, user`);
      console.log(`✏️  Available mutations: login, createEvent, updateEvent, deleteEvent, rsvpToEvent, cancelRsvp`);
      console.log(`📺 Available subscriptions: rsvpUpdated, eventUpdated, allRsvpUpdates, allEventUpdates`);
      console.log(`🎯 Try a query: { events { id title date organizer { name } } }`);
    });

    // Graceful shutdown handler
    const gracefulShutdown = async (signal) => {
      console.log(`${signal} received. Shutting down gracefully...`);
      
      // Close subscription server
      await serverCleanup.dispose();
      
      // Close HTTP server
      server.close(async () => {
        // Close database connection
        await dbManager.close();
        console.log('Server shut down complete.');
        process.exit(0);
      });
    };

    // Register shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer(); 