# Call Stack Tracing: Rastreando Cadeia de Chamadas

## O que é

**Call Stack Tracing** é a capacidade de visualizar a cadeia de chamadas de métodos durante uma requisição HTTP, permitindo entender exatamente qual fluxo de classes/métodos foi percorrido.

## Problema Identificado

Atualmente, os logs mostram apenas o método/classe que gerou o log:
```
[O2K2V2YH][2026-05-21T22:05:00.072Z][CheckEmailExistsUseCase.execute][INFO] - Starting check email exists flow
```

❌ Não está claro que `CheckEmailExistsUseCase.execute` foi chamado por quem (qual controller? qual middleware?)
❌ Se houver cascata de 5-10 chamadas, cada log repete apenas o atual, não mostra a cadeia

## Solução

### Step 1: Registrar TraceStackInterceptor

```typescript
// src/modules/metrics/metrics.module.ts
import { TraceStackInterceptor } from '@modules/shared/interceptors/trace-stack.interceptor';
import { TraceStackService } from '@modules/shared/services/trace-stack.service';

@Module({
  providers: [
    TraceStackService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TraceStackInterceptor, // 1º: Inicializa stack vazio
    },
    {
      provide: APP_INTERCEPTOR,
      useExisting: HttpMetricsInterceptor, // 2º: Gera requestId
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: OpenTelemetryRequestIdInterceptor, // 3º: Injeta no span
    },
  ],
})
export class MetricsModule {}
```

### Step 2: Usar em Services

Opção A: Injetar `TraceStackService` e chamar manualmente:

```typescript
@Injectable()
export class UserService {
  constructor(private traceStack: TraceStackService) {}

  async getUserById(userId: string) {
    this.traceStack.push('UserService.getUserById');
    try {
      // ... lógica
      console.log(this.traceStack.getStackFormatted()); // [UserService.getUserById]
      return user;
    } finally {
      this.traceStack.pop();
    }
  }
}
```

Opção B: Usar decorator `@TraceMethodWithDI()` (automático):

```typescript
@Injectable()
export class UserService {
  constructor(private traceStack: TraceStackService) {}

  @TraceMethodWithDI()
  async getUserById(userId: string) {
    // Stack automatically includes: [UserService.getUserById]
    console.log(this.traceStack.getStackFormatted());
  }

  @TraceMethodWithDI()
  async saveUser(user: User) {
    // If called from getUserById:
    // Stack includes: [UserService.getUserById][UserService.saveUser]
  }
}
```

### Step 3: Integrar com LogProvider

Modificar `@adatechnology/logger` para incluir stack automaticamente:

```typescript
this.logProvider.info({
  message: 'User found',
  context: UserService.name,
  requestId,
  stack: this.traceStack.getStackFormatted(), // ← adicionar aqui
  userId,
});
```

Resultado no log:
```
[O2K2V2YH][2026-05-21T22:05:00.072Z][UserService.getUserById][UserService.saveUser][INFO] - User found
```

---

## API do TraceStackService

```typescript
// Push method name quando entrando
traceStack.push('ClassName.methodName');

// Pop ao sair (use try/finally)
traceStack.pop();

// Get current stack como array
const stack: string[] = traceStack.getStack();
// Resultado: ['ClassName.method1', 'ClassName2.method2']

// Get stack formatado para logs
const formatted: string = traceStack.getStackFormatted();
// Resultado: "[ClassName.method1][ClassName2.method2]"

// Get depth (quantos métodos na cadeia)
const depth: number = traceStack.getDepth();
// Resultado: 2

// Get current method (último da stack)
const current: string | null = traceStack.getCurrentMethod();
// Resultado: 'ClassName2.method2'

// Get parent method (penúltimo da stack)
const parent: string | null = traceStack.getParentMethod();
// Resultado: 'ClassName.method1'

// Clear stack (normalmente feito pelo interceptor)
traceStack.clear();
```

---

## Exemplo Completo: Verify Email Flow

