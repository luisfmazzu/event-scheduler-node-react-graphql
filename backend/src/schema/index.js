/**
 * GraphQL Schema
 * 
 * Combines type definitions and resolvers into a complete GraphQL schema
 * for the Event Scheduler application
 */

const Query = require('./resolvers/Query');
const Event = require('./resolvers/Event');
const User = require('./resolvers/User');
const Mutation = require('./resolvers/Mutation');
const typeDefs = require('./typeDefs');

// Combine all resolvers into root value structure
const rootValue = {
  // Query resolvers
  ...Query,
  // Mutation resolvers
  ...Mutation
};

module.exports = {
  typeDefs,
  rootValue,
  resolvers: {
    Query,
    Event,
    User,
    Mutation
  }
}; 