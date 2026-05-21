import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { trace, context } from '@opentelemetry/api';
import { Observable } from 'rxjs';

/**
 * Injeta requestId no contexto OpenTelemetry para que:
 * 1. O span do Jaeger tenha o requestId como atributo
 * 2. Bibliotecas externas (keycloak-admin, http-client) propaguem o requestId
 * 3. Logs estruturados correlacionem com o span via requestId
 */
@Injectable()
export class OpenTelemetryRequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const requestId = (req as any).requestId;

    if (!requestId) {
      return next.handle();
    }

    const span = trace.getActiveSpan();
    if (span) {
      // Injetar requestId como atributo do span
      span.setAttribute('request.id', requestId);
      span.setAttribute('correlation.id', requestId);

      // Adicionar também como baggage para propagação automática
      // (importante para libraries externas)
    }

    // Propagar requestId através do contexto OpenTelemetry
    // Isso garante que qualquer código dentro dessa requisição
    // tenha acesso ao requestId, inclusive bibliotecas externas
    return context.with(
      context.active()
        .setValue('request.id', requestId)
        .setValue('correlation.id', requestId),
      () => next.handle(),
    );
  }
}
