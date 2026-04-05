import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export default class ProviderEmails1763600000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'provider_emails',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'provider_id', type: 'uuid' },
          { name: 'email_id', type: 'uuid' },
          { name: 'label', type: 'varchar', isNullable: true },
          { name: 'is_primary', type: 'boolean', default: false },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('provider_emails', [
      new TableForeignKey({
        columnNames: ['provider_id'],
        referencedTableName: 'provider_profiles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['email_id'],
        referencedTableName: 'emails',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('provider_emails');
    if (table) {
      for (const fk of table.foreignKeys) {
        await queryRunner.dropForeignKey('provider_emails', fk);
      }
    }
    await queryRunner.dropTable('provider_emails');
  }
}
