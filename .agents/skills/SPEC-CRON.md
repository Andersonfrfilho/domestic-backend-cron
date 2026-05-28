# SPEC — Backend Cron (`domestic-backend-cron`)

**Versão:** 1.0
**Data:** 04/04/2026
**Repositório:** `domestic-backend-cron`
**Porta:** 3003 (somente health check)
**Status:** Repositório não criado

> Spec master (arquitetura geral, domínio, infra): [SPEC.md](./SPEC.md)

---

## 1. Responsabilidade

O Backend Cron executa **tarefas periódicas** que não dependem de eventos externos. Ele:

- Mantém a consistência eventual de dados calculados (ex: `average_rating`)
- Remove contas e dados expirados
- Publica eventos no RabbitMQ para acionar o Worker (ex: lembretes)
- Gera relatórios periódicos de métricas

O Cron **não** expõe endpoints de negócio, **não** responde a requisições HTTP do frontend, **não** tem cache, **não** tem WebSocket.

---

## 2. Stack

| Componente | Tecnologia |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | NestJS 11 + Fastify (somente health) |
| Linguagem | TypeScript 5 |
| Banco | PostgreSQL 16 + TypeORM |
| Queue | RabbitMQ 3.13 — producer (para eventos de lembrete) |
| Scheduler | `@nestjs/schedule` + `node-cron` |
| Logger | `@adatechnology/logger` |

---

## 3. Estrutura de Diretórios

```
src/
├── config/
│   ├── env.validation.ts
│   ├── database-config.ts
│   └── rabbitmq.config.ts
├── modules/
│   ├── rating-recalculator/   # Recalcula ratings diariamente
│   ├── account-cleanup/       # Remove contas pendentes expiradas
│   ├── request-reminder/      # Envia lembretes de solicitações pendentes
│   ├── weekly-report/         # Relatório semanal de métricas
│   ├── shared/
│   │   ├── postgres/          # TypeORM connection
│   │   └── rabbitmq/          # Producer para fila de lembretes
│   └── health/
└── main.ts
```

### Padrão por módulo

```
<module>/
├── <module>.module.ts
├── <module>.job.ts                # @Cron — entry point do agendamento
├── <module>.job.unit.spec.ts
├── <module>.service.ts            # Lógica do job (injetável e testável)
├── <module>.service.unit.spec.ts
└── dtos/
    └── <module>-result.dto.ts     # Resultado do job para logging estruturado
```

---

## 4. Variáveis de Ambiente

```env
NODE_ENV=development
PORT=3003

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=zolve
POSTGRES_USER=zolve
POSTGRES_PASSWORD=zolve123

# RabbitMQ (para publicar eventos de lembrete)
RABBITMQ_URL=amqp://zolve:zolve123@localhost:5672
RABBITMQ_EXCHANGE=zolve.events

# Schedules (cron expressions — sobrescrevíveis por ambiente)
CRON_RATING_RECALCULATOR=0 5 * * *
CRON_ACCOUNT_CLEANUP=0 6 * * 0
CRON_REQUEST_REMINDER=0 12 * * *
CRON_WEEKLY_REPORT=0 10 * * 1

# Thresholds de negócio
PENDING_ACCOUNT_EXPIRY_DAYS=7
PENDING_REQUEST_REMINDER_HOURS=24
RATING_RECALC_WINDOW_DAYS=30
```

---

## 5. Jobs

### 5.1 `RatingRecalculatorJob`

**Schedule:** `0 5 * * *` (UTC) → 02:00 BRT
**Módulo:** `rating-recalculator`

#### Objetivo

Recalcula `average_rating` e `review_count` de todos os prestadores que receberam reviews nos últimos N dias (`RATING_RECALC_WINDOW_DAYS`, default: 30).

#### Algoritmo

```sql
-- Passo 1: Buscar prestadores com reviews recentes
SELECT
  provider_id,
  AVG(rating)::DECIMAL(3,2) as average_rating,
  COUNT(*)::INT            as review_count
FROM reviews
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY provider_id;

-- Passo 2: Atualizar em batch (por lotes de 100)
UPDATE provider_profiles
SET
  average_rating = $1,
  review_count   = $2
WHERE id = $3;
```

