import { Module } from '@nestjs/common';

import { EmailModule as EmailProviderModule } from '@modules/shared/email/email.module';

import { EmailHandler } from './email.handler';
import { EmailConsumer } from './email.consumer';

@Module({
  imports: [EmailProviderModule],
  providers: [EmailHandler, EmailConsumer],
})
export class EmailModule {}
