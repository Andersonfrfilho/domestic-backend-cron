import { AuthErrorCode } from './auth.error-codes';
import { CacheErrorCode } from './cache.error-codes';
import { ConfigErrorCode } from './config.error-codes';
import { MethodNotImplementedErrorCode } from './method-not-implemented.error-codes';
import { RateLimitErrorCode } from './rate-limit.error-codes';
import { UserErrorCode } from './user.error-codes';

export {
  AuthErrorCode,
  CacheErrorCode,
  ConfigErrorCode,
  MethodNotImplementedErrorCode,
  RateLimitErrorCode,
  UserErrorCode,
};

export type ErrorCode =
  | UserErrorCode
  | AuthErrorCode
  | RateLimitErrorCode
  | ConfigErrorCode
  | MethodNotImplementedErrorCode
  | CacheErrorCode
  | string;
