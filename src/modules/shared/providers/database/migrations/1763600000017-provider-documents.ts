import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export default class ProviderDocuments1763600000017 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'provider_documents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'provider_id', type: 'uuid' },
          {
            name: 'document_type',
            type: 'varchar',
            comment: 'CPF, CNPJ, RG, LICENSE, etc',
          },
          { name: 'document_url', type: 'varchar' },
          {
            name: 'status',
            type: 'varchar',
            comment: 'PENDING, APPROVED, REJECTED',
          },
          {
            name: 'uploaded_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          { name: 'reviewed_at', type: 'timestamp', isNullable: true },
          { name: 'reviewed_by', type: 'uuid', isNullable: true },
          { name: 'rejection_reason', type: 'text', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'provider_documents',
      new TableForeignKey({
        columnNames: ['provider_id'],
        referencedTableName: 'provider_profiles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('provider_documents');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('provider_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('provider_documents', foreignKey);
    }
    await queryRunner.dropTable('provider_documents');
  }
}
