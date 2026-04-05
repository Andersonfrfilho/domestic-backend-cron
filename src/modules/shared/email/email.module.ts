import { Module } from '@nestjs/common';

import { EMAIL_PROVIDER } from './email.token';
import { NodemailerProvider } from './nodemailer.provider';

@Module({
  providers: [{ provide: EMAIL_PROVIDER, useClass: NodemailerProvider }],
  exports: [EMAIL_PROVIDER],
})
export class EmailModule {}
