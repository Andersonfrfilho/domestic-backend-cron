import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export default class User1763256695093 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar' },
          { name: 'last_name', type: 'varchar' },
          { name: 'active', type: 'boolean', default: false },
          { name: 'cpf', type: 'varchar' },
          { name: 'rg', type: 'varchar' },
          { name: 'email', type: 'varchar' },
          { name: 'password_hash', type: 'varchar' },
          { name: 'gender', type: 'varchar' },
          { name: 'details', type: 'jsonb', isNullable: true },
          { name: 'birth_date', type: 'timestamp' },
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
    await queryRunner.dropTable('users');
  }
}
