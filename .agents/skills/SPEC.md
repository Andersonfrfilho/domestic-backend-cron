# ZOLVE — Spec Master (Índice)

**Versão:** 3.0
**Data:** 04/04/2026
**Metodologia:** Spec-Driven Development (SDD)

> Este documento é o índice e a visão geral da plataforma. Cada aplicação tem seu próprio spec detalhado (ver seção 6).

---

## 1. Visão do Produto

Plataforma digital que conecta **contratantes** (pessoa física/jurídica) com **prestadores de serviços domésticos** (profissionais autônomos).

**Perfis:** `contratante` | `prestador` | `admin`

**Garantias da plataforma:**
- Cadastro seguro com validação de identidade
- Verificação de documentos e auditoria de prestadores
- Contratação e agendamento simplificados
- Comunicação direta via chat em tempo real
- Avaliações e sistema de reputação

---

## 2. Mapa de Repositórios

| Serviço | Repositório | Porta | Spec detalhado |
|---|---|---|---|
| Backend API | `domestic-backend-api` | 3000 | [SPEC-API.md](./SPEC-API.md) |
| Backend BFF | `domestic-backend-bff` | 3001 | [SPEC-BFF.md](./SPEC-BFF.md) |
| Backend Worker | `domestic-backend-worker` | 3002 | [SPEC-WORKER.md](./SPEC-WORKER.md) |
| Backend Cron | `domestic-backend-cron` | 3003 | [SPEC-CRON.md](./SPEC-CRON.md) |

---

## 3. Arquitetura de Alto Nível

```
Cliente (Web / Mobile)
        │  HTTPS + JWT
        ▼
┌─────────────────────┐
│   Kong API Gateway  │  valida JWT com Keycloak
│   (porta 8000)      │  injeta: X-User-Id, X-User-Roles, X-User-Type
└────────┬────────────┘
         │
    ┌────┴─────┐
    ▼          ▼
┌───────┐  ┌───────┐
│  BFF  │  │  API  │   backends stateless, leem apenas headers Kong
│ :3001 │  │ :3000 │
└───┬───┘  └───┬───┘
    │           │ publica eventos
    │       ┌───▼────────┐
    │       │  RabbitMQ  │
    │       └───┬────────┘
    │           │ consome filas
    │       ┌───▼───┐   ┌──────┐
    │       │Worker │   │ Cron │
    │       │ :3002 │   │:3003 │
    │       └───────┘   └──────┘
    │
┌───▼──────────────────────────┐
│  MongoDB  Redis  PostgreSQL  │
│  (BFF)    (cache) (API)      │
└──────────────────────────────┘
```

**Regra de ouro:** Nenhum serviço chama o Keycloak diretamente. Validação é 100% do Kong.

---

## 4. Stack Compartilhada

**Todos os serviços:**
- NestJS 11 + Fastify + TypeScript 5
- `@adatechnology/auth-keycloak` — leitura de headers do Kong
- `@adatechnology/logger` — logs estruturados JSON
- `@adatechnology/http-client` — HTTP client interno

| Componente | API | BFF | Worker | Cron |
|---|---|---|---|---|
| Banco primário | PostgreSQL 16 | MongoDB 7 | PostgreSQL 16 | PostgreSQL 16 |
| Cache | Redis 7 | Redis 7 | — | — |
| Queue | RabbitMQ (producer) | — | RabbitMQ (consumer) | RabbitMQ (producer) |
| ORM/ODM | TypeORM | Mongoose | TypeORM | TypeORM |
| Storage | MinIO | — | — | — |
| WebSocket | — | socket.io | — | — |
| Scheduler | — | — | — | `@nestjs/schedule` |

---

## 5. Infraestrutura Compartilhada

| Serviço | Versão | Porta | Finalidade |
|---|---|---|---|
| Kong | 3.6 | 8000 / 8001 | Gateway, validação JWT, rate limit, CORS |
| Keycloak | 24 | 8080 | Identity Provider, emissão JWT |
| PostgreSQL | 16 | 5432 | Banco principal de negócio |
| MongoDB | 7 | 27017 | BFF: chat, notificações in-app |
| Redis | 7 | 6379 | Cache + Pub/Sub WebSocket |
| RabbitMQ | 3.13 | 5672 / 15672 | Message broker assíncrono |
| MinIO | latest | 9000 / 9001 | Object storage para documentos e fotos |

