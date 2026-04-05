import { Inject, Injectable, Logger } from '@nestjs/common';

import { FIREBASE_PROVIDER } from '@modules/shared/firebase/firebase.token';
import type { FirebaseProviderInterface } from '@modules/shared/firebase/firebase.interface';

import type { PushEvent } from './dtos/push.event.dto';

@Injectable()
export class PushHandler {
  private readonly logger = new Logger(PushHandler.name);

  constructor(
    @Inject(FIREBASE_PROVIDER)
    private readonly firebase: FirebaseProviderInterface,
  ) {}

  async handle(event: PushEvent): Promise<void> {
    if (!event.fcm_token) {
      this.logger.warn(`Push skipped — no FCM token for user: ${event.user_id}`);
      return;
    }

    await this.firebase.sendPush({
      fcmToken: event.fcm_token,
      title: event.title,
      body: event.body,
      data: event.data,
    });
  }
}
