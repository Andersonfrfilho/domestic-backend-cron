# SPEC — Backend Worker (`domestic-backend-worker`)

**Versão:** 1.0
**Data:** 04/04/2026
**Repositório:** `domestic-backend-worker`
**Porta:** 3002 (somente health check)
**Status:** Repositório não criado

> Spec master (arquitetura geral, domínio, infra): [SPEC.md](./SPEC.md)

---

## 1. Responsabilidade

O Backend Worker processa todas as operações **assíncronas** da plataforma. Ele:

- Consome filas do RabbitMQ publicadas pelo Backend API e pelo Backend Cron
- Envia e-mails transacionais via SMTP/SendGrid
- Envia push notifications via Firebase FCM
- Atualiza registros no PostgreSQL após eventos de domínio (ex: rating após review)
- Persiste notificações in-app no MongoDB
- Processa aprovações e rejeições de prestadores

O Worker **não** expõe endpoints de negócio, **não** publica respostas para o frontend, **não** tem cache.

---

## 2. Stack

| Componente | Tecnologia |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | NestJS 11 + Fastify (somente health) |
| Linguagem | TypeScript 5 |
| Banco primário | PostgreSQL 16 + TypeORM |
| Banco secundário | MongoDB 7 + Mongoose (notificações in-app) |
| Queue | RabbitMQ 3.13 — consumer via `amqplib` ou `@nestjs-plus/rabbitmq` |
| E-mail | Nodemailer + SendGrid SMTP |
| Push | Firebase Admin SDK (FCM) |
| Logger | `@adatechnology/logger` |

---

## 3. Estrutura de Diretórios

```
src/
├── config/
│   ├── env.validation.ts
│   ├── database-config.ts
│   ├── rabbitmq.config.ts
│   ├── firebase.config.ts
│   └── smtp.config.ts
├── modules/
│   ├── provider-approval/     # Aprovação/rejeição de prestadores
│   ├── rating/                # Atualiza average_rating após review
│   ├── service-request/       # Notificações de solicitações
│   ├── email/                 # Envio de e-mails
│   ├── push/                  # Push notifications
│   ├── notification/          # Persiste notificações in-app no MongoDB
│   ├── shared/
│   │   ├── rabbitmq/          # Consumer base, ACK/NACK, retry
│   │   ├── postgres/          # TypeORM connection
│   │   ├── mongo/             # Mongoose connection
│   │   ├── email/             # Email client (Nodemailer)
│   │   └── firebase/          # Firebase Admin SDK
│   └── health/
└── main.ts
```

### Padrão por módulo

```
<module>/
├── <module>.module.ts
├── <module>.consumer.ts          # @RabbitMQHandler — entry point da mensagem
├── <module>.consumer.unit.spec.ts
├── <module>.handler.ts           # Lógica de processamento do evento
├── <module>.handler.unit.spec.ts
└── dtos/
    └── <event-name>.event.dto.ts  # Tipagem do payload da fila
```

---

## 4. Variáveis de Ambiente

```env
NODE_ENV=development
PORT=3002

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=zolve
POSTGRES_USER=zolve
POSTGRES_PASSWORD=zolve123

# MongoDB (notificações in-app)
MONGO_URI=mongodb://localhost:27017/zolve-bff

# RabbitMQ
RABBITMQ_URL=amqp://zolve:zolve123@localhost:5672
RABBITMQ_EXCHANGE=zolve.events
RABBITMQ_PREFETCH=10

# E-mail (SMTP via SendGrid)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<sendgrid_api_key>
SMTP_FROM_NAME=ZOLVE
SMTP_FROM_EMAIL=noreply@zolve.com.br

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=zolve-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@zolve-prod.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=<base64_encoded_private_key>

# Retry
WORKER_MAX_RETRIES=3
WORKER_RETRY_DELAY_MS=60000
WORKER_DLQ_ENABLED=true
```

---

## 5. Topologia de Filas RabbitMQ

### Exchange

```
Exchange: zolve.events
  Type: topic
  Durable: true
```

### Queues e Bindings

| Queue | Routing Key | Consumers | Descrição |
|---|---|---|---|
| `worker.provider.approval` | `provider.approved` | `ProviderApprovalConsumer` | Prestador aprovado |
| `worker.provider.approval` | `provider.rejected` | `ProviderApprovalConsumer` | Prestador rejeitado |
| `worker.rating` | `review.created` | `RatingConsumer` | Atualiza rating |
| `worker.service-requests` | `service_request.*` | `ServiceRequestConsumer` | Todos os eventos de SR |
| `worker.notifications` | `notifications.email` | `EmailConsumer` | Envio de e-mail |
| `worker.notifications` | `notifications.push` | `PushConsumer` | Push notification |

### Dead Letter Queue

