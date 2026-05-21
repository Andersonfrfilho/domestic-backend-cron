import { Injectable, Logger } from '@nestjs/common';
import { trace, context } from '@opentelemetry/api';
import { Request } from 'express';

export interface TraceInfo {
  traceId: string;
  spanId: string;
  parentSpan?: string;
  requestId?: string;
  traceparent?: string;
}

/**
 * Serviço para correlacionar logs com traces do Jaeger
 *
 * Exemplo de uso:
 *
 *   constructor(private traceLogger: TraceLoggerService, private logger: Logger) {}
 *
 *   async processUser(userId: string) {
 *     const traceInfo = this.traceLogger.getTraceInfo();
 *
 *     this.logger.debug('Processing user', {
 *       userId,
 *       traceId: traceInfo.traceId,
 *       spanId: traceInfo.spanId,
 *     });
 *
 *     // Seu código aqui
 *   }
 *
 * Resultado nos logs:
 *   [DEBUG] Processing user {
 *     "userId": "abc123",
 *     "traceId": "8b9b4e36746b0b0b206841bf694b067a",
 *     "spanId": "dbea1645514964bf"
 *   }
 *
 * Como usar no Jaeger:
 *   1. Copie o traceId dos logs
 *   2. Cole na UI do Jaeger: Search → Enter Trace ID
 *   3. Veja timeline completa com todos os serviços envolvidos
 */
@Injectable()
export class TraceLoggerService {
  private readonly logger = new Logger(TraceLoggerService.name);

  /**
   * Extrair trace info do contexto ativo do OpenTelemetry
   * Nota: Trata-se de um helper OPCIONAL para correlacionação com Jaeger.
   * Use getTraceInfoFromRequest() para obter requestId do request object.
   */
  getTraceInfo(): TraceInfo {
    const span = trace.getActiveSpan();
    const spanContext = span?.spanContext();

    return {
      traceId: spanContext?.traceId || 'no-trace',
      spanId: spanContext?.spanId || 'no-span',
      parentSpan: spanContext?.parentSpanId,
      requestId: span?.attributes?.['request.id'] as string,
    };
  }

  /**
   * Extrair trace info de um request Express
   */
  getTraceInfoFromRequest(request: Request): TraceInfo {
    return (request as any).traceInfo || this.getTraceInfo();
  }

  /**
   * Criar um objeto de log estruturado com trace info
   *
   * Uso:
   *   logger.debug('Event', this.traceLogger.withTrace({ userId: '123' }))
   */
  withTrace<T extends Record<string, any>>(data: T): T & TraceInfo {
    return {
      ...data,
      ...this.getTraceInfo(),
    };
  }

  /**
   * Log estruturado com trace info automática
   */
  logWithTrace(level: 'log' | 'error' | 'warn' | 'debug', message: string, data?: any) {
    const withTraceData = data ? this.withTrace(data) : this.getTraceInfo();

    this.logger[level](message, withTraceData);
  }

  /**
   * Gerar link direto para o Jaeger UI
   *
   * Exemplo de saída:
   *   http://jaeger.domestic.local/search?service=domestic-api&traceID=8b9b4e36746b0b0b206841bf694b067a
   */
  getJaegerLink(jaegerUrl: string = 'http://jaeger.domestic.local'): string {
    const traceInfo = this.getTraceInfo();
    const span = trace.getActiveSpan();
    const service = span?.attributes?.['service.name'] || 'unknown';

    return `${jaegerUrl}/search?service=${service}&traceID=${traceInfo.traceId}`;
  }

  /**
   * Criar um custom span com trace info
   */
  createTracedSpan(spanName: string, attributes?: Record<string, any>) {
    const tracer = trace.getTracer('domestic-api');
    const traceInfo = this.getTraceInfo();

    return tracer.startSpan(spanName, {
      attributes: {
        ...attributes,
        'trace.correlation_id': traceInfo.traceId,
        'request.id': traceInfo.requestId,
      },
    });
  }
}
