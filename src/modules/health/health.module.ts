import { LoggerModule } from '@adatechnology/logger';
import { Module } from '@nestjs/common';

import { HealthController } from './health.controller';

@Module({
  imports: [LoggerModule],
  controllers: [HealthController],
  exports: [],
})
export class HealthModule {}