```
Exchange: zolve.dlx
  Type: fanout
  Durable: true

Queue: worker.dlq
  Binding: zolve.dlx → worker.dlq
  x-message-ttl: 300000 (5min entre retries)
  x-max-length: 10000
```

### Estratégia de Retry

```
Mensagem falha
  → NACK (requeue: false)
  → Vai para zolve.dlx
  → TTL 1min → republica na fila original
  → Tentativas incrementadas no header x-retry-count
  → Após 3 tentativas: NACK final → worker.dlq permanente
  → Alerta logado com payload completo
```

---

## 6. Módulos

### 6.1 `provider-approval`

**Consumer:** Queue `worker.provider.approval`
**Routing keys:** `provider.approved`, `provider.rejected`

#### Handler de Aprovação (`provider.approved`)

1. Atualiza `provider_verifications.status` para `APPROVED` no PostgreSQL
2. Persiste log em `provider_verification_logs` (action: `APPROVED`, performed_by: system)
3. Publica mensagem `notifications.push` no RabbitMQ (fila `worker.notifications`)
4. Publica mensagem `notifications.email` no RabbitMQ (fila `worker.notifications`)

#### Handler de Rejeição (`provider.rejected`)

1. Atualiza `provider_verifications.status` para `REJECTED` no PostgreSQL
2. Persiste log em `provider_verification_logs` (action: `REJECTED`, notes: reason)
3. Publica mensagem `notifications.push` + `notifications.email`

#### Payload esperado

```typescript
interface ProviderApprovalEvent {
  provider_id: string;   // UUID do provider_profile
  user_id: string;       // UUID do user
  email: string;         // E-mail para envio
  fcm_token?: string;    // Token FCM para push (opcional)
  reason?: string;       // Somente em rejected
}
```

#### Idempotência

Verificar se o status atual já é `APPROVED`/`REJECTED` antes de atualizar. Se sim, ignorar a mensagem (log de warning).

---

### 6.2 `rating`

**Consumer:** Queue `worker.rating`
**Routing key:** `review.created`

#### Handler

1. Busca todas as reviews do `provider_id` no PostgreSQL
2. Calcula: `avg = SUM(rating) / COUNT(*)`, `count = COUNT(*)`
3. Atualiza `provider_profiles.average_rating` e `review_count` em uma única query

```sql
UPDATE provider_profiles
SET average_rating = (
  SELECT AVG(rating) FROM reviews WHERE provider_id = $1
),
review_count = (
  SELECT COUNT(*) FROM reviews WHERE provider_id = $1
)
WHERE id = $1
```

#### Payload esperado

```typescript
interface ReviewCreatedEvent {
  review_id: string;
  provider_id: string;
  rating: number; // 1-5
}
```

#### Idempotência

O cálculo é baseado em SELECT atual das reviews, então é naturalmente idempotente.

---

### 6.3 `service-request`

**Consumer:** Queue `worker.service-requests`
**Routing key:** `service_request.*`

#### Handlers por evento

| Evento | Para quem | Ação |
|---|---|---|
| `service_request.created` | Prestador | Push + e-mail "Nova solicitação recebida" |
| `service_request.accepted` | Contratante | Push + e-mail "Solicitação aceita" |
| `service_request.rejected` | Contratante | Push + e-mail "Solicitação recusada" |
| `service_request.completed` | Contratante + Prestador | Push para ambos "Serviço concluído — avalie!" |
| `service_request.cancelled` | Prestador | Push + e-mail "Solicitação cancelada" |

#### Payload esperado

```typescript
interface ServiceRequestEvent {
  event_type: 'created' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  request_id: string;
  provider_id: string;
  provider_user_id: string;
  provider_email: string;
  provider_fcm_token?: string;
  contractor_id: string;
  contractor_user_id: string;
  contractor_email: string;
  contractor_fcm_token?: string;
  service_name: string;
  scheduled_at?: string;  // ISO 8601
}
```

---

### 6.4 `email`

**Consumer:** Queue `worker.notifications` (routing key `notifications.email`)

#### Templates disponíveis

| Template ID | Assunto | Disparado por |
|---|---|---|
| `welcome` | Bem-vindo à ZOLVE! | Registro manual |
| `verify-email` | Confirme seu e-mail | Após cadastro |
| `service-request-received` | Nova solicitação de serviço | `service_request.created` |
| `service-request-accepted` | Sua solicitação foi aceita | `service_request.accepted` |
| `service-request-rejected` | Sua solicitação foi recusada | `service_request.rejected` |
| `service-request-completed` | Serviço concluído — avalie! | `service_request.completed` |
| `service-request-cancelled` | Solicitação cancelada pelo contratante | `service_request.cancelled` |
| `verification-approved` | Parabéns! Seu perfil foi verificado | `provider.approved` |
| `verification-rejected` | Ação necessária no seu cadastro | `provider.rejected` |
| `request-reminder` | Você tem uma solicitação pendente | Cron `RequestReminderJob` |

