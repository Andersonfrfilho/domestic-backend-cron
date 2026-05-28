# SPEC — Backend BFF (`domestic-backend-bff`)

**Versão:** 1.0
**Data:** 04/04/2026
**Repositório:** `domestic-backend-bff`
**Porta:** 3001
**Status:** Repositório não criado

> Spec master (arquitetura geral, domínio, infra): [SPEC.md](./SPEC.md)

---

## 1. Responsabilidade

O Backend BFF (Backend for Frontend) é a camada entre o frontend e os serviços internos. Ele:

- **Agrega** dados do Backend API em chamadas otimizadas para cada tela (menos round-trips)
- **Cacheia** leituras frequentes no Redis para reduzir carga no API
- **Gerencia** chat em tempo real via WebSocket (socket.io + Redis Pub/Sub + MongoDB)
- **Persiste** histórico de chat e notificações in-app no MongoDB
- **Formata** respostas otimizadas para o frontend (nunca expõe estrutura interna do domínio)

O BFF **não** aplica regras de negócio, **não** escreve diretamente no PostgreSQL, **não** publica eventos no RabbitMQ.

---

## 2. Stack

| Componente | Tecnologia |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | NestJS 11 + Fastify |
| Linguagem | TypeScript 5 |
| Banco | MongoDB 7 + Mongoose |
| Cache | Redis 7 (`@adatechnology/cache` + ioredis) |
| WebSocket | `@nestjs/websockets` + socket.io |
| HTTP Client | `@adatechnology/http-client` (calls para Backend API) |
| Auth | Keycloak via headers do Kong |
| Logger | `@adatechnology/logger` |
| Docs | Swagger + Redoc |

---

## 3. Estrutura de Diretórios

```
src/
├── config/
│   ├── env.validation.ts
│   ├── mongo.config.ts
│   ├── redis.config.ts
│   └── api-client.config.ts
├── modules/
│   ├── home/              # Tela inicial: categorias + destaques
│   ├── search/            # Busca de prestadores
│   ├── provider-profile/  # Perfil completo agregado
│   ├── dashboard/         # Dashboards contractor/provider
│   ├── chat/              # Chat em tempo real
│   ├── notification/      # Proxy de notificações
│   ├── shared/
│   │   ├── api-client/    # HTTP client para Backend API
│   │   ├── cache/         # Redis helpers
│   │   └── mongo/         # Mongoose connection
│   └── health/
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
├── <module>.gateway.ts       # Somente módulo chat (WebSocket)
├── <module>.token.ts
├── schemas/                  # Mongoose schemas (somente módulos com MongoDB)
│   └── <entity>.schema.ts
└── dtos/
    ├── <action>-request.dto.ts
    └── <action>-response.dto.ts
```

---

## 4. Variáveis de Ambiente

```env
NODE_ENV=development
PORT=3001

# MongoDB
MONGO_URI=mongodb://localhost:27017/zolve-bff

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Backend API (interno — não passa pelo Kong)
API_BASE_URL=http://localhost:3000
API_TIMEOUT_MS=5000

# WebSocket
WS_CORS_ORIGINS=http://localhost:3000,http://localhost:4200

# Keycloak (para validação local sem Kong)
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=zolve
KEYCLOAK_CLIENT_ID=zolve-bff
KEYCLOAK_CLIENT_SECRET=

# Cache TTLs (segundos)
CACHE_TTL_HOME=300
CACHE_TTL_SEARCH=120
CACHE_TTL_PROVIDER_PROFILE=180
CACHE_TTL_DASHBOARD=60
```

---

## 5. Autenticação

Headers injetados pelo Kong (mesma regra da API):

| Header | Descrição |
|---|---|
| `X-User-Id` | keycloak_id do usuário |
| `X-User-Roles` | CSV de roles |
| `X-User-Type` | tipo do usuário |

**WebSocket:** Autenticação no handshake via query param `?token=<JWT>` ou header `Authorization`. O BFF extrai o `X-User-Id` do JWT localmente (somente para o namespace WebSocket).

