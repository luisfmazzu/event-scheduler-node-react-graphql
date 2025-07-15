# Backend Dockerfile - Event Scheduler GraphQL API
# Multi-stage build for production optimization

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Run any build steps (if you have a build script)
# RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine AS production

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app .

# Create data directory for SQLite database
RUN mkdir -p /app/data && chown nodejs:nodejs /app/data

# Create directory for database migrations
RUN mkdir -p /app/database && chown nodejs:nodejs /app/database

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = { host: 'localhost', port: 4000, path: '/graphql', method: 'POST', \
      headers: { 'Content-Type': 'application/json' }, timeout: 5000 }; \
    const req = http.request(options, (res) => { \
      process.exit(res.statusCode === 200 || res.statusCode === 400 ? 0 : 1); \
    }); \
    req.on('error', () => process.exit(1)); \
    req.write(JSON.stringify({ query: '{hello}' })); \
    req.end();"

# Start the application
CMD ["npm", "start"] 