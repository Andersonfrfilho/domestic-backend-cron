# Distributed Tracing - Correlação Logs ↔ Jaeger

## Quick Start

### 1. O HttpMetricsInterceptor já injeta requestId automaticamente

```typescript
// Em qualquer controller ou service, acesse req.requestId:
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
    // requestId é automaticamente injetado pelo HttpMetricsInterceptor
    const requestId = (this.request as any).requestId;

    // Usar seu sistema de logs existente com requestId
    this.logProvider.info({
      message: 'Fetching user',
      context: UserService.name,
      requestId,
      params: { userId },
    });

    const user = await this.userRepository.findById(userId);

    this.logProvider.info({
      message: 'User fetched',
      context: UserService.name,
      requestId,
      params: { userId, userName: user.name },
    });

    return user;
  }
}
```

### 2. (Opcional) Usar TraceLoggerService para correlacionar com Jaeger

Se quiser também coletar trace IDs do OpenTelemetry para correlacionar com Jaeger:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { TraceLoggerService } from '@app/modules/shared/services/trace-logger.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private traceLogger: TraceLoggerService) {}

  async getUserById(userId: string) {
    const traceInfo = this.traceLogger.getTraceInfo();
    
    // Logs estruturados com trace info (opcional)
    this.logger.debug('Fetching user', this.traceLogger.withTrace({ userId }));

    const user = await this.userRepository.findById(userId);
    return user;
  }
}
```

### 2. Resultado nos Logs

```json
[DEBUG] Fetching user {
  "userId": "5d030b47-eb7f-49ce-b44a-94ab7c7da14e",
  "traceId": "8b9b4e36746b0b0b206841bf694b067a",
  "spanId": "dbea1645514964bf",
  "parentSpan": "7b5f4d3e2c1a0b9f",
  "requestId": "2MFCK7HD"
}
```

### 3. Rastrear no Jaeger

1. **Opção A - Copiar Trace ID dos logs:**
   - Logs: `"traceId": "8b9b4e36746b0b0b206841bf694b067a"`
   - Jaeger UI → Search → Cole o ID
   - Veja timeline completa da requisição

2. **Opção B - Obter link direto:**
   ```typescript
   const link = this.traceLogger.getJaegerLink();
   // Saída: http://jaeger.domestic.local/search?service=domestic-api&traceID=8b9b4e36746b0b0b206841bf694b067a
   ```

## Casos de Uso

### Caso 1: Rastrear Erro em Cascata

**Erro nos logs:**
```
[ERROR] User not found {
  "userId": "5d030b47-eb7f-49ce-b44a-94ab7c7da14e",
  "traceId": "8b9b4e36746b0b0b206841bf694b067a"
}
```

**No Jaeger:**
1. Cole `8b9b4e36746b0b0b206841bf694b067a` no Search
2. Clique em Trace para ver a timeline
3. Identifique qual serviço falhou:
   - `domestic-api` → Database query
   - `domestic-worker` → Message processing
4. Veja a execução exata da operação que falhou

### Caso 2: Monitorar Performance

```typescript
async processLargeDataset(datasetId: string) {
  const span = this.traceLogger.createTracedSpan('process_dataset', {
    'dataset.id': datasetId,
    'dataset.size': rows.length,
  });

  try {
    // Operação lenta
    await this.heavyComputation(rows);
    span.addEvent('computation_completed', {
      'duration_ms': 1500,
      'rows_processed': rows.length,
    });
  } finally {
    span.end();
  }

  this.logger.debug('Dataset processed', this.traceLogger.withTrace({
    datasetId,
    rowsProcessed: rows.length,
    durationMs: span.duration,
  }));
}
```

**No Jaeger:**
- Timeline mostra que `process_dataset` demorou 1.5s
- Clique no span para ver qual operação foi lenta
- Database queries são auto-instrumentadas

### Caso 3: Correlacionar Entre Serviços

**API Log:**
```json
{
  "message": "Publishing job event",
  "traceId": "8b9b4e36746b0b0b206841bf694b067a",
  "spanId": "dbea1645514964bf",
  "event": "user.onboarded"
}
```

**Worker recebe a mesma requisição:**
```json
{
  "message": "Processing onboarding event",
  "traceId": "8b9b4e36746b0b0b206841bf694b067a",
  "spanId": "a1b2c3d4e5f6g7h8",
  "parentSpan": "dbea1645514964bf"
}
```

**No Jaeger:**
- Click no trace ID
- Vê 2 spans separados (API + Worker)
- Timeline mostra ordem exata de execução
- Latência total entre os serviços

## Integração com Interceptors

O `HttpMetricsInterceptor` (que vocês já têm) agora também:

1. **Gera requestId** (8 caracteres alfanuméricos) se não existir
2. **Injeta no request** para acesso em handlers/services via `req.requestId`
3. **Adiciona X-Request-ID header** na response (para auditoria)

```typescript
// Já registrado e funcionando - nenhuma configuração adicional necessária
// O interceptor está em: src/modules/metrics/http-metrics.interceptor.ts

