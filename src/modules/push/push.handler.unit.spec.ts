import { Test } from '@nestjs/testing';

import { FIREBASE_PROVIDER } from '@modules/shared/firebase/firebase.token';

import { PushHandler } from './push.handler';

const mockFirebase = { sendPush: jest.fn().mockResolvedValue(undefined) };

describe('PushHandler', () => {
  let handler: PushHandler;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PushHandler,
        { provide: FIREBASE_PROVIDER, useValue: mockFirebase },
      ],
    }).compile();

    handler = module.get(PushHandler);
    jest.clearAllMocks();
  });

  it('sends push when fcm_token is provided', async () => {
    await handler.handle({
      user_id: 'user-1',
      fcm_token: 'token-abc',
      title: 'Teste',
      body: 'Mensagem de teste',
    });

    expect(mockFirebase.sendPush).toHaveBeenCalledWith(
      expect.objectContaining({ fcmToken: 'token-abc', title: 'Teste' }),
    );
  });

  it('skips push when fcm_token is absent', async () => {
    await handler.handle({ user_id: 'user-1', title: 'Teste', body: 'Mensagem' });

    expect(mockFirebase.sendPush).not.toHaveBeenCalled();
  });
});
