import { NotFoundErrorConfig, ConflictErrorConfig, BusinessLogicErrorConfig } from './error-config.interface';

export const PROVIDER_ERROR_CONFIGS = {
  notFound: (id?: string): NotFoundErrorConfig => ({
    message: 'Provider not found',
    code: 'PROVIDER_NOT_FOUND',
    details: { id },
  }),
  alreadyExists: (userId: string): ConflictErrorConfig => ({
    message: 'Provider profile already exists for this user',
    code: 'PROVIDER_ALREADY_EXISTS',
    details: { userId },
  }),
  notApproved: (id: string): BusinessLogicErrorConfig => ({
    message: 'Provider is not approved',
    code: 'PROVIDER_NOT_APPROVED',
    details: { id },
  }),
  serviceAlreadyLinked: (serviceId: string): ConflictErrorConfig => ({
    message: 'Service already linked to this provider',
    code: 'PROVIDER_SERVICE_ALREADY_LINKED',
    details: { serviceId },
  }),
  serviceNotLinked: (serviceId: string): NotFoundErrorConfig => ({
    message: 'Service not linked to this provider',
    code: 'PROVIDER_SERVICE_NOT_LINKED',
    details: { serviceId },
  }),
  workLocationNotFound: (locationId: string): NotFoundErrorConfig => ({
    message: 'Work location not found',
    code: 'PROVIDER_WORK_LOCATION_NOT_FOUND',
    details: { locationId },
  }),
  verificationNotFound: (providerId: string): NotFoundErrorConfig => ({
    message: 'Verification not found for provider',
    code: 'PROVIDER_VERIFICATION_NOT_FOUND',
    details: { providerId },
  }),
  invalidVerificationStatus: (status: string): BusinessLogicErrorConfig => ({
    message: `Cannot perform this action with verification status: ${status}`,
    code: 'PROVIDER_INVALID_VERIFICATION_STATUS',
    details: { status },
  }),
};
