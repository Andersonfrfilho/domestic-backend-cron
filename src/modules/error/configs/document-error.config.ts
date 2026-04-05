import { NotFoundErrorConfig, BusinessLogicErrorConfig } from './error-config.interface';

export const DOCUMENT_ERROR_CONFIGS = {
  notFound: (id?: string): NotFoundErrorConfig => ({
    message: 'Document not found',
    code: 'DOCUMENT_NOT_FOUND',
    details: { id },
  }),
  invalidStatusTransition: (current: string, target: string): BusinessLogicErrorConfig => ({
    message: `Cannot transition document from ${current} to ${target}`,
    code: 'DOCUMENT_INVALID_STATUS_TRANSITION',
    details: { current, target },
  }),
};
