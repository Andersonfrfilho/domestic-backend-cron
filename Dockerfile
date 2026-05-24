# ===== Build Arguments =====
ARG GIT_COMMIT_HASH="unknown"
ARG GIT_COMMIT_HASH_FULL="unknown"
ARG GIT_BRANCH="unknown"
ARG BUILD_DATE="unknown"

# ===== STAGE 1: Build =====
FROM node:25-alpine AS builder

WORKDIR /workspace

# Copy service source (. because build context is the service repo root)
COPY . ./app

# Copy backend-package-nestjs separately to /workspace so relative paths in package.json work
# (package.json references file:../backend-package-nestjs/packages/...)
COPY backend-package-nestjs ./backend-package-nestjs

WORKDIR /workspace/app

# Install dependencies
RUN npm install

# Build service
RUN npm run build

# Prune dev dependencies (Cron does not run migrations)
RUN npm prune --omit=dev

# ===== STAGE 2: Runtime (Production) =====
FROM node:25-alpine

# Labels com informações de build
ARG GIT_COMMIT_HASH
ARG GIT_COMMIT_HASH_FULL
ARG GIT_BRANCH
ARG BUILD_DATE

LABEL git.commit.hash="${GIT_COMMIT_HASH}" \
      git.commit.hash.full="${GIT_COMMIT_HASH_FULL}" \
      git.branch="${GIT_BRANCH}" \
      build.date="${BUILD_DATE}" \
      maintainer="Anderson"

WORKDIR /app

# Copy only production dependencies
COPY --from=builder /workspace/app/node_modules ./node_modules

# Copy only compiled files and necessary configs
COPY --from=builder /workspace/app/tsconfig.json ./
COPY --from=builder /workspace/app/dist ./dist
COPY --from=builder /workspace/app/scripts ./scripts
COPY --from=builder /workspace/app/package*.json ./

# Create logs directory
RUN mkdir -p logs

# Start application (migrations should be run separately)
CMD ["node", "dist/main"]