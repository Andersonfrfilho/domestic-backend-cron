import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

import { ServiceRequest } from '@modules/shared/providers/database/entities/service-request.entity';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';

import { RequestReminderService } from './request-reminder.service';

const makePendingRequest = (id: string) => ({
  id,
  contractor_id: `contractor-${id}`,
  provider_id: `provider-${id}`,
  scheduled_at: new Date(Date.now() + 60 * 60 * 1000),
});

describe('RequestReminderService', () => {
  let service: RequestReminderService;
  let repo: { query: jest.Mock };
  let amqp: { publish: jest.Mock };

  const buildModule = async (rows: ReturnType<typeof makePendingRequest>[]) => {
    repo = { query: jest.fn().mockResolvedValue(rows) };
    amqp = { publish: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestReminderService,
        { provide: getRepositoryToken(ServiceRequest, CONNECTIONS_NAMES.POSTGRES), useValue: repo },
        { provide: AmqpConnection, useValue: amqp },
      ],
    }).compile();

    service = module.get(RequestReminderService);
  };

  it('returns zero when no pending requests', async () => {
    await buildModule([]);
    const result = await service.run();
    expect(result.reminders_sent).toBe(0);
    expect(result.errors).toBe(0);
  });

  it('publishes reminder event for each pending request', async () => {
    await buildModule([makePendingRequest('req-1'), makePendingRequest('req-2')]);
    const result = await service.run();
    expect(result.reminders_sent).toBe(2);
    expect(amqp.publish).toHaveBeenCalledTimes(2);
    expect(amqp.publish).toHaveBeenCalledWith(
      'zolve.events',
      'notifications.reminder',
      expect.objectContaining({ entity_id: 'req-1' }),
    );
  });

  it('increments errors when publish fails', async () => {
    await buildModule([makePendingRequest('req-1')]);
    amqp.publish.mockRejectedValue(new Error('AMQP down'));
    const result = await service.run();
    expect(result.errors).toBe(1);
    expect(result.reminders_sent).toBe(0);
  });
});
