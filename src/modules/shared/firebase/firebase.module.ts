import { Module } from '@nestjs/common';

import { FIREBASE_PROVIDER } from './firebase.token';
import { FirebaseAdminProvider } from './firebase-admin.provider';

@Module({
  providers: [{ provide: FIREBASE_PROVIDER, useClass: FirebaseAdminProvider }],
  exports: [FIREBASE_PROVIDER],
})
export class FirebaseModule {}
