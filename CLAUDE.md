# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev           # Watch mode
npm run start:dev:local     # Load .env.dev.local and watch

# Testing
npm run test:unit           # Unit tests (*.unit.spec.ts)
npm run test:unit:watch     # Unit tests watch mode
npm run test:unit:cov       # Unit tests with coverage report

# Code quality
npm run lint                # Fix ESLint issues + import order
npm run lint:check          # Check without fixing
npm run format:all          # Prettier + lint
```

## Architecture

**Stack:** NestJS 11 + Fastify (health only), TypeScript, TypeORM + PostgreSQL, RabbitMQ (producer only), `@nestjs/schedule`.

**Purpose:** Scheduled jobs service. Runs cron tasks on configured intervals and publishes events to RabbitMQ for downstream processing.

**Spec:** `.agents/skills/SPEC-CRON.md`

### Module structure

```
src/modules/
├── shared/
│   ├── providers/database/   # TypeORM (Postgres) — shared with API
│   └── rabbitmq/             # CronRabbitMQModule — producer only, no queues/DLX
├── account-cleanup/          # Deletes expired PENDING accounts
├── rating-recalculator/      # Recalculates provider average_rating in batches
├── request-reminder/         # Publishes reminders for upcoming ACCEPTED requests
├── weekly-report/            # Publishes weekly stats email for active providers
├── jobs/                     # HTTP controller for manual job triggers (dev/staging)
└── health/                   # Liveness/readiness
```

### Job pattern (per module)

```
Job (@Cron) → Service (lógica) → Repository / AmqpConnection
```

- **Job:** Schedules via `@Cron(process.env.CRON_XXX ?? '<default>')`. Catches all errors to prevent NestJS crash.
- **Service:** Business logic, injectable, directly testable.
- **Idempotência:** SQL queries are window-based (e.g., last N days), re-running produces same result.

### Distributed Lock (multi-pod safety)

Antes de executar, cada job tenta adquirir um lock via Redis `SET key 1 NX EX ttl`. Se outro pod já tem o lock, o job é pulado silenciosamente. O lock é liberado no `finally`. Se o Redis estiver fora do ar, o job roda sem lock (*fail-open*).

| Chave Redis | Job | TTL |
|---|---|---|
| `cron:lock:rating-recalculator` | RatingRecalculatorJob | 10min |
| `cron:lock:account-cleanup` | AccountCleanupJob | 15min |
| `cron:lock:request-reminder` | RequestReminderJob | 5min |
| `cron:lock:weekly-report` | WeeklyReportJob | 10min |

Implementado em `src/modules/shared/lock/cron-lock.service.ts`.

### Cron Schedule Defaults

| Job | Default | Env var |
|---|---|---|
| `RatingRecalculatorJob` | `0 5 * * *` (daily 05:00) | `CRON_RATING_RECALCULATOR` |
| `AccountCleanupJob` | `0 6 * * 0` (Sunday 06:00) | `CRON_ACCOUNT_CLEANUP` |
| `RequestReminderJob` | `0 * * * *` (hourly) | `CRON_REQUEST_REMINDER` |
| `WeeklyReportJob` | `0 8 * * 1` (Monday 08:00) | `CRON_WEEKLY_REPORT` |

### Manual Trigger Endpoints

`POST /jobs/<name>/run` — triggers job service immediately (dev/staging only, no auth required).

Routes: `account-cleanup/run`, `rating-recalculator/run`, `request-reminder/run`, `weekly-report/run`.

### RabbitMQ (producer only)

Exchange: `zolve.events` (topic, durable).

| Routing Key | Published by | Consumed by (Worker) |
|---|---|---|
| `notifications.email` | `WeeklyReportService` | `EmailConsumer` |
| `notifications.reminder` | `RequestReminderService` | `ServiceRequestWorkerConsumer` |

### Environment configuration

Validated via Joi in `src/config/env.validation.ts`.

Key vars:
- `RABBITMQ_URL` — RabbitMQ URI
- `CRON_*` — override cron expressions
- `PENDING_ACCOUNT_EXPIRY_DAYS` — days before PENDING accounts are deleted (default: 7)
- `PENDING_REQUEST_REMINDER_HOURS` — hours ahead to send reminders (default: 24)
- `RATING_RECALC_WINDOW_DAYS` — review window for recalculation (default: 30)
- PostgreSQL vars — same as domestic-backend-api

### TypeScript path aliases

```
@app/*      → src/*
@config/*   → src/config/*
@modules/*  → src/modules/*
```

### Testing conventions

- Unit test files: `*.unit.spec.ts`
- Mock: `AmqpConnection`, TypeORM repositories, `DataSource`/`QueryRunner`
- Coverage threshold: 50% functions/lines/statements
