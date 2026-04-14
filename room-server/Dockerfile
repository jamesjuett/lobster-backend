# Socket.IO Room Server Dockerfile
#
# Build:   docker build -t room-server .
# Run:     docker run -d -p 3001:3001 --name rooms room-server
#
# Environment variables:
#   PORT        - Server port (default: 3001)
#   CORS_ORIGIN - Allowed origins, comma-separated or '*' (default: '*')

FROM node:24-slim

WORKDIR /app

# Install pnpm
RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy source
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN pnpm build

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "dist/server.js"]
