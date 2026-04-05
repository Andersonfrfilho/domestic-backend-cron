import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export default class UserPhones1763600000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_phones',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid' },
          { name: 'phone_id', type: 'uuid' },
          { name: 'label', type: 'varchar', isNullable: true },
          { name: 'is_primary', type: 'boolean', default: false },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('user_phones', [
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
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
    const table = await queryRunner.getTable('user_phones');
    if (table) {
      for (const fk of table.foreignKeys) {
        await queryRunner.dropForeignKey('user_phones', fk);
      }
    }
    await queryRunner.dropTable('user_phones');
  }
}
