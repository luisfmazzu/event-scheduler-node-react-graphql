# Event Scheduler

A modern event scheduling application built to demonstrate advanced **GraphQL** and **Relay** concepts in a React ecosystem. This project showcases best practices for building scalable, efficient frontend applications with real-time data fetching capabilities.

## 🎯 Project Overview

Event Scheduler is a community event management platform where users can:
- Browse upcoming events and meetups
- View detailed event information including organizer details and attendee lists
- RSVP to events with real-time updates
- Manage their own events (create, edit, delete)
- See live attendee counts and available spots

This application serves as a **portfolio demonstration** of modern GraphQL and Relay patterns, focusing on efficient data fetching, fragment composition, and optimistic updates.

## 🛠 Technology Stack

### Frontend (`/frontend`)
- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **UI Library**: [React 18](https://react.dev/) with TypeScript
- **GraphQL Client**: [Relay](https://relay.dev/) for efficient data fetching
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for modern, responsive design
- **State Management**: Relay store (no additional state management needed)

### Backend (`/backend` - *Coming Soon*)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **GraphQL**: [GraphQL.js](https://graphql.org/graphql-js/) with express-graphql
- **Database**: [SQLite](https://sqlite.org/) with better-sqlite3
- **Real-time**: GraphQL Subscriptions with WebSocket support

### Development Tools
- **Language**: TypeScript for type safety
- **Build Tool**: Next.js built-in bundler
- **Relay Compiler**: `@relay/compiler` for GraphQL code generation
- **Linting**: ESLint with Next.js configuration

## 🚀 Key Features Demonstrated

### GraphQL & Relay Capabilities
- **Nested Queries**: Fetch events with related organizer and attendee data in single requests
- **Fragment Composition**: Reusable data requirements across components
- **Connection Directives**: Cursor-based pagination with `@connection`
- **Optimistic Updates**: Instant UI feedback for mutations (RSVP actions)
- **Real-time Subscriptions**: Live updates for event changes and RSVP activities

### Modern React Patterns
- **Server Components**: Leveraging Next.js App Router for optimal performance
- **Component Composition**: Clean, reusable UI components with TypeScript
- **Error Boundaries**: Comprehensive error handling throughout the application
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 📁 Project Structure

```
event-scheduler-node-react-graphql/
├── frontend/                    # Next.js + React + Relay application
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   │   ├── layout.tsx      # Root layout component
│   │   │   └── page.tsx        # Homepage
│   │   ├── components/         # React components
│   │   │   ├── ui/             # Reusable UI components
│   │   │   ├── events/         # Event-specific components
│   │   │   ├── attendees/      # Attendee management components
│   │   │   └── layout/         # Layout components
│   │   ├── lib/                # Utility functions
│   │   └── relay/              # Relay configuration
│   ├── package.json            # Frontend dependencies
│   └── next.config.js          # Next.js configuration
├── backend/                    # Express.js + GraphQL API (planned)
├── docs/                       # Project documentation
│   └── PRD.md                  # Product Requirements Document
└── README.md                   # This file
```

## 🎨 Sample GraphQL Schema

```graphql
type Event {
  id: ID!
  title: String!
  description: String!
  date: String!
  location: String!
  organizer: User!
  attendees(first: Int, after: String): AttendeesConnection!
  attendeeCount: Int!
  isUserAttending(userId: ID!): Boolean!
}

type User {
  id: ID!
  name: String!
  email: String!
  organizedEvents: [Event!]!
  attendingEvents: [Event!]!
}

type Query {
  events(first: Int, after: String): EventsConnection!
  event(id: ID!): Event
  me: User
}

type Mutation {
  rsvpToEvent(eventId: ID!): RsvpPayload!
  cancelRsvp(eventId: ID!): CancelRsvpPayload!
  createEvent(input: CreateEventInput!): CreateEventPayload!
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/luisfmazzu/event-scheduler-node-react-graphql.git
   cd event-scheduler-node-react-graphql
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts (Frontend)

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎯 Learning Objectives

This project demonstrates proficiency in:

- **GraphQL Schema Design**: Type-safe, efficient API design
- **Relay Modern**: Fragment composition, connections, and mutations
- **Next.js App Router**: Server components and modern React patterns
- **TypeScript**: Type safety throughout the application
- **Real-time Applications**: WebSocket subscriptions and live updates
- **Performance Optimization**: Efficient data fetching and caching strategies

## 📈 Development Roadmap

- [x] **Phase 1**: Project setup and frontend infrastructure
- [ ] **Phase 2**: Backend GraphQL API implementation
- [ ] **Phase 3**: Relay integration and data fetching
- [ ] **Phase 4**: Event management features
- [ ] **Phase 5**: Real-time subscriptions and optimizations

## 🤝 Contributing

This is a portfolio/learning project, but feedback and suggestions are welcome! Please feel free to:
- Open issues for bugs or feature requests
- Submit pull requests for improvements
- Share feedback on GraphQL and Relay implementation patterns

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- **Live Demo**: *Coming soon*
- **GraphQL Playground**: *Available when backend is running*
- **Project Documentation**: See `/docs/PRD.md` for detailed specifications

---

**Built with ❤️ as a GraphQL and Relay learning project**