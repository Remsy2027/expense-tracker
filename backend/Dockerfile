# backend/Dockerfile
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    curl \
    bash \
    tzdata \
    postgresql-client

# Set working directory
WORKDIR /app

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G nodejs -g nodejs nodejs

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads && chown -R nodejs:nodejs uploads

# Create health check script
COPY healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh

# Start the application
CMD ["node", "server.js"]

---

# backend/package.json
{
  "name": "expenseflow-backend",
  "version": "1.0.0",
  "description": "Backend API for ExpenseFlow - Personal Finance Tracker",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "migrate": "node scripts/migrate.js",
    "seed": "node scripts/seed.js"
  },
  "keywords": [
    "expense-tracker",
    "finance",
    "api",
    "nodejs",
    "express",
    "postgresql"
  ],
  "author": "ExpenseFlow Team",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "compression": "^1.7.4",
    "morgan": "^1.10.0",
    "pg": "^8.11.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "validator": "^13.11.0",
    "dotenv": "^16.3.1",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "eslint": "^8.54.0",
    "eslint-plugin-node": "^11.1.0",
    "eslint-plugin-security": "^1.7.1"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}

---

# backend/healthcheck.sh
#!/bin/bash
set -eo pipefail

# Health check script for backend
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "Backend is healthy"
    exit 0
else
    echo "Backend health check failed"
    exit 1
fi

---

# backend/.env.example
# Database Configuration
DATABASE_URL=postgresql://expenseflow:expenseflow123@localhost:5432/expenseflow

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-and-make-it-very-long

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=redis123

# Email Configuration (for future features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=another-super-secret-session-key

# Monitoring
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true