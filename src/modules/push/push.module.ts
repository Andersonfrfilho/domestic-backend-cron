import { Module } from '@nestjs/common';

import { FirebaseModule } from '@modules/shared/firebase/firebase.module';

import { PushHandler } from './push.handler';
import { PushConsumer } from './push.consumer';

@Module({
  imports: [FirebaseModule],
  providers: [PushHandler, PushConsumer],
})
export class PushModule {}
