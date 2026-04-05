import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';
import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';

import { WeeklyReportService } from './weekly-report.service';

const makeProviderRow = (providerId: string) => ({
  provider_id: providerId,
  user_id: `user-${providerId}`,
  completed_count: '5',
  cancelled_count: '1',
  total_earned: '500.00',
  average_rating: '4.50',
});

describe('WeeklyReportService', () => {
  let service: WeeklyReportService;
  let repo: { query: jest.Mock };
  let amqp: { publish: jest.Mock };

  const buildModule = async (rows: ReturnType<typeof makeProviderRow>[]) => {
    repo = { query: jest.fn().mockResolvedValue(rows) };
    amqp = { publish: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeeklyReportService,
        { provide: getRepositoryToken(ProviderProfile, CONNECTIONS_NAMES.POSTGRES), useValue: repo },
        { provide: AmqpConnection, useValue: amqp },
      ],
    }).compile();

    service = module.get(WeeklyReportService);
  };

  it('returns zero when no active providers with activity', async () => {
    await buildModule([]);
    const result = await service.run();
    expect(result.reports_sent).toBe(0);
    expect(result.providers_processed).toBe(0);
    expect(result.errors).toBe(0);
  });

  it('publishes weekly-provider-report email for each provider', async () => {
    await buildModule([makeProviderRow('p1'), makeProviderRow('p2')]);
    const result = await service.run();
    expect(result.reports_sent).toBe(2);
    expect(result.providers_processed).toBe(2);
    expect(amqp.publish).toHaveBeenCalledWith(
      'zolve.events',
      'notifications.email',
      expect.objectContaining({ template_id: 'weekly-provider-report' }),
    );
  });

  it('increments errors when publish fails', async () => {
    await buildModule([makeProviderRow('p1')]);
    amqp.publish.mockRejectedValue(new Error('AMQP down'));
    const result = await service.run();
    expect(result.errors).toBe(1);
    expect(result.reports_sent).toBe(0);
    expect(result.providers_processed).toBe(1);
  });
});
