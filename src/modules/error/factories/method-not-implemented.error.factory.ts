import { BaseErrorFactory } from '@modules/error/factories/base.error.factory';
import { METHOD_NOT_IMPLEMENTED_ERROR_CONFIGS } from '@modules/error/configs';

export class MethodNotImplementedErrorFactory extends BaseErrorFactory {
  static methodNotImplemented(methodName?: string) {
    return this.createBusinessLogic(
      METHOD_NOT_IMPLEMENTED_ERROR_CONFIGS.methodNotImplemented(methodName),
    );
  }
}
