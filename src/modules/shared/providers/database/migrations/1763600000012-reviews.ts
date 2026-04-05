import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export default class Reviews1763600000012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'reviews',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'service_request_id', type: 'uuid', isUnique: true },
          { name: 'contractor_id', type: 'uuid' },
          { name: 'provider_id', type: 'uuid' },
          { name: 'rating', type: 'int' },
          { name: 'comment', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('reviews', [
      new TableForeignKey({
        columnNames: ['service_request_id'],
        referencedTableName: 'service_requests',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['contractor_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['provider_id'],
        referencedTableName: 'provider_profiles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('reviews');
    if (table) {
      for (const fk of table.foreignKeys) {
        await queryRunner.dropForeignKey('reviews', fk);
      }
    }
    await queryRunner.dropTable('reviews');
  }
}
