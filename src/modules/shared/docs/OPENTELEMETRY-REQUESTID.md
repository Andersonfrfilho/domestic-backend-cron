# OpenTelemetry + RequestId: Correlação Automática

## Problema Identificado

Os logs mostram requestId corretamente:
```
[O2K2V2YH][2026-05-21T22:05:00.072Z][CheckEmailExistsUseCase.execute][INFO] - Starting check email exists flow
[@adatechnology/http-client:0.0.14][O2K2V2YH][2026-05-21T22:05:00.072Z][KeycloakAdminHttpClient.post][INFO] - HTTP Request
```

✅ **RequestId está nos logs** (propagado através de todas as bibliotecas)
❌ **RequestId NÃO está no span do Jaeger** (não pode correlacionar com Jaeger)

## Solução

### Step 1: Registrar o Interceptor

```typescript
// src/app.module.ts
import { OpenTelemetryRequestIdInterceptor } from '@app/modules/shared/interceptors/opentelemetry-request-id.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor, // 1º: Gera requestId
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: OpenTelemetryRequestIdInterceptor, // 2º: Injeta no span
    },
    // ... outros interceptors
  ],
})
export class AppModule {}
```

### Step 2: O que o Interceptor faz

```
Request HTTP com requestId: "O2K2V2YH"
    ↓
HttpMetricsInterceptor
    └─ req.requestId = "O2K2V2YH"
    ↓
OpenTelemetryRequestIdInterceptor
    ├─ span.setAttribute('request.id', 'O2K2V2YH')  ← Jaeger verá
    └─ context.setValue('request.id', 'O2K2V2YH')   ← Bibliotecas externas verão
    ↓
Qualquer requisição HTTP dentro desse contexto:
    └─ Bibliotecas (@adatechnology/http-client, etc) 
       recebem requestId do contexto
       └─ Propagam automaticamente via headers / baggage
```

---

## Como Funciona a Propagação

### Cenário: Verify Email Flow

```
1. Cliente faz POST /v1/auth/verify/email
   Headers incluem: traceparent (W3C Trace Context)

2. API recebe (instrumentation.ts já captura traceparent)
   ↓
   HttpMetricsInterceptor
   └─ Gera requestId: "O2K2V2YH"
   ↓
   OpenTelemetryRequestIdInterceptor
   ├─ span.setAttribute('request.id', 'O2K2V2YH')
   └─ context.setValue('request.id', 'O2K2V2YH')
   ↓
   CheckEmailExistsUseCase
   ├─ Log: "Starting..." (usa requestId dos logs estruturados)
   └─ Chama keycloak-admin

3. keycloak-admin (biblioteca externa)
   ├─ Cria nova requisição HTTP
   ├─ KeycloakAdminHttpClient lê contexto OpenTelemetry
   ├─ Inclui requestId nos headers ou baggage
   └─ Log: "@adatechnology/http-client[O2K2V2YH]..."
        (propagado de forma automática)

4. Jaeger coleta:
   ├─ Span 1 (API): POST /v1/auth/verify/email
   │  └─ request.id = "O2K2V2YH"
   └─ Span 2 (HTTP client): POST /realms/master/protocol/openid-connect/token
      └─ request.id = "O2K2V2YH" (herdado do contexto)
```

---

## Ajustes na Lib (Opcional)

Se a lib `@adatechnology/http-client` não estiver lendo o requestId do contexto automaticamente, pode ser necessário:

### Opção 1: Patch simples

```typescript
// src/modules/shared/interceptors/lib-request-id.patch.ts
import { context } from '@opentelemetry/api';

/**
 * Hook para injetar requestId em bibliotecas externas
 * Executado antes de qualquer requisição HTTP
 */
export function patchLibrariesWithRequestId() {
  // Se a lib tem um hook de "before request", use-o:
  const requestIdFromContext = context.active().getValue('request.id');
  
  if (requestIdFromContext) {
    // Passar para a lib como header ou baggage
    // Exemplo (depende da lib):
    // HttpClient.setDefaultHeader('X-Request-ID', requestIdFromContext);
  }
}
```

### Opção 2: Custom HTTP Client wrapper

```typescript
// src/modules/shared/providers/http-client-with-request-id.ts
import { Injectable } from '@nestjs/common';
import { context } from '@opentelemetry/api';
import { HttpClient } from '@adatechnology/http-client';

@Injectable()
export class HttpClientWithRequestId {
  constructor(private httpClient: HttpClient) {}

  async post(url: string, data: any, options?: any) {
    const requestId = context.active().getValue('request.id');

    // Adicionar requestId aos headers
    const headers = {
      ...options?.headers,
      'X-Request-ID': requestId,
    };

    return this.httpClient.post(url, data, {
      ...options,
      headers,
    });
  }

  // ... outros métodos (get, put, delete, etc)
}
```

Depois usar:

```typescript
constructor(private httpClient: HttpClientWithRequestId) {}
```

---

## Resultado Final

Quando tudo estiver configurado:

```
Logs (já funcionando):
[O2K2V2YH][2026-05-21T22:05:00.072Z][CheckEmailExistsUseCase]...
[@adatechnology/http-client][O2K2V2YH][2026-05-21T22:05:00.072Z]...

Jaeger (depois do ajuste):
Trace ID: "767795ff6a706fa481f79d3b13b855f0"
├─ Span 1 (API POST /verify/email)
│  └─ request.id = "O2K2V2YH" ← Agora aparece!
├─ Span 2 (HTTP POST /token)
│  └─ request.id = "O2K2V2YH" ← Agora aparece!
└─ Span 3 (Database query)
   └─ request.id = "O2K2V2YH" ← Agora aparece!

Loki (já funcionando):
{request_id="O2K2V2YH"} logs de todas as operações acima
```

---

## Checklist

- [ ] Registrar `OpenTelemetryRequestIdInterceptor` no app.module.ts
- [ ] Testar: Fazer requisição → Ver requestId nos logs ✅ (já funciona)
- [ ] Testar: Abrir Jaeger → Procurar span com request.id = "XXX" (vai funcionar após registrar)
- [ ] (Opcional) Ajustar lib se não propagar requestId automaticamente
- [ ] Testar: Jaeger + Loki correlacionam logs via requestId

---

## Próximo Passo

1. Registrar o interceptor
2. Fazer uma requisição
3. Copiar requestId dos logs: `[O2K2V2YH]`
4. Abrir Jaeger → Procurar `span.attributes.request\.id = "O2K2V2YH"`
5. Clique em "View Logs" para ver logs correlacionados via Loki
6. 🎉 Rastreamento completo de todos os apps!
