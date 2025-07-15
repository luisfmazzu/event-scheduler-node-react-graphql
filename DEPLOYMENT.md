# Event Scheduler - Deployment Guide

This guide provides comprehensive instructions for deploying the Event Scheduler application to various platforms and environments.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] **Environment Variables**: Configure all required environment variables
- [ ] **Database**: Set up production database (SQLite is included, but consider PostgreSQL for production)
- [ ] **JWT Secret**: Generate a secure JWT secret (minimum 32 characters)
- [ ] **CORS Origins**: Configure proper CORS origins for your domain
- [ ] **SSL Certificate**: Ensure HTTPS is enabled for production
- [ ] **Domain Names**: Have your production domains ready
- [ ] **Monitoring**: Set up error tracking and monitoring (optional)

## 🐳 Docker Deployment (Recommended)

Docker deployment provides consistent environments and easy scaling.

### Prerequisites
- Docker and Docker Compose installed
- Production environment variables configured

### Quick Start

1. **Clone and Configure**
   ```bash
   git clone <your-repo-url>
   cd event-scheduler-node-react-graphql
   
   # Copy and configure environment
   cp config.production.example .env
   # Edit .env with your production values
   ```

2. **Deploy with Docker Compose**
   ```bash
   # Build and start all services
   docker-compose up -d
   
   # Check status
   docker-compose ps
   
   # View logs
   docker-compose logs -f
   ```

3. **Initialize Database**
   ```bash
   # Run database migrations
   docker-compose exec backend npm run migrate
   ```

4. **Verify Deployment**
   - Backend: `http://localhost:4000/graphql`
   - Frontend: `http://localhost:3000`

### Production Configuration

For production deployment, update `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGIN=https://yourdomain.com
    ports:
      - "80:4000"  # Or use reverse proxy
  
  frontend:
    environment:
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com
      - NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com/graphql
    ports:
      - "443:3000"  # Or use reverse proxy
```

## ☁️ Cloud Platform Deployments

### Vercel (Frontend Only)

Vercel is perfect for hosting the Next.js frontend with automatic deployments.

#### Setup Steps

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**
   ```bash
   cd frontend
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel --prod
   ```

3. **Configure Environment Variables**
   
   In Vercel Dashboard → Settings → Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api.com
   NEXT_PUBLIC_WS_URL=wss://your-backend-api.com/graphql
   NODE_ENV=production
   NEXT_TELEMETRY_DISABLED=1
   ```

4. **Configure Custom Domain** (Optional)
   - Go to Vercel Dashboard → Domains
   - Add your custom domain
   - Configure DNS records as instructed

#### Automatic Deployments

Connect your GitHub repository to Vercel for automatic deployments:
- Push to `main` branch → Production deployment
- Push to other branches → Preview deployments

### Netlify (Frontend Only)

Alternative to Vercel for frontend hosting.

#### Setup Steps

1. **Build Configuration**
   
   The `netlify.toml` file is already configured. Verify settings:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
   ```

2. **Deploy via CLI**
   ```bash
   cd frontend
   
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login
   netlify login
   
   # Deploy
   netlify deploy --prod --dir=.next
   ```

3. **Configure Environment Variables**
   
   In Netlify Dashboard → Site Settings → Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api.com
   NEXT_PUBLIC_WS_URL=wss://your-backend-api.com/graphql
   ```

### Railway (Full-Stack)

Railway provides easy deployment for both frontend and backend.

#### Backend Deployment

1. **Create Railway Project**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Initialize
   cd backend
   railway init
   ```

2. **Configure Environment Variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set JWT_SECRET=your-secure-jwt-secret
   railway variables set PORT=4000
   ```

3. **Deploy**
   ```bash
   railway up
   ```

#### Frontend Deployment

1. **Create Frontend Service**
   ```bash
   cd frontend
   railway init
   ```

2. **Configure Variables**
   ```bash
   railway variables set NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   railway variables set NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app/graphql
   ```

3. **Deploy**
   ```bash
   railway up
   ```

### Heroku (Full-Stack)

Traditional PaaS platform for full-stack deployment.

#### Backend Deployment

1. **Create Heroku App**
   ```bash
   cd backend
   
   # Login to Heroku
   heroku login
   
   # Create app
   heroku create your-app-name-backend
   ```

2. **Configure Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secure-jwt-secret
   heroku config:set PORT=\$PORT
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

#### Frontend Deployment

1. **Create Frontend App**
   ```bash
   cd frontend
   heroku create your-app-name-frontend
   ```

2. **Configure Build Pack**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

3. **Configure Environment Variables**
   ```bash
   heroku config:set NEXT_PUBLIC_API_URL=https://your-backend.herokuapp.com
   heroku config:set NEXT_PUBLIC_WS_URL=wss://your-backend.herokuapp.com/graphql
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

