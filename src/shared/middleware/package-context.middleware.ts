import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { pushToTraceStack, popFromTraceStack } from '@adatechnology/logger';
import { getPackageInfo } from '../utils/package-info.service';

@Injectable()
export class PackageContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = (req as any).requestId;
    const { name, version } = getPackageInfo();
    const projectLabel = `${name}:${version}`;

    // Push requestId first (should already be set by RequestContextMiddleware)
    if (requestId) {
      pushToTraceStack(requestId);
    }

    // Then push project label
    pushToTraceStack(projectLabel);

    res.on('finish', () => {
      // Pop in reverse order (LIFO)
      popFromTraceStack(); // project label
      if (requestId) {
        popFromTraceStack(); // requestId
      }
    });

    next();
  }
}
