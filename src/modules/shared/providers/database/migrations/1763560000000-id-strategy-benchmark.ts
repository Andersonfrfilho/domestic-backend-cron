import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export default class IDStrategyBenchmark1763560000000 implements MigrationInterface {
  private readonly benchmarkColumns = (idType: string, idOptions: Record<string, unknown> = {}) => [
    {
      name: 'id',
      type: idType,
      isPrimary: true,
      ...idOptions,
    },
    { name: 'name', type: 'varchar', length: '255' },
    { name: 'email', type: 'varchar', length: '255' },
    { name: 'age', type: 'integer' },
    { name: 'city', type: 'varchar', length: '100' },
    { name: 'data', type: 'jsonb', isNullable: true },
    {
      name: 'created_at',
      type: 'timestamp',
      default: 'CURRENT_TIMESTAMP',
    },
    { name: 'updated_at', type: 'timestamp', isNullable: true },
  ];

  private readonly tables = [
    { name: 'benchmark_uuid_v7', idType: 'uuid', idOptions: {}, prefix: 'uuid_v7' },
    { name: 'benchmark_nanoid', idType: 'varchar', idOptions: { length: '21' }, prefix: 'nanoid' },
    { name: 'benchmark_snowflake', idType: 'bigint', idOptions: {}, prefix: 'snowflake' },
    { name: 'benchmark_uuid_v4', idType: 'uuid', idOptions: {}, prefix: 'uuid_v4' },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const t of this.tables) {
      await queryRunner.createTable(
        new Table({
          name: t.name,
          columns: this.benchmarkColumns(t.idType, t.idOptions),
        }),
        true,
      );

      await queryRunner.createIndices(t.name, [
        new TableIndex({ name: `idx_${t.prefix}_email`, columnNames: ['email'] }),
        new TableIndex({ name: `idx_${t.prefix}_city`, columnNames: ['city'] }),
        new TableIndex({ name: `idx_${t.prefix}_created_at`, columnNames: ['created_at'] }),
      ]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const t of this.tables.reverse()) {
      await queryRunner.dropTable(t.name);
    }
  }
}