---

## 6. Módulos

### 6.1 `home`

**Rota:** `GET /bff/home`
**Auth:** Opcional (funciona sem token, retorna dados públicos)
**Cache:** Redis, TTL 5min, chave `bff:home`

**Comportamento:** Retorna os dados necessários para renderizar a tela inicial.

**Fontes (chamadas internas):**
- `GET /api/v1/categories` → categorias ativas
- `GET /api/v1/providers?sort=rating&limit=10&available=true` → destaque

**Response:**
```json
{
  "featured_categories": [
    {
      "id": "uuid",
      "name": "Limpeza",
      "slug": "limpeza",
      "icon_url": "https://..."
    }
  ],
  "featured_providers": [
    {
      "id": "uuid",
      "business_name": "Serviços da Maria",
      "average_rating": 4.8,
      "review_count": 42,
      "services": ["Diária", "Faxina"],
      "city": "Franca",
      "state": "SP",
      "is_available": true
    }
  ]
}
```

---

### 6.2 `search`

**Rota:** `GET /bff/search`
**Auth:** Opcional
**Cache:** Redis, TTL 2min, chave `bff:search:<sha256-dos-query-params>`

**Query params:**

| Param | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `category_id` | UUID | Não | Filtro por categoria |
| `city` | string | Não | Filtro por cidade |
| `state` | string (UF) | Não | Filtro por estado |
| `rating_min` | number (1-5) | Não | Rating mínimo |
| `available` | boolean | Não | Somente disponíveis |
| `page` | number | Não (default: 1) | Paginação |
| `limit` | number | Não (default: 20) | Itens por página |

**Fontes:** `GET /api/v1/providers?<filtros>` (agrega dados de serviços da mesma resposta)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "business_name": "Serviços da Maria",
      "average_rating": 4.8,
      "review_count": 42,
      "services": [
        { "name": "Diária", "price_base": 150.00, "price_type": "POR_DIA" }
      ],
      "work_locations": [
        { "city": "Franca", "state": "SP" }
      ],
      "is_available": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

---

### 6.3 `provider-profile`

**Rota:** `GET /bff/providers/:id/profile`
**Auth:** Opcional
**Cache:** Redis, TTL 3min, chave `bff:provider-profile:<id>`

**Fontes (chamadas em paralelo):**
- `GET /api/v1/providers/:id`
- `GET /api/v1/reviews/provider/:id?limit=5&sort=created_at`

**Response:**
```json
{
  "id": "uuid",
  "business_name": "Serviços da Maria",
  "description": "Profissional com 10 anos de experiência...",
  "average_rating": 4.8,
  "review_count": 42,
  "is_available": true,
  "verification_status": "APPROVED",
  "services": [
    {
      "id": "uuid",
      "name": "Diária",
      "category": { "id": "uuid", "name": "Limpeza" },
      "price_base": 150.00,
      "price_type": "POR_DIA"
    }
  ],
  "work_locations": [
    { "city": "Franca", "state": "SP", "is_primary": true }
  ],
  "recent_reviews": [
    {
      "rating": 5,
      "comment": "Excelente profissional!",
      "contractor_name": "Anderson S.",
      "service_name": "Diária",
      "created_at": "2026-03-15"
    }
  ]
}
```

---

### 6.4 `dashboard`

**Auth:** Obrigatório

#### Dashboard do Contratante

**Rota:** `GET /bff/dashboard/contractor`
**Cache:** Redis, TTL 1min, chave `bff:dashboard:contractor:<user_id>`

**Fontes (em paralelo):**
- `GET /api/v1/service-requests?status=PENDING,ACCEPTED`
- `GET /api/v1/service-requests?status=COMPLETED,CANCELLED&limit=5`
- `GET /api/v1/notifications/unread-count`