#### Localização dos templates

```
src/modules/email/templates/
├── welcome.hbs
├── verify-email.hbs
├── service-request-received.hbs
├── service-request-accepted.hbs
├── service-request-rejected.hbs
├── service-request-completed.hbs
├── service-request-cancelled.hbs
├── verification-approved.hbs
├── verification-rejected.hbs
└── request-reminder.hbs
```

Usar **Handlebars** (`.hbs`) para interpolação de variáveis.

#### Payload esperado

```typescript
interface EmailEvent {
  to: string;           // destinatário
  template_id: string;  // ID do template (ver tabela acima)
  variables: Record<string, string>;  // variáveis para o template
}
```

**Exemplo:**
```json
{
  "to": "anderson@email.com",
  "template_id": "service-request-received",
  "variables": {
    "provider_name": "Serviços da Maria",
    "contractor_name": "Anderson Silva",
    "service_name": "Diária",
    "scheduled_at": "10/04/2026 às 14h00",
    "request_url": "https://app.zolve.com.br/requests/uuid"
  }
}
```

#### Retry específico para e-mail

- Erro 4xx (e-mail inválido): NACK sem retry, log de erro
- Erro 5xx (servidor SMTP): retry normal (3x com backoff)
- Timeout: retry normal

---

### 6.5 `push`

**Consumer:** Queue `worker.notifications` (routing key `notifications.push`)
**SDK:** Firebase Admin SDK (FCM)

#### Payload esperado

```typescript
interface PushEvent {
  user_id: string;
  fcm_token?: string;   // Token do dispositivo (se disponível)
  title: string;
  body: string;
  data?: Record<string, string>;  // Dados para deep link no app
}
```

**Exemplo:**
```json
{
  "user_id": "uuid",
  "fcm_token": "fcm-device-token-aqui",
  "title": "Nova solicitação de serviço",
  "body": "Anderson Silva solicitou Diária para 10/04 às 14h",
  "data": {
    "type": "service_request",
    "request_id": "uuid",
    "action": "view_request"
  }
}
```

#### Comportamento quando sem FCM token

Se `fcm_token` não está disponível: logar warning e não tentar enviar. O e-mail complementa o push.

---

### 6.6 `notification`

**Responsabilidade:** Persiste notificações in-app no MongoDB após qualquer evento relevante. Chamado pelos outros handlers após seus processos principais.

#### Schema MongoDB — `notifications`

```typescript
{
  user_id: String,          // UUID do usuário destinatário
  type: String,             // IN_APP | EMAIL | PUSH
  message: String,          // Texto da notificação
  read: Boolean,            // default: false
  metadata: {
    event_type: String,     // ex: 'service_request.accepted'
    entity_id: String,      // UUID da entidade relacionada
    entity_type: String,    // ex: 'service_request', 'provider'
  },
  created_at: Date,
  updated_at: Date
}
```

**Índices:** `user_id + read` (para listagem rápida de não lidas), `user_id + created_at` (para paginação).

#### Payload esperado

```typescript
interface NotificationPersistEvent {
  user_id: string;
  message: string;
  metadata: {
    event_type: string;
    entity_id: string;
    entity_type: string;
  };
}
```

---

## 7. Convenções

- **Consumer:** Uma classe por tipo de fila. Método `handle(payload)` como entry point.
- **Idempotência:** Todo handler deve ser seguro de re-executar. Verificar estado atual antes de atualizar.
- **ACK/NACK:**
  - Sucesso → `channel.ack(msg)`
  - Erro recuperável (timeout, 5xx) → `channel.nack(msg, false, false)` → vai para DLX
  - Erro não recuperável (dado inválido) → `channel.ack(msg)` + log de erro (não tentar de novo)
- **Logging:** Log de início, fim e resultado de cada mensagem processada com `message_id` e payload.
- **Não lançar exceções não tratadas** no consumer — pode derrubar o processo inteiro.
- **Testes unit:** Mockar RabbitMQ channel, TypeORM repositories, Firebase SDK, Nodemailer.
- **Testes de integração:** Usar RabbitMQ e PostgreSQL reais.

---

## 8. Roadmap — Backend Worker

- [ ] Setup do repositório
- [ ] Módulo `shared`: RabbitMQ consumer base (ACK/NACK/retry), TypeORM, Mongoose, Firebase, Nodemailer
- [ ] Módulo `health`
- [ ] Exchange + queues + DLQ no `onModuleInit`
- [ ] Módulo `provider-approval` — handler + testes
- [ ] Módulo `rating` — handler + testes
- [ ] Módulo `service-request` — handler (todos os eventos) + testes
- [ ] Módulo `email` — handler + templates Handlebars + testes
- [ ] Módulo `push` — handler Firebase + testes
- [ ] Módulo `notification` — persiste in-app no MongoDB + testes
- [ ] Testes E2E com RabbitMQ real
