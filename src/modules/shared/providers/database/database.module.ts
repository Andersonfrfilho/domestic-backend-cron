import { Module } from '@nestjs/common';

import { SharedProviderDatabaseImplementationsModule } from './implementations/database.implementation.module';

@Module({
  imports: [SharedProviderDatabaseImplementationsModule],
  exports: [SharedProviderDatabaseImplementationsModule],
})
export class SharedProviderDatabaseModule {}
