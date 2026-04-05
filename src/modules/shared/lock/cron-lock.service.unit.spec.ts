import { Test, TestingModule } from '@nestjs/testing';

import { CronLockService } from './cron-lock.service';

// Mock ioredis antes de importar o serviço
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    del: jest.fn().mockResolvedValue(1),
    on: jest.fn(),
    disconnect: jest.fn(),
  }));
});

describe('CronLockService', () => {
  let service: CronLockService;
  let redisMock: { set: jest.Mock; del: jest.Mock; on: jest.Mock; disconnect: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CronLockService],
    }).compile();

    service = module.get(CronLockService);
    // Acessa o cliente Redis interno para configurar os mocks
    redisMock = (service as unknown as { client: typeof redisMock })['client'];
  });

  describe('acquire', () => {
    it('returns true when Redis SET NX succeeds (lock not held)', async () => {
      redisMock.set.mockResolvedValue('OK');
      const result = await service.acquire('test-job', 5000);
      expect(result).toBe(true);
      expect(redisMock.set).toHaveBeenCalledWith('cron:lock:test-job', '1', 'EX', 5, 'NX');
    });

    it('returns false when Redis SET NX returns null (lock already held)', async () => {
      redisMock.set.mockResolvedValue(null);
      const result = await service.acquire('test-job', 5000);
      expect(result).toBe(false);
    });

    it('returns true (fail-open) when Redis is unavailable', async () => {
      redisMock.set.mockRejectedValue(new Error('ECONNREFUSED'));
      const result = await service.acquire('test-job', 5000);
      expect(result).toBe(true); // fail-open: permite execução mesmo sem Redis
    });

    it('computes TTL in seconds from ms', async () => {
      redisMock.set.mockResolvedValue('OK');
      await service.acquire('test-job', 90000); // 90 000ms = 90s
      expect(redisMock.set).toHaveBeenCalledWith('cron:lock:test-job', '1', 'EX', 90, 'NX');
    });

    it('rounds up fractional seconds', async () => {
      redisMock.set.mockResolvedValue('OK');
      await service.acquire('test-job', 1500); // 1.5s → ceil → 2s
      expect(redisMock.set).toHaveBeenCalledWith('cron:lock:test-job', '1', 'EX', 2, 'NX');
    });
  });

  describe('release', () => {
    it('calls DEL on the correct key', async () => {
      await service.release('test-job');
      expect(redisMock.del).toHaveBeenCalledWith('cron:lock:test-job');
    });

    it('does not throw when DEL fails', async () => {
      redisMock.del.mockRejectedValue(new Error('connection lost'));
      await expect(service.release('test-job')).resolves.not.toThrow();
    });
  });
});
