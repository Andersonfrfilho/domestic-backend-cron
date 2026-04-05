import { Module } from '@nestjs/common';

import { NotificationModule } from '@modules/notification/notification.module';

import { ServiceRequestHandler } from './service-request.handler';
import { ServiceRequestConsumer } from './service-request.consumer';

@Module({
  imports: [NotificationModule],
  providers: [ServiceRequestHandler, ServiceRequestConsumer],
})
export class ServiceRequestWorkerModule {}
