import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { User } from '@modules/shared/providers/database/entities/user.entity';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';

import { AccountCleanupService } from './account-cleanup.service';

const makeQueryRunner = (activeCount = 0) => ({
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  query: jest.fn().mockImplementation((sql: string) => {
    if (sql.includes('COUNT(*)')) return [{ count: String(activeCount) }];
    return [];
  }),
});

const makeRepo = (expiredUsers: Array<{ id: string }>) => ({
  query: jest.fn().mockResolvedValue(expiredUsers),
});

const makeDataSource = (queryRunner: ReturnType<typeof makeQueryRunner>) => ({
  createQueryRunner: jest.fn().mockReturnValue(queryRunner),
});

describe('AccountCleanupService', () => {
  let service: AccountCleanupService;
  let repo: ReturnType<typeof makeRepo>;
  let queryRunner: ReturnType<typeof makeQueryRunner>;
  let dataSource: ReturnType<typeof makeDataSource>;

  const buildModule = async (expiredUsers: Array<{ id: string }>, activeCount = 0) => {
    queryRunner = makeQueryRunner(activeCount);
    repo = makeRepo(expiredUsers);
    dataSource = makeDataSource(queryRunner);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountCleanupService,
        { provide: getRepositoryToken(User, CONNECTIONS_NAMES.POSTGRES), useValue: repo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get(AccountCleanupService);
  };

  it('returns zero counts when no expired users', async () => {
    await buildModule([]);
    const result = await service.run();
    expect(result.accounts_deleted).toBe(0);
    expect(result.accounts_skipped).toBe(0);
    expect(result.errors).toBe(0);
  });

  it('deletes users without active service requests', async () => {
    await buildModule([{ id: 'user-1' }, { id: 'user-2' }], 0);
    const result = await service.run();
    expect(result.accounts_deleted).toBe(2);
    expect(result.accounts_skipped).toBe(0);
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
  });

  it('skips users with active service requests', async () => {
    await buildModule([{ id: 'user-1' }], 2);
    const result = await service.run();
    expect(result.accounts_deleted).toBe(0);
    expect(result.accounts_skipped).toBe(1);
  });

  it('records error and rolls back on transaction failure', async () => {
    await buildModule([{ id: 'user-1' }], 0);
    queryRunner.commitTransaction.mockRejectedValue(new Error('DB error'));
    const result = await service.run();
    expect(result.errors).toBe(1);
    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalled();
  });

  it('returns duration_ms in result', async () => {
    await buildModule([]);
    const result = await service.run();
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
  });
});
