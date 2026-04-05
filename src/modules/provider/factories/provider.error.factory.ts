import { BaseErrorFactory } from '@modules/error/factories';
import { PROVIDER_ERROR_CONFIGS } from '@modules/error/configs';

export class ProviderErrorFactory extends BaseErrorFactory {
  static notFound(id: string) {
    return this.createNotFound(PROVIDER_ERROR_CONFIGS.notFound(id));
  }

  static alreadyExists(userId: string) {
    return this.createConflict(PROVIDER_ERROR_CONFIGS.alreadyExists(userId));
  }

  static notApproved(id: string) {
    return this.createBusinessLogic(PROVIDER_ERROR_CONFIGS.notApproved(id));
  }

  static serviceAlreadyLinked(serviceId: string) {
    return this.createConflict(PROVIDER_ERROR_CONFIGS.serviceAlreadyLinked(serviceId));
  }

  static serviceNotLinked(serviceId: string) {
    return this.createNotFound(PROVIDER_ERROR_CONFIGS.serviceNotLinked(serviceId));
  }

  static workLocationNotFound(locationId: string) {
    return this.createNotFound(PROVIDER_ERROR_CONFIGS.workLocationNotFound(locationId));
  }

  static verificationNotFound(providerId: string) {
    return this.createNotFound(PROVIDER_ERROR_CONFIGS.verificationNotFound(providerId));
  }

  static invalidVerificationStatus(status: string) {
    return this.createBusinessLogic(PROVIDER_ERROR_CONFIGS.invalidVerificationStatus(status));
  }
}
