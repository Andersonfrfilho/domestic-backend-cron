import { NotFoundErrorConfig, ConflictErrorConfig, BusinessLogicErrorConfig } from './error-config.interface';

export const REVIEW_ERROR_CONFIGS = {
  notFound: (id?: string): NotFoundErrorConfig => ({
    message: 'Review not found',
    code: 'REVIEW_NOT_FOUND',
    details: { id },
  }),
  alreadyExists: (serviceRequestId: string): ConflictErrorConfig => ({
    message: 'Review already exists for this service request',
    code: 'REVIEW_ALREADY_EXISTS',
    details: { serviceRequestId },
  }),
  serviceRequestNotCompleted: (serviceRequestId: string): BusinessLogicErrorConfig => ({
    message: 'Service request must be COMPLETED to create a review',
    code: 'REVIEW_SERVICE_REQUEST_NOT_COMPLETED',
    details: { serviceRequestId },
  }),
};
