import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

import { ProviderVerification } from '@modules/shared/providers/database/entities/provider-verification.entity';
import { ProviderVerificationLog } from '@modules/shared/providers/database/entities/provider-verification-log.entity';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';
import { NotificationHandler } from '@modules/notification/notification.handler';

import { ProviderApprovalHandler } from './provider-approval.handler';

const mockVerificationRepo = {
  findOne: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};
const mockLogRepo = { create: jest.fn(), save: jest.fn() };
const mockAmqp = { publish: jest.fn().mockResolvedValue(undefined) };
const mockNotification = { persist: jest.fn().mockResolvedValue(undefined) };

const verification = { id: 'verif-1', providerId: 'prov-1', status: 'UNDER_REVIEW' };
const event = { provider_id: 'prov-1', user_id: 'user-1', email: 'p@test.com', fcm_token: 'fcm-token' };

describe('ProviderApprovalHandler', () => {
  let handler: ProviderApprovalHandler;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProviderApprovalHandler,
        { provide: getRepositoryToken(ProviderVerification, CONNECTIONS_NAMES.POSTGRES), useValue: mockVerificationRepo },
        { provide: getRepositoryToken(ProviderVerificationLog, CONNECTIONS_NAMES.POSTGRES), useValue: mockLogRepo },
        { provide: AmqpConnection, useValue: mockAmqp },
        { provide: NotificationHandler, useValue: mockNotification },
      ],
    }).compile();

    handler = module.get(ProviderApprovalHandler);
    jest.clearAllMocks();
    mockAmqp.publish.mockResolvedValue(undefined);
    mockNotification.persist.mockResolvedValue(undefined);
    mockLogRepo.create.mockReturnValue({});
    mockLogRepo.save.mockResolvedValue({});
  });

  describe('handleApproved', () => {
    it('updates verification to APPROVED and publishes notifications', async () => {
      mockVerificationRepo.findOne.mockResolvedValue(verification);
      mockVerificationRepo.update.mockResolvedValue({ affected: 1 });

      await handler.handleApproved(event);

      expect(mockVerificationRepo.update).toHaveBeenCalledWith('verif-1', expect.objectContaining({ status: 'APPROVED' }));
      expect(mockNotification.persist).toHaveBeenCalled();
      expect(mockAmqp.publish).toHaveBeenCalledWith('zolve.events', 'notifications.email', expect.any(Object));
    });

    it('is idempotent — skips if already APPROVED', async () => {
      mockVerificationRepo.findOne.mockResolvedValue({ ...verification, status: 'APPROVED' });

      await handler.handleApproved(event);

      expect(mockVerificationRepo.update).not.toHaveBeenCalled();
    });

    it('logs warning when verification not found', async () => {
      mockVerificationRepo.findOne.mockResolvedValue(null);

      await handler.handleApproved(event);

      expect(mockVerificationRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('handleRejected', () => {
    it('updates verification to REJECTED with reason', async () => {
      mockVerificationRepo.findOne.mockResolvedValue(verification);
      mockVerificationRepo.update.mockResolvedValue({ affected: 1 });
      const rejectedEvent = { ...event, reason: 'Docs incompletos' };

      await handler.handleRejected(rejectedEvent);

      expect(mockVerificationRepo.update).toHaveBeenCalledWith('verif-1', expect.objectContaining({ status: 'REJECTED' }));
      expect(mockNotification.persist).toHaveBeenCalled();
    });
  });
});
