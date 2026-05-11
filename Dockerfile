# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy built files and production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
# Include firebase key if present in local build
COPY --from=builder /app/firebase-key.json ./firebase-key.json 2>/dev/null || :

RUN npm install --omit=dev

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/main"]
