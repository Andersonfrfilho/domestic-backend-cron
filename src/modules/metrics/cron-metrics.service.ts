import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class CronMetricsService {
  constructor(
    @InjectMetric('cron_job_runs_total') private readonly counter: Counter,
    @InjectMetric('cron_job_duration_seconds') private readonly histogram: Histogram,
  ) {}

  record(jobName: string, status: 'success' | 'failed', durationMs: number): void {
    const duration = durationMs / 1000;
    const labels = {
      job_name: jobName,
      status,
      service: process.env.OTEL_SERVICE_NAME ?? 'domestic-cron',
    };
    this.counter.inc(labels);
    this.histogram.observe(labels, duration);
  }
}
