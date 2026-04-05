import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProviderVerification } from '@modules/shared/providers/database/entities/provider-verification.entity';
import { ProviderVerificationLog } from '@modules/shared/providers/database/entities/provider-verification-log.entity';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';
import { NotificationModule } from '@modules/notification/notification.module';

import { ProviderApprovalHandler } from './provider-approval.handler';
import { ProviderApprovalConsumer } from './provider-approval.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProviderVerification, ProviderVerificationLog], CONNECTIONS_NAMES.POSTGRES),
    NotificationModule,
  ],
  providers: [ProviderApprovalHandler, ProviderApprovalConsumer],
})
export class ProviderApprovalModule {}
