import { Module } from '@nestjs/common';

import { SharedProviderDatabaseImplementationsMongoModule } from './mongo/mongo.module';
import { SharedProviderDatabaseImplementationsPostgresModule } from './postgres/postgres.module';

@Module({
  imports: [
    SharedProviderDatabaseImplementationsPostgresModule,
    SharedProviderDatabaseImplementationsMongoModule,
  ],
  exports: [
    SharedProviderDatabaseImplementationsPostgresModule,
    SharedProviderDatabaseImplementationsMongoModule,
  ],
})
export class SharedProviderDatabaseImplementationsModule {}
