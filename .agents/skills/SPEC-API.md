---
**Versão:** 2.0
**Data:** 04/04/2026
**Repositório:** `domestic-backend-api`
**Porta:** 3333
**Status atual:** ✅ Todos os módulos MVP implementados. Cobertura de testes ≥ 50%.

> Spec master (arquitetura geral, domínio, infra): [SPEC.md](./SPEC.md)

---

## 1. Responsabilidade

O Backend API é o **core de negócio** da plataforma. Ele:

- Expõe endpoints REST para todas as operações de domínio (criação, atualização, leitura, deleção)
- Aplica todas as regras de negócio
- Persiste dados no PostgreSQL via TypeORM
- Publica eventos de domínio no RabbitMQ para consumo assíncrono (Worker e Cron)
- Invalida cache no Redis após mutações
- Faz upload de arquivos no MinIO

O API **não** agrega dados para telas, **não** gerencia chat, **não** envia e-mails ou push diretamente.

---

## 2. Stack

| Componente | Tecnologia |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | NestJS 11 + Fastify |
| Linguagem | TypeScript 5 |
| Banco | PostgreSQL 16 + TypeORM |
| Cache | Redis 7 (`@adatechnology/cache`) |
| Queue | RabbitMQ 3.13 (`@golevelup/nestjs-rabbitmq`) |
| Auth | Keycloak via headers do Kong (`@adatechnology/auth-keycloak`) |
| Storage | MinIO S3-compatible |
| Docs | Swagger + Redoc (`@nestjs/swagger`) |
| Logger | `@adatechnology/logger` |
| HTTP Client | `@adatechnology/http-client` |
| Validação | `class-validator` + `class-transformer` |

---

## 3. Estrutura de Diretórios

```
src/
├── config/
│   ├── env.validation.ts         # Joi schema — fonte da verdade de env vars
│   ├── database-config.ts
│   ├── keycloak.config.ts
│   └── swagger.config.ts
├── modules/
│   ├── user/                     # Users, Emails, Phones, Addresses
│   ├── provider/                 # Provider Profiles, Services, Work Locations
│   ├── category/                 # Catálogo de Categorias
│   ├── service/                  # Catálogo de Serviços
│   ├── service-request/          # Agendamentos e Fluxo de Serviço
│   ├── review/                   # Avaliações
│   ├── document/                 # Upload e Auditoria de Docs
│   ├── notification/             # Apenas leitura in-app (MongoDB)
│   ├── shared/                   # Infra compartilhada (DB, Queue, etc)
│   │   └── providers/
│   │       └── database/
│   │           ├── entities/
│   │           ├── migrations/
│   │           └── repositories/
│   ├── error/                    # Tratamento global de erros
│   └── health/                   # Liveness/Readiness checks
└── main.ts
```

### Padrão por módulo

```
<module>/
├── <module>.module.ts
├── <module>.controller.ts
├── <module>.controller.unit.spec.ts
├── <module>.service.ts
├── <module>.service.unit.spec.ts
├── <module>.token.ts                      # Symbol tokens DI
├── <module>.repository.interface.ts
├── <module>.repository.ts                 # Implementação TypeORM
├── <module>.repository.unit.spec.ts
├── use-cases/
    └── <action>/
        ├── <action>.use-case.ts
        ├── <action>.use-case.unit.spec.ts
        ├── <action>.interface.ts          # Input/Output types
        └── dtos/
            ├── <action>-request.dto.ts
            └── <action>-response.dto.ts
```

### Regras de DI

- Repositórios e Use Cases são **sempre** injetados por `Symbol` token (definido em `*.token.ts`)
- Nunca injetar implementações concretas diretamente
- Módulos declaram seus providers com `provide: TOKEN, useClass: Implementation`

---

## 4. Variáveis de Ambiente

Todas validadas pelo Joi schema em `src/config/env.validation.ts`.

```env
NODE_ENV=development
PORT=3333

# PostgreSQL
DATABASE_POSTGRES_HOST=localhost
DATABASE_POSTGRES_PORT=5432
DATABASE_POSTGRES_NAME=backend_database_postgres
DATABASE_POSTGRES_USER=postgres
DATABASE_POSTGRES_PASSWORD=postgres
DATABASE_POSTGRES_SYNCHRONIZE=false

# MongoDB (notificações in-app)
DATABASE_MONGO_HOST=localhost
DATABASE_MONGO_PORT=27017
DATABASE_MONGO_NAME=backend_database_mongo
DATABASE_MONGO_USERNAME=mongo
DATABASE_MONGO_PASSWORD=mongo

# Redis
CACHE_REDIS_HOST=localhost
CACHE_REDIS_PORT=6379
CACHE_REDIS_PASSWORD=

# RabbitMQ
RABBITMQ_URL=amqp://zolve:zolve123@localhost:5672
RABBITMQ_EXCHANGE=zolve.events

# Keycloak
KEYCLOAK_BASE_URL=http://localhost:8081
KEYCLOAK_REALM=BACKEND
KEYCLOAK_CLIENT_ID=backend-api
KEYCLOAK_CLIENT_SECRET=backend-api-secret
```

