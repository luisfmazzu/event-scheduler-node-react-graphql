# Event Scheduler - Product Requirements Document

## 1. Project Overview

### Vision
Build a minimal event scheduling application that demonstrates advanced GraphQL and Relay concepts while maintaining simplicity in non-GraphQL components for rapid development.

### Primary Goals
- **Learning Objective**: Master GraphQL nested queries, mutations, fragments, and Relay integration
- **Portfolio Piece**: Showcase modern React/GraphQL architecture
- **Development Speed**: Complete in 2-3 weeks with focused scope

### Key Success Metrics
- Successful implementation of all specified GraphQL features
- Clean, reusable Relay fragments
- Efficient data fetching with minimal over-fetching
- Working real-time updates (if implemented)

## 2. Architecture Overview

### Tech Stack

#### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **GraphQL Client**: Relay
- **Styling**: Tailwind CSS
- **State Management**: Relay store (no additional state management needed)

#### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **GraphQL**: GraphQL.js with express-graphql
- **Database**: SQLite with better-sqlite3
- **Real-time** (Optional): GraphQL Subscriptions with ws

#### Development Tools
- **Build Tool**: Next.js built-in
- **Relay Compiler**: @relay/compiler
- **Database Management**: Prisma (optional, for schema management)

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │───▶│  GraphQL API    │───▶│    SQLite DB    │
│   (Relay)       │    │   (Express)     │    │   (Events/Users)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │
        │                       ▼
        │              ┌─────────────────┐
        └─────────────▶│  WebSocket      │
                       │  (Subscriptions)│
                       └─────────────────┘
```

## 3. Data Model & GraphQL Schema

### Core Entities

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  createdAt: String!
  # Organized events
  organizedEvents: [Event!]!
  # Events user has RSVP'd to
  attendingEvents: [Event!]!
}

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
  # Relay connection for pagination
  attendees(first: Int, after: String): AttendeesConnection!
  # Computed fields
  attendeeCount: Int!
  isUserAttending(userId: ID!): Boolean!
  availableSpots: Int
}

type AttendeesConnection {
  edges: [AttendeesEdge!]!
  pageInfo: PageInfo!
}

type AttendeesEdge {
  node: User!
  cursor: String!
  rsvpDate: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

# Queries
type Query {
  # Event queries
  events(first: Int, after: String, filter: EventFilter): EventsConnection!
  event(id: ID!): Event
  upcomingEvents(first: Int): [Event!]!
  
  # User queries
  user(id: ID!): User
  me: User # Current authenticated user
}

# Mutations
type Mutation {
  # Authentication
  login(email: String!, name: String!): AuthPayload!
  
  # Event management
  createEvent(input: CreateEventInput!): CreateEventPayload!
  updateEvent(id: ID!, input: UpdateEventInput!): UpdateEventPayload!
  deleteEvent(id: ID!): DeleteEventPayload!
  
  # RSVP management
  rsvpToEvent(eventId: ID!): RsvpPayload!
  cancelRsvp(eventId: ID!): CancelRsvpPayload!
}

# Subscriptions (Optional - Phase 2)
type Subscription {
  eventUpdated(eventId: ID!): Event!
  rsvpUpdated(eventId: ID!): RsvpUpdate!
}

# Input types
input EventFilter {
  search: String
  upcoming: Boolean
  organizerId: ID
}

input CreateEventInput {
  title: String!
  description: String!
  date: String!
  location: String!
  maxAttendees: Int
}

input UpdateEventInput {
  title: String
  description: String
  date: String
  location: String
  maxAttendees: Int
}

# Payload types
type AuthPayload {
  user: User!
  token: String!
}

type CreateEventPayload {
  event: Event!
  errors: [Error!]
}

type UpdateEventPayload {
  event: Event!
  errors: [Error!]
}

type DeleteEventPayload {
  deletedEventId: ID!
  errors: [Error!]
}

type RsvpPayload {
  event: Event!
  user: User!
  errors: [Error!]
}

type CancelRsvpPayload {
  event: Event!
  user: User!
  errors: [Error!]
}

type RsvpUpdate {
  event: Event!
  user: User!
  action: RsvpAction!
}

enum RsvpAction {
  JOINED
  LEFT
}

type Error {
  message: String!
  field: String
}
```

