# Event Scheduler - Full-Stack GraphQL Application

A modern, full-stack event scheduling application demonstrating advanced **GraphQL**, **React**, and **Node.js** concepts. Built as a portfolio project showcasing modern web development practices, real-time features, and comprehensive testing.

## 🎯 Project Overview

Event Scheduler is a community event management platform that allows users to:

- **Browse Events**: Discover upcoming events with detailed information
- **RSVP Management**: Join events with real-time capacity tracking
- **Event Creation**: Organize events with full CRUD operations
- **Real-time Updates**: Live RSVP notifications and event updates
- **User Authentication**: Secure JWT-based authentication system
- **Responsive Design**: Mobile-first design with Tailwind CSS

## 🛠 Technology Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **UI Library**: [React 19](https://react.dev/) with TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for responsive design
- **State Management**: React Context API
- **Real-time**: WebSocket subscriptions with graphql-ws
- **Testing**: React Testing Library + Jest

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) with Express.js
- **GraphQL**: [GraphQL.js](https://graphql.org/graphql-js/) with custom resolvers
- **Database**: [SQLite](https://sqlite.org/) with better-sqlite3
- **Authentication**: JWT tokens with secure validation
- **Real-time**: GraphQL Subscriptions over WebSocket
- **Optimization**: DataLoader for N+1 query prevention
- **Testing**: Jest with comprehensive resolver testing

### Development Tools
- **Language**: TypeScript for type safety
- **Linting**: ESLint with Next.js configuration
- **Testing**: Jest + React Testing Library
- **Database Management**: Custom migration system
- **Performance**: Bundle analysis and optimization

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **yarn**
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/event-scheduler-node-react-graphql.git
   cd event-scheduler-node-react-graphql
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Setup

1. **Backend Configuration**
   ```bash
   cd backend
   cp config.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=4000
   NODE_ENV=development
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   
   # Database Configuration
   DATABASE_PATH=./database/events.db
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   ```

2. **Frontend Configuration** (optional)
   ```bash
   cd frontend
   # Create .env.local for custom configuration
   echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
   ```

### Database Setup

The database will be automatically created and seeded on first run:

```bash
cd backend
npm run migrate
```

This creates:
- SQLite database with schema
- Sample users and events
- Proper indexes for performance

### Development Servers

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```
- GraphQL API: `http://localhost:4000/graphql`
- GraphiQL Interface: `http://localhost:4000/graphql` (in browser)
- WebSocket Subscriptions: `ws://localhost:4000/graphql`

**Terminal 2 - Frontend Server:**
```bash
cd frontend
npm run dev
```
- Next.js App: `http://localhost:3000`
- Hot reload enabled
- Real-time updates connected

### Verify Installation

1. **Backend Health Check**
   ```bash
   curl http://localhost:4000/graphql \
     -H "Content-Type: application/json" \
     -d '{"query": "{ hello }"}'
   ```

2. **Frontend Access**
   - Open `http://localhost:3000`
   - You should see the event listing page
   - Try creating an account and RSVP to events

## 📊 Testing

The project includes comprehensive testing for both frontend and backend:

### Backend Testing

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:resolvers   # GraphQL resolver tests
```

**Test Coverage Includes:**
- GraphQL resolver unit tests
- Database integration tests
- Authentication flow tests
- Error scenario testing
- DataLoader optimization tests

### Frontend Testing

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test suites
npm run test:ui          # Component tests
npm run test:integration # Integration tests
```

**Test Coverage Includes:**
- React component testing
- User interaction testing
- Context API testing
- Accessibility testing
- Error boundary testing

## 🏗 Architecture Overview

### Backend Architecture

```
backend/
├── src/
│   ├── server.js              # Express server setup
│   ├── subscriptionServer.js  # WebSocket server
│   ├── database.js            # SQLite connection manager
│   ├── schema/                # GraphQL schema
│   │   ├── index.js           # Schema composition
│   │   ├── typeDefs.js        # Type definitions
│   │   ├── resolvers/         # Query, Mutation, Subscription resolvers
│   │   └── scalars/           # Custom scalar types
│   ├── loaders/               # DataLoader for optimization
│   ├── migrations/            # Database migrations
│   └── seedData.js           # Sample data
├── tests/                     # Test suites
└── database/                  # SQLite files
```

### Frontend Architecture

```
frontend/
├── src/
│   ├── app/                   # Next.js App Router pages
│   ├── components/            # React components
│   │   ├── ui/                # Reusable UI components
│   │   ├── events/            # Event-specific components
│   │   ├── attendees/         # Attendee components
│   │   ├── auth/              # Authentication components
│   │   └── layout/            # Layout components
│   ├── contexts/              # React Context providers
│   ├── lib/                   # Utility functions
│   └── test-utils/            # Testing helpers
└── __tests__/                 # Test suites
```

## 🔥 Key Features Implemented

### 1. **Advanced GraphQL Features**
- **Complex Nested Queries**: Deep object traversal with efficient loading
- **Custom Scalar Types**: DateTime, Email validation with proper serialization
- **DataLoader Optimization**: Prevents N+1 queries with request-scoped caching
- **Subscriptions**: Real-time updates for RSVP changes and event modifications

### 2. **Authentication & Authorization**
- **JWT Authentication**: Secure token-based auth with expiration
- **Protected Routes**: Client and server-side route protection
- **User Context**: Persistent authentication state with React Context
- **Login Modal**: Seamless authentication flow

### 3. **Real-time Features**
- **GraphQL Subscriptions**: Live RSVP notifications
- **WebSocket Management**: Connection status monitoring and reconnection
- **Optimistic Updates**: Immediate UI feedback for better UX
- **Connection Status**: Visual indicators for real-time connectivity

### 4. **Event Management**
- **CRUD Operations**: Create, read, update, delete events
- **Capacity Management**: Real-time attendee counting and availability
- **Authorization**: Only organizers can modify their events
- **Validation**: Comprehensive input validation and error handling

### 5. **User Experience**
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Loading States**: Skeleton components and loading indicators
- **Error Boundaries**: Graceful error handling with retry mechanisms
- **Accessibility**: WCAG compliant with proper ARIA attributes

### 6. **Performance Optimization**
- **DataLoader**: Batched database queries for efficiency
- **Caching**: Request-scoped GraphQL caching
- **Bundle Optimization**: Code splitting and tree shaking
- **Database Indexing**: Optimized queries with proper indexes

## 🧪 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Events Table
```sql
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
```

### RSVPs Table
```sql
CREATE TABLE rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,
  rsvp_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (event_id) REFERENCES events(id),
  UNIQUE(user_id, event_id)
);
```

## 🚧 Available Scripts

### Backend Scripts
```bash
npm start           # Production server
npm run dev         # Development with hot reload
npm run migrate     # Run database migrations
npm run test        # Run test suite
npm run test:coverage # Test with coverage report
```

### Frontend Scripts
```bash
npm run dev         # Development server
npm run build       # Production build
npm run start       # Serve production build
npm run test        # Run test suite
npm run lint        # ESLint check
```

## 🚀 Deployment

### Backend Deployment

1. **Environment Variables**
   ```bash
   NODE_ENV=production
   PORT=4000
   JWT_SECRET=your-production-secret
   DATABASE_PATH=/app/data/events.db
   CORS_ORIGIN=https://your-domain.com
   ```

2. **Database Setup**
   ```bash
   npm run migrate
   ```

3. **Start Production Server**
   ```bash
   npm start
   ```

### Frontend Deployment

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Environment Variables**
   ```bash
   NEXT_PUBLIC_API_URL=https://api.your-domain.com
   ```

3. **Deploy to Vercel/Netlify**
   ```bash
   # Vercel
   vercel --prod
   
   # Netlify
   netlify deploy --prod --dir=.next
   ```

### Docker Deployment (Optional)

```dockerfile
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🎓 Learning Outcomes

This project demonstrates proficiency in:

- **GraphQL Schema Design**: Complex type relationships and custom scalars
- **Real-time Applications**: WebSocket subscriptions and live updates
- **Performance Optimization**: DataLoader patterns and N+1 query prevention
- **Authentication Patterns**: JWT implementation and context management
- **Testing Strategy**: Comprehensive unit and integration testing
- **TypeScript**: Advanced type safety and developer experience
- **Modern React**: Hooks, Context API, and component patterns
- **Backend Architecture**: Express.js with GraphQL and database design

## 🛟 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process on port 4000
npx kill-port 4000

# Kill process on port 3000
npx kill-port 3000
```

**Database Issues**
```bash
# Reset database
cd backend
npm run migrate:reset
```

**Module Not Found**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**WebSocket Connection Issues**
- Check that backend server is running on port 4000
- Verify CORS settings in backend configuration
- Ensure firewall allows WebSocket connections

### Getting Help

1. Check the [Issues](https://github.com/your-username/event-scheduler/issues) page
2. Review the test files for usage examples
3. Check browser developer tools for GraphQL queries
4. Use GraphiQL interface at `http://localhost:4000/graphql`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [GraphQL](https://graphql.org/) for the amazing query language
- [React](https://react.dev/) for the component architecture
- [Next.js](https://nextjs.org/) for the full-stack framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [React Testing Library](https://testing-library.com/) for testing best practices

---

**Built with ❤️ as a portfolio demonstration of modern web development practices.**