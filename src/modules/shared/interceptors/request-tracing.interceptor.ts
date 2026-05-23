import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { trace, context } from '@opentelemetry/api';
import { Observable } from 'rxjs';

/**
 * Vincula o requestId (gerado pelo HttpMetricsInterceptor)
 * ao span do OpenTelemetry/Jaeger para correlação de traces
 */
@Injectable()
export class RequestTracingInterceptor implements NestInterceptor {
  intercept(executionContext: ExecutionContext, next: CallHandler): Observable<any> {
    const req = executionContext.switchToHttp().getRequest();
    const requestId = (req as any).requestId;

    if (requestId) {
      const span = trace.getActiveSpan();
      if (span) {
        // Adicionar requestId como atributo do span
        span.setAttribute('request.id', requestId);
        span.setAttribute('correlation.id', requestId);
      }

      // Adicionar ao contexto OpenTelemetry para propagação
      return executionContext.with(
        executionContext.active().setValue('request.id', requestId),
        () => next.handle(),
      );
    }

    return next.handle();
  }
}
