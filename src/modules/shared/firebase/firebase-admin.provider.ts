import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

import type { FirebaseProviderInterface, SendPushParams } from './firebase.interface';

@Injectable()
export class FirebaseAdminProvider implements FirebaseProviderInterface, OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminProvider.name);

  onModuleInit() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn('Firebase credentials not configured — push notifications disabled');
      return;
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  async sendPush(params: SendPushParams): Promise<void> {
    if (!admin.apps.length) {
      this.logger.warn(`Push skipped (Firebase not configured) — user fcm: ${params.fcmToken}`);
      return;
    }

    await admin.messaging().send({
      token: params.fcmToken,
      notification: { title: params.title, body: params.body },
      data: params.data,
    });

    this.logger.log(`Push sent — title: "${params.title}"`);
  }
}
