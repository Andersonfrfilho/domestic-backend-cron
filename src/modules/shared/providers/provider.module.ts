import { LoggerModule } from '@adatechnology/logger';
import { Module } from '@nestjs/common';

import { SharedProviderDatabaseModule } from './database/database.module';
import { SharedInfrastructureProviderQueueModule } from './queue/queue.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [LoggerModule, SharedProviderDatabaseModule, SharedInfrastructureProviderQueueModule, StorageModule],
  exports: [LoggerModule, SharedProviderDatabaseModule, SharedInfrastructureProviderQueueModule, StorageModule],
})
export class SharedProviderModule {}
