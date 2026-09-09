# ==============================================================================
# Multi-Stage Dockerfile for genericMed Backend API Server (Node.js / Express 4)
# ==============================================================================

# Stage 1: Dependencies
FROM node:22-alpine AS dependencies
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json ./
COPY prisma ./prisma/
RUN npm install

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run build

# Stage 3: Production Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 genericmed

# Copy build artifacts and production dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=dependencies /app/node_modules ./node_modules

USER genericmed

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "dist/server.cjs"]