**Batch size:** 100 providers por transação para evitar lock excessivo.

#### Resultado esperado

```typescript
interface RatingRecalculatorResult {
  providers_updated: number;
  providers_unchanged: number; // rating não mudou
  errors: number;
  duration_ms: number;
}
```

#### Log estruturado de execução

```json
{
  "job": "RatingRecalculatorJob",
  "status": "completed",
  "providers_updated": 47,
  "providers_unchanged": 12,
  "errors": 0,
  "duration_ms": 234,
  "executed_at": "2026-04-05T05:00:00Z"
}
```

---

### 5.2 `AccountCleanupJob`

**Schedule:** `0 6 * * 0` (UTC) → 03:00 BRT aos domingos
**Módulo:** `account-cleanup`

#### Objetivo

Remove usuários com status `PENDING` criados há mais de `PENDING_ACCOUNT_EXPIRY_DAYS` (default: 7 dias) que nunca verificaram o e-mail.

#### Algoritmo

```sql
-- Passo 1: Identificar contas a remover
SELECT id FROM users
WHERE status = 'PENDING'
  AND created_at < NOW() - INTERVAL '7 days';

-- Passo 2: Deletar em cascata na ordem correta (FK)
-- Para cada user_id coletado:
DELETE FROM user_emails    WHERE user_id = $1;
DELETE FROM user_phones    WHERE user_id = $1;
DELETE FROM user_addresses WHERE user_id = $1;
DELETE FROM users          WHERE id = $1;
```

**Atenção:** Verificar se o usuário não tem service_requests ativos antes de deletar. Se tiver, pular e logar como warning.

**Batch size:** 50 usuários por vez. Executar dentro de transação.

#### Resultado esperado

```typescript
interface AccountCleanupResult {
  accounts_deleted: number;
  accounts_skipped: number;  // tinham service_requests ou eram admin
  errors: number;
  duration_ms: number;
}
```

#### Log estruturado

```json
{
  "job": "AccountCleanupJob",
  "status": "completed",
  "accounts_deleted": 12,
  "accounts_skipped": 2,
  "errors": 0,
  "duration_ms": 89,
  "executed_at": "2026-04-06T06:00:00Z"
}
```

---

### 5.3 `RequestReminderJob`

**Schedule:** `0 12 * * *` (UTC) → 09:00 BRT
**Módulo:** `request-reminder`

#### Objetivo

Identificar service_requests em status `PENDING` há mais de `PENDING_REQUEST_REMINDER_HOURS` (default: 24h) e publicar evento no RabbitMQ para o Worker enviar lembrete ao prestador.

#### Algoritmo

```sql
SELECT
  sr.id             as request_id,
  sr.provider_id,
  sr.contractor_id,
  sr.service_id,
  pp.user_id        as provider_user_id,
  u.id              as contractor_user_id,
  sr.scheduled_at
FROM service_requests sr
  JOIN provider_profiles pp ON sr.provider_id = pp.id
  JOIN users             u  ON sr.contractor_id = u.id
WHERE sr.status = 'PENDING'
  AND sr.created_at < NOW() - INTERVAL '24 hours';
```

#### Evento publicado por solicitação pendente

**Exchange:** `zolve.events`
**Routing key:** `notifications.email`
**Payload:**
```json
{
  "to": "provider@email.com",
  "template_id": "request-reminder",
  "variables": {
    "provider_name": "Serviços da Maria",
    "contractor_name": "Anderson Silva",
    "service_name": "Diária",
    "scheduled_at": "10/04/2026 às 14h00",
    "request_url": "https://app.zolve.com.br/requests/uuid",
    "hours_pending": "26"
  }
}
```

#### Resultado esperado

```typescript
interface RequestReminderResult {
  reminders_sent: number;
  errors: number;
  duration_ms: number;
}
```

---

### 5.4 `WeeklyReportJob`

**Schedule:** `0 10 * * 1` (UTC) → 07:00 BRT às segundas
**Módulo:** `weekly-report`

#### Objetivo

