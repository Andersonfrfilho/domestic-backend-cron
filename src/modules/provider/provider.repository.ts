import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';
import { ProviderService } from '@modules/shared/providers/database/entities/provider-service.entity';
import { ProviderVerification } from '@modules/shared/providers/database/entities/provider-verification.entity';
import { ProviderWorkLocation } from '@modules/shared/providers/database/entities/provider-work-location.entity';

import {
  AddProviderServiceParams,
  AddWorkLocationParams,
  CreateProviderParams,
  CreateVerificationParams,
  ProviderRepositoryInterface,
  UpdateProviderParams,
  UpdateVerificationParams,
} from './provider.repository.interface';
import { ProviderErrorFactory } from './factories/provider.error.factory';

@Injectable()
export class ProviderRepository implements ProviderRepositoryInterface {
  constructor(
    @InjectRepository(ProviderProfile, CONNECTIONS_NAMES.POSTGRES)
    private readonly profileRepo: Repository<ProviderProfile>,
    @InjectRepository(ProviderService, CONNECTIONS_NAMES.POSTGRES)
    private readonly serviceRepo: Repository<ProviderService>,
    @InjectRepository(ProviderVerification, CONNECTIONS_NAMES.POSTGRES)
    private readonly verificationRepo: Repository<ProviderVerification>,
    @InjectRepository(ProviderWorkLocation, CONNECTIONS_NAMES.POSTGRES)
    private readonly workLocationRepo: Repository<ProviderWorkLocation>,
  ) {}

  async create(params: CreateProviderParams): Promise<ProviderProfile> {
    const profile = this.profileRepo.create(params);
    return this.profileRepo.save(profile);
  }

  async findById(id: string): Promise<ProviderProfile | null> {
    return this.profileRepo.findOne({ where: { id } });
  }

  async findByUserId(userId: string): Promise<ProviderProfile | null> {
    return this.profileRepo.findOne({ where: { userId } });
  }

  async listApproved(): Promise<ProviderProfile[]> {
    return this.profileRepo
      .createQueryBuilder('p')
      .innerJoin(
        (qb) =>
          qb
            .select('v.provider_id', 'provider_id')
            .addSelect('MAX(v.submitted_at)', 'last_submitted')
            .from('provider_verifications', 'v')
            .groupBy('v.provider_id'),
        'latest',
        'latest.provider_id = p.id',
      )
      .innerJoin(
        'provider_verifications',
        'v',
        'v.provider_id = p.id AND v.submitted_at = latest.last_submitted',
      )
      .where('v.status = :status', { status: 'APPROVED' })
      .getMany();
  }

  async update(id: string, params: UpdateProviderParams): Promise<ProviderProfile> {
    await this.profileRepo.update(id, params);
    const updated = await this.findById(id);
    if (!updated) throw ProviderErrorFactory.notFound(id);
    return updated;
  }

  async addService(params: AddProviderServiceParams): Promise<ProviderService> {
    const providerService = this.serviceRepo.create(params);
    return this.serviceRepo.save(providerService);
  }

  async removeService(providerId: string, serviceId: string): Promise<void> {
    await this.serviceRepo.delete({ providerId, serviceId });
  }

  async listServices(providerId: string): Promise<ProviderService[]> {
    return this.serviceRepo.find({ where: { providerId } });
  }

  async findProviderService(providerId: string, serviceId: string): Promise<ProviderService | null> {
    return this.serviceRepo.findOne({ where: { providerId, serviceId } });
  }

  async addWorkLocation(params: AddWorkLocationParams): Promise<ProviderWorkLocation> {
    const location = this.workLocationRepo.create(params);
    return this.workLocationRepo.save(location);
  }

  async removeWorkLocation(providerId: string, locationId: string): Promise<void> {
    await this.workLocationRepo.delete({ id: locationId, providerId });
  }

  async listWorkLocations(providerId: string): Promise<ProviderWorkLocation[]> {
    return this.workLocationRepo.find({ where: { providerId, isActive: true } });
  }

  async findWorkLocation(providerId: string, locationId: string): Promise<ProviderWorkLocation | null> {
    return this.workLocationRepo.findOne({ where: { id: locationId, providerId } });
  }

  async getLatestVerification(providerId: string): Promise<ProviderVerification | null> {
    return this.verificationRepo.findOne({
      where: { providerId },
      order: { submittedAt: 'DESC' },
    });
  }

  async createVerification(params: CreateVerificationParams): Promise<ProviderVerification> {
    const verification = this.verificationRepo.create(params);
    return this.verificationRepo.save(verification);
  }

  async updateVerification(id: string, params: UpdateVerificationParams): Promise<ProviderVerification> {
    await this.verificationRepo.update(id, params);
    return this.verificationRepo.findOne({ where: { id } }) as Promise<ProviderVerification>;
  }

  async listUnderReview(): Promise<ProviderProfile[]> {
    return this.profileRepo
      .createQueryBuilder('p')
      .innerJoin(
        (qb) =>
          qb
            .select('v.provider_id', 'provider_id')
            .addSelect('MAX(v.submitted_at)', 'last_submitted')
            .from('provider_verifications', 'v')
            .groupBy('v.provider_id'),
        'latest',
        'latest.provider_id = p.id',
      )
      .innerJoin(
        'provider_verifications',
        'v',
        'v.provider_id = p.id AND v.submitted_at = latest.last_submitted',
      )
      .where('v.status = :status', { status: 'UNDER_REVIEW' })
      .getMany();
  }
}