---

## 6. Specs Detalhados por Aplicação

| Arquivo | Conteúdo |
|---|---|
| [SPEC-API.md](./SPEC-API.md) | Módulos, endpoints, use cases, eventos, convenções da API |
| [SPEC-BFF.md](./SPEC-BFF.md) | Módulos, endpoints, WebSocket, MongoDB, cache, convenções do BFF |
| [SPEC-WORKER.md](./SPEC-WORKER.md) | Filas, handlers, retry strategy, templates, convenções do Worker |
| [SPEC-CRON.md](./SPEC-CRON.md) | Jobs, schedules, algoritmos, variáveis, convenções do Cron |

---

## 7. Domínio de Negócio (visão geral)

### Máquinas de Estado

**User:** `PENDING → ACTIVE → BLOCKED → DELETED`

**Provider Verification:** `PENDING → UNDER_REVIEW → APPROVED | REJECTED`

**Service Request:** `PENDING → ACCEPTED | REJECTED → IN_PROGRESS → COMPLETED | CANCELLED`

**Document:** `PENDING → APPROVED | REJECTED`

### Regras Críticas

1. Contratante só pode solicitar serviço a prestadores com verification `APPROVED`.
2. Review só pode ser criada quando service_request está `COMPLETED`.
3. Apenas 1 review por service_request.
4. Service request `ACCEPTED` só pode ser cancelado pelo contratante.
5. `average_rating` é recalculado diariamente pelo Cron (não em tempo real).
6. Cache explícito: invalidado pelo controller após mutação, nunca automático.
7. Nenhum endpoint sem JWT (exceto `GET /health` e `POST /users`).

---

## 8. Roteamento Kong

| Path | Destino | Observação |
|---|---|---|
| `/api/v1/*` | Backend API :3000 | Domínio, escrita, leitura |
| `/bff/*` | Backend BFF :3001 | Agregação, dashboards |
| `/bff/chat` (WS) | Backend BFF :3001 | WebSocket upgrade |

**Plugins:** `openid-connect`, `rate-limiting`, `cors`, `request-transformer` (remove `Authorization` antes de encaminhar)

---

## 9. Roadmap de Implementação

| Fase | Serviço | Status |
|---|---|---|
| 0 — Infra base | `domestic-backend-api` | ✅ Concluída |
| 1 — Domain modules | `domestic-backend-api` | ✅ Concluída (todos os módulos MVP) |
| 2 — Async processing | `domestic-backend-worker` | Pendente |
| 3 — Scheduled jobs | `domestic-backend-cron` | Pendente |
| 4 — Frontend layer | `domestic-backend-bff` | Pendente |
| 5 — Gateway + Auth config | Kong + Keycloak + docker-compose | Pendente |

---

## 10. Decisões de Arquitetura

| Decisão | Escolha | Motivo |
|---|---|---|
| Auth | Keycloak + Kong | Centralizado, sem validação duplicada nos serviços |
| ORM | TypeORM | Code-first migrations, já adotado |
| Queue | RabbitMQ | DLQ nativo, multi-consumer, mais robusto que BullMQ em produção |
| BFF DB | MongoDB | Document-oriented ideal para chat e histórico |
| Cache | Redis | Já adotado, suporta Pub/Sub para WebSocket |
| Storage | MinIO | S3-compatible, self-hosted para MVP |
| Push | Firebase FCM | iOS + Android, SDK maduro |
| Cron separado | Repo próprio | Deploy e escala independentes da API |

---

## 11. Fora do Escopo do MVP

- Pagamentos (Mercado Pago / Stripe)
- OCR automático de documentos
- App mobile nativo
- Planos premium e destaques
- IA para matching
- Avaliação bidirecional (prestador avalia contratante)
- Relatórios financeiros
- Multi-tenant
