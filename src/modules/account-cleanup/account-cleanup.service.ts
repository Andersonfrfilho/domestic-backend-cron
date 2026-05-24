import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { User } from '@modules/shared/providers/database/entities/user.entity';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';

export interface AccountCleanupResult {
  accounts_deleted: number;
  accounts_skipped: number;
  errors: number;
  duration_ms: number;
}

const BATCH_SIZE = 50;

@Injectable()
export class AccountCleanupService {
  private readonly logger = new Logger(AccountCleanupService.name);

  constructor(
    @InjectRepository(User, CONNECTIONS_NAMES.POSTGRES)
    private readonly userRepo: Repository<User>,
    @InjectDataSource(CONNECTIONS_NAMES.POSTGRES)
    private readonly dataSource: DataSource,
  ) {}

  async run(): Promise<AccountCleanupResult> {
    const start = Date.now();
    let accounts_deleted = 0;
    let accounts_skipped = 0;
    let errors = 0;

    const expiryDays = Number(process.env.PENDING_ACCOUNT_EXPIRY_DAYS ?? 7);

    const expiredUsers: Array<{ id: string }> = await this.userRepo.query(`
      SELECT id FROM users
      WHERE status = 'PENDING'
        AND created_at < NOW() - INTERVAL '${expiryDays} days'
    `);

    this.logger.log(`Found ${expiredUsers.length} expired PENDING accounts`);

    for (let i = 0; i < expiredUsers.length; i += BATCH_SIZE) {
      const batch = expiredUsers.slice(i, i + BATCH_SIZE);
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        for (const { id } of batch) {
          // Verifica se tem service_requests ativos
          const [active]: [{ count: string }] = await queryRunner.query(
            `SELECT COUNT(*)::INT as count FROM service_requests
             WHERE contractor_id = $1 AND status IN ('PENDING','ACCEPTED')`,
            [id],
          );

          if (Number(active.count) > 0) {
            this.logger.warn(`Skipping user ${id} — has active service_requests`);
            accounts_skipped++;
            continue;
          }

          await queryRunner.query(`DELETE FROM user_emails    WHERE user_id = $1`, [id]);
          await queryRunner.query(`DELETE FROM user_phones    WHERE user_id = $1`, [id]);
          await queryRunner.query(`DELETE FROM user_addresses WHERE user_id = $1`, [id]);
          await queryRunner.query(`DELETE FROM users          WHERE id = $1`, [id]);
          accounts_deleted++;
        }

        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        this.logger.error(`Batch rollback — batch start index ${i}`, err);
        errors++;
      } finally {
        await queryRunner.release();
      }
    }

    return { accounts_deleted, accounts_skipped, errors, duration_ms: Date.now() - start };
  }
}
