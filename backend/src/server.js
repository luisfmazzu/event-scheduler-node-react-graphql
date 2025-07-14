/**
 * Event Scheduler GraphQL Server
 * 
 * Express.js server with GraphQL endpoint for the Event Scheduler application.
 * Provides a GraphQL API for event management and user interactions.
 */

const express = require('express');
const cors = require('cors');
const { createHandler } = require('graphql-http/lib/use/express');
const { buildSchema } = require('graphql');
const dbManager = require('./database');
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

// Enhanced GraphQL schema with database status
const schema = buildSchema(`
  type Query {
    hello: String
    status: ServerStatus
    dbStatus: DatabaseStatus
  }

  type ServerStatus {
    message: String!
    timestamp: String!
    version: String!
  }

  type DatabaseStatus {
    connected: Boolean!
    healthy: Boolean!
    path: String!
    tableCount: Int
    size: Float
    readonly: Boolean
    inTransaction: Boolean
    error: String
  }
`);

// Enhanced resolvers with database integration
const rootValue = {
  hello: () => {
    return 'Hello from Event Scheduler GraphQL API!';
  },
  status: () => {
    return {
      message: 'Event Scheduler GraphQL API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  },
  dbStatus: () => {
    try {
      const stats = dbManager.getStats();
      return {
        connected: dbManager.isConnected,
        healthy: dbManager.isConnectionHealthy(),
        path: stats.path,
        tableCount: stats.tableCount || 0,
        size: stats.size || 0,
        readonly: stats.readonly || false,
        inTransaction: stats.inTransaction || false,
        error: stats.error || null
      };
    } catch (error) {
      return {
        connected: false,
        healthy: false,
        path: '',
        tableCount: 0,
        size: 0,
        readonly: false,
        inTransaction: false,
        error: error.message
      };
    }
  }
};

// GraphQL endpoint
app.use('/graphql', createHandler({
  schema: schema,
  rootValue: rootValue,
  graphiql: process.env.NODE_ENV !== 'production', // Enable GraphiQL in development
  context: (req) => ({
    // Add request context here (user authentication, etc.)
    req: req,
    db: dbManager
  })
}));

// Enhanced health check endpoint with database status
app.get('/health', (req, res) => {
  const dbHealthy = dbManager.isConnectionHealthy();
  const dbStats = dbManager.getStats();
  
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
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Event Scheduler GraphQL API',
    endpoints: {
      graphql: '/graphql',
      health: '/health'
    },
    graphiql: process.env.NODE_ENV !== 'production' ? '/graphql' : null,
    database: {
      connected: dbManager.isConnected,
      healthy: dbManager.isConnectionHealthy()
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

// Initialize database and start server
async function startServer() {
  try {
    // Connect to database
    await dbManager.connect();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Event Scheduler GraphQL API running on port ${PORT}`);
      console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔍 GraphiQL interface: http://localhost:${PORT}/graphql`);
      }
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