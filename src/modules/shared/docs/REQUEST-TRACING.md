# Correlação: requestId ↔ Jaeger Traces ↔ Logs Estruturados

## O que é

**Rastreamento completo de uma requisição** através de todos os serviços:

```
Cliente HTTP (Browser/API Client)
    ↓ requestId: "2MFCK7HD"
API Service (recebe requestId)
    ↓ Injeta no span do OpenTelemetry/Jaeger
Jaeger (coleta trace com requestId como atributo)
    ↓ Pode visualizar
Logs Estruturados (requestId em cada log)
    ↓ Correlação completa
```

---

## Arquitetura

### 1. **HttpMetricsInterceptor** (gera requestId)
```typescript
// src/modules/metrics/http-metrics.interceptor.ts
const requestId = req.headers['x-request-id'] || this.nanoid();
req.requestId = requestId;
res.setHeader('X-Request-ID', requestId);
```

### 2. **RequestTracingInterceptor** (vincula ao OpenTelemetry)
```typescript
// src/modules/shared/interceptors/request-tracing.interceptor.ts
span.setAttribute('request.id', requestId);
span.setAttribute('correlation.id', requestId);
```

### 3. **Logs Estruturados** (incluem requestId)
```typescript
// Em qualquer service
this.logProvider.info({
  message: 'User fetched',
  requestId: (req as any).requestId,  // injetado automaticamente
  params: { userId },
});
```

### 4. **Jaeger + Loki** (correlacionam via requestId)
```
Jaeger UI → Procura span com atributo request.id = "2MFCK7HD"
    ↓ Mostra trace timeline com todos os spans
    ↓ Clica em "Show Logs" para ver logs estruturados
Loki → Filtra logs com requestId = "2MFCK7HD"
    ↓ Mostra todos os logs de todos os apps nesta requisição
```

---

## Como Usar

### Step 1: Registrar RequestTracingInterceptor

```typescript
// src/app.module.ts
import { RequestTracingInterceptor } from '@app/modules/shared/interceptors/request-tracing.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor, // Este gera requestId
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestTracingInterceptor, // Este vincula ao Jaeger
    },
  ],
})
export class AppModule {}
```

### Step 2: Usar em Services

```typescript
import { Injectable, Logger, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { LogProviderInterface } from '@app/modules/shared/interfaces/log.interface';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject(REQUEST) private request: Request,
    private logProvider: LogProviderInterface,
  ) {}

  async getUserById(userId: string) {
    const requestId = (this.request as any).requestId;

    // Log no início
    this.logProvider.info({
      message: 'Starting get user',
      context: UserService.name,
      requestId, // ← Injetado aqui
      params: { userId },
    });

    try {
      const user = await this.userRepository.findById(userId);

      // Log de sucesso
      this.logProvider.info({
        message: 'User found',
        context: UserService.name,
        requestId, // ← Mesmo requestId
        params: { userId, userName: user.name },
      });

      return user;
    } catch (error) {
      // Log de erro
      this.logProvider.error({
        message: 'Failed to get user',
        context: UserService.name,
        requestId, // ← Mesmo requestId
        params: { userId, error: error.message },
      });
      throw error;
    }
  }
}
```

---

## Rastreando uma Requisição no Jaeger

### Cenário: "Uma requisição está lenta, quero saber por quê?"

**Step 1: Encontre o requestId nos logs**
```
tail -f /var/log/apps.log | grep "Getting user"
Output:
[2026-05-21T21:34:16.973Z] requestId: "2MFCK7HD" message: "Getting user" userId: "123"
```

**Step 2: Abra o Jaeger UI**
```
http://localhost:16686 (ou via kubectl port-forward)
```

**Step 3: Procure pela trace**
```
Service: domestic-api
Operation: POST /v1/users/123
Clique em "Find Traces"
```

**Step 4: Filtre por requestId (opcional)**
```
Tags → span.attributes.request\.id = "2MFCK7HD"
```

**Step 5: Visualize a trace completa**
```
Timeline mostra:
├─ HTTP Request (10ms)
├─ Database Query (1200ms) ← AQUI está lento
├─ Processing (50ms)
└─ Response (20ms)
Total: 1.28s

Clique em "Database Query" para ver:
- SQL: SELECT * FROM users WHERE id = $1
- Tempo: 1200ms
- Status: Success
```