## 🔧 Advanced Deployment Configurations

### Reverse Proxy with Nginx

For production deployments, use Nginx as a reverse proxy:

```nginx
# /etc/nginx/sites-available/event-scheduler
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /graphql {
        proxy_pass http://localhost:4000/graphql;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Process Management with PM2

For production Node.js deployment:

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
```

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'event-scheduler-backend',
      script: 'src/server.js',
      cwd: './backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    },
    {
      name: 'event-scheduler-frontend',
      script: 'server.js',
      cwd: './frontend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

```bash
# Start applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

## 📊 Monitoring and Health Checks

### Health Check Endpoints

The application includes health check endpoints:

- **Backend**: `GET /health` → Returns API status
- **Frontend**: `GET /` → Returns 200 if app is running

### Monitoring Setup

1. **Application Monitoring**
   ```bash
   # Add to environment variables
   SENTRY_DSN=your-sentry-dsn
   NEW_RELIC_LICENSE_KEY=your-newrelic-key
   ```

2. **Uptime Monitoring**
   - Use services like Uptime Robot, Pingdom, or StatusCake
   - Monitor both frontend and backend endpoints
   - Set up alerts for downtime

3. **Log Management**
   ```bash
   # Configure log aggregation
   LOG_LEVEL=info
   LOG_FORMAT=json
   ```

## 🔐 Security Considerations

### Production Security Checklist

- [ ] **HTTPS**: Ensure SSL/TLS is properly configured
- [ ] **JWT Secret**: Use a strong, unique JWT secret
- [ ] **CORS**: Configure restrictive CORS origins
- [ ] **Headers**: Set security headers (included in configs)
- [ ] **Rate Limiting**: Implement rate limiting for API endpoints
- [ ] **Input Validation**: Ensure all inputs are validated
- [ ] **Dependencies**: Keep dependencies updated
- [ ] **Environment Variables**: Never commit secrets to version control

### Environment Variable Security

```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Use environment-specific configurations
NODE_ENV=production
JWT_SECRET=your-generated-secret-key
CORS_ORIGIN=https://yourdomain.com
```

## 🚀 Performance Optimization

### Backend Optimization

1. **Database Optimization**
   - Use proper indexes (already included)
   - Consider connection pooling for high traffic
   - Implement query optimization

2. **Caching**
   - Implement Redis for session storage
   - Use CDN for static assets
   - Enable gzip compression

### Frontend Optimization

1. **Build Optimization**
   ```bash
   # Analyze bundle size
   npm run build:analyze
   
   # Optimize images
   # Configure next.config.js for image optimization
   ```

2. **CDN Configuration**
   - Use Vercel Edge Network (automatic with Vercel)
   - Configure CloudFlare for custom deployments

## 🔄 Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci
          
      - name: Run tests
        run: |
          cd backend && npm test
          cd ../frontend && npm test
          
      - name: Build applications
        run: |
          cd frontend && npm run build
          
      - name: Deploy to production
        # Add your deployment steps here
```

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check database permissions
   ls -la backend/database/
   
   # Recreate database
   cd backend && npm run migrate:reset
   ```

2. **Port Conflicts**
   ```bash
   # Check what's using ports
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :4000
   
   # Kill processes if needed
   npx kill-port 3000
   npx kill-port 4000
   ```

3. **Environment Variable Issues**
   ```bash
   # Check environment loading
   node -e "console.log(process.env.NODE_ENV)"
   
   # Verify all required variables are set
   env | grep -E "(JWT_SECRET|CORS_ORIGIN|NEXT_PUBLIC)"
   ```

4. **Build Failures**
   ```bash
   # Clear caches
   rm -rf node_modules package-lock.json
   npm install
   
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

### Getting Help

1. Check application logs:
   ```bash
   # Docker logs
   docker-compose logs -f backend
   docker-compose logs -f frontend
   
   # PM2 logs
   pm2 logs
   ```

2. Health check endpoints:
   - Backend: `curl http://localhost:4000/graphql -d '{"query":"{hello}"}'`
   - Frontend: `curl http://localhost:3000`

3. Database verification:
   ```bash
   cd backend
   sqlite3 database/events.db ".tables"
   ```

---

**Need help?** Check the main [README.md](README.md) for development setup or create an issue in the repository. 