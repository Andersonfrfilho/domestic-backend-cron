# ===== Build Arguments =====
ARG GIT_COMMIT_HASH="unknown"
ARG GIT_COMMIT_HASH_FULL="unknown"
ARG GIT_BRANCH="unknown"
ARG BUILD_DATE="unknown"

# ===== STAGE 1: Build =====
FROM node:25-alpine AS builder

WORKDIR /workspace

# Copy backend-package-nestjs for dependency resolution
COPY backend-package-nestjs ./backend-package-nestjs

# Copy service source (. because build context is the service repo root)
COPY . ./app
WORKDIR /workspace/app

# Install dependencies
RUN npm install -g pnpm && \
    rm -f pnpm-lock.yaml && \
    pnpm install --ignore-scripts && \
    pnpm rebuild

# Build service
RUN npm run build

# Compile migrations separately (if they exist)
RUN if ls src/modules/shared/providers/database/migrations/*.ts 2>/dev/null; then \
    npx tsc src/modules/shared/providers/database/migrations/*.ts \
      --outDir dist/modules/shared/providers/database/migrations \
      --module commonjs \
      --target es2020 \
      --esModuleInterop \
      --skipLibCheck \
      --strict false; \
  fi && \
  npm prune --omit=dev

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