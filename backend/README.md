# Event Scheduler Backend API

GraphQL API backend for the Event Scheduler application built with Express.js and GraphQL.

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

## 📡 API Endpoints

### GraphQL Endpoint
- **URL**: `http://localhost:4000/graphql`
- **Method**: POST
- **Interface**: GraphiQL available in development mode

### Health Check
- **URL**: `http://localhost:4000/health`
- **Method**: GET
- **Response**: Server health status

### Root Endpoint
- **URL**: `http://localhost:4000/`
- **Method**: GET
- **Response**: API information and available endpoints

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

### Basic Query Example
```graphql
query {
  hello
  status {
    message
    timestamp
    version
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
    }
  }
}
```

## 📁 Project Structure

```
backend/
├── src/
│   └── server.js          # Main server file
├── package.json           # Dependencies and scripts
├── config.example         # Environment configuration example
└── README.md             # This file
```

## 🔄 Development Roadmap

- [x] **Task 1.2.1**: Express.js server with GraphQL ✅
- [ ] **Task 1.2.2**: SQLite database connection
- [ ] **Task 1.2.3**: Database schema and migrations
- [ ] **Task 1.3.1**: Event and User types
- [ ] **Task 1.3.2**: Query resolvers

## 🛡️ Error Handling

The server includes comprehensive error handling:
- Request validation
- GraphQL schema validation
- Database connection errors
- Graceful shutdown on SIGTERM/SIGINT

## 🔗 Related

- [Frontend Documentation](../frontend/README.md)
- [Project Documentation](../README.md)
- [GraphQL Documentation](https://graphql.org/) 