**Step 6: Correlacione com Logs**
```
Jaeger mostra que Database Query foi lento
Clique em "View Logs" (integração com Loki)
Vê todos os logs dessa requisição de todos os apps:
- [API] "Querying database for user 123"
- [API] "Database query took 1200ms"
- [API] "User found: John Doe"
```

---

## RabbitMQ / Workers (Rastreamento Multi-Serviço)

Se a requisição publica uma mensagem para RabbitMQ:

```typescript
// API Service
this.logProvider.info({
  message: 'Publishing order created event',
  requestId: (req as any).requestId,  // requestId = "2MFCK7HD"
  params: { orderId, customerId },
});

await this.amqpConnection.publish('orders.events', 'order.created', {
  orderId,
  customerId,
  correlationId: requestId,  // ← IMPORTANTE: propagar requestId
});
```

```typescript
// Worker Service (consome a mensagem)
@Processor('orders')
export class OrderProcessor {
  @Process('created')
  async handleOrderCreated(job: Job<OrderCreatedEvent>) {
    const { correlationId } = job.data;

    this.logProvider.info({
      message: 'Processing order created',
      context: OrderProcessor.name,
      requestId: correlationId,  // ← Mesmo requestId
      params: { orderId: job.data.orderId },
    });

    // ... processar ordem
  }
}
```

**No Jaeger:**
```
Trace ID: "abc123..." (gerado pelo OpenTelemetry)
  ├─ Span 1 (API): POST /orders → request.id = "2MFCK7HD"
  ├─ Span 2 (Worker): process_order → request.id = "2MFCK7HD"
  └─ Span 3 (Database): INSERT → request.id = "2MFCK7HD"

Todos os 3 spans têm o mesmo requestId, permitindo correlação!
```

---

## Loki + Jaeger (Integração Completa)

No Grafana:
1. Abra Jaeger UI (plugin do Grafana)
2. Procure a trace: "2MFCK7HD"
3. Clique em um span
4. Vá em "Logs" (integração com Loki)
5. Vê logs estruturados dessa requisição de TODOS os apps

```
Logs filtrados por request.id = "2MFCK7HD":
[21:34:16.100] API:     "Received request for user 123"
[21:34:16.150] API:     "Querying database"
[21:34:17.350] API:     "Database query completed (1200ms)"
[21:34:17.400] API:     "Response sent: 200 OK"
[21:34:17.450] Worker:  "Received event: user.updated"
[21:34:17.500] Worker:  "Processing update"
[21:34:17.600] Worker:  "Update completed"
```

---

## Query Loki para Encontrar Logs por requestId

```loki
{job="kubernetes-pods"} | json | request_id="2MFCK7HD"
```

Ou no Grafana Loki panel:
```
{job="kubernetes-pods"} 
| json 
| request_id="2MFCK7HD"
| line_format "{{.timestamp}} {{.service}} {{.message}}"
```

---

## Benefícios

| Scenario | Sem Rastreamento | Com Rastreamento |
|----------|------------------|------------------|
| "Requisição lenta" | Procurar em 3 apps diferentes | Jaeger mostra timeline completa |
| "Erro em cascata" | Correlacionar logs manualmente | Jaeger + Logs mostram fluxo completo |
| "Qual app falhou?" | Ler logs de um por um | Trace mostra qual span falhou |
| "Performance P99" | Coletar métricas de cada app | Jaeger mostra latência de cada operação |

---

## Checklist

- [x] HttpMetricsInterceptor gera requestId
- [x] RequestTracingInterceptor vincula ao Jaeger
- [x] Logs estruturados incluem requestId
- [x] RabbitMQ propaga correlationId (requestId)
- [x] Jaeger está coletando spans com request.id
- [x] Loki está coletando logs estruturados
- [x] Integração Jaeger + Loki no Grafana está ativa

**Próximo passo:** Testar! 🚀
1. Faça uma requisição HTTP
2. Copie o requestId dos logs
3. Procure no Jaeger UI
4. Visualize a trace completa + logs juntos
