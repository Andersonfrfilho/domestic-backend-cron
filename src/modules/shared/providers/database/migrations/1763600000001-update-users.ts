import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export default class UpdateUsers1763600000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop old columns
    const columnsToDrop = [
      'name',
      'last_name',
      'active',
      'cpf',
      'rg',
      'email',
      'password_hash',
      'gender',
      'details',
      'birth_date',
      'updated_at',
      'deleted_at',
    ];

    for (const col of columnsToDrop) {
      const hasColumn = await queryRunner.hasColumn('users', col);
      if (hasColumn) {
        await queryRunner.dropColumn('users', col);
      }
    }

    // Add new columns matching DBML
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'keycloak_id',
        type: 'uuid',
        isUnique: true,
        isNullable: true,
      }),
      new TableColumn({
        name: 'full_name',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'status',
        type: 'varchar',
        default: "'PENDING'",
      }),
    ]);

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'users_keycloak_idx',
        columnNames: ['keycloak_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'users_keycloak_idx');

    const columnsToDrop = ['keycloak_id', 'full_name', 'status'];
    for (const col of columnsToDrop) {
      await queryRunner.dropColumn('users', col);
    }

    // Restore old columns
    await queryRunner.addColumns('users', [
      new TableColumn({ name: 'name', type: 'varchar', isNullable: true }),
      new TableColumn({ name: 'last_name', type: 'varchar', isNullable: true }),
      new TableColumn({ name: 'active', type: 'boolean', default: false }),
      new TableColumn({ name: 'cpf', type: 'varchar', isNullable: true }),
      new TableColumn({ name: 'rg', type: 'varchar', isNullable: true }),
      new TableColumn({ name: 'email', type: 'varchar', isNullable: true }),
      new TableColumn({ name: 'password_hash', type: 'varchar', isNullable: true }),
      new TableColumn({ name: 'gender', type: 'varchar', isNullable: true }),
      new TableColumn({ name: 'details', type: 'jsonb', isNullable: true }),
      new TableColumn({ name: 'birth_date', type: 'timestamp', isNullable: true }),
      new TableColumn({ name: 'updated_at', type: 'timestamp', isNullable: true }),
      new TableColumn({ name: 'deleted_at', type: 'timestamp', isNullable: true }),
    ]);
  }
}