---

## 5. Autenticação e Autorização

O API **não** valida tokens JWT. Ele confia nos headers injetados pelo Kong:

| Header | Tipo | Descrição |
|---|---|---|
| `X-User-Id` | string (UUID) | keycloak_id do usuário autenticado |
| `X-User-Roles` | string (CSV) | ex: `admin,customer` |
| `X-User-Type` | string | `CUSTOMER` \| `PROVIDER` \| `ADMIN` |

**Guards disponíveis:**
- `@Roles('admin')` — verifica X-User-Roles
- `@AuthUser()` decorator — extrai X-User-Id do request

---

## 6. Módulos

### 6.1 `user`

**Status:** Concluído.

#### Use Cases

| Use Case | Status | Descrição |
|---|---|---|
| `UserCreateUseCase` | ✅ | Cria usuário com `fullName` e `keycloakId` |
| `UserGetByIdUseCase` | ✅ | Busca por ID interno |
| `UserGetByKeycloakIdUseCase` | ✅ | Busca por keycloak_id (header X-User-Id) |
| `UserUpdateUseCase` | ✅ | Atualiza `fullName` e `status` |
| `UserDeleteUseCase` | ✅ | Soft delete: status → DELETED |
| `AddUserAddressUseCase` | ✅ | Vincula endereço via `user_addresses` |
| `RemoveUserAddressUseCase` | ✅ | Remove vínculo de endereço |
| `ListUserAddressesUseCase` | ✅ | Lista endereços do usuário |
| `GetUserStatsUseCase` | ✅ | Conta total de usuários, clientes e prestadores |

#### Endpoints

| Método | Rota | Role | Descrição |
|---|---|---|---|
| POST | `/users` | Público | Registro inicial |
| GET | `/users/me` | Autenticado | Perfil próprio (via X-User-Id) |
| GET | `/users/:id` | admin | Busca por ID |
| PUT | `/users/:id` | Autenticado (próprio) | Atualiza dados básicos |
| DELETE | `/users/:id` | admin | Soft delete |
| GET | `/users/admin/stats` | admin | Dashboard de contagem |
| GET | `/users/me/addresses` | Autenticado | Lista meus endereços |
| POST | `/users/me/addresses` | Autenticado | Adiciona endereço |
| DELETE | `/users/me/addresses/:addressId` | Autenticado | Remove endereço |

#### DTOs principais

**POST /users — Request:**
```json
{
  "fullName": "Anderson Silva",
  "keycloakId": "uuid-do-keycloak",
  "status": "PENDING"
}
```

**GET /users/admin/stats — Response:**
```json
{
  "totalUsers": 150,
  "customers": 120,
  "providers": 30
}
```

---

### 6.2 `provider`

**Status:** ✅ Concluído.

#### Use Cases

| Use Case | Status | Descrição |
|---|---|---|
| `ProviderCreateUseCase` | ✅ | Cria perfil de prestador a partir de um `user_id` |
| `ProviderGetByIdUseCase` | ✅ | Busca perfil com serviços e rating |
| `ProviderListUseCase` | ✅ | Lista com filtros paginados (somente APPROVED) |
| `ProviderUpdateUseCase` | ✅ | Atualiza `description`, `businessName`, `isAvailable` |
| `ProviderAddServiceUseCase` | ✅ | Vincula serviço do catálogo com `priceBase` e `priceType` |
| `ProviderRemoveServiceUseCase` | ✅ | Remove vínculo de serviço |
| `ProviderAddWorkLocationUseCase` | ✅ | Adiciona local de atendimento |
| `ProviderRemoveWorkLocationUseCase` | ✅ | Remove local de atendimento |
| `ProviderSubmitVerificationUseCase` | ✅ | Inicia auditoria: status PENDING → UNDER_REVIEW |
| `ProviderGetVerificationUseCase` | ✅ | Retorna status e histórico de verificação |
| `ProviderListPendingUseCase` | ✅ | Admin: lista prestadores aguardando aprovação |
| `ProviderApproveUseCase` | ✅ | Admin: aprova + publica `provider.approved` |
| `ProviderRejectUseCase` | ✅ | Admin: rejeita com motivo + publica `provider.rejected` |

