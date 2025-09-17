# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files with proper permissions
COPY --chown=nestjs:nodejs package*.json ./

# Install only production dependencies (with retry logic)
RUN npm ci --only=production --legacy-peer-deps || \
    (npm cache clean --force && npm ci --only=production --legacy-peer-deps) && \
    npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist

# Change ownership
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/main.js health

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]