## 4. Frontend Architecture

### Component Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── events/               # Event-specific components
│   │   ├── EventCard.tsx     # Uses EventCard_event fragment
│   │   ├── EventList.tsx     # Uses EventList_events connection
│   │   ├── EventDetails.tsx  # Uses EventDetails_event fragment
│   │   ├── CreateEventForm.tsx
│   │   └── EditEventForm.tsx
│   ├── attendees/           # Attendee components
│   │   ├── AttendeeList.tsx # Uses AttendeeList_event fragment
│   │   ├── AttendeeCard.tsx # Uses AttendeeCard_user fragment
│   │   └── RsvpButton.tsx
│   └── layout/              # Layout components
│       ├── Header.tsx
│       ├── Navigation.tsx
│       └── Layout.tsx
├── pages/                   # Next.js pages
│   ├── index.tsx           # Event list page
│   ├── events/
│   │   ├── [id].tsx        # Event details page
│   │   ├── create.tsx      # Create event page
│   │   └── edit/[id].tsx   # Edit event page
│   └── profile.tsx         # User profile page
├── relay/                  # Relay configuration
│   ├── RelayEnvironment.ts
│   └── withRelay.tsx
├── lib/                    # Utilities
│   ├── auth.ts
│   └── utils.ts
└── styles/
    └── globals.css
```

### Key Relay Patterns

#### 1. Fragment Composition
```typescript
// EventCard component uses fragment
const EventCard_event = graphql`
  fragment EventCard_event on Event {
    id
    title
    date
    location
    attendeeCount
    availableSpots
    organizer {
      name
    }
  }
`;

// Parent component spreads fragments
const EventList_events = graphql`
  fragment EventList_events on Query {
    events(first: $count, after: $cursor) @connection(key: "EventList_events") {
      edges {
        node {
          id
          ...EventCard_event
        }
      }
    }
  }
`;
```

#### 2. Pagination with Connections
```typescript
const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(
  graphql`
    fragment EventList_events on Query
    @refetchable(queryName: "EventListPaginationQuery") {
      events(first: $count, after: $cursor)
        @connection(key: "EventList_events") {
        edges {
          node {
            id
            ...EventCard_event
          }
        }
      }
    }
  `,
  events
);
```

#### 3. Mutations with Optimistic Updates
```typescript
const [rsvpToEvent] = useMutation(graphql`
  mutation RsvpButtonMutation($eventId: ID!) {
    rsvpToEvent(eventId: $eventId) {
      event {
        id
        attendeeCount
        isUserAttending(userId: $userId)
        attendees(first: 10) @connection(key: "EventDetails_attendees") {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    }
  }
`);
```

## 5. Backend Architecture

### GraphQL Resolver Structure

```
src/
├── schema/
│   ├── typeDefs.js          # GraphQL schema definitions
│   ├── resolvers/
│   │   ├── Query.js         # Query resolvers
│   │   ├── Mutation.js      # Mutation resolvers
│   │   ├── Event.js         # Event type resolvers
│   │   ├── User.js          # User type resolvers
│   │   └── Subscription.js  # Subscription resolvers (optional)
│   └── index.js            # Schema composition
├── data/
│   ├── database.js         # SQLite connection
│   ├── models/
│   │   ├── Event.js        # Event data access
│   │   ├── User.js         # User data access
│   │   └── Rsvp.js         # RSVP relationship management
│   └── seedData.js         # Initial data seeding
├── middleware/
│   ├── auth.js             # Authentication middleware
│   └── validation.js       # Input validation
└── server.js               # Express server setup
```

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATETIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  max_attendees INTEGER,
  organizer_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(id)
);

-- RSVPs junction table
CREATE TABLE rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,
  rsvp_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (event_id) REFERENCES events(id),
  UNIQUE(user_id, event_id)
);

-- Indexes for performance
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_rsvps_event ON rsvps(event_id);
CREATE INDEX idx_rsvps_user ON rsvps(user_id);
```

## 6. Development Tasks & Subtasks

### Phase 1: Foundation (Week 1)

