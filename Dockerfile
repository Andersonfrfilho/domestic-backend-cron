# ===== Build Arguments =====
ARG GIT_COMMIT_HASH="unknown"
ARG GIT_COMMIT_HASH_FULL="unknown"
ARG GIT_BRANCH="unknown"
ARG BUILD_DATE="unknown"

# ===== STAGE 1: Build =====
FROM node:25-alpine AS builder

WORKDIR /app

# Copy all package files
COPY package.json pnpm-lock.yaml ./

# Convert pnpm-lock to npm format or use pnpm with clean install
RUN npm install -g pnpm && \
    rm -f pnpm-lock.yaml && \
    npm install

COPY . .

RUN npm run build

# Compila migrations separadamente (se existirem)
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

# Copia apenas dependências de produção
COPY --from=builder /app/node_modules ./node_modules

# Copia apenas arquivos compilados e necessários
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/package*.json ./

# Cria pasta de logs
RUN mkdir -p logs

# PRODUÇÃO: Inicia diretamente (sem rodar migrations)
# Migrations devem ser rodadas manualmente ou via pipeline CI/CD
CMD ["node", "dist/main"]