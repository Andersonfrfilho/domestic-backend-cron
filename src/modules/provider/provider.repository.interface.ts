import { ProviderProfile } from '@modules/shared/providers/database/entities/provider-profile.entity';
import { ProviderService } from '@modules/shared/providers/database/entities/provider-service.entity';
import { ProviderVerification } from '@modules/shared/providers/database/entities/provider-verification.entity';
import { ProviderWorkLocation } from '@modules/shared/providers/database/entities/provider-work-location.entity';

export interface CreateProviderParams {
  userId: string;
  businessName?: string;
  description?: string;
}

export interface UpdateProviderParams {
  businessName?: string;
  description?: string;
  isAvailable?: boolean;
}

export interface AddProviderServiceParams {
  providerId: string;
  serviceId: string;
  priceBase?: number;
  priceType?: string;
}

export interface AddWorkLocationParams {
  providerId: string;
  addressId: string;
  name?: string;
  isPrimary?: boolean;
}

export interface CreateVerificationParams {
  providerId: string;
  status: string;
  notes?: string;
}

export interface UpdateVerificationParams {
  status: string;
  reviewedBy?: string;
  notes?: string;
  reviewedAt?: Date;
}

export interface ProviderRepositoryInterface {
  create(params: CreateProviderParams): Promise<ProviderProfile>;
  findById(id: string): Promise<ProviderProfile | null>;
  findByUserId(userId: string): Promise<ProviderProfile | null>;
  listApproved(): Promise<ProviderProfile[]>;
  update(id: string, params: UpdateProviderParams): Promise<ProviderProfile>;

  addService(params: AddProviderServiceParams): Promise<ProviderService>;
  removeService(providerId: string, serviceId: string): Promise<void>;
  listServices(providerId: string): Promise<ProviderService[]>;
  findProviderService(providerId: string, serviceId: string): Promise<ProviderService | null>;

  addWorkLocation(params: AddWorkLocationParams): Promise<ProviderWorkLocation>;
  removeWorkLocation(providerId: string, locationId: string): Promise<void>;
  listWorkLocations(providerId: string): Promise<ProviderWorkLocation[]>;
  findWorkLocation(providerId: string, locationId: string): Promise<ProviderWorkLocation | null>;

  getLatestVerification(providerId: string): Promise<ProviderVerification | null>;
  createVerification(params: CreateVerificationParams): Promise<ProviderVerification>;
  updateVerification(id: string, params: UpdateVerificationParams): Promise<ProviderVerification>;
  listUnderReview(): Promise<ProviderProfile[]>;
}
