/**
 * GraphQL Subscription Server
 * 
 * WebSocket server for handling GraphQL subscriptions
 */

const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/use/ws');
const jwt = require('jsonwebtoken');
const schema = require('./schema');
const dbManager = require('./database');
const { createLoaders } = require('./loaders');
const { GraphQLError, parse, getOperationAST } = require('graphql');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT;
if (!PORT) {
  throw new Error('Missing PORT environment variable.');
}

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
      onSubscribe: async (ctx, msg) => {
        console.log("onSubscribe called", msg.payload);
        if (!msg.payload || !msg.payload.query) {
          console.error('❌ Subscription received with missing or invalid query:', msg.payload);
          return [new GraphQLError('Subscription query is missing or invalid.')];
        }
        let document;
        try {
          document = parse(msg.payload.query);
        } catch (err) {
          return [new GraphQLError('Invalid GraphQL query: ' + err.message)];
        }
        const operationAST = getOperationAST(document, msg.payload.operationName);
        if (!operationAST || operationAST.operation !== 'subscription') {
          console.error('❌ Subscription error: Not a subscription operation:', msg.payload);
          return [new GraphQLError('Only subscription operations are allowed over this WebSocket.')];
        }
        const result = {
          schema,
          document,
          variableValues: msg.payload.variables,
          contextValue: ctx.extra || {},
          operationName: msg.payload.operationName,
        };
        console.log("onSubscribe return", result);
        return result;
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