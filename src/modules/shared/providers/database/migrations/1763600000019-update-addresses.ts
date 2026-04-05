import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class UpdateAddresses1763600000019 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop columns not in DBML
    const columnsToDrop = ['country', 'active', 'updated_at', 'deleted_at'];
    for (const col of columnsToDrop) {
      const hasColumn = await queryRunner.hasColumn('addresses', col);
      if (hasColumn) {
        await queryRunner.dropColumn('addresses', col);
      }
    }

    // Remove default from complement (DBML has no default)
    const hasComplement = await queryRunner.hasColumn('addresses', 'complement');
    if (hasComplement) {
      await queryRunner.changeColumn(
        'addresses',
        'complement',
        new TableColumn({
          name: 'complement',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore complement default
    await queryRunner.changeColumn(
      'addresses',
      'complement',
      new TableColumn({
        name: 'complement',
        type: 'varchar',
        default: "''",
      }),
    );

    // Restore old columns
    await queryRunner.addColumns('addresses', [
      new TableColumn({ name: 'country', type: 'varchar', default: "'BR'" }),
      new TableColumn({ name: 'active', type: 'boolean', default: true }),
      new TableColumn({ name: 'updated_at', type: 'timestamp', isNullable: true }),
      new TableColumn({ name: 'deleted_at', type: 'timestamp', isNullable: true }),
    ]);
  }
}
