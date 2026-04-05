import { NotFoundErrorConfig, BusinessLogicErrorConfig } from './error-config.interface';

export const SERVICE_REQUEST_ERROR_CONFIGS = {
  notFound: (id?: string): NotFoundErrorConfig => ({
    message: 'Service request not found',
    code: 'SERVICE_REQUEST_NOT_FOUND',
    details: { id },
  }),
  providerNotApproved: (providerId: string): BusinessLogicErrorConfig => ({
    message: 'Provider is not approved to receive service requests',
    code: 'SERVICE_REQUEST_PROVIDER_NOT_APPROVED',
    details: { providerId },
  }),
  invalidStatusTransition: (current: string, target: string): BusinessLogicErrorConfig => ({
    message: `Cannot transition service request from ${current} to ${target}`,
    code: 'SERVICE_REQUEST_INVALID_STATUS_TRANSITION',
    details: { current, target },
  }),
  notAuthorized: (): BusinessLogicErrorConfig => ({
    message: 'Not authorized to perform this action on the service request',
    code: 'SERVICE_REQUEST_NOT_AUTHORIZED',
    details: {},
  }),
};
