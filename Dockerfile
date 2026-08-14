# Multi-stage Dockerfile for core-service
FROM node:18-alpine AS deps
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure Prisma client is generated (requires DATABASE_URL at build time)
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL:-"postgresql://postgres:password@shipment-postgres:5432/shipment_db"}
RUN npx prisma generate

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built files and node_modules
COPY --from=builder /app .

EXPOSE 5002
CMD ["node", "src/server.js"]
