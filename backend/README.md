# Event Scheduler Backend API

GraphQL API backend for the Event Scheduler application built with Express.js, GraphQL, and SQLite.

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Copy environment configuration
cp config.example .env

# Initialize database and run migrations
npm run migrate

# Start development server
npm run dev
```

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with hot reloading
- `npm run dev:debug` - Start development server with debugging enabled
- `npm run migrate` - Run pending database migrations
- `npm run migrate:status` - Show migration status
- `npm run migrate:reset` - Reset database and rerun all migrations (⚠️ DESTRUCTIVE)
- `npm run db:init` - Initialize database connection

## 🗄️ Database

The application uses SQLite for data storage with automatic migration management:

- **Database File**: `./database/events.db` (created automatically)
- **Driver**: better-sqlite3 for performance and reliability
- **Features**: Foreign keys, WAL mode, transaction support
- **Auto-creation**: Database file and directory created on first run

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Events Table
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
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### RSVPs Table
```sql
CREATE TABLE rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,
  rsvp_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  UNIQUE(user_id, event_id)
);
```

### Migration System

The application includes a robust migration system:

- **Automatic Execution**: Migrations run automatically on server startup
- **Tracking**: Migration history tracked in `migrations` table
- **Checksums**: File integrity validation
- **Transactions**: All migrations run in transactions
- **Rollback**: Failed migrations are rolled back automatically

### Performance Optimizations

- **Indexes**: Strategic indexes on frequently queried columns
- **Foreign Keys**: Enforced referential integrity
- **Triggers**: Automatic `updated_at` timestamp updates
- **WAL Mode**: Write-Ahead Logging for better concurrency

## 📡 API Endpoints

### GraphQL Endpoint
- **URL**: `http://localhost:4000/graphql`
- **Method**: POST
- **Interface**: GraphiQL available in development mode

### Health Check
- **URL**: `http://localhost:4000/health`
- **Method**: GET
- **Response**: Server, database, and migration status

### Root Endpoint
- **URL**: `http://localhost:4000/`
- **Method**: GET
- **Response**: API information and system status

## 🔧 Configuration

Environment variables are configured in `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `DATABASE_URL` | Database file path | `./database/events.db` |
| `JWT_SECRET` | JWT signing secret | Required for production |

## 🧪 Testing GraphQL Queries

### Complete Query Example
```graphql
query {
  hello
  status {
    message
    timestamp
    version
  }
  dbStatus {
    connected
    healthy
    path
    tableCount
    size
    readonly
    inTransaction
    error
  }
  migrationStatus {
    applied
    available
    pending
    total
    appliedCount
    pendingCount
    error
  }
}
```

### Expected Response
```json
{
  "data": {
    "hello": "Hello from Event Scheduler GraphQL API!",
    "status": {
      "message": "Event Scheduler GraphQL API is running",
      "timestamp": "2025-01-14T...",
      "version": "1.0.0"
    },
    "dbStatus": {
      "connected": true,
      "healthy": true,
      "path": "./database/events.db",
      "tableCount": 4,
      "size": 32768,
      "readonly": false,
      "inTransaction": false,
      "error": null
    },
    "migrationStatus": {
      "applied": ["001_initial_schema.sql", "002_seed_data.sql"],
      "available": ["001_initial_schema.sql", "002_seed_data.sql"],
      "pending": [],
      "total": 2,
      "appliedCount": 2,
      "pendingCount": 0,
      "error": null
    }
  }
}
```

### Health Check Response
```json
{
  "status": "healthy",
  "timestamp": "2025-01-14T...",
  "service": "event-scheduler-graphql-api",
  "database": {
    "connected": true,
    "healthy": true,
    "path": "./database/events.db",
    "tableCount": 4,
    "size": 32768
  },
  "migrations": {
    "applied": 2,
    "pending": 0,
    "total": 2
  }
}
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── server.js              # Main server file
│   ├── database.js            # Database connection manager
│   └── migrations/            # Database migrations
│       ├── migrator.js        # Migration runner
│       ├── 001_initial_schema.sql  # Initial schema
│       └── 002_seed_data.sql  # Sample data
├── database/                  # SQLite database files
│   └── events.db             # Main database file (auto-created)
├── package.json               # Dependencies and scripts
├── config.example             # Environment configuration example
└── README.md                 # This file
```

## 🔄 Development Roadmap

- [x] **Task 1.2.1**: Express.js server with GraphQL ✅
- [x] **Task 1.2.2**: SQLite database connection ✅
- [x] **Task 1.2.3**: Database schema and migrations ✅
- [ ] **Task 1.3.1**: Event and User types
- [ ] **Task 1.3.2**: Query resolvers

## 🛠️ Development Commands

```bash
# Database Management
npm run migrate              # Run pending migrations
npm run migrate:status       # Check migration status
npm run migrate:reset        # Reset database (⚠️ DESTRUCTIVE)

# Development
npm run dev                  # Start with hot reloading
npm run dev:debug           # Start with debugging

# Production
npm start                   # Start production server
```

## 🛡️ Error Handling

The server includes comprehensive error handling:
- Request validation
- GraphQL schema validation
- Database connection errors
- Migration failures with rollback
- Transaction rollback on failures
- Graceful shutdown with cleanup

## 🔧 Database Features

- **Migration System**: Automatic schema versioning and updates
- **Connection Management**: Singleton pattern with health checks
- **Performance**: WAL mode, foreign keys, prepared statements
- **Transactions**: Full ACID compliance with rollback support
- **Monitoring**: Real-time status via GraphQL and REST endpoints
- **Sample Data**: Pre-populated with realistic test data

## 🔗 Related

- [Frontend Documentation](../frontend/README.md)
- [Project Documentation](../README.md)
- [GraphQL Documentation](https://graphql.org/)
- [SQLite Documentation](https://sqlite.org/docs.html)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3) 