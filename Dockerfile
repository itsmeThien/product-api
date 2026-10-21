# ==========================================
# Dockerfile for Product RESTful API
# ==========================================
FROM node:20-alpine AS base

# Install curl/wget if needed for healthcheck
RUN apk add --no-cache wget

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy dependency manifests
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy application source code
COPY src ./src

# Use non-root node user for security
RUN chown -R node:node /app
USER node

# Expose API port
EXPOSE 5000

# Healthcheck definition for Docker Engine
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider -q http://localhost:5000/health || exit 1

# Start command
CMD ["node", "src/server.js"]
