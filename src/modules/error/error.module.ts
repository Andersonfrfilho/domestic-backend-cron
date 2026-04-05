import { Module } from '@nestjs/common';

import { FilterErrorModule } from '@modules/error/filters/filter.error.module';

@Module({
  imports: [FilterErrorModule],
  exports: [FilterErrorModule],
})
export class ErrorModule {}
