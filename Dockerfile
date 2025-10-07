FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci --only=production
RUN cd backend && npm ci
RUN cd frontend && npm ci

# Copy source files
COPY . .

# Build the application
RUN cd frontend && npm run build
RUN cd backend && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/public ./backend/public
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/backend/node_modules ./backend/node_modules

WORKDIR /app/backend

EXPOSE 5000

CMD ["node", "dist/server.js"]
