/**
 * GraphQL Type Definitions
 * 
 * Defines the GraphQL schema for the Event Scheduler application
 * Includes types for Events, Users, and various payloads
 */

const typeDefs = `
  # Custom scalar types
  scalar DateTime
  scalar Email
  scalar URL
  scalar PositiveInt

  # User type
  type User {
    id: ID!
    name: String!
    email: Email!
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # User's created events
    organizedEvents: [Event!]!
    
    # User's attended events
    attendingEvents: [Event!]!
  }
  
  # Event type
  type Event {
    id: ID!
    title: String!
    description: String!
    date: DateTime!
    location: String!
    maxAttendees: PositiveInt
    attendeeCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Event organizer
    organizer: User!
    
    # Event attendees
    attendees: [User!]!
    
    # Check if specific user is attending
    isUserAttending(userId: ID!): Boolean!
    
    # Available spots (calculated field)
    availableSpots: Int
  }
  
  # Authentication payload
  type AuthPayload {
    success: Boolean!
    message: String!
    user: User
    token: String
    errors: [String!]
  }
  
  # RSVP payload
  type RsvpPayload {
    success: Boolean!
    message: String!
    event: Event
    user: User
    errors: [String!]
  }
  
  # Cancel RSVP payload
  type CancelRsvpPayload {
    success: Boolean!
    message: String!
    event: Event
    user: User
    errors: [String!]
  }
  
  # Error type for mutations
  type Error {
    message: String!
    field: String
  }
  
  # Create event input
  input CreateEventInput {
    title: String!
    description: String!
    date: DateTime!
    location: String!
    maxAttendees: PositiveInt
  }
  
  # Update event input
  input UpdateEventInput {
    title: String
    description: String
    date: DateTime
    location: String
    maxAttendees: PositiveInt
  }
  
  # Create event payload
  type CreateEventPayload {
    event: Event
    errors: [Error!]
  }
  
  # Update event payload
  type UpdateEventPayload {
    event: Event
    errors: [Error!]
  }
  
  # Delete event payload
  type DeleteEventPayload {
    deletedEventId: ID!
    errors: [Error!]
  }

  # RSVP update for subscriptions
  type RsvpUpdate {
    event: Event!
    user: User!
    action: RsvpAction!
    timestamp: DateTime!
  }

  # Event update for subscriptions
  type EventUpdate {
    event: Event!
    action: EventAction!
    timestamp: DateTime!
  }

  # RSVP action enum
  enum RsvpAction {
    JOINED
    LEFT
  }

  # Event action enum
  enum EventAction {
    CREATED
    UPDATED
    DELETED
  }

  # Query type - read operations
  type Query {
    # Get all events
    events: [Event!]!
    
    # Get single event by ID
    event(id: ID!): Event
    
    # Get current user
    me: User
    
    # Get user by ID
    user(id: ID!): User
    
    # Get upcoming events
    upcomingEvents(limit: Int): [Event!]!
    
    # Get events by organizer
    eventsByOrganizer(organizerId: ID!): [Event!]!
  }

  # Mutation type - write operations
  type Mutation {
    # Authentication
    login(email: Email!, name: String!): AuthPayload!
    logout: AuthPayload!
    
    # Event management
    createEvent(input: CreateEventInput!): CreateEventPayload!
    updateEvent(id: ID!, input: UpdateEventInput!): UpdateEventPayload!
    deleteEvent(id: ID!): DeleteEventPayload!
    
    # RSVP management
    rsvpToEvent(eventId: ID!, userId: ID!): RsvpPayload!
    cancelRsvp(eventId: ID!, userId: ID!): CancelRsvpPayload!
  }

  # Subscription type - real-time updates
  type Subscription {
    # Subscribe to RSVP updates for a specific event
    rsvpUpdated(eventId: ID!): RsvpUpdate!
    
    # Subscribe to all RSVP updates
    allRsvpUpdates: RsvpUpdate!
    
    # Subscribe to event updates (created, updated, deleted)
    eventUpdated(eventId: ID!): EventUpdate!
    
    # Subscribe to all event updates
    allEventUpdates: EventUpdate!
    
    # Subscribe to events a user is attending
    userEventUpdates(userId: ID!): EventUpdate!
  }
`;

module.exports = typeDefs; 