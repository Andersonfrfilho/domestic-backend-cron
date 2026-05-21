import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrometheusModule, makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';

import { HttpMetricsInterceptor } from './http-metrics.interceptor';
import { OpenTelemetryRequestIdInterceptor } from '@modules/shared/interceptors/opentelemetry-request-id.interceptor';
import { TraceStackInterceptor } from '@modules/shared/interceptors/trace-stack.interceptor';
import { RequestIdContextInterceptor } from '@modules/shared/interceptors/request-id-context.interceptor';
import { TraceStackService } from '@modules/shared/services/trace-stack.service';
import { CronMetricsService } from './cron-metrics.service';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: { enabled: true },
    }),
  ],
  providers: [
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code', 'service'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    }),
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code', 'service'],
    }),
    makeCounterProvider({
      name: 'cron_job_runs_total',
      help: 'Total number of cron job executions',
      labelNames: ['job_name', 'status', 'service'],
    }),
    makeHistogramProvider({
      name: 'cron_job_duration_seconds',
      help: 'Cron job execution duration in seconds',
      labelNames: ['job_name', 'status', 'service'],
      buckets: [0.1, 0.5, 1, 5, 10, 30, 60, 120, 300, 600],
    }),
    TraceStackService,
    HttpMetricsInterceptor,
    OpenTelemetryRequestIdInterceptor,
    RequestIdContextInterceptor,
    CronMetricsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TraceStackInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useExisting: HttpMetricsInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestIdContextInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: OpenTelemetryRequestIdInterceptor,
    },
  ],
  exports: [CronMetricsService],
})
export class MetricsModule {}
