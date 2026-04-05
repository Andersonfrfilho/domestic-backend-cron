import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Distributed lock via Redis SET NX EX.
 *
 * Garante que apenas um pod execute um job por vez em ambientes multi-instância.
 * Padrão: tenta adquirir o lock antes do job. Se outro pod já tem o lock, o job
 * é pulado silenciosamente (não é um erro — é idempotência intencional).
 */
@Injectable()
export class CronLockService implements OnModuleDestroy {
  private readonly logger = new Logger(CronLockService.name);
  private readonly client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.CACHE_REDIS_HOST ?? 'localhost',
      port: Number(process.env.CACHE_REDIS_PORT ?? 6379),
      password: process.env.CACHE_REDIS_PASSWORD || undefined,
      lazyConnect: true,
    });

    this.client.on('error', (err) =>
      this.logger.error('Redis lock connection error', err),
    );
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  /**
   * Tenta adquirir o lock para um job.
   *
   * @param jobName  Nome único do job (ex: 'rating-recalculator')
   * @param ttlMs    Tempo máximo esperado de execução em ms. O lock expira
   *                 automaticamente após esse tempo, evitando lock eterno se
   *                 o pod morrer no meio da execução.
   * @returns `true` se o lock foi adquirido, `false` se outro pod já está executando.
   */
  async acquire(jobName: string, ttlMs: number): Promise<boolean> {
    const key = `cron:lock:${jobName}`;
    const ttlSeconds = Math.ceil(ttlMs / 1000);

    try {
      // SET key value NX EX ttl — atômico, falha se chave já existe
      const result = await this.client.set(key, '1', 'EX', ttlSeconds, 'NX');
      if (result === 'OK') {
        this.logger.debug(`Lock acquired: ${key} (TTL: ${ttlSeconds}s)`);
        return true;
      }

      this.logger.log(`Lock busy — skipping job: ${jobName} (another pod is running it)`);
      return false;
    } catch (err) {
      // Se Redis estiver fora do ar, deixa o job rodar (fail-open é mais seguro
      // que bloquear todos os pods indefinidamente)
      this.logger.warn(`Redis lock unavailable for ${jobName} — running without lock`, err);
      return true;
    }
  }

  /**
   * Libera o lock antecipadamente (antes do TTL expirar).
   * Chamado ao final de cada job para liberar o slot imediatamente.
   */
  async release(jobName: string): Promise<void> {
    const key = `cron:lock:${jobName}`;
    try {
      await this.client.del(key);
      this.logger.debug(`Lock released: ${key}`);
    } catch (err) {
      this.logger.warn(`Failed to release lock for ${jobName}`, err);
    }
  }
}