// Em qualquer service, use @Inject(REQUEST) para acessar:
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

constructor(@Inject(REQUEST) private request: Request) {}

// Acesse: (this.request as any).requestId
```

## Exemplos Reais

### Exemplo 1: Service com Trace Logger

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TraceLoggerService } from '@app/modules/shared/services/trace-logger.service';
import { UserEntity } from '@app/modules/shared/entities/user.entity';

@Injectable()
export class GetUserByKeycloakIdUseCase {
  private readonly logger = new Logger(GetUserByKeycloakIdUseCase.name);

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private traceLogger: TraceLoggerService,
  ) {}

  async execute(keycloakId: string): Promise<UserEntity> {
    const traceInfo = this.traceLogger.getTraceInfo();

    this.logger.debug('Starting get user by keycloakId flow', {
      keycloakId,
      traceId: traceInfo.traceId,
    });

    try {
      const user = await this.userRepository.findOne({
        where: { keycloakId },
      });

      if (!user) {
        this.logger.warn('User not found', this.traceLogger.withTrace({
          keycloakId,
          action: 'get_user',
        }));
        return null;
      }

      this.logger.debug('User resolved by keycloakId', this.traceLogger.withTrace({
        keycloakId,
        userId: user.id,
        userStatus: user.status,
      }));

      return user;
    } catch (error) {
      this.logger.error('Failed to get user', {
        keycloakId,
        error: error.message,
        ...traceInfo,
      });
      throw error;
    }
  }
}
```

### Exemplo 2: Controller com Request ID

```typescript
import { Controller, Post, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { LogProviderInterface } from '@app/modules/shared/interfaces/log.interface';

@Controller('api/users')
export class UserController {
  constructor(
    private userService: UserService,
    private logProvider: LogProviderInterface,
  ) {}

  @Post('onboarding')
  async onboarding(@Body() dto: OnboardingDto, @Req() request: Request) {
    // O requestId é automaticamente injetado pelo HttpMetricsInterceptor
    const requestId = (request as any).requestId;

    // Usar seu sistema de logs existente
    this.logProvider.info({
      message: 'Onboarding request received',
      context: UserController.name,
      requestId,
      params: { email: dto.email },
    });

    return this.userService.createUser(dto);
  }
}
```

## Visualizar no Jaeger

### Timeline View
```
domestic-api [━━━━━━━━━━━━━━━━━━] 2s
  ├─ HTTP Request [━━] 50ms
  ├─ Database Query [━━━━━━━] 1200ms
  │  ├─ SELECT user [━━━] 100ms
  │  ├─ INSERT address [━━━━] 1000ms
  ├─ Response [━] 50ms
```

### Clicando em "Database Query"
```
Operation: SELECT * FROM users WHERE keycloak_id = $1
Status: Success
Duration: 100ms
Rows: 1
Tags: {
  "db.operation": "select",
  "db.table": "users",
  "db.rows": 1
}
```

## Melhores Práticas

1. **Sempre incluir requestId em logs (seu sistema existente):**
   ```typescript
   // Use seu LogProviderInterface existente
   this.logProvider.error({
     message: 'User not found',
     context: UserService.name,
     requestId: (this.request as any).requestId,
     params: { userId },
   });
   ```

2. **Log no início e fim de operações críticas:**
   ```typescript
   this.logProvider.info({
     message: 'Starting payment process',
     context: PaymentService.name,
     requestId,
     params: { orderId },
   });
   // ... seu código
   this.logProvider.info({
     message: 'Payment completed',
     context: PaymentService.name,
     requestId,
     params: { orderId, status: 'success' },
   });
   ```

3. **(Opcional) Usar custom spans do OpenTelemetry para operações longas:**
   ```typescript
   const tracer = trace.getTracer('domestic-api');
   const span = tracer.startSpan('batch_import', {
     attributes: { 'batch.size': items.length },
   });
   try {
     // ... seu código
   } finally {
     span.end();
   }
   ```

4. **Correlacionar com IDs de negócio:**
   ```typescript
   this.logProvider.info({
     message: 'Processing order',
     context: OrderService.name,
     requestId,
     params: { orderId, customerId, amount },
   });
   ```
