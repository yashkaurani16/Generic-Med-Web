# ==============================================================================
# Multi-Stage Dockerfile for genericMed Frontend (Vite + React 19 + Nginx)
# ==============================================================================

# Stage 1: Dependencies
FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json ./
RUN npm install

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

# Stage 3: Production Nginx Server
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
