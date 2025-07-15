/**
 * GraphQL Type Definitions
 * 
 * Defines the GraphQL schema types for the Event Scheduler application
 * Based on the PRD specification for Event and User entities
 */

const { buildSchema } = require('graphql');

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

  # Authentication types
  type AuthPayload {
    success: Boolean!
    message: String!
    user: User
    token: String
    errors: [String!]
  }

  type LoginInput {
    email: String!
    name: String!
  }

  # RSVP result types
  type RsvpPayload {
    success: Boolean!
    message: String!
    event: Event
    user: User
    errors: [String!]
  }

  type CancelRsvpPayload {
    success: Boolean!
    message: String!
    event: Event
    user: User
    errors: [String!]
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
    me: User
  }

  # Mutation type - write operations
  type Mutation {
    # Authentication
    login(email: String!, name: String!): AuthPayload!
    logout: AuthPayload!
    
    # RSVP management
    rsvpToEvent(eventId: ID!, userId: ID!): RsvpPayload!
    cancelRsvp(eventId: ID!, userId: ID!): CancelRsvpPayload!
  }
`);

module.exports = typeDefs; 