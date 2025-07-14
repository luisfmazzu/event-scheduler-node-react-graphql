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

# Start development server
npm run dev
```

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with hot reloading
- `npm run dev:debug` - Start development server with debugging enabled

## 🗄️ Database

The application uses SQLite for data storage:

- **Database File**: `./database/events.db` (created automatically)
- **Driver**: better-sqlite3 for performance and reliability
- **Features**: Foreign keys, WAL mode, transaction support
- **Auto-creation**: Database file and directory created on first run

### Database Connection
The database connection is managed by the `DatabaseManager` class:
- Singleton pattern for consistent connection
- Automatic reconnection and health checking
- Transaction support for data integrity
- Performance optimizations (WAL mode, foreign keys)

## 📡 API Endpoints

### GraphQL Endpoint
- **URL**: `http://localhost:4000/graphql`
- **Method**: POST
- **Interface**: GraphiQL available in development mode

### Health Check
- **URL**: `http://localhost:4000/health`
- **Method**: GET
- **Response**: Server and database health status

### Root Endpoint
- **URL**: `http://localhost:4000/`
- **Method**: GET
- **Response**: API information and database status

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

### Basic Queries
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
      "tableCount": 0,
      "size": 8192,
      "readonly": false,
      "inTransaction": false,
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
    "tableCount": 0,
    "size": 8192
  }
}
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── server.js          # Main server file
│   └── database.js        # Database connection manager
├── database/              # SQLite database files
│   └── events.db         # Main database file (auto-created)
├── package.json           # Dependencies and scripts
├── config.example         # Environment configuration example
└── README.md             # This file
```

## 🔄 Development Roadmap

- [x] **Task 1.2.1**: Express.js server with GraphQL ✅
- [x] **Task 1.2.2**: SQLite database connection ✅
- [ ] **Task 1.2.3**: Database schema and migrations
- [ ] **Task 1.3.1**: Event and User types
- [ ] **Task 1.3.2**: Query resolvers

## 🛡️ Error Handling

The server includes comprehensive error handling:
- Request validation
- GraphQL schema validation
- Database connection errors
- Transaction rollback on failures
- Graceful shutdown with database cleanup

## 🔧 Database Features

- **Connection Management**: Singleton pattern with health checks
- **Performance**: WAL mode, foreign keys, prepared statements
- **Transactions**: Full ACID compliance with rollback support
- **Monitoring**: Connection status and statistics via GraphQL
- **Auto-creation**: Database file and directories created automatically

## 🔗 Related

- [Frontend Documentation](../frontend/README.md)
- [Project Documentation](../README.md)
- [GraphQL Documentation](https://graphql.org/)
- [SQLite Documentation](https://sqlite.org/docs.html) 