import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { Observable, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  private generateId(): string {
    return uuidv4().substring(0, 8).toUpperCase();
  }

  constructor(
    @InjectMetric('http_request_duration_seconds') private readonly histogram: Histogram,
    @InjectMetric('http_requests_total') private readonly counter: Counter,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const startTime = Date.now();
    const method: string = req.method ?? 'UNKNOWN';
    const route: string = (req.routerPath ?? req.routeOptions?.url ?? req.url ?? 'unknown') as string;

    // Usar requestId existente ou gerar novo
    const requestId = req.headers['x-request-id'] || this.generateId();
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);

    return next.handle().pipe(
      tap({
        next: () => this.record(method, route, String(res.statusCode), startTime),
        error: () => this.record(method, route, '500', startTime),
      }),
    );
  }

  private record(method: string, route: string, statusCode: string, startTime: number): void {
    const duration = (Date.now() - startTime) / 1000;
    const labels = {
      method,
      route,
      status_code: statusCode,
      service: process.env.OTEL_SERVICE_NAME ?? 'domestic-api',
    };
    this.histogram.observe(labels, duration);
    this.counter.inc(labels);
  }
}
