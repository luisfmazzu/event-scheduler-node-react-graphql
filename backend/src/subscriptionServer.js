/**
 * GraphQL Subscription Server
 * 
 * WebSocket server for handling GraphQL subscriptions
 */

const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const jwt = require('jsonwebtoken');
const schema = require('./schema');
const dbManager = require('./database');
const { createLoaders } = require('./loaders');

// Create and configure the subscription server
function createSubscriptionServer(server) {
  // Create WebSocket server
  const wsServer = new WebSocketServer({
    server,
    path: '/graphql-ws',
  });

  // Use the WebSocket server for GraphQL subscriptions
  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx, msg, args) => {
        // Extract authentication token from connection params
        let token = null;
        let user = null;

        if (ctx.connectionParams?.Authorization) {
          const authHeader = ctx.connectionParams.Authorization;
          if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
            
            try {
              // Verify JWT token
              const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
              
              // Get user from database
              const userRow = dbManager.prepare(`
                SELECT id, name, email, created_at, updated_at 
                FROM users 
                WHERE id = ?
              `).get(decoded.userId);

              if (userRow) {
                user = {
                  id: userRow.id,
                  name: userRow.name,
                  email: userRow.email,
                  createdAt: userRow.created_at,
                  updatedAt: userRow.updated_at
                };
              }
            } catch (error) {
              console.error('Invalid JWT token in subscription:', error.message);
              // Don't throw error, just continue without user
            }
          }
        }

        return {
          db: dbManager,
          token,
          user,
          loaders: createLoaders(),
          // Add connection info for debugging
          connectionId: ctx.connectionParams?.connectionId || Math.random().toString(36)
        };
      },
      onConnect: async (ctx) => {
        console.log('🔗 WebSocket client connected for subscriptions');
        console.log('Connection params:', ctx.connectionParams ? 'Present' : 'None');
        return true;
      },
      onDisconnect: (ctx, code, reason) => {
        console.log('🔌 WebSocket client disconnected:', code, reason);
      },
      onSubscribe: (ctx, msg) => {
        console.log('📺 New subscription:', msg.payload?.query?.substring(0, 100) + '...');
        return {
          ...msg.payload,
          // Add connection context
          context: ctx.extra || {}
        };
      },
      onError: (ctx, msg, errors) => {
        console.error('❌ Subscription error:', errors);
        return errors;
      },
    },
    wsServer
  );

  return {
    wsServer,
    serverCleanup
  };
}

module.exports = {
  createSubscriptionServer
}; 