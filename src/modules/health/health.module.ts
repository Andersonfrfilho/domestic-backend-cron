import { LoggerModule } from '@adatechnology/logger';
import { Module } from '@nestjs/common';

@Module({
  imports: [LoggerModule],
  exports: [],
})
export class HealthModule {}
