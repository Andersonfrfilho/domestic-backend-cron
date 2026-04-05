import { Test } from '@nestjs/testing';

import { EMAIL_PROVIDER } from '@modules/shared/email/email.token';

import { EmailHandler } from './email.handler';

const mockEmailProvider = { send: jest.fn().mockResolvedValue(undefined) };

describe('EmailHandler', () => {
  let handler: EmailHandler;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EmailHandler,
        { provide: EMAIL_PROVIDER, useValue: mockEmailProvider },
      ],
    }).compile();

    handler = module.get(EmailHandler);
    jest.clearAllMocks();
  });

  it('renders template and sends email', async () => {
    await handler.handle({
      to: 'user@test.com',
      template_id: 'welcome',
      variables: { name: 'Anderson', app_url: 'https://app.zolve.com.br' },
    });

    expect(mockEmailProvider.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'user@test.com', subject: 'Bem-vindo à ZOLVE!' }),
    );
  });

  it('logs error and skips for unknown template', async () => {
    await handler.handle({
      to: 'user@test.com',
      template_id: 'unknown-template',
      variables: {},
    });

    expect(mockEmailProvider.send).not.toHaveBeenCalled();
  });
});