#### Endpoints

| Método | Rota | Role | Descrição |
|---|---|---|---|
| POST | `/providers` | PROVIDER | Cria perfil |
| GET | `/providers` | Público | Lista aprovados |
| GET | `/providers/:id` | Público | Perfil completo |
| PUT | `/providers/:id` | PROVIDER (próprio) | Atualiza |
| GET | `/providers/:id/services` | Público | Serviços do prestador |
| POST | `/providers/:id/services` | PROVIDER (próprio) | Adiciona serviço |
| DELETE | `/providers/:id/services/:serviceId` | PROVIDER (próprio) | Remove serviço |
| GET | `/providers/:id/work-locations` | Público | Locais de atendimento |
| POST | `/providers/:id/work-locations` | PROVIDER (próprio) | Adiciona local |
| DELETE | `/providers/:id/work-locations/:locationId` | PROVIDER (próprio) | Remove local |
| POST | `/providers/:id/verification` | PROVIDER (próprio) | Submete para verificação |
| GET | `/providers/:id/verification` | PROVIDER + admin | Status e histórico |
| PUT | `/providers/:id/verification/approve` | admin | Aprova prestador |
| PUT | `/providers/:id/verification/reject` | admin | Rejeita com motivo |
| GET | `/providers/admin/pending` | admin | Lista aguardando aprovação |

#### Eventos RabbitMQ publicados

| Evento | Routing Key | Payload |
|---|---|---|
| Prestador aprovado | `provider.approved` | `{ provider_id, user_id, email }` |
| Prestador rejeitado | `provider.rejected` | `{ provider_id, user_id, email, reason }` |

---

### 6.3 `category`

**Status:** ✅ Concluído.

#### Use Cases

| Use Case | Status | Descrição |
|---|---|---|
| `CategoryListUseCase` | ✅ | Lista ativas (Redis cache TTL 5min, chave `api:categories`) |
| `CategoryGetByIdUseCase` | ✅ | Busca por ID |
| `CategoryCreateUseCase` | ✅ | Admin: cria + invalida cache |
| `CategoryUpdateUseCase` | ✅ | Admin: atualiza + invalida cache |
| `CategoryDeleteUseCase` | ✅ | Admin: soft delete (is_active = false) + invalida cache |

#### Endpoints

| Método | Rota | Role | Descrição |
|---|---|---|---|
| GET | `/categories` | Público | Lista ativas (cacheado) |
| GET | `/categories/:id` | Público | Detalhe |
| POST | `/categories` | admin | Cria categoria |
| PUT | `/categories/:id` | admin | Atualiza |
| DELETE | `/categories/:id` | admin | Remove |

---

### 6.4 `service`

**Status:** ✅ Concluído.

#### Use Cases

| Use Case | Status | Descrição |
|---|---|---|
| `ServiceListUseCase` | ✅ | Lista todos ou filtra por `categoryId` |
| `ServiceGetByIdUseCase` | ✅ | Detalhe |
| `ServiceCreateUseCase` | ✅ | Admin: cria (valida categoria) |
| `ServiceUpdateUseCase` | ✅ | Admin: atualiza (valida categoria se alterada) |

#### Endpoints

| Método | Rota | Role | Descrição |
|---|---|---|---|
| GET | `/services` | Público | Lista (query `categoryId` opcional) |
| GET | `/services/:id` | Público | Detalhe |
| POST | `/services` | admin | Cria |
| PUT | `/services/:id` | admin | Atualiza |

---

### 6.5 `service-request`

**Status:** ✅ Concluído.

#### Use Cases

| Use Case | Status | Descrição |
|---|---|---|
| `ServiceRequestCreateUseCase` | ✅ | Valida provider APPROVED → cria → publica `service_request.created` |
| `ServiceRequestGetByIdUseCase` | ✅ | Detalhe (somente participantes ou admin) |
| `ServiceRequestListByUserUseCase` | ✅ | Lista do contratante autenticado |
| `ServiceRequestListByProviderUseCase` | ✅ | Lista do prestador autenticado |
| `ServiceRequestAcceptUseCase` | ✅ | Prestador aceita: PENDING → ACCEPTED |
| `ServiceRequestRejectUseCase` | ✅ | Prestador rejeita: PENDING → REJECTED |
| `ServiceRequestCompleteUseCase` | ✅ | Contratante confirma: ACCEPTED → COMPLETED + publica `service_request.completed` |
| `ServiceRequestCancelUseCase` | ✅ | Contratante cancela (PENDING ou ACCEPTED) → CANCELLED |

#### Endpoints

