# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy built application
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

USER node

CMD ["node", "build"]

