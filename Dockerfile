# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/
COPY site/css ./site/css
COPY site/js ./site/js

# Build TypeScript
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Install git for repo sync
RUN apk add --no-cache git

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copy built artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/site ./site
COPY --from=builder /app/entrypoint.sh /entrypoint.sh

# Create directories for repo
RUN mkdir -p /app/repos/posts && \
    chown -R appuser:appgroup /app

# Make entrypoint executable
RUN chmod +x /entrypoint.sh

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Environment variables
ENV PORT=3000 \
    NODE_ENV=production \
    GIT_REPO_URL=

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Use entrypoint
ENTRYPOINT ["/entrypoint.sh"]
