/**
 * Event Scheduler GraphQL Server
 * 
 * Express.js server with GraphQL endpoint for the Event Scheduler application.
 * Provides a GraphQL API for event management and user interactions.
 */

const express = require('express');
const cors = require('cors');
const { createHandler } = require('graphql-http/lib/use/express');
const dbManager = require('./database');
const migrationRunner = require('./migrations/migrator');
const { typeDefs, rootValue, resolvers } = require('./schema');
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// GraphQL endpoint with schema, root resolvers, and type resolvers
app.use('/graphql', createHandler({
  schema: typeDefs,
  rootValue: rootValue,
  typeResolver: (value, context, info, abstractType) => {
    // Handle type resolution for interfaces/unions if needed
    return null;
  },
  fieldResolver: (source, args, context, info) => {
    // Handle field resolution for Event and User types
    const parentType = info.parentType.name;
    const fieldName = info.fieldName;
    
    if (parentType === 'Event' && resolvers.Event[fieldName]) {
      return resolvers.Event[fieldName](source, args, context, info);
    }
    
    if (parentType === 'User' && resolvers.User[fieldName]) {
      return resolvers.User[fieldName](source, args, context, info);
    }
    
    // Default field resolution
    return source[fieldName];
  },
  graphiql: process.env.NODE_ENV !== 'production', // Enable GraphiQL in development
  context: (req) => ({
    // Add request context here (user authentication, etc.)
    req: req,
    db: dbManager
  })
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
      health: '/health'
    },
    features: {
      graphiql: process.env.NODE_ENV !== 'production' ? '/graphql' : null,
      queries: ['events', 'event', 'upcomingEvents', 'users', 'user'],
      mutations: ['Coming in Phase 2'],
      subscriptions: ['Coming in Phase 3']
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
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Event Scheduler GraphQL API running on port ${PORT}`);
      console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      
      // Show migration status
      const migrationStatus = migrationRunner.getMigrationStatus();
      console.log(`📋 Database migrations: ${migrationStatus.appliedCount}/${migrationStatus.total} applied`);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔍 GraphiQL interface: http://localhost:${PORT}/graphql`);
      }
      
      // Show available queries
      console.log(`📝 Available queries: events, event, upcomingEvents, users, user`);
      console.log(`🎯 Try a query: { events { id title date organizer { name } } }`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await dbManager.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await dbManager.close();
  process.exit(0);
});

// Start the server
startServer(); 