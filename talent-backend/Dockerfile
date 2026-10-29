# ==============================================================================
# Multi-stage production Dockerfile for Talent API Backend
# Optimized for Google Cloud Run, Supabase Postgres, and GCS
# ==============================================================================

# Stage 1: Build & Compile TypeScript
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install OpenSSL and dependencies required for Prisma engine compilation
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency manifests
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies including devDependencies for build
RUN npm ci

# Copy source code and config
COPY tsconfig.json ./
COPY src ./src/

# Generate Prisma Client and compile TypeScript
RUN npx prisma generate
RUN npm run build

# ==============================================================================
# Stage 2: Production Runtime
# ==============================================================================
FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install ffmpeg, openssl, and ca-certificates for production media processing
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    ffmpeg \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package manifests and install only production dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev

# Copy compiled JavaScript from builder stage
COPY --from=builder /app/dist ./dist

# Copy generated Prisma Client engines
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Create uploads directory for temporary scratch space with correct permissions
RUN mkdir -p /app/uploads/hls && chown -R node:node /app

# Run as non-root user for security
USER node

EXPOSE 3000

# Health check probe for container orchestrators
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/health', (r) => { if (r.statusCode !== 200) process.exit(1); })"

CMD ["node", "dist/index.js"]

