import { NotFoundErrorConfig, ConflictErrorConfig } from './error-config.interface';

export const CATEGORY_ERROR_CONFIGS = {
  notFound: (id?: string): NotFoundErrorConfig => ({
    message: 'Category not found',
    code: 'CATEGORY_NOT_FOUND',
    details: { id },
  }),
  duplicateSlug: (slug: string): ConflictErrorConfig => ({
    message: 'Category slug already exists',
    code: 'CATEGORY_DUPLICATE_SLUG',
    details: { slug },
  }),
};
