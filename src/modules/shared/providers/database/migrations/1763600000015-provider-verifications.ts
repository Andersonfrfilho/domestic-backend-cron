import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export default class ProviderVerifications1763600000015 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'provider_verifications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'provider_id', type: 'uuid' },
          {
            name: 'status',
            type: 'varchar',
            comment: 'PENDING, UNDER_REVIEW, APPROVED, REJECTED',
          },
          {
            name: 'submitted_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          { name: 'reviewed_at', type: 'timestamp', isNullable: true },
          {
            name: 'reviewed_by',
            type: 'uuid',
            isNullable: true,
            comment: 'ID do admin (Keycloak ou interno)',
          },
          { name: 'notes', type: 'text', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'provider_verifications',
      new TableForeignKey({
        columnNames: ['provider_id'],
        referencedTableName: 'provider_profiles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('provider_verifications');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('provider_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('provider_verifications', foreignKey);
    }
    await queryRunner.dropTable('provider_verifications');
  }
}