```typescript
// VerifyEmailController.ts
@Controller('auth/verify')
export class VerifyEmailController {
  constructor(
    private traceStack: TraceStackService,
    private checkEmailUseCase: CheckEmailExistsUseCase,
  ) {}

  @Post('email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    this.traceStack.push('VerifyEmailController.verifyEmail');
    try {
      return await this.checkEmailUseCase.execute(dto.email);
    } finally {
      this.traceStack.pop();
    }
  }
}

// CheckEmailExistsUseCase.ts
@Injectable()
export class CheckEmailExistsUseCase {
  constructor(
    private traceStack: TraceStackService,
    private userRepository: UserRepository,
    private keycloakClient: KeycloakAdminClient,
  ) {}

  @TraceMethodWithDI()
  async execute(email: string): Promise<EmailCheckResult> {
    // Stack aqui: [VerifyEmailController.verifyEmail][CheckEmailExistsUseCase.execute]

    const exists = await this.userRepository.findByEmail(email);
    // Log incluiria: [VerifyEmailController.verifyEmail][CheckEmailExistsUseCase.execute]

    if (exists) {
      return { exists: true, email };
    }

    return { exists: false, email };
  }
}

// UserRepository.ts
@Injectable()
export class UserRepository {
  constructor(
    private traceStack: TraceStackService,
    private dataSource: DataSource,
  ) {}

  @TraceMethodWithDI()
  async findByEmail(email: string): Promise<User | null> {
    // Stack aqui: [VerifyEmailController.verifyEmail][CheckEmailExistsUseCase.execute][UserRepository.findByEmail]
    return this.dataSource.query('SELECT * FROM users WHERE email = $1', [email]);
  }
}
```

**Logs do fluxo acima:**

```
[O2K2V2YH][2026-05-21T22:05:00.072Z][VerifyEmailController.verifyEmail][INFO] - Verify email request received
[O2K2V2YH][2026-05-21T22:05:00.075Z][VerifyEmailController.verifyEmail][CheckEmailExistsUseCase.execute][INFO] - Starting check email exists
[O2K2V2YH][2026-05-21T22:05:00.100Z][VerifyEmailController.verifyEmail][CheckEmailExistsUseCase.execute][UserRepository.findByEmail][INFO] - Querying database
[O2K2V2YH][2026-05-21T22:05:00.150Z][VerifyEmailController.verifyEmail][CheckEmailExistsUseCase.execute][UserRepository.findByEmail][INFO] - Database query returned 1 result
[O2K2V2YH][2026-05-21T22:05:00.160Z][VerifyEmailController.verifyEmail][CheckEmailExistsUseCase.execute][INFO] - Email exists: true
[O2K2V2YH][2026-05-21T22:05:00.165Z][VerifyEmailController.verifyEmail][INFO] - Response sent: 200 OK
```

Agora é **imediatamente claro** qual foi o fluxo de execução!

---

## Integração com OpenTelemetry Spans

O stack pode ser adicionado ao span também:

```typescript
const span = trace.getActiveSpan();
if (span) {
  span.setAttribute('trace.stack', this.traceStack.getStackFormatted());
}
```

Assim, o Jaeger também mostraria o stack em cada span!

---

## Performance Considerations

- **Stack push/pop:** O(1) operações (apenas array manipulation)
- **Context storage:** Armazenado no OpenTelemetry context (async-local storage)
- **Memory:** Negligível — máximo 50 métodos na stack = ~500 bytes
- **No overhead:** Se não usar decorator, sem custo

---

## Checklist

- [ ] Registrar `TraceStackInterceptor` no MetricsModule
- [ ] Registrar `TraceStackService` no SharedModule
- [ ] Adicionar `@TraceMethodWithDI()` aos use cases principais
- [ ] Adicionar `stack` field ao LogProvider
- [ ] Testar: fazer requisição → verificar stack nos logs
- [ ] (Opcional) Adicionar stack ao Jaeger span attributes

---

## Próximo Passo

1. Registrar interceptor e service
2. Decorar methods com `@TraceMethodWithDI()`
3. Modificar logger para incluir `stack`
4. Testar in dev environment

```bash
npm run start:dev
# Fazer requisição
# Verificar logs com [ClassName1.method1][ClassName2.method2]...
```
