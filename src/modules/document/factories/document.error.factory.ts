import { BaseErrorFactory } from '@modules/error/factories';
import { DOCUMENT_ERROR_CONFIGS } from '@modules/error/configs';

export class DocumentErrorFactory extends BaseErrorFactory {
  static notFound(id: string) {
    return this.createNotFound(DOCUMENT_ERROR_CONFIGS.notFound(id));
  }

  static invalidStatusTransition(current: string, target: string) {
    return this.createBusinessLogic(DOCUMENT_ERROR_CONFIGS.invalidStatusTransition(current, target));
  }
}