Agregar métricas da semana anterior (de segunda a domingo) e logar em formato estruturado. Futuramente: enviar por e-mail para a equipe admin.

#### Métricas coletadas

```sql
-- Novos usuários na semana
SELECT COUNT(*) FROM users
WHERE created_at BETWEEN $week_start AND $week_end;

-- Novos prestadores aprovados
SELECT COUNT(*) FROM provider_verifications
WHERE status = 'APPROVED'
  AND reviewed_at BETWEEN $week_start AND $week_end;

-- Service requests por status
SELECT status, COUNT(*) FROM service_requests
WHERE created_at BETWEEN $week_start AND $week_end
GROUP BY status;

-- Reviews criadas e rating médio geral
SELECT COUNT(*), AVG(rating) FROM reviews
WHERE created_at BETWEEN $week_start AND $week_end;

-- Contas removidas pelo cleanup (na semana anterior)
-- (baseado em log estruturado — dado futuro)
```

#### Log estruturado

```json
{
  "job": "WeeklyReportJob",
  "status": "completed",
  "week": "2026-03-30 / 2026-04-05",
  "metrics": {
    "new_users": 47,
    "providers_approved": 8,
    "service_requests": {
      "total": 120,
      "pending": 5,
      "accepted": 67,
      "completed": 45,
      "cancelled": 3
    },
    "reviews": {
      "total": 41,
      "average_rating": 4.7
    }
  },
  "duration_ms": 312,
  "executed_at": "2026-04-06T10:00:00Z"
}
```

---

## 6. Comportamento em Falhas

| Cenário | Comportamento |
|---|---|
| Job falha no meio da execução | Logar erro com stack trace, não relançar. Próxima execução no horário normal. |
| Query SQL falha | Rollback da transação em andamento. Log de erro. Job para sem travar o processo. |
| RabbitMQ fora do ar (RequestReminder) | Logar erro. Solicitações que não receberam lembrete serão pegas na próxima execução. |
| Dois pods do Cron rodando simultaneamente | Risco: jobs duplicados. Solução: implementar distributed lock via Redis (futura melhoria). |

**Regra:** Jobs nunca devem lançar exceções não tratadas. Qualquer erro deve ser capturado, logado e o job deve terminar graciosamente.

---

## 7. Execução Manual (Debugging)

Todos os jobs devem ser acionáveis manualmente via endpoint HTTP (somente em `NODE_ENV != production`):

```
POST /jobs/rating-recalculator/run
POST /jobs/account-cleanup/run
POST /jobs/request-reminder/run
POST /jobs/weekly-report/run
```

**Auth:** Somente por IP interno ou com token de admin.

---

## 8. Convenções

- **Job:** Classe com `@Injectable()`. Método `run()` anotado com `@Cron(expression)`.
- **Service:** Lógica extraída do job para uma `<module>.service.ts` injetável e testável sem depender do cron trigger.
- **Logging:** Log de início e fim obrigatório em todo job. Incluir `executed_at`, duração e resultado numérico.
- **Idempotência:** Todo job deve ser seguro de re-executar manualmente sem causar dados duplicados.
- **Transações:** Usar `QueryRunner` do TypeORM para operações de deleção em cascata.
- **Batch:** Processar em lotes (50-100 registros) para evitar timeouts e locks excessivos.
- **Testes unit:** Mockar TypeORM repositories e RabbitMQ producer. Testar o `service.ts`, não o job diretamente.
- **Naming:** kebab-case arquivos, PascalCase classes, camelCase métodos.

---

## 9. Roadmap — Backend Cron

- [ ] Setup do repositório
- [ ] Módulo `shared`: TypeORM connection + RabbitMQ producer + logger
- [ ] Módulo `health`
- [ ] Módulo `rating-recalculator` — job + service + testes
- [ ] Módulo `account-cleanup` — job + service + testes (cuidado com cascata de FK)
- [ ] Módulo `request-reminder` — job + service + publicação RabbitMQ + testes
- [ ] Módulo `weekly-report` — job + service + queries de agregação + testes
- [ ] Endpoints de execução manual (dev/staging)
- [ ] Testes de integração com PostgreSQL real
