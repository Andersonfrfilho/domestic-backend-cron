import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class PackageContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Note: requestId and projectLabel are handled separately by RequestContextMiddleware
    // and the logger configuration. They should NOT be in the TraceStack.
    // TraceStack contains only the function call hierarchy.
    next();
  }
}
