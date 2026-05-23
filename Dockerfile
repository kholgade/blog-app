# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDeps) for build
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/
COPY repos/ ./repos/
COPY site/ ./site/

# Build TypeScript
RUN npm run build

# Generate site HTML from markdown posts
RUN node dist/generate.js

# Prune devDependencies — only production deps go to runtime
RUN npm prune --production

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Update packages to patch CVEs in base image
RUN apk upgrade --no-cache

# Install git for repo sync
RUN apk add --no-cache git

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copy built artifacts with correct ownership
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/package.json ./
COPY --from=builder --chown=appuser:appgroup /app/site ./site
COPY --chown=appuser:appgroup entrypoint.sh /entrypoint.sh

# Copy repo markdown files for runtime regeneration
COPY --from=builder --chown=appuser:appgroup /app/repos ./repos

# Make entrypoint executable
RUN chmod +x /entrypoint.sh

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 32323

# Environment variables
ENV PORT=32323 \
    NODE_ENV=production \
    GIT_REPO_URL= \
    NODE_OPTIONS="--max-old-space-size=512"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:32323/ || exit 1

# Use entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Run-time hardening (use with docker run / docker-compose):
# --cap-drop=ALL --cap-add=NET_BIND_SERVICE
# --read-only --tmpfs /app/repos:uid=1001,gid=1001
# --security-opt=no-new-privileges:true
