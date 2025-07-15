/**
 * GraphQL Schema
 * 
 * Combines type definitions and resolvers to create the complete GraphQL schema
 */

const { makeExecutableSchema } = require('@graphql-tools/schema');
const typeDefs = require('./typeDefs');
const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');
const Event = require('./resolvers/Event');
const User = require('./resolvers/User');
const { Subscription } = require('./resolvers/Subscription');
const { DateTime, Email, URL, PositiveInt } = require('./scalars');

const schema = makeExecutableSchema({
  typeDefs,
  resolvers: {
    // Custom scalar resolvers
    DateTime,
    Email,
    URL,
    PositiveInt,
    
    // Type resolvers
    Query,
    Mutation,
    Subscription,
    Event,
    User,
  },
});

module.exports = schema; 