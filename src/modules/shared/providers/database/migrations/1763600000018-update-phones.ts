import { MigrationInterface, QueryRunner, TableColumn, TableUnique } from 'typeorm';

export default class UpdatePhones1763600000018 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop FK and old columns not in DBML
    const table = await queryRunner.getTable('phones');
    if (table) {
      const fk = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('user_id') !== -1,
      );
      if (fk) {
        await queryRunner.dropForeignKey('phones', fk);
      }
    }

    const columnsToDrop = ['country', 'area', 'user_id', 'updated_at', 'deleted_at'];
    for (const col of columnsToDrop) {
      const hasColumn = await queryRunner.hasColumn('phones', col);
      if (hasColumn) {
        await queryRunner.dropColumn('phones', col);
      }
    }

    // Add DBML columns
    await queryRunner.addColumns('phones', [
      new TableColumn({
        name: 'type',
        type: 'varchar',
        isNullable: true,
        comment: 'MOBILE, LANDLINE, WHATSAPP',
      }),
      new TableColumn({
        name: 'is_verified',
        type: 'boolean',
        default: false,
      }),
    ]);

    // Make number unique
    await queryRunner.createUniqueConstraint(
      'phones',
      new TableUnique({
        name: 'UQ_phones_number',
        columnNames: ['number'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraint('phones', 'UQ_phones_number');

    const columnsToDrop = ['type', 'is_verified'];
    for (const col of columnsToDrop) {
      await queryRunner.dropColumn('phones', col);
    }

    // Restore old columns
    await queryRunner.addColumns('phones', [
      new TableColumn({ name: 'country', type: 'varchar', isNullable: true }),
      new TableColumn({ name: 'area', type: 'varchar', isNullable: true }),
      new TableColumn({ name: 'user_id', type: 'uuid', isNullable: true }),
      new TableColumn({ name: 'updated_at', type: 'timestamp', isNullable: true }),
      new TableColumn({ name: 'deleted_at', type: 'timestamp', isNullable: true }),
    ]);
  }
}