#### 1.1 Project Setup
- [ ] **1.1.1** Initialize Next.js project with TypeScript
- [ ] **1.1.2** Install and configure Relay dependencies
- [ ] **1.1.3** Set up Tailwind CSS
- [ ] **1.1.4** Configure Relay compiler and build scripts
- [ ] **1.1.5** Set up project structure and folders

#### 1.2 Backend Foundation
- [ ] **1.2.1** Initialize Express.js server with GraphQL
- [ ] **1.2.2** Set up SQLite database connection
- [ ] **1.2.3** Create database schema and migrations
- [ ] **1.2.4** Implement basic GraphQL schema (types only)
- [ ] **1.2.5** Set up CORS and basic middleware

#### 1.3 Basic GraphQL Schema
- [ ] **1.3.1** Define Event and User types
- [ ] **1.3.2** Implement basic Query resolvers (events, event)
- [ ] **1.3.3** Create sample data seeding script
- [ ] **1.3.4** Test GraphQL endpoint with GraphiQL

### Phase 2: Core Features (Week 2)

#### 2.1 Event Display
- [ ] **2.1.1** Create EventCard component with fragment
- [ ] **2.1.2** Implement EventList with connection/pagination
- [ ] **2.1.3** Build event list page (`pages/index.tsx`)
- [ ] **2.1.4** Add event filtering and search functionality
- [ ] **2.1.5** Style components with Tailwind CSS

#### 2.2 Event Details
- [ ] **2.2.1** Create EventDetails component with comprehensive fragment
- [ ] **2.2.2** Implement AttendeeList with paginated connection
- [ ] **2.2.3** Build event details page (`pages/events/[id].tsx`)
- [ ] **2.2.4** Add event organizer information display
- [ ] **2.2.5** Show attendee count and available spots

#### 2.3 RSVP Functionality
- [ ] **2.3.1** Implement RSVP mutations in backend
- [ ] **2.3.2** Create RsvpButton component with useMutation
- [ ] **2.3.3** Add optimistic updates for RSVP actions
- [ ] **2.3.4** Handle error states and user feedback
- [ ] **2.3.5** Update attendee lists after RSVP changes

#### 2.4 Authentication System
- [ ] **2.4.1** Implement simple email-based auth (no passwords)
- [ ] **2.4.2** Add login/logout mutations
- [ ] **2.4.3** Set up authentication context in Relay
- [ ] **2.4.4** Protect routes and mutations
- [ ] **2.4.5** Add user profile page

### Phase 3: Advanced Features (Week 3)

#### 3.1 Event Management
- [ ] **3.1.1** Create event creation form and mutation
- [ ] **3.1.2** Implement event editing functionality
- [ ] **3.1.3** Add event deletion with confirmation
- [ ] **3.1.4** Validate event data and handle errors
- [ ] **3.1.5** Add image upload for events (optional)

#### 3.2 Advanced GraphQL Features
- [ ] **3.2.1** Implement cursor-based pagination for all lists
- [ ] **3.2.2** Add DataLoader for N+1 query optimization
- [ ] **3.2.3** Create custom scalar types (DateTime, Email)
- [ ] **3.2.4** Add field-level authorization
- [ ] **3.2.5** Implement query complexity analysis

#### 3.3 Real-time Updates (Optional)
- [ ] **3.3.1** Set up GraphQL subscriptions server
- [ ] **3.3.2** Implement real-time RSVP updates
- [ ] **3.3.3** Add WebSocket connection management
- [ ] **3.3.4** Handle subscription lifecycle in React
- [ ] **3.3.5** Update UI with real-time data

#### 3.4 Polish & Optimization
- [ ] **3.4.1** Add loading states and skeletons
- [ ] **3.4.2** Implement error boundaries
- [ ] **3.4.3** Add comprehensive error handling
- [ ] **3.4.4** Optimize bundle size and performance
- [ ] **3.4.5** Add basic responsive design

### Phase 4: Testing & Documentation

#### 4.1 Testing
- [ ] **4.1.1** Write GraphQL resolver tests
- [ ] **4.1.2** Add React component tests with Relay
- [ ] **4.1.3** Create integration tests for key flows
- [ ] **4.1.4** Test error scenarios and edge cases
- [ ] **4.1.5** Performance testing and optimization

