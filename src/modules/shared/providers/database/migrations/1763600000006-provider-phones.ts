import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export default class ProviderPhones1763600000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'provider_phones',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'provider_id', type: 'uuid' },
          { name: 'phone_id', type: 'uuid' },
          { name: 'label', type: 'varchar', isNullable: true },
          { name: 'is_primary', type: 'boolean', default: false },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('provider_phones', [
      new TableForeignKey({
        columnNames: ['provider_id'],
        referencedTableName: 'provider_profiles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['phone_id'],
        referencedTableName: 'phones',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('provider_phones');
    if (table) {
      for (const fk of table.foreignKeys) {
        await queryRunner.dropForeignKey('provider_phones', fk);
      }
    }
    await queryRunner.dropTable('provider_phones');
  }
}
