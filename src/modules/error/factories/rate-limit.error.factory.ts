import { BaseErrorFactory } from '@modules/error/factories/base.error.factory';
import { RATE_LIMIT_ERROR_CONFIGS } from '@modules/error/configs';

export class RateLimitErrorFactory extends BaseErrorFactory {
  static tooManyRequests(retryAfter: number) {
    return this.createRateLimit(RATE_LIMIT_ERROR_CONFIGS.tooManyRequests(retryAfter));
  }
}
