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

// Basic GraphQL schema (will be expanded in later tasks)
const schema = buildSchema(`
  type Query {
    hello: String
    status: ServerStatus
  }

  type ServerStatus {
    message: String!
    timestamp: String!
    version: String!
  }
`);

// Basic resolvers (will be expanded in later tasks)
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
  }
};

// GraphQL endpoint
app.use('/graphql', createHandler({
  schema: schema,
  rootValue: rootValue,
  graphiql: process.env.NODE_ENV !== 'production', // Enable GraphiQL in development
  context: (req) => ({
    // Add request context here (user authentication, etc.)
    req: req
  })
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'event-scheduler-graphql-api'
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
    graphiql: process.env.NODE_ENV !== 'production' ? '/graphql' : null
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Event Scheduler GraphQL API running on port ${PORT}`);
  console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔍 GraphiQL interface: http://localhost:${PORT}/graphql`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
}); 