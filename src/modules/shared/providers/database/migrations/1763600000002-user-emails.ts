import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export default class UserEmails1763600000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_emails',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid' },
          { name: 'email_id', type: 'uuid' },
          { name: 'label', type: 'varchar', isNullable: true },
          { name: 'is_primary', type: 'boolean', default: false },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('user_emails', [
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
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
    const table = await queryRunner.getTable('user_emails');
    if (table) {
      for (const fk of table.foreignKeys) {
        await queryRunner.dropForeignKey('user_emails', fk);
      }
    }
    await queryRunner.dropTable('user_emails');
  }
}