**Response:**
```json
{
  "active_requests": [
    {
      "id": "uuid",
      "status": "ACCEPTED",
      "provider_name": "Serviços da Maria",
      "service_name": "Diária",
      "scheduled_at": "2026-04-10T14:00:00Z"
    }
  ],
  "pending_requests": [...],
  "recent_history": [...],
  "unread_notifications": 3
}
```

#### Dashboard do Prestador

**Rota:** `GET /bff/dashboard/provider`
**Cache:** Redis, TTL 1min, chave `bff:dashboard:provider:<user_id>`

**Fontes (em paralelo):**
- `GET /api/v1/service-requests?status=PENDING` (solicitações a responder)
- `GET /api/v1/service-requests?status=ACCEPTED,IN_PROGRESS`
- `GET /api/v1/providers/:id` (rating e status de verificação)
- `GET /api/v1/notifications/unread-count`

**Response:**
```json
{
  "incoming_requests": [
    {
      "id": "uuid",
      "status": "PENDING",
      "contractor_name": "Anderson Silva",
      "service_name": "Diária",
      "scheduled_at": "2026-04-10T14:00:00Z",
      "description": "Faxina completa de 4 cômodos"
    }
  ],
  "active_requests": [...],
  "average_rating": 4.8,
  "review_count": 42,
  "verification_status": "APPROVED",
  "unread_notifications": 1
}
```

---

### 6.5 `chat`

#### 6.5.1 REST Endpoints

**Auth:** Obrigatório

| Método | Rota | Descrição |
|---|---|---|
| POST | `/bff/chat/rooms` | Cria sala vinculada a `service_request_id` |
| GET | `/bff/chat/rooms` | Lista salas do usuário autenticado |
| GET | `/bff/chat/rooms/:roomId` | Detalhe da sala |
| GET | `/bff/chat/rooms/:roomId/messages` | Histórico paginado (query: `page`, `limit`) |

**POST /bff/chat/rooms — Request:**
```json
{ "service_request_id": "uuid" }
```

**GET /bff/chat/rooms — Response:**
```json
[
  {
    "id": "ObjectId",
    "service_request_id": "uuid",
    "other_participant": {
      "id": "uuid",
      "name": "Serviços da Maria",
      "type": "provider"
    },
    "last_message_preview": "Estarei às 14h conforme combinado.",
    "last_message_at": "2026-04-04T11:30:00Z",
    "unread_count": 2
  }
]
```

**GET /bff/chat/rooms/:roomId/messages — Response:**
```json
{
  "data": [
    {
      "id": "ObjectId",
      "sender_id": "uuid",
      "content": "Olá, confirmo o horário das 14h.",
      "read": true,
      "created_at": "2026-04-04T11:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 50, "total": 12 }
}
```

#### 6.5.2 WebSocket Gateway

**Namespace:** `/chat`
**Autenticação:** JWT no handshake via query `?token=<JWT>` ou header `Authorization`

**Eventos client → server:**

| Evento | Payload | Descrição |
|---|---|---|
| `join_room` | `{ room_id: string }` | Entra na sala e recebe mensagens em tempo real |
| `leave_room` | `{ room_id: string }` | Sai da sala |
| `send_message` | `{ room_id: string, content: string }` | Envia mensagem |
| `mark_read` | `{ room_id: string }` | Marca mensagens da sala como lidas |

**Eventos server → client:**

| Evento | Payload | Descrição |
|---|---|---|
| `message_received` | `{ id, room_id, sender_id, content, created_at }` | Nova mensagem na sala |
| `user_joined` | `{ room_id, user_id }` | Outro participante entrou |
| `user_left` | `{ room_id, user_id }` | Outro participante saiu |
| `messages_read` | `{ room_id, read_by }` | Confirmação de leitura |
| `error` | `{ code, message }` | Erro de validação/autorização |

#### 6.5.3 Fluxo de mensagem em tempo real

