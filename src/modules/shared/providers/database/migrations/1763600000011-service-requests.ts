import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export default class ServiceRequests1763600000011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'service_requests',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'contractor_id', type: 'uuid' },
          { name: 'provider_id', type: 'uuid' },
          { name: 'service_id', type: 'uuid' },
          { name: 'address_id', type: 'uuid' },
          { name: 'status', type: 'varchar' },
          { name: 'contractor_confirmed', type: 'boolean', default: false },
          { name: 'provider_confirmed', type: 'boolean', default: false },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'scheduled_at', type: 'timestamp', isNullable: true },
          { name: 'price_final', type: 'decimal', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('service_requests', [
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
      new TableForeignKey({
        columnNames: ['service_id'],
        referencedTableName: 'services',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['address_id'],
        referencedTableName: 'addresses',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('service_requests');
    if (table) {
      for (const fk of table.foreignKeys) {
        await queryRunner.dropForeignKey('service_requests', fk);
      }
    }
    await queryRunner.dropTable('service_requests');
  }
}
