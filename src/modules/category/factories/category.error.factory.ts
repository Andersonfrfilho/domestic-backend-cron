import { BaseErrorFactory } from '@modules/error/factories';
import { CATEGORY_ERROR_CONFIGS } from '@modules/error/configs';

export class CategoryErrorFactory extends BaseErrorFactory {
  static notFound(id: string) {
    return this.createNotFound(CATEGORY_ERROR_CONFIGS.notFound(id));
  }

  static duplicateSlug(slug: string) {
    return this.createConflict(CATEGORY_ERROR_CONFIGS.duplicateSlug(slug));
  }
}
