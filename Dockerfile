# Multi-stage Dockerfile for JustCode
# This Dockerfile builds both client and server in a single container
# For production use, consider separate containers (see docker-compose.yml)

# Stage 1: Build the client
FROM node:18-alpine AS client-build

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install client dependencies
RUN npm ci --only=production

# Copy client source code
COPY client/ ./

# Build the client
RUN npm run build

# Stage 2: Build and run the server
FROM node:18-alpine AS production

WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/

# Install server dependencies
WORKDIR /app/server
RUN npm ci --only=production

# Copy server source code
COPY server/ ./

# Copy built client from previous stage
COPY --from=client-build /app/client/dist /app/client/dist

# Expose the server port
EXPOSE 4334

# Set environment variables
ENV NODE_ENV=production \
    PORT=4334

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4334/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "index.js"]
