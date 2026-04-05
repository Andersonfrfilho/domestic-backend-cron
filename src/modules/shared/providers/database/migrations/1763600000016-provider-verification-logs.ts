import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export default class ProviderVerificationLogs1763600000016 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'provider_verification_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'verification_id', type: 'uuid' },
          {
            name: 'action',
            type: 'varchar',
            comment: 'SUBMITTED, MOVED_TO_REVIEW, APPROVED, REJECTED',
          },
          {
            name: 'performed_by',
            type: 'uuid',
            isNullable: true,
            comment: 'ID do usuário/admin',
          },
          { name: 'previous_status', type: 'varchar', isNullable: true },
          { name: 'new_status', type: 'varchar', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'provider_verification_logs',
      new TableForeignKey({
        columnNames: ['verification_id'],
        referencedTableName: 'provider_verifications',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('provider_verification_logs');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('verification_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('provider_verification_logs', foreignKey);
    }
    await queryRunner.dropTable('provider_verification_logs');
  }
}
