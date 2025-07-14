/**
 * GraphQL Schema
 * 
 * Combines type definitions and resolvers into a complete GraphQL schema
 * for the Event Scheduler application
 */

const { buildSchema } = require('graphql');
const Query = require('./resolvers/Query');
const Event = require('./resolvers/Event');
const User = require('./resolvers/User');

// GraphQL type definitions
const typeDefs = buildSchema(`
  # User type representing registered users
  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: String!
    updatedAt: String!
    # Organized events
    organizedEvents: [Event!]!
    # Events user has RSVP'd to
    attendingEvents: [Event!]!
  }

  # Event type representing scheduled events
  type Event {
    id: ID!
    title: String!
    description: String!
    date: String!
    location: String!
    maxAttendees: Int
    createdAt: String!
    updatedAt: String!
    # Relationships
    organizer: User!
    attendees: [User!]!
    # Computed fields
    attendeeCount: Int!
    isUserAttending(userId: ID!): Boolean!
    availableSpots: Int
  }

  # Server status types for monitoring
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

  type MigrationStatus {
    applied: [String!]!
    available: [String!]!
    pending: [String!]!
    total: Int!
    appliedCount: Int!
    pendingCount: Int!
    error: String
  }

  # Query type - read operations
  type Query {
    # System status queries
    hello: String
    status: ServerStatus
    dbStatus: DatabaseStatus
    migrationStatus: MigrationStatus
    
    # Event queries
    events: [Event!]!
    event(id: ID!): Event
    upcomingEvents: [Event!]!
    
    # User queries
    users: [User!]!
    user(id: ID!): User
  }

  # Mutation type - write operations (to be implemented in Phase 2)
  type Mutation {
    # Placeholder for future mutations
    _placeholder: String
  }
`);

// Combine all resolvers into root value structure
const rootValue = {
  // Query resolvers
  ...Query,
  // Mutation resolvers will be added in Phase 2
  _placeholder: () => 'Mutations will be implemented in Phase 2'
};

module.exports = {
  typeDefs,
  rootValue,
  resolvers: {
    Query,
    Event,
    User,
    Mutation: {
      _placeholder: () => 'Mutations will be implemented in Phase 2'
    }
  }
}; 