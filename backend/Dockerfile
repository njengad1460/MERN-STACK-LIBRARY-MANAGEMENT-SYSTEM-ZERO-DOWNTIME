# Use lightweight Node image
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy only dependency files first (for caching)
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy app source code
COPY . .

# Set environment
ENV NODE_ENV=staging

# Create non-root user for security
RUN addgroup -S app && adduser -S app -G app
USER app

# Expose port
EXPOSE 5000

# Health check (uses your /health route)
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start app
CMD ["pnpm", "start"]