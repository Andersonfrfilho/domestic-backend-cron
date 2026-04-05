import { NotFoundErrorConfig } from './error-config.interface';

export const SERVICE_ERROR_CONFIGS = {
  notFound: (id?: string): NotFoundErrorConfig => ({
    message: 'Service not found',
    code: 'SERVICE_NOT_FOUND',
    details: { id },
  }),
  categoryNotFound: (categoryId: string): NotFoundErrorConfig => ({
    message: 'Category not found for this service',
    code: 'SERVICE_CATEGORY_NOT_FOUND',
    details: { categoryId },
  }),
};