| Método | Rota | Role | Descrição |
|---|---|---|---|
| POST | `/service-requests` | CUSTOMER | Cria solicitação |
| GET | `/service-requests` | Autenticado | Lista |
| GET | `/service-requests/:id` | Autenticado (participante) | Detalhe |
| PUT | `/service-requests/:id/accept` | PROVIDER (próprio) | Aceita |
| PUT | `/service-requests/:id/reject` | PROVIDER (próprio) | Rejeita |
| PUT | `/service-requests/:id/complete` | CUSTOMER (próprio) | Confirma conclusão |
| PUT | `/service-requests/:id/cancel` | CUSTOMER (próprio) | Cancela |

---

### 6.6 `review`

**Status:** ✅ Concluído.

#### Use Cases

| Use Case | Status | Descrição |
|---|---|---|
| `ReviewCreateUseCase` | ✅ | Valida service_request COMPLETED + unicidade → cria |
| `ReviewListByProviderUseCase` | ✅ | Lista reviews de um prestador |

#### Endpoints

| Método | Rota | Role | Descrição |
|---|---|---|---|
| POST | `/reviews` | CUSTOMER | Cria avaliação |
| GET | `/reviews/provider/:providerId` | Público | Lista reviews |

---

### 6.7 `document`

**Status:** ✅ Concluído.

#### Use Cases

| Use Case | Status | Descrição |
|---|---|---|
| `DocumentUploadUseCase` | ✅ | Upload multipart → MinIO (bucket `documents`) → persiste metadata |
| `DocumentGetUrlUseCase` | ✅ | Gera URL assinada (TTL 15min) via MinIO |
| `DocumentApproveUseCase` | ✅ | Admin: PENDING → APPROVED |
| `DocumentRejectUseCase` | ✅ | Admin: PENDING → REJECTED |

#### Endpoints

| Método | Rota | Role | Descrição |
|---|---|---|---|
| POST | `/documents` | PROVIDER | Upload |
| GET | `/documents/:id/url` | admin + PROVIDER (próprio) | URL assinada (TTL 15min) |
| PUT | `/documents/:id/approve` | admin | Aprova |
| PUT | `/documents/:id/reject` | admin | Rejeita |

---

### 6.8 `notification`

**Status:** ✅ Concluído.

#### Endpoints

| Método | Rota | Role | Descrição |
|---|---|---|---|
| GET | `/notifications` | Autenticado | Lista |
| PUT | `/notifications/:id/read` | Autenticado | Marca como lida |

---

## 7. Eventos RabbitMQ (resumo)

| Routing Key | Publicado em | Consumido pelo |
|---|---|---|
| `provider.approved` | `ProviderApproveUseCase` | Worker |
| `provider.rejected` | `ProviderRejectUseCase` | Worker |
| `service_request.created` | `ServiceRequestCreateUseCase` | Worker |
| `service_request.completed` | `ServiceRequestCompleteUseCase` | Worker |

**Exchange:** `zolve.events` (topic, durable)

---

## 8. Convenções

- **Padrão:** `Controller → Service → UseCase → Repository → Database`
- **Tokens DI:** `Symbol` tokens em `*.token.ts`.
- **Erros:** `AppErrorFactory` → `AppError`.
- **Naming:** kebab-case arquivos, PascalCase classes, camelCase métodos/variáveis.

---

## 9. Roadmap — Backend API

### Sprint 1.1 — Usuário e Catálogo ✅ Concluída
- [x] CRUD básico de Usuário
- [x] Endpoints de Endereço no `UserController`
- [x] Endpoint `admin/stats` para contagem de perfis
- [x] Módulo `category` completo (CRUD + cache Redis TTL 5min)
- [x] Módulo `service` completo (CRUD + filtro por categoryId)

### Sprint 1.2 — Prestador ✅ Concluída
- [x] Módulo `provider` — CRUD + serviços + locais de atendimento
- [x] Fluxo de verificação + eventos RabbitMQ (`provider.approved`, `provider.rejected`)
- [x] Módulo `document` — upload MinIO + URL assinada + approve/reject admin

### Sprint 1.3 — Transações e Avaliações ✅ Concluída
- [x] Módulo `service-request` completo (8 use cases + eventos RabbitMQ)
- [x] Módulo `review` (validação COMPLETED + unicidade)
- [x] Módulo `notification` — leitura in-app (MongoDB)

### Milestone 2 — Qualidade ✅ Concluída (parcial)
- [x] Cobertura de testes ≥ 50% (atual: ~53% statements, ~79% funções)
- [ ] Testes E2E para módulos novos (provider, service-request, review, document)
- [ ] Swagger com exemplos completos em todos os endpoints
