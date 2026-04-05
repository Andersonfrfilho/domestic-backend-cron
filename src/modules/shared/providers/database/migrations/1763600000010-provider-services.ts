import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export default class ProviderServices1763600000010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'provider_services',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'provider_id', type: 'uuid' },
          { name: 'service_id', type: 'uuid' },
          { name: 'price_base', type: 'decimal', isNullable: true },
          { name: 'price_type', type: 'varchar', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('provider_services', [
      new TableForeignKey({
        columnNames: ['provider_id'],
        referencedTableName: 'provider_profiles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['service_id'],
        referencedTableName: 'services',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('provider_services');
    if (table) {
      for (const fk of table.foreignKeys) {
        await queryRunner.dropForeignKey('provider_services', fk);
      }
    }
    await queryRunner.dropTable('provider_services');
  }
}
