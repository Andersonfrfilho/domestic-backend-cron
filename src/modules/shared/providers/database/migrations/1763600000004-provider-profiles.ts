import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export default class ProviderProfiles1763600000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'provider_profiles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid', isUnique: true },
          { name: 'business_name', type: 'varchar', isNullable: true },
          { name: 'description', type: 'text', isNullable: true },
          {
            name: 'average_rating',
            type: 'decimal',
            default: 0,
          },
          { name: 'is_available', type: 'boolean', default: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'provider_profiles',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('provider_profiles');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('user_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('provider_profiles', foreignKey);
    }
    await queryRunner.dropTable('provider_profiles');
  }
}
