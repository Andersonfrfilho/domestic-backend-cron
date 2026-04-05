import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export default class Services1763600000009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'services',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'category_id', type: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'description', type: 'text', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'services',
      new TableForeignKey({
        columnNames: ['category_id'],
        referencedTableName: 'categories',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('services');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('category_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('services', foreignKey);
    }
    await queryRunner.dropTable('services');
  }
}
