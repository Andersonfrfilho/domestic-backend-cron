import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export default class Addresses1763450000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'addresses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'street', type: 'varchar' },
          { name: 'number', type: 'varchar' },
          { name: 'complement', type: 'varchar', default: "''" },
          { name: 'neighborhood', type: 'varchar' },
          { name: 'city', type: 'varchar' },
          { name: 'state', type: 'varchar' },
          { name: 'zipcode', type: 'varchar' },
          { name: 'country', type: 'varchar', default: "'BR'" },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 10,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'longitude',
            type: 'decimal',
            precision: 11,
            scale: 8,
            isNullable: true,
          },
          { name: 'is_verified', type: 'boolean', default: false },
          { name: 'active', type: 'boolean', default: true },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          { name: 'updated_at', type: 'timestamp', isNullable: true },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('addresses');
  }
}