#### 4.2 Documentation
- [ ] **4.2.1** Update README with setup instructions
- [ ] **4.2.2** Document GraphQL schema and API
- [ ] **4.2.3** Create component documentation
- [ ] **4.2.4** Add deployment instructions
- [ ] **4.2.5** Write reflection on GraphQL/Relay learnings

## 7. GraphQL Features Demonstration

### 7.1 Nested Queries
```graphql
query EventWithDetails($id: ID!) {
  event(id: $id) {
    id
    title
    date
    organizer {
      id
      name
      email
      organizedEvents {
        id
        title
        date
      }
    }
    attendees(first: 10) {
      edges {
        node {
          id
          name
          attendingEvents {
            id
            title
          }
        }
      }
    }
  }
}
```

### 7.2 Relay Fragments Usage
```typescript
// Reusable fragments across components
const EventCard_event = graphql`
  fragment EventCard_event on Event {
    id
    title
    date
    location
    attendeeCount
    availableSpots
    organizer {
      name
    }
  }
`;

const EventDetails_event = graphql`
  fragment EventDetails_event on Event {
    ...EventCard_event
    description
    maxAttendees
    createdAt
    organizer {
      id
      email
      organizedEvents(first: 5) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
    attendees(first: $attendeesCount, after: $attendeesCursor)
      @connection(key: "EventDetails_attendees") {
      edges {
        node {
          ...AttendeeCard_user
        }
      }
    }
  }
`;
```

### 7.3 Connection Directives
```graphql
query EventsListQuery($count: Int!, $cursor: String) {
  events(first: $count, after: $cursor) @connection(key: "EventsList_events") {
    edges {
      node {
        id
        ...EventCard_event
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

### 7.4 Mutations with Updates
```typescript
const [rsvpToEvent] = useMutation(
  graphql`
    mutation RsvpMutation($eventId: ID!) {
      rsvpToEvent(eventId: $eventId) {
        event {
          id
          attendeeCount
          isUserAttending(userId: $userId)
          attendees(first: 1) @connection(key: "EventDetails_attendees") {
            edges {
              node {
                id
                name
              }
            }
          }
        }
        errors {
          message
          field
        }
      }
    }
  `,
  {
    optimisticUpdater: (store) => {
      // Optimistic update logic
      const event = store.get(eventId);
      if (event) {
        const currentCount = event.getValue('attendeeCount') as number;
        event.setValue(currentCount + 1, 'attendeeCount');
        event.setValue(true, 'isUserAttending');
      }
    },
  }
);
```

## 8. Success Criteria

### Technical Achievements
- [ ] All specified GraphQL features implemented
- [ ] Relay fragments used effectively for code reuse
- [ ] Pagination working with @connection directive
- [ ] Mutations with optimistic updates
- [ ] Real-time subscriptions (if implemented)
- [ ] No over-fetching of data
- [ ] Proper error handling throughout

### Learning Outcomes
- [ ] Deep understanding of Relay fragment composition
- [ ] Proficiency with GraphQL schema design
- [ ] Experience with cursor-based pagination
- [ ] Knowledge of optimistic updates
- [ ] Understanding of GraphQL performance considerations

### Portfolio Value
- [ ] Clean, modern UI with Tailwind CSS
- [ ] Comprehensive documentation
- [ ] Deployed application with live demo
- [ ] Source code available on GitHub
- [ ] Detailed reflection on learning experience

## 9. Resources & References

### Documentation
- [Relay Documentation](https://relay.dev/)
- [GraphQL Specification](https://spec.graphql.org/)
- [Next.js App Router](https://nextjs.org/docs/app)

### Key Packages
- Frontend: `relay-runtime`, `react-relay`, `next`, `tailwindcss`
- Backend: `express`, `express-graphql`, `graphql`, `better-sqlite3`
- Development: `@relay/compiler`, `graphql-tag`, `concurrently`

### Learning Resources
- Relay Modern Tutorial
- GraphQL Best Practices
- Cursor-based Pagination Guide
- Optimistic Updates Patterns
