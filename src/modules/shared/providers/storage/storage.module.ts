import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MinioStorageProvider } from './minio.provider';
import { STORAGE_PROVIDER } from './storage.token';

@Module({
  imports: [ConfigModule],
  providers: [
    { provide: STORAGE_PROVIDER, useClass: MinioStorageProvider },
  ],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