```
Cliente A envia send_message
  1. Gateway valida autenticação e participação na sala
  2. Persiste mensagem em MongoDB (chat_messages)
  3. Atualiza last_message_at e last_message_preview em chat_rooms
  4. Publica no Redis channel: chat:<room_id>
  5. Todos os nodes BFF subscribed recebem
  6. Emite message_received via socket.io para Cliente B
```

#### 6.5.4 Schemas MongoDB

**`chat_rooms`:**
```typescript
{
  service_request_id: String,  // UUID da solicitação vinculada
  contractor_id: String,       // UUID do contratante
  provider_id: String,         // UUID do prestador
  created_at: Date,
  last_message_at: Date,
  last_message_preview: String // truncado em 100 chars
}
```

**`chat_messages`:**
```typescript
{
  room_id: ObjectId,    // ref: chat_rooms
  sender_id: String,    // UUID do remetente
  content: String,
  read: Boolean,        // default: false
  created_at: Date
}
```

---

### 6.6 `notification`

**Responsabilidade:** Proxy para os endpoints do Backend API. O BFF não persiste notificações.

| Método | Rota BFF | Delega para |
|---|---|---|
| GET | `/bff/notifications` | `GET /api/v1/notifications` |
| GET | `/bff/notifications/unread-count` | `GET /api/v1/notifications/unread-count` |
| PUT | `/bff/notifications/:id/read` | `PUT /api/v1/notifications/:id/read` |
| PUT | `/bff/notifications/read-all` | `PUT /api/v1/notifications/read-all` |

---

## 7. Estratégia de Cache

| Módulo | Chave Redis | TTL | Invalidação |
|---|---|---|---|
| `home` | `bff:home` | 5min | Manual ou por expiração |
| `search` | `bff:search:<sha256-params>` | 2min | Por expiração |
| `provider-profile` | `bff:provider-profile:<id>` | 3min | Por expiração |
| `dashboard:contractor` | `bff:dashboard:contractor:<user_id>` | 1min | Por expiração |
| `dashboard:provider` | `bff:dashboard:provider:<user_id>` | 1min | Por expiração |

**Regra:** Cache de dashboard é curto (1min) para refletir mudanças frequentes de status. Cache de busca/perfil é médio (2-3min) pois muda com menos frequência.

---

## 8. Convenções

- **Serviços:** Orquestram chamadas HTTP paralelas (`Promise.all`) + Mongoose + Redis
- **HTTP Client:** Usar `@adatechnology/http-client` com timeout de `API_TIMEOUT_MS` (default: 5s)
- **Cache:** Prefixo `bff:<module>:<key>`. TTL definido na env. Sempre do tipo `try-cache-first`.
- **Respostas:** Sempre formatar para o cliente. Nunca expor IDs de banco, campos de auditoria (`created_by`, `reviewed_by`) ou estrutura interna.
- **WebSocket:** Um `gateway.ts` por namespace. Validar participação antes de entrar em qualquer sala.
- **MongoDB:** Schemas em `schemas/*.schema.ts`. Sempre usar índices para `room_id`, `sender_id`, `user_id`.
- **Testes unit:** `*.unit.spec.ts` ao lado do arquivo. Mockar API client, Redis, Mongoose.
- **Testes E2E:** `test/e2e/**/*.e2e.spec.ts` com MongoDB e Redis reais.
- **Naming:** kebab-case arquivos, PascalCase classes, camelCase métodos.

---

## 9. Roadmap — Backend BFF

- [ ] Setup do repositório (`npm init` + NestJS + Fastify)
- [ ] Módulo `shared`: MongoDB (Mongoose) + Redis + API HTTP client
- [ ] Módulo `health`
- [ ] Módulo `home` — endpoint + cache
- [ ] Módulo `search` — endpoint + cache
- [ ] Módulo `provider-profile` — endpoint + cache
- [ ] Módulo `dashboard` — contractor + provider
- [ ] Módulo `chat` — REST endpoints (rooms, messages)
- [ ] Módulo `chat` — WebSocket gateway + Redis Pub/Sub
- [ ] Módulo `notification` — proxy
- [ ] Testes E2E principais
